<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Design System (2026 Modern Creative Dashboard)

### Concept
"Modern Creative Dashboard" - A complete redesign with modern UI patterns, glassmorphism, floating elements, and bold interactions. Not a standard whiteboard UI, but a creative platform.

### Color Palette
Distinctive purple-primary palette that stands out from typical teal/green SaaS colors:
- **Surface**: #FAFAF9 (warm white, not creamy)
- **Ink**: #09090B (zinc black - more modern than pure black)
- **Primary**: #7C3AED (vibrant purple - creative and distinctive)
- **Primary Light**: #EDE9FE (lavender for background accents)
- **Primary Dark**: #5B21B6 (deep purple for hover states)
- **Secondary**: #F97316 (vibrant orange - bold complement)
- **Secondary Light**: #FFEDD5 (light orange for accents)
- **Muted**: #71717A (neutral gray for secondary text)
- **Border**: #E4E4E7 (light, clean border)
- **Paper**: #FFFFFF (pure white for cards)
- **Studio**: #09090B (dark background for headers)
- **Danger**: #DC2626 (clean red)
- **Star**: #F59E0B (amber for favorites)

### Typography
Expressive font combination for modern, techy feel:
- **Display Font**: Space Grotesk (modern, geometric, techy but playful)
- **Body Font**: Inter (clean, highly readable, contemporary)
- **Type Scale**:
  - H1: 4rem / -0.02em / Space Grotesk 700
  - H2: 2.5rem / -0.015em / Space Grotesk 600
  - H3: 1.5rem / normal / Space Grotesk 600
  - Body: 1rem / 1.6 / Inter 400
  - Small: 0.875rem / 1.5 / Inter 500

### Design Principles
1. **Vibrant & Bold**: Bold, energetic colors, not safe or cold
2. **Modern & Techy**: Space Grotesk gives modern technology feel
3. **Clean & Crisp**: Light borders, refined shadows
4. **Expressive Typography**: Headlines that truly stand out
5. **Playful Interactions**: Fun and satisfying hover states
6. **Visual Hierarchy**: Clear information architecture with spacing

### Component Patterns (New 2026)

#### Landing Page
- Feature badge (pill with icon)
- Asymmetric split layout (1.2fr/0.8fr)
- Feature grid with icon cards
- Radial gradient background blobs (purple/orange)
- Floating preview with glass effect

#### Board Cards
- Hover-reveal quick action buttons (edit, duplicate)
- Glassmorphism icon buttons (backdrop-blur)
- Group hover effects
- More dramatic lift and shadow on hover
- Action buttons with icon SVGs

#### Navigation (App Header)
- User avatar circle with initial
- User name display next to avatar
- Increased spacing (gap-8)
- Consistent vertical padding

#### Toolbar
- Search input with icon (magnifying glass)
- Icon positioned absolute left
- Enhanced placeholder text
- Better visual hierarchy

#### Forms
- Grouped label/input structure
- Clear vertical spacing
- Improved visual rhythm
- Better focus states

#### Empty States
- Centered icon in circle
- Purple-tinted background
- Larger icon size
- Better visual hierarchy

#### Buttons
- Enhanced shadow with purple tint
- More dramatic lift on hover
- Icon SVGs for visual interest
- Better visual feedback

### Visual Identity
- Gradient accent on panel borders (purple to orange)
- Radial gradient background spots for depth
- Button lift on hover (-1px transform)
- Star scale animation on hover
- Chip "is-on" state uses purple background
- Glassmorphism effects (backdrop-blur)
- Icon SVGs throughout

### CSS Patterns
- Inline styles for dynamic colors (Tailwind limitation)
- `.group` hover effects for nested elements
- `.group-hover:opacity-100` for reveal patterns
- Icon SVGs with stroke-width 2 for consistent weight
- 180-240ms ease transitions for smooth interactions

### Accessibility
- Focus-visible outlines with primary purple
- Reduced motion respected (all transitions disabled)
- Proper ARIA labels and roles
- Color contrast compliant
- Keyboard navigation supported
- Icon buttons with aria-label
