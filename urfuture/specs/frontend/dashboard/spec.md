
## UrFuture Dashboard Workspace Specification

### 1. Global Layout & Container
- **Background:** Solid dark background (`bg-dark-bg`).
- **Container:** Max-width constrained (`max-w-7xl`) with responsive horizontal padding (`px-4 sm:px-6 lg:px-8`).
- **Grid System:** CSS Grid with a 12-column layout for the main content area below the hero.

### 2. Hero Banner Section
- **Container:** Full-width rounded rectangle (`rounded-2xl`) with a subtle gradient background (`from-dark-panel via-dark-panelAlt to-dark-panel`) and a thin border.
- **Ambient Effects:** Two absolute-positioned, heavily blurred orbs (Cyan and Emerald) behind the content to create depth.
- **Status Badge:** A small pill-shaped element at the top left showing "On Track" with a pulsing green dot.
- **Typography:**
  - Welcome text: Large, extrabold, white.
  - Subtext: Medium gray, with the readiness percentage highlighted in brand cyan.
- **Buttons:** Two buttons side-by-side. Primary is solid cyan with an arrow icon; Secondary is outlined/dark with a subtle hover state.
- **Readiness Ring (Right Side):**
  - An SVG circular progress indicator.
  - Background track is dark gray; foreground track uses a cyan-to-emerald gradient.
  - Centered text showing the percentage (e.g., "82%").
  - A subtle glow effect behind the ring.

### 3. Quick Stats Row (Left Column, Top)
- **Layout:** 3-column grid (`grid-cols-3`).
- **Card Design:** Dark panel background, thin border, rounded corners.
- **Content:**
  - Top: Small colored icon container + uppercase label (e.g., "KNOWLEDGE").
  - Middle: Large, extrabold number/percentage.
  - Bottom: Small descriptive text (e.g., "42 courses mapped").
- **Interaction:** Hovering lifts the card slightly (`-translate-y-1`) and changes the border color to match the icon's accent color.

### 4. Action Grid (Left Column, Bottom)
- **Layout:** 2x2 grid.
- **Card Design:** Similar to stats cards but taller, with more internal padding.
- **Content Structure:**
  - Top-left: Larger icon container (12x12).
  - Top-right (Optional): Status badge (e.g., "3 matches").
  - Middle: Title and short description.
  - Bottom: Either a linear progress bar (for Knowledge Mapping) or a "Continue ->" link.
- **Colors:** Each card is assigned a specific brand accent (Cyan for Knowledge, Emerald for Careers, Amber for Job Fit, Violet for Upload).
- **Interaction:** Hovering changes the border color, adds a colored shadow, lifts the card, and animates the arrow icon to the right.

### 5. Milestone Sidebar (Right Column)
- **Positioning:** Sticky positioning (`sticky top-6`) so it remains visible while scrolling.
- **Content:**
  - Header with an icon and "NEXT MILESTONE" label.
  - Linear progress bar showing completion (e.g., 75%).
  - Title and description of the current task.
  - Full-width "Continue profile" button with a cyan outline and transparent background.

### 6. Floating Chatbot Button (FAB)
- **Positioning:** Fixed to the bottom right corner (`fixed bottom-8 right-8`), high z-index.
- **Design:** Circular button with a cyan gradient background and a drop shadow. Contains a custom robot SVG icon.
- **Animations:**
  - A continuous "ping" animation on the background to draw attention.
  - On hover, a white tooltip bubble appears above the button with a small arrow pointing down.
  - The button scales up slightly on hover.

### 7. Animation Specifications
- **Entrance Animations:** Elements should not appear all at once. Use a `mounted` state to trigger CSS animations.
  - `fadeInUp`: For text and cards (opacity 0 to 1, translateY 20px to 0).
  - `fadeInLeft`: For the sidebar (opacity 0 to 1, translateX -20px to 0).
  - `scaleIn`: For the readiness ring and FAB.
- **Staggered Delays:** Apply incremental delay classes (`delay-100`, `delay-200`, etc.) to create a cascading load effect from top to bottom.
- **Continuous Animations:** `pulse` for status dots, `float` for ambient background orbs, `ping` for the chatbot button.