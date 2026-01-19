/**
 * Cursor Reveal Transition
 * 
 * A spectacular page transition effect where the user must move their cursor
 * across the screen to progressively reveal the page content underneath.
 * The cursor acts as a "flashlight" or "spotlight" that erases a black mask.
 */

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";

interface CursorRevealTransitionProps {
  children: React.ReactNode;
  onRevealComplete?: () => void;
}

const CursorRevealTransition = ({ children, onRevealComplete }: CursorRevealTransitionProps) => {
  const [isRevealing, setIsRevealing] = useState(true);
  const [revealProgress, setRevealProgress] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const revealedPixelsRef = useRef<Set<string>>(new Set());
  const animationFrameRef = useRef<number>();
  
  // Mouse position with spring for smooth movement
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { damping: 25, stiffness: 200 });
  const smoothY = useSpring(mouseY, { damping: 25, stiffness: 200 });

  // Reveal radius
  const REVEAL_RADIUS = 120;
  const GRID_SIZE = 20; // Grid cell size for tracking revealed areas
  
  // Calculate reveal progress
  const calculateProgress = useCallback(() => {
    if (!containerRef.current) return 0;
    const totalCells = Math.ceil(window.innerWidth / GRID_SIZE) * Math.ceil(window.innerHeight / GRID_SIZE);
    return Math.min(100, (revealedPixelsRef.current.size / totalCells) * 100);
  }, []);

  // Draw the mask on canvas
  const drawMask = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Fill with black
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Cut out revealed areas
    ctx.globalCompositeOperation = 'destination-out';
    
    revealedPixelsRef.current.forEach((key) => {
      const [x, y] = key.split(',').map(Number);
      const centerX = x * GRID_SIZE + GRID_SIZE / 2;
      const centerY = y * GRID_SIZE + GRID_SIZE / 2;
      
      // Create radial gradient for soft edges
      const gradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, GRID_SIZE * 1.5
      );
      gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, GRID_SIZE * 1.5, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalCompositeOperation = 'source-over';
  }, []);

  // Handle mouse movement
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isRevealing) return;
    
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);

    // Mark grid cells as revealed within the reveal radius
    const cellsToReveal = Math.ceil(REVEAL_RADIUS / GRID_SIZE);
    const centerCellX = Math.floor(e.clientX / GRID_SIZE);
    const centerCellY = Math.floor(e.clientY / GRID_SIZE);

    for (let dx = -cellsToReveal; dx <= cellsToReveal; dx++) {
      for (let dy = -cellsToReveal; dy <= cellsToReveal; dy++) {
        const cellX = centerCellX + dx;
        const cellY = centerCellY + dy;
        
        // Check if cell is within circular radius
        const distance = Math.sqrt(dx * dx + dy * dy) * GRID_SIZE;
        if (distance <= REVEAL_RADIUS) {
          const key = `${cellX},${cellY}`;
          revealedPixelsRef.current.add(key);
        }
      }
    }

    // Update progress
    const progress = calculateProgress();
    setRevealProgress(progress);

    // Check if enough is revealed
    if (progress >= 75) {
      setIsRevealing(false);
      onRevealComplete?.();
    }

    // Redraw mask
    drawMask();
  }, [isRevealing, mouseX, mouseY, calculateProgress, drawMask, onRevealComplete]);

  // Animation loop for smooth rendering
  useEffect(() => {
    const animate = () => {
      if (isRevealing) {
        drawMask();
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRevealing, drawMask]);

  // Event listeners
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    
    // Initial draw
    drawMask();
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleMouseMove, drawMask]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      drawMask();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawMask]);

  // Skip animation with click
  const handleSkip = () => {
    setIsRevealing(false);
    onRevealComplete?.();
  };

  return (
    <div ref={containerRef} className="relative w-full min-h-screen overflow-hidden">
      {/* Actual page content */}
      <div className="relative z-0">
        {children}
      </div>

      {/* Black mask canvas overlay */}
      {isRevealing && (
        <>
          <canvas
            ref={canvasRef}
            className="fixed inset-0 z-50 pointer-events-none"
            style={{ width: '100vw', height: '100vh' }}
          />
          
          {/* Cursor spotlight effect */}
          <motion.div
            className="fixed z-40 pointer-events-none"
            style={{
              x: smoothX,
              y: smoothY,
              width: REVEAL_RADIUS * 2,
              height: REVEAL_RADIUS * 2,
              marginLeft: -REVEAL_RADIUS,
              marginTop: -REVEAL_RADIUS,
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
              borderRadius: '50%',
            }}
          />

          {/* Progress indicator and instructions */}
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[60] text-center">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-white/60 text-sm font-body mb-3"
            >
              Déplacez votre curseur pour révéler la page
            </motion.p>
            
            {/* Progress bar */}
            <div className="w-48 h-1 bg-white/20 rounded-full overflow-hidden mb-3">
              <motion.div
                className="h-full bg-white rounded-full"
                style={{ width: `${revealProgress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
            
            {/* Skip button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              onClick={handleSkip}
              className="text-white/40 text-xs hover:text-white/70 transition-colors underline"
            >
              Passer l'animation
            </motion.button>
          </div>

          {/* Cursor ring */}
          <motion.div
            className="fixed z-[55] pointer-events-none border-2 border-white/30 rounded-full"
            style={{
              x: smoothX,
              y: smoothY,
              width: REVEAL_RADIUS * 2,
              height: REVEAL_RADIUS * 2,
              marginLeft: -REVEAL_RADIUS,
              marginTop: -REVEAL_RADIUS,
            }}
          />
        </>
      )}

      {/* Fade out animation when complete */}
      {!isRevealing && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 bg-black pointer-events-none"
        />
      )}
    </div>
  );
};

export default CursorRevealTransition;
