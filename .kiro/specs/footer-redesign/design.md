# Design Document: Footer Redesign

## Overview

This design document specifies the technical approach for redesigning the footer component in the AGOS-BD PublicHome component. The redesign transforms the current oversized footer into a compact, professional footer that follows modern civic-tech platform conventions while maintaining the AGOS-BD design identity.

### Current State

The existing footer (located in `apps/web/components/home/public-home.tsx`) uses:
- Large vertical padding (`py-10`)
- Decorative logo button with neumorphic styling
- Three-column grid layout on desktop
- Excessive spacing between sections (`gap-8`)
- No bottom bar for legal information
- Limited hover states on interactive elements

### Target State

The redesigned footer will:
- Use compact vertical padding (`py-5` for main content, `py-3` for bottom bar)
- Replace decorative logo with simple text-based branding
- Maintain responsive three-column desktop layout that stacks on mobile
- Implement consistent hover states with color transitions
- Add dedicated bottom bar for copyright and legal links
- Reduce overall vertical space by approximately 40%

### Design Goals

1. **Compactness**: Reduce vertical space consumption while maintaining readability
2. **Professionalism**: Follow government/civic-tech design patterns
3. **Clarity**: Improve visual hierarchy with subtle borders and typography
4. **Consistency**: Maintain AGOS-BD design system (deepCrimson, cleanWhite, Nunito)
5. **Functionality**: Preserve all existing interactions and navigation

## Architecture

### Component Structure

The footer remains an inline component within the PublicHome component. No extraction to a separate component is required for this redesign.

```
<footer> (deepCrimson background, cleanWhite text)
  ├── <div> Main Content Container (max-w-6xl, responsive grid)
  │   ├── <div> Branding Section
  │   │   ├── <div> Logo Text (AGOS-BD)
  │   │   └── <p> Description
  │   ├── <div> Quick Access Section
  │   │   ├── <p> Section Heading
  │   │   └── <div> Link List (buttons for internal actions)
  │   └── <div> Account Section
  │       ├── <p> Section Heading
  │       └── <div> Link List (Next.js Links for auth pages)
  └── <div> Bottom Bar (border-top separator)
      └── <div> Legal Content Container
          ├── <p> Copyright
          ├── <p> Tagline
          └── <div> Legal Links (Privacy, Terms)
```

### Layout System

**Desktop Layout (lg breakpoint and above)**:
- Three-column grid: `lg:grid-cols-3`
- Equal column distribution with slight emphasis on branding column
- Horizontal bottom bar with space-between alignment

**Mobile Layout (below lg breakpoint)**:
- Stacked vertical sections
- Full-width columns
- Stacked bottom bar content with centered alignment

### Responsive Breakpoints

Following Tailwind's default breakpoints:
- `sm`: 640px (minor padding adjustments)
- `md`: 768px (no specific changes)
- `lg`: 1024px (activates three-column grid)

## Components and Interfaces

### Footer Component Props

The footer does not accept props. It uses the following state and refs from the parent PublicHome component:

```typescript
// State dependencies
const [introVisible, setIntroVisible] = useState(true);
const [reportModalOpen, setReportModalOpen] = useState(false);

// Ref dependencies
const guideSectionRef = useRef<HTMLElement | null>(null);
```

### Interactive Elements

**Button Elements** (for internal navigation):
```typescript
<button
  type="button"
  className="text-left text-cleanWhite/82 transition-colors duration-200 hover:text-cleanWhite"
  onClick={() => setIntroVisible(true)}
>
  Starter overlay
</button>
```

**Link Elements** (for route navigation):
```typescript
<Link
  href="/register"
  className="text-cleanWhite/82 transition-colors duration-200 hover:text-cleanWhite"
>
  Create account
</Link>
```

### Typography Hierarchy

**Section Headings**:
- Font size: `text-xs`
- Font weight: `font-bold`
- Text transform: `uppercase`
- Letter spacing: `tracking-[0.18em]`
- Color: `text-cleanWhite/72`

**Body Links**:
- Font size: `text-sm`
- Font weight: `font-normal`
- Color: `text-cleanWhite/82` (default), `text-cleanWhite` (hover)
- Transition: `transition-colors duration-200`

**Description Text**:
- Font size: `text-sm`
- Line height: `leading-6`
- Color: `text-cleanWhite/76`

**Legal Text**:
- Font size: `text-xs`
- Color: `text-cleanWhite/62`

## Data Models

No new data models are required. The footer uses existing state and functions from the PublicHome component:

### State Dependencies

```typescript
interface FooterStateDependencies {
  introVisible: boolean;
  setIntroVisible: (visible: boolean) => void;
  setReportModalOpen: (open: boolean) => void;
  guideSectionRef: React.RefObject<HTMLElement>;
}
```

### Event Handlers

```typescript
// Scroll to guide section
const scrollToGuide = () => {
  guideSectionRef.current?.scrollIntoView({ 
    behavior: "smooth", 
    block: "start" 
  });
};

// Show starter overlay
const showStarter = () => {
  setIntroVisible(true);
};

// Open report modal
const openReportModal = () => {
  setReportModalOpen(true);
};
```

## Error Handling

### Graceful Degradation

**Scroll Behavior**:
- If `guideSectionRef.current` is null, the scroll action fails silently
- No error boundary required as this is non-critical functionality

**Link Navigation**:
- Next.js Link components handle navigation errors internally
- 404 pages are handled by Next.js routing

**Button Interactions**:
- State setters are guaranteed to exist from parent component
- No additional error handling required

### Accessibility Fallbacks

**Keyboard Navigation**:
- All interactive elements are natively keyboard accessible (button, Link)
- No custom keyboard handlers required

**Screen Readers**:
- Semantic HTML provides implicit ARIA roles
- No additional ARIA attributes required for simple navigation

## Testing Strategy

### Unit Testing Approach

This feature is a **UI layout and styling redesign** focused on:
- Visual hierarchy and spacing
- Responsive layout behavior
- CSS styling and hover states
- Component structure

**Property-based testing is NOT applicable** for this feature because:
1. It involves UI rendering and layout, not algorithmic logic
2. There are no universal properties that hold across inputs
3. The feature is primarily about visual design and CSS
4. Testing requires visual regression or snapshot testing

### Recommended Testing Strategy

**1. Visual Regression Testing**
- Use snapshot tests to capture rendered HTML structure
- Compare before/after screenshots at multiple breakpoints
- Verify spacing, typography, and color values

**2. Responsive Layout Testing**
- Test at mobile (375px), tablet (768px), and desktop (1280px) viewports
- Verify grid layout switches from stacked to three-column at lg breakpoint
- Confirm bottom bar layout changes from stacked to horizontal

**3. Interaction Testing**
- Verify all button click handlers trigger correct state changes
- Confirm Link components navigate to correct routes
- Test hover states apply correct CSS classes

**4. Accessibility Testing**
- Verify WCAG 2.1 AA contrast ratios (deepCrimson #8B0000 on cleanWhite #FAFAFA)
- Confirm keyboard navigation works for all interactive elements
- Test with screen reader to verify semantic structure

**5. Integration Testing**
- Verify footer renders correctly within PublicHome component
- Confirm state dependencies (introVisible, setReportModalOpen) work as expected
- Test scroll behavior with guideSectionRef

### Example Test Cases

**Unit Test Example** (using React Testing Library):
```typescript
describe('Footer', () => {
  it('renders all navigation sections', () => {
    render(<PublicHome />);
    expect(screen.getByText('Quick Access')).toBeInTheDocument();
    expect(screen.getByText('Account')).toBeInTheDocument();
  });

  it('triggers starter overlay when button clicked', () => {
    render(<PublicHome />);
    const starterButton = screen.getByText('Starter overlay');
    fireEvent.click(starterButton);
    // Verify overlay becomes visible
  });

  it('applies hover styles to links', () => {
    render(<PublicHome />);
    const link = screen.getByText('Create account');
    expect(link).toHaveClass('text-cleanWhite/82');
    fireEvent.mouseEnter(link);
    // Verify hover class is applied
  });
});
```

**Snapshot Test Example**:
```typescript
describe('Footer Snapshot', () => {
  it('matches snapshot at desktop viewport', () => {
    const { container } = render(<PublicHome />);
    const footer = container.querySelector('footer');
    expect(footer).toMatchSnapshot();
  });
});
```

**Accessibility Test Example**:
```typescript
describe('Footer Accessibility', () => {
  it('meets WCAG contrast requirements', () => {
    render(<PublicHome />);
    const footer = screen.getByRole('contentinfo');
    // Use axe-core or similar to verify contrast ratios
  });

  it('allows keyboard navigation', () => {
    render(<PublicHome />);
    const firstLink = screen.getByText('Starter overlay');
    firstLink.focus();
    expect(firstLink).toHaveFocus();
  });
});
```

### Manual Testing Checklist

- [ ] Footer height is visibly reduced compared to current implementation
- [ ] Three-column layout displays correctly on desktop (≥1024px)
- [ ] Sections stack vertically on mobile (<1024px)
- [ ] All hover states transition smoothly
- [ ] Starter overlay button shows the overlay
- [ ] Guide button scrolls to guide section
- [ ] Post update button opens report modal
- [ ] Account links navigate to correct pages
- [ ] Bottom bar displays copyright and legal links
- [ ] Text is readable at all viewport sizes
- [ ] Colors match AGOS-BD design system
- [ ] Spacing feels balanced and professional

## Implementation Notes

### Styling Approach

**Tailwind Utility Classes**:
- Use Tailwind's spacing scale consistently (`py-5`, `gap-6`, `mt-4`)
- Leverage opacity modifiers for text colors (`text-cleanWhite/82`)
- Apply responsive prefixes for breakpoint-specific styles (`lg:grid-cols-3`)

**Color Palette**:
- Background: `bg-deepCrimson` (#8B0000)
- Primary text: `text-cleanWhite` (#FAFAFA)
- Secondary text: `text-cleanWhite/82` (82% opacity)
- Muted text: `text-cleanWhite/72`, `text-cleanWhite/62`
- Borders: `border-cleanWhite/10` (10% opacity)

**Transitions**:
- Use `transition-colors duration-200` for smooth hover effects
- Apply to all interactive elements (buttons, links)

### Spacing System

**Vertical Spacing**:
- Main content padding: `py-5` (1.25rem / 20px)
- Bottom bar padding: `py-3` (0.75rem / 12px)
- Section gap: `gap-6` (1.5rem / 24px)
- Link gap: `gap-3` (0.75rem / 12px)

**Horizontal Spacing**:
- Container padding: `px-6 sm:px-8 lg:px-10`
- Max width: `max-w-6xl` (72rem / 1152px)
- Centered: `mx-auto`

### Accessibility Considerations

**Semantic HTML**:
- Use `<footer>` element for landmark navigation
- Use `<nav>` if grouping multiple navigation sections (optional)
- Use proper heading hierarchy (not applicable for footer)

**Contrast Ratios**:
- deepCrimson (#8B0000) on cleanWhite (#FAFAFA): 10.35:1 (AAA)
- cleanWhite (#FAFAFA) on deepCrimson (#8B0000): 10.35:1 (AAA)
- All text meets WCAG 2.1 AA requirements (4.5:1 for normal text, 3:1 for large text)

**Keyboard Navigation**:
- All buttons and links are focusable by default
- Tab order follows visual order (top to bottom, left to right)
- No custom focus management required

**Touch Targets**:
- Minimum touch target size: 44x44px (WCAG 2.1 AAA)
- Links and buttons have adequate padding for mobile interaction
- Spacing between interactive elements prevents accidental taps

### Performance Considerations

**Rendering Performance**:
- No additional components or state required
- No new event listeners or effects
- Minimal re-renders (only when parent state changes)

**CSS Performance**:
- Tailwind utilities are optimized and purged in production
- No custom CSS animations or transitions beyond simple color changes
- No layout shifts during responsive breakpoint changes

### Browser Compatibility

**Target Browsers**:
- Modern evergreen browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)

**CSS Features Used**:
- CSS Grid (supported in all modern browsers)
- CSS Transitions (widely supported)
- Opacity modifiers (standard CSS)
- No experimental features or vendor prefixes required

## Migration Strategy

### Implementation Steps

1. **Backup Current Implementation**
   - Copy current footer JSX to a comment or separate file for reference

2. **Update Main Content Container**
   - Change padding from `py-10` to `py-5`
   - Adjust gap from `gap-8` to `gap-6`
   - Update grid columns from `lg:grid-cols-[1.1fr_0.9fr_0.9fr]` to `lg:grid-cols-3`

3. **Simplify Branding Section**
   - Remove decorative logo button with neumorphic styling
   - Replace with simple text-based logo
   - Adjust description text size and spacing

4. **Update Navigation Sections**
   - Add section headings with consistent typography
   - Apply hover states to all links and buttons
   - Ensure consistent spacing between links

5. **Add Bottom Bar**
   - Create new bottom bar section with border-top
   - Add copyright text and tagline
   - Add legal links (Privacy Policy, Terms of Service)
   - Implement responsive layout (horizontal on desktop, stacked on mobile)

6. **Test and Refine**
   - Verify responsive behavior at all breakpoints
   - Test all interactive elements
   - Check accessibility with keyboard and screen reader
   - Validate against requirements

### Rollback Plan

If issues arise, the original footer implementation can be restored by:
1. Reverting the changes in `public-home.tsx`
2. No database migrations or API changes are involved
3. No breaking changes to other components

### Deployment Considerations

- Changes are purely frontend (no backend changes)
- No environment variables or configuration changes required
- Can be deployed independently of other features
- No feature flags required (simple CSS/HTML changes)

## Future Enhancements

### Potential Improvements

1. **Social Media Links**
   - Add social media icons (Facebook, Twitter) if AGOS-BD establishes social presence
   - Place in branding section or create dedicated section

2. **Newsletter Signup**
   - Add email input for newsletter subscription
   - Place in dedicated fourth column or bottom bar

3. **Language Selector**
   - Add language toggle for English/Filipino
   - Place in bottom bar or top navigation

4. **Sitemap Link**
   - Add link to full sitemap page
   - Place in bottom bar legal links section

5. **Accessibility Statement**
   - Add link to accessibility statement page
   - Place in bottom bar legal links section

6. **Dark Mode Support**
   - Implement dark mode variant with adjusted colors
   - Use Tailwind's dark mode utilities

### Maintenance Considerations

- Footer content should be reviewed quarterly for accuracy
- Legal links should be updated when policies change
- Contact information should be kept current
- Monitor analytics for footer link usage to inform future improvements
