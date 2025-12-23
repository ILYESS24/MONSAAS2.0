/* eslint-disable @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps */
import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUserPlan } from "@/hooks/use-plan";
import { iframeBridge, IFRAME_CLIENT_SCRIPT } from "@/services/iframe-bridge";
import { logger } from "@/services/logger";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { TOOL_COSTS, TOOL_LABELS, ToolType } from "@/types/plans";
import { useClerkSafe } from "@/hooks/use-clerk-safe";
import { useToast } from "@/components/ui/use-toast";

// ============================================
// CONFIGURATION DES OUTILS
// ============================================

const TOOL_URLS: Record<string, string> = {
  "app-builder": "https://aurion-app-v2.pages.dev/",
  "website-builder": "https://790d4da4.ai-assistant-xlv.pages.dev",
  "ai-agents": "https://flo-1-2ba8.onrender.com",
  "text-editor": "https://aieditor-do0wmlcpa-ibagencys-projects.vercel.app",
  "code-editor": "https://790d4da4.ai-assistant-xlv.pages.dev",
  "content-generator": "https://790d4da4.ai-assistant-xlv.pages.dev",
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export default function IframeTool() {
  const { toolId } = useParams<{ toolId: string }>();
  const navigate = useNavigate();
  const { getToken } = useClerkSafe();
  const { creditsRemaining: _creditsRemaining, refetch: refetchCredits } = useUserPlan();
  const { toast } = useToast();

  // États
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [, setIsReusedSession] = useState(false);
  const [corsRestricted, setCorsRestricted] = useState(false);
  const [iframeReady, setIframeReady] = useState(false);

  // Refs
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const sessionIdRef = useRef<string>();
  const messageHandlerRef = useRef<((event: MessageEvent) => void) | null>(null);

  // Infos outil
  const tool = toolId ? TOOL_URLS[toolId] : null;
  const cost = toolId ? TOOL_COSTS[toolId as ToolType] || 0 : 0;
  const label = toolId ? TOOL_LABELS[toolId as ToolType] || toolId : 'Unknown Tool';

  // ============================================
  // COMMUNICATION POSTMESSAGE SÉCURISÉE
  // ============================================

  const sendTokenToIframe = useCallback((token: string) => {
    if (!iframeRef.current?.contentWindow) return;

    // Envoyer le token de manière sécurisée via postMessage
    const message = {
      type: 'GENIM_SESSION_TOKEN',
      token,
      toolId,
      origin: window.location.origin,
    };

    // Attendre que l'iframe soit prête
    const sendMessage = () => {
      try {
        iframeRef.current?.contentWindow?.postMessage(message, '*');
        logger.debug('[IframeTool] Token sent via postMessage');
      } catch (err) {
        logger.error('[IframeTool] Failed to send token:', err);
      }
    };

    // Envoyer immédiatement et après un délai pour s'assurer de la réception
    sendMessage();
    setTimeout(sendMessage, 500);
    setTimeout(sendMessage, 1500);
  }, [toolId]);

  // ============================================
  // VALIDATION ET CHARGEMENT
  // ============================================

  useEffect(() => {
    if (!toolId || !tool) {
      setError("Tool not found");
      setIsLoading(false);
      return;
    }

    const validateAndLoadTool = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Obtenir le token JWT de Clerk
        const token = await getToken();
        if (!token) {
          throw new Error("Authentication required");
        }

        // Appeler l'endpoint sécurisé
        const response = await fetch('/api/validate-tool-access', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include', // Important pour les cookies
          body: JSON.stringify({ 
            toolId,
            reuseSession: true, // Permettre la réutilisation de session
          }),
        });

        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch (parseError) {
            // Si la réponse n'est pas du JSON valide (par exemple du HTML d'erreur)
            errorData = {
              error: `Service unavailable (HTTP ${response.status})`,
              message: 'The tool service is temporarily unavailable. Please try again later.'
            };
          }
          handleErrorResponse(response.status, errorData);
          return;
        }

        let data;
        try {
          data = await response.json();
        } catch (parseError) {
          logger.error('[IframeTool] Failed to parse API response as JSON', parseError);
          setError('Service communication error. Please try again.');
          return;
        }

        // Succès - configurer l'iframe
        logger.debug(`[IframeTool] Access validated for ${toolId}`);
        
        setSessionToken(data.sessionToken);
        setIsReusedSession(data.isReusedSession || false);
        sessionIdRef.current = data.sessionId;

        // Notification si session réutilisée
        if (data.isReusedSession) {
          toast({
            title: "Session restored",
            description: "Your previous session has been restored.",
          });
        } else {
          toast({
            title: "Credits consumed",
            description: `${data.creditsConsumed} credits used for this tool.`,
          });
        }

        // Rafraîchir les crédits
        refetchCredits();

        // Initialiser l'iframe bridge
        iframeBridge.init();

        // Définir l'URL de l'iframe (sans token dans l'URL)
        setIframeUrl(data.iframeUrl);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to access the tool";
        logger.error('[IframeTool] Validation error:', err);
        setError(errorMessage);
        setIsLoading(false);
      }
    };

    validateAndLoadTool();

    // Cleanup
    return () => {
      if (sessionIdRef.current) {
        iframeBridge.unregisterIframe(sessionIdRef.current);
      }
      if (messageHandlerRef.current) {
        window.removeEventListener('message', messageHandlerRef.current);
      }
    };
  }, [toolId, tool, getToken, refetchCredits, toast]);

  // ============================================
  // GESTION ERREURS
  // ============================================

  const handleErrorResponse = (status: number, errorData: { required?: number; reason?: string; message?: string; error?: string; suggestedPlan?: string }) => {
    setIsLoading(false);

    switch (status) {
      case 402:
        setError(`Insufficient credits. ${errorData.required || cost} credits required.`);
        toast({
          title: "Insufficient credits",
          description: "Please recharge your credits to continue.",
          variant: "destructive",
        });
        break;

      case 403:
        if (errorData.reason === 'plan_upgrade_required') {
          setError("This tool requires a higher plan.");
          toast({
            title: "Plan upgrade required",
            description: `Upgrade to ${errorData.suggestedPlan} to access this tool.`,
            variant: "destructive",
          });
        } else if (errorData.reason === 'subscription_required') {
          setError("Subscription required for this tool.");
        } else if (errorData.reason === 'security_violation') {
          setError("Security error. Please reload the page.");
        } else {
          setError(errorData.error || "Access denied");
        }
        break;

      case 429:
        setError(`Rate limit reached: ${errorData.error}`);
        toast({
          title: "Rate limit",
          description: "Please wait before trying again.",
          variant: "destructive",
        });
        break;

      case 500:
        setError("Server error. Please try again later.");
        toast({
          title: "Server error",
          description: "The service is temporarily unavailable. Please try again later.",
          variant: "destructive",
        });
        break;

      case 503:
        setError("Service temporarily unavailable - configuration issue.");
        toast({
          title: "Service unavailable",
          description: "The tool is being configured. Please try again in a few minutes.",
          variant: "destructive",
        });
        break;

      default:
        setError(errorData.error || "Validation error");
    }
  };

  // ============================================
  // GESTION CHARGEMENT IFRAME
  // ============================================

  const handleIframeLoad = useCallback(() => {
    if (!iframeRef.current || !sessionToken || !toolId) return;

    try {
      // Enregistrer l'iframe dans le bridge
      const iframeId = sessionIdRef.current || `iframe_${toolId}_${Date.now()}`;
      iframeBridge.registerIframe(iframeId, toolId as ToolType, tool!, iframeRef.current);

      // Envoyer le token de session via postMessage (plus sécurisé que query string)
      sendTokenToIframe(sessionToken);

      // Tenter d'injecter le script client (peut échouer avec CORS)
      try {
        if (iframeRef.current.contentDocument) {
          const script = iframeRef.current.contentDocument.createElement('script');
          script.textContent = IFRAME_CLIENT_SCRIPT;
          iframeRef.current.contentDocument.head.appendChild(script);
          logger.debug(`[IframeTool] SDK injected for: ${toolId}`);
        }
      } catch (err) {
        logger.warn('[IframeTool] CORS restriction - using postMessage fallback');
        setCorsRestricted(true);
      }

      // Notifier que l'iframe est prête
      setTimeout(() => {
        iframeBridge.notifyIframeReady(iframeId);
      }, 1000);

    } catch (err) {
      logger.error('[IframeTool] Load handler error:', err);
      setCorsRestricted(true);
    }

    setIsLoading(false);
  }, [sessionToken, toolId, tool, sendTokenToIframe]);

  // ============================================
  // ÉCOUTE DES MESSAGES IFRAME
  // ============================================

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Vérifier que le message vient de notre iframe
      if (event.source !== iframeRef.current?.contentWindow) return;

      const { type, data } = event.data || {};

      switch (type) {
        case 'GENIM_IFRAME_READY':
          setIframeReady(true);
          logger.debug('[IframeTool] Iframe ready signal received');
          // Renvoyer le token au cas où le premier message a été manqué
          if (sessionToken) {
            sendTokenToIframe(sessionToken);
          }
          break;

        case 'GENIM_REQUEST_TOKEN':
          // L'iframe demande le token
          if (sessionToken) {
            sendTokenToIframe(sessionToken);
          }
          break;

        case 'GENIM_ACTION_COMPLETED':
          // L'iframe notifie qu'une action a été effectuée
          logger.debug('[IframeTool] Action completed:', data);
          refetchCredits();
          break;

        case 'GENIM_ERROR':
          logger.error('[IframeTool] Iframe error:', data);
          toast({
            title: "Tool error",
            description: data?.message || "An error occurred in the tool.",
            variant: "destructive",
          });
          break;
      }
    };

    messageHandlerRef.current = handleMessage;
    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [sessionToken, sendTokenToIframe, refetchCredits, toast]);

  // ============================================
  // ACTIONS UTILISATEUR
  // ============================================

  const handleRetry = async () => {
    setError(null);
    setIsLoading(true);
    setIframeUrl(null);
    setSessionToken(null);
    
    // Re-trigger validation
    window.location.reload();
  };

  // ============================================
  // RENDU
  // ============================================

  // Outil non trouvé
  if (!tool) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="max-w-md w-full p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Tool not found</h3>
          <p className="text-gray-600 mb-6">
            The requested tool does not exist or is no longer available.
          </p>
          <Button onClick={() => navigate('/dashboard')} className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Iframe plein écran */}
      {iframeUrl && (
        <iframe
          ref={iframeRef}
          src={iframeUrl}
          className="w-full h-screen border-0"
          title={label}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
          allow="fullscreen"
          onLoad={handleIframeLoad}
          onError={() => {
            setError("Failed to load the tool");
            setIsLoading(false);
          }}
        />
      )}

      {/* Overlay de chargement */}
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Loading {label}...</p>
          </div>
        </div>
      )}

      {/* Overlay d'erreur */}
      {error && (
        <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
          <div className="max-w-md w-full p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-700 mb-4">{error}</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={handleRetry} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
              <Button onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Avertissement CORS (dev uniquement) */}
      {corsRestricted && !iframeReady && process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 z-40">
          <Alert className="border-yellow-200 bg-yellow-50 shadow-lg max-w-sm">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800 text-sm">
              <p className="font-medium mb-1">CORS restrictions detected</p>
              <p className="text-xs">Some features may be limited. The tool is functional but cannot receive real-time updates.</p>
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}
