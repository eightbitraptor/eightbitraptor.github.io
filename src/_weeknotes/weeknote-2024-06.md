---
layout: weeknote
title: Un-stirrable coffee
slug: 2024-06
date: 2024-02-11T20:00:58+00:00
---

- I finished the Prism `eval` work! And [the PR went up on
  Monday!](https://github.com/ruby/ruby/pull/9835). I did spend a non-trivial
  chunk of this week finding and debugging problems in it. It turns out that
  `eval` is used *a lot* in the CRuby test suites.

  Still, there are two outstanding blockers that are preventing us merging
  this: [One is a bug that I found thanks to this eval
  work](https://github.com/ruby/prism/issues/2388). And the other is a difference
  in the way syntax errors are being reported between Prism and `parse.y`. 

  Prism produces, in my opinion, much clearer and more helpful error messages 
  than Ruby has traditionally had. But unfortunately, this breaks a lot of tests 
  which are regex matching on Exception messages.  

<hr />

- Now that the Prism eval work is wrapping up I'm moving back to work on
  building modular GC in Ruby.

  In doing so I've been digging back through all the old material and branches,
  and meeting notes about the project from before I moved away from it last
  year.

- I'm still so proud of this talk I gave at RubyKaigi 2023, even though I did
  mis-pronounce chart as shart at least once!

  <iframe width="560" height="315"
    src="https://www.youtube.com/embed/chhNDhyPbyc?si=waQPNpwZv_2D3ElK"
    title="YouTube video player" frameborder="0" 
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen>
  </iframe>

- This was only the second time I'd ever given a conference talk in person -
  the only talks I'd done before this allowed me to submit a video, so they
  were very heavily edited, re-recorded and cut together to get the best take.

<hr />

- In non-work news: I finally finished Final Fantasy VII. Take that nerds.

  I did VIII fairly recently and I was going to move on to replay IX or X, 
  but I think I'm done with Final Fantasy for the forseeable future.
 
  I fancy something without quite such a drawn out elaborate story so I'm
  going back to "Monster Hunter: Rise" for a while.

<hr />

- I started writing here about how I rebuilt and managed my dev machine, but I
  wrote so much that I [turned it into a blog post
  instead](/2024/02/06/managing-dotfiles-with-mitamae/).

  Hooray, The system is working.

- While I was writing the blog post, I noticed that I use the word "anyway" far
  too much. Here begins my moratorium on "anyway".

<hr />

- Tuesday night at about 23:30 we had a massive powercut. We went to bed not
  really worrying about it, assuming the power would be back on in the morning.
  
  It was not.

  And the kids, who had woken up at 04:00 super freaked out that the
  nightlights weren't working, did not go back to sleep.

  We ended up being without power for about 18 hours, while UKPN diagnosed the
  issue and replaced a damaged supply cable (which had apparently "showed signs
  of squirrel damage")).

  All throughout, UKPN were an absolute pleasure to deal with. Empathic, quick
  and professional when it came to finding out the latest information for us.
  They also put us on a high priority queue for having a child under 5 at home.

- I will now stop procrastinating and just buy a UPS. So if you have any good
  recommendations for a reliable, consumer grade UPS that's capable of powering
  2 desktop PC's long enough for me to shut them down - please hit
  me up, either on the email address at the bottom of this page, or on
  [Mastodon](https://ruby.social/@eightbitraptor)

- I also vehemently dislike working at coffee shops

<hr />

- In 2022, Shopify gave me an Ember Mug as a Christmas gift. I was sceptical
  at first, but it turned out to actually be a genuinely useful product. Even
  if SV tech bros managed to invent the [worlds first coffee mug you can't use
  a teaspoon
  in](https://support.ember.com/hc/en-us/articles/115002624452-Ember-Mug-Care-and-Maintenance).

  I tried to give the Ember/HealthKit integration a proper go for the first time this week, so I
  could track my caffeine intake. But the integration has no concept of hot
  drinks that aren't caffeinated Tea of Coffee. The workflow for using this
  thing to track both caffeinated and non-caffeinated drinks turns out to be
  annoying and full of friction.

  I appreciate that this is the first-worldiest of first-world problems. I'm a
  little embarrassed at even mentioning it. 

  But I can't tell if it's just bad UX, or was a deliberate design decision,
  and it just annoyed me more than it should.

  I turned it off again an hour later.

<hr />

- Continuing with the Apple Health theme, I noticed that it can now tell me
  about how much time I spend outside.

- I also noticed that my rolling average recently is about 15 minutes per day,
  which made me feel not good about myself. So I've been trying to get out for
  more walks during the day. And obviously I've been taking my camera with me.

<a href='https://500px.com/photo/1085251453/garrington-by-matt-valentine-house' alt='Garrington by Matt Valentine-House on 500px.com'>
  <img src='https://drscdn.500px.org/photo/1085251453/q%3D80_m%3D600/v2?sig=ed0cc218fa19b70376a6ea5f94e2db102ceab17a8d04009683c3878928f54084' alt='Garrington by Matt Valentine-House on 500px.com' />
</a>

- There isn't much going on around the villages, but I've had a couple of shots
  I'm happy with so far. And they have inspired me to want to get out more, so
  that's a good thing.
