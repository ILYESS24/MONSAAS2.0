/**
 * @fileoverview Sign-up page module exports
 * 
 * This module splits the original 1351-line SignUp.tsx into
 * smaller, more maintainable components:
 * 
 * - EyeComponents.tsx: Pupil, EyeBall, useBlinking hook
 * - CharacterAnimations.tsx: All animated character components
 * - SignUpForm.tsx: Form fields, validation, submission
 * - Layout.tsx: Page layout components
 * - index.ts: Main SignUpPage component and exports
 * 
 * Benefits:
 * - Better code organization
 * - Easier testing
 * - Improved reusability
 * - Clearer separation of concerns
 * 
 * @module pages/signup
 */

export { Pupil, EyeBall, useBlinking } from './EyeComponents';
export type { PupilProps, EyeBallProps } from './EyeComponents';

export {
  Characters,
  PurpleCharacter,
  BlackCharacter,
  YellowCharacter,
  OrangeCharacter,
  useCharacterPositions,
  useLookAtEachOther,
  useSneakyPeek,
} from './CharacterAnimations';
export type { CharacterState, CharacterPosition } from './CharacterAnimations';

export {
  SignUpForm,
  SocialSignUp,
  SignInLink,
} from './SignUpForm';
export type { SignUpFormData, SignUpFormProps } from './SignUpForm';

export {
  PageContainer,
  LeftPanel,
  RightPanel,
} from './Layout';

// Re-export main component as default
export { default } from './SignUpPage';
