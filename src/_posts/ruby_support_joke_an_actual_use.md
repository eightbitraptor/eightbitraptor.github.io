---
layout: post
title: "Weird Ruby: Using `SUPPORT_JOKE` to actually help!"
date: 2022-05-24T21:29:13+01:00
categories: ruby weird
---

So, Ruby, for whatever reason, has a bunch of easter eggs hidden in its VM.
There is the [` __goto__` and `__label__`
syntax](https://patshaughnessy.net/2012/2/29/the-joke-is-on-us-how-ruby-1-9-supports-the-goto-statement);
for when you really really need a goto statement in your program! And there are
also a couple of specific VM instructions that you can optionally enable.

To enable all this you need to hardcode the `OPT_SUPPORT_JOKE`
preprocessor constant in `vm_opts.h` to `1` (it defaults to `0` obviously).

As an aside: this variable _is_ all wired up via the autotools, but setting it
the normal way using `cppflags="-DOPT_SUPPORT_JOKE=1"` doesn't work, because the
Ruby script that parses the VMs instruction definition DSL into actual C
code relies on grepping the content of `vm_opts.h` for its optional values, but
when you use `cflags`, they're effectively configured in the memory of a
different process. 

So if you rely on the `cflags` only, you get a bunch of code inside `#ifdef`'s
that is compiled assuming certain instructions exist, but those instructions
don't exist because their existence depends on an actual `1` being hard coded
inside the file.

Ask me how I know.

Anyway... Ranting aside

I went down this rabbit hole for a reason. I was looking at the output of
running ruby with the various `--dump` options to work out which ast nodes
generated which YARV instructions.

For instance, the Ruby code `while true; end` generates this AST

```
❯ ruby --dump=parsetree_with_comment -e 'while true; end'

# @ NODE_SCOPE (id: 3, line: 1, location: (1,0)-(1,15))
# | # new scope
# | # format: [nd_tbl]: local table, [nd_args]: arguments, [nd_body]: body
# +- nd_tbl (local table): (empty)
# +- nd_args (arguments):
# |   (null node)
# +- nd_body (body):
#     @ NODE_WHILE (id: 2, line: 1, location: (1,0)-(1,15))*
#     | # while statement
#     | # format: while [nd_cond]; [nd_body]; end
#     | # example: while x == 1; foo; end
#     +- nd_state (begin-end-while?): 1 (while-end)
#     +- nd_cond (condition):
#     |   @ NODE_TRUE (id: 0, line: 1, location: (1,6)-(1,10))
#     |   | # true
#     |   | # format: true
#     |   | # example: true
#     +- nd_body (body):
#         @ NODE_BEGIN (id: 1, line: 1, location: (1,11)-(1,11))
#         | # begin statement
#         | # format: begin; [nd_body]; end
#         | # example: begin; 1; end
#         +- nd_body (body):
#             (null node)
```

which then compiles into this YARV bytecode, which the VM then runs:

```
❯ ruby --dump=insns_without_opt -e 'while true; end'
== disasm: #<ISeq:<main>@-e:1 (1,0)-(1,15)> (catch: FALSE)
0000 jump                                   6                         (   1)[Li]
0002 putnil
0003 pop
0004 jump                                   6
0006 jump                                   6
0008 putnil
0009 leave
```

And what I wanted was basically `puts` debugging, but for bytecode. I want to
know exactly which lines of bytecode are emitted from each AST node.

My usual trick for this, in normal code land, would be to `puts` some known text
out to `stderr` or whatever, at the beginning, and at the end of the code region
I care about, so I can isolate in the output, exactly which log messages I care
about.

So I wondered if I could make a couple of no-op YARV instructions that I could
just insert into my bytecode at various points to let me know where certain
things are being triggered from.

And as we mentioned earlier, It turns out that YARV has a couple of extraneous,
random instructions that maybe we can used to help debug stuff. They're not quite
no-ops, as they do push values back onto the stack (And I guess they were
probably funny once. Maybe[1]).

```
/* BLT */
DEFINE_INSN_IF(SUPPORT_JOKE)
bitblt
()
()
(VALUE ret)
{
    ret = rb_str_new2("a bit of bacon, lettuce and tomato");
}

/* The Answer to Life, the Universe, and Everything */
DEFINE_INSN_IF(SUPPORT_JOKE)
answer
()
()
(VALUE ret)
{
    ret = INT2FIX(42);
}
```

Neither of these take any operands (illustrated by the first set of empty
parenthesis); nor do they pop values from the stack (the second empty
parens); but they do push a value onto the stack (the value `ret` in the third set of parens).

This means that, providing you're only debugging simple bytecode (my `while
true; end` is a good example), then you can use these as is. But as soon as you
are relying on the contents of the stack you're going to need to do something a
bit more nuanced (even if that is just following up with a `pop` instruction to
get rid of the crap you just pushed onto the stack).

Add them to your bytecode at various points in `compile.c` using the macro
`ADD_INSN` like this:

```
ADD_INSN(ret, line_node, bitlt);
```

And wonder in the beauty of your work

```
❯ ./miniruby --dump=insns_without_opt -e 'while true; end'
== disasm: #<ISeq:<main>@-e:1 (1,0)-(1,15)> (catch: FALSE)
0000 bitblt                                                           (   1)[Li]
0001 jump                                   7
0003 putnil
0004 pop
0005 jump                                   7
0007 jump                                   7
0009 putnil
0010 bitblt
0011 leave
```

[1]: Look. I enjoy the Hitchhikers guide, and Douglas Adams, as much as the next
    sci-fi loving, geriatric-millenial, british computer nerd. But can we just
    accept that the number 42 is just a number. And that these jokes have been
    [done to
    death](https://api.rubyonrails.org/classes/ActiveRecord/Associations/CollectionProxy.html#method-i-forty_two)
    at this point. Please.
