---
title: "How to Set Up Oh My Zsh and Powerlevel10k on Fedora"
description: "I had this setup running on WSL and wanted the same on Fedora — zsh with Oh My Zsh, a couple of essential plugins, and Powerlevel10k."
date: "2026-04-02"
categories: ["linux", "fedora", "terminal", "zsh"]
published: true
readingTime: 7
---

<script>
import Callout from '$lib/components/Callout.svelte';
</script>


![zsh terminal with Oh My Zsh, Powerlevel10k, and neofetch on Fedora](/images/posts/zsh-powerlevel10k-terminal.png)
*zsh with Powerlevel10k and Oh My Zsh running on Fedora*

I had this setup running on WSL for many years and wanted the same on Fedora. Since I'm still using WSL on my other machine, I wanted the exact same setup on both to not confuse my muscle memory 😄. Here are the steps I followed, in order.

## Step 1: Install zsh

Fedora ships with bash, so the first step is installing zsh:

```bash
sudo dnf install zsh
```

Verify it installed correctly:

```bash
zsh --version
# zsh 5.9 (x86_64-redhat-linux-gnu)
```

## Step 2: Install Oh My Zsh

[Oh My Zsh](https://github.com/ohmyzsh/ohmyzsh) is the framework that adds useful features. It manages themes and plugins and comes with a huge set of sensible defaults out of the box.

```bash
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

A few things happen automatically when this runs:

- Oh My Zsh is cloned into `~/.oh-my-zsh` (about 3.3 MB)
- A new `~/.zshrc` is created from the Oh My Zsh template — this is where your themes, plugins, and aliases live
- Your default shell is changed to zsh by running `chsh` under the hood, which updates `/etc/passwd` to point your user to `/usr/bin/zsh` — it'll ask for your password for this step

After the install finishes, close and reopen your terminal and you'll already be in zsh.

## Step 3: Add the Essential Plugins

There are two plugins that I consider non-negotiable. Once you try them, you'll wonder how you managed without them.

**zsh-autosuggestions** — as you type, it shows a greyed-out ghost suggestion based on your command history. Hit the right arrow key to accept it. It's subtle but it cuts down repetitive typing significantly.

```bash
git clone https://github.com/zsh-users/zsh-autosuggestions \
  ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
```

**zsh-syntax-highlighting** — colors your command as you type it. Valid commands turn green, unrecognized commands turn red. Typos become immediately visible before you even hit enter.


```bash
git clone https://github.com/zsh-users/zsh-syntax-highlighting \
  ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
```

After cloning both, open `~/.zshrc` and find the `plugins=(...)` line. Add both to the list:

```bash
plugins=(git zsh-autosuggestions zsh-syntax-highlighting)
```

Then reload your config:

```bash
source ~/.zshrc
```

## Step 4: Powerlevel10k

The default Oh My Zsh themes are fine, but [Powerlevel10k](https://github.com/romkatv/powerlevel10k) is in a different league. It's fast, highly configurable, and shows useful context right in your prompt — current directory, git branch and status, error codes, and more. It has a built-in configuration wizard that walks you through everything interactively.

<Callout type="note">

The GitHub repo now shows a warning that the project has very limited support and no new features are in the works. That sounds alarming, but [the maintainer explained on Reddit](https://www.reddit.com/r/zsh/comments/1f88498/comment/llfj1fq/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button) that since no new features are being added, no new bugs will be introduced either — the plugin does what it does and does it well. There are also still occasional commits coming in. Good enough for me.
</Callout>




### Install the Font First

Powerlevel10k uses special glyphs that require a patched font. Download these four files from the [Powerlevel10k fonts page](https://github.com/romkatv/powerlevel10k?tab=readme-ov-file#fonts):

- `MesloLGS NF Regular.ttf`
- `MesloLGS NF Bold.ttf`
- `MesloLGS NF Italic.ttf`
- `MesloLGS NF Bold Italic.ttf`

Install them by double-clicking each file, or by copying them into `~/.local/share/fonts/` and running `fc-cache -f -v`.

Then set the font in your terminal. In GNOME Terminal: **Preferences → select your profile → Text → enable Custom font → select MesloLGS NF Regular**.

If you use the VS Code integrated terminal, you'll need to do two things. First, set it to use zsh — by default it opens bash. Open VS Code settings, search for `terminal.integrated.defaultProfile.linux`, and set it to `zsh`. Second, set the font so the Powerlevel10k glyphs render correctly — search for `terminal.integrated.fontFamily` and set it to `MesloLGS NF`. Then Restart VS Code. Without this, you'll see broken squares instead of icons.

### Install the Theme

```bash
git clone --depth=1 https://github.com/romkatv/powerlevel10k.git \
  "${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k"
```

Open `~/.zshrc`, find the line that sets `ZSH_THEME`, and change it:

```bash
ZSH_THEME="powerlevel10k/powerlevel10k"
```

Then reload:

```bash
source ~/.zshrc
```

The Powerlevel10k configuration wizard will launch automatically. It asks a series of visual questions — does this icon look right, do you prefer this style or that one — and builds your prompt config based on your answers. The whole thing takes about two minutes and the result is a prompt that actually shows you useful information at a glance. 

After all of this, the terminal is in a good shape. One more thing I'd recommend — try the Darcula theme on GNOME Terminal. It pairs really well with Powerlevel10k and is easy on the eyes for long sessions. And if the font feels too small after setting MesloLGS NF, just bump it up a couple of sizes in **Preferences → Text → Custom font**. Don't suffer through a small font.

If you're on Fedora (or any Linux distro) and haven't done this yet, it's worth the half hour.

Smooth typing!
