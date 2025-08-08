# DRE Page Redesign: Reusable Components

This document describes the reusable components created during the DRE page redesign that can be applied to other sections of the application.

## UI Components

### GlassCard
A modern glass-effect card component with customizable appearance.

```typescript
import { GlassCard } from "@/components/ui/glass-card";

<GlassCard
  title="Card Title"
  variant="blue" // default, blue, dark, light, primary
  elevation="medium" // low, medium, high
  hover={true}
  isCollapsible={true}
  headerAction={<Button>Action</Button>}
>
  Content goes here
</GlassCard>
```

### FinancialMetricCard
Card component specifically designed for financial metrics with trend indicators.

```typescript
import { FinancialMetricCard } from "@/components/ui/financial-metric-card";

<FinancialMetricCard
  title="Receita Bruta"
  value={formatCurrency(100000)}
  previousValue={formatCurrency(90000)}
  percentChange={11.1}
  icon={<Icon />}
  trend="up" // up, down, neutral
  trendText="11.1% vs período anterior"
  animationDelay={0.1}
  onClick={() => {}}
/>
```

### Badge Variants
Multiple badge styles for different use cases.

```typescript
import { 
  NeonBadge, 
  GlowBadge, 
  BorderGlowBadge, 
  ValueChangeBadge 
} from "@/components/ui/badge-effects";

// Neon badge with glow effect
<NeonBadge variant="blue">New</NeonBadge>

// Badge with background glow
<GlowBadge variant="default">Featured</GlowBadge>

// Badge with border glow
<BorderGlowBadge variant="green">Active</BorderGlowBadge>

// Badge for showing value changes
<ValueChangeBadge value={10.5} />
```

### ScrollTransformHeader
Header component that transforms on scroll.

```typescript
import { ScrollTransformHeader } from "@/components/ui/scroll-transform-header";

// Usually placed at the top of the page
<ScrollTransformHeader />
```

## Animation Utilities

### Motion Components
A set of animation variants for consistent animations across components.

```typescript
import { motion } from "framer-motion";

// Container with staggered children animation
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    }
  }
};

// Item animation for staggered children
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

// Usage
<motion.div 
  variants={container}
  initial="hidden"
  animate="show"
>
  <motion.div variants={item}>Child element 1</motion.div>
  <motion.div variants={item}>Child element 2</motion.div>
</motion.div>
```

## CSS Utilities

The following utility classes were added to `globals.css` for use across the application:

- `.glass-card`: Glass morphism effect for cards
- `.glass-card-dark`: Dark variant of glass morphism
- `.gradient-text`: Gradient text effect
- `.animated-border`: Border with animation
- `.shimmer-effect`: Shimmer loading effect
- `.float-animation`: Floating animation for elements
- `.img-hover-zoom`: Image zoom on hover
- `.badge-top-right`: Position badge at top right

## Tailwind Extensions

Custom shadows and animations added to `tailwind.config.ts`:

- Shadow utilities: `shadow-subtle`, `shadow-elevated`, `shadow-card-hover`, etc.
- Animation utilities: `animate-pulse-glow`, `animate-fade-in-bottom`, etc.
- Background utilities: `bg-shimmer`, `bg-neon-glow`, etc.

## Implementation Guidelines

When implementing these components in other areas of the application:

1. Maintain consistent color schemes (primary blue accents)
2. Use animations sparingly to avoid overwhelming the user
3. Prioritize responsive design for all components
4. Consider accessibility in color contrasts and animation speeds
5. Reuse the provided components instead of creating new ones

By following these guidelines and using these components, you can maintain a consistent, modern UI throughout the application. 