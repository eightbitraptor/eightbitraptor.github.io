---
layout: post
title: Working with headless VirtualBox VM's
date: 2016-07-08T09:30:00Z
categories: virtualmachines tooling
---

I spend a lot of time using both OSX and Linux. Personally I tend to prefer using Linux, however my work have provided me with a MacBook Pro and in order to make working with my colleagues as pain free as possible, I use OSX on it.

I still like to do a lot of work that relies on being on Linux however, and there are a bunch of ways to acheive this.

1. Dual boot my MacBook - I tried this for 6 months. It's complex and annoying to get set up and configure and half of the hardware doesn't work properly anyway (I tried, and failed to make a dual screen setup useable when one of the screens is a retina display).
2. Compile the Linux kernel toolchain on OSX - Nope. I don't have the smarts, nor the inclination for this, and I suspect that I wouldn't be able to do most of what I actually want to do anyway due to lack of support for userspace tools.
3. Use Virtual Machines for Linux tasks - Running VM's can be slow if you run them as 'complete' VM's with a full desktop environment etc.

I went with option 3, with some tweaks. I run all my VM's using VirtualBox, in headless mode, so there's no extra window and no GUI. I can then `ssh` into them from my OSX terminal, which makes integration with my Mac's paste buffer a lot more seamless, as well as meaning I can work in my OSX terminal, which at this point is configured how I like it. I also use VirtualBox shared folders feature to share source code directories on my mac directly with the VM. This means I can use my local OSX installed instance of Emacs to work on these projects, which is definitely a good thing.

This post assumes that you've already installed VirtualBox, and created a VM onto which you have installed your Linux distro of choice, and also installed the VirtualBox guest additions package into that guest OS. All instructions here are written for Fedora, as that's my preferred Linux distribution these days. They should work on other distro's with minor modification although package names will probably be different.

### configuring SSH port forwarding

The first thing you'll need to do is boot your VM normally (with the GUI), log in and install an OpenSSH server

    sudo dnf install openssh
    sudo systemctl start sshd
    sudo systemctl enable sshd


Now you can shut down your VM and configure SSH port forwarding for your VM. This will enable you to connect to your guest VM through `localhost` on your host OS. On your _host_ OS you can do this as follows

    # Fedora Dev is the name of my VM that from the VirtualBox machine list
    # 2222 is the port on the host who's traffic you wish to forward
    # 22 is the destination port on the guest where the traffic is forwarded
	
    VBoxManage modifyvm "Fedora Dev" --natpf1 "guestssh,tcp,,3021,,22"

Now you can start your VM in headless mode and ssh into it

    VBoxManage startvm "Fedora Dev" --type headless
    ssh -p 3021 username@localhost

### Configuring shared folders

VirtualBox has a feature that can share folders from your host OS into your guest. In Linux guests the folders appear as block devices that can be mounted wherever you require. It also has the ability to auto-mount these filesystems at boot. We're not going to do this as the VirtualBox UI isn't very configurable.

First create a 'shared folder', this will create a mountable block device on the guest.

    VBoxManage sharedfolder add "Fedora Dev" -name "test_project" \
	  -hostpath "~/code/projects/test_project"

You can test that this works by connecting to your guest and running

    sudo mount -t vboxsf test_project /media/test_project

Assuming that that works and you can now see your files in `/media/test_project` we can move on to the next step, which is getting the filesystem to mount automatically on boot, with the correct user and permissions. For this we need to add an entry to the `/etc/fstab` file on the guest (as root). That line looks like this:

    test_project  /test_project  vboxsf  uid=1000,gid=1000,umask=0022  0 0

This will mount your VirtualBox share under the directory `/test_project` with the owner and group set to your user. The last thing we need to do is make sure that the `vboxsf` kernel module is loaded early enough in the boot process that it can mount your filesystem as the machine is starting. If this module is not loaded, then your machine will fail to boot and you'll get dumped into a single user prompt.

If this does happen it's not a big deal - you'll just need to start the machine in non-headless mode so you can access the GUI, and configure the machine to load the module.

On Fedora, we can make sure a module is loaded on boot by adding it's name into a file in the `/etc/modules.d` tree. Do the following, as root:

    touch /etc/modules.d/vbox.conf
    echo "vboxsf" >> /etc/modules.d/vbox.conf

Now that the module is configured to load on boot, you can shutdown the machine and start it up again in headless mode using the command above. You should now be able to edit your source code using your favourite editor on the host system, and do your compilation tasks and testing through the ssh connection on the Linux guest.

### Running X11 applications

If you have a server that's running in headless mode, but you want to be able to run GUI applications you can run `ssh` with X11 forwarding. To do this you'll need an X server running on your OSX host machine. I use [XQuartz](https://www.xquartz.org). Download and install the latest version of XQuartz and then connect to your server using ssh, as above, but also pass the `-X` flag

	ssh -X -p 3021 username@localhost

Now, you can run gui apps from the command line and you should see XQuartz start up and the application will appear as a normal window on your OSX Desktop. I tested this out on my machine using the command `gedit &` to start gedit in the background and give me my terminal back.
