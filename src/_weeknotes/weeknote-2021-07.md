---
layout: weeknote
title: "Buy one, get one free"
slug: 2021-07
date: 2021-02-21T20:46:58Z
---

* Well. That's it! Missed a week. Had to happen sooner or later. It's like
  scratching a new laptop. After carefully protecting the innocence of a
  pristine new thing, the first ding has been made and it's all downhill from
  here!

  Flippancy aside, I'm going to try and maintain a regular cadence with these
  weeknotes.  I've enjoyed writing them, the reflection has been useful and I'm
  looking forward to reading back on them in a years time so see where I am and
  where I've come from.

  Anyway. Moving on with this bumper two week update:

* I have changed my mind about the snow. I mean, it's still cold and grim and I
  hate falling over, but we spent most of the weekend teaching Phoebe how to
  sled down hills and that was hella fun. Liz managed to find seemingly the
  last sled in stock anywhere near us, about 10 minutes before closing time on
  Friday, at our local sports store.

  I'm sure they had marked the thing up by about 20% but even still it was
  worth every penny for how much we used it. It really made our weekend.

* We're slowing getting used to the new mattress. Having a hybrid memory foam
  mattress is still pretty jarring for me, as when I sit on it I expect it to
  behave the same as our old sprung mattress and it just doesn't. That being
  said, I have started to sleep much better which is a real win.

* It was my friend [Matt's](https://mattbee.co.uk) birthday. He's been doing
  the [Lockdown Open Mic Club](https://www.lockdownopenmic.club) for a year
  now, and they did a session for his birthday. They'd been sending a physical
  birthday card around the country for each of the members to sign, which Matt
  opened on the night, and they put together a really lovely version of one of
  his songs.

  It was such a lovely night, and I'm so impressed at the Lockdown Open Mic
  community, they're a lovely bunch of people from around the country (and a
  couple in the US I believe).

  It almost brought a tear to my eye.

* In completely unrelated news, I dusted off and tuned my guitar and started
  putting a playlist together of songs that I'd enjoy having a crack at. Not
  that I need more hobbies at this point.

  I need to remember what strings are on my acoustic so I can buy some more.

* I found this set of
  [Octonauts](https://www.bbc.co.uk/cbeebies/shows/octonauts) themed [cookie
  cutters on Thingiverse](https://www.thingiverse.com/thing:3352421). Phoebe
  was very excited to print them with me and we used them together to make
  Octonaut themed Easter biscuits - they came out alright, even if my brain was
  so foggy I forgot to put any of the spices in (and later on I found the sugar
  in the fridge)!

  <img src="/images/octonauts-cookies.jpg" style="width:100%" alt="Octonauts themed cookies I made with my daughter. Explore! Rescue! Protect!"></img>

* ~~Went drinking with the lads on Friday~~ Got drunk alone at home in front of
  a Google Hangout.

  The other people who were in the hangout are, however, some of the loveliest
  people I know and the ensuing laughter cleansed my lockdown darkened soul.
  Also I learned a new beer pouring trick but I can't find a link to the Tiktok
  so y'all gonna have to just trust me.

* In work news. I'm currently chasing down a really interesting memory
  corruption issue.

  I may have mentioned this before by the memory layout in Ruby's GC consists
  of a region of consecutive 40 byte chunks (called "slots"). I have one slot
  that contains the object in question and the following three slots contain
  metadata for the object - we'll call these chunks collectively 'the payload'.
  At the start of the payload region we have a 16 byte area for metadata about
  the payload, it's length and so on - and then we go straight into the
  arbitrary payload data.

  We can see this here: this is the main object:

  ```
  (lldb) p obj
  (VALUE) $2 = 0x00000001018137e0
  (lldb) rp obj
  bits [LM    ]
  T_CLASS: [PROMOTED] (struct RClass) $4 = {
    basic = (flags = 0x0000000000001062, klass = 0x00000001018799a0)
    super = 0x0000000101879860
    ptr = 0x0000000101813818
    class_serial = 526
  }
  ```

  This is what a Ruby class looks like. The struct member `ptr` points to a
  struct of type `rb_classext_t` that looks like this:

  ```
  (lldb) p *((struct RClass *)obj)->ptr
  (rb_classext_struct) $5 = {
    iv_index_tbl = 0x0000000000000000
    iv_tbl = 0x0000000100a63340
    m_tbl = 0x0000000100a605c0
    const_tbl = 0x0000000000000060
    callable_m_tbl = 0x0000000000000000
    cc_tbl = 0x0000000000000000
    subclasses = 0x0000000000000000
    parent_subclasses = 0x00000001018798c8
    module_subclasses = 0x0000000000000060
    origin_ = 0x00000001018137e0
    refined_class = 0x0000000000000008
    allocator = 0x0000000000000000
    includer = 0x0000000000000000
  }
  ```

  You can see that the address of `obj` is `0x1018137e0` and the address of the
  `rb_classext_t` struct pointed to by ptr is `0x101813818`, if we subtract the
  address of `obj` from the `ptr` address we get `0x38` or 56 bytes. This fits
  with our knowledge of the memory layout that each slot is 40 bytes wide and
  the Payload section contains a 16 byte header object.

  We can verify this by grabbing the obj and adding 40 bytes and we should get
  hold of a Payload header object.

  ```
  (lldb) rp obj + 40
  bits [      ]
  Not-handled type 0x17
  (RBasic *) $10 = 0x0000000101813808
  ```

  Type `0x17` is the type for the Payload head, I promise. It's only unhandled
  because I haven't made the debugger helper scripts support it yet!

  So this is all good. But what if we look at the `rb_classext_t` struct a
  little more closely? That `0x60` memory address in `const_tbl` looks a little
  bit low compared to all the other memory locations we've been dealing with so
  far.

  And sure enough: the crash I'm seeing is a SIGSEGV (memory access violation)
  when trying to access the `const_tbl` member at address `0x60`.

  So what's setting that value to `0x60`? This behaviour is only reproduceable
  on my branch, but I'm not doing anything with the content of `rb_classext_t`,
  just it's position.

  The interesting thing about this bug is that if you count the bytes from the
  start of the payload slot to the broken memory address you have 16 for the
  header, + 24, for `iv_index_tbl`, `iv_tbl` and `m_tbl` respectively. These
  are all `unsigned long` which on my machine is 8 bytes.

  This makes 40 bytes - which is suspicious as it's exactly the same size as a
  slot. And, if we then jump forward another 40 bytes we get to the
  `module_subclasses` member, and that has _also_ been set to `0x60`.

  This is all super sus and almost certainly an offset bug, where we're taking
  the address at the head of the payload and naively finding the next slot by
  just adding 40 bytes, and then setting a value there.

  The only annoying thing is that I can't find it, despite almost certainly
  introducing it.

  **tl;dr** I made the mistake of thinking for a minute, that I could
  write C. The computer decided to remind me that that was not the case.

* Bumper keyboard update this time around! First up, the [Nibble
  kit](https://nullbits.co/nibble/), which I took a day off to build.

  It was a really fun build, although the diodes took ages to get straight.
  Thoroughly enjoyed the whole process - except lubing and filming the
  switches, which I normally don't mind doing but I definitely should not have
  tried to do in the same day.

  It takes ages, and I normally like to be quite slow and thorough with the
  process, but knowing that I had all those diodes to do while I was doing it
  really made it feel like mission impossible.

  Lesson for next time is definitely split the tasks out and lube and build on
  different days.

  As for the keyboard - I like it, although I'm back to using my HHKB right
  now. There are a couple of things I'm not sure about:

  1. It's got some pretty gross quality DSA keycaps on it while I wait for my
     Group buy sets to come in, and I have decided that I don't like DSA on
     flat, row staggered boards.  It's just about bearable with an angle, but
     othat means I need to built/print some bumpers to raise up the board.

  2. I think 62g linears are still a bit too heavy for me, although I'm not
     ruling out the idea that I might like them a lot better with better
     keycaps on. I've got some Cherry MX Browns (eww) in a different board that
     I might spring swap if I still don't like them with the new keycaps.

     I'm probably going to find some tactile switches for my next build though.
     I'm veering towards [ergo
     clears](https://deskthority.net/wiki/Cherry_MX_Ergo_Clear) or maybe
     [something panda-esque](https://deskthority.net/wiki/Holy_Panda).

  3. I've been using this for a week and I'm still not used to a column of keys
     (and an encoder) to the left of the main block. It turns out I have been
     anchoring with the left shift and the escape (or `) key for years and
     didn't realise it.

  Anyway: Here it is in all it's glory.

  <img src="/images/nibble.jpg" style="width:100%" alt="My newly built Nibble 65% keyboard with Durock Linear 62g L7's" />

* After a flash of inspiration I put together a 45% keyboard design and PCB.
  It's based on a
  [ProMicro](https://mechboards.co.uk/shop/components/pro-micro-5v/). An
  all-in-one AVR based development board so it's easy mode for PCB design. No
  worrying about differential signalling down the USB bus or worrying about
  whether I can place the crystal close enough to the MCU. All I have to do
  with a ProMicro is route the matrix, which took a couple of hours at most.
  I'm pleased with how it came out.

  I also wanted to experiment with silkscreen artwork so I dropped in a jpg of
  [Megumin](https://www.youtube.com/watch?v=jar1LTxxAeM), probably my favourite
  character so far from very silly anime
  [Konosuba](https://www.animenewsnetwork.com/encyclopedia/anime.php?id=17123)
  (which I'm idly watching a few episodes at a time whenever I find myself doing
  the ironing).

  Final Version I sent off to [JLCPCB](https://jlcpcb.com) looks like this:

  <img src="/images/Megu45-pcb.png" style="width:100%" alt="The 45% PCB I designed"></img>

  I originally wanted it matte black, just with the image in red, but JLCPCB
  only support white silkscreen printing, so I just YOLO'd the whole PCB in red
  instead. I hope it comes out a reasonable colour.

  And the layout it uses is this:

  <img src="/images/Megu45-kle.png" style="width:100%" alt="It uses this layout"></img>

  This is basically a meme by keyboard community standards. A Winkeyless, big
  bar, weeb-themed 40%, with a top-right Kyuu style blocker, and I'm here for it!

  No case design yet. I'm thinking something 3D printed, or maybe clear acrylic
  layered to show of the garish PCB to it's full glory. Who knows maybe V2 will
  even have RGB ;)

* While I was at JLCPCB I also got together some gerbers and ordered the latest
  version of the CRKBD Light, a minimalist version of [the fantastic
  CRKBD](https://github.com/foostan/crkbd).

  I've used a CRKBD for a while - it was my first build and I've wanted to
  build a Corne Light since [foostan posted this
  tweet](https://twitter.com/foostan/status/1289863511028273152/photo/1) so it
  seemed rude not to while I was at JLCPCB and everything.

  Who knows when I'm going to get round to building either of these. But maybe
  next week I can at least get some switches ordered.

* The final cherry on top of the last two weeks is that the weather has finally
  started warming up again! Spring is on it's way.

  Warm enough that that on Sunday, I spent most of the day in the garden,
  playing with Phoebe, and neither of us wore coats. We went bug hunting,
  planted some seeds, played a lot of hide and seek and spent time on her swing
  and slide.

  It's hard for me to communicate just how much of a blessing it is to be able
  to watch your kid play, uninhibited and unrestricted, in a safe outside
  space. That together with the warmth of the early spring sun has really
  lifted my spirits.

  I've always been grumpy about gardens. I have never liked gardening, or
  anything that required outdoor dirty work, and have always viewed them as way
  too much work for not enough reward.

  But I will admit that after a year of severely restricted travel and
  opportunity, and a winter where even the garden was unusable, that I love my
  garden. I'm very lucky to have it - and I'm actually excited by the thought
  of getting out there and doing the work to make it nice for the kids growing
  up.

* I still haven't done the OpenGraph thing.
