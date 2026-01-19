/**
 * Auth Layout
 * 
 * Layout for authentication pages (sign in, sign up).
 * Minimal layout with centered content.
 */

import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants';

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export function AuthLayout({ 
  children, 
  title,
  subtitle 
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Simple Header */}
      <header className="p-6">
        <Link to={ROUTES.HOME} className="text-white font-bold text-xl">
          Aurion Studio
        </Link>
      </header>
      
      {/* Centered Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {(title || subtitle) && (
            <div className="text-center mb-8">
              {title && (
                <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
              )}
              {subtitle && (
                <p className="text-white/60">{subtitle}</p>
              )}
            </div>
          )}
          {children}
        </div>
      </main>
      
      {/* Simple Footer */}
      <footer className="p-6 text-center">
        <p className="text-white/40 text-sm">
          © {new Date().getFullYear()} Aurion Studio. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default AuthLayout;
