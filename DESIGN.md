---
name: E-Com Store
description: Algerian COD e-commerce with bold streetwear energy
colors:
  background: "oklch(1 0 0)"
  foreground: "oklch(0.142 0.004 285.951)"
  primary: "oklch(0.228 0.006 285.926)"
  primary-foreground: "oklch(0.985 0 0)"
  secondary: "oklch(0.967 0.001 286.375)"
  muted: "oklch(0.967 0.001 286.375)"
  muted-foreground: "oklch(0.532 0.013 285.804)"
  accent: "oklch(0.228 0.006 285.926)"
  destructive: "oklch(0.577 0.245 27.325)"
  border: "oklch(0.92 0.004 286.32)"
  ring: "oklch(0.655 0.012 285.805)"
typography:
  display:
    fontFamily: '"Figtree Variable", sans-serif'
    fontSize: "clamp(2rem, 5vw, 3.5rem)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: '"Figtree Variable", sans-serif'
    fontSize: "clamp(1.5rem, 3vw, 2.25rem)"
    fontWeight: 700
    lineHeight: 1.2
  title:
    fontFamily: '"Figtree Variable", sans-serif'
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: '"Figtree Variable", sans-serif'
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: '"Figtree Variable", sans-serif'
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.02em"
rounded:
  sm: "0.27rem"
  md: "0.36rem"
  lg: "0.45rem"
  xl: "0.63rem"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
  xxl: "3rem"
components:
  button-default:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.md}"
    padding: "0.625rem 1rem"
    typography: "{typography.label}"
  button-outline:
    backgroundColor: transparent
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "0.625rem 1rem"
    border: "1px solid {colors.border}"
  button-ghost:
    backgroundColor: transparent
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "0.625rem 1rem"
  card-default:
    backgroundColor: "{colors.background}"
    rounded: "{rounded.xl}"
    padding: "{spacing.lg}"
    shadow: "0 1px 2px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.04)"
  input-default:
    backgroundColor: transparent
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: "0.25rem 0.75rem"
    border: "1px solid {colors.border}"
---

# Design System: The Casbah Edit

## 1. Overview

**Creative North Star: "The Casbah Edit"**

The Casbah Edit brings Algerian street energy to e-commerce. It's bold, graphic, and unapologetic — like walking through a medina at golden hour where every storefront competes for your attention with typography, color, and confidence. This is not a polite shopping cart. It's a drop, a destination, a statement.

The system rejects generic SaaS e-commerce templates, sterile marketplace density, and over-designed startup tropes. Instead it leans into high-contrast typography, product-as-hero imagery, and rhythmic spacing that keeps the eye moving. Dark mode is the primary soul; light mode is the clean alternative.

**Key Characteristics:**
- Typography-forward: bold weights, tight tracking, generous scale jumps
- Product-first: large imagery, breathing room around every item
- Confident dark: high-contrast nocturnal palette as default
- Responsive elevation: flat at rest, lifted on interaction
- Sharp and graphic: tight padding, flat surfaces, crisp edges
- Local character: Algerian flavor without cliché

## 2. Colors

A restrained neutral palette in the purple-gray spectrum (OKLCH hue ~285-286). The current system uses one near-black primary with muted secondary tones. Designed for high contrast.

### Primary
- **Near-Black (oklch(0.228 0.006 285.926))**: All primary buttons, active states, text-heavy surfaces. This is the anchor — nearly black with a whisper of purple warmth.

### Neutral
- **Background (oklch(1 0 0))**: Page canvas in light mode. Pure white.
- **Foreground (oklch(0.142 0.004 285.951))**: Body text and high-emphasis content. Near-black.
- **Muted (oklch(0.967 0.001 286.375))**: Secondary surface fills, hover backgrounds.
- **Muted Foreground (oklch(0.532 0.013 285.804))**: Secondary text, metadata, placeholders.
- **Border (oklch(0.92 0.004 286.32))**: Card borders, dividers, input strokes.
- **Ring (oklch(0.655 0.012 285.805))**: Focus ring indicator.
- **Destructive (oklch(0.577 0.245 27.325))**: Error states, destructive actions.

### Named Rules
**The High Contrast Rule.** Foreground vs. background maintains a minimum 10:1 contrast ratio at all times. Muted foreground against background stays above 4.5:1. No low-contrast text, no decorative gray-on-gray.

## 3. Typography

**Display Font:** Figtree Variable (sans-serif)
**Body Font:** Figtree Variable (sans-serif)

A single-family system using Figtree's variable weight axis for range. Figtree is modern, warm, and slightly condensed — it carries the bold personality without needing a second face.

**Character:** Confident and slightly compressed. Tight letter-spacing in display sizes, generous leading in body. The weight contrast between Display (ExtraBold 800) and Body (Regular 400) creates the drama.

### Hierarchy
- **Display** (ExtraBold 800, clamp(2rem, 5vw, 3.5rem), 1.1 line-height, -0.02em tracking): Hero headlines only. Used once per section for maximum impact.
- **Headline** (Bold 700, clamp(1.5rem, 3vw, 2.25rem), 1.2 line-height): Section headers, feature titles.
- **Title** (Semibold 600, 1.125rem, 1.3 line-height): Card titles, product names, navigation.
- **Body** (Regular 400, 0.9375rem, 1.6 line-height): Paragraphs, descriptions, content. Max line length 70ch.
- **Label** (Medium 500, 0.8125rem, 1.4 line-height, 0.02em letter-spacing): Buttons, badges, metadata, form labels.

### Named Rules
**The One Weight Jump Rule.** Never use two adjacent weights. If body is 400, the next tier is 600, never 500. The gap ensures hierarchy is felt, not guessed.

## 4. Elevation

Flat by default, responsive on interaction. Surfaces sit on the same plane until the user engages — then shadows lift them forward. This keeps the interface grounded and honest while providing tactile feedback for interactive elements.

Cards use a minimal ambient shadow at rest (`0 1px 2px rgba(0,0,0,0.05)`) that deepens on hover. Buttons shift down 1px on active press (`translateY(1px)`). Modals and sheets float above with a semi-transparent backdrop.

### Shadow Vocabulary
- **Ambient (rest)** (`0 1px 2px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.04)`): Card surfaces at rest.
- **Hover (lifted)** (`0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)`): Card hover state.
- **Active (press)** (`translateY(1px)` on buttons, no shadow change): Button active state.
- **Modal (elevated)** (`0 20px 25px rgba(0,0,0,0.15), 0 8px 10px rgba(0,0,0,0.1)`): Dialogs, sheets, popovers.

### Named Rules
**The Ground-At-Rest Rule.** No element casts a shadow unless it's being interacted with or is a floating overlay (modal, sheet, tooltip). Flat surfaces are the default. Shadows signal attention.

## 5. Components

### Buttons
Sharp and graphic. Flat surfaces with no gradient, no glow, no border-radius above rounded-md. States are communicated through background opacity shifts and a 1px downward press.

- **Shape:** rounded-md (0.36rem). Clean, not pill.
- **Primary (default):** Near-black background (`--primary`), white text. Hover: 80% opacity. Active: translateY(1px).
- **Outline:** Transparent background, border (`--border`), full-opacity text. Hover: muted fill. Active: press.
- **Ghost:** Transparent, text only. Hover: muted fill. No border.
- **Destructive:** Red-tinted background (`--destructive/10`), red text (`--destructive`). Hover: 20% tint.
- **Link:** Text only, underline on hover. No padding changes.
- **Sizes:** default (9), xs (6), sm (8), lg (10), icon (9), icon-xs (6), icon-sm (8), icon-lg (10). Padding scales with size.

### Cards
Product containers with a single border/ring treatment. Flexible internal layout via subcomponents (Header, Title, Description, Content, Footer, Action).

- **Corner Style:** rounded-xl (0.63rem). Generous but not soft.
- **Background:** Card surface inherits `--card` (same as `--background` in light mode, slightly lighter than `--background` in dark).
- **Border:** One subtle ring (`ring-1 ring-foreground/10`). No shadow at rest.
- **Internal Padding:** 1.5rem vertical (`py-6`), 1.5rem horizontal (`px-6`). Sm size reduces to 1rem.
- **Image Integration:** First-child images get rounded top corners automatically. The card adjusts padding when an image is present (`has-[>img:first-child]:pt-0`).

### Inputs / Selects
Clean and minimal. Flat background with a visible stroke. Focus state uses a 3px ring in the ring color.

- **Style:** Transparent background, 1px border (`--border`), rounded-lg (0.45rem).
- **Focus:** Border shifts to `--ring` color + 3px ring at 50% opacity.
- **Error:** Border shifts to `--destructive` + ring in destructive/20.
- **Disabled:** 50% opacity, not-allowed cursor.

### Badges
Compact, label-style tags used for categories, status, and active filters.

- **Style:** Rounded-md (0.36rem), 2px horizontal padding, 1px vertical, 0.75rem font-size, medium weight.
- **Default:** Near-black bg, white text.
- **Secondary:** Muted bg, muted text.
- **Status variants:** Amber, emerald, blue, green, red — each with a 100-level tint background and 800-level text.

### Navigation (Top Bar)
Sticky header with backdrop blur, minimal chrome. Active page indicated by a small underline bar.

- **Style:** `background/95` with `backdrop-blur-sm`, bottom border (`--border`), 1px `shadow-xs`.
- **Desktop:** Horizontal link row with text labels. Active state: semibold weight + 2px underline bar.
- **Mobile:** Hamburger opens a sheet drawer with stacked navigation.
- **Logo:** Rotated-square diamond icon + "E-Com Store" wordmark in bold tracking-tight.

### Skeleton
Loading placeholders for product grids. Matches card shape exactly so transitions are seamless.

- **Style:** Rounded-xl (0.63rem) with subtle shimmer animation. Image area at 4:3 aspect ratio. Text lines at varying widths.

## 6. Do's and Don'ts

### Do:
- **Do** use high contrast between text and background. Foreground vs. background should never dip below 10:1.
- **Do** let typography carry the energy. Display sizes should be ExtraBold with tight tracking.
- **Do** keep cards flat at rest with `ring-1` for definition. Shadow only on interaction.
- **Do** use the full Figtree weight range for hierarchy — 400 / 600 / 700 / 800 jumps.
- **Do** center product imagery with generous padding. Products are heroes, not thumbnails.
- **Do** vary spacing between sections for rhythm. Not every section needs the same padding.

### Don't:
- **Don't** use generic SaaS e-commerce templates or marketplace density.
- **Don't** use gradient text (`background-clip: text` with gradients). Single solid colors only.
- **Don't** use side-stripe borders (border-left >1px as decorative accent).
- **Don't** use glassmorphism as a default (blurs and glass cards).
- **Don't** use the hero-metric template (big number + small label + gradient accent).
- **Don't** use identical card grids with icon + heading + text repeated endlessly.
- **Don't** use em dashes. Use commas, colons, semicolons, periods, or parentheses.
- **Don't** animate CSS layout properties. Use transforms and opacity only.
- **Don't** use bounce or elastic easing. Stick to ease-out-quart/quint/expo curves.
- **Don't** wrap everything in a container. Most things don't need one.
