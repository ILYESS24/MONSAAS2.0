/**
 * App Builder Page
 * 
 * Provides access to the AI-powered application builder.
 * URL managed centrally in src/config/tools.ts
 * 
 * Features a cursor reveal transition animation where users
 * move their cursor across the screen to reveal the page content.
 */

import { useState } from "react";
import { IframePage, CursorRevealTransition } from "@/components/common";
import { getToolById } from "@/config/tools";
import { SEO } from "@/components/common/SEO";

const tool = getToolById('app-builder');

const AppBuilder = () => {
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
        title="App Builder - Créateur d'Applications IA"
        description="Créez des applications web complètes sans coder. Drag-and-drop visuel, templates prêts à l'emploi, déploiement automatique. Low-code/No-code alimenté par l'IA."
        keywords={[
          'app builder',
          'créateur applications',
          'no-code',
          'low-code',
          'développement visuel',
          'création app',
          'drag and drop',
          'templates applications',
        ]}
        ogType="website"
      />
      {showReveal ? (
        <CursorRevealTransition onRevealComplete={() => setShowReveal(false)}>
          <IframePage
            title={tool?.name || "App Builder"}
            src={tool?.url || "https://bolt.new"}
            toolId="app-builder"
          />
        </CursorRevealTransition>
      ) : (
        <IframePage
          title={tool?.name || "App Builder"}
          src={tool?.url || "https://bolt.new"}
          toolId="app-builder"
        />
      )}
    </>
  );
};

export default AppBuilder;