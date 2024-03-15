---
layout: weeknote
title: Exciting Keyboard releases
slug: 2024-11
date: 2024-03-15T13:29:33+00:00
---

- Not a lot to report this week. I took Monday and Tuesday off work to make
  up for missing weekend/evening family time during my work travel last
  week. But the kids and Liz were still sick, so we didn't do much other than
  eat, crash on the sofa together and drink Lemsip.

- I have now developed a second cold, and this one is leaking out of my nose,
  which I _hate_. So I'm grumpy about that.
  
<hr />

- At work I've started working on a feature that will allow Major GC's to be
  disabled in Ruby. This is designed to work in conjunction with [Out of band
  GC](http://tmm1.net/ruby21-oobgc) and [preforking servers like
  Pitchfork](https://github.com/Shopify/pitchfork). The idea is that we can
  provide a couple of library functions: `GC.disable_major` and
  `GC.needs_major?` which when used in tandem will allow a server to control
  exactly when a major GC runs.
  
- This idea came out of a conversation that [Jean](https://github.com/byroot),
  [Peter](https://peterzhu.ca/), and I had during our team meeting last week,
  which is fun.
  
- I have it mostly working, but I've still got some compaction related bugs to
  fix.

<hr />

- As I write this it's exactly 2 months until
  [RubyKaigi](https://rubykaigi.org/2024/) and I am exceptionally excited to be
  visiting Okinawa. It'll also be my first time flying Premium Economy instead
  of regular Economy, so I'm excited for that extra legroom.
  
- I should probably start putting my talk together.

<hr />

- I've been waiting for a while now for the new version of my favourite
  keyboard, and [the PR has finally been
  merged](https://github.com/foostan/crkbd/pull/208). Corne V4 is very exciting,
  it uses on-board components rather than relying on a ProMicro footprint MCU,
  and it comes with an official case design, which is a first.
  
  Although the PCB releases are hotswap only for now, and I am allergic to
  hotswap boards generally, so I'll have to wait for the soldered versions. 
  
- I tried using Aaron's keyboard when we were at our team meeting last week,
  which uses [Kailh choc
  whites](https://mechboards.co.uk/products/kailh-low-profile-choc-switches-v1-white)
  and was pleasantly surprised. I'm normally a linear-boi, and I haven't found a
  set of clicky switches I actually liked the feel or the sound of until now,
  but these just immediately grabbed me.
  
- The major downside for me is that now that the V4 has moved to onboard
  components it's not immediately obvious to me how to make it wireless, and
  frankly I haven't the time for the modifications or research.
  
  I'd like to build a new travel board soon. I'm definitely going to use Choc
  white switches but I'm in a quandry with the board. New shiny V4, with onboard
  components, fancy case and wires. Or older model, 3rd party case/plate design,
  but fully wireless.
  
<hr />

- I have picked up Animal Crossing again. It's amazing how many weeds can
  accumulate after a year long hiatus.
