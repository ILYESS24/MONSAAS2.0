/**
 * Text Editor Page
 * 
 * Provides access to the AI-powered text editor.
 * URL managed centrally in src/config/tools.ts
 */

import { IframePage } from "@/components/common";
import { getToolById } from "@/config/tools";
import { SEO } from "@/components/common/SEO";

const tool = getToolById('text-editor');

const TextEditor = () => (
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
    <IframePage
      title={tool?.name || "Text Editor"}
      src={tool?.url || "https://bolt.new"}
      toolId="text-editor"
    />
  </>
);

export default TextEditor;