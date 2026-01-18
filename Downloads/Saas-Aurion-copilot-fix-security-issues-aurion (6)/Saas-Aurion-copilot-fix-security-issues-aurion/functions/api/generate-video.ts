/**
 * Generate Video API - Cloudflare Pages Function
 * 
 * This endpoint calls Freepik API to generate videos from images (image-to-video)
 * using the Kling v2 model.
 * 
 * Supported endpoints:
 * - POST /api/generate-video - Start video generation
 * - GET /api/generate-video?taskId=xxx - Check generation status
 * 
 * NOTE: The Freepik API key must be set via `wrangler secret put FREEPIK_API_KEY`
 */

interface Env {
  FREEPIK_API_KEY: string;
}

// ============================================
// VIDEO MODELS - Complete list from Freepik API
// ============================================
export const VIDEO_MODELS = {
  // === KLING MODELS (Most Popular) ===
  'kling-v2': {
    id: 'kling-v2',
    name: 'Kling v2',
    endpoint: 'https://api.freepik.com/v1/ai/image-to-video/kling-v2',
    description: 'High quality image-to-video generation',
    maxDuration: 5,
    aspectRatios: ['16:9', '9:16', '1:1'],
    icon: '🎬',
    category: 'kling',
  },
  'kling-v2-1-master': {
    id: 'kling-v2-1-master',
    name: 'Kling 2.1 Master',
    endpoint: 'https://api.freepik.com/v1/ai/image-to-video/kling-v2-1-master',
    description: 'Latest master model with best quality',
    maxDuration: 10,
    aspectRatios: ['16:9', '9:16', '1:1'],
    icon: '👑',
    category: 'kling',
  },
  'kling-v2-5': {
    id: 'kling-v2-5',
    name: 'Kling 2.5',
    endpoint: 'https://api.freepik.com/v1/ai/image-to-video/kling-v2-5',
    description: 'Enhanced motion and stability',
    maxDuration: 10,
    aspectRatios: ['16:9', '9:16', '1:1'],
    icon: '🌟',
    category: 'kling',
  },
  'kling-v2-6': {
    id: 'kling-v2-6',
    name: 'Kling 2.6',
    endpoint: 'https://api.freepik.com/v1/ai/image-to-video/kling-v2-6',
    description: 'Sound support, cinematic effects',
    maxDuration: 10,
    aspectRatios: ['16:9', '9:16', '1:1'],
    icon: '🔊',
    category: 'kling',
    hasAudio: true,
  },
  'kling-o1': {
    id: 'kling-o1',
    name: 'Kling O1',
    endpoint: 'https://api.freepik.com/v1/ai/image-to-video/kling-o1',
    description: 'Optimized for fast generation',
    maxDuration: 5,
    aspectRatios: ['16:9', '9:16', '1:1'],
    icon: '⚡',
    category: 'kling',
  },
  'kling-motion-control': {
    id: 'kling-motion-control',
    name: 'Kling Motion Control',
    endpoint: 'https://api.freepik.com/v1/ai/image-to-video/kling-motion-control',
    description: 'Control gestures and expressions',
    maxDuration: 5,
    aspectRatios: ['16:9', '9:16', '1:1'],
    icon: '🎭',
    category: 'kling',
    supportsMotionControl: true,
  },
  'kling-v1-pro': {
    id: 'kling-v1-pro',
    name: 'Kling v1 Pro',
    endpoint: 'https://api.freepik.com/v1/ai/image-to-video/kling-v1-pro',
    description: 'Professional quality video generation',
    maxDuration: 5,
    aspectRatios: ['16:9', '9:16', '1:1'],
    icon: '🎥',
    category: 'kling',
  },
  'kling-v1-standard': {
    id: 'kling-v1-standard',
    name: 'Kling v1 Standard',
    endpoint: 'https://api.freepik.com/v1/ai/image-to-video/kling-v1-standard',
    description: 'Standard quality, faster generation',
    maxDuration: 5,
    aspectRatios: ['16:9', '9:16', '1:1'],
    icon: '📹',
    category: 'kling',
  },
  
  // === LUMA MODELS (Cinematic) ===
  'luma-ray-2': {
    id: 'luma-ray-2',
    name: 'Luma Ray 2',
    endpoint: 'https://api.freepik.com/v1/ai/image-to-video/luma-ray-2',
    description: 'Advanced ray-traced video generation',
    maxDuration: 5,
    aspectRatios: ['16:9', '9:16', '1:1'],
    icon: '✨',
    category: 'luma',
  },
  'luma-dream-machine': {
    id: 'luma-dream-machine',
    name: 'Luma Dream Machine',
    endpoint: 'https://api.freepik.com/v1/ai/image-to-video/luma-dream-machine',
    description: 'Wide shots, landscapes, cityscapes',
    maxDuration: 5,
    aspectRatios: ['16:9', '9:16', '1:1'],
    icon: '🌅',
    category: 'luma',
  },
  
  // === MINIMAX / HAILUO MODELS ===
  'minimax-video-01': {
    id: 'minimax-video-01',
    name: 'MiniMax Video',
    endpoint: 'https://api.freepik.com/v1/ai/image-to-video/minimax-video-01',
    description: 'Efficient video generation',
    maxDuration: 6,
    aspectRatios: ['16:9', '9:16', '1:1'],
    icon: '⚡',
    category: 'minimax',
  },
  'minimax-live': {
    id: 'minimax-live',
    name: 'MiniMax Live Illustrations',
    endpoint: 'https://api.freepik.com/v1/ai/image-to-video/minimax-live',
    description: 'Animated illustrations',
    maxDuration: 6,
    aspectRatios: ['16:9', '9:16', '1:1'],
    icon: '🎨',
    category: 'minimax',
  },
  'hailuo-02': {
    id: 'hailuo-02',
    name: 'Hailuo 02',
    endpoint: 'https://api.freepik.com/v1/ai/image-to-video/hailuo-02',
    description: 'Realistic human motion',
    maxDuration: 5,
    aspectRatios: ['16:9', '9:16', '1:1'],
    icon: '🚶',
    category: 'hailuo',
  },
  
  // === RUNWAY MODELS ===
  'runway-gen-3': {
    id: 'runway-gen-3',
    name: 'Runway Gen 3',
    endpoint: 'https://api.freepik.com/v1/ai/image-to-video/runway-gen-3',
    description: 'Fast generation, character close-ups',
    maxDuration: 4,
    aspectRatios: ['16:9', '9:16', '1:1'],
    icon: '🎬',
    category: 'runway',
  },
  'runway-gen-4': {
    id: 'runway-gen-4',
    name: 'Runway Gen 4',
    endpoint: 'https://api.freepik.com/v1/ai/image-to-video/runway-gen-4',
    description: 'Multi-scene, rapid prototyping',
    maxDuration: 10,
    aspectRatios: ['16:9', '9:16', '1:1'],
    icon: '🚀',
    category: 'runway',
  },
  'runway-act-two': {
    id: 'runway-act-two',
    name: 'Runway Act-Two',
    endpoint: 'https://api.freepik.com/v1/ai/image-to-video/runway-act-two',
    description: 'Character animation with video reference',
    maxDuration: 5,
    aspectRatios: ['16:9', '9:16', '1:1'],
    icon: '🎭',
    category: 'runway',
    supportsVideoReference: true,
  },
  
  // === PIKA MODELS ===
  'pika-1': {
    id: 'pika-1',
    name: 'Pika 1.0',
    endpoint: 'https://api.freepik.com/v1/ai/image-to-video/pika-1',
    description: 'Quick social media content',
    maxDuration: 4,
    aspectRatios: ['16:9', '9:16', '1:1'],
    icon: '📱',
    category: 'pika',
  },
  'pika-2': {
    id: 'pika-2',
    name: 'Pika 2.0',
    endpoint: 'https://api.freepik.com/v1/ai/image-to-video/pika-2',
    description: 'Stylized animation, concept art',
    maxDuration: 5,
    aspectRatios: ['16:9', '9:16', '1:1'],
    icon: '🎨',
    category: 'pika',
  },
  
  // === MOCHI MODELS ===
  'mochi-v1': {
    id: 'mochi-v1',
    name: 'Mochi V1',
    endpoint: 'https://api.freepik.com/v1/ai/image-to-video/mochi-v1',
    description: 'Nature and animal videos',
    maxDuration: 5,
    aspectRatios: ['16:9', '9:16', '1:1'],
    icon: '🐾',
    category: 'mochi',
  },
  
  // === WAN MODELS (Anime/Stylized) ===
  'wan-2-5': {
    id: 'wan-2-5',
    name: 'WAN 2.5',
    endpoint: 'https://api.freepik.com/v1/ai/image-to-video/wan-2-5',
    description: 'Anime and comic-style motion',
    maxDuration: 5,
    aspectRatios: ['16:9', '9:16', '1:1'],
    icon: '🎌',
    category: 'wan',
  },
  
  // === GOOGLE/OPENAI MODELS ===
  'veo-2': {
    id: 'veo-2',
    name: 'Google Veo 2',
    endpoint: 'https://api.freepik.com/v1/ai/image-to-video/veo-2',
    description: 'Photorealism, physics modeling',
    maxDuration: 8,
    aspectRatios: ['16:9', '9:16', '1:1'],
    icon: '🌐',
    category: 'google',
  },
  'veo-3': {
    id: 'veo-3',
    name: 'Google Veo 3',
    endpoint: 'https://api.freepik.com/v1/ai/image-to-video/veo-3',
    description: 'Sound-enabled video generation',
    maxDuration: 10,
    aspectRatios: ['16:9', '9:16', '1:1'],
    icon: '🔊',
    category: 'google',
    hasAudio: true,
  },
  'sora-2': {
    id: 'sora-2',
    name: 'OpenAI Sora 2',
    endpoint: 'https://api.freepik.com/v1/ai/image-to-video/sora-2',
    description: 'Text-to-video with realistic motion',
    maxDuration: 10,
    aspectRatios: ['16:9', '9:16', '1:1'],
    icon: '🧠',
    category: 'openai',
    hasAudio: true,
  },
  
  // === PIXVERSE MODELS ===
  'pixverse-3-5': {
    id: 'pixverse-3-5',
    name: 'PixVerse 3.5',
    endpoint: 'https://api.freepik.com/v1/ai/image-to-video/pixverse-3-5',
    description: 'Stylized video generation',
    maxDuration: 6,
    aspectRatios: ['16:9', '9:16', '1:1'],
    icon: '🎮',
    category: 'pixverse',
  },
} as const;

type VideoModelId = keyof typeof VIDEO_MODELS;

interface VideoGenerationRequest {
  /** Base64 encoded image or image URL */
  image: string;
  /** Optional motion prompt describing how the image should animate */
  prompt?: string;
  /** Video model to use */
  model?: VideoModelId;
  /** Duration in seconds (default: 5) */
  duration?: number;
  /** Aspect ratio (default: 16:9) */
  aspect_ratio?: '16:9' | '9:16' | '1:1';
  /** Negative prompt */
  negative_prompt?: string;
  /** CFG scale (default: 7.5) */
  cfg_scale?: number;
  /** Motion intensity 0-1 (default: 0.5) */
  motion_intensity?: number;
}

interface VideoStatusRequest {
  taskId: string;
}

/**
 * Validates the video generation request
 */
function validateVideoRequest(body: unknown): body is VideoGenerationRequest {
  if (!body || typeof body !== 'object') return false;
  const req = body as Record<string, unknown>;
  
  // Image is required (base64 or URL)
  if (typeof req.image !== 'string' || req.image.trim().length === 0) {
    return false;
  }
  
  // Validate model if provided
  if (req.model && !Object.keys(VIDEO_MODELS).includes(req.model as string)) {
    return false;
  }
  
  // Validate duration if provided
  if (req.duration !== undefined) {
    const duration = req.duration as number;
    if (typeof duration !== 'number' || duration < 1 || duration > 10) {
      return false;
    }
  }
  
  // Validate aspect_ratio if provided
  const validAspectRatios = ['16:9', '9:16', '1:1'];
  if (req.aspect_ratio && !validAspectRatios.includes(req.aspect_ratio as string)) {
    return false;
  }
  
  return true;
}

/**
 * Start video generation via Freepik API
 */
async function handleGenerateVideo(request: Request, env: Env): Promise<Response> {
  try {
    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate request
    if (!validateVideoRequest(body)) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request: image is required. Optionally provide model, duration, and aspect_ratio.',
          validModels: Object.keys(VIDEO_MODELS),
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check for API key
    const apiKey = env.FREEPIK_API_KEY;
    if (!apiKey) {
      console.error('FREEPIK_API_KEY is not configured');
      return new Response(
        JSON.stringify({ 
          error: 'Video generation service is not configured. Please contact support.',
          code: 'FREEPIK_NOT_CONFIGURED'
        }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get model configuration
    const modelId = (body.model || 'kling-v2') as VideoModelId;
    const model = VIDEO_MODELS[modelId];
    
    // Prepare Freepik API request body
    const freepikBody: Record<string, unknown> = {
      image: body.image,
    };
    
    // Add optional parameters
    if (body.prompt) {
      freepikBody.prompt = body.prompt.trim();
    }
    if (body.negative_prompt) {
      freepikBody.negative_prompt = body.negative_prompt;
    }
    if (body.duration) {
      freepikBody.duration = Math.min(body.duration, model.maxDuration);
    }
    if (body.aspect_ratio) {
      freepikBody.aspect_ratio = body.aspect_ratio;
    }
    if (body.cfg_scale !== undefined) {
      freepikBody.cfg_scale = body.cfg_scale;
    }
    if (body.motion_intensity !== undefined) {
      freepikBody.motion_intensity = Math.max(0, Math.min(1, body.motion_intensity));
    }

    // Call Freepik API
    console.log(`Calling Freepik Video API (${modelId}) for image-to-video generation`);
    
    const response = await fetch(model.endpoint, {
      method: 'POST',
      headers: {
        'x-freepik-api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(freepikBody),
    });

    // Handle Freepik API errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Freepik Video API error (${response.status}):`, errorText);
      
      let errorMessage = 'Video generation failed';
      let errorCode = 'FREEPIK_VIDEO_ERROR';
      
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.message) errorMessage = errorJson.message;
        if (errorJson.code) errorCode = errorJson.code;
      } catch {
        // Keep default error message
      }

      // Map status codes to user-friendly messages
      if (response.status === 401 || response.status === 403) {
        errorMessage = 'Video generation service authentication failed. Please contact support.';
        errorCode = 'FREEPIK_AUTH_ERROR';
      } else if (response.status === 429) {
        errorMessage = 'Too many video generation requests. Please wait a moment and try again.';
        errorCode = 'RATE_LIMIT';
      } else if (response.status === 400) {
        errorMessage = `Invalid video generation request: ${errorMessage}`;
        errorCode = 'INVALID_REQUEST';
      }

      return new Response(
        JSON.stringify({ error: errorMessage, code: errorCode }),
        { 
          status: response.status >= 500 ? 503 : response.status, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // Success - return task ID for status polling
    const data = await response.json();
    console.log('Freepik Video API success - task created:', data);

    return new Response(JSON.stringify({
      ...data,
      model: modelId,
      status: 'processing',
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store',
      },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Generate video error:', errorMessage);
    
    return new Response(
      JSON.stringify({ 
        error: 'An unexpected error occurred during video generation',
        code: 'INTERNAL_ERROR'
      }), 
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * Check video generation status
 */
async function handleGetVideoStatus(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const taskId = url.searchParams.get('taskId');
  const model = url.searchParams.get('model') || 'kling-v2';
  
  if (!taskId) {
    return new Response(
      JSON.stringify({ error: 'taskId is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const apiKey = env.FREEPIK_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'Service not configured', code: 'FREEPIK_NOT_CONFIGURED' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Get status from Freepik
  const modelConfig = VIDEO_MODELS[model as VideoModelId] || VIDEO_MODELS['kling-v2'];
  const statusUrl = `${modelConfig.endpoint}/${taskId}`;
  
  try {
    const response = await fetch(statusUrl, {
      method: 'GET',
      headers: {
        'x-freepik-api-key': apiKey,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Freepik status check error (${response.status}):`, errorText);
      
      return new Response(
        JSON.stringify({ error: 'Failed to check video status', code: 'STATUS_CHECK_FAILED' }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store',
      },
    });
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Video status check error:', errorMessage);
    
    return new Response(
      JSON.stringify({ error: 'Failed to check video status', code: 'INTERNAL_ERROR' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * GET /api/generate-video - List available models or check task status
 */
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  
  // If taskId is provided, check status
  if (url.searchParams.has('taskId')) {
    return handleGetVideoStatus(context.request, context.env);
  }
  
  // Otherwise, return available models
  return new Response(JSON.stringify({
    models: Object.values(VIDEO_MODELS).map(m => ({
      id: m.id,
      name: m.name,
      description: m.description,
      maxDuration: m.maxDuration,
      aspectRatios: m.aspectRatios,
    })),
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'max-age=3600', // Cache model list for 1 hour
    },
  });
};

/**
 * POST /api/generate-video - Start video generation
 */
export const onRequestPost: PagesFunction<Env> = async (context) => {
  return handleGenerateVideo(context.request, context.env);
};

/**
 * OPTIONS handler - CORS preflight
 */
export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
};
