/**
 * App Builder Page
 * 
 * Provides access to the AI-powered application builder.
 * URL managed centrally in src/config/tools.ts
 */

import { IframePage } from "@/components/common";
import { getToolById } from "@/config/tools";
import { SEO } from "@/components/common/SEO";

const tool = getToolById('app-builder');

const AppBuilder = () => (
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
    <IframePage
      title={tool?.name || "App Builder"}
      src={tool?.url || "https://bolt.new"}
      toolId="app-builder"
    />
  </>
);

export default AppBuilder;