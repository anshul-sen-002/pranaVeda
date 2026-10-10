# PranaVeda Design Tokens — Primary Theme

> **Status:** Authoritative brand direction (confirmed by product owner from the
> reference mockups). The frontend does not exist yet; these tokens are the
> source of truth and map 1:1 onto the Tailwind config when the Next.js app is
> scaffolded. Until then, treat this file as the contract.

## Brand summary

The primary brand identity is a **calm sky-blue** with **cyan-to-blue gradients**.
Other colors are used as supporting accents, but sky-blue is the face of the
product. This **supersedes** the "muted sage/forest green" primary previously
sketched in `agents.md` §6 — that section should be read as "primary = sky
blue" until it is updated.

Design intent (unchanged from agents.md §6): quiet, airy, calming, generous
whitespace, mobile-first. The sky palette reinforces a light, open, "sky /
breath" feeling rather than an earthy one.

## Core palette — sky blue (primary)

| Token | Hex | Use |
|-------|-----|-----|
| `primary-50`  | `#EFF9FE` | Tinted page background, hover fills |
| `primary-100` | `#D9F1FD` | Pale card/surface tint, chips |
| `primary-200` | `#B3E3FB` | Borders, dividers on tinted surfaces |
| `primary-300` | `#7DD1F8` | Progress bars, soft highlights |
| `primary-400` | `#45C0F5` | Gradient start, icons |
| `primary-500` | `#1FA9ED` | **Primary buttons, links, active states** |
| `primary-600` | `#1789C7` | Primary button hover |
| `primary-700` | `#126C9E` | Primary button active / emphasis text |
| `primary-800` | `#0E5278` | Dark accent, headings on light-blue |
| `primary-900` | `#0A3D59` | Deep navy text on pale-blue surfaces |

## Gradient

Primary call-to-action buttons ("Get Started", "Start Sessions", "Resume Yoga")
use a subtle top-left → bottom-right gradient:

```css
--gradient-primary: linear-gradient(135deg, #45C0F5 0%, #1789C7 100%);
```

- Start `#45C0F5` (primary-400) → End `#1789C7` (primary-600).
- Apply to primary buttons only; do not use on large backgrounds.

## Surfaces & neutrals

| Token | Hex | Use |
|-------|-----|-----|
| `surface`        | `#FFFFFF` | Cards, sheets, modals |
| `surface-tint`   | `#EAF6FC` | App background, hero panels (pale sky) |
| `surface-tint-2` | `#D6ECF7` | Secondary tinted blocks, illustration grounds |
| `border-soft`    | `#E3EEF6` | Card borders, separators |

## Text

| Token | Hex | Use |
|-------|-----|-----|
| `text-heading` | `#223240` | Dark navy — headings, primary labels |
| `text-body`    | `#5A6B78` | Body copy, secondary labels |
| `text-muted`   | `#93A3AE` | Placeholders, timestamps, captions |
| `text-on-primary` | `#FFFFFF` | Text/icons on primary buttons |

## Supporting accents (used sparingly, not primary)

These appear in illustrations and small UI moments; they are **not** the brand
primary and should stay limited to badges, ratings, and highlights.

| Token | Hex | Use |
|-------|-----|-----|
| `accent-coral` | `#E8746A` | Illustration accents, sparingly in UI |
| `accent-amber` | `#F5B942` | Star ratings, achievement badges |
| `success` | `#3FB98A` | Positive states, streaks |
| `warning` | `#E8A33D` | Caution, gentle alerts |
| `danger`  | `#E06A6A` | Errors, destructive actions (kept soft, not harsh red) |

## Usage rules

- Primary buttons and key CTAs use `primary-500` fill or the primary gradient.
- App background is `surface-tint` (pale sky), not pure white; cards float on
  it as `surface` white with soft borders.
- Status is **never** communicated by color alone — pair with icon/text
  (agents.md §6 accessibility).
- Respect reduced-motion; gradients and transitions stay subtle.
- Keep contrast: `text-heading` and `text-on-primary` must meet WCAG AA.

## Mapping to Tailwind (when frontend is scaffolded)

```js
// tailwind.config.ts (future)
theme: {
  extend: {
    colors: {
      primary: {
        50:'#EFF9FE',100:'#D9F1FD',200:'#B3E3FB',300:'#7DD1F8',400:'#45C0F5',
        500:'#1FA9ED',600:'#1789C7',700:'#126C9E',800:'#0E5278',900:'#0A3D59',
      },
      surface: { DEFAULT:'#FFFFFF', tint:'#EAF6FC', tint2:'#D6ECF7' },
      // ...text, border, accent tokens from tables above
    },
    backgroundImage: {
      primary: 'linear-gradient(135deg,#45C0F5 0%,#1789C7 100%)',
    },
  },
}
```
