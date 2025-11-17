---
layout: weeknote
title: A breath of fresh air
slug: 2025-46
date: 2025-11-17T20:00:00+00:00
---

- I found a few hours free this week and did some tinkering. I've been paying
  for a Linux based VPS server for about a year now (maybe 2, I can't remember)
  because at a previous Black Friday the hosting company reduced their fee down
  to £1.20 per month, plus VAT.

  In all the time I've owned it I've used it on and off, for discrete tasks: as a
  place to dump a single page meme, or a file for someone specific to download
  that was too big for email, or to test some PHP for my brother-in-law.

  This week I decided I was going to use it for something "proper" and set up
  [FreshRSS](https://freshrss.org/index.html)!

  It took all of about 10 minutes of tinkering with docker-compose, and another
  10 minutes setting up a
  [reverse-proxy](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/)
  in nginx.

- Of course, I then went down a rabbit-hole trying to get TLS working correctly
  and playing nicely with all my other things I use the domain for.

  I've been meaning to move my domain name away from the original registrar I
  used for a bunch of reasons, so I used this as the momentum, and for the
  first step switched my name servers to CloudFlare's free plan to try and
  avoid downtime when I made the eventual registrar move.

  Turns out CloudFlare's free plan does everything I need it to right now,
  which is excellent, so I maintained [this GitHub Pages
  site](https://github.com/eightbitraptor/eightbitraptor.github.io), and the
  other few things I have, and just set up TSL to the VPS.

  Next step is to actually move registrar, which I haven't yet done.

- But it has been very satisfying to self-host something, and have access to my
  RSS feeds across all my computers, without having to pass around OPML, or pay
  for a SASS solution.

- While I was in and RSS mood. I also modified this site to have an additional
  RSS feed. Previously I had separate feeds for
  [posts](https://www.eightbitraptor.com/posts.xml) and
  [weeknotes](https://www.eightbitraptor.com/weeknotes.xml), but now, in
  addition, there is a [combined feed](https://www.eightbitraptor.com/feed.xml)
  with both.

- You may also have noticed something different about the site! I got fed up of
  staring at the blindingly bright light CSS I had here, and rebuilt it to be
  much similar to the [TokyoNight Neovim
  theme](https://github.com/folke/tokyonight.nvim) (the Moon variant). I love
  this theme. I try and make basically every piece of software I have to use
  eventually converge around this colourscheme.

<hr />

- I bought the OnePlus 15, and the OnePlus Watch 3. I'm still in the process of
  switching, but my initial thoughts are positive.

  Hardware is absolutely lovely, I don't know how they've managed to make a
  matte black finish that is entirely resistant to fingerprints, but I have had
  this for about 2 full days as I publish this, and there is not a mark.

  This is particularly surprising, because I have Eczema, so I'm always using
  various creams and lotions which usually destroy whatever I end up touching.
  I can permanently shine up a set of doubleshot PBT keycaps in a matter of
  days!

  It feels like it's built like a tank, and is blazing fast. Having a
  fingerprint scanner is so much more convenient when you have small kids
  compared to FaceID. Eddie often likes to run off with my phone if I leave it
  somewhere, but now I don't need to worry that he's waved it at me at the
  wrong angle and is now busy deleting my email.

  I'm also really enjoying having a smart watch that actually [looks like a
  watch](https://www.oneplus.com/uk/buy-oneplus-watch-3).

  After all the various pre-order discounts and launch offers, free gifts and
  marketing shenanigans it ended up coming out at £830 all in.

  The Watch is on sale in a BFCM deal right now for £219, so that makes £611,
  for a flagship phone in 2025. Which is a less galling amount of money than
  most of the alternatives.

- Battery life is amazing. I took the phone off charge at 100% at about 10pm on
  Saturday, and I put it on charge for 20 minutes just before midday on Monday.
  And the only reason I did that was because I was about to go for an hour video
  call and I absolutely didn't want it failing on me (it still had 38% left at
  the time).

  I took the Watch off the charger at the same time, and currently as of 9pm
  Monday night the remaining battery percentage is 70%.

- WhatsApp is an absolute shit show. I installed it on the new phone, and
  logged in with my phone number, it showed me a QR code to scan with my old
  phone so I could transfer my messages. But when I tried to scan it from my old
  phone, it had already logged me out!

  I tried to log back in again. But it had obviously already blown away the
  encryption key so all my messages history was gone. But regardless, I tried
  the transfer flow again just to see what would happen, and it turns out you
  can't transfer chats from iOS to Android anyway!

  Thankfully I had already come to terms with losing many years worth of
  WhatsApp messages because it had already deleted my history once a couple of
  months ago, when my phone went in for a screen repair.

  In WhatsApps defense: I genuinely forgot the encryption key to restore from
  backup. But I was not prepared for it to just delete everything without
  warning after a few tries and a few days of exponential back-off.

- Having F-Droid feels like a breath of fresh air. It's got so much better
  since I last used it.

- I've spoken about how I've been using Google Workspace for a long time (about
  19 years, since it was called "Google Apps for your Domain" and was given away
  free in beta), so I wasn't expecting the transition from iOS to Android to be
  that tough.

  Can confirm that being able to delete GMail directly from the notification is
  game-changing. As is having full integration with the Watch.

- I really want this phone to stand the test of time. I hope I'm not disappointed.

- I already miss my AirTags. Research on a suitable replacment is ongoing.

<hr />

- I spent a lot of time thinking about [this article about the ethics of
  consumption](https://terminal.ahumanfuture.co/posts/2025-10-17/the-world-is-something-that-we-make/),
  and it lead me on to the economic theory of
  [Degrowth](https://en.wikipedia.org/wiki/Degrowth).

  I am aware of the irony of writing this after a several weeks of talking
  about purchasing a new phone, instead of paying for another screen
  replacement. Also my [Waterstones](https://www.waterstones.com/) wishlist has
  got a little longer.

