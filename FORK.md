# RSVP Nano Fork (foliveross)

Enhanced fork of [ionutdecebal/rsvpnano](https://github.com/ionutdecebal/rsvpnano) with companion apps and extended firmware API.

## Fork differences (v0.1.0)

### Firmware

- `/api/wireless` — GET status, POST configure mode (ap/sta/auto) with pairing code, DELETE to stop wireless
- `/api/storage` — SD card mount status and folder counts
- `/api/storage/cleanup` — remove `.rsvp.tmp`, `.rsvp.converting`, `.rsvp.failed` sidecars
- `/api/library/refresh` — trigger library re-scan while companion is active
- `/api/stats` — reading stats (words today, current WPM)
- `/api/ota/check` — check GitHub releases (foliveross/rsvpnano)
- Companion sync **Station mode** and **Auto** (home Wi-Fi with AP fallback)
- Companion auto-timeout setting via wireless API
- Extended `/api/info` with `firmwareVersion`, `wirelessActive`, `ip`, `fork`

### Desktop (Windows)

- Local Electron app: firmware flasher, book converter, wireless companion
- Portable EXE build via `scripts\build-exe.bat`

### Android

- Native companion app: library, upload, settings, RSS, wireless toggle
- Share intent for URLs and text → articles

### Upstream sync

- Track upstream on branch `upstream-main`
- Merge upstream releases periodically; fork-specific code lives in companion API and apps

## Monorepo layout

```text
rsvpnano/
├── src/                 # Firmware (PlatformIO)
├── web/                 # Browser flasher + converter
├── companion-core/      # Shared TypeScript REST client
├── desktop/             # Electron Windows app
├── android/             # Kotlin companion app
├── ios/                 # Upstream iOS app (unchanged)
├── scripts/             # Windows build/dev scripts
└── README.md
```

## GitHub Pages

The web flasher and Wi-Fi companion are published to GitHub Pages when enabled.

**Note:** GitHub Pages on **private** repositories requires GitHub Pro/Team. On the free plan, either:

- Make the repository **public** (recommended for `foliveross.github.io/rsvpnano`), or
- Upgrade the account, or
- Use the Windows desktop app / local `web/` folder.

Enable Pages: Repository **Settings → Pages → Build and deployment → GitHub Actions**.

## License

MIT — same as upstream. See [LICENSE](LICENSE).
