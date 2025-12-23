 
import { withAuth, withMonitoring } from '../middleware/auth';

interface Env {
  FREEPIK_API_KEY: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

async function handleGenerateImage(user: import('../middleware/auth').AuthenticatedUser, request: Request, env: Env) {
  try {
    const body = await request.json();

    // Vérifier que l'utilisateur a assez de crédits pour une génération d'image
    if (user.credits.available < 10) { // Coût estimé pour génération d'image
      return new Response(
        JSON.stringify({ error: 'Insufficient credits for image generation' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // API Key - Configuration sécurisée obligatoire
    const apiKey = env.FREEPIK_API_KEY;

    if (!apiKey) {
      throw new Error('❌ FREEPIK_API_KEY manquante dans les variables d\'environnement Cloudflare');
    }

    const response = await fetch("https://api.freepik.com/v1/ai/text-to-image", {
      method: "POST",
      headers: {
        "x-freepik-api-key": apiKey,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: 'External API error' }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export const onRequestPost: PagesFunction<Env> = withMonitoring(async (context) => {
  return withAuth(context.request, context.env, handleGenerateImage, {
    requireCredits: true, // Vérification crédits obligatoire
    rateLimit: true,
    endpoint: 'generate-image' // Rate limiting pour génération d'images
  });
}, 'generate-image');

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
};
