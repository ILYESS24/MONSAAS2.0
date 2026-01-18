/**
 * @fileoverview Eye animation components for SignUp page
 * 
 * Extracted from SignUp.tsx for better modularity and reusability.
 * These components create the interactive eye-tracking animations.
 * 
 * @module pages/signup/EyeComponents
 */

import { memo, useState, useEffect, useMemo, useRef } from 'react';

// ============================================
// TYPES
// ============================================

export interface PupilProps {
  /** Size of the pupil in pixels */
  readonly size?: number;
  /** Maximum distance the pupil can move */
  readonly maxDistance?: number;
  /** Color of the pupil */
  readonly pupilColor?: string;
  /** Force look at X position */
  readonly forceLookX?: number;
  /** Force look at Y position */
  readonly forceLookY?: number;
}

export interface EyeBallProps {
  /** Size of the eyeball in pixels */
  readonly size?: number;
  /** Size of the pupil in pixels */
  readonly pupilSize?: number;
  /** Maximum distance the pupil can move */
  readonly maxDistance?: number;
  /** Color of the eyeball */
  readonly eyeColor?: string;
  /** Color of the pupil */
  readonly pupilColor?: string;
  /** Whether the eye is blinking */
  readonly isBlinking?: boolean;
  /** Force look at X position */
  readonly forceLookX?: number;
  /** Force look at Y position */
  readonly forceLookY?: number;
}

// ============================================
// PUPIL COMPONENT
// ============================================

/**
 * Animated pupil that tracks mouse movement
 */
export const Pupil = memo<PupilProps>(({
  size = 12,
  maxDistance = 5,
  pupilColor = 'black',
  forceLookX,
  forceLookY,
}) => {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const pupilRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Calculate pupil position based on mouse coordinates
  const pupilPosition = useMemo(() => {
    // If forced look direction is provided, use that
    if (forceLookX !== undefined && forceLookY !== undefined) {
      return { x: forceLookX, y: forceLookY };
    }

    // Calculate based on mouse position
    const deltaX = mouseX - window.innerWidth / 2;
    const deltaY = mouseY - window.innerHeight / 2;
    const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance * 50);

    if (distance === 0) return { x: 0, y: 0 };

    const angle = Math.atan2(deltaY, deltaX);
    const normalizedDistance = Math.min(distance / 100, maxDistance);
    const x = Math.cos(angle) * normalizedDistance;
    const y = Math.sin(angle) * normalizedDistance;

    return { x, y };
  }, [mouseX, mouseY, forceLookX, forceLookY, maxDistance]);

  return (
    <div
      ref={pupilRef}
      className="rounded-full"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: pupilColor,
        transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
        transition: 'transform 0.1s ease-out',
      }}
      aria-hidden="true"
    />
  );
});
Pupil.displayName = 'Pupil';

// ============================================
// EYEBALL COMPONENT
// ============================================

/**
 * Complete eyeball with pupil that tracks mouse movement
 */
export const EyeBall = memo<EyeBallProps>(({
  size = 48,
  pupilSize = 16,
  maxDistance = 10,
  eyeColor = 'white',
  pupilColor = 'black',
  isBlinking = false,
  forceLookX,
  forceLookY,
}) => {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const eyeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Calculate pupil position based on mouse coordinates
  const pupilPosition = useMemo(() => {
    // If forced look direction is provided, use that
    if (forceLookX !== undefined && forceLookY !== undefined) {
      return { x: forceLookX, y: forceLookY };
    }

    // Calculate based on mouse position
    const deltaX = mouseX - window.innerWidth / 2;
    const deltaY = mouseY - window.innerHeight / 2;
    const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance * 50);

    if (distance === 0) return { x: 0, y: 0 };

    const angle = Math.atan2(deltaY, deltaX);
    const normalizedDistance = Math.min(distance / 100, maxDistance);
    const x = Math.cos(angle) * normalizedDistance;
    const y = Math.sin(angle) * normalizedDistance;

    return { x, y };
  }, [mouseX, mouseY, forceLookX, forceLookY, maxDistance]);

  return (
    <div
      ref={eyeRef}
      className="rounded-full flex items-center justify-center transition-all duration-150"
      style={{
        width: `${size}px`,
        height: isBlinking ? '2px' : `${size}px`,
        backgroundColor: eyeColor,
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      {!isBlinking && (
        <div
          className="rounded-full"
          style={{
            width: `${pupilSize}px`,
            height: `${pupilSize}px`,
            backgroundColor: pupilColor,
            transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
            transition: 'transform 0.1s ease-out',
          }}
        />
      )}
    </div>
  );
});
EyeBall.displayName = 'EyeBall';

// ============================================
// BLINK HOOK
// ============================================

/**
 * Custom hook for eye blinking animation
 * @returns Whether the eye is currently blinking
 */
export function useBlinking(enabled: boolean = true): boolean {
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setIsBlinking(false);
      return;
    }

    const getRandomBlinkInterval = () => Math.random() * 4000 + 3000; // 3-7 seconds

    let blinkTimeout: ReturnType<typeof setTimeout>;

    const scheduleBlink = () => {
      blinkTimeout = setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => {
          setIsBlinking(false);
          scheduleBlink();
        }, 150); // Blink duration
      }, getRandomBlinkInterval());
    };

    scheduleBlink();
    return () => clearTimeout(blinkTimeout);
  }, [enabled]);

  return isBlinking;
}
