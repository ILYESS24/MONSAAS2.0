/**
 * @fileoverview Main SignUp Page Component
 * 
 * This is the refactored sign-up page using modular components.
 * The original 1351-line file has been split into:
 * - EyeComponents.tsx (eye animations)
 * - CharacterAnimations.tsx (character components)
 * - SignUpForm.tsx (form logic)
 * - Layout.tsx (page layout)
 * 
 * @module pages/signup/SignUpPage
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Characters } from './CharacterAnimations';
import { SignUpForm, SocialSignUp, SignInLink } from './SignUpForm';
import { PageContainer, LeftPanel, RightPanel } from './Layout';

/**
 * Sign-up page with animated characters
 */
function SignUpPage() {
  // Mouse tracking for character animations
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);

  // Form state for character reactions
  const [isTyping, setIsTyping] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Callbacks for character animations
  const handleTypingChange = useCallback((typing: boolean) => {
    setIsTyping(typing);
  }, []);

  const handlePasswordChange = useCallback((pwd: string) => {
    setPassword(pwd);
  }, []);

  const handleTogglePassword = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  return (
    <PageContainer>
      {/* Left Panel with Characters */}
      <LeftPanel>
        <Characters
          mouseX={mouseX}
          mouseY={mouseY}
          state={{
            isTyping,
            password,
            showPassword,
          }}
        />
      </LeftPanel>

      {/* Right Panel with Form */}
      <RightPanel>
        <SignUpForm
          onTypingChange={handleTypingChange}
          onPasswordChange={handlePasswordChange}
          showPassword={showPassword}
          onTogglePassword={handleTogglePassword}
        />
        <SocialSignUp />
        <SignInLink />
      </RightPanel>
    </PageContainer>
  );
}

export default SignUpPage;
