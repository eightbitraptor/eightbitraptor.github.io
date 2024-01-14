---
layout: post
title: "GC in Ruby: Part 1, An overview of memory layout"
date: 2021-03-23T22:04:13Z
categories: garbage-collection ruby
---
## Introduction (and raison d'être)

_Part 2 (a) of this post is now live [here](https://www.eightbitraptor.com/2021/04/15/gc-in-ruby-part-2-a-what-is-gc-mark-sweep-and-how-ruby-marks-objects/), where we move on to discussing our first GC algorithm_

My working life is currently spent working on the internals of Matz's Ruby Interpreter([MRI](https://www.ruby-lang.org/en/about/)) as part of the Ruby Infrastructure team at Shopify. 

I am pretty new to this kind of work. I've been a Ruby developer for a long time, but when I moved to this team in June 2020 I had no professional experience writing C, and had never seen the inside of a programming language interpreter before. So a lot of concepts were (and still are) very new to me.

I've been learning a lot, through my work and through self-directed study. One of the tools that has always helped me learn about something is to write about it. I originally wrote this post in the beginning of December 2020, to help cement what I'd learned about Ruby's memory architecture in my head.

[Many](https://tenderlovemaking.com/2017/09/27/visualizing-your-ruby-heap.html) [smarter](https://blog.peterzhu.ca/notes-on-ruby-gc/) [people](https://jemma.dev/blog/gc-mark-and-sweep) [than](https://ruby-hacking-guide.github.io/gc.html) [me](https://www.atdot.net/~ko1/activities/rgengc_ismm.pdf) have written a lot about memory layout and GC in Ruby, so this post probably won't add a lot to the discussion, which is why I've held off from posting it for so long.

That being said, I decided to publish this here anyway. There's always a slim possibility it's entertaining/useful to someone, and if nothing else, it'll be a good backup so I can find it again in the future.

According to the notes that went along with this post there's a section about all the posts I apparently intended to write:

1. The Heap structure, memory management, requirements (ie. this post)
2. Garbage Collection, Mark and sweep and how it's implemented. How it's triggered, tricolour abstraction
3. RGENGC, The Generational garbage collector, old and new objects and the transient heap. Major and minor collections.
4. RINCGC, The incremental garbage collector, incremental marking, incremental sweeping
5. Compaction, auto-compaction
6. Variable width allocation ([my current work project](https://bugs.ruby-lang.org/issues/17570)) and its implications.

So far I have only done `1`. So I'll just leave this here and lets let history be the judge of how far I got.

## Synopsis

Garbage Collection in Ruby[^1] is an interesting and varied picture these days. This series of posts will attempt to explain the various different collectors that are in operation inside Ruby and how they work.

The code snippets included in this post are all correct as of [this commit on Ruby's master branch](https://github.com/ruby/ruby/commit/f4386413f16f9e492a74f6b65e981e20e22c4849)

Before we can start talking about garbage collection, we need to understand how Ruby organises memory. How objects are created and allocated and what happens during the lifecycle of a Ruby process.

## RValues, Objects, and how we identify them.

The first thing that we need to know is that all Ruby objects are the same size. They are stored as C structs that are 40 bytes wide called `RVALUE`s. There are shenanigans that happen when an objects data cannot actually fit inside of 40 bytes (consider a long string for example), but, for the purposes of garbage collection we just need to remember that every Ruby object corresponds to exactly one `RVALUE`.

Here is the basic structure of an `RVALUE`. Some parts that aren't relevant to this topic have been elided for readability.

```c=
typedef struct RVALUE {
    union {
	struct {
	    VALUE flags;		/* always 0 for freed obj */
	    struct RVALUE *next;
	} free;
        struct RMoved  moved;
	struct RBasic  basic;
	struct RObject object;
	struct RClass  klass;
	struct RFloat  flonum;
	struct RString string;
	struct RArray  array;
	struct RRegexp regexp;
	struct RHash   hash;
	struct RData   data;
	struct RTypedData   typeddata;
	struct RStruct rstruct;
	struct RBignum bignum;
	struct RFile   file;
	struct RMatch  match;
	struct RRational rational;
	struct RComplex complex;
        /* .... */
    } as;
} RVALUE;
```

An `RVALUE` contains a union of every possible Ruby type (such as `RString`, `RClass`, `RHash` etc), as well as some internal types under the member name `as`. This means that we need to know what type the `RVALUE` is before we can safely operate on it.

Developers familiar with using unions in C will recognise a consequence of this arrangement, which is that without some kind of type information it's possible for us to treat one member of a union as a different member.

This can get us into trouble, as the memory layout wouldn't necessarily map to the member fields of the other struct.

For example: Assume we have an `RVALUE` pointer called `rval` that represents a String (`RString` in Ruby parlance). The correct way to access the data for that string is

```c=
RString str;
str = rval->as.string;
```

But, there's nothing stopping us from accessing it as something else. We could equally assume that `rval` is a `Regexp`

```c=
RRegexp regex;
regex = rval->as.regexp;
```

And in this case, because `struct RString` and `struct RRegexp` have different layouts, the information is going to be garbled. In the best case our code will error, and in the worst case we'll be able to use the `struct` in ways that look sensible but are wrong - causing hard to detect problems later on in our code.

Ruby does provide type tagging to mitigate this in a struct called `RBasic` that is always defined consistently at the start of every type struct included in the `as` union.

`RBasic` is defined as follows:

```c=
struct RBasic {
    VALUE flags;                /**< @see enum ::ruby_fl_type. */
    const VALUE klass;
};
```

And we can see how it's used by looking at `RString` and `RArray` as examples. 

```c=
// rstring.h
struct RString {
    struct RBasic basic;
    /* .... content snipped .... */
}

//rarray.h
struct RArray {
    struct RBasic basic;
    /* .... content snipped .... */
}

/* and so on for all other Ruby types */
```

Because `basic` is always the first member of the struct, it is therefore in the same memory location relative to the start of every `RVALUE`. This means that it's always possible to get hold of the `flags` and `klass` in a consistent way no matter the `RVALUE` type:

```c=
VALUE flags = rval->as.basic.flags;
VALUE my_klass = rval->as.basic.klass;
```

The `RBasic` struct is relatively compact, taking up just 16 bytes (`VALUE` is a type alias for an `unsigned long`, which is 8 bytes on a 64 bit architecture). 

The `flags` member is treated as an array of bits, and stores a lot of information about the state of an object, whether it's frozen, whether it's a singleton and much more, including some user-definable bits that can be used when implementing new Ruby types - but importantly for us, the 5 least significant bits are used to store a builtin type code.

The `klass` member is also a `VALUE` but in this case it's being used as a pointer (more on this later), to an `RValue` object of type `RClass`, this loosely corresponds to the Ruby class of the object being represented.

So now we have a consistent way of finding out which builtin type an `RVALUE` is, as well as it's Ruby class.

Ruby provides pre-processor macros to make working with this information easier and less error-prone than accessing the flags manually every time, and these macros make working with `RVALUE`s easier.

The first is `BUILTIN_TYPE`. This takes a pointer to an `RValue` as its argument, dereferences it, applies a mask to the `flags` to focus just on the type bits, and then compares that to a known list of types. A good example can be seen in the `obj_free` function inside `gc.c`. This function reclaims memory for objects that are no longer needed, and the way in which memory is reclaimed will depend on how the object in question stores references to its external data.

```c=
switch (BUILTIN_TYPE(obj)) {
    case T_OBJECT:
        /* .... some stuff .... */
        break;
    case T_MODULE:
    case T_CLASS:
        /* .... some stuff .... */
        break;
    case T_STRING:
        /* .... some stuff .... */
        break;
    case T_ARRAY:
        /* .... some stuff .... */
        break;
    case T_HASH:
        /* .... some stuff .... */
        break;
    /* ... and so on for all other builtin types .... */
```

Another is `RB_TYPE_P`, which is a predicate allowing you to check an `RVALUE` against a specific type. You can see this being used in `string.c`: `rb_str_eql` is the underlying function that runs when you call `String#eql?` in your Ruby code. 

```c=
VALUE
rb_str_eql(VALUE str1, VALUE str2)
{
    if (str1 == str2) return Qtrue;
    if (!RB_TYPE_P(str2, T_STRING)) return Qfalse;
    return rb_str_eql_internal(str1, str2);
}
```

From this code we can see that we first check whether the argument and the receiver are the exact same string, if they're not then we check whether the argument is even a `String` using `RB_TYPE_P`; if it's not then we know that it can never be equal to the receiver, so we fail fast (returning False in this case).

Macros are also provided for casting `RVALUE` pointers to known types, such as `RSTRING`, `RARRAY` etc. As well as the macro `RANY` which signifies that we don't care what type the `RVALUE` is, we just want to access struct members that are common to all.

We'll use these a lot later on, but for now lets talk about Ruby organises the `RVALUE` structs.

## How objects are organised

We now know that every Ruby object is represented internally as an instance of a C struct called an `RVALUE` and that we have easy ways of identifying from an `RVALUE` what object is being represented. So now we need to look at how these `RVALUE` objects are organised in memory.

The abriged version is that Ruby stores `RVALUE` objects in a structure called a heap, and that the heap is divided into pages. We're going to look into this in a bit more detail and explore some of the implications of that and what that structure allows us to do.

One thing to note is that when we're referring to heaps and heap pages the terminology changes slightly. We refer to heap pages as having "slots", where each slot contains one `RVALUE`. An empty slot can be accessed in the same way as any other slot containing an `RVALUE`. The difference is that empty `RVALUE`'s will have a `BUILTIN_TYPE` of `T_NONE`.

### Heap pages

The first unit of organisation that we'll consider is the `struct heap_page`. A heap page is a container for a series of slots that are contiguous in memory. It contains accounting information about the number of slots in a page and how many are free, a reference to the starting slot in memory, some bitmasks that are used during the garbage collection process to tell whether an object is marked or pinned (more on this later).

Heap pages are exactly 16Kb in size, so they can be aligned to multiples of the operating system page size, in order to use memory as efficiently as we can. Most OS pages are 4Kb, so each 16Kb Ruby heap page maps to 4 OS pages.

Because each page is a fixed size, it can only contain a limited number of slots, this is calculated by subtracting some space for header information and dividing the size of the rest of the page by the size of an `RVALUE`, which it does in the following way.

```c=
HEAP_PAGE_OBJ_LIMIT = (unsigned int)(
  (HEAP_PAGE_SIZE - sizeof(struct heap_page_header))/sizeof(struct RVALUE)
)
```

This gives us a limit of 409 slots per page. 

An interesting quirk of this is that due to memory alignment constraints, a heap page may not necessarily contain 409 slots, sometimes it'll contain 408.

This happens because during the ruby page/os page allocation we may find ourselves with a starting address that doesn't evenly divide by the size of an `RVALUE`. In this case Ruby juggles the `page->start` pointer up a few bits so that its aligned. This causes the 409th slot to not fit on the page anymore so Ruby removes it. The code that does that is in `heap_page_allocate` in `gc.c` and it looks like this:

```c=
/* assign heap_page body (contains heap_page_header and RVALUEs) */
page_body = (struct heap_page_body *)rb_aligned_malloc(HEAP_PAGE_ALIGN, HEAP_PAGE_SIZE);

/* assign heap_page entry */
page = calloc1(sizeof(struct heap_page));

/* adjust obj_limit (object number available in this page) */
start = (RVALUE*)((VALUE)page_body + sizeof(struct heap_page_header));
if ((VALUE)start % sizeof(RVALUE) != 0) {
    int delta = (int)(sizeof(RVALUE) - ((VALUE)start % sizeof(RVALUE)));
    start = (RVALUE*)((VALUE)start + delta);
    limit = (HEAP_PAGE_SIZE - (int)((VALUE)start - (VALUE)page_body))/(int)sizeof(RVALUE);
}
end = start + limit;

```

In addition to the information above, each page also contains a pointer to the start of the freelist. The freelist is an important concept in Ruby memory management, it is a singly linked list of all the `T_NONE` slots within a page where all new `RVALUE`s get allocated.

### The freelist

_**NOTE:** Some of this code has changed between the commit I was looking at when I wrote this and the latest trunk. Ractors, an actor-like concurrency framework was introduced in Ruby 3.0.0 - released Dec 25th 2020. This has resulted in heap pages and their freelists being cached in the context of a Ractor now. Without this exclusivity, having multiple Ractors allocate in a single freelist would have been a concurrency nightmare. I'll try and remember to write up something about the differences in a later post, I promise_

Earlier we mentioned that an empty slot is just an `RVALUE` of type `T_NONE`. Let's look a little closer at the implementation of the `RVALUE` struct, particularly the first entry in the `as` union:

```c=
typedef struct RVALUE {
    union {
        struct {
            VALUE flags;		/* always 0 for freed obj */
            struct RVALUE *next;
        } free;
        /* other types cut for brevity */
    } as
}
```

The inline `struct free` is what allows us to build the freelist. 

Remember when we said that there was nothing stopping us from treating one member of a union like any other? Well this is where that behaviour is useful:

When we free an object from a slot we can use a helper `RFREE` to treat our `RVALUE` as a `struct free`. This allows us to set the `flags` to `0` and the `next` pointer to the address of the next free slot in the page. The next time we need a slot in which to allocate an `RVALUE` we can just pop off the head of the freelist and write whatever we want into it.

This means that finding space to assign our object is a constant time operation, and is always fast. Without this linked list, we'd have to scan the whole heap page looking for a slot, which is a linear time operation: the time it takes would depend on where in the page the next free slot is. 

We can see this freelist manipulation happening in the functions `heap_page_add_freeobj` and `heap_get_freeobj` respectively.

Removing some verification and memory protection code from these functions to highlight just the important parts for this discussion leaves us with:

### heap_get_freeobj

```c=
static inline VALUE
heap_get_freeobj(rb_objspace_t *objspace, rb_heap_t *heap)
{
    RVALUE *p = heap->freelist;

    while (1) {
	    if (p != NULL) {
	        heap->freelist = p->as.free.next;
	        return (VALUE)p;
	    } else {
	        p = heap_get_freeobj_from_next_freepage(objspace, heap);
	    }
    }
}
```

This function is called during the new object allocation code path, we can see it grabs an `RVALUE` from the freelist, and returns it. Astute readers will notice that this function pulls an `RVALUE` from the freelist defined on the heap, rather than a heap page. The heap as a whole maintains a pointer to the freelist on the first heap page as well as a list of all the pages that have free slots, allowing us to walk the entire freelist for a heap easily.

The other thing this code does once it's pulled a free slot from the freelist is to update the heap's freelist pointer to the next free slot.

It does this by checking whether the free slot we're using has a next pointer defined, if so we can use that directly. 

If there is not next pointer defined then we may be at the end of the heap so we need to do some more work - `heap_get_freeobj_from_next_freepage` hides some complexity about what we do if there isn't any free space left, but hopefully the function name makes the intent obvious.

#### heap_page_add_freeobj

```c=
static inline void
heap_page_add_freeobj(rb_objspace_t *objspace, struct heap_page *page, VALUE obj)
{
    RVALUE *p = (RVALUE *)obj;

    p->as.free.flags = 0;
    p->as.free.next = page->freelist;
    page->freelist = p;
}
```

This operation is much simpler. When we want to remove an `RVALUE` and add the slot back to the freelist, we have to blank out the `flags`, which makes Ruby treat this as a `T_NONE` rather than whatever type it was before, and then we add it to the front of the freelist by setting its `next` pointer to the current freelist head and setting the freelist head to this slot.

Looking at these two operations we can see that whilst the freelist is implemented as a linked list, we're actually using it like a stack. We pop slots off the list to fill with data and then when we're done with the slot we add it back to the front of the list.

#### A quirk of the freelist: it's all backwards

When heap pages are built, first all the memory required is allocated and the slots are defined. Then the freelist is built:

```c=
for (p = start; p != end; p++) {
	gc_report(3, objspace, "assign_heap_page: %p is added to freelist\n", (void *)p);
	heap_page_add_freeobj(objspace, page, (VALUE)p);
}

```

Looking at that loop it might not be immediately obvious, but we're walking up the page, from start to end and calling `heap_page_add_freeobj`; which we know adds the slot to the _front_ of the freelist.

This means that the first slot on the freelist is actually the last slot, contiguously, on the page. Walking _up_ the freelist, by traversing `next` pointers, is actually walking down the page, by memory address.

This doesn't really have much impact on the general functioning of the freelist, but it can cause some headaches if (like me), your work is very dependant on contiguous regions of memory.

### The Heap; Eden and Tomb

The second organisational unit that we're going to look at is the `struct rb_heap_struct`, which is more commonly referred to by its `typedef`: `rb_heap_t`.

Ruby maintains two heaps, the Eden heap and the Tomb heap, strucuturally they are both identical, but they are used in different ways.

Each heap contains a list of pages that contain free slots, called `free_pages` and a pointer to the page that is currently being allocated into, called `using_page`, as well as an iterator of all pages that is used during the sweeping phase of garbage collection.

Both Eden and Tomb heaps are initialised at the start of the Ruby interpreter bootup, using default parameters that can be overridden by the user.

The code for that lives inside `gc.c` as part of the `Init_heap` function

```c=
void
Init_heap(void)
{
    rb_objspace_t *objspace = &rb_objspace;

    /* ... snipped code that is irrelevant to us at this time ... */

    heap_add_pages(objspace, heap_eden, gc_params.heap_init_slots / HEAP_PAGE_OBJ_LIMIT);

    /* ... snipped code that is irrelevant to us at this time ... */
}
```

`rb_objspace` is a global struct that is defined on VM initialisation and contains pointers to both of the heaps. It contains a lot of information about the garbage collection lifecycle of the running Ruby interpreter, as such we'll discuss it in more detail in a later post, but for now we just need to know that it contains two member fields `eden_heap` and `tomb_heap` that are instances of `rb_heap_t`.

The call to `heap_add_pages` gives us some interesting information. Firstly that we only add pages to the `heap_eden` when we start the VM. Secondly that the number of pages we'll start with is configurable by tuning the parameter `gc_params.heap_init_slots`. This is exposed to the user as the environment variable `RUBY_GC_HEAP_INIT_SLOTS`.

So, now that we know that Ruby prefills our `eden_heap` with a set number of empty pages when our interpreter starts, it should follow that the `eden_heap` is where all of our objects are allocated. So what is the `tomb_heap` used for?

We'll cover this in more detail in a future post when we cover mark & sweep garbage collection, but some relevant code for this lives inside the `gc_sweep_step` function:

```c=
if (sweep_page->final_slots + free_slots == sweep_page->total_slots &&
    heap_pages_freeable_pages > 0 &&
    unlink_limit > 0) {
    heap_pages_freeable_pages--;
    unlink_limit--;
    /* there are no living objects -> move this page to tomb heap */
    heap_unlink_page(objspace, heap, sweep_page);
    heap_add_page(objspace, heap_tomb, sweep_page);
}
```

Handwaving away some details for now - this code says that if the number of free slots on the page that we're currently sweeping is the same as the total number of slots on the page (ie. there are no live objects left on the page), then we remove the page from the Eden heap and move it into the Tomb heap.

This contrasts nicely with the code in `heap_page_create`:

```c=
static struct heap_page *
heap_page_create(rb_objspace_t *objspace)
{
    struct heap_page *page;
    const char *method = "recycle";

    heap_allocatable_pages--;

    page = heap_page_resurrect(objspace);

    if (page == NULL) {
	page = heap_page_allocate(objspace);
	method = "allocate";
    }

    return page;
}
```

`heap_page_resurrect` removes a page from the tomb heap and returns it. So the tomb heap can be viewed as a memory efficiency optimisation. After the garbage collector runs, instead of freeing empty pages back to the operating system, we store them somewhere, and then the next time we run out of heap pages, we first check whether we have any dead pages stored that we can recycle, and we only ask the OS to allocate us more memory if we really need it.

This storage space for dead pages is what the `tomb_heap` is used for.

This is a slight simplification, as it doesn't take into account Ruby objects with finalizers (finalizers are a way of assigning code to run when an object is garbage collected), but for our purposes it's enough to know that finalizers exist, we'll discuss them in more detail in a future post.

## Summary, and what's next

Let's summarise what we've learned. We now know that all Ruby objects are fixed width C structs. They're organised into pages, and each page holds 409 objects.

We know that when the Ruby interpreter boots up it allocates a large chunk of memory from the OS, which it divides into pages and groups these pages together in a heap.

We also know that a mechanism exists whereby we can recycle used pages, saving them for later use without releasing them to the operating system, and that this allows us to be a bit more efficient with our memory usage and reduce the number of times we ask the OS for more memory.

We know that the heap and its pages keep track of all the free slots in a freelist, which we can use to quickly find a place in which we can assign a new object. And we know that when an object is no longer needed Ruby will push that object back onto the freelist so we can use it again later.

We haven't yet talked about when an object would be removed, and how that happens. In the next post we'll inroduce the idea of garbage collection. We'll talk about how Ruby determines Object liveness, how the two phases of the main Mark & Sweep algorithm work together to remove objects that are no longer used and return their space back to the freelist. We'll also talk on the various ways that GC can be triggered, whether manually, or automatically during the lifetime of your programs.

Lastly we'll talk about some of the limitations of Mark & Sweep, the ways in which they can be mitigated against and introduce some of the concepts Ruby uses to do so, which we'll explore in the rest of this series.

[^1]: I'll use "Ruby" a lot in this post. I know that there are many Rubies in the world and that I'm only talking about one, and so the generic use of Ruby may be incorrect. But it's prudent to bear in mind that everything I talk about here applies specifically to the default Ruby Implementation, started by Matz, written in C and hosted on https://www.ruby-lang.org. Other implementations may do things differently.
