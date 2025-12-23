/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================
// BACKEND API - AI Chat/Code Generation via OpenRouter
// VERSION SIMPLIFIÉE SANS MIDDLEWARE
// ============================================

import { createClient } from '@supabase/supabase-js';

interface Env {
  OPENROUTER_API_KEY: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

// ============================================
// CONFIGURATION OPENROUTER
// ============================================
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const API_TIMEOUT = 60000; // 60 secondes

// Modèles disponibles
const ALLOWED_MODELS = [
  'openai/gpt-4o',
  'openai/gpt-4o-mini',
  'anthropic/claude-3.5-sonnet',
  'anthropic/claude-3-haiku',
  'google/gemini-pro-1.5',
  'google/gemini-flash-1.5',
  'meta-llama/llama-3.1-70b-instruct',
  'meta-llama/llama-3.1-8b-instruct',
  'mistralai/mistral-large',
  'deepseek/deepseek-chat',
  'qwen/qwen-2-72b-instruct',
];

interface Env {
  OPENROUTER_API_KEY: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  model?: string;
  action_type?: 'ai_chat' | 'code_generation' | 'document_generation';
  options?: {
    temperature?: number;
    max_tokens?: number;
    stream?: boolean;
  };
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
// HELPER - Retry avec backoff exponentiel
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
        console.log(`🔄 Retry ${attempt + 1}/${maxRetries} after ${delay}ms: ${error.message}`);
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
// CONSOMMATION CRÉDITS (ATOMIQUE)
// ============================================
async function consumeCredits(
  userId: string,
  actionType: string,
  cost: number,
  metadata: Record<string, any>,
  env: Env
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  // Utiliser la fonction RPC atomique
  const { data, error } = await supabase.rpc('consume_user_credits', {
    p_user_id: userId,
    p_cost: cost,
    p_action_type: actionType,
    p_metadata: metadata
  });

  if (error) {
    console.error('❌ Erreur consommation crédits:', error);
    return { success: false, error: error.message };
  }

  if (data && !data.success) {
    return { success: false, error: data.error_message };
  }

  return { success: true };
}

// ============================================
// REMBOURSEMENT CRÉDITS (SI ERREUR API)
// ============================================
async function refundCredits(
  userId: string,
  amount: number,
  reason: string,
  env: Env
): Promise<void> {
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  await supabase.rpc('refund_user_credits', {
    p_user_id: userId,
    p_amount: amount,
    p_reason: reason
  });
}

// ============================================
// HANDLER PRINCIPAL - AI Chat
// ============================================
async function handleAIChat(
  user: AuthenticatedUser,
  request: Request,
  env: Env
): Promise<Response> {
  try {
    // Vérifier la clé API
    const apiKey = env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error('❌ OPENROUTER_API_KEY manquante');
      return createErrorResponse('AI service not configured', 503);
    }

    // Parser la requête
    const body: ChatRequest = await request.json();

    // Valider les messages
    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return createErrorResponse('Messages are required', 400);
    }

    // Valider le modèle
    const model = body.model || 'openai/gpt-4o-mini';
    if (!ALLOWED_MODELS.includes(model)) {
      return createErrorResponse(`Invalid model. Allowed: ${ALLOWED_MODELS.join(', ')}`, 400);
    }

    // Déterminer le coût selon le type d'action
    const actionType = body.action_type || 'ai_chat';
    const cost = TOOL_COSTS[actionType] || 1;

    // Vérifier les crédits disponibles
    if (user.credits.available < cost) {
      return createErrorResponse(
        `Insufficient credits. Required: ${cost}, Available: ${user.credits.available}`,
        402
      );
    }

    // Débiter les crédits AVANT l'appel API (sécurité)
    const debitResult = await consumeCredits(
      user.id,
      actionType,
      cost,
      {
        model,
        messages_count: body.messages.length,
        timestamp: new Date().toISOString()
      },
      env
    );

    if (!debitResult.success) {
      return createErrorResponse(debitResult.error || 'Failed to consume credits', 402);
    }

    // Appel API OpenRouter avec retry
    try {
      const openRouterResponse = await retryWithBackoff(async () => {
        const response = await fetchWithTimeout(
          `${OPENROUTER_BASE_URL}/chat/completions`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://aurion.ai',
              'X-Title': 'AURION AI Platform',
            },
            body: JSON.stringify({
              model,
              messages: body.messages,
              temperature: body.options?.temperature ?? 0.7,
              max_tokens: body.options?.max_tokens ?? 2048,
              stream: body.options?.stream ?? false,
            }),
          }
        );

        if (!response.ok) {
          const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
          throw new Error(error.error?.message || `API error: ${response.status}`);
        }

        return response.json();
      }, 3, 1000);

      // Retourner la réponse avec info crédits
      return createSuccessResponse({
        ...openRouterResponse,
        credits: {
          used: cost,
          remaining: user.credits.available - cost
        }
      });

    } catch (apiError: any) {
      // REMBOURSER les crédits en cas d'échec API
      console.error('❌ Erreur API OpenRouter:', apiError.message);
      await refundCredits(user.id, cost, `api_error_${apiError.message.substring(0, 50)}`, env);

      return createErrorResponse(
        `AI API error: ${apiError.message}`,
        apiError.message.includes('rate limit') ? 429 : 502
      );
    }

  } catch (error: any) {
    console.error('❌ Erreur handler AI chat:', error);
    return createErrorResponse(error.message || 'Internal server error', 500);
  }
}

// ============================================
// ENDPOINT EXPORTS
// ============================================

// POST /api/ai-chat
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    // Vérifier l'authentification basique
    const authHeader = context.request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: corsHeaders }
      );
    }

    const token = authHeader.substring(7);
    if (!token || token.length < 10) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: corsHeaders }
      );
    }

    const body = await context.request.json() as {
      model: string;
      messages: Array<{ role: string; content: string }>;
      temperature?: number;
      max_tokens?: number;
    };

    const { model, messages, temperature = 0.7, max_tokens = 1000 } = body;

    // Validation basique
    if (!model || !messages || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid request parameters' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Faire l'appel réel à OpenRouter
    const openRouterPayload = {
      model: model,
      messages: messages,
      temperature: Math.max(0, Math.min(2, 0.7)), // Température par défaut
      max_tokens: Math.min(1000, 4000), // Limiter à 4000 tokens max
      stream: false,
    };

    console.log(`🚀 Calling OpenRouter API for model: ${model}`);

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${context.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://e1d2586d.aurion-saas.pages.dev',
        'X-Title': 'AURION SaaS',
      },
      body: JSON.stringify(openRouterPayload),
      signal: AbortSignal.timeout(30000), // 30 secondes timeout
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenRouter API error:', response.status, errorText);

      return new Response(
        JSON.stringify({
          error: 'AI service temporarily unavailable',
          message: 'Please try again later'
        }),
        { status: 503, headers: corsHeaders }
      );
    }

    const data = await response.json();

    // Vérifier la structure de la réponse
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('❌ Invalid OpenRouter response structure:', data);
      return new Response(
        JSON.stringify({ error: 'Invalid AI response' }),
        { status: 500, headers: corsHeaders }
      );
    }

    const aiResponse = {
      message: data.choices[0].message.content,
      model: data.model || model,
      usage: data.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      credits_used: 10, // Coût fixe pour l'instant
      credits_remaining: 990, // Simulé pour l'instant
    };

    console.log(`✅ AI Chat successful for model: ${model}`);

    return new Response(
      JSON.stringify(aiResponse),
      { status: 200, headers: corsHeaders }
    );

  } catch (error: any) {
    console.error('AI Chat error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error.message
      }),
      { status: 500, headers: corsHeaders }
    );
  }
};

// OPTIONS /api/ai-chat (CORS)
export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
};

// GET /api/ai-chat - Liste des modèles disponibles (public, no auth required)
// Note: This is intentionally public to allow health checks and model discovery
// No sensitive data is exposed - only static model metadata
export const onRequestGet: PagesFunction<Env> = async () => {
  const models = [
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
  ];

  return new Response(JSON.stringify({ models, status: 'healthy' }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
};
