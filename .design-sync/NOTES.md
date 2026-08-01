# Design-sync notes — CardPriceTracker frontend

This repo is an application, not a component library: no Storybook, no build
output, no shipped `.d.ts`. The sync runs in "package" shape, synth-entry mode,
scoped to 4 components read directly from `src/`.

## Setup decisions

- **Custom entry** (`cfg.entry` → `.design-sync/support/entry.ts`): the naive
  synth-entry scan (`srcDir` walk of all `.tsx`/`.jsx`) picks up EVERY source
  file, including `src/main.tsx`, which has a top-level side effect
  (`createRoot(...).render(...)`). Bundling that file eagerly executes the
  real app inside the DS bundle IIFE, which is wrong. Fix: `cfg.entry` points
  at a hand-written barrel (`.design-sync/support/entry.ts`) that re-exports
  only the 4 real components — this becomes both the PKG_DIR anchor AND (since
  the file exists) the actual bundle entry, bypassing the synth-scan entirely.
- **`componentSrcMap`** pins all 4 components' exact src paths explicitly.
  This was required anyway: with a custom `cfg.entry`, `exportedNames()`
  finds nothing (no `.d.ts`/`types` field on this package.json), so without
  the pins the component list would come back empty.
- **`App` excluded** (`componentSrcMap.App: null`) — it's just route wiring
  (`<Routes>`/`<Route>`), not an independently meaningful design artifact;
  `MainLayout`'s preview already composes the same routes for real.
- **`dtsPropsFor`** overrides all 4 components — prop extraction produces a
  `{[key:string]: unknown}` stub in synth-entry mode (no real `.d.ts` to
  resolve against), so the real prop shapes (read from source) are
  hand-written instead.
- **Provider**: `QueryClientProvider` wraps every card (`cfg.provider`), fed a
  dedicated `QueryClient` (retry disabled) via `.design-sync/support/query-client.ts`
  + `extraEntries`. `MainLayout`/`BinderPage` additionally wrap themselves in
  `MemoryRouter` inside their own authored `.tsx` (needed for `Link`/`useLocation`/
  `useNavigate`; `SearchPage` needs no router).
- **`overrides.CardTile: {viewport: "300x560"}`**: CardTile's image box is
  `aspect-ratio: 3/4` and scales with container width. The default 900×700
  review-capture viewport left it wider than tall, so the info panel
  (name/tag/button) got cropped out of the grading screenshot even though the
  real grid-cell rendering (narrower column) was always fine — confirmed via
  the render-check contact sheet before adding the override.
- **`overrides.MainLayout: {cardMode: "column"}`** — its previews are full
  app-shell widths; `[GRID_OVERFLOW]` flagged them, fixed per the standard
  recipe.

## Known render warns

- `[FONT_MISSING]` "JetBrains Mono" — never shipped in this repo (no
  `@font-face`, no font file). **User's call (2026-07-29): accept the
  fallback stack** (`ui-monospace, Segoe UI, Consolas, monospace`) rather than
  sourcing the font. Not a bug to chase on future syncs.

## No-backend data states

`MainLayout`, `BinderPage`, `SearchPage` call real `@tanstack/react-query`
hooks against `http://localhost:5289/api`. With no backend reachable from a
static preview render, they always settle to their real empty/default states
(binder: "No specimens catalogued yet"; search: the untouched search form).
This is the authored preview scope on this sync — populated/loading/error
states were **not** authored because they need live (or mocked) data, which
would mean composing fixtures rather than the real hooks. If richer states
are wanted later, the honest path is standing up a mock API layer for
previews, not faking props the real components don't accept.

## Re-sync log

- **2026-08-01**: substantial changes had landed in all 4 synced components
  since the 2026-07-29 sync (SearchPage rewritten for a required-set dropdown
  + real RiftCodex search; BinderPage got price-tag badges + real card art;
  CardTile's kicker changed to `{setName} · {cardNumber}`). Because this repo
  has no real `.d.ts`/build (synth-entry mode), `sourceKeys` hash the emitted
  wrapper stub/doc files, not the actual component logic living in
  `_ds_bundle.js` — so the diff reported all 4 as `unchanged` by sourceKey,
  but the **canary spot-check caught the real change** via `renderHashes`
  (`render_churn`, 4/4 components). This is the system working as intended
  for this repo's setup, not a bug — expect the same pattern on any future
  sync where only internal component logic changes (no prop/doc changes).
  Re-verified all 4 by reading the fresh screenshots; grades confirmed
  `good`, re-uploaded, `report_validate` counts 4/4 clean.
- **Orphaned `fonts/` in the remote project**: the remote DS project has a
  full JetBrains Mono font family (32 `.ttf` files + `fonts.css`) that the
  *current* local build does not produce (no `cfg.extraFonts`, and
  `[FONT_MISSING]` still fires — the 2026-07-29 "accept the fallback" call is
  still in effect). These must be leftovers from an earlier exploratory
  config that shipped the real font before the fallback decision was made.
  The anchored diff's `deletePaths` was empty on the 2026-08-01 re-sync, so
  per the skill's own rule (trust the diff verbatim, never hand-derive
  deletes on an anchored re-sync) they were left alone and NOT deleted.
  They're harmless (an unreferenced `fonts/` dir the app just won't use) but
  are drift worth resolving deliberately: either wire `cfg.extraFonts` to
  actually ship the font (reverses the 07-29 decision) or manually clean up
  the orphaned files in the project next time a non-anchored (full-review)
  sync happens.

## Re-sync risks

- If `src/main.tsx` or any new top-level-side-effect file gets added under
  `src/`, it will NOT accidentally get swept into the bundle again — the
  custom `cfg.entry` barrel is the only thing that decides what's exported.
  But if a 5th real component gets added, it must be added to BOTH
  `.design-sync/support/entry.ts` (the barrel) AND `componentSrcMap` (so
  discovery finds it) — neither alone is sufficient in this repo's setup.
- `dtsPropsFor` entries are hand-maintained prose, not extracted — if
  `CardTileProps` (or any component's real props) change shape in `src/`,
  these will silently go stale until someone updates them by hand.
- The "no-backend" empty states above are a snapshot of what react-query
  settles to with `retry: false` and no server. If the API hooks/query keys
  change, or a backend becomes reachable during future syncs (e.g. CI has one
  running), the captured states could change without any config drift being
  detected — worth an eyeball on re-sync, not just a diff-based skip.
- `.design-sync/support/query-client.ts` and `entry.ts` are sync-only
  scaffolding, not part of the shipped app — don't let them get imported from
  real app code by mistake.
