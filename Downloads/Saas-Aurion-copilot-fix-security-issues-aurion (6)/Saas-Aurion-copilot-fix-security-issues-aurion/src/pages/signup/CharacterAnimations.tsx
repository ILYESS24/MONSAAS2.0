/**
 * @fileoverview Animated character components for SignUp page
 * 
 * These components create the animated mascot characters that
 * react to user input and mouse movement.
 * 
 * @module pages/signup/CharacterAnimations
 */

import { memo, useState, useEffect, useMemo } from 'react';
import { EyeBall, useBlinking } from './EyeComponents';

// ============================================
// TYPES
// ============================================

export interface CharacterState {
  readonly isTyping: boolean;
  readonly password: string;
  readonly showPassword: boolean;
}

export interface CharacterPosition {
  readonly faceX: number;
  readonly faceY: number;
  readonly bodySkew: number;
}

// ============================================
// HOOKS
// ============================================

/**
 * Calculate character positions based on mouse movement
 */
export function useCharacterPositions(mouseX: number, mouseY: number): CharacterPosition {
  return useMemo(() => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const deltaX = mouseX - centerX;
    const deltaY = mouseY - centerY;

    // Face movement (limited range)
    const faceX = Math.max(-15, Math.min(15, deltaX / 20));
    const faceY = Math.max(-10, Math.min(10, deltaY / 30));

    // Body lean
    const bodySkew = Math.max(-6, Math.min(6, -deltaX / 120));

    return { faceX, faceY, bodySkew };
  }, [mouseX, mouseY]);
}

/**
 * Hook for "looking at each other" animation
 */
export function useLookAtEachOther(isTyping: boolean): boolean {
  const [isLooking, setIsLooking] = useState(false);

  useEffect(() => {
    if (isTyping) {
      setIsLooking(true);
      const timer = setTimeout(() => setIsLooking(false), 800);
      return () => clearTimeout(timer);
    }
    setIsLooking(false);
  }, [isTyping]);

  return isLooking;
}

/**
 * Hook for sneaky peeking animation
 */
export function useSneakyPeek(password: string, showPassword: boolean): boolean {
  const [isPeeking, setIsPeeking] = useState(false);

  useEffect(() => {
    if (password.length > 0 && showPassword) {
      const schedulePeek = () => {
        const peekInterval = setTimeout(() => {
          setIsPeeking(true);
          setTimeout(() => setIsPeeking(false), 800);
        }, Math.random() * 3000 + 2000);
        return peekInterval;
      };

      const firstPeek = schedulePeek();
      return () => clearTimeout(firstPeek);
    }
    setIsPeeking(false);
  }, [password, showPassword, isPeeking]);

  return isPeeking;
}

// ============================================
// PURPLE CHARACTER
// ============================================

interface PurpleCharacterProps {
  readonly position: CharacterPosition;
  readonly state: CharacterState;
  readonly isLookingAtEachOther: boolean;
}

/**
 * Purple tall rectangle character
 */
export const PurpleCharacter = memo<PurpleCharacterProps>(({
  position,
  state,
  isLookingAtEachOther,
}) => {
  const isBlinking = useBlinking(true);
  const { isTyping, password, showPassword } = state;
  const isHiding = password.length > 0 && !showPassword;

  return (
    <div
      className="absolute bottom-0 transition-all duration-700 ease-in-out"
      style={{
        left: '70px',
        width: '180px',
        height: (isTyping || isHiding) ? '440px' : '400px',
        backgroundColor: '#6C3FF5',
        borderRadius: '10px 10px 0 0',
        zIndex: 1,
        transform: (password.length > 0 && showPassword)
          ? 'skewX(0deg)'
          : (isTyping || isHiding)
            ? `skewX(${(position.bodySkew || 0) - 12}deg) translateX(40px)`
            : `skewX(${position.bodySkew || 0}deg)`,
        transformOrigin: 'bottom center',
      }}
      aria-hidden="true"
    >
      {/* Eyes */}
      <div
        className="absolute flex gap-8 transition-all duration-700 ease-in-out"
        style={{
          left: (password.length > 0 && showPassword)
            ? '20px'
            : isLookingAtEachOther
              ? '55px'
              : `${45 + position.faceX}px`,
          top: (password.length > 0 && showPassword)
            ? '35px'
            : isLookingAtEachOther
              ? '65px'
              : `${40 + position.faceY}px`,
        }}
      >
        <EyeBall
          size={18}
          pupilSize={7}
          maxDistance={5}
          eyeColor="white"
          pupilColor="black"
          isBlinking={isBlinking}
          forceLookX={isLookingAtEachOther ? 6 : undefined}
          forceLookY={isLookingAtEachOther ? 2 : undefined}
        />
        <EyeBall
          size={18}
          pupilSize={7}
          maxDistance={5}
          eyeColor="white"
          pupilColor="black"
          isBlinking={isBlinking}
          forceLookX={isLookingAtEachOther ? 6 : undefined}
          forceLookY={isLookingAtEachOther ? 2 : undefined}
        />
      </div>

      {/* Hands */}
      {(password.length > 0 && !showPassword) && (
        <>
          <div
            className="absolute w-[50px] h-[20px] bg-[#6C3FF5] rounded-full transition-all duration-500"
            style={{
              right: '-30px',
              top: '45px',
              transform: 'rotate(-25deg)',
            }}
          />
          <div
            className="absolute w-[50px] h-[20px] bg-[#6C3FF5] rounded-full transition-all duration-500"
            style={{
              right: '-30px',
              top: '70px',
              transform: 'rotate(-10deg)',
            }}
          />
        </>
      )}
    </div>
  );
});
PurpleCharacter.displayName = 'PurpleCharacter';

// ============================================
// BLACK CHARACTER
// ============================================

interface BlackCharacterProps {
  readonly position: CharacterPosition;
  readonly isLookingAtEachOther: boolean;
}

/**
 * Black medium rectangle character
 */
export const BlackCharacter = memo<BlackCharacterProps>(({
  position,
  isLookingAtEachOther,
}) => {
  const isBlinking = useBlinking(true);

  return (
    <div
      className="absolute bottom-0 transition-all duration-500 ease-in-out"
      style={{
        left: '220px',
        width: '100px',
        height: '250px',
        backgroundColor: '#1a1a1a',
        borderRadius: '10px 10px 0 0',
        zIndex: 2,
        transform: `skewX(${position.bodySkew || 0}deg)`,
        transformOrigin: 'bottom center',
      }}
      aria-hidden="true"
    >
      {/* Eyes */}
      <div
        className="absolute flex gap-5 transition-all duration-500 ease-in-out"
        style={{
          left: isLookingAtEachOther ? '10px' : `${28 + position.faceX}px`,
          top: isLookingAtEachOther ? '60px' : `${45 + position.faceY}px`,
        }}
      >
        <EyeBall
          size={14}
          pupilSize={5}
          maxDistance={4}
          eyeColor="white"
          pupilColor="black"
          isBlinking={isBlinking}
          forceLookX={isLookingAtEachOther ? -5 : undefined}
          forceLookY={isLookingAtEachOther ? 2 : undefined}
        />
        <EyeBall
          size={14}
          pupilSize={5}
          maxDistance={4}
          eyeColor="white"
          pupilColor="black"
          isBlinking={isBlinking}
          forceLookX={isLookingAtEachOther ? -5 : undefined}
          forceLookY={isLookingAtEachOther ? 2 : undefined}
        />
      </div>
    </div>
  );
});
BlackCharacter.displayName = 'BlackCharacter';

// ============================================
// YELLOW CHARACTER
// ============================================

interface YellowCharacterProps {
  readonly position: CharacterPosition;
}

/**
 * Yellow wide short character
 */
export const YellowCharacter = memo<YellowCharacterProps>(({
  position,
}) => (
  <div
    className="absolute bottom-0 transition-all duration-500 ease-in-out"
    style={{
      left: '300px',
      width: '130px',
      height: '160px',
      backgroundColor: '#FFD93D',
      borderRadius: '10px 10px 0 0',
      zIndex: 3,
      transform: `skewX(${position.bodySkew || 0}deg)`,
      transformOrigin: 'bottom center',
    }}
    aria-hidden="true"
  >
    {/* Single Eye */}
    <div
      className="absolute transition-all duration-500 ease-in-out"
      style={{
        left: `${53 + position.faceX}px`,
        top: `${40 + position.faceY}px`,
      }}
    >
      <EyeBall
        size={25}
        pupilSize={10}
        maxDistance={6}
        eyeColor="white"
        pupilColor="black"
      />
    </div>
  </div>
));
YellowCharacter.displayName = 'YellowCharacter';

// ============================================
// ORANGE CHARACTER
// ============================================

interface OrangeCharacterProps {
  readonly position: CharacterPosition;
}

/**
 * Orange small round character
 */
export const OrangeCharacter = memo<OrangeCharacterProps>(({
  position,
}) => (
  <div
    className="absolute bottom-0 transition-all duration-500 ease-in-out"
    style={{
      left: '410px',
      width: '80px',
      height: '120px',
      backgroundColor: '#FF8C42',
      borderRadius: '40px 40px 0 0',
      zIndex: 4,
      transform: `skewX(${position.bodySkew || 0}deg)`,
      transformOrigin: 'bottom center',
    }}
    aria-hidden="true"
  >
    {/* Eyes */}
    <div
      className="absolute flex gap-3 transition-all duration-500 ease-in-out"
      style={{
        left: `${18 + position.faceX}px`,
        top: `${30 + position.faceY}px`,
      }}
    >
      <EyeBall
        size={12}
        pupilSize={4}
        maxDistance={3}
        eyeColor="white"
        pupilColor="black"
      />
      <EyeBall
        size={12}
        pupilSize={4}
        maxDistance={3}
        eyeColor="white"
        pupilColor="black"
      />
    </div>
  </div>
));
OrangeCharacter.displayName = 'OrangeCharacter';

// ============================================
// CHARACTERS CONTAINER
// ============================================

interface CharactersProps {
  readonly mouseX: number;
  readonly mouseY: number;
  readonly state: CharacterState;
}

/**
 * Container for all animated characters
 */
export const Characters = memo<CharactersProps>(({
  mouseX,
  mouseY,
  state,
}) => {
  const position = useCharacterPositions(mouseX, mouseY);
  const isLookingAtEachOther = useLookAtEachOther(state.isTyping);

  return (
    <div
      className="relative"
      style={{ width: '550px', height: '400px' }}
      aria-hidden="true"
      role="img"
      aria-label="Personnages animés décoratifs"
    >
      <PurpleCharacter
        position={position}
        state={state}
        isLookingAtEachOther={isLookingAtEachOther}
      />
      <BlackCharacter
        position={position}
        isLookingAtEachOther={isLookingAtEachOther}
      />
      <YellowCharacter position={position} />
      <OrangeCharacter position={position} />
    </div>
  );
});
Characters.displayName = 'Characters';
