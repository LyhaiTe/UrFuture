
## UrFuture Dashboard Implementation Task List

### Phase 1: Foundation & Layout Setup
- [ ] Create the main `DashboardWorkspace` component file.
- [ ] Set up the base dark theme background and max-width container.
- [ ] Implement the 12-column CSS Grid layout for the main content area (8 cols left, 4 cols right).
- [ ] Add the `useEffect` hook to track the `mounted` state for triggering entrance animations.

### Phase 2: Hero Banner Implementation
- [ ] Build the hero container with gradient background and border.
- [ ] Add the absolute-positioned ambient glow orbs with blur effects.
- [ ] Implement the "On Track" status badge with a pulsing dot.
- [ ] Add the welcome typography and the two CTA buttons ("Continue Mapping", "View Careers").
- [ ] Create the SVG circular progress ring for the "Readiness Score" with a gradient stroke.
- [ ] Apply staggered entrance animations to the hero elements.

### Phase 3: Quick Stats Row
- [ ] Create the 3-column grid container.
- [ ] Build the individual stat cards (Knowledge, Top Match, Pathways).
- [ ] Add the colored icon containers and typography hierarchy.
- [ ] Implement the hover effects (lift and border color change).

### Phase 4: Action Grid Implementation
- [ ] Create the 2x2 grid container.
- [ ] Build the four action cards: Knowledge Mapping, Career Paths, Job Fit Analysis, Transcript Upload.
- [ ] Add the specific accent colors to each card's icon and hover states.
- [ ] Implement the internal progress bar for the "Knowledge Mapping" card.
- [ ] Add the "3 matches" badge to the "Career Paths" card.
- [ ] Ensure the arrow icon animates on hover.

### Phase 5: Milestone Sidebar
- [ ] Build the sidebar container with sticky positioning.
- [ ] Add the header, linear progress bar, and task description.
- [ ] Style the "Continue profile" outline button.
- [ ] Apply the `fadeInLeft` entrance animation.

### Phase 6: Floating Chatbot Button (FAB)
- [ ] Create the fixed-position container in the bottom right.
- [ ] Build the circular gradient button with the robot SVG icon.
- [ ] Add the continuous "ping" background animation.
- [ ] Implement the hover state logic to show/hide the "Hello! 👋" tooltip bubble.
- [ ] Add the tooltip arrow and positioning.

### Phase 7: Polish & Responsiveness
- [ ] Test the layout on mobile screens to ensure the 12-column grid collapses to a single column correctly.
- [ ] Verify that the sticky sidebar behaves correctly on shorter screens.
- [ ] Check all hover states, transitions, and animation timings for smoothness.
- [ ] Ensure color contrast ratios meet accessibility standards for the dark theme.