---
layout: post
title: "Using Ruby's dump flag to read bytecode doesn't give you the whole picture"
date: 2022-05-25T13:26:46+01:00
categories: ruby fun
---

I got [nerd sniped a little by a bug on the Ruby bug tracker](https://bugs.ruby-lang.org/issues/18801) recently. The author (👋 Hi [Maple](https://twitter.com/OngMaple)) noticed that whenever they looked at the instruction for certain Ruby code they always saw some instructions that looked like they were dead.

```
❯ ruby --dump=insns -e 'while 1+2; end'
== disasm: #<ISeq:<main>@-e:1 (1,0)-(1,14)> (catch: FALSE)
0000 jump                                   4                         (   1)[Li]
0002 putnil
0003 pop
0004 putobject_INT2FIX_1_
0005 putobject                              2
0007 opt_plus                               <calldata!mid:+, argc:1, ARGS_SIMPLE>[CcCr]
0009 branchif                               4
0011 putnil
0012 leave
```

The instructions in question are the `putnil` and `pop` at positions `0002` and `0003`. There are seemingly 2 problems with this:

1. the `putnil` and `pop` are immediately after an unconditional jump, that jumps over them, there's nothing there that jumps back so they're not going to get executed.
2. Even if they were going to get executed, they're seemingly a no-op

The purpose of this post is not to answer those questions (I did some digging in the bug ticked linked above if you're curious where I got to), but instead to point out that using `--dump=insns` as we're doing here doesn't show the whole picture.

In the bytecode above all those jump instructions are just given offsets in the instruction sequence to jump to, but as we're building the sequence we don't really know what those offsets will be. So instead we insert labels into the bytecode that are used as jump targets, and then, when we jump, we jump to a label. 

Part of the compilation process is about taking those labels and turning them into offsets into our final instruction sequence and then stripping the actual labels so they don't appear in our final bytecode.

But in cases like this it's interesting to see the labels, because doing so will tell us more about the possible uses of bytecode that seemingly doesn't make sense. Whether or not we can observe a jump happening to a place, it's interesting to know whether it's _even possible_ for a jump to target that place!

There's another way to visualise Ruby bytecode, one that I often overlook because it's more cumbersome to use than `--dump=insns`, and that's `RubyVM::InstructionSequence.compile`.

In order to use `RubyVM::InstructionSequence` to generate the bytecode listing above we can do this:

```
❯ ruby -e "puts RubyVM::InstructionSequence.compile('while 1+2; end').disasm"
== disasm: #<ISeq:<compiled>@<compiled>:1 (1,0)-(1,14)> (catch: FALSE)
0000 jump                                   4                         (   1)[Li]
0002 putnil
0003 pop
0004 putobject_INT2FIX_1_
0005 putobject                              2
0007 opt_plus                               <calldata!mid:+, argc:1, ARGS_SIMPLE>[CcCr]
0009 branchif                               4
0011 putnil
0012 leave
```

Great! So that's a lot more typing for no appreciable benefit. But if we take a look at the `RubyVM::InstructionSequence` object we're calling `disasm` on, then things get a lot more interesting

```
irb(main):001:0> RubyVM::InstructionSequence.compile('while 1+2; end').to_a
=> 
["YARVInstructionSequence/SimpleDataFormat",                                 
 3,
 1,
 1,
 {:arg_size=>0,
  :local_size=>0,
  :stack_max=>2,
  :node_id=>6,
  :code_location=>[1, 0, 1, 14],
  :node_ids=>[5, 5, 5, 0, 1, 3, 3, 5, -1]},
 "<compiled>",
 "<compiled>",
 "<compiled>",
 1,
 :top,
 [],
 {},
 [],
 [1,
  :RUBY_EVENT_LINE,
  [:jump, :label_4],
  [:putnil],
  [:pop],
  :label_4,
  [:putobject_INT2FIX_1_],
  [:putobject, 2],
  [:opt_plus, {:mid=>:+, :flag=>16, :orig_argc=>1}],
  [:branchif, :label_4],
  [:putnil],
  [:leave]]]
```

Woah! What's all this stuff then? [You can read about it all in the Ruby docs](https://docs.ruby-lang.org/en/master/RubyVM/InstructionSequence.html#method-i-to_a) but that's a lot of information!

Cutting to the chase, the last Array that's returned shows us the actual instruction list that is going to get executed as part of this instruction sequence. Hopefully you can see how it maps to the `disasm` and `dump` output above. But look - there are labels in this one too. We can clearly see where `:label_4` is being defined, and a jump to it. 

This is going to help us with our debugging as we'll now be able to see that in some cases, there is in fact, a jump target between those two seemingly dead instructions, which we can use to aid us in our sleuthing.

```
irb(main):007:0> RubyVM::InstructionSequence.compile('while 1+2; class A; next; end; end').to_a.last.map { |e| puts
 e.inspect };nil
1
:RUBY_EVENT_LINE                                                                                                   
[:jump, :label_14]                                                                                                 
[:putnil]                                                                                                          
:label_3                                                                                                           
[:pop]                                                                                                             
[:jump, :label_14]                                                                                                 
:label_6
```

So, in summary. `--dump=insns` and `--dump=insns_without_opt` are still really useful tools (and I'll continue to use them by default). But, if you're scratching your head at a Ruby instruction sequence, then definitely check out the `RubyVM::InstructionSequence` directly - there's more that it can show you.
