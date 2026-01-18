/**
 * Dashboard Layout
 * 
 * Layout for authenticated dashboard pages.
 * Includes sidebar navigation and tool-specific UI.
 */

import { ReactNode } from 'react';
import Navigation from '@/components/fabrica/Navigation';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  showSidebar?: boolean;
}

export function DashboardLayout({ 
  children, 
  title,
  showSidebar = true 
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <Navigation />
      
      {/* Dashboard Content */}
      <div className="flex">
        {/* Optional Sidebar */}
        {showSidebar && (
          <aside className="hidden lg:block w-64 border-r border-white/10 min-h-[calc(100vh-64px)]">
            {/* Sidebar content would go here */}
          </aside>
        )}
        
        {/* Main Content */}
        <main className="flex-1 p-6">
          {title && (
            <header className="mb-6">
              <h1 className="text-2xl font-bold text-white">{title}</h1>
            </header>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
