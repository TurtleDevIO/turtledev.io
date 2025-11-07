---
title: "Why I'm Switching to Linux (Again)"
description: "After years on Windows and several failed attempts to switch, I'm now starting a slow transition to Linux — with the goal of building an environment I fully control and genuinely enjoy working in."
date: "2025-11-03"
categories: ["linux", "windows", "developer-tools", "productivity", "turtledev"]
published: true
readingTime: 8
---

![My first laptop - Sony Vaio from 2006, where I installed Linux for the first time](/images/posts/sony-vaio-2026-09.JPG)
*My first laptop - a Sony Vaio from 2006 (shown here running Windows XP, but this was the machine where I first installed Linux)*

I remember installing Fedora Core ? (I think it was 4) on my 10.6-inch Sony Vaio Laptop back in 2006. What a beauty that machine was and how time flies is out of our topic. In those days, almost nothing worked out of the box with Linux. I remember spending days to setting up the wireless driver and getting the right screen resolution. I still remember the joy of seeing the Google homepage load for the first time on Firefox running on Fedora 🥲.

Over the years, I kept trying to switch to Linux from time to time. It was exciting, cool, and free. But it required commitment and patience which I couldn't afford. On the other hand, Windows was less hassle but as I get into more advanced software development work, I noticed that Linux was the platform where most of the best tools and frameworks were developed first. So I always kept my interest in Linux and learned it as much as I could while using Windows as my main OS. 

For a long time, I used Git Bash on Windows, also tried Cygwin and WSL 1. Finally WSL 2 came out and I fully switched my development environment to WSL 2 with Ubuntu. It was best of both worlds — Windows would take care of device drivers and everyday applications and WSL 2 with VsCode would be my development environment. 

After years of using Windows with WSL 2 as my main development environment, I've decided it's finally time to give switching to Linux a real try. Ironically, this isn’t because Windows has gotten worse technically — in fact, Windows 11 is remarkably stable, and WSL has become an incredible tool for developers. But over the years, Microsoft has been pushing an agenda that increasingly conflicts with my values as a developer and user.

Microsoft pushes hard to use Windows 11 with a Microsoft account. And with that, it silently integrates OneDrive and starts syncing your files without most users even noticing. After big updates, it pops up a settings window asking you to review your privacy settings, which most users just click through. Even for developers like me who are aware of these things, it’s becoming harder to keep track of every change Microsoft makes under the hood.

At this point, I genuinely don't know what data Microsoft is collecting from my system.

I’ve tried switching to Linux a few times before, but I always ended up wrestling with drivers instead of doing some actual work. It was always something that wouldn't work right away — screen resolution, fractional scaling, Bluetooth connection dropping randomly, or a touchpad behaving weirdly. Then I’d find myself on forums searching for solutions and wasting time. Then I'd end up going back to Windows. With a family and a full-time job, it’s already hard enough to find time to work on side projects. I don’t really want to spend that time fixing hardware compatibility issues.

This time, I’m taking a slower and more deliberate path. Instead of wiping my main machine or dual-booting, I’m setting up Linux on a separate laptop — a Lenovo IdeaPad Pro 16″ with 16 GB memory and a 12th Gen Intel i5-12500H processor. My main workstation, a 32 GB Lenovo ThinkBook, will stay on Windows for now while I configure and refine the Linux setup on the side. I’ll still be using Windows mostly until I feel like my Linux machine is ready to go. Then I’ll use the Linux machine primarily and keep the Windows one as a backup for a while. Meanwhile, I'll also investigate the best way to save my Linux configuration (dotfiles, scripts, settings) so that I can easily migrate between machines or distros in the future. But my main goal is to stick with one distro unless there’s a really good reason to hop to another one.

One drawback of WSL is memory allocation. WSL runs inside a virtual machine, and on a 16 GB system it ends up splitting memory — half for Windows, half for the Linux subsystem. VS Code, especially when opened with a large monorepo, plus extensions and everything else, makes 8 GB not enough. I’m hoping that with native Linux, even 16 GB will feel lighter, faster, and more efficient.

When it comes to choosing a distro, I’m being pragmatic. In the past, I’ve used Ubuntu, Linux Mint, and Fedora. On WSL, I'm using Ubuntu. I've experimented with desktop environments like XFCE, Cinnamon, and GNOME. Among them, I really like GNOME for its modern look and feel. Also, GNOME has the best window tiling options, which is a must for my 49-inch ultrawide monitor.

So, I’ve narrowed my choices to Ubuntu and Fedora. Arch is tempting, but I’m not in the mood for that level of adventure right now. My plan is to boot up both Ubuntu and Fedora as live OSes on my Lenovo IdeaPad and test them side by side before committing.

In my [next post](/posts/how-i-chose-my-linux-distro-fedora-vs-ubuntu), I'll share the results of my side-by-side test between Ubuntu and Fedora — what worked out of the box, what didn't, and which one I eventually chose. And I'll keep blogging about my Linux journey as I set up my development environment, tackle challenges, and discover new tools along the way.

Smooth coding!