
## 1. Global Layout & Navigation

* **Header**

  * Use sticky positioning with a backdrop blur effect.
  * Place the UrFuture logo on the left.
  * Center the main navigation links.
  * Add hover underline animations to navigation links.
  * Place the primary **Student Sign In** button on the right.
  * Include a hamburger menu for mobile breakpoints.

* **Background**

  * Add fixed ambient lighting orbs behind the main content layer.
  * Use subtle cyan, emerald, and blue glowing effects.
  * Ensure the lighting remains visually subtle and does not interfere with readability.

## 2. Landing Page Sections

### A. Hero Section

* **Layout**

  * Use a two-column layout on desktop.
  * Place text content on the left and the main visual on the right.
  * Stack the columns vertically on mobile devices.

* **Visuals**

  * Display a floating 3D AI robot illustration.
  * Apply a gentle bobbing animation.
  * Add a cyan ambient glow behind the robot.

* **Content**

  * Add a pill-shaped badge above the main heading.
  * Use a large gradient-text headline.
  * Add a descriptive subheadline explaining the platform.
  * Include a prominent primary CTA button with an arrow icon.

### B. University Logo Carousel

* **Layout**

  * Create a full-width section that spans edge-to-edge.

* **Behavior**

  * Implement an infinite horizontal scrolling marquee animation.
  * Pause the marquee animation when the user hovers over it.

* **Styling**

  * Place university logos inside subtle dark panels.
  * Use rounded corners for each logo panel.
  * Scale logos slightly on hover.
  * Add a cyan glow effect when hovering over a logo.

### C. Platform Preview & Features

#### Platform Preview

Create a 3-step visual card demonstrating the core UrFuture workflow:

1. **Upload**
2. **AI Mapping**
3. **Match**

Each step should visually communicate how student information moves through the platform.

#### Features Grid

* Use a 3-column grid on desktop.

* Display 6 feature cards.

* Each card should contain:

  * Colored icon container
  * Feature title
  * Short description

* Add hover interactions:

  * Slight card lift
  * Border color highlight
  * Subtle visual transition

### D. How It Works & Grounding

#### How It Works

* Use a 4-column grid on desktop.
* Present the platform architecture as a step-by-step process.
* Give each step a large numbered badge.
* Keep the explanation short and easy to understand.

#### Grounding

* Use a 3-column grid.
* Highlight:

  * Trust and reliability
  * Trusted data sources such as O*NET and NEA
  * Human counselor safety and review gate

### E. Testimonials & Footer

#### Testimonials

* Use a 3-column grid on desktop.
* Each testimonial card should include:

  * Student quote
  * Avatar initials
  * Student name
  * Institution

#### Footer

* Use a clean single-line layout on desktop.

* Display the text-based **UrFuture** brand name.

* Include the tagline:

  **Learn • Plan • Achieve**

* Include copyright information.

* Ensure the footer stacks appropriately on smaller screens.

## 3. Authentication Modal Specification

### A. Modal Container

* **Overlay**

  * Cover the entire screen.
  * Use a dark backdrop.
  * Apply a heavy blur effect to the background.

* **Card**

  * Center the authentication card on the screen.
  * Use a constrained maximum width.
  * Add a subtle cyan shadow.
  * Place the UrFuture logo in the center of the header.
  * Add an absolute-positioned close button in the top-right corner.

### B. Form Layout & Fields

#### Mode Toggle

Add a segmented control at the top of the form with two options:

* **Sign In**
* **Create Account**

Switching between the two modes should update the form dynamically.

#### Standard Fields

Both authentication modes should support:

* Email
* Password

Inputs should use floating or static labels and display a brand-cyan focus ring when active.

#### Registration Fields

When **Create Account** is selected, conditionally render:

* Full Name
* Institution
* Academic Level

Use dropdown inputs for Institution and Academic Level.

Registration must happen before email/password sign-in. Registration creates the
student account, while sign-in only verifies an existing account and never
creates one. Registration passwords must contain at least 8 characters and
include an uppercase letter, lowercase letter, number, and symbol.

#### Google OAuth

* Add a prominent white **Continue with Google** button.
* Place it below the password field.
* Place it above the primary submit button.

### C. States & Feedback

#### Loading State

* Display a full-screen spinner overlay inside the authentication modal while API requests are being processed.
* Individual action buttons should also display inline loading spinners when appropriate.
* Prevent duplicate submissions while a request is in progress.

#### Error State

* Display a red-tinted alert box at the top of the form when:

  * Form validation fails.
  * Authentication fails.
  * Registration fails.
  * The API returns an error.

* Error messages should clearly explain what the user needs to correct.

The form must show a clear error when a student attempts to sign in before
registering or uses an incorrect password. It must not use an offline fallback
that logs the student in without a persisted account.

#### Footer

* Add a small, muted privacy protocol disclaimer at the bottom of the modal.
* Keep the disclaimer visually secondary to the authentication form.
* Ensure it remains readable on both desktop and mobile layouts.
