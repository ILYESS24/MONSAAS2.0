/**
 * @module features/creation
 * @description Creation feature exports
 */

// Re-export creation pages
export { default as ImageCreation } from '@/pages/creation/ImageCreation';
export { default as VideoCreation } from '@/pages/creation/VideoCreation';

// Re-export shared creation components
export {
  BackButton,
  CreationHeader,
  SuggestionGrid,
  CreditsDisplay,
  PromptInputArea,
  CreationBackground,
} from '@/components/creation/shared';
