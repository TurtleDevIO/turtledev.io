---
title: "How I Chose My Linux Distro (Fedora vs Ubuntu)"
description: "I tested Fedora 42 and Ubuntu 24.04 side by side on a 16″ Lenovo IdeaPad 5 Pro i5 to see which Linux distro works better out of the box."
date: "2025-11-04"
categories: ["linux", "ubuntu", "fedora", "gnome"]
published: true
readingTime: 15
---

![Lenovo IdeaPad 5 Pro - the laptop used for testing Linux distros](/images/posts/lenovo-ideapad.jpg)
*Lenovo IdeaPad 5 Pro 16″ - my test machine for comparing Fedora and Ubuntu*

In my [previous post](/blog/why-i-am-switching-from-windows-to-linux-again), I explained why I'm switching to Linux and mentioned I'd be testing Ubuntu and Fedora side by side as live USBs before committing to an install. Well, I did exactly that — booted both distros on my [Lenovo IdeaPad 5 Pro Gen 7](https://www.lenovo.com/ca/en/p/laptops/ideapad/ideapad-500/ideapad-5i-pro-gen-7-16-inch-intel/len101i0050?displayrulevalidation=false) and tested everything I could think of.

This isn't a benchmark test or a feature list comparison. This is what actually worked (and what didn't) when I tested both distros on my laptop.

---

## Test Setup

Before diving into the results, here's what I was working with:

| Component            | Specification                                                     |
| -------------------- | ----------------------------------------------------------------- |
| **Model**            | Lenovo IdeaPad 5 Pro 16IAH7 (Model 82SK)                          |
| **CPU**              | 12th Gen Intel® Core™ i5-12500H (12 cores / 16 threads @ 2.5 GHz) |
| **RAM**              | 16 GB                                                             |
| **Storage**          | 1 TB SSD                                                          |
| **Graphics**         | Intel Iris Xe Graphics                                            |
| **Display**          | 16″ 2560×1600 @ 120 Hz (16:10)                                    |
| **External Monitor** | LG 49″ 5120×1440 @ 60 Hz                                          |

I kept the firmware settings at their defaults (UEFI, Secure Boot enabled, AHCI for storage, virtualization on). Both distros booted fine without any BIOS tweaks.

---

## System Overview

| Feature        | Ubuntu 24.04 LTS  | Fedora 42         |
| -------------- | ----------------- | ----------------- |
| Kernel         | 6.14              | 6.14              |
| GNOME          | 46                | 48                |
| Display Server | X11 (in Live ISO) | Wayland (default) |
| Boot Time      | ~60 s             | ~60 s             |
| Shutdown       | ~120 s            | ~15 s             |
| Secure Boot    | Supported         | Supported         |
| UEFI           | Yes               | Yes               |

One thing I noticed right away: Fedora boots directly into Wayland, while Ubuntu's live ISO still defaults to X11. A full Ubuntu install might default to Wayland, but that's something I'd need to verify later. 

Shutdown times were surprisingly different. Fedora shut down in about 15 seconds, while Ubuntu took around 2 minutes. Something probably went wrong with Ubuntu's shutdown process during the live session, but it's worth noting.

---

## Display & Scaling

On Windows, I use 150% scaling on this laptop's screen, and it looks perfect. So naturally, I wanted to see how close I could get with Linux:

| Aspect                                      | Ubuntu                                  | Fedora                                          |
| ------------------------------------------- | --------------------------------------- | ----------------------------------------------- |
| Resolution                                  | 2560×1600 OK                            | 2560×1600 OK                                    |
| Scaling Options                             | 100 %, 200 %, 300 % only                | Fractional scaling (125 %, 150 %, 175 %, 200 %) |
| Fractional Scaling                          | Not recommended (labelled experimental) | Stable and sharp                                |
| External Monitor (LG 49″ 5120×1440 @ 60 Hz) | OK                                      | OK                                              |

Ubuntu's scaling options are pretty limited — 100%, 200%, or 300%. That means everything is either too small or too large. Fedora, on the other hand, offers proper fractional scaling (125%, 150%, 175%, 200%), and it looked sharp and stable. Even better, Fedora automatically detected and set the scaling to 150% on boot — exactly what I use on Windows. This alone was a big win for Fedora.

---

## Touchpad, Keyboard & Gestures

| Feature                   | Ubuntu 24.04       | Fedora 42                                  | Notes                          |
| ------------------------- | ------------------ | ------------------------------------------ | ------------------------------ |
| Sensitivity               | OK                 | OK                                         |                                |
| Two-finger scroll         | Works but too fast | Works but too fast (softer in LibreOffice) | Fedora’s felt smoother overall |
| Three-finger gestures     | Doesn’t work       | Works                                      | Wayland advantage              |
| Move windows via touchpad | OK                 | OK                                         |                                |
| Pinch zoom                | Works              | Works                                      |                                |
| Brightness keys           | OK                 | OK                                         |                                |
| Sound keys                | OK                 | OK                                         |                                |
| Sound settings            | OK                 | OK (no extra “boost” level)                |                                |
| Keyboard backlight        | OK                 | OK                                         |                                |

The touchpad worked fine on both distros, but Fedora's combination of GNOME 48 and Wayland made things noticeably smoother. Three-finger gestures worked out of the box on Fedora, while Ubuntu didn't support them at all. Scrolling felt a bit more refined on Fedora too, especially in apps like LibreOffice.

---

## Audio, Bluetooth & Peripherals

Ubuntu's live ISO didn't recognize my Wi-Fi adapter at all. Without internet, I couldn't test the browser or download anything. Fedora, on the other hand, picked up the Wi-Fi on the start and I just selected my Wi-Fi and entered my password to get connected.

My Bluetooth keyboard and mouse (Logitech MX Master) paired fine on both systems. On Ubuntu, the mouse scroll was too fast, just like the touchpad. But on Fedora, the mouse scroll felt perfect — unlike the touchpad which was still a bit too fast.

One quirk I noticed: the MX Master can connect to three devices and switch between them with a button. After connecting to Linux and then switching back to Windows, the scroll speed issue carried over to Windows too. Turning the mouse off and on fixed it, so it's more of a mouse firmware thing than a Linux issue.

The webcam worked on both, but Ubuntu had it mirrored horizontally. Fedora displayed it correctly and the image quality looked better too — colors and exposure just seemed more natural.

Speakers, mic, and dark mode all worked fine on both distros. No complaints there.

---

## Performance & Responsiveness

Both live sessions ran surprisingly well, considering they were running entirely from a USB stick. But Fedora felt noticeably lighter and more responsive overall.

Apps launched slightly faster on Fedora. Animations were smoother — probably thanks to Wayland. Dragging windows and switching workspaces felt snappier. Even scrolling in LibreOffice was more consistent on Fedora compared to Ubuntu.

---

## What I Chose

After testing both, the winner was pretty clear: **Fedora**.

Ubuntu is solid and familiar, but its live ISO felt dated in comparison. Here's where Fedora did a better job:

- **Wi-Fi**: Ubuntu didn't detect the Wi-Fi adapter at all. Fedora had no issues.
- **Fractional Scaling**: Ubuntu only offered 100% and 200%. Fedora offered the best option (150%) out of the box.
- **Touchpad Gestures**: Three finger swipe gestures (up/down and left/right) didn't work on Ubuntu. Fedora's three-finger swipe for workspace and application switching worked perfectly.
- **Webcam**: Ubuntu had the image mirrored horizontally. Fedora displayed it correctly with better color and exposure.
- **Overall Performance**: Fedora felt noticeably faster and smoother — apps launched quicker, animations were smoother, and everything felt more responsive.

I am sure that the issues above with Ubuntu can be fixed on a real install with some tweaks and driver installations. But the fact that almost everything worked with Fedora out of the box on a live USB session was impressive.

Now it is time to install Fedora and do some post-installation setup. Stay tuned.

Smooth computing!
