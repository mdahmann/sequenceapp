# Sequence Design Guidelines

## Design Philosophy

Our design system follows brutalist principles while maintaining accessibility and usability. The key aspects are:

1. **Brutalist Aesthetic**
   - Strong borders and shadows
   - High contrast elements
   - Grid-based layouts
   - Monumental typography
   - Raw, honest interfaces

2. **Core Values**
   - Accessibility first
   - Responsive design
   - Performance focused
   - Consistent interaction patterns
   - Clear visual hierarchy

## Brand Identity

### Typography
- **Primary Font**: Space Grotesk
  - Weights: 300, 400, 500, 600, 700
  - Used for all text elements
  - Features: ss01, ss02, cv01, cv02, cv03

### Color System

#### Light Mode
```css
--background: 0 0% 98%
--foreground: 240 10% 3.9%
--card: 0 0% 100%
--primary: 270 95% 35%
--secondary: 240 5% 96%
--muted: 240 5% 96%
--accent: 270 95% 35%
--destructive: 0 84.2% 60.2%
--border: 240 6% 65%
```

#### Dark Mode
```css
--background: 0 0% 7%
--foreground: 0 0% 100%
--card: 0 0% 9%
--primary: 270 95% 75%
--secondary: 0 0% 13%
--muted: 0 0% 13%
--accent: 270 95% 75%
--destructive: 0 62% 65%
--border: 0 0% 100%
```

### Grid System
- Background grid using SVG patterns
- Light mode: Black lines with 5% opacity
- Dark mode: White lines with 10% opacity
- Mask gradient for fade effect

## Components

### Cards
```css
.brutalist-card {
  - Background: white (light) / card color (dark)
  - Border: 2px solid with 30% opacity
  - Padding: 1.5rem (24px)
  - Shadow: 4px offset, black/white with 10% opacity
  - Hover state: subtle background change
}
```

### Buttons

#### Primary Button
```css
.brutalist-button-primary {
  - Background: primary color
  - Text: white
  - Font: bold, uppercase, tracking-wide
  - Shadow: 4px offset
  - Hover: 90% opacity
}
```

#### Secondary Button
```css
.brutalist-button-secondary {
  - Background: white/transparent
  - Border: 2px solid with 30% opacity
  - Hover: secondary color background
}
```

#### Destructive Button
```css
.brutalist-button-destructive {
  - Background: destructive color
  - Text: white
  - Hover: 90% opacity
}
```

### Form Elements

#### Inputs
```css
.brutalist-input {
  - Background: white (light) / background (dark)
  - Border: 2px solid with 30% opacity
  - Padding: 0.5rem horizontal, 1rem vertical
  - Shadow: 2px offset
  - Focus: ring effect with primary color
}
```

### Tags

#### Primary Tag
```css
.tag-primary {
  - Background: white
  - Border: 2px solid primary color (50% opacity)
  - Text: primary color
  - Uppercase, small text
}
```

#### Secondary Tag
```css
.tag-secondary {
  - Background: white/secondary
  - Border: 2px solid border color
  - Text: foreground color
}
```

#### Accent Tag
```css
.tag-accent {
  - Background: white
  - Border: 2px solid accent color
  - Text: accent color
}
```

## Typography Scale

### Headings
- H1: 4xl (mobile) / 6xl (desktop)
- H2: 3xl (mobile) / 5xl (desktop)
- H3: 2xl (mobile) / 4xl (desktop)
- Body: base (mobile) / lg (desktop)

All headings use:
- Font weight: bold
- Tracking: tighter
- Font features: ss01, ss02, cv01, cv02, cv03

## Spacing

- Card padding: 1.5rem (24px)
- Button padding: 1.5rem horizontal, 0.5rem vertical
- Input padding: 1rem horizontal, 0.5rem vertical
- Grid gap: 1rem (16px) base, 1.5rem (24px) for larger sections

## Interaction States

### Focus
- Ring effect: 2px width
- Ring color: primary color at 50% opacity
- No default outline

### Hover
- Cards: Subtle background change
- Buttons: Opacity reduction to 90%
- Interactive elements: Smooth transition (300ms)

### Disabled
- Opacity: 50%
- Maintain shape and structure
- Remove hover effects

## Accessibility

### Color Contrast
- Maintain WCAG 2.1 AA standard
- Light mode: Dark text on light backgrounds
- Dark mode: Light text on dark backgrounds

### Interactive Elements
- Clear focus states
- Hover feedback
- Adequate touch targets (minimum 44px)

### Motion
- Respect reduced-motion preferences
- Smooth transitions (300ms default)
- Subtle animations for feedback

## Layout Guidelines

### Containers
- Max-width: 64rem (1024px)
- Responsive padding: 1rem (mobile) / 1.5rem (desktop)
- Grid-based: 12 columns
- Gutters: 1rem (16px)

### Breakpoints
- Mobile: 0-640px
- Tablet: 641-1024px
- Desktop: 1025px+

### Z-index Scale
1. Base content: 0
2. Dropdowns/Tooltips: 10
3. Sticky elements: 20
4. Modals/Dialogs: 50
5. Toasts/Notifications: 100

## Best Practices

1. **Consistency**
   - Use provided component classes
   - Maintain spacing scale
   - Follow typography hierarchy
   - Use design tokens for colors

2. **Responsive Design**
   - Mobile-first approach
   - Fluid typography
   - Flexible layouts
   - Touch-friendly targets

3. **Performance**
   - Optimize images
   - Minimize CSS
   - Use utility classes
   - Lazy load when possible

4. **Accessibility**
   - Semantic HTML
   - ARIA labels
   - Keyboard navigation
   - Screen reader support 