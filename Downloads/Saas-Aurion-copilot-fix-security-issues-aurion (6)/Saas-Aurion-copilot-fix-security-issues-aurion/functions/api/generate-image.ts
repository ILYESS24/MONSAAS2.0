/**
 * Generate Image API - Cloudflare Pages Function
 * 
 * This endpoint calls Freepik API to generate images from text prompts.
 * Supports multiple models: Classic, Flux Dev, Flux Pro, Flux Realism, Mystic
 * 
 * Credits verification is handled client-side via use-plan.ts hook
 * before this API is called.
 * 
 * NOTE: The Freepik API key must be set via `wrangler secret put FREEPIK_API_KEY`
 */

interface Env {
  FREEPIK_API_KEY: string;
}

/**
 * Available image generation models from Freepik API
 * Complete list of all available text-to-image models
 */
const IMAGE_MODELS = {
  // === CLASSIC MODELS ===
  'classic': {
    endpoint: 'https://api.freepik.com/v1/ai/text-to-image',
    name: 'Classic Fast',
    description: 'Fast generation with good quality',
    icon: '⚡',
    category: 'classic',
  },
  
  // === FLUX MODELS ===
  'flux-dev': {
    endpoint: 'https://api.freepik.com/v1/ai/text-to-image/flux-dev',
    name: 'Flux Dev',
    description: 'Development/testing with high customization',
    icon: '🔧',
    category: 'flux',
  },
  'flux-pro': {
    endpoint: 'https://api.freepik.com/v1/ai/text-to-image/flux-pro',
    name: 'Flux Pro',
    description: 'High performance and professional quality',
    icon: '🎯',
    category: 'flux',
  },
  'flux-realism': {
    endpoint: 'https://api.freepik.com/v1/ai/text-to-image/flux-realism',
    name: 'Flux Realism',
    description: 'Photorealistic and lifelike images',
    icon: '📷',
    category: 'flux',
  },
  'flux-1-fast': {
    endpoint: 'https://api.freepik.com/v1/ai/text-to-image/flux-1-fast',
    name: 'Flux 1.0 Fast',
    description: 'Quick generation for brainstorming',
    icon: '⚡',
    category: 'flux',
  },
  'flux-1-versatile': {
    endpoint: 'https://api.freepik.com/v1/ai/text-to-image/flux-1-versatile',
    name: 'Flux 1.0 Versatile',
    description: 'General-purpose for realistic scenes',
    icon: '🎨',
    category: 'flux',
  },
  'flux-1-1-precision': {
    endpoint: 'https://api.freepik.com/v1/ai/text-to-image/flux-1-1-precision',
    name: 'Flux 1.1 Precision',
    description: 'Accurate prompt adherence, concept art',
    icon: '🎯',
    category: 'flux',
  },
  'flux-schnell': {
    endpoint: 'https://api.freepik.com/v1/ai/text-to-image/flux-schnell',
    name: 'Flux Schnell',
    description: 'Ultra-fast generation (4 steps)',
    icon: '🚀',
    category: 'flux',
  },
  'flux-2-pro': {
    endpoint: 'https://api.freepik.com/v1/ai/text-to-image/flux-2-pro',
    name: 'Flux 2.0 Pro',
    description: 'Next-gen quality with references',
    icon: '💎',
    category: 'flux',
  },
  'flux-2-max': {
    endpoint: 'https://api.freepik.com/v1/ai/text-to-image/flux-2-max',
    name: 'Flux 2.0 Max',
    description: 'Maximum quality, 2K resolution',
    icon: '👑',
    category: 'flux',
  },
  
  // === FLUX KONTEXT MODELS (Character Consistency) ===
  'flux-kontext-pro': {
    endpoint: 'https://api.freepik.com/v1/ai/text-to-image/flux-kontext-pro',
    name: 'Flux Kontext Pro',
    description: 'Character consistency, branded visuals',
    icon: '🎭',
    category: 'kontext',
  },
  'flux-kontext-max': {
    endpoint: 'https://api.freepik.com/v1/ai/text-to-image/flux-kontext-max',
    name: 'Flux Kontext Max',
    description: 'Maximum consistency and quality',
    icon: '🌟',
    category: 'kontext',
  },
  
  // === MYSTIC MODELS (Ultra-Realistic) ===
  'mystic': {
    endpoint: 'https://api.freepik.com/v1/ai/mystic',
    name: 'Mystic 1.0',
    description: 'Ultra-realistic, high-res (1K-4K)',
    icon: '✨',
    category: 'mystic',
  },
  'mystic-realism': {
    endpoint: 'https://api.freepik.com/v1/ai/mystic',
    name: 'Mystic Realism',
    description: 'Photorealistic portrait and scenes',
    icon: '📸',
    category: 'mystic',
    subModel: 'realism',
  },
  'mystic-fluid': {
    endpoint: 'https://api.freepik.com/v1/ai/mystic',
    name: 'Mystic Fluid',
    description: 'Artistic and flowing visuals',
    icon: '🌊',
    category: 'mystic',
    subModel: 'fluid',
  },
  'mystic-super-real': {
    endpoint: 'https://api.freepik.com/v1/ai/mystic',
    name: 'Mystic Super Real',
    description: 'Hyper-realistic photography',
    icon: '🔬',
    category: 'mystic',
    subModel: 'super_real',
  },
  'mystic-editorial': {
    endpoint: 'https://api.freepik.com/v1/ai/mystic',
    name: 'Mystic Editorial',
    description: 'Magazine-quality portraits',
    icon: '📰',
    category: 'mystic',
    subModel: 'editorial_portraits',
  },
  'mystic-2-5': {
    endpoint: 'https://api.freepik.com/v1/ai/mystic/v2.5',
    name: 'Mystic 2.5',
    description: 'Latest artistic portraiture',
    icon: '🎨',
    category: 'mystic',
  },
  
  // === SPECIALIZED MODELS ===
  'magnific-upscaler': {
    endpoint: 'https://api.freepik.com/v1/ai/image-upscaler',
    name: 'Magnific Upscaler',
    description: 'AI upscaling 2x, 4x, 8x, 16x',
    icon: '🔍',
    category: 'tools',
    isUpscaler: true,
  },
  'image-relight': {
    endpoint: 'https://api.freepik.com/v1/ai/image-relight',
    name: 'Image Relight',
    description: 'Transform lighting in images',
    icon: '💡',
    category: 'tools',
    isEditor: true,
  },
} as const;

type ImageModelId = keyof typeof IMAGE_MODELS;

interface FreepikRequest {
  prompt: string;
  negative_prompt?: string;
  guidance_scale?: number;
  seed?: number;
  num_images?: number;
  model?: ImageModelId;
  image?: {
    size: 'square_1_1' | 'landscape_4_3' | 'landscape_16_9' | 'portrait_3_4' | 'portrait_9_16';
  } | string; // Can be size object or base64/URL for editing
  styling?: {
    style?: 'photo' | 'digital-art' | 'anime' | '3d' | 'vector' | 'painting';
    color?: string;
    framing?: string;
    lighting?: string;
  };
  // Mystic-specific options
  resolution?: '1k' | '2k' | '4k';
  aspect_ratio?: 'square_1_1' | 'classic_4_3' | 'traditional_3_4' | 'widescreen_16_9' | 'social_9_16';
  filter_nsfw?: boolean;
  // Kontext-specific options
  reference_images?: string[];
  // Upscaler-specific options
  scale?: 2 | 4 | 8 | 16;
}

/**
 * Validates the request body for Freepik image generation
 */
function validateRequest(body: unknown): body is FreepikRequest {
  if (!body || typeof body !== 'object') return false;
  const req = body as Record<string, unknown>;
  
  // Prompt is required and must be a non-empty string
  if (typeof req.prompt !== 'string' || req.prompt.trim().length === 0) {
    return false;
  }
  
  // Prompt max length (Freepik limit)
  if (req.prompt.length > 1000) {
    return false;
  }
  
  // Validate model if provided
  if (req.model && !Object.keys(IMAGE_MODELS).includes(req.model as string)) {
    return false;
  }
  
  return true;
}

/**
 * Builds the request body for different Freepik models
 */
function buildRequestBody(body: FreepikRequest, model: ImageModelId): Record<string, unknown> {
  const modelConfig = IMAGE_MODELS[model];
  const baseBody: Record<string, unknown> = {
    prompt: body.prompt.trim(),
    negative_prompt: body.negative_prompt || 'blurry, bad quality, distorted, ugly, deformed',
  };
  
  // Upscaler model
  if ((modelConfig as any).isUpscaler) {
    return {
      image: body.image, // Source image to upscale
      scale: body.scale || 2, // 2x, 4x, 8x, 16x
    };
  }
  
  // Editor models (relight, etc.)
  if ((modelConfig as any).isEditor) {
    return {
      ...baseBody,
      image: body.image, // Source image
    };
  }
  
  // Mystic models
  if ((modelConfig as any).category === 'mystic') {
    const mysticBody: Record<string, unknown> = {
      ...baseBody,
      resolution: body.resolution || '2k',
      aspect_ratio: body.aspect_ratio || 'square_1_1',
      filter_nsfw: body.filter_nsfw ?? true,
    };
    
    // Add sub-model if specified (realism, fluid, super_real, editorial_portraits)
    if ((modelConfig as any).subModel) {
      mysticBody.model = (modelConfig as any).subModel;
    }
    
    return mysticBody;
  }
  
  // Kontext models (character consistency)
  if ((modelConfig as any).category === 'kontext') {
    return {
      ...baseBody,
      guidance_scale: body.guidance_scale ?? 7.5,
      seed: body.seed,
      num_images: Math.min(body.num_images ?? 1, 4),
      aspect_ratio: body.aspect_ratio || 'square_1_1',
      // Kontext supports reference images for consistency
      reference_images: body.reference_images,
    };
  }
  
  // Standard text-to-image and Flux models
  return {
    ...baseBody,
    guidance_scale: body.guidance_scale ?? 7.5,
    seed: body.seed,
    num_images: Math.min(body.num_images ?? 1, 4), // Max 4 images
    image: body.image ?? { size: 'square_1_1' },
    styling: body.styling ?? { style: 'photo' },
  };
}

/**
 * Handles POST requests to generate images via Freepik API
 */
async function handleGenerateImage(request: Request, env: Env): Promise<Response> {
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
    if (!validateRequest(body)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: prompt is required (max 1000 characters)' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check for API key - CRITICAL
    const apiKey = env.FREEPIK_API_KEY;
    if (!apiKey) {
      console.error('FREEPIK_API_KEY is not configured');
      return new Response(
        JSON.stringify({ 
          error: 'Image generation service is not configured. Please contact support.',
          code: 'FREEPIK_NOT_CONFIGURED'
        }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get the model (default to classic)
    const modelId: ImageModelId = (body.model as ImageModelId) || 'classic';
    const modelConfig = IMAGE_MODELS[modelId];
    
    if (!modelConfig) {
      return new Response(
        JSON.stringify({ error: `Invalid model: ${modelId}` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Build model-specific request body
    const freepikBody = buildRequestBody(body, modelId);

    // Call Freepik API with the appropriate endpoint
    console.log(`Calling Freepik API (${modelConfig.name}) for prompt: "${body.prompt.substring(0, 50)}..."`);
    
    const response = await fetch(modelConfig.endpoint, {
      method: "POST",
      headers: {
        "x-freepik-api-key": apiKey,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(freepikBody),
    });

    // Handle Freepik API errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Freepik API error (${response.status}):`, errorText);
      
      // Parse error for better messages
      let errorMessage = 'Image generation failed';
      let errorCode = 'FREEPIK_ERROR';
      
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.message) {
          errorMessage = errorJson.message;
        }
        if (errorJson.code) {
          errorCode = errorJson.code;
        }
      } catch {
        // Keep default error message
      }

      // Map Freepik status codes to user-friendly messages
      if (response.status === 401 || response.status === 403) {
        errorMessage = 'Image generation service authentication failed. Please contact support.';
        errorCode = 'FREEPIK_AUTH_ERROR';
      } else if (response.status === 429) {
        errorMessage = 'Too many image generation requests. Please wait a moment and try again.';
        errorCode = 'RATE_LIMIT';
      } else if (response.status === 400) {
        errorMessage = `Invalid image generation request: ${errorMessage}`;
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

    // Success - return Freepik response
    const data = await response.json();
    console.log(`Freepik API success - image generated with model: ${modelConfig.name}`);

    return new Response(JSON.stringify({ ...data, model: modelId }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store", // Don't cache generated images references
      },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Generate image error:', errorMessage);
    
    return new Response(
      JSON.stringify({ 
        error: 'An unexpected error occurred during image generation',
        code: 'INTERNAL_ERROR'
      }), 
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

/**
 * POST handler - Generate image via Freepik
 */
export const onRequestPost: PagesFunction<Env> = async (context) => {
  return handleGenerateImage(context.request, context.env);
};

/**
 * GET handler - List available models
 */
export const onRequestGet: PagesFunction<Env> = async () => {
  const models = Object.entries(IMAGE_MODELS).map(([id, config]) => ({
    id,
    name: config.name,
    description: config.description,
    icon: config.icon,
  }));
  
  return new Response(JSON.stringify({ models }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    },
  });
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
      'Access-Control-Max-Age': '86400', // Cache preflight for 24 hours
    },
  });
};
