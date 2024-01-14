---
layout: post
title: "GC in Ruby: Part 2 (a), What is GC, Mark & Sweep, and how Ruby marks objects"
date: 2021-04-15T15:30:38+01:00
categories: garbage-collection ruby
---

## Introduction

_This is the second part in a series. If you need a refresher of how the Ruby memory model works you can read part 1 [here](https://www.eightbitraptor.com/2021/03/23/gc-in-ruby-part-1-an-overview-of-memory-layout/)_

I'm assuming that a huge proportion of the folks reading this post are programming with languages that implement automatic dynamic memory management. Ruby, Python, Go, JavaScript, Haskell, Swift, Lisp, Dart, and of course anything based on the .NET CLR or the JVM are all languages that manage memory automatically.

It's highly likely that, if you've never had to explicitly call `malloc` or a related API, then you're working in a language with automatic dynamic memory management[^1]

Memory management generally consists of two main concerns. How memory is claimed from the Operating System for the program to use, and how it is returned to the Operating System when it's no longer needed.

In languages with manual memory management, you'd typically ask for memory using one of the `malloc` functions and then give it back when when you're finished with it with `free` (except Rust, which takes a completely different approach to memory management).

In languages with automatic memory management the language runtime or compiler takes care of claiming memory using an allocator, and releasing this memory using a garbage collector.

In this post we're going to look at some basics of garbage collection. We'll talk about some of the terminology that's used in this subject area, and then we're going to look at the specifics of the Mark & Sweep algorithm, which is one of the simpler GC[^2] algorithms.

We'll then look at how Ruby implements the initial phase of Mark & Sweep: object marking[^3]. Because the GC story in Ruby has a lot of layers these days - Incremental marking and sweeping, a generational collector that partitions objects by age, and a memory compactor that runs in tandem with GC - we're occasionally going to see parts of the code that don't make sense yet. I'll go through a lot of these in future posts, and will always try and call out the stuff that isn't relevant to the current discussion.

I had intended to speak about both marking and sweeping in this post, but when I started writing I realised how much there is to cover, so I've chosen to cover sweeing in a separate post.

Most of the things I've learned about GC have come from 2 main places. The first is working on the Ruby source code and pairing with my supremely talented colleagues. The second is a book called [The Garbage Collection Handbook, The Art of Automatic Memory Management](https://gchandbook.org/), written by Richard Jones, Antony Hosking and Eliot Moss and published by CRC Press.

This book is fantastic and I recommend it whole-heartedly if GC implementations are something that you'd like to learn more about. And without further ado, let's jump in!

## Terminology

There are a few concepts that are used extensively throughout GC literature. Before we can start discussing algorithms we're going to need to know how to refer to these concepts.

### The heap

The heap is where all of our automatic memory management occurs. Objects are allocated out of the heap, live on the heap and the memory is made available on the heap again when they are garbage collected.

It can either be a single contiguous region of memory, or it can be a set of many contiguous regions of memory (often referred to as pages). Which approach is taken will be dependant on the implementation. We've already seen in our previous post that Ruby uses the second approach: It allocates from heap pages within the eden heap.

### Granules and Objects.

A **granule** is the smallest amount of memory we can allocate in our automatic system. 

An **object** is a contiguous region of 1 or more granules that is allocated for use by the application. Objects contain fields which may either contain data, or references to other objects in the system.

In Ruby, the smallest amount of memory we can allocate on the GC heap is the size of a slot, which is 40 bytes, as every slot contains a single `RVALUE`. This means that our granule is a 40 byte section of memory.

An object in our implementation, is represented by an `RVALUE`. This is the common type for all Ruby objects and consists of a header, along with a set of fields that may or may not refer to other objects.

In the current implementations of Ruby we can only allocate one `RVALUE` at a time. This means that an object is always exactly one granule, although this will hopfully change in the future as I'm working on introducing variable length objects to Ruby. I'll write more about this in a future post.

### The mutator and the collector

These are the two main parts of any garbage collected program. The **mutator** is the thread (or threads) that execute application code. This part of the system also contains the part of the memory management system that allocates objects, as well as mutate objects and their references.

The **collector** is the thread (or threads) that execute code related to garbage collection. That is, it follows all the object references in the system to discover objects that are no longer being used by the system and reclaims their storage space, so that the mutator can re-use that memory in order to create new objects.

All of the mutator and collector threads operate over the same heap.

### References and Fields

Objects can contain references to other objects. Consider the following Ruby code:

```ruby
class Foo
  def initialize(name)
    @name = name
  end
end

Foo.new("Matthew")
```

This code is going to heap allocate a few `RVALUE` objects; among them a `T_CLASS` representing the class `Foo`, a `T_OBJECT` for the instance of the class `Foo`, and a `T_STRING` that contains the string "Matthew". 

To keep our program consistent we need our programming language to keep track of some relationships between these things: like our `@name` instance variable, which is itself an `RVALUE`, and is being used by the `T_OBJECT` which is our instance of `Foo`.

Obviously it would be bad if the String object was garbage collected and it's memory reused while the Object referencing it was still live!

But this small example also allocates other objects, that our class references: Every `RVALUE` struct has a **field** named `class` that contains a pointer to its class object, which in turn has a class field pointing to its class, all the way back up to `BasicObject`. These are in addition to the specific references each type of object can hold.

As we can see, these relationship graphs build up quickly, even in trivial programs. It's these relationships that we mean when we talk about references.

A **reference** is a field of an object that contains a pointer to another object on the heap.

A pointer is a term meaning the memory address of another object. Ruby uses a type called `VALUE` to store it's object pointers, and they always point to the starting address of an `RVALUE` on the heap.

The GC Handbook defines this more formally:

```=
Pointers(N) = { a | a = &N[i]; ∀i: 0 ≤ i < |N| where N[i] is a pointer}
```

This is a statement, written in Set notation, that tells us how to define the set of references for an object. It says:

For an object `N`: The set of addresses that are the pointer fields of `N` are all the addresses to fields that are contained in the field list of `N` where the contents of the field is a pointer.

Or, more basically: references are the fields of an object that are pointers to other objects.

### Mutator Roots and the Root object set

**Mutator roots** are the pointers to objects in the heap that are directly accessible to the mutator threads, without having to traverse any intermediate objects. We call the set of ojects accessible via the mutator roots the **Root objects**.

These mutator roots are usually thread local storage, such as execution stacks, or global variables. These will all contain references to other objects.

It's not possible in a type safe language to find an unreachable object in the heap by traversing the graph starting at the mutator roots. Once all pointers to that object have been discarded, it's gone, and arithmetic pointer construction is prohibited.

### Liveness, correctness and reachability.

* A garbage collector is only **correct** if it never reclaims live objects.

* An object is **live** if it will be accessed at some time in the future execution of the mutator.

Unfortunately for us, liveness is an [undecidable problem](https://www.khanacademy.org/computing/ap-computer-science-principles/algorithms-101/solving-hard-problems/a/undecidable-problems). We can never accurately know for an arbitrary heap object whether or not the program will ever access it. 

This is where **reachability** comes in: We use an objects reachability as a way of determining an objects approximate liveness. An object `M` is reachable from object `N` only if object `M` can be discovered by following a chain of pointers from a field on object `N`.

So if an object is reachable from one of the mutator roots, then that the object may be accessed at some point during the programs life and is therefore considered to be a live object. If an object cannot be reached then it can never be accessed again and is dead.

This conservating approach to liveness is not perfect, but it is reasonable. We may find that we mark dead objects as live because they are reachable (even though we never access them again). But importantly the reverse cannot happen - we'll never mark live objects as dead, because we assume everything that _could_ be live _is_ live.

Garbage collection algorithms that use reachability as an indicator of liveness, like Mark & Sweep are known as tracing garbage collectors, and are the most common type of GC algorithm.

## Mark & Sweep Garbage collection

Now that we've introduced the subject of garbage collection, and we're familiar with some of the terms it's time to introduce our first algorithm: Mark & Sweep.

To make talking about this algorithm simpler we're going to make a few assumptions about the operation of the system:

* There may be more than one mutator thread, but there is only ever one collector thread
* All mutator threads are stopped while the collector thread runs. There is no modificiations to the heap being made during collection other than the ones that the collector is making.
* Collection appears to be atomic. That is, the mutator threads will never see an intermediate state of the collector, or an intermediate state of the heap.

These assumptions are convenient not only because they avoid us having to deal with any hard concurrency problems, but also because it's the way that GC in Ruby is implemented. So a definite win for us.

Mark & Sweep is an algorithm invented in 1960 by James McCarthy, originally for Lisp. It's a two phase algorithm. The first phase: Marking, involves traversing all reachable objects from the mutator roots, and recording somewhere that every object we come across is live. 

The second phase: Sweeping, involves walking the heap, examining the mark status for every object in the heap. Any object that is unmarked is dead, and it's space is reclaimed.

### Triggering Mark & Sweep GC

From the point of view of the collector, the mutator threads only do three jobs: `New`, `Read` and `Write`. These are the hooks into the program that the collector needs to reimplement in order to integrate itself with the program. `New` allocates a new heap object and returns an address to it, `Read` accesses an object field in memory and returns its value, and `Write` modifies an object in memory.

Mark & sweep doesn't rely on information stored in the objects themselves in order to collect garbage, it relies on object reachability, so there's no need for us to implement our own implementations for `Read` or `Write`.

Instead the Mark & Sweep collector interfaces with the mutators during object allocation. If a thread tries to allocate an object and there is no space left on the heap, then collection runs and the allocation is retried. If the allocation fails again, we are therefore out of memory and the program terminates.

In Ruby, this could look something like the following:

```ruby
def new_object
  ref = heap.allocate
  
  if ref.nil?
    collect
    
    ref = heap.allocate
    if ref.nil?
      fail "Out of Memory"
    end
  end

  ref
end

def collect
  with_mutator_lock do
    mark_from_roots
    sweep
  end
end
```

Looking at this code we can see that there are two main paths through the object allocation method. The first is nice and quick - we request an reference from the allocator, which immediately allocates us an object and returns it. The second is much less efficient - because the first allocation fails so now we have to stop the world and run GC before we can try again.

Ruby uses an algorithm similar to this internally, but there are some differences - arising mainly because the heap is divided up into separate pages. 

We can see the basic shape of Ruby's implementation of this `New` GC hook in action by looking at the function `newobj_of0` in `gc.c`:

```c
static inline VALUE
newobj_of0(VALUE klass, VALUE flags, int wb_protected, rb_ractor_t *cr)
{
    if (obj = ractor_cached_freeobj(objspace, cr)) != Qfalse) {
        newobj_init(klass, flags, wb_protected, objspace, obj);
    }
    else {
        obj = wb_protected ?
          newobj_slowpath_wb_protected(klass, flags, objspace, cr) :
          newobj_slowpath_wb_unprotected(klass, flags, objspace, cr);
    }

    return obj;
}
```

I've removed some parts of the function in order to better expose the basic algorithm, which we can see is almost the same as the `new_object` method in my psuedo Ruby example above.

The test expression for the conditional combines the allocate call with the check to see whether the allocation was successfull, and if it was, we can then assign data into the slot using `newobj_init`.

The call to `ractor_cached_freeobj` is the equivalent to our call to `allocate`. Ruby's Ractors[^4] cache a heap page, and reserve it for exclusive use by that Ractor in order to avoid data races and other concurrency related issues. But essentially this function is pulling a slot from the freelist of a heap page and returning it's address (as a `VALUE` pointer).

_Note that, even when we're not explicitly using Ractors in our code behind the scenes, there is always one ractor - which Ruby refers to as the main Ractor. You can dig deeper into this by looking at the macro `GET_RACTOR` and the ractor struct `ruby_single_main_ractor`)._

If the object was not allocated successfully (ie. the call to `ractor_cached_freeobj` returns `Qfalse`), then we follow the slowpath.

We'll discuss what it means for an object to be write-barrier protected or unprotected in a later post about Generational GC, but for this discussion they're not relevent. Both of these funtions eventually lead us to `newobj_slowpath` which is where the second path of our `New` job is implemented:

```c
while ((obj = ractor_cached_freeobj(objspace, cr)) == Qfalse) {
    ractor_cache_slots(objspace, cr);
}
GC_ASSERT(obj != 0);
newobj_init(klass, flags, wb_protected, objspace, obj);
```

 There's a bit of indirection here - We're going to need to follow the rabbit hole a little deeper before we find out whether we actually need to run GC.

 In our first variation from our naive `New` implementation we actually attempt the allocation again multiple times instead of just once, by calling `ractor_cached_freeobj` and `ractor_cache_slots` in a loop until we get a free slot back successfully. 
 
 The job of `ractor_cache_slots` is to find the next page in the heap that has free slots and cache it onto the ractor.

 ```c
 static inline void
ractor_cache_slots(rb_objspace_t *objspace, rb_ractor_t *cr)
{
    ASSERT_vm_locking();
    GC_ASSERT(cr->newobj_cache.freelist == NULL);

    struct heap_page *page = heap_next_freepage(objspace, heap_eden);

    cr->newobj_cache.using_page = page;
    cr->newobj_cache.freelist = page->freelist;
    page->free_slots = 0;
    page->freelist = NULL;
}
```

The actual caching isn't that interesting, it's just modifying some pointers in a linked list, but `heap_next_freepage` looks important. This function returns the next page on the heap that contains free slots, and when there are no free pages left - then we start GC to reclaim space. We can see the actual call to `gc_start` here, buried inside the test expression for the last conditional in `heap_prepare` in `gc.c`

```c
heap_prepare(rb_objspace_t *objspace, rb_heap_t *heap)
{
    GC_ASSERT(heap->free_pages == NULL);

    // spoiler alert
    if (is_lazy_sweeping(heap)) {
	    gc_sweep_continue(objspace, heap);
    }
    else if (is_incremental_marking(objspace)) {
    	gc_marks_continue(objspace, heap);
    }

    if (heap->free_pages == NULL &&
        (will_be_incremental_marking(objspace) || heap_increment(objspace, heap) == FALSE) &&
        gc_start(objspace, GPR_FLAG_NEWOBJ) == FALSE) {
        rb_memerror();
    }
}
```

_Side rant: There's a pattern here I see a lot in the MRI codebase and I don't like it. the actual important work is being done in a really long and complext test expression of an if statement, and the body of the conditional just raises an error. I feels like it's obfuscating the most important part of the function, which is that we should start GC when there are no free pages. C developers: [tell me why I'm wrong!](https://twitter.com/eightbitraptor)_

Now that we've found the actual call to `gc_start` we can step back through our algorithm and try and write it out in psuedo-Ruby, to compare with our generic Mark & Sweep `New` implementation to see what changes Ruby is making to compensate for the division of the heap into pages.

```ruby
def new_object
  ref = current_page.allocate

  if ref.nil?
    until ref = current_page.allocate
      if free_pages.empty?
        collect

        if free_pages.empty?
          fail "Out of Memory"
        end
      end
      current_page = free_pages.next
    end
  end

  ref
end
```

We can still see the differentiation between the fast path and the slow path but there are definitely a few more steps in there. I've also completely ignored what happens when the collector runs but cannot free up enough memory (it definitly does not just fail the first time we run out of free pages). But I want to focus on garbage collection rather than allocation. So for now we'll skip over that and move onto the first phase of the Mark & Sweep algorithm:

## The Mark step

We said earlier that the mark phase was the process by which we walk the graph of reachable objects, starting at the mutator roots, and set some flag somewhere for every live object we come across.

The actual marking algorithm isn't too complex. First we find the root objects, mark them and add them to a worklist. Then, until the worklist is empty, we pop an object off and traverse it's set of pointers, marking and adding the object at the end of each reference to the worklist. 

Because this worklist is used like a stack (ie. last in, first out) of marked objects, it's often referred to as the mark stack.

An example of this would look like:

```ruby
def mark_roots
  @worklist = []

  roots.each do |root|
    mark_object(root)
    @worklist << root
  end
end

def process_mark_stack
  until @worklist.empty do
    object = @worklist.pop

    object.pointers.each do |pointer|
      child = dereference(pointer)

      if child&.marked?
        mark_object(child)
        @worklist << child
      end
    end
  end
end

mark_roots
process_mark_stack
```

### the tricolour abstraction

Because it's useful to be able to refer to the different states an object can be in during the collection phase we can identify these states and give them names. The tricolour abstraction comes from a paper by Djikstra et al from 1976 and proposes:

* Objects that are possibly dead are white. Initially this is every object, these objects are not marked, not on the worklist and are not currently being processed.
* When a white node is encountered during the marking phase it is coloured grey, this means the object is on the worklist or currently being processed.
* When a grey node has been fully processed and it's children identified then it is coloured black. Black objects are marked and are no longer being processed or on the worklist.

Of course, we don't _actually_ colour our objects, but this abstraction gives us some new ways of thinking about how we traverse the heap. 

Marking looks like a wave of grey objects moving through the heap, with all white objects ahead of the wave and all black objects behind. Eventually when marking has finished, there will be no grey objects left, all reachable objects will be black.

One property of this algorithm that is always true is that there are never any references from black to white objects, and therefore, any white object left at the end of the mark step is unreachable and can be collected.

### Marking in Ruby

The mark step in Ruby gets started from a function called `gc_marks` which is called at the end of `gc_start`. `gc_start` actually does a load of work before it starts the mark step, in order to set up the conditions necessary for the GC to run, and to determine what kind of GC is running, but none of this is relevant to the discussion of simple Mark & Sweep.

For now the only interesting work that `gc_start` does is to call `gc_enter` which stops all other Ractors and mutator threads and claims a VM lock, so that nothing can happen while the collector is running. This is the stop-the-world part of the process. It does this before calling `gc_marks`

`gc_marks` splits the mark phase into two. `gc_marks_start` and `gc_marks_rest`. This split is an artifact of incremental marking which we'll talk about in a future post, but for now all we need to know is that `gc_marks_start` is where the roots are marked and added to the mark stack and `gc_marks_rest` is what processes the mark list, popping objects off and marking their children.

#### Marking the roots

```c
static void
gc_mark_roots(rb_objspace_t *objspace, const char **categoryp)
{
    struct gc_list *list;
    rb_execution_context_t *ec = GET_EC();
    rb_vm_t *vm = rb_ec_vm_ptr(ec);
    objspace->rgengc.parent_object = Qfalse;

    rb_vm_mark(vm);
    if (vm->self) 
        gc_mark(objspace, vm->self);

    mark_finalizer_tbl(objspace, finalizer_table);
    mark_current_machine_context(objspace, ec);

    for (list = global_list; list; list = list->next) {
        gc_mark_maybe(objspace, *list->varptr);
    }

    rb_mark_end_proc();
    rb_gc_mark_global_tbl();
    rb_gc_mark(objspace->next_object_id);
    mark_tbl_no_pin(objspace, objspace->obj_to_id_tbl);

    if (stress_to_class)
        rb_gc_mark(stress_to_class);
}
```

Above is an abridged version of the `gc_mark_roots` function. I've removed all the debug and logging related code, to expose the actual marking code more clearly. From this we can identify exactly what Ruby considers Root objects.

We can see that the root object set contains the Ruby virtual machine itself, as well as any reference directly attached to the VM, this includes all the individual Ractors, the Ruby load path, as well as all the global call cache tables and their contents.

The global variable table itself, and the list of globals are also considered roots, as well as the finalizer table (finalizers are blocks of code, attached to an object, that are run when that object is garbage collected), and the current VM context object.

There are a bunch of interesting functions here: `gc_mark`, `gc_mark_maybe`, `mark_tbl_no_pin` that all deal with actually marking various types of objects, in various states. All of them, when you follow the path down, eventually lead to `gc_mark_ptr` which is where the core marking logic really starts.

```c
static void
gc_mark_ptr(rb_objspace_t *objspace, VALUE obj)
{
    if (LIKELY(during_gc)) {
	    rgengc_check_relation(objspace, obj);
	    if (!gc_mark_set(objspace, obj)) return; /* already marked */

      if (UNLIKELY(RB_TYPE_P(obj, T_NONE))) {
          rp(obj);
          rb_bug("try to mark T_NONE object"); /* check here will help debugging */
      }
	    gc_aging(objspace, obj);
	    gc_grey(objspace, obj);
    }
    else {
        reachable_objects_from_callback(obj);
    }
}
```

We'll talk more about checking relations and `gc_aging` in a later post when we talk about the generational garbage collector.

There are 2 interesting parts to this function. the first is the slightly misleading line here:

```c
if (!gc_mark_set(objspace, obj)) return /* already marked */
```

See my earlier side note about burying side effect laden code inside conditional tests - This line is what actually does the marking. 

```c
static inline int
gc_mark_set(rb_objspace_t *objspace, VALUE obj)
{
    ASSERT_vm_locking();
    if (RVALUE_MARKED(obj)) return 0;
    MARK_IN_BITMAP(GET_HEAP_MARK_BITS(obj), obj);
    return 1;
}
```

Here we can see we first make sure that the VM is locked, ie. we've stopped the world so that nothing happens to our heap while we're collecting. Then if the object is already marked we return false, otherwise we actually mark the object and return true.

Objects are marked not by setting a flag on the object itself, but by marking them in a seperate table. In Ruby's case, each heap page has a data structure called the `mark_bits` that is an array of bits, with each bit corresponding to a slot in the heap.

The slot is marked if its mark bit is `1` and not if its mark bit is `0`. In the GC Handbook, this is known as bitmap marking. It has a few benefits: It doesn't mutate objects in the heap during GC. It also allows the marking information to be stored densely. This can have speed gains when sweeping as we can keep more marking information in a single CPU cache line.

Moving back to `gc_mark_ptr`, once we get past the sanity checking code we can see the call to `gc_grey`! This is the part of the process where we start to recognise terminology from what we know so far about mark & sweep!

```c
gc_grey(rb_objspace_t *objspace, VALUE obj)
{
#if RGENGC_CHECK_MODE
    if (RVALUE_MARKED(obj) == FALSE) rb_bug("gc_grey: %s is not marked.", obj_info(obj));
    if (RVALUE_MARKING(obj) == TRUE) rb_bug("gc_grey: %s is marking/remembered.", obj_info(obj));
#endif

#if GC_ENABLE_INCREMENTAL_MARK
    if (is_incremental_marking(objspace)) {
	    MARK_IN_BITMAP(GET_HEAP_MARKING_BITS(obj), obj);
    }
#endif

    push_mark_stack(&objspace->mark_stack, obj);
}
```

The first thing we see here (aside from the sanity check logic) is that we're marking in a bitmap, but only if incremental marking is enabled. 

This looks relevant to us, but is actually a red herring! We've already marked our object in the `mark_bits` in the previous step - these `marking_bits` are used for something else. 

In this case it's to keep track of the marking status between marking steps when incremental marking is enabled, just in case we need to invalidate the mark stack at any point. This can be required if functions written inside C extensions (and therefore outside of the control of the VM) decide to forcefully free their own objects.

The last thing this function does is push our marked object onto the mark stack. Just like our pseudo-code implementation of Mark & Sweep earlier on in the post.

Hooray! Now that we've got a mark stack that is populated with our marked root objects, let's investigate how we mark the rest of the heap.

### Marking the rest of the heap

We said earlier that the mark phase was shared between two functions. Here's the second: `gc_marks_rest`:

```c
static void
gc_marks_rest(rb_objspace_t *objspace)
{
    gc_report(1, objspace, "gc_marks_rest\n");

#if GC_ENABLE_INCREMENTAL_MARK
    heap_eden->pooled_pages = NULL;
#endif

    if (is_incremental_marking(objspace)) {
	    do {
	        while (gc_mark_stacked_objects_incremental(objspace, INT_MAX) == FALSE);
	    } while (gc_marks_finish(objspace) == FALSE);
    }
    else {
	    gc_mark_stacked_objects_all(objspace);
	    gc_marks_finish(objspace);
    }

    /* move to sweep */
    gc_sweep(objspace);
}
```

Ignoring the code paths that relate to incremental marking until another post. This code calls `gc_mark_stacked_objects_all`, and then the slightly ambiguously named `gc_marks_finish`, and finally moves us on to the sweeping stage with `gc_sweep`. 

Let's take a look at how the stacked objects are marked because this is where the core of our algorithm that walks the reachable objects lives.

`gc_mark_stacked_objects_all` eventually leads us to `gc_mark_stacked_objects` and specifically, these lines of code:

```c
    while (pop_mark_stack(mstack, &obj)) {
        gc_mark_children(objspace, obj);
    }
```

Hopefully it's clear that this function pops an object (`obj`) off the mark stack (`mstack`), calls `gc_mark_children` on the object and then repeats until the mark stack is empty. Just like our psuedo-implementation earlier in this article! The function `gc_mark_children` is massive so we're going to walk through the important parts, rather than look at the whole function at once.

```c
static void
gc_mark_children(rb_objspace_t *objspace, VALUE obj)
{
    register RVALUE *any = RANY(obj);
    gc_mark_set_parent(objspace, obj);
    gc_mark(objspace, any->as.basic.klass);
```

I've cut out some special case code for unexpected objects and Ruby internals here, but this is the bulk of the work of this part of the function. We flag that the object we're looking at is our parent object, and then make sure it's marked.

```c
    switch (BUILTIN_TYPE(obj)) {
```

The rest of this function is the body of this switch statement. We have different marking behaviour depending on what the type of the `RVALUE` in the slot is, because each object type is arranged differently in memory and has differing fields and references to other data in the heap. Taking a Ruby Array as an example (represented by the type `T_ARRAY`):

```c
case T_ARRAY:
    if (FL_TEST(obj, ELTS_SHARED)) {
        VALUE root = any->as.array.as.heap.aux.shared_root;
        gc_mark(objspace, root);
	  }
	  else {
        long i, len = RARRAY_LEN(obj);
        const VALUE *ptr = RARRAY_CONST_PTR_TRANSIENT(obj);
        for (i=0; i < len; i++) {
          gc_mark(objspace, ptr[i]);
	    }

        if (LIKELY(during_gc)) {
            if (!FL_TEST_RAW(obj, RARRAY_EMBED_FLAG) &&
                    RARRAY_TRANSIENT_P(obj)) {
                    rb_transient_heap_mark(obj, ptr);
                }
            }
        }
	break;
```

Notice how this code uses `RARRAY_CONST_PTR_TRANSIENT` to get a pointer to the actual C array that backs the Ruby array (storing it in `ptr`), and then uses a for loop to iterate over each `RVALUE` contained in the array and marking it with `gc_mark`. We know from our previous investigations that calling `gc_mark` will result in this object being marked and added itself to the mark stack.

Zooming out a little we see that this conforms to the shape of our initial mark and sweep pseudo-ruby algorithm - we're iterating over the mark stack, and for each marked object adding their direct children back to the mark stack, which will themselves be popped off the stack and their children marked. This repeats until the stack is empty, meaning that we've reached everything that is reachable.

The next function we identified, `gc_marks_finish` is primarily concerned with accounting information and is mostly not relevant to our discussion of generic Mark & Sweep - it does do some cleanup of the heap and some reporting - but all the major work is now done. 🎉

With that we can move on to sweeping. Which we're going to discuss in another post. This post ended up being way longer than I expected going into it so thank you so much for reading and congratulations on making it this far! I had a good time writing this and putting together all the material and I hope that this was a useful insight into how a real world programming language starts to implement its own automatic dynamic memory management system!

Look forward to part 2b soon™ where we'll move on to sweeping (and maybe an intro to Generational GC if I get that far).


[^1]: note that this is different to the term 'dynamic languages', which are languages in which operations that would traditionally be done at compile time, are done at run-time, examples of this are type checking and meta-programming. Dynamic is a pretty overused word when talking about programming languages tbh.

[^2]: The abbreviation can mean both "garbage collector" and "garbage collection". Hopefully this is obvious given the context.

[^3]: Code in this article is correct as of commit `df7efdcb6b7fd4286fe7d1fe853fb679aa6a5120` on the Ruby master branch.

[^4]: Ractors are an actor like concurrency framework introduced in Ruby 3.0
