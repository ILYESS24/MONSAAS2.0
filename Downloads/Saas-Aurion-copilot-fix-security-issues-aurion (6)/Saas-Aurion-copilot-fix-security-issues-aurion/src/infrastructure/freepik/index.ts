/**
 * @module infrastructure/freepik
 * @description Freepik AI API integration
 */

// API endpoints
export const FREEPIK_API_BASE = 'https://api.freepik.com/v1';

export const FREEPIK_ENDPOINTS = {
  // Image endpoints
  IMAGE_CLASSIC_FAST: '/ai/text-to-image',
  IMAGE_FLUX_DEV: '/ai/flux-dev',
  IMAGE_FLUX_PRO: '/ai/flux-pro',
  IMAGE_FLUX_REALISM: '/ai/flux-realism',
  IMAGE_MYSTIC: '/ai/mystic',
  IMAGE_MAGNIFIC: '/ai/magnific/upscale',
  IMAGE_RELIGHT: '/ai/image-relight',
  
  // Video endpoints
  VIDEO_KLING_V2: '/ai/image-to-video/kling-v2',
  VIDEO_KLING_PRO: '/ai/image-to-video/kling-v1-pro',
  VIDEO_KLING_STANDARD: '/ai/image-to-video/kling-v1',
  VIDEO_LUMA_RAY: '/ai/image-to-video/luma-ray-2',
  VIDEO_MINIMAX: '/ai/image-to-video/minimax',
  
  // Task status
  TASK_STATUS: '/ai/tasks',
} as const;
