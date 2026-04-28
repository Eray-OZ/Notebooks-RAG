---
name: Obsidian Prime
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#cbc4d2'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#948e9c'
  outline-variant: '#494551'
  surface-tint: '#cfbcff'
  primary: '#cfbcff'
  on-primary: '#381e72'
  primary-container: '#6750a4'
  on-primary-container: '#e0d2ff'
  inverse-primary: '#6750a4'
  secondary: '#bcc7de'
  on-secondary: '#263143'
  secondary-container: '#3e495d'
  on-secondary-container: '#aeb9d0'
  tertiary: '#c6c6c7'
  on-tertiary: '#2f3131'
  tertiary-container: '#5d5f5f'
  on-tertiary-container: '#d9d9d9'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e9ddff'
  primary-fixed-dim: '#cfbcff'
  on-primary-fixed: '#22005d'
  on-primary-fixed-variant: '#4f378a'
  secondary-fixed: '#d8e3fb'
  secondary-fixed-dim: '#bcc7de'
  on-secondary-fixed: '#111c2d'
  on-secondary-fixed-variant: '#3c475a'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c7'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  title-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: '0'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  label-caps:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  container-max: 1280px
---

## Brand & Style

This design system is built upon the principles of **Modern Minimalism** and **High-Contrast Dark Mode**. The brand personality is authoritative, sophisticated, and technically precise, targeting a discerning audience that values clarity over decoration. 

The aesthetic avoids the "softness" of contemporary trends like glassmorphism or neomorphism. Instead, it embraces a structural, architectural approach. By utilizing solid surface colors and precise 1px borders, the UI evokes a sense of permanence and reliability. The emotional response is one of calm focus, achieved through extreme legibility and intentional negative space.

## Colors

The palette is strictly limited to maintain high visual discipline. **Deep Obsidian (#050505)** serves as the foundation for the environment, while **Slate Grey (#1E293B)** is used exclusively for structural elements like borders and dividers to provide subtle definition without breaking the dark immersion.

**Pure White (#FFFFFF)** is reserved for primary content and high-priority typography to ensure maximum contrast ratios. The single accent, **Deep Violet (#6750A4)**, is used sparingly to draw attention to primary actions and active states. No gradients are permitted; color transitions must be solid and immediate.

## Typography

This design system utilizes **Plus Jakarta Sans** across all levels to maintain a clean, approachable yet professional geometric rhythm. Typography is the primary driver of hierarchy. 

Headlines utilize tighter letter spacing and heavier weights to command attention against the dark background. Body text favors a slightly increased line height (1.6) to ensure comfortable long-form reading and to prevent "vibration" often found in high-contrast dark UIs. Uppercase labels with increased tracking are used for secondary categorization and metadata.

## Layout & Spacing

The layout follows a **Fixed-Fluid hybrid grid**. Main content containers are centered with a maximum width of 1280px, while internal components utilize an 8px square-based rhythm. 

Whitespace is treated as a first-class citizen. Large margins (`xl`) are used to separate major sections, forcing the eye to focus on specific content clusters. Padding within components is generous to reinforce the premium, "un-cramped" feel of the interface.

## Elevation & Depth

In this design system, depth is communicated through **Tonal Layering** and **Structural Outlines** rather than shadows. 

1.  **Level 0 (Background):** Deep Obsidian (#050505).
2.  **Level 1 (Surfaces):** A slightly lighter solid black (#0C0C0C) with a 1px solid Slate Grey (#1E293B) border.
3.  **Level 2 (Modals/Popovers):** Solid surface (#141414) with a more prominent 1px solid border.

Shadows, glows, and blurs are strictly forbidden. To indicate that an element is interactive or "above" the background, the system relies on the contrast between the surface color and its surrounding border.

## Shapes

The shape language is disciplined and consistent. A base **8px (0.5rem)** radius is applied to all standard components, including buttons, cards, and input fields. This "Soft" setting provides a modern touch that takes the edge off the high-contrast color palette without appearing overly playful or bubbly. Larger containers may scale to 12px if necessary, but 8px remains the system default.

## Components

### Buttons
*   **Primary:** Solid Deep Violet (#6750A4) background, Pure White text. No shadow.
*   **Secondary:** Transparent background, 1px Slate Grey border, White text.
*   **Tertiary:** Ghost style, White text, no border.

### Inputs
Fields use a solid background (#0C0C0C) with a 1px Slate Grey border. On focus, the border changes to Deep Violet or Pure White. Labels are always positioned above the field in `label-caps` style.

### Cards
Cards are defined by their 1px Slate Grey (#1E293B) border. They do not have shadows. Background color should match the surface elevation level (e.g., #0C0C0C).

### Feedback Elements
*   **Selection (Checkboxes/Radios):** Use Deep Violet for the active state.
*   **Chips:** Minimalist grey backgrounds with white text; used for filtering or tags.
*   **Lists:** Divided by 1px solid lines in Slate Grey, using generous vertical padding (16px+) to maintain the minimalist rhythm.