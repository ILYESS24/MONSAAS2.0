/**
 * @fileoverview Sign-up Page (Refactored)
 * 
 * This file now re-exports from the modular signup directory.
 * The original 1351-line monolithic component has been split into:
 * 
 * - signup/EyeComponents.tsx - Eye animation components
 * - signup/CharacterAnimations.tsx - Animated characters
 * - signup/SignUpForm.tsx - Form components
 * - signup/Layout.tsx - Page layout
 * - signup/SignUpPage.tsx - Main page component
 * 
 * @module pages/SignUp
 */

// Re-export everything from the modular signup directory
export * from './signup';
export { default } from './signup';
