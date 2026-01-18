/**
 * Intelligent Canvas Page
 * 
 * Provides access to the AI-powered intelligent canvas.
 */

import { IframePage } from "@/components/common";
import { SEO } from "@/components/common/SEO";

const IntelligentCanvas = () => (
  <>
    <SEO
      title="Intelligent Canvas - Tableau Blanc IA"
      description="Tableau blanc intelligent avec IA intégrée. Brainstorming, mind mapping, diagrammes automatiques. Collaboration en temps réel avec votre équipe."
      keywords={[
        'canvas intelligent',
        'tableau blanc IA',
        'brainstorming',
        'mind mapping',
        'diagrammes',
        'collaboration visuelle',
        'whiteboard en ligne',
        'design thinking',
      ]}
      ogType="website"
    />
    <IframePage
      title="Intelligent Canvas"
      src="https://tersa-main-b5f0ey7pq-launchmateais-projects.vercel.app/canvas/"
      toolId="intelligent-canvas"
    />
  </>
);

export default IntelligentCanvas;