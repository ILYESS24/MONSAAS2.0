/**
 * Main Layout
 * 
 * Primary layout component that wraps all pages.
 * Includes header, navigation, and footer.
 */

import { ReactNode } from 'react';

interface MainLayoutProps {
  children: ReactNode;
  showNavigation?: boolean;
  showFooter?: boolean;
}

export function MainLayout({ 
  children, 
  showNavigation = true, 
  showFooter = true 
}: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}

export default MainLayout;
