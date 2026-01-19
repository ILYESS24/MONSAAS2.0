/**
 * Agent AI Page
 * 
 * Provides access to the AI agent assistant.
 * URL managed centrally in src/config/tools.ts
 */

import { IframePage } from "@/components/common";
import { getToolById } from "@/config/tools";
import { SEO } from "@/components/common/SEO";

const tool = getToolById('agent-ai');

const AgentAI = () => (
  <>
    <SEO
      title="Agent AI - Assistant Intelligence Artificielle"
      description="Agent IA autonome pour automatiser vos tâches. Génération de code, analyse de données, rédaction de contenu. 100 requêtes/mois incluses avec Starter."
      keywords={[
        'agent AI',
        'assistant IA',
        'intelligence artificielle',
        'automatisation IA',
        'ChatGPT alternative',
        'copilot code',
        'génération automatique',
        'IA générative',
      ]}
      ogType="website"
    />
    <IframePage
      title={tool?.name || "Agent AI"}
      src={tool?.url || "https://bolt.new"}
      toolId="agent-ai"
    />
  </>
);

export default AgentAI;