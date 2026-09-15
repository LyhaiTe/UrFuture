
## UrFuture Dashboard Workspace Plan

### 1. Project Overview
This document outlines the strategic plan for the main student dashboard of the UrFuture platform. The dashboard serves as the central hub where students land after authentication. Its primary goal is to provide an immediate, at-a-glance view of their academic progress, career readiness, and next actionable steps, all within a premium, engaging dark-mode interface.

### 2. User Experience (UX) Strategy
- **Instant Orientation:** Upon login, the student immediately sees their "Readiness Score" and a personalized welcome message, establishing context.
- **Action-Oriented:** The layout is designed to reduce decision fatigue. The "Next Milestone" sidebar and the 2x2 Action Grid provide clear, single-click paths to the most important features.
- **Progress Visualization:** Heavy use of circular progress rings and linear progress bars to gamify the experience and motivate the student to complete their profile.

### 3. Visual Design Strategy
- **Theme:** Deep dark mode (`bg-dark-bg`) to reduce eye strain during long study sessions and make the vibrant brand colors (Cyan, Emerald, Amber, Violet) pop.
- **Layout:** A responsive 12-column grid system. The main content takes up 8 columns, while a sticky sidebar takes up 4 columns on desktop. On mobile, everything stacks vertically.
- **Motion Design:** Strategic use of staggered entrance animations (fade-in, slide-up) to make the dashboard feel dynamic and premium upon load, without overwhelming the user.

### 4. Component Architecture
- **Hero Banner:** A large, gradient-filled container at the top housing the welcome message, primary CTAs, and the main readiness ring.
- **Stats Row:** A 3-column grid of compact metric cards for quick data consumption.
- **Action Grid:** A 2x2 grid of larger, interactive cards that serve as the main navigation to sub-features.
- **Milestone Sidebar:** A persistent card on the right guiding the user to their immediate next task.
- **Floating Action Button (FAB):** A fixed-position chatbot trigger in the bottom right corner.