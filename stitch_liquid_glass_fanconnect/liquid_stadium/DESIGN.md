---
name: Liquid Stadium
colors:
  surface: '#131315'
  surface-dim: '#131315'
  surface-bright: '#39393b'
  surface-container-lowest: '#0e0e10'
  surface-container-low: '#1b1b1d'
  surface-container: '#1f1f21'
  surface-container-high: '#2a2a2c'
  surface-container-highest: '#353436'
  on-surface: '#e5e2e4'
  on-surface-variant: '#c6c6ce'
  inverse-surface: '#e5e2e4'
  inverse-on-surface: '#303032'
  outline: '#909098'
  outline-variant: '#46464d'
  surface-tint: '#bfc5e4'
  primary: '#bfc5e4'
  on-primary: '#292f48'
  primary-container: '#0a1128'
  on-primary-container: '#767c99'
  inverse-primary: '#575d78'
  secondary: '#bdf4ff'
  on-secondary: '#00363d'
  secondary-container: '#00e3fd'
  on-secondary-container: '#00616d'
  tertiary: '#e9c400'
  on-tertiary: '#3a3000'
  tertiary-container: '#c9a900'
  on-tertiary-container: '#4c3f00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#bfc5e4'
  on-primary-fixed: '#141a32'
  on-primary-fixed-variant: '#3f465f'
  secondary-fixed: '#9cf0ff'
  secondary-fixed-dim: '#00daf3'
  on-secondary-fixed: '#001f24'
  on-secondary-fixed-variant: '#004f58'
  tertiary-fixed: '#ffe16d'
  tertiary-fixed-dim: '#e9c400'
  on-tertiary-fixed: '#221b00'
  on-tertiary-fixed-variant: '#544600'
  background: '#131315'
  on-background: '#e5e2e4'
  surface-variant: '#353436'
typography:
  display-lg:
    fontFamily: Outfit
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-md:
    fontFamily: Outfit
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Outfit
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Outfit
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-md:
    fontFamily: Outfit
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  xxl: 64px
  gutter: 20px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style
The design system embodies the "Electric Matchday Night" atmosphere—capturing the high-octane energy of a stadium under floodlights. The brand personality is immersive, futuristic, and premium, targeting a global audience of digitally-native football fans.

The aesthetic follows a **Liquid Glassmorphism** direction. This style utilizes deep translucent layers to create a sense of infinite depth, mimicking the sleek surfaces of modern architectural stadiums. Visuals are defined by high-intensity light sources, neon glows, and fluid motion, ensuring the interface feels alive and responsive to the "pulse" of the match.

## Colors
The palette is centered on the **Deep Midnight Blue** of a night sky over a stadium. 
- **Primary Action (Electric Cyan):** Used for critical paths, interactive states, and high-energy focal points.
- **Premium/AI (Trophy Gold):** Reserved for elite status, AI-driven insights, and celebratory moments.
- **Status (Pitch Green):** Used exclusively for "Live" indicators, positive trends, and pitch-side data.
- **Neutral/Base:** Grayscale is minimized in favor of tinted semi-transparent navies to maintain the liquid glass aesthetic.

## Typography
The typography system balances the technical precision of **Outfit** for headers with the high legibility of **Inter** for data-heavy content.
- Use **Outfit** in Bold or SemiBold weights for all headings to create a modern, geometric structure.
- **Inter** is the workhorse for player stats, match commentary, and UI labels.
- For "Live" scores or clock timers, use tabular figures in Inter to prevent layout shifting during active gameplay.

## Layout & Spacing
The layout follows a **Fluid Grid** model designed to feel like an expansive stadium screen.
- **Desktop:** 12-column grid with wide margins to allow background "floodlight" gradients to bleed through.
- **Mobile:** 4-column grid with tight gutters (16px) to maximize the "Liquid Glass" card surface area.
- **Spacing Rhythm:** Based on a 4px baseline. Use larger increments (40px+) between major sections to emphasize the "wide-open" feel of a pitch.

## Elevation & Depth
Depth is achieved through **optical transparency** rather than traditional shadows.
- **Level 1 (Base):** Deep Midnight Blue (#0A1128).
- **Level 2 (Glass Surfaces):** Semi-transparent navy with a `backdrop-filter: blur(24px) saturate(150%)`.
- **Level 3 (Interactions):** Elements "glow" when elevated. Instead of a drop shadow, use an outer `box-shadow` with the Electric Cyan color at low opacity (20-30%) and a large spread to simulate stadium lighting.
- **Borders:** Use 1px linear gradients (Cyan to Transparent) to define the edges of glass panels, creating a "shimmer" effect.

## Shapes
The shape language is "Streamlined Geometric." Surfaces use a consistent **0.5rem (8px)** corner radius to feel modern and high-tech without becoming too soft or playful. 
- Large containers and immersive cards use `rounded-xl` (24px) to create a distinct frame-within-a-frame look.
- Interactive tags and "Live" badges use pill-shapes to contrast against the structured grid.

## Components
- **Buttons:** Primary buttons use a solid Electric Cyan fill with a subtle inner glow. Secondary buttons use the "Glass" style with a Cyan border.
- **Cards:** The signature "Liquid Glass" component. Must feature a 1px top-left highlight border to simulate light hitting a glass surface.
- **Chips/Badges:** Use Pitch Green for "Live" match status with a pulse animation. Use Trophy Gold for "MVP" or "Premium" badges.
- **Inputs:** Darker than the base surface with a 1px border that illuminates in Electric Cyan upon focus.
- **Match-Day Feed:** A specialized list component with "Neon Thread" vertical lines connecting match events, maintaining the electric night aesthetic.