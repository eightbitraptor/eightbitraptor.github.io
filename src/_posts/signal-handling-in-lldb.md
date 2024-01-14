---
layout: post
title: "Signal handling in LLDB"
date: 2022-06-16T20:00:46+01:00
showtoc: false
draft: false
categories: debugging C
---

I don't normally worry about signal handling in lldb. I don't often work on
codebases that do significant work with them, and so if a signal is raised then
it's a rare enough occurence that the lldb breaking on it seems like a sane
default.

However, very occasionally I end up in the situation where I have to debug code
that raises a lot of signals that I know I don't have to care about.

In this case it's useful to be able to tell lldb what to do (or not do) with
them.

By default running `process handle` will give you a list of all the available
signals and some default actions:

```
(lldb) process handle
NAME         PASS   STOP   NOTIFY
===========  =====  =====  ======
SIGHUP       true   true   true
SIGINT       false  true   true
SIGQUIT      true   true   true
SIGILL       true   true   true
...
```

In this output `PASS` means to pass it through to the underlying process,
`STOP` indicates whether lldb should break on that signal and `NOTIFY` allows
us to configure whether we'll be told about any signals raised.

We can configure these values.

```
(lldb) process handle -p true -s false -n true SIGINT
```

This tells lldb to notify us (`-n true`) when a SIGINT is raised, and then pass
it through the process (`-p true`), but don't stop the debugger (`-s false`).

I don't know what I'm going to do with all the time I've saved now I don't have
to continually press c to continue!
