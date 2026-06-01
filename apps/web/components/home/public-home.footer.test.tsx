/**
 * Footer Mobile Layout Tests
 * 
 * Tests for task 6.1: Test footer layout at mobile breakpoint (<1024px)
 * 
 * Requirements tested:
 * - 2.2: Responsive layout stacks sections vertically on mobile
 * - 6.6: Bottom bar stacks content vertically on mobile
 * - 13.1: Footer stacks all sections vertically on mobile
 * - 13.2: Footer uses appropriate padding values for mobile devices
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PublicHome } from './public-home';

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock MapShell component to avoid leaflet dependencies
vi.mock('@/components/map/map-shell', () => ({
  MapShell: () => <div data-testid="map-shell">Map Shell</div>,
}));

// Mock PublicAnnouncements components
vi.mock('@/components/home/public-announcements', () => ({
  PublicAnnouncementStrip: () => <div data-testid="announcement-strip">Announcement Strip</div>,
  PublicAnnouncements: () => <div data-testid="announcements">Announcements</div>,
}));

// Mock ReportModal component
vi.mock('@/components/reports/report-modal', () => ({
  ReportModal: () => <div data-testid="report-modal">Report Modal</div>,
}));

describe('Footer Mobile Layout (<1024px)', () => {
  beforeEach(() => {
    // Set viewport to mobile size (below 1024px)
    global.innerWidth = 375;
    global.innerHeight = 667;
  });

  describe('Requirement 2.2 & 13.1: Vertical Stacking on Mobile', () => {
    it('should render footer with all three sections', () => {
      const { container } = render(<PublicHome />);
      const footer = container.querySelector('footer');
      
      expect(footer).toBeInTheDocument();
      
      // Check for branding section
      expect(screen.getByText('AGOS-BD')).toBeInTheDocument();
      
      // Check for Quick Access section
      expect(screen.getByText('Quick Access')).toBeInTheDocument();
      
      // Check for Account section
      expect(screen.getByText('Account')).toBeInTheDocument();
    });

    it('should have grid layout that stacks on mobile', () => {
      const { container } = render(<PublicHome />);
      const footer = container.querySelector('footer');
      const mainContentContainer = footer?.querySelector('.grid');
      
      expect(mainContentContainer).toBeInTheDocument();
      expect(mainContentContainer).toHaveClass('grid');
      
      // Should have lg:grid-cols-3 class for desktop, but stacks by default on mobile
      expect(mainContentContainer).toHaveClass('lg:grid-cols-3');
    });

    it('should render branding section with logo and description', () => {
      render(<PublicHome />);
      
      expect(screen.getByText('AGOS-BD')).toBeInTheDocument();
      expect(screen.getByText(/Adaptive Geo-mapped Outreach System/)).toBeInTheDocument();
    });

    it('should render Quick Access section with all links', () => {
      render(<PublicHome />);
      
      expect(screen.getByText('Quick Access')).toBeInTheDocument();
      expect(screen.getByText('Starter overlay')).toBeInTheDocument();
      expect(screen.getByText('Guide')).toBeInTheDocument();
      expect(screen.getByText('Post update')).toBeInTheDocument();
    });

    it('should render Account section with all links', () => {
      render(<PublicHome />);
      
      expect(screen.getByText('Account')).toBeInTheDocument();
      expect(screen.getByText('Create account')).toBeInTheDocument();
      expect(screen.getByText('Sign in')).toBeInTheDocument();
    });
  });

  describe('Requirement 6.6: Bottom Bar Vertical Stacking on Mobile', () => {
    it('should render bottom bar with border separator', () => {
      const { container } = render(<PublicHome />);
      const footer = container.querySelector('footer');
      const bottomBar = footer?.querySelector('.border-t.border-cleanWhite\\/10:last-child');
      
      expect(bottomBar).toBeInTheDocument();
    });

    it('should render legal links in bottom bar', () => {
      render(<PublicHome />);
      
      expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
      expect(screen.getByText('Terms of Service')).toBeInTheDocument();
    });

    it('should have flex-col class for vertical stacking on mobile', () => {
      const { container } = render(<PublicHome />);
      const footer = container.querySelector('footer');
      const bottomBarContent = footer?.querySelector('.flex.flex-col');
      
      expect(bottomBarContent).toBeInTheDocument();
      expect(bottomBarContent).toHaveClass('lg:flex-row');
    });
  });

  describe('Requirement 13.2: Mobile Padding Values', () => {
    it('should use py-5 padding for main content area', () => {
      const { container } = render(<PublicHome />);
      const footer = container.querySelector('footer');
      const mainContentContainer = footer?.querySelector('.py-5');
      
      expect(mainContentContainer).toBeInTheDocument();
    });

    it('should use py-3 padding for bottom bar', () => {
      const { container } = render(<PublicHome />);
      const footer = container.querySelector('footer');
      const bottomBarContent = footer?.querySelector('.py-3');
      
      expect(bottomBarContent).toBeInTheDocument();
    });

    it('should use responsive horizontal padding (px-6 sm:px-8 lg:px-10)', () => {
      const { container } = render(<PublicHome />);
      const footer = container.querySelector('footer');
      const mainContentContainer = footer?.querySelector('.px-6');
      
      expect(mainContentContainer).toBeInTheDocument();
      expect(mainContentContainer).toHaveClass('sm:px-8');
      expect(mainContentContainer).toHaveClass('lg:px-10');
    });

    it('should use gap-6 for spacing between sections', () => {
      const { container } = render(<PublicHome />);
      const footer = container.querySelector('footer');
      const mainContentContainer = footer?.querySelector('.gap-6');
      
      expect(mainContentContainer).toBeInTheDocument();
    });
  });

  describe('Visual Hierarchy and Styling', () => {
    it('should have deepCrimson background and cleanWhite text', () => {
      const { container } = render(<PublicHome />);
      const footer = container.querySelector('footer');
      
      expect(footer).toHaveClass('bg-deepCrimson');
      expect(footer).toHaveClass('text-cleanWhite');
    });

    it('should have top border with subtle opacity', () => {
      const { container } = render(<PublicHome />);
      const footer = container.querySelector('footer');
      
      expect(footer).toHaveClass('border-t');
      expect(footer).toHaveClass('border-cleanWhite/10');
    });

    it('should use max-w-6xl container width', () => {
      const { container } = render(<PublicHome />);
      const footer = container.querySelector('footer');
      const mainContentContainer = footer?.querySelector('.max-w-6xl');
      
      expect(mainContentContainer).toBeInTheDocument();
    });
  });

  describe('Typography and Readability', () => {
    it('should use correct typography for section headings', () => {
      const { container } = render(<PublicHome />);
      
      const quickAccessHeading = screen.getByText('Quick Access');
      expect(quickAccessHeading).toHaveClass('text-xs');
      expect(quickAccessHeading).toHaveClass('font-bold');
      expect(quickAccessHeading).toHaveClass('uppercase');
      expect(quickAccessHeading).toHaveClass('tracking-[0.18em]');
    });

    it('should use text-sm for body links', () => {
      const { container } = render(<PublicHome />);
      const footer = container.querySelector('footer');
      const linkContainer = footer?.querySelector('.text-sm');
      
      expect(linkContainer).toBeInTheDocument();
    });

    it('should use text-xs for legal text', () => {
      const { container } = render(<PublicHome />);
      const privacyLink = screen.getByText('Privacy Policy');
      
      expect(privacyLink).toHaveClass('text-xs');
    });
  });

  describe('Interactive Elements', () => {
    it('should have hover transition classes on links', () => {
      render(<PublicHome />);
      
      const starterLink = screen.getByText('Starter overlay');
      expect(starterLink).toHaveClass('transition-colors');
      expect(starterLink).toHaveClass('duration-200');
      expect(starterLink).toHaveClass('hover:text-cleanWhite');
    });

    it('should render buttons with correct type attribute', () => {
      const { container } = render(<PublicHome />);
      const footer = container.querySelector('footer');
      const buttons = footer?.querySelectorAll('button[type="button"]');
      
      expect(buttons).toBeTruthy();
      expect(buttons!.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should use semantic footer element', () => {
      const { container } = render(<PublicHome />);
      const footer = container.querySelector('footer');
      
      expect(footer).toBeInTheDocument();
      expect(footer?.tagName).toBe('FOOTER');
    });

    it('should have proper link structure for navigation', () => {
      render(<PublicHome />);
      
      const registerLink = screen.getByText('Create account').closest('a');
      const loginLink = screen.getByText('Sign in').closest('a');
      
      expect(registerLink).toHaveAttribute('href', '/register');
      expect(loginLink).toHaveAttribute('href', '/login');
    });
  });
});
