/**
 * Code Editor Page
 * 
 * Provides access to the AI-powered code editor.
 * URL managed centrally in src/config/tools.ts
 */

import { IframePage } from "@/components/common";
import { getToolById } from "@/config/tools";
import { SEO } from "@/components/common/SEO";

const tool = getToolById('code-editor');

const CodeEditor = () => (
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
    <IframePage
      title={tool?.name || "Code Editor"}
      src={tool?.url || "https://bolt.new"}
      toolId="code-editor"
    />
  </>
);

export default CodeEditor;