/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
// AI API Services - OpenRouter (via Backend) & Freepik
// ⚠️ SÉCURISÉ: OpenRouter API key est maintenant côté backend uniquement
// Optimisé pour la production avec gestion d'erreurs et timeouts

import { logger } from './logger';
import { supabase } from '@/lib/supabase';

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
    // Récupérer le token d'authentification Supabase
    const { data: { session } } = await supabase.auth.getSession();
    
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

export interface FreepikGenerationOptions {
  prompt: string;
  negative_prompt?: string;
  guidance_scale?: number;
  seed?: number;
  num_images?: number;
  image?: {
    size: 'square_1_1' | 'landscape_4_3' | 'landscape_16_9' | 'portrait_3_4' | 'portrait_9_16';
  };
  styling?: {
    style?: 'photo' | 'digital-art' | 'anime' | '3d' | 'vector' | 'painting';
    color?: 'vibrant' | 'muted' | 'monochrome' | 'warm' | 'cool';
    framing?: 'portrait' | 'full-body' | 'closeup' | 'wide' | 'aerial';
    lighting?: 'natural' | 'studio' | 'dramatic' | 'soft' | 'backlit';
  };
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

export async function generateImageWithFreepik(
  options: FreepikGenerationOptions
): Promise<FreepikGenerationResult> {
  return retryWithBackoff(async () => {
    const body = {
      prompt: options.prompt,
      negative_prompt: options.negative_prompt || 'blurry, bad quality, distorted, ugly',
      guidance_scale: options.guidance_scale || 7.5,
      seed: options.seed,
      num_images: options.num_images || 1,
      image: options.image || { size: 'square_1_1' },
      styling: options.styling || { style: 'photo' },
    };

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
      throw new Error(`Image generation failed: ${response.status}`);
    }

    return response.json();
  }, 2, 2000); // 2 retries, 2s base delay (images prennent plus de temps)
}

// Video generation placeholder
export async function generateVideoWithAI(prompt: string): Promise<{ url: string; status: string }> {
  // Simuler le temps de traitement
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return {
    url: '',
    status: 'Video generation coming soon. Currently using Freepik for images.',
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
