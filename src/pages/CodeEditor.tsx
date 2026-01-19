/**
 * Code Editor Page
 * 
 * Provides access to the AI-powered code editor.
 * URL managed centrally in src/config/tools.ts
 * 
 * Features a cursor reveal transition animation where users
 * move their cursor across the screen to reveal the page content.
 */

import { useState } from "react";
import { IframePage, CursorRevealTransition } from "@/components/common";
import { getToolById } from "@/config/tools";
import { SEO } from "@/components/common/SEO";

const tool = getToolById('code-editor');

const CodeEditor = () => {
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
        title="Code Editor - Éditeur de Code IA"
        description="Éditeur de code intelligent avec assistance IA. Autocomplétion, détection d'erreurs en temps réel, refactoring automatique. Supporté : JavaScript, TypeScript, Python, et plus."
        keywords={[
          'code editor',
          'éditeur code',
          'IDE en ligne',
          'programmation IA',
          'autocomplétion code',
          'développement web',
          'JavaScript editor',
          'TypeScript editor',
        ]}
        ogType="website"
      />
      {showReveal ? (
        <CursorRevealTransition onRevealComplete={() => setShowReveal(false)}>
          <IframePage
            title={tool?.name || "Code Editor"}
            src={tool?.url || "https://bolt.new"}
            toolId="code-editor"
          />
        </CursorRevealTransition>
      ) : (
        <IframePage
          title={tool?.name || "Code Editor"}
          src={tool?.url || "https://bolt.new"}
          toolId="code-editor"
        />
      )}
    </>
  );
};

export default CodeEditor;