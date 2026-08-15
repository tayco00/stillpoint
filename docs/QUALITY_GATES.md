# Stillpoint Quality Gates

The site is complete only when every gate below passes. Measurements use the
production build, not the development server.

## G1 — Product usefulness

- Focus timer starts, pauses, resumes, resets, changes duration, and uses a
  wall-clock deadline so background tabs do not make it drift.
- A completed session updates today's sessions and focus minutes exactly once.
- Breath reset guides a full 4–4–6 cycle and records completed resets.
- Energy check-in returns a concrete recommendation that can configure the timer.
- Distraction notes can be added and removed during a focus session.
- Intention, notes, preferences, and progress survive reloads in local storage.
- Stored data has a versioned schema, safe parsing, and an explicit delete action.

## G2 — UX and responsive design

- No horizontal overflow at 360 × 800, 768 × 1024, or 1440 × 900.
- The main focus action is visible in the first viewport on desktop and reachable
  within one scroll on mobile.
- Interactive targets are at least 44 × 44 CSS pixels on touch layouts.
- Navigation, tools, empty states, active states, completion states, and errors
  are understandable without instructions.
- Motion is purposeful, remains smooth in the tested desktop browser, and is
  effectively removed when `prefers-reduced-motion: reduce` is active.

## G3 — Accessibility

- Automated accessibility audit: zero critical or serious violations.
- Keyboard-only path covers navigation, timer, duration selection, energy check,
  breath reset, notes, and data deletion with visible focus.
- One `h1`, logical heading order, named landmarks, explicit form labels, and
  useful live regions for completion feedback.
- Text and controls meet WCAG AA contrast: 4.5:1 normal text, 3:1 large text and
  component boundaries.

## G4 — Performance

- Lighthouse mobile: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95,
  SEO ≥ 95.
- Lab metrics: LCP < 2.5 s and CLS < 0.1.
- No runtime console errors or failed first-party requests.
- No heavy animation framework, analytics SDK, remote data dependency, or
  unneeded client library.

## G5 — Technical quality and reliability

- Production build, lint, and automated tests all exit successfully.
- Timer and storage logic have focused automated tests.
- Application source files remain under 500 lines and public data shapes are typed.
- Invalid or unavailable local storage never blocks rendering or interaction.

## G6 — SEO and sharing

- German `lang`, unique title and description, canonical URL, robots policy,
  sitemap, theme color, and share metadata are present.
- Page contains indexable product copy and JSON-LD for the web application.
- Social preview visually matches the shipped product and contains no invented copy.

## G7 — Ethical retention

- Return value comes from continuity: local progress, recent sessions, saved
  intention, repeatable tools, and a daily reflection.
- No forced account, notification prompt, fake urgency, infinite feed, guilt copy,
  hidden tracking, or obstructive exit.
- The interface states where data lives and allows one-step deletion with confirmation.

