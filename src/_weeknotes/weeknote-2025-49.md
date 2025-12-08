---
layout: weeknote
title: Nasty chemical water
slug: 2025-49
date: 2025-12-08T20:00:00+00:00
---

- Busy week of Christmas and end of school shenanigans which has kept us on our
  toes. P sang in Canterbury Cathedral twice this week, so I've spent way more
  time in Canterbury than I have done recetly, waiting around for her in
  rehearsals, and then again in the Cathedral watching her sing. She's done
  great both times and I'm dead proud.
  
- Because of the rehearsal times, I found myself in town on my own with 90
  minutes to kill on what would have been my Dad's birthday, if he hadn't passed
  away 5 years ago. So to mark the occasion I found a quiet pub, had a pint of
  his favourite beer, and watched the world go by for a bit. It was a fairly
  peaceful, reflective time, and I enjoyed it.
  
  Dad had shit taste in beer though. I still don't understand how anyone can
  drink UK pub Stella. Bloody nasty chemical water.
  
- On top of the Cathedral trips, we've had 2 school Christmas parties to deal
  with, and a school trip. Fitting anything else in has been a push.
  
---

- My NixOS experiments have been going reasonably well. I'm pretty sold on the
  Nix style declarative, reproducible approach as a concept. It feels like what
  I've been trying to acheive over the years with various iterations of Puppet,
  Chef, Ansible and Mitamae, but done properly.
  
  And, once the initial install and configuring is done, using NixOS on my
  laptop day to day has been broadly indistinguishable from any other modern
  Linux distro in the last 5 years, for better or worse. 
  
  Now that the mainstream has mostly standardised around Systemd and related
  technologies the choice of distro basically comes down to what colour desktop
  you want, and what package manager you like. So once I've got everytihng set
  up with my preferred user-space settings I could be running Arch, Fedora, or
  Debian for all the difference it makes.
  
  That being said. I am _really_ not enjoying the Nix language. It's terse,
  obtuse and doesn't have good documentation. I can't tell if it's supposed to
  be a proper language or a DSL, and debugging when things go wrong is really
  hard.
  
- So in a VM I have been exploring [Guix](https://guix.gnu.org/), via the Guix
  System Distribution. A NixOS like OS that uses [Guile
  Scheme](https://www.gnu.org/software/guile/) for it's configuration.
  
  Because Guix is a GNU project it only contains FLOSS software and uses the
  Linux-libre kernel out of the box. My Thinkpad is from 2018 and runs an
  i7-8550u, so if I want to run Guix on it I'm going to need the kernel firmware
  and the Intel CPU microcode updates so I've set it up with the [Nonguix
  channel](https://gitlab.com/nonguix/nonguix), which contains various non-free
  software derivations for Guix. 
  
  Nonguix contains the full linux kernel, firmware and CPU microcode like any
  other distro, but also derivations for popular software like Steam, GoG,
  Firefox and others.
  
  So far, I like it a lot. I'm a little unsure about moving wholesale to it
  because I'm very used to Systemd based distributions and I don't really know
  much about [GNU Shephard](https://shepherding.services/), the service manager
  that Guix uses.
  
  I generally don't care that much about my service manager, it's not often I
  need to do anything with it other than start, stop or restart 'the occasional
  service, so it could be that the switch is entrely uneventful. But I had some
  issues the last time I tried to daily drive [Void
  Linux](https://voidlinux.org/) with [runit](https://smarden.org/runit/),
  [turnstile](https://github.com/chimera-linux/turnstile) and
  [D-Bus](https://www.freedesktop.org/wiki/Software/dbus/) that I'm nervous of
  new (to me) service managers at this point.
  
  Guix very much feels like an OS for Emacs hackers to me, which I do enjoy.
  
  I shall continue experimenting with it, and taking notes. And maybe, if I
  actually end up switching over, I'll write about it in a blog, not a weeknote.
  
- I have been kicking the tyres of [Windowmaker](https://www.windowmaker.org/)
  in my Guix VM, because why not?  I never used Windowmaker back in the day. I
  was a heavy [Fluxbox](https://fluxbox.org/screenshots/) user. So it's been fun
  to go back to some of the old 90's Xorg design paradigms and use them again.
  
  I can't decide whether I'm going to stick with it yet, or if I'm spoiled by
  modern "pretty" interfaces, but it sure is nice to have a desktop that runs in
  7Mb of memory and reacts as fast as I can type.
  
  My Sway config is no slouch, but even so, Windowmaker has me thinking hard
  about some of my choices.

- After I wrote last week about wanting to move away from Github and set up my
  own Git server. Almost as soon as I closed my editor and pushed the post
  public I got a bee in my bonnet about Git hosting and found
  [ForgeJo](https://forgejo.org/), which I am now running on a Docker container
  on my VPS. It took me all of 45 minutes to set up! I haven't migrated much
  over yet. But the inertia, such that it was, has been broken.
  
  So going forward I'm going to start culling things from my GitHub
  account. I'll keep the private stuff on the instance I run inside my LAN, and
  move the public stuff over to
  [git.eightbitraptor.com](https://git.eightbitraptor.com).
