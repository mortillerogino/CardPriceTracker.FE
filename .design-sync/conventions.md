## Using this design system

This is CardPriceTracker's actual app UI — a dark, "field-catalog / blueprint"
themed CSS system with hand-rolled classes (no Tailwind, no CSS-in-JS).

### Wrapping and setup

`MainLayout`, `BinderPage`, and `SearchPage` read data via `@tanstack/react-query`
hooks — wrap any tree using them in `QueryClientProvider`:

```jsx
<QueryClientProvider client={new QueryClient()}>
  <MainLayout />
</QueryClientProvider>
```

`MainLayout` and `BinderPage` also call `react-router-dom` (`Link`,
`useLocation`, `useNavigate`) — wrap them in a router (`BrowserRouter` in a
real app, `MemoryRouter` for an isolated composition). `SearchPage` and
`CardTile` need no router. Without the query client, these components throw
"No QueryClient set"; without a router, "useLocation() may be used only in
the context of a `<Router>`".

### Styling idiom — real class names, not utilities

Every visual is a plain class name from `_ds_bundle.css` (source:
`src/styles/theme.css`) — compose these directly, don't invent new ones:

| Purpose | Classes |
|---|---|
| Card container | `card`, `elev-sm` (shadow), `blueprint` (needs 4 `<i className="corner tl/tr/bl/br">` children for the corner brackets) |
| Buttons | `btn` + one of `btn-primary` / `btn-secondary` / `btn-ghost`; add `btn-icon` for square icon-only buttons |
| Tags/badges | `tag` + one of `tag-neutral` / `tag-outline` / `tag-accent` / `tag-accent-2` |
| Text | `card-kicker` (small accent label), `card-title`, `card-body`, `text-muted` |
| Forms | `field` (wraps a `<label>` + input), `input` |
| Image placeholder | `duotone` (gradient box shown when no image) |
| Nav | `nav`, `nav-brand`, `seg`/`seg-opt` (segmented tab control, backed by radio inputs) |

Tokens are CSS custom properties, always reference them, never hardcode a hex:
`--color-bg`, `--color-surface`, `--color-text`, `--color-text-h`,
`--color-accent` (+ `-700`/`-900` shades), `--color-divider`,
`--color-neutral-400`/`-500`, `--font-heading` (JetBrains Mono, falls back to
`ui-monospace`/Segoe UI/Consolas — the font itself isn't bundled), `--font-body`,
`--space-2/3/4/6/8` (8/12/16/24/32px).

The `blueprint` class is purely decorative scaffolding (corner brackets) — it
does nothing without its 4 `.corner` children; always include all four.

### Where the truth lives

The root `styles.css` (and its `@import` of `_ds_bundle.css`) is the real
compiled stylesheet — read it before styling anything new. Each component's
`<Name>.prompt.md` has its real prop shape and a rendered usage example.

### Example

```jsx
<div className="card blueprint elev-sm" style={{ padding: 0 }}>
  <i className="corner tl" /><i className="corner tr" />
  <i className="corner bl" /><i className="corner br" />
  <div style={{ padding: 'var(--space-3)' }}>
    <span className="card-kicker">No. 025</span>
    <div className="card-title">Pikachu</div>
    <p className="card-body">Base Set</p>
    <button className="btn btn-primary blueprint">
      <i className="corner tl" /><i className="corner tr" />
      <i className="corner bl" /><i className="corner br" />
      Add
    </button>
  </div>
</div>
```
