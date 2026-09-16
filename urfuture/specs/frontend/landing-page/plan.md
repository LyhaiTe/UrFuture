
## 1. Project Overview

This document outlines the strategic plan for the public-facing entry points of the **UrFuture** platform. The goal is to create a high-converting, visually striking landing page that clearly communicates the value proposition of the AI-driven career advisor, followed by a seamless and frictionless authentication experience for Cambodian students.

## 2. Design System & Visual Identity

* **Theme:** Dark mode by default, using deep slate/navy backgrounds to reduce eye strain and make accent colors stand out.
* **Primary Accent:** Brand Cyan for primary CTAs, active states, and key highlights.
* **Secondary Accents:**

  * **Emerald:** Success and verification states.
  * **Amber:** Warnings and skill gaps.
  * **Violet:** Advanced features and AI-related elements.
* **Ambient Lighting:** Use subtle, blurred background gradients to create depth without distracting from the main content.
* **Typography:** Use a clean and modern sans-serif font.

  * Extrabold for major headings.
  * Medium/Semibold for UI elements.
  * Relaxed line-height for body text.

## 3. User Flow Strategy

### 3.1 Discovery

The user lands on the homepage. The hero section should immediately communicate trust through university logos and highlight the platform's main value, including AI-powered transcript parsing.

### 3.2 Education

The user scrolls through the **How It Works** and **Features** sections to understand how UrFuture works and how its AI recommendations are supported by grounded data.

### 3.3 Conversion

The user can click **Student Sign In** or **Get Started** to begin the authentication process.

### 3.4 Authentication

The user is presented with a clean authentication modal. They can:

* Sign in using Google OAuth.
* Register before using email/password sign-in.
* Sign in later with the email and password used during registration.
* Provide details such as:

  * Institution
  * Level

The authentication experience should remain simple and avoid unnecessary page reloads.

Students cannot sign in with email/password before registering. The application
must not silently create an account during sign-in.

### 3.5 Onboarding

After successful authentication, the user is automatically routed to the main UrFuture dashboard.

## 4. Component Architecture Strategy

### 4.1 Landing Page

Build the landing page as a single scrollable composition made up of distinct section components.

The landing page should include:

* Hero section
* University/trust section
* How It Works section
* Features section
* AI capability highlights
* Call-to-action section
* Footer

Use CSS animations such as:

* Floating elements
* Subtle transitions
* Infinite scrolling marquees
* Hover interactions

Animations should improve the experience without distracting users from the main content.

### 4.2 Authentication Modal

Create a centralized and reusable authentication overlay component.

The modal should support:

* Login state
* Registration state
* Google OAuth
* Academic information fields
* Form validation
* Loading states
* Error handling
* Successful authentication feedback

The login and registration states should be handled dynamically within the same component to avoid unnecessary page reloads.

## 5. Future UI Enhancements

The following features can be considered for future iterations:

* **Khmer Language Toggle:** Add a localized Khmer/English language switcher in the header.
* **Registration Micro-interactions:** Add subtle success animations after completing registration.
* **Live Dashboard Preview:** Introduce an interactive tab system on the landing page that allows users to preview features such as the dashboard before signing in.
* **Enhanced Micro-interactions:** Add subtle hover, transition, and feedback animations throughout the interface.
