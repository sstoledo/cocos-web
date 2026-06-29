# Cocos Design System

## Color Space

All color tokens are defined in **OKLCH** for perceptual uniformity. The `.op` design file uses HEX equivalents because OpenPencil/CanvasKit renders them more reliably during visual iteration.

## Color Tokens

### Light Mode

| Token | OKLCH | HEX |
|---|---|---|
| `background` | `oklch(0.979 0.004 75)` | `#FAFAF9` |
| `foreground` | `oklch(0.11 0.006 265)` | `#18181B` |
| `card` | `oklch(1 0 0)` | `#FFFFFF` |
| `card-foreground` | `oklch(0.11 0.006 265)` | `#18181B` |
| `primary` | `oklch(0.55 0.22 258)` | `#2563EB` |
| `primary-foreground` | `oklch(0.99 0 0)` | `#FFFFFF` |
| `muted-foreground` | `oklch(0.52 0.013 265)` | `#71717A` |
| `border` | `oklch(0.875 0.006 75)` | `#E4E4E7` |
| `input` | `oklch(0.875 0.006 75)` | `#E4E4E7` |
| `placeholder` | `oklch(0.64 0.013 265)` | `#A1A1AA` |
| `ring` | `oklch(0.55 0.22 258)` | `#2563EB` |

### Dark Mode

| Token | OKLCH |
|---|---|
| `background` | `oklch(0.092 0.006 265)` |
| `foreground` | `oklch(0.94 0.004 265)` |
| `card` | `oklch(0.135 0.007 265)` |
| `card-foreground` | `oklch(0.94 0.004 265)` |
| `primary` | `oklch(0.68 0.20 264)` |
| `primary-foreground` | `oklch(0.10 0.006 265)` |
| `muted-foreground` | `oklch(0.64 0.014 265)` |
| `border` | `oklch(1 0 0 / 10%)` |
| `input` | `oklch(1 0 0 / 10%)` |
| `placeholder` | `oklch(0.64 0.014 265)` |
| `ring` | `oklch(0.68 0.20 264)` |

## Typography

### Font Families

| Token | Value |
|---|---|
| `font-sans` | `'Inter', system-ui, sans-serif` |
| `font-display` | `'Bricolage Grotesque', 'Inter', sans-serif` |

### Type Scale

| Token | Size | Weight | Line Height | Letter Spacing |
|---|---|---|---|---|
| `display` | 40px | 700 | 1.1 | -0.02em |
| `h1` | 32px | 700 | 1.2 | -0.02em |
| `h2` | 28px | 600 | 1.2 | -0.01em |
| `h3` | 24px | 600 | 1.25 | -0.01em |
| `h4` | 20px | 600 | 1.3 | 0 |
| `body` | 16px | 400 | 1.5 | 0 |
| `body-sm` | 14px | 400 | 1.5 | 0 |
| `caption` | 13px | 400 | 1.4 | 0 |
| `label` | 14px | 500 | 1.2 | 0 |

## Spacing

| Token | Value |
|---|---|
| `spacing-1` | 4px |
| `spacing-2` | 8px |
| `spacing-3` | 12px |
| `spacing-4` | 16px |
| `spacing-5` | 20px |
| `spacing-6` | 24px |
| `spacing-7` | 28px |
| `spacing-8` | 32px |
| `spacing-10` | 40px |
| `spacing-12` | 48px |
| `spacing-16` | 64px |
| `spacing-20` | 80px |

## Radius

| Token | Value |
|---|---|
| `radius-sm` | 6px |
| `radius` | 8px |
| `radius-md` | 10px |
| `radius-lg` | 12px |
| `radius-xl` | 16px |

## Shadows

| Token | Value |
|---|---|
| `shadow-sm` | `0 1px 2px 0 rgba(0,0,0,0.05)` |
| `shadow` | `0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)` |
| `shadow-md` | `0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)` |
| `shadow-lg` | `0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)` |
| `shadow-card` | `0 4px 16px 0 rgba(0,0,0,0.08)` |

## Notes

- Warm neutrals use `hue 75` with very low chroma.
- Foreground text uses `hue 265` for a softer black.
- Dark mode inverts `L` values while preserving hue/chroma relationships.
- Primary color is classic blue `#2563EB` / `oklch(0.55 0.22 258)`.
