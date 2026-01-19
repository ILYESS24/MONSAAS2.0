/**
 * Aurion Chat Page
 * 
 * Provides access to the AI-powered chat interface.
 * URL managed centrally in src/config/tools.ts
 */

import { IframePage } from "@/components/common";
import { getToolById } from "@/config/tools";
import { SEO } from "@/components/common/SEO";

const tool = getToolById('aurion-chat');

const AurionChat = () => (
  <>
    <SEO
      title="Aurion Chat - Chat IA Conversationnel"
      description="Chat IA conversationnel pour support client et équipes. Réponses intelligentes, intégration multi-canal, historique complet. Améliorez votre productivité."
      keywords={[
        'chat IA',
        'chatbot',
        'assistant conversationnel',
        'support client IA',
        'messagerie intelligente',
        'chat en direct',
        'conversation IA',
        'service client automatisé',
      ]}
      ogType="website"
    />
    <IframePage
      title={tool?.name || "Aurion Chat"}
      src={tool?.url || "https://bolt.new"}
      toolId="aurion-chat"
    />
  </>
);

export default AurionChat;