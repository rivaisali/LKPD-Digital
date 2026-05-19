---
name: Cultural Math Journey
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f4'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#4a454f'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f0f1f1'
  outline: '#7b7580'
  outline-variant: '#ccc3d1'
  surface-tint: '#6e5098'
  primary: '#61438a'
  on-primary: '#ffffff'
  primary-container: '#7a5ba4'
  on-primary-container: '#f4e6ff'
  inverse-primary: '#d8b9ff'
  secondary: '#8e4e14'
  on-secondary: '#ffffff'
  secondary-container: '#ffab69'
  on-secondary-container: '#783d01'
  tertiary: '#942b3a'
  on-tertiary: '#ffffff'
  tertiary-container: '#b44350'
  on-tertiary-container: '#ffe5e5'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#eddcff'
  primary-fixed-dim: '#d8b9ff'
  on-primary-fixed: '#280450'
  on-primary-fixed-variant: '#55377e'
  secondary-fixed: '#ffdcc4'
  secondary-fixed-dim: '#ffb780'
  on-secondary-fixed: '#2f1400'
  on-secondary-fixed-variant: '#6f3800'
  tertiary-fixed: '#ffdadb'
  tertiary-fixed-dim: '#ffb2b6'
  on-tertiary-fixed: '#40000d'
  on-tertiary-fixed-variant: '#852030'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 44px
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 26px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-padding: 24px
  gutter: 16px
  stack-sm: 12px
  stack-md: 20px
  stack-lg: 32px
---

## Brand & Style

The brand personality is **educational, vibrant, and culturally appreciative**. This design system is crafted specifically for children, balancing the rigor of mathematics with the softness of Gorontalo’s Karawo textile motifs. The goal is to evoke a sense of curiosity and achievement rather than academic pressure.

The visual style is a blend of **Modern / Friendly** and **Soft Tactile**. It utilizes generous whitespace, rounded geometry, and large interactive surfaces to remain accessible to younger users. The aesthetic integrates traditional patterns with clean, contemporary app structures, creating a bridge between heritage and digital learning.

Key traits:
- **Optimistic:** Bright colors and celebratory feedback loops.
- **Supportive:** Guided character interactions and clear visual cues.
- **Clear:** High-legibility typography and simplified coordinate systems.

## Colors

The palette is anchored by a **Deep Purple** (Primary) that denotes the "Nita" character and core navigational elements. **Vibrant Orange** and **Soft Pink** are used for activity categorizations—such as "Refleksi" or "Translasi"—helping children color-code their learning path.

- **Primary (Purple):** Used for primary actions, branding, and major headers.
- **Secondary (Orange):** Used for interactive math elements and celebratory milestones.
- **Tertiary (Pink/Coral):** Used for "Check" actions and specific transformation modules.
- **Semantic Green:** Reserved exclusively for "Correct" feedback and successful task completion.
- **Neutral (Off-White/Warm Grey):** Surfaces use a soft off-white to reduce eye strain and provide a warm, paper-like feel for the "Cerita" (Story) sections.

## Typography

The design system uses **Plus Jakarta Sans** across all levels. Its rounded terminals and open apertures provide a friendly, approachable look that is highly legible for early readers. 

- **Weight Strategy:** Use Bold (700) or ExtraBold (800) for titles to create a strong hierarchy. Use Medium (500) for body text to ensure it feels substantial on screen.
- **Readability:** Line heights are intentionally generous (approx 1.5x) to prevent text from feeling cramped for children.
- **Contextual Styles:** Mathematical labels and coordinate points should use the `label-sm` style for precision without sacrificing the "friendly" rounded aesthetic.

## Layout & Spacing

This design system employs a **Fluid Grid** model with high horizontal margins to center the focus on the learning content.

- **Grid:** A 4-column system for mobile, expanding to 8 columns for tablets.
- **Margins:** A standard 24px margin is maintained on the edges of the device to ensure interactive elements are not too close to the bezel.
- **Vertical Rhythm:** Content follows an 8px base unit. Character dialogue bubbles are separated from math grids by `stack-lg` (32px) to clearly differentiate "Story" from "Work."
- **Touch Targets:** All interactive elements (buttons, sliders, coordinate points) must maintain a minimum hit area of 48x48px to accommodate children's motor skills.

## Elevation & Depth

Visual hierarchy is established through **Tonal Layers** and **Soft Ambient Shadows**.

- **Surfaces:** The primary background is flat. Content modules (like the coordinate grid or Nita's dialogue) are housed in "Cards" with a white fill and a very subtle, light-grey border or a soft, diffused shadow.
- **Shadow character:** Use a Y-offset of 4px and a blur of 12px with a very low opacity (10% Black) to create a "lifted paper" effect.
- **Active State:** When a button is pressed, it should "depress" (reduce Y-offset) rather than glow, reinforcing a tactile, physical interaction.

## Shapes

The shape language is consistently **Rounded**. Sharp corners are avoided to maintain a safe, kid-friendly atmosphere.

- **Primary Components:** Buttons and main containers use a 16px (1rem) radius.
- **Secondary Components:** Smaller input fields and chips use an 8px (0.5rem) radius.
- **Iconography:** Icons should feature rounded caps and corners. 
- **Character Bubbles:** Use "squircle" shapes for dialogue, combining high corner radii with organic curves to match the cartoon illustration style.

## Components

### Buttons
- **Primary Action:** Solid Purple fill with White `label-lg` text.
- **Secondary/Secondary:** Outlined Purple with `label-lg` text.
- **Activity Selectors:** Large square cards with a central icon and bottom-aligned label, utilizing activity-specific colors (Orange, Pink, Green, Blue).

### Progress Indicators
- **Step Dots:** Located below the header, showing progress through a lesson. Active steps use a solid color; inactive steps are light grey.

### Interactive Math Elements
- **Coordinate Grid:** Clean grey lines with labeled axes. Interactive points should be styled as "Glowing" circles in the primary or secondary color when selected.
- **Sliders:** A thick, rounded track with a large circular thumb for easy dragging.

### Character Dialogue
- Housed in a white card with Nita's avatar partially overlapping the container. Use the `body-lg` font style for the text within.

### Feedback Toasts
- **Success:** Full-width green banner with a checkmark icon and bold white text ("Hebat!", "Luar Biasa!").