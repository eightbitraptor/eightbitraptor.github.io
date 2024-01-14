---
layout: weeknote
title: "Sweat the small stuff"
slug: 2021-08
date: 2021-03-01T13:28:23Z
---

* Not much to report again this week. Still waiting on keyboard PCB's so no
  change on that front.

* Did knock up a quick 3d print case design loosely based on the old IBM F62
  Kishsaver design. haven't finished printing and assembling it yet so no pics
  for now; I don't want to ruin the surprise.

* After a bit of an abortive start last time. I started to run again.  I've
  scaled back a bit and been a bit more thoughtful about the process. I've
  calendared in 3 runs a week, on Monday, Wednesday, and Friday, with a tentative
  cycle ride on Sunday.  I'm also running a much shorter distance to start with
  and am alternating periods of running and walking so that I can build up my
  ability slowly (in the same vein as couch to 5k). I'm already seeing some
  improvements after just a week which I'm super happy about.

* I have a problem with detail. This reared it's head again this week when I
  spent almost 3 days debugging a problem that ended up being caused by my use
  of the wrong bitmap during one of the mark functions (for the curious: in
  Rubys GC, `HEAP_MARK_BITS` are not the same as `HEAP_MARKING_BITS`).

  Predictably as soon as I asked for help and paired on this problem we spotted
  it within 20 minutes and I felt like an idiot.

  After feeling (rightly, imo) angry about the confusing and slightly
  disingenuous naming patterns in the MRI source code, I pushed that thought
  away and realised that this was just another instance of a pattern of
  behaviour that has haunted me for years.

  I can be detail blind, and I don't know what to do to fix it.

  Within a work context this often manifests in one of two main ways:

  * I finish a feature, push a PR and then spend days fixing feedback from my
    colleagues in the form of small changes that often seem like nitpicks. A
    misleading variable name here, a typo there, a slightly obtuse algorithm in
    that other place. Or
  * Upon discovering a bug, I go down a rabbit hole for a long time, exploring
    the problem, checking the algorithms and high level approach, making sure
    that the test cases are thorough only to discover that the bug was caused
    either by a typo, or by a trivial mistake that in hindsight should have
    been obvious.

  I know I have a tendancy to zoom out and focus on slightly higher level
  concerns. When I'm building a feature I focus on whether the approach makes
  sense, whether I'm using appropriate patterns and data structures, or whether
  the object graph makes sense, so much so that I lose sight of the smaller
  detail. This seems to get more acute the higher mental pressure the work has,
  so whetherI am fixing a problem in my code? someone elses code? refactoring a
  feature or building a new feature (probably in that order, high to low).

  Anyway. I haven't worked out what to do about this yet and it sucks because
  it's embarrassing and it's holding me back.

  But the first step to fixing a problem is admitting you have one, right?

* I updated [my User Manual](/docs/mattvh-user-manual.pdf).

  I've been keeping this up to date as I move between jobs and as I learn more
  about myself since I was working at FutureLearn. I don't think I've ever
  shared it publicly before, but seeing as this week is a slow news week I may
  as well!
