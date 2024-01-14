---
layout: weeknote
title: "Short"
slug: 2021-03
date: 2021-01-24T22:00:35Z
---

* At some point this week Phoebe wanted to watch videos of Volcanos and Thunderstorms. We sat down together to try and find some videos. We watched a lot of educational content which was fun - but then got utterly side-tracked with this [30 day timelapse from the roof of a container ship](https://www.youtube.com/watch?v=AHrCI9eSJGQ). She was just as hooked as me! I've watched this a bunch of times since then and it may just be the most captivating 10 minutes of YouTube I've ever seen. Also the night sky is breathtaking from the middle of the ocean.

* I went for my first run! I did 4k through Sevenoaks - In honesty it was like 65% walking and 35% running, but I still feel like I achieved something. Now that I've broken the ice it's time to find a proper running plan and work on some deliberate improvements. I'll probably tone it down a little to start with as well. I was not broken the next day, but it was harder to get down stairs than I would have liked.

* Long story time: I have [a bag that I carry with me to "work"](/images/work-bag.jpg) every day. It has my computer, my (current) keyboard, my mouse and my headphones in it. Carrying it up the stairs at the beginning of the day and down at the end helps my brain switch from home to work modes and vice versa. I was getting a bit twitchy about it recently because my new keyboard is the only thing in there without it's own protective carry case. My laptop lives in an old Reevoo 13" Macbook sleeve that the then CTO gave me when I worked there back in 2007, and my headphones and mouse have their own hard shell cases - but [my keyboard](https://www.hhkeyboard.com/uk/products/hybrid/) was rattling around naked!

  I spent some time looking at keyboard cases and decided I really liked some of the heavy canvas carry sleeves I saw, but they were all being sold by overseas merchants who for various reasons (fuck Brexit) can't ship to the UK right now.

  I asked my [very talented mother-in-law](https://twitter.com/clareavalentine/) if I could commission her to make me a keyboard case, and told her about the ones that I'd seen. We chatted about fabrics and dimensions for a bit and then she sent me this!

  ![custom HHKB carry case](/images/keyboard-bag.jpg)

  Now I have my own artisanal, hand-crafted HHKB case and I love it! Also everything in my bag is now safe and protected so all is right with the world.

* Peter and I hit a milestone with our Ruby work this week. We finally got to [submit a PR to Ruby](https://github.com/ruby/ruby/pull/4107) and to [raise a ticket](https://bugs.ruby-lang.org/issues/17570) on the official issue tracker explaining what we've been up to! I'm very proud of this. There's still a long way to go before this feature is ready for production use, but I'm pleased it's out in public and in front of the core team.

  We did some benchmarking before we pushed it and it's really exciting to see that our branch is showing a 3% speed improvement over master for method calls and instance variable (ivar) lookups, which is super promising for the future of the project!

  In Ruby, every time you create a class Ruby creates a 40-byte wide C-struct called an RVALUE on the heap that represents that class. It also allocates a chunk of memory outside of Ruby's garbage collected heap in which it stores an extension object. This extension object contains (amongst other things) the ivar cache and the method cache for the object in question.

  What Peter and I have done, in a nutshell, is move that extra struct from non-GC memory, directly into the GC heap in a space that's adjacent to the class it's extending. This means that the compiler can optimise away some pointer indirection, and the locality of the CPU caches is improved.

  Our benchmark is a completely synthetic micro-benchmark that just creates a class and then access some ivars and calls some methods, so it's not super representative of real world applications but I'm still stoked for ~3% speedup. Honestly I think 1% would have been enough of a boost for us to continue working on this change and try and roll it out across more of the Ruby types.

* I think I'm going to re-design my keyboard PCB. For a couple of reasons: The USB port is in a really inconvenient place for case design, and I want to switch to USB-C anyway, and I want to get the manufacturers to pick and place the surface mount components for me because soldering them is too painful, and I'm struggling to get the time. I think this is the right decision, even though it amounts to probably several months worth of setbacks, which makes me sad.

* Not much else this week. There was some snow, which I hated. We're still locked down, which I also hate. Kids are missing out on human contact still, which is shit. Life goes on.


