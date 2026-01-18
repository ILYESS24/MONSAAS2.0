/**
 * @fileoverview Shared components for Creation pages (Image/Video)
 * 
 * Reduces code duplication between ImageCreation.tsx and VideoCreation.tsx
 * by extracting common UI patterns and logic.
 * 
 * @module components/creation
 */

import { memo, type ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
// TYPES
// ============================================

export interface SuggestionCard {
  readonly icon: ReactNode;
  readonly title: string;
  readonly description: string;
  readonly onClick?: () => void;
}

export interface CreationHeaderProps {
  readonly title: string;
  readonly subtitle: string;
  readonly onBack?: () => void;
  /** Gradient for title text (e.g., 'from-white to-gray-400') */
  readonly titleGradient?: string;
}

export interface SuggestionGridProps {
  readonly cards: readonly SuggestionCard[];
  /** Accent color for hover glow (e.g., 'purple' | 'gray') */
  readonly accentColor?: 'purple' | 'gray' | 'blue' | 'green';
}

export interface CreditsDisplayProps {
  readonly credits: number;
  readonly cost: number;
  readonly isLoading?: boolean;
}

// ============================================
// BACK BUTTON
// ============================================

/**
 * Back button with consistent styling across creation pages
 */
export const BackButton = memo<{ onClick?: () => void }>(({ onClick }) => (
  <button
    onClick={onClick ?? (() => window.history.back())}
    className={cn(
      'flex items-center gap-2 text-gray-400 hover:text-white',
      'text-sm font-medium transition-colors duration-200',
      'focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-[#0a0a0a]',
      'rounded-md px-2 py-1 -ml-2'
    )}
    aria-label="Retour à la page précédente"
  >
    <ArrowLeft className="w-4 h-4" aria-hidden="true" />
    <span>BACK</span>
  </button>
));
BackButton.displayName = 'BackButton';

// ============================================
// CREATION HEADER
// ============================================

/**
 * Header section with title, subtitle and back button
 */
export const CreationHeader = memo<CreationHeaderProps>(({
  title,
  subtitle,
  onBack,
  titleGradient = 'from-white via-gray-200 to-gray-400',
}) => (
  <header className="text-center max-w-3xl mx-auto">
    <div className="mb-8">
      <BackButton onClick={onBack} />
    </div>
    
    <h1 
      className={cn(
        'text-4xl md:text-5xl lg:text-6xl font-bold',
        'bg-gradient-to-b bg-clip-text text-transparent',
        'leading-tight tracking-tight',
        titleGradient
      )}
    >
      {title}
    </h1>
    
    <p className="mt-4 text-gray-400 text-base md:text-lg max-w-xl mx-auto">
      {subtitle}
    </p>
  </header>
));
CreationHeader.displayName = 'CreationHeader';

// ============================================
// SUGGESTION GRID
// ============================================

const ACCENT_COLORS = {
  purple: {
    glow: 'hover:shadow-purple-500/10',
    border: 'hover:border-purple-500/30',
  },
  gray: {
    glow: 'hover:shadow-white/10',
    border: 'hover:border-white/20',
  },
  blue: {
    glow: 'hover:shadow-blue-500/10',
    border: 'hover:border-blue-500/30',
  },
  green: {
    glow: 'hover:shadow-green-500/10',
    border: 'hover:border-green-500/30',
  },
} as const;

/**
 * Grid of suggestion cards with glass morphism design
 */
export const SuggestionGrid = memo<SuggestionGridProps>(({
  cards,
  accentColor = 'gray',
}) => {
  const colors = ACCENT_COLORS[accentColor];
  
  return (
    <div 
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      role="list"
      aria-label="Suggestions"
    >
      {cards.map((card, index) => (
        <button
          key={index}
          onClick={card.onClick}
          className={cn(
            'group relative p-4 rounded-xl text-left',
            'bg-white/[0.03] backdrop-blur-xl',
            'border border-white/[0.08]',
            'transition-all duration-300',
            'hover:bg-white/[0.05]',
            'hover:shadow-lg',
            colors.glow,
            colors.border,
            'focus:outline-none focus:ring-2 focus:ring-white/20'
          )}
          role="listitem"
        >
          {/* Icon */}
          <div className="w-10 h-10 rounded-lg bg-white/[0.05] flex items-center justify-center mb-3">
            {card.icon}
          </div>
          
          {/* Content */}
          <h3 className="text-white font-medium text-sm mb-1">
            {card.title}
          </h3>
          <p className="text-gray-500 text-xs leading-relaxed">
            {card.description}
          </p>
          
          {/* Subtle glow effect on hover */}
          <div 
            className={cn(
              'absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100',
              'transition-opacity duration-300 pointer-events-none',
              'bg-gradient-to-br from-white/[0.02] to-transparent'
            )}
            aria-hidden="true"
          />
        </button>
      ))}
    </div>
  );
});
SuggestionGrid.displayName = 'SuggestionGrid';

// ============================================
// CREDITS DISPLAY
// ============================================

/**
 * Credits badge showing cost and remaining credits
 */
export const CreditsDisplay = memo<CreditsDisplayProps>(({
  credits,
  cost,
  isLoading = false,
}) => {
  const hasEnoughCredits = credits >= cost;
  
  return (
    <div 
      className="flex items-center gap-3"
      role="status"
      aria-live="polite"
    >
      {/* Cost Badge */}
      <span 
        className={cn(
          'px-3 py-1.5 rounded-full text-xs font-medium',
          'bg-purple-500/10 text-purple-400 border border-purple-500/20'
        )}
      >
        {cost} crédit{cost > 1 ? 's' : ''}
      </span>
      
      {/* Remaining Credits */}
      <span 
        className={cn(
          'text-xs',
          hasEnoughCredits ? 'text-gray-500' : 'text-red-400'
        )}
      >
        {isLoading ? (
          <span className="animate-pulse">Chargement...</span>
        ) : (
          <>
            {credits.toLocaleString('fr-FR')} crédit{credits > 1 ? 's' : ''} restant{credits > 1 ? 's' : ''}
          </>
        )}
      </span>
    </div>
  );
});
CreditsDisplay.displayName = 'CreditsDisplay';

// ============================================
// PROMPT INPUT AREA
// ============================================

export interface PromptInputProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly onSubmit: () => void;
  readonly placeholder?: string;
  readonly disabled?: boolean;
  readonly isLoading?: boolean;
  /** Quick prompt suggestions */
  readonly suggestions?: readonly string[];
  /** Button variant */
  readonly buttonVariant?: 'white' | 'gradient';
  readonly buttonGradient?: string;
}

/**
 * Prompt input area with suggestions and submit button
 */
export const PromptInputArea = memo<PromptInputProps>(({
  value,
  onChange,
  onSubmit,
  placeholder = 'Décrivez ce que vous voulez créer...',
  disabled = false,
  isLoading = false,
  suggestions = [],
  buttonVariant = 'white',
  buttonGradient = 'from-purple-500 to-indigo-500',
}) => (
  <div className="space-y-4">
    {/* Quick Suggestions */}
    {suggestions.length > 0 && (
      <div 
        className="flex flex-wrap gap-2 justify-center"
        role="list"
        aria-label="Suggestions rapides"
      >
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onChange(suggestion)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs',
              'bg-white/[0.05] text-gray-400',
              'border border-white/[0.08]',
              'hover:bg-white/[0.08] hover:text-white',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-white/20'
            )}
            role="listitem"
          >
            {suggestion}
          </button>
        ))}
      </div>
    )}
    
    {/* Input Container */}
    <div 
      className={cn(
        'relative rounded-2xl overflow-hidden',
        'bg-white/[0.03] backdrop-blur-xl',
        'border border-white/[0.08]',
        'focus-within:border-white/[0.15]',
        'transition-colors duration-200'
      )}
    >
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSubmit();
          }
        }}
        placeholder={placeholder}
        disabled={disabled}
        rows={3}
        className={cn(
          'w-full px-4 py-4 bg-transparent text-white',
          'placeholder-gray-500 resize-none',
          'focus:outline-none',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
        aria-label="Zone de texte pour le prompt"
      />
      
      {/* Bottom Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.05]">
        <span className="text-xs text-gray-500">
          Appuyez sur Entrée pour générer
        </span>
        
        <button
          onClick={onSubmit}
          disabled={disabled || isLoading || !value.trim()}
          className={cn(
            'px-6 py-2 rounded-full font-medium text-sm',
            'transition-all duration-200',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0a0a0a]',
            buttonVariant === 'white' ? [
              'bg-white text-black hover:bg-gray-100',
              'focus:ring-white',
            ] : [
              `bg-gradient-to-r ${buttonGradient} text-white`,
              'hover:opacity-90',
              'focus:ring-purple-500',
            ]
          )}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span 
                className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
                aria-hidden="true"
              />
              Génération...
            </span>
          ) : (
            'Générer'
          )}
        </button>
      </div>
    </div>
  </div>
));
PromptInputArea.displayName = 'PromptInputArea';

// ============================================
// PAGE BACKGROUND
// ============================================

/**
 * Dark mode background with radial gradient glow
 */
export const CreationBackground = memo<{ 
  children: ReactNode;
  /** Accent color for the glow */
  glowColor?: 'purple' | 'gray' | 'blue';
}>(({ children, glowColor = 'gray' }) => {
  const glowStyles = {
    purple: 'from-purple-500/5 via-transparent to-transparent',
    gray: 'from-white/5 via-transparent to-transparent',
    blue: 'from-blue-500/5 via-transparent to-transparent',
  };
  
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden">
      {/* Radial gradient glow */}
      <div 
        className={cn(
          'absolute inset-0 bg-gradient-radial',
          glowStyles[glowColor],
          'pointer-events-none'
        )}
        aria-hidden="true"
      />
      
      {/* Vignette effect */}
      <div 
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#0a0a0a_70%)] pointer-events-none"
        aria-hidden="true"
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
});
CreationBackground.displayName = 'CreationBackground';
