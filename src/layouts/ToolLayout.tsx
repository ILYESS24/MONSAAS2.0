/**
 * Tool Layout
 * 
 * Full-screen layout for iframe-based tools.
 * Provides minimal chrome for maximum tool space.
 */

import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ROUTES } from '@/constants';

interface ToolLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
}

export function ToolLayout({ 
  children, 
  title,
  description 
}: ToolLayoutProps) {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Minimal Header */}
      <header className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="text-white/60 hover:text-white transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-white font-semibold">{title}</h1>
            {description && (
              <p className="text-white/40 text-sm">{description}</p>
            )}
          </div>
        </div>
        <Link 
          to={ROUTES.DASHBOARD}
          className="text-white/60 hover:text-white text-sm transition-colors"
        >
          Back to Dashboard
        </Link>
      </header>
      
      {/* Full-height Tool Content */}
      <main className="flex-1 relative">
        {children}
      </main>
    </div>
  );
}

export default ToolLayout;
