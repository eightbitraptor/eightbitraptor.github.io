---
layout: weeknote
title: 
slug: 2025-42
date: 2025-10-20T20:00:00+01:00
---

- I updated this side to use latest Bridgetown release. It was surprisingly
  uneventful given how long it's been since I touched this codebase. I still
  need to transfer most of my settings from the old Yaml based config to the new
  Ruby initializer API however. I'll do that next week (maybe).

  I'm still rough on how long I'll keep up the weeknotes for this time. It takes
  a non-trivial amount of time to record and write these things, and even though
  I enjoy it, I am incredibly busy, as well as incredibly lazy. 

  Still, first one in over a year so I guess there's a lot to catch up on.

- I won a guitar in an online raffle a couple of weeks ago. It was very exciting
  and I am now the proud owner of a [Gibson Les Paul Studio in Cherry
  Burst](https://guitargeargiveaway.co.uk/competition/gibson-les-paul-studio-t-in-black-cherry-burst/)!
  It's very nice, and I am enjoying it. 
  
  Unfortunately I now have enough guitars that need set-ups and fret work done
  (3) that paying a tech to do it would be very expensive. Instead, I bought
  some tools and watched a lot of YouTube videos.
  
  This kind of hubris [hasn't ended well for me in the past](https://www.youtube.com/live/Hg66nYmoFhQ?t=8341s).

  Anyway, this week I levelled, dressed and polished the frets on my Telecaster
  and set it up with a fresh set of 11-52's in D standard and I'm blown away by
  the difference it's made. I'm very proud of myself.

  I'm going to hold off on doing the Gibson until the current set of strings on
  it need changing, even though it's strung with 9's, which I don't like very
  much, because I am still a little scared of going near an expensive guitar
  with a file and sandpaper.

- Some of the parents of kids in P's class at school started a run club, which
  I'm now a part of. We meet every Sunday morning at 6.30am and normally do
  between 5 and 10km.
  
  I started running during the pandemic, but over the last year or so, with a
  new baby in the house I just haven't had the time, and it's fallen by the
  wayside. I'm trying to get back into it and lose some of the weight I've put
  on now that I'm a tired, sedentry, old man.
  
  Enjoying the run club so far, or I would be if I hadn't got ill right after
  the first run, and had to skip the following two.
  
  I won't lie, I'm finding it rough. But at least my ridiculous people-pleasing,
  self-shaming millenial brain is forcing me to actually push through. 80s/90s
  upbringing got to be good for something right?

- Speaking of Sundays: I had an excellent day in London this Sunday. Arrived in
  the early afternoon and spent some time catching up with
  [Tom](https://tomstu.art/). Then met up with
  [Chris](https://chrislowis.co.uk/), drank beer, yelled at clouds and then
  generall put the world to rights for the rest of the afternoon/early evening,
  and finally went to see [YOB at a venue in
  Dalston](https://earthackney.co.uk/events/yob-19th-oct-earth-london-tickets-yorklx/).
  
  The weather was shit, but other than that it was a great day. Wonderful
  company, decent food, great beer and some strangely uplifting doom metal as a
  coda.
  
- I've had a really annoying issue with my Emacs being slow. Opening files,
  using Magit, basically anything that seems to interact with the Filesystem has
  been lagging, and it's driving me to distraction.
  
  I think I finally tracked it down to the `treesit-auto` package. Which is kind
  of handy because I've been fighting some of Treesitter's indentation rules for
  Ruby and wanted to go back to `enh-ruby-mode` anyway.
  
  I stripped out `treesit-auto`, reverted to `enh-ruby-mode` and configured
  Treesitter manually for C, Rust and Python, which should cover about 95% of
  the programming I do anyway.
  
  And the difference has been very pleasantly noticeable.

- I'll not be writing about any of the latest [Ruby
  dramas](https://rubydramas.com/). Just imagine me heaving the world's largest
  fucking sigh and leave it at that.
