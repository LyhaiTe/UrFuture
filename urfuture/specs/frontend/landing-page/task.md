
## Phase 1: Foundation & Global Styles

* Configure the Tailwind CSS theme with:

  * Custom dark mode colors
  * Brand Cyan palette
  * Emerald palette
  * Amber palette
  * Violet palette

* Set up global CSS animations for:

  * Floating AI robot animation
  * Infinite university logo scrolling animation
  * Smooth hover and transition effects

* Create the base `LandingPage` layout wrapper.

* Implement the fixed ambient background lighting using subtle cyan, emerald, and blue gradients.

## Phase 2: Landing Page Implementation

* Build the sticky `Header` component.

  * Add responsive navigation.
  * Add mobile hamburger menu.
  * Add the **Student Sign In** CTA.

* Implement the `Hero` section.

  * Integrate the floating AI robot image.
  * Add the cyan ambient glow.
  * Implement gradient typography.
  * Add the primary CTA button.

* Develop the full-width `UniversityLogoCarousel`.

  * Implement infinite CSS scrolling.
  * Add pause-on-hover behavior.
  * Add hover scaling and cyan glow effects.

* Create the `FeaturesGrid` component.

  * Implement 6 feature cards.
  * Use a 3-column desktop layout.
  * Add responsive layouts for smaller screens.
  * Add card lift and border highlight hover effects.

* Build the `HowItWorks` section.

  * Implement the 4-column step layout.
  * Add numbered badges.
  * Make the section responsive.

* Build the `GroundedData` section.

  * Implement the 3-column layout.
  * Highlight trusted data sources.
  * Highlight the counselor safety/review gate.

* Implement the `Testimonials` section.

  * Create the 3-column testimonial layout.
  * Add avatar initials, student names, quotes, and institutions.

* Build the `Footer` component.

  * Add the text-based **UrFuture** branding.
  * Add the **Learn • Plan • Achieve** tagline.
  * Add copyright information.
  * Ensure responsive behavior.

## Phase 3: Authentication Modal Implementation

* Create the `StudentAuthModal` component.

  * Add the full-screen blurred backdrop.
  * Add the centered authentication card.
  * Add the UrFuture logo.
  * Add the close button.

* Implement the segmented authentication toggle:

  * `Sign In`
  * `Create Account`

* Build the authentication form inputs.

  * Email
  * Password
  * Focus states
  * Labels
  * Validation styling

* Add conditional registration fields:

  * Full Name
  * Institution
  * Academic Level

* Enforce registration passwords with at least 8 characters, including an
  uppercase letter, lowercase letter, number, and symbol.
* Require registration before email/password sign-in.
* Display API errors for unknown accounts and invalid passwords.
* Remove the Academic Track field.

* Add the **Continue with Google** button.

  * Place it directly below the password field.
  * Place it above the primary submit button.

* Implement the primary submit button.

  * Add loading spinner state.
  * Prevent duplicate submissions while loading.

* Implement the error alert box.

  * Display validation errors.
  * Display API errors.
  * Use the defined red-tinted error styling.

* Add the privacy protocol disclaimer at the bottom of the modal.

## Phase 4: Integration & State Management

* Connect the **Student Sign In** button to open the `StudentAuthModal`.

* Connect the **Get Started** button to open the authentication modal.

* Implement authentication form submission logic.

  * Handle login API requests.
  * Handle registration API requests.
  * Handle loading states.
  * Handle API errors.
  * Do not auto-login through an offline fallback.

* Implement Google OAuth integration.

  * Connect the frontend button to the backend OAuth endpoint.
  * Handle the OAuth redirect.
  * Handle successful authentication.
  * Handle authentication errors.

* Pass the authenticated user object back to the parent application.

* Update the global authentication state after successful login or registration.

* Redirect authenticated students to the main dashboard.

## Phase 5: QA, Polish & Accessibility

* Test the landing page across:

  * Mobile
  * Tablet
  * Desktop

* Verify responsive behavior for all landing page sections and authentication components.

* Test the university logo carousel.

  * Verify smooth infinite scrolling.
  * Verify pause-on-hover behavior.
  * Ensure there are no visible layout shifts.

* Verify accessibility.

  * Add appropriate `aria-label` attributes.
  * Ensure interactive elements are keyboard accessible.
  * Verify focus states.
  * Ensure modal controls are accessible through keyboard navigation.

* Check color contrast for all text and interactive elements against the dark background.

* Test authentication validation and error states.

* Verify that a new student can register successfully.
* Verify that an existing student can sign in on a later visit.
* Verify that an unregistered email cannot sign in.
* Verify that an incorrect password cannot sign in.
* Verify that registration rejects an existing email.

* Verify the authentication modal:

  * Opens correctly from both CTAs.
  * Closes using the close button.
  * Closes when clicking the backdrop.
  * Handles loading states correctly.
  * Does not submit duplicate requests.

* Perform final UI polish and ensure animations remain smooth across supported screen sizes.
