/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
// AI API Services - OpenRouter (via Backend) & Freepik
// ⚠️ SÉCURISÉ: OpenRouter API key est maintenant côté backend uniquement
// Optimisé pour la production avec gestion d'erreurs et timeouts

import { logger } from './logger';
import { getSupabase } from '@/lib/supabase';

// ============================================
// CONFIGURATION
// ============================================
// ✅ SÉCURITÉ: La clé OpenRouter est maintenant uniquement côté backend
// L'API frontend appelle /api/ai-chat qui a la clé sécurisée
const API_TIMEOUT = 60000; // 60 secondes

// ============================================
// RÉSILENCE - RETRY AVEC BACKOFF EXPONENTIEL
// ============================================

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      if (attempt === maxRetries) throw error;

      // Ne retry que pour certaines erreurs temporaires
      if (error.message?.includes('timeout') ||
          error.message?.includes('network') ||
          error.message?.includes('fetch') ||
          error.message?.includes('500') ||
          error.message?.includes('502') ||
          error.message?.includes('503') ||
          error.message?.includes('504') ||
          error.message?.includes('RATE_LIMIT') ||
          error.message?.includes('rate limit') ||
          error.message?.includes('overloaded') ||
          error.message?.includes('Provider overloaded')) {

        const delay = baseDelay * Math.pow(2, attempt);
        logger.warn(`🔄 Retry ${attempt + 1}/${maxRetries} after ${delay}ms: ${error.message}`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        // Erreur non retry-able (auth, quota, etc.)
        throw error;
      }
    }
  }
  throw new Error('Max retries exceeded');
}

// ============================================
// HELPER - Fetch avec timeout
// ============================================
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout = API_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ============================================
// OPENROUTER API - Text/Code Generation (via Backend sécurisé)
// ============================================
export const OPENROUTER_MODELS = [
  { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'OpenAI', type: 'chat' },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', type: 'chat' },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', type: 'chat' },
  { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku', provider: 'Anthropic', type: 'chat' },
  { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5', provider: 'Google', type: 'chat' },
  { id: 'google/gemini-flash-1.5', name: 'Gemini Flash 1.5', provider: 'Google', type: 'chat' },
  { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B', provider: 'Meta', type: 'chat' },
  { id: 'meta-llama/llama-3.1-8b-instruct', name: 'Llama 3.1 8B', provider: 'Meta', type: 'chat' },
  { id: 'mistralai/mistral-large', name: 'Mistral Large', provider: 'Mistral', type: 'chat' },
  { id: 'deepseek/deepseek-chat', name: 'DeepSeek Chat', provider: 'DeepSeek', type: 'chat' },
  { id: 'qwen/qwen-2-72b-instruct', name: 'Qwen 2 72B', provider: 'Alibaba', type: 'chat' },
] as const;

export interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OpenRouterResponse {
  id: string;
  choices: {
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  credits?: {
    used: number;
    remaining: number;
  };
}

/**
 * ✅ SÉCURISÉ: Appel via backend /api/ai-chat
 * La clé OpenRouter n'est plus exposée côté frontend
 */
export async function chatWithOpenRouter(
  messages: OpenRouterMessage[],
  model = 'openai/gpt-4o-mini',
  options?: {
    temperature?: number;
    max_tokens?: number;
    stream?: boolean;
    action_type?: 'ai_chat' | 'code_generation' | 'document_generation';
  }
): Promise<OpenRouterResponse> {
  return retryWithBackoff(async () => {
    const supabaseClient = getSupabase();
    if (!supabaseClient) {
      throw new Error('Supabase not configured. Please check your configuration.');
    }

    // Récupérer le token d'authentification Supabase
    const { data: { session } } = await supabaseClient.auth.getSession();

    if (!session?.access_token) {
      throw new Error('Authentication required. Please sign in.');
    }

    // Appel vers le backend sécurisé
    const response = await fetchWithTimeout(
      '/api/ai-chat',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          model,
          action_type: options?.action_type || 'ai_chat',
          options: {
            temperature: options?.temperature ?? 0.7,
            max_tokens: options?.max_tokens ?? 2048,
            stream: options?.stream ?? false,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      
      // Gestion spécifique des erreurs
      if (response.status === 401) {
        throw new Error('Session expired. Please sign in again.');
      }
      if (response.status === 402) {
        throw new Error(error.error || 'Insufficient credits');
      }
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment.');
      }
      
      throw new Error(error.error || `API error: ${response.status}`);
    }

    return response.json();
  }, 3, 1000); // 3 retries, 1s base delay
}

// Code generation helper - optimisé (utilise action_type pour coût correct)
export async function generateCode(
  prompt: string,
  language = 'javascript',
  model = 'openai/gpt-4o-mini'
): Promise<string> {
  const response = await chatWithOpenRouter(
    [
      { role: 'system', content: `Expert ${language} programmer. Output only clean, documented code.` },
      { role: 'user', content: prompt }
    ],
    model,
    { temperature: 0.3, max_tokens: 4096, action_type: 'code_generation' }
  );

  return response.choices[0]?.message?.content || '';
}

// Document writing helper (utilise action_type pour coût correct)
export async function generateDocument(
  prompt: string,
  type: 'email' | 'article' | 'report' | 'general' = 'general',
  model = 'openai/gpt-4o-mini'
): Promise<string> {
  const prompts: Record<string, string> = {
    email: 'Professional email writer. Be clear and concise.',
    article: 'Skilled content writer. Create engaging articles.',
    report: 'Business analyst. Write structured reports.',
    general: 'Helpful writing assistant.',
  };

  const response = await chatWithOpenRouter(
    [
      { role: 'system', content: prompts[type] },
      { role: 'user', content: prompt }
    ],
    model,
    { temperature: 0.7, max_tokens: 4096, action_type: 'document_generation' }
  );

  return response.choices[0]?.message?.content || '';
}

// ============================================
// FREEPIK API - Image Generation
// ============================================

/**
 * All available image generation models from Freepik API
 * Complete list including Classic, Flux, Flux Kontext, Mystic, and Tools
 */
export const IMAGE_MODELS = [
  // === CLASSIC MODELS ===
  { id: 'classic', name: 'Classic Fast', description: 'Fast generation with good quality', icon: '⚡', category: 'classic' },
  
  // === FLUX MODELS ===
  { id: 'flux-dev', name: 'Flux Dev', description: 'Development/testing with high customization', icon: '🔧', category: 'flux' },
  { id: 'flux-pro', name: 'Flux Pro', description: 'High performance and professional quality', icon: '🎯', category: 'flux' },
  { id: 'flux-realism', name: 'Flux Realism', description: 'Photorealistic and lifelike images', icon: '📷', category: 'flux' },
  { id: 'flux-1-fast', name: 'Flux 1.0 Fast', description: 'Quick generation for brainstorming', icon: '⚡', category: 'flux' },
  { id: 'flux-1-versatile', name: 'Flux 1.0 Versatile', description: 'General-purpose for realistic scenes', icon: '🎨', category: 'flux' },
  { id: 'flux-1-1-precision', name: 'Flux 1.1 Precision', description: 'Accurate prompt adherence, concept art', icon: '🎯', category: 'flux' },
  { id: 'flux-schnell', name: 'Flux Schnell', description: 'Ultra-fast generation (4 steps)', icon: '🚀', category: 'flux' },
  { id: 'flux-2-pro', name: 'Flux 2.0 Pro', description: 'Next-gen quality with references', icon: '💎', category: 'flux' },
  { id: 'flux-2-max', name: 'Flux 2.0 Max', description: 'Maximum quality, 2K resolution', icon: '👑', category: 'flux' },
  
  // === FLUX KONTEXT MODELS (Character Consistency) ===
  { id: 'flux-kontext-pro', name: 'Flux Kontext Pro', description: 'Character consistency, branded visuals', icon: '🎭', category: 'kontext' },
  { id: 'flux-kontext-max', name: 'Flux Kontext Max', description: 'Maximum consistency and quality', icon: '🌟', category: 'kontext' },
  
  // === MYSTIC MODELS (Ultra-Realistic) ===
  { id: 'mystic', name: 'Mystic 1.0', description: 'Ultra-realistic, high-res (1K-4K)', icon: '✨', category: 'mystic' },
  { id: 'mystic-realism', name: 'Mystic Realism', description: 'Photorealistic portrait and scenes', icon: '📸', category: 'mystic' },
  { id: 'mystic-fluid', name: 'Mystic Fluid', description: 'Artistic and flowing visuals', icon: '🌊', category: 'mystic' },
  { id: 'mystic-super-real', name: 'Mystic Super Real', description: 'Hyper-realistic photography', icon: '🔬', category: 'mystic' },
  { id: 'mystic-editorial', name: 'Mystic Editorial', description: 'Magazine-quality portraits', icon: '📰', category: 'mystic' },
  { id: 'mystic-2-5', name: 'Mystic 2.5', description: 'Latest artistic portraiture', icon: '🎨', category: 'mystic' },
  
  // === TOOLS ===
  { id: 'magnific-upscaler', name: 'Magnific Upscaler', description: 'AI upscaling 2x, 4x, 8x, 16x', icon: '🔍', category: 'tools' },
  { id: 'image-relight', name: 'Image Relight', description: 'Transform lighting in images', icon: '💡', category: 'tools' },
] as const;

export type ImageModelId = typeof IMAGE_MODELS[number]['id'];

export interface FreepikGenerationOptions {
  prompt: string;
  negative_prompt?: string;
  guidance_scale?: number;
  seed?: number;
  num_images?: number;
  /** Image model to use (default: classic) */
  model?: ImageModelId;
  image?: {
    size: 'square_1_1' | 'landscape_4_3' | 'landscape_16_9' | 'portrait_3_4' | 'portrait_9_16';
  } | string; // Can be size object or base64/URL for editing
  styling?: {
    style?: 'photo' | 'digital-art' | 'anime' | '3d' | 'vector' | 'painting';
    color?: 'vibrant' | 'muted' | 'monochrome' | 'warm' | 'cool';
    framing?: 'portrait' | 'full-body' | 'closeup' | 'wide' | 'aerial';
    lighting?: 'natural' | 'studio' | 'dramatic' | 'soft' | 'backlit';
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

export interface FreepikGenerationResult {
  data: {
    base64?: string;
    url?: string;
    has_nsfw?: boolean;
  }[] | {
    id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    images?: {
      url: string;
      base64?: string;
    }[];
  };
  meta?: {
    prompt: string;
    seed: number;
    image: {
      size: string;
      width: number;
      height: number;
    };
    credits_used?: number;
  };
}

/**
 * Génère une image via Freepik API (text-to-image)
 * Supports multiple models: Classic, Flux Dev, Flux Pro, Flux Realism, Mystic
 * 
 * @param options - Generation options including prompt and model
 * @returns Generated image data
 */
export async function generateImageWithFreepik(
  options: FreepikGenerationOptions
): Promise<FreepikGenerationResult> {
  return retryWithBackoff(async () => {
    const body: Record<string, unknown> = {
      prompt: options.prompt,
      negative_prompt: options.negative_prompt || 'blurry, bad quality, distorted, ugly',
      model: options.model || 'classic',
    };
    
    // Add model-specific options
    if (options.model === 'mystic') {
      // Mystic has different parameters
      body.resolution = options.resolution || '2k';
      body.aspect_ratio = options.aspect_ratio || 'square_1_1';
      body.filter_nsfw = options.filter_nsfw ?? true;
    } else {
      // Standard/Flux models
      body.guidance_scale = options.guidance_scale || 7.5;
      body.seed = options.seed;
      body.num_images = options.num_images || 1;
      body.image = options.image || { size: 'square_1_1' };
      body.styling = options.styling || { style: 'photo' };
    }

    // L'authentification est maintenant gérée côté frontend via use-plan.ts
    // Le backend vérifie les crédits via la base de données Supabase
    // Pour Freepik, on appelle directement le backend qui a la clé API
    const response = await fetchWithTimeout(
      '/api/generate-image',
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
      120000 // 2 minutes pour la génération d'images
    );

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('Freepik API error', { error: errorText });
      
      // Parse error for better error messages
      let errorMessage = `Image generation failed: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error) {
          errorMessage = errorJson.error;
        }
      } catch {
        // Keep original error message
      }
      
      throw new Error(errorMessage);
    }

    return response.json();
  }, 2, 2000); // 2 retries, 2s base delay (images prennent plus de temps)
}

/**
 * Fetches available image models from the API
 * 
 * @returns Array of available image models
 */
export async function getAvailableImageModels(): Promise<typeof IMAGE_MODELS> {
  try {
    const response = await fetchWithTimeout(
      '/api/generate-image',
      { method: 'GET', headers: { 'Accept': 'application/json' } },
      10000
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data.models && Array.isArray(data.models)) {
        return data.models;
      }
    }
  } catch {
    // Return default models on error
  }
  
  return IMAGE_MODELS as unknown as typeof IMAGE_MODELS;
}

// ============================================
// VIDEO GENERATION - Freepik Image-to-Video API
// ============================================

/**
 * All available video generation models from Freepik API
 * Complete list including Kling, Luma, MiniMax, Runway, Pika, Mochi, WAN, Google, OpenAI
 */
export const VIDEO_MODELS = [
  // === KLING MODELS (Most Popular) ===
  { id: 'kling-v2', name: 'Kling v2', description: 'High quality image-to-video', icon: '🎬', category: 'kling' },
  { id: 'kling-v2-1-master', name: 'Kling 2.1 Master', description: 'Latest master model, best quality', icon: '👑', category: 'kling' },
  { id: 'kling-v2-5', name: 'Kling 2.5', description: 'Enhanced motion and stability', icon: '🌟', category: 'kling' },
  { id: 'kling-v2-6', name: 'Kling 2.6 + Sound', description: 'Sound support, cinematic', icon: '🔊', category: 'kling', hasAudio: true },
  { id: 'kling-o1', name: 'Kling O1', description: 'Optimized for fast generation', icon: '⚡', category: 'kling' },
  { id: 'kling-motion-control', name: 'Kling Motion Control', description: 'Control gestures/expressions', icon: '🎭', category: 'kling' },
  { id: 'kling-v1-pro', name: 'Kling v1 Pro', description: 'Professional quality', icon: '🎥', category: 'kling' },
  { id: 'kling-v1-standard', name: 'Kling v1 Standard', description: 'Faster generation', icon: '📹', category: 'kling' },
  
  // === LUMA MODELS (Cinematic) ===
  { id: 'luma-ray-2', name: 'Luma Ray 2', description: 'Ray-traced video generation', icon: '✨', category: 'luma' },
  { id: 'luma-dream-machine', name: 'Luma Dream Machine', description: 'Landscapes, cityscapes', icon: '🌅', category: 'luma' },
  
  // === MINIMAX / HAILUO MODELS ===
  { id: 'minimax-video-01', name: 'MiniMax Video', description: 'Efficient generation', icon: '⚡', category: 'minimax' },
  { id: 'minimax-live', name: 'MiniMax Live', description: 'Animated illustrations', icon: '🎨', category: 'minimax' },
  { id: 'hailuo-02', name: 'Hailuo 02', description: 'Realistic human motion', icon: '🚶', category: 'hailuo' },
  
  // === RUNWAY MODELS ===
  { id: 'runway-gen-3', name: 'Runway Gen 3', description: 'Fast, character close-ups', icon: '🎬', category: 'runway' },
  { id: 'runway-gen-4', name: 'Runway Gen 4', description: 'Multi-scene, prototyping', icon: '🚀', category: 'runway' },
  { id: 'runway-act-two', name: 'Runway Act-Two', description: 'Character animation', icon: '🎭', category: 'runway' },
  
  // === PIKA MODELS ===
  { id: 'pika-1', name: 'Pika 1.0', description: 'Quick social content', icon: '📱', category: 'pika' },
  { id: 'pika-2', name: 'Pika 2.0', description: 'Stylized animation', icon: '🎨', category: 'pika' },
  
  // === MOCHI MODELS ===
  { id: 'mochi-v1', name: 'Mochi V1', description: 'Nature and animals', icon: '🐾', category: 'mochi' },
  
  // === WAN MODELS (Anime/Stylized) ===
  { id: 'wan-2-5', name: 'WAN 2.5', description: 'Anime/comic-style motion', icon: '🎌', category: 'wan' },
  
  // === GOOGLE/OPENAI MODELS ===
  { id: 'veo-2', name: 'Google Veo 2', description: 'Photorealism, physics', icon: '🌐', category: 'google' },
  { id: 'veo-3', name: 'Google Veo 3 + Sound', description: 'Sound-enabled video', icon: '🔊', category: 'google', hasAudio: true },
  { id: 'sora-2', name: 'OpenAI Sora 2', description: 'Text-to-video, realistic', icon: '🧠', category: 'openai', hasAudio: true },
  
  // === PIXVERSE MODELS ===
  { id: 'pixverse-3-5', name: 'PixVerse 3.5', description: 'Stylized video', icon: '🎮', category: 'pixverse' },
] as const;

export type VideoModelId = typeof VIDEO_MODELS[number]['id'];

export interface VideoGenerationOptions {
  /** Base64 encoded image or image URL */
  image: string;
  /** Optional motion prompt describing how the image should animate */
  prompt?: string;
  /** Video model to use (default: kling-v2) */
  model?: VideoModelId;
  /** Duration in seconds (default: 5, max depends on model) */
  duration?: number;
  /** Aspect ratio (default: 16:9) */
  aspect_ratio?: '16:9' | '9:16' | '1:1';
  /** Negative prompt - what to avoid */
  negative_prompt?: string;
  /** CFG scale for guidance (default: 7.5) */
  cfg_scale?: number;
  /** Motion intensity 0-1 (default: 0.5) */
  motion_intensity?: number;
}

export interface VideoGenerationResult {
  /** Task ID for polling status */
  taskId?: string;
  /** Alternative: task field from API */
  task?: { id: string };
  /** Current status */
  status: 'pending' | 'processing' | 'completed' | 'failed';
  /** Video URL when completed */
  video_url?: string;
  /** Alternative: videos array from API */
  videos?: { url: string }[];
  /** Model used */
  model?: string;
  /** Error message if failed */
  error?: string;
}

/**
 * Starts video generation via Freepik image-to-video API
 * Returns a task ID that can be used to poll for status
 * 
 * @param options - Video generation options including the source image
 * @returns Task ID and initial status
 */
export async function startVideoGeneration(
  options: VideoGenerationOptions
): Promise<VideoGenerationResult> {
  return retryWithBackoff(async () => {
    const response = await fetchWithTimeout(
      '/api/generate-video',
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: options.image,
          prompt: options.prompt,
          model: options.model || 'kling-v2',
          duration: options.duration || 5,
          aspect_ratio: options.aspect_ratio || '16:9',
          negative_prompt: options.negative_prompt,
          cfg_scale: options.cfg_scale,
          motion_intensity: options.motion_intensity,
        }),
      },
      180000 // 3 minutes timeout for video generation start
    );

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('Video generation error', { error: errorText });
      
      let errorMessage = `Video generation failed: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error) errorMessage = errorJson.error;
      } catch {
        // Keep default error message
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    // Normalize the response to our interface
    return {
      taskId: data.taskId || data.task?.id || data.id,
      status: data.status || 'processing',
      model: data.model,
      video_url: data.video_url,
      videos: data.videos,
    };
  }, 2, 3000); // 2 retries, 3s base delay
}

/**
 * Polls for video generation status
 * 
 * @param taskId - The task ID returned from startVideoGeneration
 * @param model - The model used (for correct status endpoint)
 * @returns Current status and video URL if completed
 */
export async function checkVideoStatus(
  taskId: string,
  model: VideoModelId = 'kling-v2'
): Promise<VideoGenerationResult> {
  const response = await fetchWithTimeout(
    `/api/generate-video?taskId=${encodeURIComponent(taskId)}&model=${encodeURIComponent(model)}`,
    {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    },
    30000 // 30 seconds timeout for status check
  );

  if (!response.ok) {
    const errorText = await response.text();
    logger.error('Video status check error', { error: errorText });
    
    throw new Error(`Failed to check video status: ${response.status}`);
  }

  const data = await response.json();
  
  // Normalize response
  const videoUrl = data.video_url || data.videos?.[0]?.url;
  
  return {
    taskId,
    status: data.status,
    video_url: videoUrl,
    videos: data.videos,
    model,
    error: data.error,
  };
}

/**
 * High-level function to generate a video and poll until complete
 * 
 * @param options - Video generation options
 * @param onProgress - Callback for status updates
 * @param maxPollTime - Maximum time to poll in ms (default: 5 minutes)
 * @returns Final video result with URL
 */
export async function generateVideoWithPolling(
  options: VideoGenerationOptions,
  onProgress?: (status: VideoGenerationResult) => void,
  maxPollTime: number = 300000 // 5 minutes
): Promise<VideoGenerationResult> {
  // Start generation
  const initialResult = await startVideoGeneration(options);
  
  if (!initialResult.taskId) {
    throw new Error('No task ID returned from video generation');
  }
  
  onProgress?.(initialResult);
  
  // If already completed (unlikely but possible)
  if (initialResult.status === 'completed' && initialResult.video_url) {
    return initialResult;
  }
  
  // Poll for completion
  const startTime = Date.now();
  const pollInterval = 5000; // 5 seconds between polls
  const model = (options.model || 'kling-v2') as VideoModelId;
  
  while (Date.now() - startTime < maxPollTime) {
    await new Promise(resolve => setTimeout(resolve, pollInterval));
    
    try {
      const status = await checkVideoStatus(initialResult.taskId, model);
      onProgress?.(status);
      
      if (status.status === 'completed') {
        return status;
      }
      
      if (status.status === 'failed') {
        throw new Error(status.error || 'Video generation failed');
      }
    } catch (error) {
      // Log but continue polling on transient errors
      logger.warn('Video status poll error, continuing...', { error });
    }
  }
  
  throw new Error('Video generation timed out. Please try again.');
}

/**
 * Fetches available video models from the API
 */
export async function getAvailableVideoModels(): Promise<typeof VIDEO_MODELS> {
  try {
    const response = await fetchWithTimeout(
      '/api/generate-video',
      { method: 'GET', headers: { 'Accept': 'application/json' } },
      10000
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data.models && Array.isArray(data.models)) {
        return data.models;
      }
    }
  } catch {
    // Return default models on error
  }
  
  return VIDEO_MODELS as unknown as typeof VIDEO_MODELS;
}

// Legacy function - kept for backward compatibility
export async function generateVideoWithAI(prompt: string): Promise<{ url: string; status: string }> {
  // This is a placeholder that generates a thumbnail image
  // For real video generation, use startVideoGeneration or generateVideoWithPolling
  logger.warn('generateVideoWithAI is deprecated. Use startVideoGeneration or generateVideoWithPolling instead.');
  
  return {
    url: '',
    status: 'Use startVideoGeneration() for actual video generation with Freepik API.',
  };
}

// ============================================
// STYLES & PRESETS
// ============================================
export const IMAGE_STYLES = [
  { id: 'photo', name: 'Réaliste', icon: '📷' },
  { id: 'digital-art', name: 'Art Digital', icon: '🎨' },
  { id: 'anime', name: 'Anime', icon: '🎌' },
  { id: '3d', name: '3D Render', icon: '🔷' },
  { id: 'vector', name: 'Vector', icon: '📐' },
  { id: 'painting', name: 'Peinture', icon: '🖼️' },
] as const;

export const IMAGE_SIZES = [
  { id: 'square_1_1', name: 'Carré (1:1)', width: 1024, height: 1024 },
  { id: 'landscape_4_3', name: 'Paysage (4:3)', width: 1024, height: 768 },
  { id: 'landscape_16_9', name: 'Wide (16:9)', width: 1024, height: 576 },
  { id: 'portrait_3_4', name: 'Portrait (3:4)', width: 768, height: 1024 },
  { id: 'portrait_9_16', name: 'Mobile (9:16)', width: 576, height: 1024 },
] as const;

export const LIGHTING_OPTIONS = [
  { id: 'natural', name: 'Naturel' },
  { id: 'studio', name: 'Studio' },
  { id: 'dramatic', name: 'Dramatique' },
  { id: 'soft', name: 'Doux' },
  { id: 'backlit', name: 'Contre-jour' },
] as const;
