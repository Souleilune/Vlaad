/**
 * Touch Target Size Verification Tests for Footer Redesign
 * 
 * Validates Requirements:
 * - 10.4: Maintain adequate spacing for touch targets on mobile devices
 * - 13.3: Ensure touch targets meet minimum size requirements (44x44px)
 * - 13.4: Prevent horizontal scrolling on mobile devices
 * 
 * Note: These tests verify the CSS classes and structure that ensure proper
 * touch target sizes. Actual pixel measurements require browser rendering
 * and should be verified through manual testing or E2E tests.
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PublicHome } from './public-home';

// Create a test wrapper with QueryClient
function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

function renderWithProviders(ui: React.ReactElement) {
  return render(ui, { wrapper: TestWrapper });
}

describe('Footer Touch Target Verification', () => {
  describe('Interactive Element Identification', () => {
    it('should identify all interactive elements in the footer', () => {
      const { container } = renderWithProviders(<PublicHome />);
      const footer = container.querySelector('footer');
      expect(footer).toBeInTheDocument();

      // Quick Access section buttons - query within footer only
      const footerButtons = footer?.querySelectorAll('button') || [];
      const buttonTexts = Array.from(footerButtons).map(btn => btn.textContent);
      
      expect(buttonTexts).toContain('Starter overlay');
      expect(buttonTexts).toContain('Guide');
      expect(buttonTexts).toContain('Post update');

      // Account section links
      const footerLinks = footer?.querySelectorAll('a') || [];
      const linkTexts = Array.from(footerLinks).map(link => link.textContent);
      
      expect(linkTexts).toContain('Create account');
      expect(linkTexts).toContain('Sign in');
      expect(linkTexts).toContain('Privacy Policy');
      expect(linkTexts).toContain('Terms of Service');
    });
  });

  describe('Touch Target CSS Classes (Requirement 13.3)', () => {
    it('should apply appropriate text size classes to footer buttons for adequate touch targets', () => {
      const { container } = renderWithProviders(<PublicHome />);
      const footer = container.querySelector('footer');
      expect(footer).toBeInTheDocument();

      // Get all button elements in the footer
      const buttons = footer?.querySelectorAll('button') || [];
      
      // Footer buttons should have text-sm class (14px) which with default padding
      // provides adequate touch target size
      buttons.forEach((button) => {
        const classList = Array.from(button.classList);
        // Check that buttons have appropriate sizing classes
        // text-sm (14px) with default button padding should provide adequate touch area
        expect(
          classList.some(cls => cls.includes('text-'))
        ).toBe(true);
      });
    });

    it('should apply appropriate text size classes to footer links for adequate touch targets', () => {
      const { container } = renderWithProviders(<PublicHome />);
      const footer = container.querySelector('footer');
      expect(footer).toBeInTheDocument();

      // Get all link elements in the footer
      const links = footer?.querySelectorAll('a') || [];
      
      // Footer links should have text-sm or text-xs classes
      links.forEach((link) => {
        const classList = Array.from(link.classList);
        // Check that links have appropriate sizing classes
        expect(
          classList.some(cls => cls.includes('text-'))
        ).toBe(true);
      });
    });
  });

  describe('Touch Target Spacing (Requirement 10.4)', () => {
    it('should apply gap classes between interactive elements in Quick Access section', () => {
      const { container } = renderWithProviders(<PublicHome />);
      const footer = container.querySelector('footer');
      
      // Find the Quick Access section container
      const quickAccessSection = Array.from(footer?.querySelectorAll('div') || [])
        .find(div => div.textContent?.includes('Quick Access'));
      
      expect(quickAccessSection).toBeTruthy();
      
      // The container with buttons should have gap-3 class (0.75rem = 12px)
      const buttonContainer = quickAccessSection?.querySelector('.flex.flex-col');
      expect(buttonContainer).toBeTruthy();
      
      const classList = Array.from(buttonContainer?.classList || []);
      expect(classList.some(cls => cls.includes('gap-'))).toBe(true);
    });

    it('should apply gap classes between interactive elements in Account section', () => {
      const { container } = renderWithProviders(<PublicHome />);
      const footer = container.querySelector('footer');
      
      // Find the Account section container
      const accountSection = Array.from(footer?.querySelectorAll('div') || [])
        .find(div => div.textContent?.includes('Account'));
      
      expect(accountSection).toBeTruthy();
      
      // The container with links should have gap-3 class
      const linkContainer = accountSection?.querySelector('.flex.flex-col');
      expect(linkContainer).toBeTruthy();
      
      const classList = Array.from(linkContainer?.classList || []);
      expect(classList.some(cls => cls.includes('gap-'))).toBe(true);
    });
  });

  describe('Mobile Responsiveness (Requirement 13.4)', () => {
    it('should have responsive padding classes to prevent horizontal overflow', () => {
      const { container } = renderWithProviders(<PublicHome />);
      const footer = container.querySelector('footer');
      expect(footer).toBeInTheDocument();

      // Get the main content container
      const mainContainer = footer?.querySelector('.mx-auto');
      expect(mainContainer).toBeTruthy();

      const classList = Array.from(mainContainer?.classList || []);
      
      // Should have responsive padding (px-6 sm:px-8 lg:px-10)
      expect(classList.some(cls => cls.includes('px-'))).toBe(true);
      
      // Should have max-width constraint
      expect(classList.some(cls => cls.includes('max-w-'))).toBe(true);
    });

    it('should have responsive grid layout that stacks on mobile', () => {
      const { container } = renderWithProviders(<PublicHome />);
      const footer = container.querySelector('footer');
      expect(footer).toBeInTheDocument();

      // Get the main content container with grid
      const gridContainer = footer?.querySelector('.grid');
      expect(gridContainer).toBeTruthy();

      const classList = Array.from(gridContainer?.classList || []);
      
      // Should have lg:grid-cols-3 for desktop three-column layout
      expect(classList.includes('lg:grid-cols-3')).toBe(true);
      
      // Should have gap class for spacing
      expect(classList.some(cls => cls.includes('gap-'))).toBe(true);
    });

    it('should have responsive layout for bottom bar', () => {
      const { container } = renderWithProviders(<PublicHome />);
      const footer = container.querySelector('footer');
      expect(footer).toBeInTheDocument();

      // Get the bottom bar container
      const bottomBar = footer?.querySelector('.border-t');
      expect(bottomBar).toBeTruthy();

      const innerContainer = bottomBar?.querySelector('.flex');
      expect(innerContainer).toBeTruthy();

      const classList = Array.from(innerContainer?.classList || []);
      
      // Should have flex-col for mobile stacking
      expect(classList.includes('flex-col')).toBe(true);
      
      // Should have lg:flex-row for desktop horizontal layout
      expect(classList.includes('lg:flex-row')).toBe(true);
    });
  });

  describe('Accessibility and Structure', () => {
    it('should use semantic footer element', () => {
      const { container } = renderWithProviders(<PublicHome />);
      const footer = container.querySelector('footer');
      expect(footer).toBeInTheDocument();
      expect(footer?.tagName).toBe('FOOTER');
    });

    it('should have proper button types for interactive elements', () => {
      const { container } = renderWithProviders(<PublicHome />);
      const footer = container.querySelector('footer');
      
      const buttons = footer?.querySelectorAll('button') || [];
      buttons.forEach((button) => {
        // All buttons should have type="button" to prevent form submission
        expect(button.getAttribute('type')).toBe('button');
      });
    });

    it('should use Next.js Link components for navigation', () => {
      const { container } = renderWithProviders(<PublicHome />);
      const footer = container.querySelector('footer');
      
      const links = footer?.querySelectorAll('a') || [];
      
      // Should have links for account and legal pages
      expect(links.length).toBeGreaterThan(0);
      
      // Check that links have href attributes
      links.forEach((link) => {
        expect(link.getAttribute('href')).toBeTruthy();
      });
    });
  });

  describe('Visual Feedback (Requirement 5 - Hover States)', () => {
    it('should apply transition classes to footer buttons', () => {
      const { container } = renderWithProviders(<PublicHome />);
      const footer = container.querySelector('footer');
      
      const buttons = footer?.querySelectorAll('button') || [];
      buttons.forEach((button) => {
        const classList = Array.from(button.classList);
        // Should have transition-colors class for smooth hover effects
        expect(classList.includes('transition-colors')).toBe(true);
      });
    });

    it('should apply transition classes to footer links', () => {
      const { container } = renderWithProviders(<PublicHome />);
      const footer = container.querySelector('footer');
      
      const links = footer?.querySelectorAll('a') || [];
      links.forEach((link) => {
        const classList = Array.from(link.classList);
        // Should have transition-colors class for smooth hover effects
        expect(classList.includes('transition-colors')).toBe(true);
      });
    });

    it('should apply hover state classes to interactive elements', () => {
      const { container } = renderWithProviders(<PublicHome />);
      const footer = container.querySelector('footer');
      
      const interactiveElements = footer?.querySelectorAll('button, a') || [];
      interactiveElements.forEach((element) => {
        const classList = Array.from(element.classList);
        // Should have hover: classes for visual feedback
        expect(classList.some(cls => cls.includes('hover:'))).toBe(true);
      });
    });
  });
});
