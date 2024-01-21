---
layout: weeknote
title: Comedy of errors
slug: 2024-03
date: 2024-01-21T20:28:03+00:00
---

- My team and I are continuing to focus on getting the Ruby bootstrap tests
  (`make btest` in the CRuby repository) passing with Prism and it's new
  compiler. As it stands about 30 odd, or ~2.5% of the ~1600 tests. Feeling
  happy about progress.
  
- A good chunk of those are probably catch table or local related. I've been
  working towards getting the locals wortking and I feel like I have a good
  solution that is accurate at accessing locals in the correct scope, but
  doesn't compromise efficiency.
  
- A summary of the problem is essentially that Prism thinks about variable depth
  in terms of AST nodes, and Ruby thinks of variable depth in terms of binding
  scopes. But not every AST node introduces a new binding scope so the numbers
  often don't match especially for deeply nested code.
  
- So we need to be able to look up locals according to Ruby's scoping rules, but
  also draw some benefit from the depth hints that Prism is providing us with.
  
- Essentially I'm always walking up the scope tree starting from the depth that
  Prism has told us we need to be at. But in some cases where we just skip
  searching in the current node (because all variables are bound to the parent
  scope, like in `for` loops).
  
- This seems to work. But `make btest` is only the first level boss of getting
  the Ruby interpreter to work. `make test-all` is Dark Souls level. It requires
  building a full Ruby binary (instead of the minimal core binary required by
  `btest`). And it also runs >26,000 tests.
  
<hr />

- I submitted a response to the CFP for [RubyKaigi
  2024](https://rubykaigi.org/2024/). I am exceptionally excited to visit
  Okinawa in May.

- I've already started a Google Maps list of places I'd like to check out when
  I'm there.

- [Justin Searls makes a good case why you should try and go to Kaigi if you
  haven't been
  before](https://justin.searls.co/links/2024-01-07-why-you-should-come-to-rubykaigi-in-2024/).
  
<hr />
  
- I got a couple of new shirts from FatFace, a funky clothing retailer in the
  UK. They were a good price in the winter sales.

- FatFace do all of their clothes in "regular" and "tall" variants, including
  their shirts, which is brilliant. I can now have a shirt that is adequately
  long enough in the body and sleeves and doesn't fit like a tent.

- I still had to get XL/tall though, for the shoulder width. 

- This, Somewhat depressingly, isn't as tent like as it was a year or so ago,
  which means I've spent too long languishing in front of a computer and I need
  to remedy that.
  
- That aside, I'm very happy to have something in my wardrobe that isn't
  conference T-shirts.
  
<hr />

- I'm re-playing Final Fantasy VII on my Switch, my most recent save is outside
  the North Crater, near the end of the game.

- This is exactly where I got to in my original playthrough of the game
  in 1997. I was finishing off side quests before heading to the final
  confrontation when my memory card corrupted itself losing my saves and I quite
  in frustration. I have restarted FF7 many times since but never had the staying
  power for it. I'd like to finally finish it with as close to 100% as I can.
  
- This is mostly so I can troll nerds with my FF hot takes (6, 8, 9 and 10 are
  all better than 7).
  
- Lets hope Nintendo's cloud save is worth it, eh.

- The Switch version is nice. I like that they've used the PC version textures
  so it doesn't have the vaseline smear of the original playstation graphics.
  
- The 3X speed mode makes grinding out that Chocobo breeding part (for the
  Knights of the Round materia) a lot more bearable.

<hr />

- In what feels like a comedy of errors, on Wednesday evening I managed to break
  my glasses while trying to tighten one of the arms. I lost one screw and had
  to find a spare, and then realised I'd lost my tiny tweezers. And after all
  that the arm is sprung so I couldn't get the screw back in anyway.
  
- After some swearing I decided I'd put it down and take them to the opticians
  on Thursday morning. Got on the bus nice and early so as to not take too much
  of a chunk out of my work day, halfway to Canterbury I realised that in my
  rush to leave the house I had left my glasses at home.

- I eventually got them fixed up. And the bus ride home was free, as the drivers
  ticket machine malfunctioned as soon as I walked near it.

<hr />
  
- Tuesday evening was my fortnightly in-person RPG evening. A couple of friends
  from University, whom I re-connected with recently as their son goes to the
  same school as Phoebe, recently started a new game of Vampire: The Masquerade
  and invited me to join their existing group. We've been going a few months
  now, for a 3-4 hour session every two weeks, and it's brilliant fun.

- Our campaign is set in 1995 New York, just after a coup that saw the existing
  vampire ruling hierarchy overthrown. We're working for the new regime as
  investigators, looking into Sabbat activity, breaches of the Masquerade, that
  sort of thing. Currently investigating a new type of meth (with supernatural
  effects) that's being sold in the city by a fascist, white-supremacist biker
  gang that are also potentially Lycanthrope controlled. Fun times.

- We're using the revised edition ruleset, published in 1998. Which is good,
  because it was the most recent version of the ruleset at the time I last
  played any World of Darkness games back in University. I can still, mostly,
  remember how it works.

- This session was the most action packed one so far! After being tipped off by
  an informant we had tracked the gang leader to the Brooklyn Docks, and were
  investigating, when a booby-trapped transit van exploded and nearly killed one
  of our party. After a short gunfight my character hot-wired a boat and we
  could chase the gang members into the river - much bloody fighting and
  vampiric abilities ensured.
  
- I summoned sharks in the Hudson River.

- I also bought my very own set of D10's. Which I think, makes me a real Vampire
  player now.
  
<hr />

- Liz and I went down with the gastro bug that Elliot had last week. So the back
  half of the week was not amazingly pleasant.

- I went to sleep at 5pm Friday evening, and woke up at 9am Saturday. That
  seemed to mitigate most of the worst of it.
  
<hr />

- Church bells in the village were going all morning on Sunday. Turns out today
  is St Vincents day. The patron saint of winemakers and also the saint our
  local church is dedicated too.
  
- I am not a religious man, but I kind of like that there's a patron saint of
  winemakers, and that he's the person our local parish has chosen to honour.
