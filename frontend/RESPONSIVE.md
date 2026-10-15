# PranaVeda frontend - responsive contract

Every page (current and future) follows these rules so mobile works by
default, not by retrofit. Test at **360px**, **390px**, **768px**, **1024px**,
and **1440px** before calling a page done.

## 1. Viewport (already global)

`src/app/layout.tsx` exports `viewport = { width: "device-width",
initialScale: 1, viewportFit: "cover" }`. Never add `maximum-scale=1` or
`user-scalable=no` - they break pinch-zoom accessibility.

## 2. No horizontal scroll, ever

- Global guards in `globals.css`: media gets `max-width: 100%`, text gets
  `overflow-wrap: anywhere`.
- Sections that bleed (blurred blobs, gradients) must sit inside
  `overflow-hidden` parents.
- Floating/absolute decorations use **inward** offsets on mobile
  (`right-2`, not `-right-5`); outward offsets are `sm:` and up only.
- Grids start at 1 column and add columns at `sm:`/`md:`/`lg:`.

## 3. Touch targets >= 44px

- Buttons: `lg` (48px) is the default for primary actions and all auth
  submits (`fullWidth` on mobile). `sm` (36px) is desktop-inline only.
- Icon-only buttons (menu, password toggle, player controls) get
  `size-11` (44px) hit areas even when the glyph is smaller.
- Nav rows, list items, and checkbox labels use `min-h-11`.
- Related controls keep >= 8px gaps so thumbs don't overlap.

## 4. Type scales up, never down below readable

- Body text stays `text-sm` (14px) minimum; hero `text-4xl` -> `sm:text-5xl`
  -> `lg:text-6xl`; section titles `text-2xl` -> `sm:text-3xl`.
- Long headings use `text-balance`; email/URL/token strings always wrap.

## 5. Navigation pattern

- `<md`: hamburger `Button` (44px, `aria-expanded`/`aria-controls`,
  Escape-to-close, body scroll lock) + panel `<nav>` with `min-h-11` rows.
- `md:` and up: inline links. Copy the pattern from `SiteHeader.tsx` -
  don't invent a second menu system.
- Sticky bars keep `h-16`; page content never hides under them.

## 6. Forms on small screens

- `AuthLayout`: brand panel hidden below `lg:`, logo moves above the card.
- Card padding `p-7` -> `sm:p-9`; fields `h-12`; submit `size="lg"
  fullWidth`. Errors announce via `role="alert"` / `aria-live`.
- Inputs use real keyboards: `type="email"` + `autoComplete` attributes.

## 7. Motion respects context

- `motion` animations flatten automatically under
  `prefers-reduced-motion` (global CSS kill-switch in `globals.css`).
- Decorative loops (orb, equaliser, blobs) pause to still frames; content
  reveals render in final state.
- Never gate content behind animation completion - if JS stalls, the page
  must still read.
