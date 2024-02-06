---
layout: post
title: "Managing dotfiles with Mitamae"
date: 2024-02-06T08:30:46+01:00
categories: ruby tooling
---

I [wrote in my weeknotes
recently](http://localhost:4000/weeknotes/2024-05/842gb-tarball/) that I wanted
to rebuild my dev machine. 

I got around to doing it last weekend. I reduced my Windows partition down to
200Gb for emergencies, gave Fedora 39 the remaining ~750Gb, reformatted my 2Gb
data drive as ext4 and gave it a permanent `fstab` entry.

<img src="/images/workstation.jpg" width="500px" alt="My AMD Ryzen based Fedora
development workstation"/>

Fedora 39 is really nice out of the box. It only took me about an hour in total
to get everything installed and comfortable and working as I like; with a
working development environment for writing Ruby, as well as working on the
Ruby VM, my photography workflow, AV stuff and enough settings for my general
day to day comfort.

This machine was already running the latest version of [Fedora Workstation
(39)](https://fedoraproject.org/workstation/download), but it had been upgraded
from Fedora 34. This is my first desktop machine in well over a decade (I had
an Athlon 64 X2 workstation I had built, running Arch - I think I sold it in or
around 2010 when we moved house and I went laptop only), so I'd spent a bunch
of time experimenting with how I wanted everything to behave. 

Doing this meant I'd accumulated a lot of crap, experimenting with Desktop
environments and workflows and the like, so it was harder to see what was
actually new in 39.

Gnome 45 is really slick. I like it a lot. 

One of the reasons setting up was so quick is because I have a [dotfiles
repo](https://github.com/eightbitraptor/dotfiles-mitamae). It uses
[Mitamae](https://github.com/itamae-kitchen/mitamae), which is a lightweight
implementation of [Itamae](https://itamae.kitchen/) built using
[mRuby](https://mruby.org/).

Itamae itself is a lightweight config management tool inspired by
[Chef](https://github.com/chef/chef).

Mitamae is really nice for implementing config management on a few machines,
where you have access to each machine and want to just run an install script
locally. I use it for my Desktop, my personal Laptop, and in a limited fashion,
on my work Macbook Pro.

The recipes are written in mRuby compatible Ruby. So they're very familiar.
For example, setting up my dotfiles for the [Sway wayland
compositor](https://swaywm.org/) looks like this:

```ruby
dotfiles = {
  ".config/sway/swayexit" => "sway/swayexit",
  ".config/sway/status.sh" => "sway/status.#{node.hostname}.sh",
  ".config/waybar/style.css" => "waybar/style.css",
  ".config/waybar/modules/battery.py" => "waybar/battery.py",
  ".config/xdg-desktop-portal/portals.conf" => "xdg/portals.conf"
}

dotfile_template ".config/sway/config" do
  source "sway/config.erb"
  variables(
    monitor_config: node.mconfig
  )
end

dotfile dotfiles
```

This looks superficially very similar to the Chef DSL, but in reality is a lot
more constrained, which feels like a really good thing.

Mitamae still allows you to do custom stuff if you want to. For instance, both
the `dotfile_template` and the `dotfile` resources are actually a custom
definition defined inside my repo. `dotfile_template` looks like this:

```ruby
define :dotfile_template, source: nil, variables: {} do
  template_path = "#{node.home_dir}/#{params[:name]}"
  template_root = File.dirname(template_path)

  directory template_root do
    user node[:user]
  end

  template template_path do
    action :create
    owner node.user
    group node.user
    source "#{TEMPLATES_DIR}/#{params[:source]}"
    variables(**params[:variables])
  end
end
```

As you can see this is just some syntactic sugar around the built-in `template`
resource, but you can do more than this too.

And `dotfile` wraps the `directory` and `link` resources to set up symlinks in
the correct place on the filesystem to the appropriate configs inside the
dotfiles repo.

```ruby
define :dotfile, source: nil, owner: node[:user] do
  links = if params[:name].is_a?(String)
    { params[:name] => params[:source] }
  else
    params[:name]
  end

  links.each do |to, from|
    destination = File.expand_path(to, node[:home_dir])
    dest_dir    = File.dirname(destination)
    source      = File.expand_path(from, FILES_DIR)

    directory dest_dir do
      user node[:user]
    end

    link destination do
      to source
      user params[:owner]
      force true
    end
  end
end
```

The customisation of resources like this allows you to make some cute design
decisions too - for instance the `dotfile` resource can either be called with a
hash of mappings as in the above example. But if the first argument is a
String, then it will work in exactly the same way as any other resource and let
us define the arguments manually. Like this example, where I'm overriding part
of the Pipewire audo config:

```ruby
dotfile pipewire_pulse_config_home + "/pipewire-pulse.conf" do
  source "mopidy/pipewire-pulse.conf"
end
```

I've used many different variations of "dotfiles" repos over the years, from
custom install scripts, to simple tools like [GNU
Stow](https://www.gnu.org/software/stow/), all the way up to fully fledged
config management systems like
[Ansible](https://github.com/eightbitraptor/ansible-kyouko), (and
[Puppet](https://www.puppet.com), but I deleted this many years ago). 

Mitamae sits really nicely in the middle. It balances the trifecta of
flexibility, maintanability and complexity really well, and seems to be a
perfect fit for me.

The key is that it's low enough friction that adding new things isn't a chore.
Which means I'm less likely to allow my dotfiles repo to be out of sync with
the config actually on my machines. And it also allows enough customisation and
power that I can manage multiple sets of dotfiles in an elegant way.

Plus I get to write Ruby, which is always a plus in my book. [Implementing
iterations in
yaml](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_loops.html#migrating-from-with-x-to-loop)
is an abomination and should be stopped.

If any of this resonates with you I'd really recommend trying it out. Mitamae
is a great tool. 

