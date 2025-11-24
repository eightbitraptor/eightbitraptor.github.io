---
layout: weeknote
title: I wrote it in Rust
slug: 2025-47
date: 2025-11-24T16:29:08+00:00
---

- I decided that instead of replacing my AirTags I'm just going to keep using
  them. My old iPhone is staying in the household anyway so my kids can do [Times
  Table Rock Stars](https://ttrockstars.com/) when we're out and about, so I'll just leave it signed into my
  Apple account and use that.

  Hopefully, I'll need to actually use them infrequently enough that it'll not
  be a big burden to find the phone each time. And also hopefully by the time
  this iPhone actually dies, the industry will have sorted out an alternative
  that mostly does what I want it to.

- In further phone related teething issues, I went to the shop on evening last
  week for some essentials, and it wasn't until I'd got all the way to the
  checkout that I realised I'd left the house without my wallet, as I often do,
  but that I hadn't actually set up any cards on Google Wallet yet. So I was left
  at the checkout, with a basket full of shopping and no means of paying, which
  was incredibly embarrassing.

<hr />

- I found some time to write some code this weekend, so I [scratched an itch
  that's been bothering me for a
  while](https://github.com/eightbitraptor/rccgen). I work on the CRuby
  interpreter a fair bit, and the codebase is a large, old, sprawling,
  Autotools/Make based behemoth.

  I want to use clangd as an LSP server so I can get all the nice navigation
  and auto-completion, and code actions goodness. But clangd requires a json
  file telling it what compiler flags are needed for each source unit, so it
  can successfully build the code enough to introspect it.

  Unfortunately for me, CMake is currently the only build system that supports
  generating these compile database files currently, so the rest of us are left
  having to use third party tools.

  For ages I've been relying on a shell script that glues together two such
  tools, [bear](https://github.com/rizsotto/Bear), and
  [compdb](https://github.com/sarcasm/compdb), into my Make workflow, but this
  project is my attempt at replacing that with a small binary that does what I
  need.

  Of course, I wrote it in Rust.

<hr />

- Went out with the family this weekend to have some Christmas family photos
  taken. I am not used to wearing a shirt and it was very uncomfortable. Getting
  the pictures done was a surprising amount of fun though. I look like a dried up
  old dog turd wearing a jumper, but the rest of the family are going to look
  great, I can't wait for the results.

<hr />

- I would like to officially record the first instance of actual brainrot
  entering my household. I am pleased we've made it this far, but it's no good: I
  am very very bored of the [number 67](https://en.wikipedia.org/wiki/6-7_(meme)).

<hr />

- 日本語の語彙を上達させたいと思って、週記に少し日本語を書くことにしました。何について書くかまだ決めていませんが、小さく始めましょう。


