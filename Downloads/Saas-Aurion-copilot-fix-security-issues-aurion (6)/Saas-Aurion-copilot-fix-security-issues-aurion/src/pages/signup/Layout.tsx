/**
 * @fileoverview Layout components for the Sign-up page
 * 
 * Contains the page layout, left panel with characters,
 * and right panel with the form.
 * 
 * @module pages/signup/Layout
 */

import { memo, type ReactNode } from 'react';
import { GrainGradient } from '@paper-design/shaders-react';

// ============================================
// PAGE CONTAINER
// ============================================

interface PageContainerProps {
  readonly children: ReactNode;
}

/**
 * Main page container with border styling
 */
export const PageContainer = memo<PageContainerProps>(({ children }) => (
  <div
    className="fixed inset-0 grid lg:grid-cols-2 overflow-hidden bg-background"
    style={{
      zIndex: 9999,
      width: 'calc(100vw - 16px)',
      height: 'calc(100vh - 16px)',
      borderRadius: '32px',
      border: '16px solid black',
      margin: '8px',
    }}
    role="main"
    aria-label="Page d'inscription"
  >
    {children}
  </div>
));
PageContainer.displayName = 'PageContainer';

// ============================================
// LEFT PANEL (CHARACTERS)
// ============================================

interface LeftPanelProps {
  readonly children: ReactNode;
}

/**
 * Left panel containing animated characters
 */
export const LeftPanel = memo<LeftPanelProps>(({ children }) => (
  <div 
    className="relative hidden lg:flex flex-col justify-between bg-slate-100 p-12 text-foreground"
    aria-hidden="true"
  >
    {/* Logo */}
    <div className="relative z-20">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <a
          href="/"
          className="text-white hover:text-primary-foreground/80 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
          aria-label="Retour à l'accueil - AURION"
        >
          AURION
        </a>
      </div>
    </div>

    {/* Characters Area */}
    <div className="relative z-20 flex items-end justify-center h-[500px]">
      {children}
    </div>

    {/* Background */}
    <div className="absolute inset-0 z-10">
      <GrainGradient />
    </div>
  </div>
));
LeftPanel.displayName = 'LeftPanel';

// ============================================
// RIGHT PANEL (FORM)
// ============================================

interface RightPanelProps {
  readonly children: ReactNode;
}

/**
 * Right panel containing the sign-up form
 */
export const RightPanel = memo<RightPanelProps>(({ children }) => (
  <div className="flex items-center justify-center p-6 md:p-12 bg-card">
    <div className="w-full max-w-md">
      {/* Header */}
      <header className="text-center md:text-left mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
          Créez votre compte AURION
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Rejoignez des milliers de créateurs utilisant l'IA pour produire du contenu incroyable.
        </p>
      </header>

      {/* Form Content */}
      <div role="region" aria-label="Formulaire d'inscription">
        {children}
      </div>
    </div>
  </div>
));
RightPanel.displayName = 'RightPanel';
