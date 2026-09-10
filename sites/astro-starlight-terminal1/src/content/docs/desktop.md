---
title: Desktop app
description: The HexoKit desktop app for macOS — a native shell around the dashboard.
---

The HexoKit desktop app (macOS) is a native Electron shell around the dashboard — it wraps the same console in its own window and frees the browser-reserved `⌘` keyboard tier for your terminals. Install and update it with the CLI:

```sh
run-kit desktop install    # fetch the latest release DMG, install to /Applications
run-kit desktop update     # same, but a no-op when already current
run-kit desktop status     # report the installed app and its version
```

Builds land on [GitHub Releases](https://github.com/sahil87/run-kit/releases); prerequisites and troubleshooting live in the [install guide](/docs/install/#desktop-app-macos).
