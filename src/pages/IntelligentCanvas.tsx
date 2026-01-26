/**
 * Intelligent Canvas Page
 * 
 * Provides access to the AI-powered intelligent canvas.
 * 
 * Features a cursor reveal transition animation where users
 * move their cursor across the screen to reveal the page content.
 */

import { useState } from "react";
import { IframePage, CursorRevealTransition } from "@/components/common";
import { SEO } from "@/components/common/SEO";

const IntelligentCanvas = () => {
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
      {showReveal ? (
        <CursorRevealTransition onRevealComplete={() => setShowReveal(false)}>
          <IframePage
            title="Intelligent Canvas"
            src="https://tersa-main-b5f0ey7pq-launchmateais-projects.vercel.app/canvas/"
            toolId="intelligent-canvas"
          />
        </CursorRevealTransition>
      ) : (
        <IframePage
          title="Intelligent Canvas"
          src="https://tersa-main-b5f0ey7pq-launchmateais-projects.vercel.app/canvas/"
          toolId="intelligent-canvas"
        />
      )}
    </>
  );
};

export default IntelligentCanvas;