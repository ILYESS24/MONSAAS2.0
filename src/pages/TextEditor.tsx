/**
 * Text Editor Page
 * 
 * Provides access to the AI-powered text editor.
 * URL managed centrally in src/config/tools.ts
 * 
 * Features a cursor reveal transition animation where users
 * move their cursor across the screen to reveal the page content.
 */

import { useState } from "react";
import { IframePage, CursorRevealTransition } from "@/components/common";
import { getToolById } from "@/config/tools";
import { SEO } from "@/components/common/SEO";

const tool = getToolById('text-editor');

const TextEditor = () => {
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
        title="Text Editor - Éditeur de Texte IA"
        description="Éditeur de texte avec assistance IA. Rédaction, reformulation, correction orthographique et grammaticale. Markdown, export PDF, collaboration temps réel."
        keywords={[
          'text editor',
          'éditeur texte',
          'rédaction IA',
          'correction automatique',
          'markdown editor',
          'traitement texte',
          'écriture assistée',
          'content writing',
        ]}
        ogType="website"
      />
      {showReveal ? (
        <CursorRevealTransition onRevealComplete={() => setShowReveal(false)}>
          <IframePage
            title={tool?.name || "Text Editor"}
            src={tool?.url || "https://bolt.new"}
            toolId="text-editor"
          />
        </CursorRevealTransition>
      ) : (
        <IframePage
          title={tool?.name || "Text Editor"}
          src={tool?.url || "https://bolt.new"}
          toolId="text-editor"
        />
      )}
    </>
  );
};

export default TextEditor;