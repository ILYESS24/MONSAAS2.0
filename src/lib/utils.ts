import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Fonction utilitaire pour gérer les réponses fetch de manière sécurisée
export async function safeJsonResponse(response: Response): Promise<any> {
  const contentType = response.headers.get('content-type');

  if (!contentType || !contentType.includes('application/json')) {
    throw new Error(`Server returned ${contentType || 'unknown'} instead of JSON`);
  }

  return response.json();
}

// Fonction utilitaire pour faire des appels fetch avec gestion d'erreur sécurisée
export async function safeFetch(url: string, options?: RequestInit): Promise<Response> {
  try {
    const response = await fetch(url, options);

    // Si la réponse n'est pas OK et n'est pas du JSON, logger l'erreur
    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn(`API ${url} returned non-JSON response: ${contentType}`);
      }
    }

    return response;
  } catch (error) {
    console.error(`Fetch error for ${url}:`, error);
    throw error;
  }
}
