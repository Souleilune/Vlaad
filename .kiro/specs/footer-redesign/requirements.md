# Requirements Document

## Introduction

This document specifies the requirements for redesigning the footer of the AGOS-BD web application. The current footer is oversized, unbalanced, and wastes vertical space. The redesigned footer will be compact, professional, and follow modern civic-tech platform conventions while maintaining the AGOS-BD design identity.

## Glossary

- **Footer**: The bottom section of the PublicHome component containing branding, navigation links, and legal information
- **PublicHome_Component**: The React component at `apps/web/components/home/public-home.tsx` that renders the public landing page
- **Design_System**: The AGOS-BD color palette (deepCrimson, softCoral, cleanWhite, softGold) and typography (Nunito)
- **Responsive_Layout**: A layout that adapts from 3-column desktop to stacked mobile sections
- **Bottom_Bar**: A horizontal section at the very bottom of the footer containing copyright and legal links
- **Hover_State**: Visual feedback when a user hovers over an interactive element

## Requirements

### Requirement 1: Reduce Footer Height

**User Story:** As a user, I want the footer to be compact, so that it doesn't dominate the page visually.

#### Acceptance Criteria

1. THE Footer SHALL use reduced vertical padding compared to the current implementation (py-10)
2. THE Footer SHALL use padding values between py-4 and py-6 for the main content area
3. THE Footer SHALL feel similar in height to modern SaaS platforms and map-based applications
4. THE Footer SHALL function as a supporting element rather than a primary section

### Requirement 2: Implement Responsive Three-Column Layout

**User Story:** As a user, I want the footer to organize content clearly on all devices, so that I can easily find navigation links.

#### Acceptance Criteria

1. WHEN the viewport is desktop size, THE Footer SHALL display content in a 3-column grid layout
2. WHEN the viewport is mobile size, THE Footer SHALL stack sections vertically
3. THE Footer SHALL maintain equal spacing between columns on desktop
4. THE Footer SHALL align content consistently across all breakpoints

### Requirement 3: Simplify AGOS-BD Branding Section

**User Story:** As a user, I want the branding section to be compact, so that it doesn't take excessive space.

#### Acceptance Criteria

1. THE Footer SHALL replace the large decorative logo button with a simpler logo and project name treatment
2. THE Footer SHALL display the AGOS-BD name and description text
3. THE Footer SHALL use compact spacing within the branding section
4. THE Footer SHALL maintain brand recognition while reducing visual weight

### Requirement 4: Organize Navigation Links with Clear Headings

**User Story:** As a user, I want navigation links grouped under clear headings, so that I can quickly find what I need.

#### Acceptance Criteria

1. THE Footer SHALL group navigation links under section headings
2. THE Footer SHALL include a "Quick Access" section with links to starter overlay, guide, and post update
3. THE Footer SHALL include an "Account" section with links to create account and sign in
4. THE Footer SHALL use consistent typography for section headings

### Requirement 5: Add Interactive Hover States

**User Story:** As a user, I want visual feedback when hovering over links, so that I know they are clickable.

#### Acceptance Criteria

1. WHEN a user hovers over a footer link, THE Footer SHALL change the link's visual appearance
2. THE Footer SHALL use color transitions for hover states
3. THE Footer SHALL maintain accessibility contrast ratios during hover states
4. THE Footer SHALL apply hover states consistently to all interactive elements

### Requirement 6: Implement Bottom Bar with Legal Information

**User Story:** As a user, I want to see copyright and legal information, so that I understand the platform's terms.

#### Acceptance Criteria

1. THE Footer SHALL include a bottom bar section separated by a top border
2. THE Bottom_Bar SHALL display "© 2026 AGOS-BD" text
3. THE Bottom_Bar SHALL display "Community Blood Request and Availability Coordination" text
4. THE Bottom_Bar SHALL include links to Privacy Policy and Terms of Service
5. WHEN the viewport is desktop size, THE Bottom_Bar SHALL arrange content horizontally
6. WHEN the viewport is mobile size, THE Bottom_Bar SHALL stack content vertically

### Requirement 7: Apply Visual Hierarchy with Subtle Borders

**User Story:** As a user, I want clear visual separation between footer sections, so that content is easy to scan.

#### Acceptance Criteria

1. THE Footer SHALL use a subtle top border instead of large visual dividers
2. THE Footer SHALL use border opacity values that maintain readability
3. THE Bottom_Bar SHALL be separated from the main footer content with a border
4. THE Footer SHALL avoid excessive decorative elements

### Requirement 8: Maintain Design System Consistency

**User Story:** As a user, I want the footer to match the AGOS-BD design identity, so that the experience feels cohesive.

#### Acceptance Criteria

1. THE Footer SHALL use the deepCrimson background color
2. THE Footer SHALL use cleanWhite text color
3. THE Footer SHALL use the Nunito typeface
4. THE Footer SHALL maintain proper contrast ratios for accessibility
5. THE Footer SHALL use consistent font sizes throughout

### Requirement 9: Optimize Typography for Readability

**User Story:** As a user, I want footer text to be readable, so that I can easily consume information.

#### Acceptance Criteria

1. THE Footer SHALL use modern typography with consistent font sizes
2. THE Footer SHALL use font sizes between text-xs and text-sm for body content
3. THE Footer SHALL use appropriate line-height values for readability
4. THE Footer SHALL use font-weight values that create clear hierarchy

### Requirement 10: Remove Excessive Spacing

**User Story:** As a user, I want the footer to use space efficiently, so that I don't have to scroll unnecessarily.

#### Acceptance Criteria

1. THE Footer SHALL reduce gaps between sections compared to the current implementation
2. THE Footer SHALL use gap values between gap-4 and gap-6 for section spacing
3. THE Footer SHALL eliminate empty space that doesn't serve a functional purpose
4. THE Footer SHALL maintain adequate spacing for touch targets on mobile devices

### Requirement 11: Ensure Accessibility Compliance

**User Story:** As a user with accessibility needs, I want the footer to be accessible, so that I can navigate it with assistive technologies.

#### Acceptance Criteria

1. THE Footer SHALL maintain WCAG 2.1 AA contrast ratios for all text
2. THE Footer SHALL use semantic HTML elements for structure
3. THE Footer SHALL ensure all interactive elements are keyboard accessible
4. THE Footer SHALL provide appropriate ARIA labels where needed

### Requirement 12: Preserve Existing Functionality

**User Story:** As a user, I want all existing footer interactions to continue working, so that I don't lose functionality.

#### Acceptance Criteria

1. THE Footer SHALL maintain all existing click handlers for navigation buttons
2. THE Footer SHALL preserve the ability to open the starter overlay
3. THE Footer SHALL preserve the ability to scroll to the guide section
4. THE Footer SHALL preserve the ability to open the report modal
5. THE Footer SHALL maintain all existing Link components for account actions

### Requirement 13: Optimize for Mobile Responsiveness

**User Story:** As a mobile user, I want the footer to work well on small screens, so that I can access all features.

#### Acceptance Criteria

1. WHEN the viewport is mobile size, THE Footer SHALL stack all sections vertically
2. THE Footer SHALL use appropriate padding values for mobile devices
3. THE Footer SHALL ensure touch targets meet minimum size requirements (44x44px)
4. THE Footer SHALL prevent horizontal scrolling on mobile devices

### Requirement 14: Implement Professional Civic-Tech Styling

**User Story:** As a user, I want the footer to look professional, so that I trust the platform.

#### Acceptance Criteria

1. THE Footer SHALL follow government/public-service design conventions
2. THE Footer SHALL avoid excessive decorative elements
3. THE Footer SHALL prioritize clarity and functionality over visual flourish
4. THE Footer SHALL feel appropriate for a civic-tech emergency response platform
