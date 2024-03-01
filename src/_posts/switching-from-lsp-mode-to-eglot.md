---
layout: post
title: "Switching to Eglot"
date: 2024-03-01T08:30:46+01:00
categories: ruby c tooling emacs
---

I spent a little time lately migrating my Emacs language server configuration
from `lsp-mode` to `eglot` and I want to spend a little bit of time talking
about the how's and why's.

I've always had a love/hate relationship with language servers. And this may be
entirely down to my lack of experience with Visual Studio Code - I know that
language servers are considered to be a first class citizen of the VSCode
ecosystem.

I don't find that I want or use the majority of features they seem to provide,
at least in the languages that I use daily, but I do have a set of workflow
requirements that are absolutely non-negotiable for me. They are:

* **Code completion**: I want context sensitive code completion everywhere in my
  projects. Preferably also with function signature documentation, so I don't
  have to remember what types everything takes.

* **Code navigation**: I need to be able to jump to definition, and jump to
  declaration, I also need to be able to find all references of an
  indentifier. And I also really need to be able to fuzzy search a project for
  an identifier quickly.

  Finding all references is an interesting one - I never knew how to do this
  with my old ctags based workflow, so I used to liberally use `git grep`. But
  VSCode implements this feature with lsp backed languages using a beautiful
  preview window/overlay thing and I really liked the look of it. When I got it
  working, sure enough, it is absolutely essential for me now.

Other features I can take or leave: Documentation is nice, providing I can make
it display in a way that doesn't completely alter the layout of my editor (by
popping open another split or buffer somewhere); Code formatting and linting is
fine, but I don't really use it all that much on the projects I work on, and
Emacs is smart enough that I can mostly trust it to do the right thing when
configured anyway.

## LSP mode

Enter [lsp-mode for Emacs](), a major mode that provides lsp-support
