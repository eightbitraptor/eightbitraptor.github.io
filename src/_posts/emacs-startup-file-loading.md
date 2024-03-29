---
layout: post
title: "The Emacs startup process: Init files"
date: 2014-07-21T09:30:00Z
categories: programming emacs
---

I started thinking about this when I arranged a short remote pairing
session to help a friend work through some pain he was having with his
Emacs configuration. The session hasn't happened yet but it got me
interested enough in what Emacs does under the hood when it starts up,
particularly when it loads your config and I though it might make an
interesting blog post.

### The `.emacs` file.

When Emacs starts up it loads your configuration from a file. It looks
for this file in a number of places in your home directory, in order,
these are: `~/.emacs`, `~/.emacs.el` and `~/.emacs.d/init.el`. The
last form is the most common as it allows you to split your
configuration up into multiple files. You can then control when these
are loaded by using `require`, `load` or `autoload` in your
configuration. This keeps your initial Emacs memory footprint quite
small and ensures Emacs is quick to load, and just pulls in extra
libraries and configuration when you need it.

The mode system helps a lot. You'll often see people with files like
`ruby.el`, `python.el` or `scheme.el` in their emacs directories. They
will then put all their specific language related config in there and
with a couple of lines in their main `init.el` they can only require
those files the first time they open a specific file, or start a
specific mode in Emacs

Emacs does not load these its config files sequentially. If it finds a
`~/.emacs` file, it will interpret that file and then it will stop
searching, so you cannot use this mechanism to provide default
overrideable configuration. But it's OK, Emacs has you covered!

### The site-start and default.el files

If you want to provide default Emacs configuration; for instance, if
you're a system administrator and want to set up some friendly
overrideable default configuration for your users; Or you use Emacs on
a bunch of different machines and you want some system specific
variables defined for each machine, and want to keep them out of your
main, shared Emacs config; you'd put that shared config in either
`site-start.el` or `default.el`

These two files need to live somewhere in your Emacs library load
path. They are loaded on startup around your own custom configuration
and which one you use depends on how easy you want to make it for
people to ignore these settings.

The `site-start` file gets loaded **before** your Emacs file, so any
configuration set in here will get overridden by conflicting
information in your config files. For example, you can define some
keyboard shortcuts in here that will be made available to every Emacs
user on the system, but won't clobber anything they've configured to
use the same keys. You can prevent `site-start` from being required,
but because it runs before your config file you have to do it using by
passing the `--no-site-file` argument when you start Emacs.

The `default` file gets loaded after your Emacs configuration, so it
provides a way of clobbering users' custom settings or providing extra
config that they may have forgotten. This is not something you should
rely on however, as it's possible by bypass loading this file.

If you set the variable `inhibit-default-init` to something non-`nil`
in your Emacs config it will prevent `default.el` from being run.

So that's the basics of how Emacs starts and what it loads. You can do
a lot more than just that however and Emacs offers massive levels of
control. So let's take a look at some other things that you might need
to know.

### Customize mode

I've spelt customise with the American spelling in the title for a
reason. At some point in your Emacs journey you'll end up looking at
the Emacs 'Customize mode'. You can get to this by running `M-x
customize` and it provides an excellent interface for configuring
Emacs. Most things that you'll want to do commonly have entries in
Customize mode, and Emacs provides an API for adding Customize mode
compatability to your own Emacs lisp libraries.

By default when you change a setting using the Customize interface it
adds an entry into your `init.el` that looks like the following:

    (custom-set-variables
    ;; custom-set-variables was added by Custom.
    ;; If you edit it by hand, you could mess it up, so be careful.
    ;; Your init file should contain only one such instance.
    ;; If there is more than one, they won't work right.
    '(ansi-color-faces-vector [default bold shadow italic underline bold bold-italic bold]))

As the warning says, you should avoid touching this block by hand and
make sure there is only one such block in your Emacs config. Because
this section feels a little more subject to churn than my standard
`init.el` file and because there are more serious consequences to
breaking it, I like to split it out into its own file, that I can deal
with separately. Emacs provides a variable that you can set called
`custom-file` just for this purpose. By default this value is set to
`nil` which tells Emacs to just use your `init.el`.

    ;; Store emacs customisation system stuff in a seperate file
    (setq custom-file "~/.emacs.d/customisations.el")
    (load custom-file)

Note that both of the above lines are necessary. The first tells Emacs
where your Customize options should be saved, and the second tells
Emacs to load those customisations.

After this change, our current load order looks like this.

1. `site-start.el`
2. `~/.emacs || ~/.emacs.el || ~/.emacs.d/init.el`
3. `~/.emacs.d/customisations.el`
4. `default.el`

### Other variables of note.

1. `user-emacs-directory` - Tell Emacs that you want your config
directory to live somewhere specific. By Default this is set to
`~/.emacs.d/`

2. `package-user-dir` - Tell Emacs where you want ELPA packages
placed. These are packages that you install using Emacs 24's built in
package manager (`M-x package-install`)

I'm sure there are plenty more, but these are some important ones that
I've used recently. `user-emacs-directory` particularly can be helpful
when you want to test or debug changes to your config as you can load
one then the other to spot changes between them.

Don't forget as well that Emacs has an exceptionally in-depth help
system built in. You can search it with `M-x apropros` or find
information about any variable, function of keybinding using `C-h v`,
`C-h f` and `C-h k` respectively. This even works for things defined
in your own Emacs config!

### Byte compiling

Byte compiling your configuration can speed up the loading of your
config, and in fact, any Emacs lisp that you write. This is the
process of turning the source code you write into an intermediary form
that can be read directly by the Lisp interpreter built into Emacs.

After byte compilation has been carried out you will have a `.elc`
file corresponding to every `.el` file that you have compiled. Their
contents will contain stuff that looks like the following:

    (byte-code "\303\304\305\"\211\203 )\306\307!\203 \307\303\207"

When emacs looks for a file to load, it will automatically prefer any
file ending with `elc`. That is, when you `(require 'foo)` If Emacs
finds a file called `foo.elc` before it find `foo.el` while searching
the load path, it will always load it first, even if the compiled
version appears later in the load path.  ### Aside: Emacs &
`load-path`

When we said that Emacs looks in your library load path for the site
specific files, we neglected to mention what that is. By default it
contains only 2 entries: `/usr/local/share/emacs/version/site-lisp`
and `/usr/local/share/emacs/site-lisp` in that order. The order
matters because Emacs will only load the first file that matches what
it's looking for.

You can override the initial value of your load path by setting the
environment variable `EMACSLOADPATH`.

When you are within Emacs you can treat the load path as any other
list, pushing and popping variables off it at will. There are a few
other ways that directories can end up on the load path, but they are
less comonnly used. You can read more about them here:
http://www.gnu.org/software/emacs/manual/html_node/elisp/Library-Search.html

I hope this has been helpful. If you want to dig into this further
there are some excellent resources online, particularly the Emacs
manual, which you can access using `C-h r` from within Emacs or on the
web [at the GNU Emacs
homepage](http://www.gnu.org/software/emacs/manual)
