# Stillpoint

Stillpoint is a private, German-language focus workspace. It combines an
accurate focus timer, guided breathing, an energy-based session recommendation,
a distraction capture pad, local progress, and a daily reflection without
accounts, analytics, or remote persistence.

## Run locally

```bash
npm install
npm run dev
```

## Windows desktop app

Stillpoint also ships as a portable, offline-capable Windows application. The
desktop and web targets render the same shared product surface and keep their
data locally on the device.

```bash
npm run desktop:build
npm run desktop:package
```

The packaging command creates `desktop-release/Stillpoint.exe`. Generated
desktop bundles and executables stay outside version control.

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
