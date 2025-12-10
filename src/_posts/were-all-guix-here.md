---
layout: post
title: We're all Guix here!
date: 2025-12-10T22:55:00+00:00
categories: linux, guix, emacs, tooling
---

[Guix](https://guix.gnu.org/), pronounced "geeks", is a package manager for
Linux systems. Like the [Nix](https://github.com/NixOS/nix) package manager it
provides declarative builds and strives for reproducibility.

Guix isn't a fork of Nix, but they are based upon a lot of the same ideas. That
is, that package management should be functional: If you build software with the
same inputs, in the same environments you should get the same output and it
should be immutable.

Both Guix and Nix are package managers first, but they both provide their own
packaged Linux distributions that one can install from an ISO file in the usual
way. Nix with [NixOS](https://nixos.org/), and Guix has [Guix
System](https://guix.gnu.org/en/download/).

Guix (and Nix) builds all packages in isolation. Dependencies become "inputs",
and the successfully built package becomes an "output". Outputs are stored in a
unique directory inside the Guix store, `/gnu/store` (`/nix/store`) on the
filesystem. The unique name of the package is derived by hashing all the inputs
to that package.

A user on the system can have one or many "profiles", where a Profile is a list
of packages that are visible to the user when the profile is active.

This approach has a few, really compelling, outcomes: 

- Multiple versions of a package can be installed alongside each other. Unlike
  traditional package managers, Guix (and Nix) never modifies the system
  filesystem hierarchy. Packages always live in their unique place in the store,
  so packages with different inputs, such as a different version, or a different
  dependency version, exist in different paths that are isolated from each other.

- We can switch between different profiles for different tasks, such as web
  browsing, compiler development, podcast recording etc. Each profile has a
  clean semantic separation from other profiles on the system and can use
  entirely different software configurations, or different versions of the same
  software. You could even have different desktop environments for different
  tasks if you choose.

- Rollbacks, both of individual packages, and the entire system, are reasonably
  trivial. Each profile has multiple generations. When a software update
  happens, the system builds the new versions of all the packages in question,
  and updates the profile with a new generation, where all the software points
  to the new versions. Rolling back the system just becomes activating the
  previous generation of the profile, which points all the software back to the
  old entries in the Guix store.
  
I hope you can see why I think these are compelling reasons to use a system like
this. But why am I mainly writing about Guix rather than the older, better
supported and significantly more popular Nix?

Guix has a few features that I really like, when compared to Nix. Of which, the
main one is the use of [GNU Guile](https://www.gnu.org/software/guile/), a
dialect of [Scheme](https://www.scheme.org/). Almost everything in Guix is
written in Scheme, including the package and system declarations we write as
users and the Guix system orchestration tooling itself.

If you run Guix System, then you also get its home-grown service manager,
[Shephard](https://shepherding.services/), also written in Scheme (NixOS uses
Systemd), and this is tightly integrated into the core Guix components, the
package and services DSL.

[Shephard services are Scheme
expressions](https://shepherding.services/manual/html_node/Defining-Services.html),
and can be composed, manipulated and abstracted over like any other Scheme
data. 

Conversely NixOS has to integrate with a third party service manager, so all the
Nix language can really provide here is a [generator for the Systemd config
files](https://github.com/NixOS/nixpkgs/blob/nixos-25.11/nixos/modules/system/boot/systemd/user.nix).

For a programmer, especially an Emacs user, who's partial to Lisp dialects, the
ability for all of my systems to be manipulated as data is absolutely game
changing. It means that we can build abstractions over our systems, essentially
turning our entire operating system becomes a giant Scheme library!

A small, trivial example for now, but one thing I chose to do in my Guix config
is, instead of writing out a derivation for each machine I planned to install it
on, I figured that most of my systems would be broadly the same in many ways: I
use the same keyboards everywhere, the same Wayland compositor, the same user is
configured etc.

So I described a Scheme module called `ebr-system-base` that exposes a single
public function `make-base-system`:

```lisp
;; modules/system/ebr-system-base.scm
(define-module (system ebr-system-base)
	       #:use-module (gnu)
	       #:use-module (nongnu packages linux)
	       #:use-module (nongnu system linux-initrd))
           #:exports (make-base-system)
           
(define (make-base-system host-name packages mapped-devices file-systems)
    ;; Rest of base system configuration here
    ;; keyboard layout, users, kernel config, firmware, bootloader etc.
    )
```

That function takes some paramaters as inputs, for the things that really do
change on a system by system basis, things like the system locale, disk UUIDs,
partition maps and hostnames, and it builds _and returns_ the final
`operating-system` form that Guix uses to configure a particular system.

Then for each of my physical hosts, I simply call `make-base-system` with the
arguments that are specific to a particular machine (exactly how I would use a
factory function in any other software) and when I run that file with `guix
system reconfigure`, the function call gets evaluated and the particular
`operating-system` form for that host gets returned and built.

```lisp
;; systems/hitomi.scm
(use-modules (gnu)
	     (system ebr-system-base))

(let* ((host-name "hitomi")
       (packages  (list (specification->package "windowmaker")
	                    (specification->package "kitty")))
       (mapped-devices (list (mapped-device (source (uuid "f1dfd5e8-21fc-477d-a01b-17b447429bb4"))
                                            (target "cryptroot")
                                            (type luks-device-mapping))))
       (file-systems (cons* (file-system (mount-point "/boot/efi")
		                                 (device (uuid "51BB-128C" 'fat32))
                                         (type "vfat"))
                            (file-system (mount-point "/")
                                         (device "/dev/mapper/cryptroot")
		                                 (type "ext4")
		                                 (dependencies mapped-devices)) 
                      %base-file-systems)))

  ;; build the base operating-system form from the procedure in base.
  (make-base-system host-name packages mapped-devices file-systems))
```

Compare this to my equivalent NixOS defintions where, in order to define
multiple systems I've got to first define the system as a
`nixpkgs.lib.nixosSystem`, and then pass it a list of modules to include into
that system.

```nix
# flake.nix
outputs = { self, nixpkgs, nixos-hardware, home-manager, ... }@inputs:
    let
      system = "x86_64-linux";
    in
    {
      nixosConfigurations = {
        fern = nixpkgs.lib.nixosSystem {
          inherit system;

          modules = [
            ./hosts/fern/hardware.nix
            ./modules/nixos/common.nix
            ./hosts/fern/configuration.nix
          ];
         };
       };
    }
```

Each module gets combined together to form the final system derivation and so we
must use various library functions `lib.mkDefault`, `lib.mkForce` and
`lib.mkOverride`, to ensure that the hierarchy of settings gets applied at the
desired level of the config for each system. 

For example, if we defined a default Wayland compositor in `common.nix` but
wanted to override it in `fern/configuration.nix`, then we'd either need to use
`lib.mkDefault` in the common config and `lib.mkOverride` in Ferns config. Or we
could simply `lib.mkForce` in Ferns config.

Both approaches work well, and the Nix approach certainly has its fans, owing to
the relative popularity of Nix. But the approach I used for my Guix config feels
much more natural to my way of thinking, and in my opinion is quite an elegant
way of writing a system configuration.

In contrast I found the Nix Language to be very prescriptive. I've seen it
described as JSON with functions, and whilst I'm not sure whether that was
supposed to be derogatory or not, it sort of fits. It is more than this, of
course. But it's so domain specific that there is almost no flexibility in
what you can do or how you write derivations and compose them. 

What I wrote is by no means a recommended pattern for Guix either. I am very new
to this, and so far, I have not hugely engaged in the community, so I'm figuring
things out for myself based on a goal and my pre-existing Lisp/Scheme knowledge.

I don't want to disparage the Nix system, or environment. My experience with
both NixOS and Guix has been very positive, especially when compared to the more
traditional distros, but finding Guix after spending a couple of months with
NixOS was like an epiphany. I could almost feel my ego dissolving as I became
one with the parentheses!

In conclusion, I'm really enjoying running Guix on my laptop right now. It's
very likely I'm going to move my development workstation over to it entirely
over the winter break. Unless I find any huge deal-breakers in the interim. In
which case I'll likely use NixOS instead.

I also am aware that it's been almost 2 years since my previous non-weeknote
blog post on this site, and [that one was also about config
management](https://www.eightbitraptor.com/2024/02/06/managing-dotfiles-with-mitamae/)
which is a little awkward.

I'll likely write up a progress report shortly on how I got Guix running on my
laptop. Which was not as trivial as it sounds, unfortunately.

Thanks for reading if you got this far. If you're a Linux desktop user, I'd
really encourage you to check out either of these systems, either by layering
the package managers over your existing OS and seeing how you get on - or by
diving in head first and installing the distros. 

They're both great, robust and reliable choices.




