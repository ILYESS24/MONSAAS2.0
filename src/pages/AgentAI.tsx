/**
 * Agent AI Page
 * 
 * Provides access to the AI agent assistant.
 * URL managed centrally in src/config/tools.ts
 * 
 * Features a cursor reveal transition animation where users
 * move their cursor across the screen to reveal the page content.
 */

import { useState, useEffect } from "react";
import { IframePage, CursorRevealTransition } from "@/components/common";
import { getToolById } from "@/config/tools";
import { SEO } from "@/components/common/SEO";

const tool = getToolById('agent-ai');

const AgentAI = () => {
  // Only show cursor reveal if user clicked from landing page (flag set in sessionStorage)
  const [showReveal, setShowReveal] = useState(() => {
    const shouldShow = sessionStorage.getItem('showCursorReveal') === 'true';
    if (shouldShow) {
      sessionStorage.removeItem('showCursorReveal'); // Clear flag after reading
    }
    return shouldShow;
  });
  
  return (
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
      {showReveal ? (
        <CursorRevealTransition onRevealComplete={() => setShowReveal(false)}>
          <IframePage
            title={tool?.name || "Agent AI"}
            src={tool?.url || "https://bolt.new"}
            toolId="agent-ai"
          />
        </CursorRevealTransition>
      ) : (
        <IframePage
          title={tool?.name || "Agent AI"}
          src={tool?.url || "https://bolt.new"}
          toolId="agent-ai"
        />
      )}
    </>
  );
};

export default AgentAI;