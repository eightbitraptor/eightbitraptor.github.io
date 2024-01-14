---
layout: post
title: "Migrating to Hugo"
date: 2018-12-17T19:30:22Z
categories: meta hugo jekyll
---

I originally started my first personal site and blog in 2009 on the now defunct
domain `theshadowaspect.com` (NSFW: I didn't link this as it's been taken over
by a domain squatter who's hosting porn). It didn't take me long to decide that
I really wasn't a fan of the name and so in January 2010 I registered
`eightbitraptor.com` where I've been ever since.

<!--more-->

I've been through a bunch of hosting methods and various codebases
since I started. from most of the common CMS's on various cheap shared
hosting solutions to some custom applications in Rails, Django and
Sinatra on Heroku, mostly as learning experiences. Since 2017 I've
been using Jekyll and Github pages.

Jekyll's nice and all, but me and Jekyll never really clicked. So as
of now I'm moving this site over to [Hugo](https://gohugo.io/) a
static site generator built in Go.

As part of this move I've been reading and re-evealuating the content
from the old site and I've decided that **I won't be moving most of
the old posts from the Jekyll site to the new Hugo
incarnation**.

There was previous little useful content there anyway, most of the
older posts had serious presentation and formatting issues from being
migrated so many times in the past and the content was mostly just so
old as to be out of date anyway. The few that I still think might be
useful to someone will start to appear here over the next few weeks as
I clean them up and get them published.

Anyway, let's talk about Hugo. I've only had a couple of hours with it
so far but it has a couple of things that I immediately like:

## Themes are installed in directories in your site

Jekyll now recommends having your themes as a separate Ruby Gem and
using your Gemfile to manage them, which is much better than the
common way of using themes when I started with Jekyll, which was to
clone/fork the theme directly and start adding your posts and content
straight into it!

Hugo gives you a `themes` directory, and tells you to put your theme
in that directory and tell your `config.toml` which one you want to
use. I like this approach. Separating of theme and content makes
tweaking your design or changing your theme a much simpler process,
but you also don't have the complexity of managing multiple projects
and a programming languages packaging infrastructure.

I'm using someone else's theme, and the way I am managing this is to
fork the original author's repository, and install it into my Hugo
repository as a Git Submodule. That way I can manage the version I am
using, make changes when I want to without having to re-deploy my
site, and contribute code back upstream.

## I can treat Hugo like a black box

Related to the previous point, as well as not having to care about
Gem's and Bundler. I haven't felt with Hugo that I have to care about
programming. This might seem like an odd thing to hear coming from a
professional programmer, but I've got enough Yak's to shave as it is
without having to spend time tweaking/fixing/extending my static site
when I don't have to.

I always felt with Jekyll that I had to write a lot of Ruby in order
to do what I wanted to do, in addition to knowing how Ruby's packaging
ecosystem worked.

I'm perfectly willing to accept that this may have
been just because I'm doing it wrong and didn't really ever invest the
time into learning Jekyll properly. And this is true - I'd much rather
be spending my time writing, and working on the things I'm writing
about, rather than the thing that allows me to put those words on the
internet!

On to Hugo. And I'm aware it's been written in Go, apparently. I have
built this website in it without having to care about what it's
written in or interact with any sort of Go paraphernalia at all. I
installed a binary on my system and went to work! That's pretty cool.

## It's fast

The website likes to bang on about this, so I'm not going to. Except
to say that it's definitely a bit quick.

Overall, after a couple of hours, I'm enjoying Hugo, quite a lot. If
you're looking for a static site generator then I'd seriously
encourage you to take a quick peek.
