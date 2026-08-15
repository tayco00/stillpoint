# Stillpoint

Stillpoint is a private, German-language focus workspace. It combines an
accurate focus timer, guided breathing, an energy-based session recommendation,
a distraction capture pad, local progress, and a daily reflection without
accounts, analytics, or remote persistence.

## Develop locally

```bash
npm install
npm run dev
```

## Windows desktop app

Stillpoint is distributed as an offline-capable Windows application. Its data
stays locally on the device; there is no separate web release.

```bash
npm run desktop:build
npm run desktop:package
```

The packaging command creates `desktop-release/Stillpoint-Setup.exe`. It
installs Stillpoint with Desktop and Start-menu shortcuts and registers a normal
Windows uninstaller.

Installed copies show a compact update window during startup and check the
public GitHub release channel again every six hours. The window reports the
search, download progress, and installation before Stillpoint restarts. Users
can choose **Ohne Update starten** when they do not want to wait; a completed
background download can then be installed from the tray menu or on exit.
Release publishing must include the installer, `latest.yml`, and the generated
installer blockmap.

## Desktop features

- First-run profile and personal, device-local welcome
- Rotating first-run examples with 28 diverse names
- Visible startup update progress with an always-available skip action
- Persistent “continue where you stopped” next step
- End-of-session reflection ritual
- Tray quick capture and `Ctrl+Shift+Space` shortcut
- Configurable, quiet Windows reminders
- Seven-day focus review with time-of-day and energy patterns
- Procedurally generated offline soundscapes

Closing the main window keeps Stillpoint available in the Windows notification
area so quick capture and reminders continue to work. Use **Stillpoint beenden**
from the tray menu to exit completely.

Generated desktop bundles and executables stay outside version control.

## Validate

```bash
npm run lint
npm test
```

`npm test` builds the Cloudflare-compatible vinext application and runs the
rendering and product-logic tests. The measurable completion contract lives in
[`docs/QUALITY_GATES.md`](docs/QUALITY_GATES.md).

## Architecture

- `app/components` contains the bounded interactive product surfaces.
- `app/components/StillpointApp.tsx` is shared by the web and desktop targets.
- `desktop` contains the sandboxed Electron window and its local renderer.
- `StillpointClient` is a small shared-state provider; static hero and navigation
  remain server-rendered while the tools hydrate as focused client islands.
- `app/hooks/useStillpoint.ts` owns safe, device-local persistence.
- `app/lib/stillpoint.ts` contains typed, side-effect-free state transitions.
- `app/layout.tsx`, `app/robots.ts`, and `app/sitemap.ts` own SEO and sharing.
- `docs` contains the Ruflo ledger and generated QA evidence.
- `scripts/run-axe.mjs` and `scripts/audit-proxy.mjs` make the accessibility and
  compressed-delivery performance checks reproducible.

## Ruflo

The repository was initialized with Ruflo's minimal Codex profile. A
three-role hierarchical swarm routes implementation, performance review, and
quality review while Codex remains the only writer. Background automation,
auto-scaling, autonomous publishing, and concurrent writers are disabled. See
[`docs/RUFLO_RUN.md`](docs/RUFLO_RUN.md).

Final measurements are recorded in
[`docs/QUALITY_RESULTS.md`](docs/QUALITY_RESULTS.md).
