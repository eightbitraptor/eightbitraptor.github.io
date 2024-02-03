---
layout: weeknote
title: 842Gb tarball
slug: 2024-05
date: 2024-01-30T17:21:02+00:00
---

- I'm tired.

- Shopify's 35'th "Hack Days" was this week from Wednesday to Friday.

- I hacked on supporting `eval` in the Ruby Prism compiler. Currently, when you
  run Ruby with `--parser=prism` your code will be parsed and compiled with
  Prism. This will leave you with a set of Instructions sequences.

  When one of those instruction sequences contains a call to `eval`. It will be
  represented the same as any other method call in Ruby. that is a call to the
  `send` instruction (or `opt_send_without_block` in it's optimised form):

  ```
  0003 opt_send_without_block   <calldata!mid:eval, argc:1, FCALL|ARGS_SIMPLE>
  ```

  When that instruction is executed by the VM, and method lookup has
  ascertained which `eval` method to call, the chances are its going to end up
  in `rb_f_eval` inside `vm_eval.c`. And this method will initialise it's own
  Ruby parser instance to parse and compile the contents of the string being
  evaluated.

- The trick here is that the parser instance being created, needs to know about
  locals and bindings defined in the code that is currently being executed, so
  that it can make sure that local access is accessing the correct parts of the
  stack.  It's perfectly valid to do this:

  ```ruby
  a = :ok
  eval("p a") #=> prints ok
  ```

  and this:

  ```ruby
  [:a].each do |ap|
    [:b].each do |bp|
      cp = :c
      eval("p ap; p bp; p cp")
    end
  end
  ```

  At which point, we've got 3 frames to walk through and set up locals for.

- But, as I'm sure you're aware, we can also pass bindings from other contexts
  using `Kernel#binding` to get the current set of bindings, so now code
  executed in one context can access locals from another. Like this

  ```ruby
  def eval_with_binding(b)
    eval("p foo", b)
  end

  def make_foo
    foo = :ok
    eval_with_binding(binding)
  end

  make_foo
  ```

- Suffice to say that this is all rather complex. Prism has been engineered
  with a way of manually building up a set of scopes as a series of arrays that
  are attached to the parser options, and then these parser scopes should be
  used to set up the local tables and the scope depths in the parse tree to
  allow the instruction sequence to be built correctly. But I think I was the
  first person to be using this feature in anger. Previous uses of Prism have
  generally assumed that we've parsed all the code that we need to care about,
  and that is that.

- I didn't finish.

  By Friday evening I had a basic context free `eval` working, and I had the
  default binding set up and the scopes building in such a way that accessing a
  variable defined outside the eval would be successful, but the variable's
  value would always be reported as `nil`.

- I current hunch is that I've managed to introduce all the locals required
  into the local index of the `eval`'d code. But without the correct depth's.
  So Ruby's finding the variable in the local index table, and going to look it
  up in the indexed place in the local table, but is looking in the wrong local
  table, because it doesn't know it has to look further up the ISEQ chain.

- I'm going to fix this. I'd like to land a PR next week.


<hr />

- I've been rewatching old anime OVA's from the 80's and 90's. I have very fond
  memories of my formative years spent watching some really weird stuff late at
  night on [Channel 4's "4 Later" programming
  block](https://www.geek-pride.co.uk/insomnia-channel-4-the-90s-and-an-introduction-to-anime/).
  So I figured it was time to revisit some old classics and catch up on some of
  the shows that I wanted to see but didn't.

- In some Googling I also found [this amazing YouTube
  documentary](https://www.youtube.com/watch?v=xfa57_1HUjo) about the history
  of Manga Entertainment in the UK, and how one of the really seminal OVA's
  that really introduced my generation to anime, [Cyber City
  Oedo](https://en.wikipedia.org/wiki/Cyber_City_Oedo_808), made it from what
  was back then a pretty obscure animation studio
  ([MadHouse](https://www.imdb.com/title/tt0877057/), if you're wondering) to
  being internationalised and show on British broadcast TV.  Really worth a
  watch if you're remotely interested in anime.

- 90s OVA's are some of the best that anime has to offer, in my humble opinion.
  Free from the constraints of having to produce either a movie that was
  expected to make profit at the box office, or a long running broadcast TV
  series, that has to try and optimise for ratings, OVA's were always free to
  just do so much more weird and experimental shit than anything before. Or
  arguably since.

- [Devilman](https://myanimelist.net/anime/2354/Devilman__Tanjou-hen),
  [Guyver](https://myanimelist.net/anime/6016/Kyoushoku_Soukou_Guyver_1989),
  [The Rurouni Kenshin prequel
  OVA](https://myanimelist.net/anime/44/Rurouni_Kenshin__Meiji_Kenkaku_Romantan_-_Tsuioku-hen),
  [FLCL](https://myanimelist.net/anime/227/FLCL), [Read Or
  Die](https://myanimelist.net/anime/208/ROD__Read_or_Die). The list goes on.

- Of course, some of them are
  [just](https://www.animenewsnetwork.com/encyclopedia/anime.php?id=581)
  [complete](https://myanimelist.net/anime/2775/Genocyber)
  [shit](https://www.animenewsnetwork.com/encyclopedia/anime.php?id=791). But
  them's the rubs.

<hr />

- Managed to get out for a couple of walks this weekend to get some practice
  with the camera. Both times the kids also wanted to come and take their
  cameras out too, which was really fun.

- We did a short walk around the village, partacularly the Church yard near us,
  and ended up at one of our favourite local cafes.

- We also drove to a woodland area the other side of Canterbury and spent
  Sunday morning exploring through the woods. I love doing stuff like this, and
  the sun being (mostly) out, and the temperature being not too cold is a nice
  reminder that spring and summer are on their way.

- It felt really good to get some practice in. I shot some nice shots of the
  area generally as well as the kids specifically. I haven't had a chance to
  pull them into Darktable yet though.

- Still not sure what I'm going to do with my photos when I've got some I'm
  happy with. I've thought about getting photobooks made for specific events,
  like holidays and stuff. But I'd like somewhere more generally to host some
  that's not just Instagram or Facebook.

- What does everyone use now that Flickr is a bit shit?

- Also, [Tiffin](https://en.wikipedia.org/wiki/Tiffin_(confectionery)) is one
  of the greatest sweets.

<hr />

- I could do with rebuilding my Desktop workstation. Currently I have a 1TB
  nVMe SSD for the OS's to live on, and a 2TB spinny metal data drive. I didn't
  really know what I wanted to do with this machine properly when I originally
  built it so I decided to hedge my bets. the OS drive is pretty much 50/50
  Windows/Linux, and the data drive is NTFS for better compatability.

- As it turns out I don't need the Windows partition all that much. I barely
  boot into it. And when I do it always requires gigs and gigs of updates
  before I can do anything. 

- I thought I'd be a bit more of a gamer than I am, but it turns out that I
  don't have a lot of time for gaming these days anyway, and when I can squeeze
  10 minutes in, it's either on the Switch, or it's retro/indie/emulation stuff
  on Linux anyway.

- I'm doing almost all of my Ruby work on Fedora now anyway, seeing as its OSS.
  I use my work mac occasionally, when it's unavoidable.

- The other thing I wanted Windows for was for Fusion 360, a software ecosystem
  that I'm actively trying to move away from!

- I wrote on Mastodon last week [that I'm grateful for all the good FOSS
  software](https://ruby.social/@eightbitraptor/111790030972238432) that
  exists, particularly for niche interests, and I really stand by that.

- Ultimately, I might leave a small Windows partition, seeing as I own the
  license. But Fedora will be a much bigger part of my life going forward.

- However. It turns out that before I can rebuild my machine I need to get the
  data off it and onto the NAS. 

- Which inevitibly means I finally need to stop putting off the yak shave of
  sorting out the NAS.

- So here I am on Sunday night, trying to create and push around an 842Gb
  tarball of some old archive university work that I don't want to lose. Said
  tarball took nearly 10 hours to create, and is estimated to take 2 to push up
  over my crappy 1GB ethernet. 
