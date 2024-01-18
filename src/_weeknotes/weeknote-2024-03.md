---
layout: weeknote
title:
slug: 2024-03
date: 2024-01-15T12:34:03+00:00
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
  
<hr />

- I submitted a response to the CFP for RubyKaigi 2024. I am exceptionally
  excited for Okinawa in May

- I've already started a Google Maps list of places I'd like to check out if I'm
  there.
  
- It's mostly bars.

- Justin Searls makes a good case why you should try and go to Kaigi if you
  haven't been before.
  
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
  confrontation when my memory card corrupted itself and I lost everything. I
  have been back many times since but never had the staying power for it. I'd
  like to finally finish it.
  
- Lets hope Nintendo's cloud save is worth it, eh.

- The Switch version is nice. I like that they've used the PC version textures
  so it doesn't have the vaseline smear of the original playstation graphics.
  
- The 3X speed mode makes grinding out that Chocobo breeding part (for the
  Knights of the Round materia) a lot more bearable.

<hr />
