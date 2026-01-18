/**
 * @module infrastructure/clerk
 * @description Clerk authentication integration
 */

// Re-export from Clerk SDK
export {
  useUser,
  useAuth,
  useClerk,
  useSignIn,
  useSignUp,
  SignedIn,
  SignedOut,
  RedirectToSignIn,
  ClerkProvider,
} from '@clerk/clerk-react';

// Re-export safe wrappers
export { useClerkSafe } from '@/hooks/use-clerk-safe';
export { useClerkSync } from '@/hooks/use-clerk-sync';
export { useClerkPlanSync } from '@/hooks/use-clerk-plan-sync';
