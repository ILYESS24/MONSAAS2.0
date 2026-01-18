/**
 * @fileoverview Sign-up form component
 * 
 * Contains the form fields, validation, and submission logic
 * for the sign-up page.
 * 
 * @module pages/signup/SignUpForm
 */

import { memo, useState, useCallback, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Mail, User } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
// TYPES
// ============================================

export interface SignUpFormData {
  readonly name: string;
  readonly email: string;
  readonly password: string;
  readonly confirmPassword: string;
}

export interface SignUpFormProps {
  /** Callback when user starts/stops typing (for character animations) */
  readonly onTypingChange?: (isTyping: boolean) => void;
  /** Callback when password visibility changes */
  readonly onPasswordVisibilityChange?: (visible: boolean) => void;
  /** Callback to track password value (for character animations) */
  readonly onPasswordChange?: (password: string) => void;
  /** Whether to show password */
  readonly showPassword?: boolean;
  /** Toggle password visibility */
  readonly onTogglePassword?: () => void;
}

// ============================================
// PASSWORD INPUT
// ============================================

interface PasswordInputProps {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly show: boolean;
  readonly onToggleShow: () => void;
  readonly required?: boolean;
  readonly placeholder?: string;
}

const PasswordInput = memo<PasswordInputProps>(({
  id,
  label,
  value,
  onChange,
  show,
  onToggleShow,
  required = true,
  placeholder = '••••••••',
}) => (
  <div className="space-y-2">
    <Label htmlFor={id} className="text-sm font-medium text-foreground">
      {label}
    </Label>
    <div className="relative">
      <Input
        id={id}
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="h-12 pr-10 bg-background border-border/60 focus:border-primary"
        aria-describedby={`${id}-description`}
      />
      <button
        type="button"
        onClick={onToggleShow}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        aria-label={show ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
      >
        {show ? (
          <EyeOff className="size-5" aria-hidden="true" />
        ) : (
          <Eye className="size-5" aria-hidden="true" />
        )}
      </button>
    </div>
  </div>
));
PasswordInput.displayName = 'PasswordInput';

// ============================================
// FORM ERROR
// ============================================

interface FormErrorProps {
  readonly message: string;
}

const FormError = memo<FormErrorProps>(({ message }) => (
  <div
    className="p-3 text-sm text-red-400 bg-red-950/20 border border-red-900/30 rounded-lg"
    role="alert"
    aria-live="polite"
  >
    {message}
  </div>
));
FormError.displayName = 'FormError';

// ============================================
// SIGN UP FORM
// ============================================

/**
 * Complete sign-up form with validation
 */
export const SignUpForm = memo<SignUpFormProps>(({
  onTypingChange,
  onPasswordChange,
  showPassword: externalShowPassword,
  onTogglePassword,
}) => {
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Password visibility (use external state if provided)
  const [internalShowPassword, setInternalShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const showPassword = externalShowPassword ?? internalShowPassword;
  const togglePassword = onTogglePassword ?? (() => setInternalShowPassword(!internalShowPassword));

  // Handle password change with callback
  const handlePasswordChange = useCallback((value: string) => {
    setPassword(value);
    onPasswordChange?.(value);
  }, [onPasswordChange]);

  // Form submission
  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas. Veuillez réessayer.");
      return;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setIsLoading(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // In production: send to backend, handle response
    setIsLoading(false);
  }, [password, confirmPassword]);

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* Name Field */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium text-foreground">
          Nom complet
        </Label>
        <div className="relative">
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            value={name}
            autoComplete="name"
            onChange={(e) => setName(e.target.value)}
            onFocus={() => onTypingChange?.(true)}
            onBlur={() => onTypingChange?.(false)}
            required
            className="h-12 pl-10 bg-background border-border/60 focus:border-primary"
            aria-describedby="name-description"
          />
          <User
            className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground"
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-foreground">
          Email
        </Label>
        <div className="relative">
          <Input
            id="email"
            type="email"
            placeholder="vous@exemple.com"
            value={email}
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => onTypingChange?.(true)}
            onBlur={() => onTypingChange?.(false)}
            required
            className="h-12 pl-10 bg-background border-border/60 focus:border-primary"
            aria-describedby="email-description"
          />
          <Mail
            className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground"
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Password Fields */}
      <PasswordInput
        id="password"
        label="Mot de passe"
        value={password}
        onChange={handlePasswordChange}
        show={showPassword}
        onToggleShow={togglePassword}
      />

      <PasswordInput
        id="confirmPassword"
        label="Confirmer le mot de passe"
        value={confirmPassword}
        onChange={setConfirmPassword}
        show={showConfirmPassword}
        onToggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
      />

      {/* Terms Checkbox */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox id="terms" aria-describedby="terms-description" />
          <Label
            htmlFor="terms"
            className="text-sm font-normal cursor-pointer text-foreground/80"
          >
            J'accepte les{' '}
            <a
              href="/legal/terms"
              className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary"
            >
              Conditions d'utilisation
            </a>
            {' '}et la{' '}
            <a
              href="/legal/privacy"
              className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary"
            >
              Politique de confidentialité
            </a>
          </Label>
        </div>
      </div>

      {/* Error Display */}
      {error && <FormError message={error} />}

      {/* Submit Button */}
      <Button
        type="submit"
        className={cn(
          'w-full h-12 text-base font-medium',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
        )}
        size="lg"
        disabled={isLoading}
        aria-busy={isLoading}
      >
        {isLoading ? 'Création du compte...' : 'Créer un compte'}
      </Button>
    </form>
  );
});
SignUpForm.displayName = 'SignUpForm';

// ============================================
// SOCIAL SIGN UP
// ============================================

/**
 * Social sign-up buttons
 */
export const SocialSignUp = memo(() => (
  <div className="mt-6">
    <Button
      variant="outline"
      className={cn(
        'w-full h-12 bg-background border-border/60 hover:bg-accent text-foreground',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
      )}
      type="button"
    >
      <Mail className="mr-2 size-5" aria-hidden="true" />
      S'inscrire avec Google
    </Button>
  </div>
));
SocialSignUp.displayName = 'SocialSignUp';

// ============================================
// SIGN IN LINK
// ============================================

/**
 * Link to sign-in page
 */
export const SignInLink = memo(() => (
  <div className="text-center text-sm text-foreground/80 mt-8">
    Vous avez déjà un compte ?{' '}
    <a
      href="/login"
      className={cn(
        'text-primary font-medium hover:underline',
        'focus:outline-none focus:ring-2 focus:ring-primary'
      )}
    >
      Se connecter
    </a>
  </div>
));
SignInLink.displayName = 'SignInLink';
