/**
 * Cursor Reveal Transition with Gooey/Viscous Particle Effect
 * 
 * A spectacular page transition effect where the user must move their cursor
 * across the screen to progressively reveal the page content underneath.
 * Features a viscous/gooey particle animation that follows the cursor.
 */

import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

interface CursorRevealTransitionProps {
  children: React.ReactNode;
  onRevealComplete?: () => void;
}

const CursorRevealTransition = ({ children, onRevealComplete }: CursorRevealTransitionProps) => {
  const [isRevealing, setIsRevealing] = useState(true);
  const [revealProgress, setRevealProgress] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const revealedPixelsRef = useRef<Set<string>>(new Set());
  const animationFrameRef = useRef<number>();
  const particleIdRef = useRef(0);
  const lastMousePos = useRef({ x: 0, y: 0 });
  
  // Mouse position with spring for smooth movement (viscous effect)
  const mouseX = useMotionValue(typeof window !== 'undefined' ? window.innerWidth / 2 : 0);
  const mouseY = useMotionValue(typeof window !== 'undefined' ? window.innerHeight / 2 : 0);
  
  // Gooey spring settings - more viscous/liquid feel
  const smoothX = useSpring(mouseX, { damping: 20, stiffness: 100, mass: 0.3 });
  const smoothY = useSpring(mouseY, { damping: 20, stiffness: 100, mass: 0.3 });
  
  // Additional springs for viscous ring effects - declared at top level
  const viscousX1 = useSpring(mouseX, { damping: 12, stiffness: 60, mass: 0.8 });
  const viscousY1 = useSpring(mouseY, { damping: 12, stiffness: 60, mass: 0.8 });
  const viscousX2 = useSpring(mouseX, { damping: 8, stiffness: 35, mass: 1.2 });
  const viscousY2 = useSpring(mouseY, { damping: 8, stiffness: 35, mass: 1.2 });

  // Reveal radius - larger for smoother experience
  const REVEAL_RADIUS = 180;
  const GRID_SIZE = 12; // Smaller grid for smoother reveal
  
  // Generate trailing particles - more subtle
  const generateParticles = useCallback((x: number, y: number) => {
    const newParticles: Particle[] = [];
    const numParticles = 3 + Math.random() * 3;
    
    for (let i = 0; i < numParticles; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 80 + 30;
      newParticles.push({
        id: particleIdRef.current++,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        size: Math.random() * 50 + 20,
        delay: Math.random() * 0.15,
        duration: 0.8 + Math.random() * 0.4,
      });
    }
    
    setParticles(prev => [...prev.slice(-30), ...newParticles]);
  }, []);

  // Calculate reveal progress
  const calculateProgress = useCallback(() => {
    if (!containerRef.current) return 0;
    const totalCells = Math.ceil(window.innerWidth / GRID_SIZE) * Math.ceil(window.innerHeight / GRID_SIZE);
    return Math.min(100, (revealedPixelsRef.current.size / totalCells) * 100);
  }, []);

  // Draw the mask on canvas with smooth edges
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

    // Cut out revealed areas with smooth edges
    ctx.globalCompositeOperation = 'destination-out';
    
    revealedPixelsRef.current.forEach((key) => {
      const [x, y] = key.split(',').map(Number);
      const centerX = x * GRID_SIZE + GRID_SIZE / 2;
      const centerY = y * GRID_SIZE + GRID_SIZE / 2;
      
      // Create radial gradient for ultra-soft edges
      const gradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, GRID_SIZE * 2.5
      );
      gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
      gradient.addColorStop(0.4, 'rgba(0, 0, 0, 0.9)');
      gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.5)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, GRID_SIZE * 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalCompositeOperation = 'source-over';
  }, []);

  // Handle mouse movement
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isRevealing) return;
    
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);

    // Generate particles based on movement distance
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 30) {
      generateParticles(e.clientX, e.clientY);
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }

    // Mark grid cells as revealed within the reveal radius
    const cellsToReveal = Math.ceil(REVEAL_RADIUS / GRID_SIZE);
    const centerCellX = Math.floor(e.clientX / GRID_SIZE);
    const centerCellY = Math.floor(e.clientY / GRID_SIZE);

    for (let dx = -cellsToReveal; dx <= cellsToReveal; dx++) {
      for (let dy = -cellsToReveal; dy <= cellsToReveal; dy++) {
        const cellX = centerCellX + dx;
        const cellY = centerCellY + dy;
        
        // Check if cell is within circular radius
        const distanceFromCenter = Math.sqrt(dx * dx + dy * dy) * GRID_SIZE;
        if (distanceFromCenter <= REVEAL_RADIUS) {
          const key = `${cellX},${cellY}`;
          revealedPixelsRef.current.add(key);
        }
      }
    }

    // Update progress
    const progress = calculateProgress();
    setRevealProgress(progress);

    // Check if enough is revealed - lower threshold for faster completion
    if (progress >= 60) {
      setIsRevealing(false);
      onRevealComplete?.();
    }

    // Redraw mask
    drawMask();
  }, [isRevealing, mouseX, mouseY, calculateProgress, drawMask, onRevealComplete, generateParticles]);

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

  // Clean up old particles
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => prev.filter(p => Date.now() - p.id < 2000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Skip animation with click
  const handleSkip = () => {
    setIsRevealing(false);
    onRevealComplete?.();
  };

  return (
    <div ref={containerRef} className="relative w-full min-h-screen overflow-hidden">
      {/* SVG Filter for Gooey Effect - optimized for performance */}
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          <filter id="gooey-filter" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8"
              result="gooey"
            />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
          <filter id="gooey-strong" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation="15" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 30 -12"
              result="gooey"
            />
          </filter>
        </defs>
      </svg>

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
            style={{ 
              width: '100vw', 
              height: '100vh',
              filter: 'url(#gooey-strong)'
            }}
          />
          
          {/* Gooey cursor blob container */}
          <div 
            className="fixed inset-0 z-40 pointer-events-none"
            style={{ filter: 'url(#gooey-filter)' }}
          >
            {/* Main cursor blob - larger and more visible */}
            <motion.div
              className="absolute rounded-full"
              style={{
                x: smoothX,
                y: smoothY,
                width: REVEAL_RADIUS * 2.8,
                height: REVEAL_RADIUS * 2.8,
                marginLeft: -REVEAL_RADIUS * 1.4,
                marginTop: -REVEAL_RADIUS * 1.4,
                background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 50%, transparent 70%)',
              }}
            />
            
            {/* Trailing particles with gooey effect */}
            <AnimatePresence>
              {particles.map((particle) => (
                <motion.div
                  key={particle.id}
                  className="absolute rounded-full"
                  initial={{ 
                    x: particle.x - particle.size / 2, 
                    y: particle.y - particle.size / 2,
                    scale: 0,
                    opacity: 0.6
                  }}
                  animate={{ 
                    scale: 1,
                    opacity: 0,
                    y: particle.y - particle.size / 2 + 40
                  }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{
                    duration: particle.duration,
                    delay: particle.delay,
                    ease: "easeOut"
                  }}
                  style={{
                    width: particle.size,
                    height: particle.size,
                    background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
                  }}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Glowing cursor center - more prominent */}
          <motion.div
            className="fixed z-[55] pointer-events-none"
            style={{
              x: smoothX,
              y: smoothY,
              width: 60,
              height: 60,
              marginLeft: -30,
              marginTop: -30,
            }}
          >
            <div 
              className="w-full h-full rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.3) 30%, transparent 60%)',
                boxShadow: '0 0 80px 40px rgba(255,255,255,0.2), 0 0 120px 80px rgba(255,255,255,0.1)',
              }}
            />
          </motion.div>

          {/* Viscous ring that follows slower - more subtle */}
          <motion.div
            className="fixed z-[54] pointer-events-none rounded-full"
            style={{
              x: viscousX1,
              y: viscousY1,
              width: REVEAL_RADIUS * 2.4,
              height: REVEAL_RADIUS * 2.4,
              marginLeft: -REVEAL_RADIUS * 1.2,
              marginTop: -REVEAL_RADIUS * 1.2,
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'radial-gradient(circle, transparent 60%, rgba(255,255,255,0.03) 100%)',
            }}
          />

          {/* Even slower outer ring for viscous feel */}
          <motion.div
            className="fixed z-[53] pointer-events-none rounded-full"
            style={{
              x: viscousX2,
              y: viscousY2,
              width: REVEAL_RADIUS * 3.2,
              height: REVEAL_RADIUS * 3.2,
              marginLeft: -REVEAL_RADIUS * 1.6,
              marginTop: -REVEAL_RADIUS * 1.6,
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          />

          {/* Progress indicator and instructions - floating at bottom */}
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[60] text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-black/40 backdrop-blur-xl px-6 py-4 rounded-2xl border border-white/10"
            >
              <p className="text-white/70 text-sm font-body mb-3">
                Déplacez votre curseur pour révéler
              </p>
              
              {/* Progress bar with gooey effect */}
              <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden mb-2 mx-auto">
                <motion.div
                  className="h-full bg-gradient-to-r from-white/60 to-white rounded-full"
                  style={{ width: `${revealProgress}%` }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                />
              </div>
              
              <p className="text-white/40 text-xs mb-3">
                {Math.round(revealProgress)}%
              </p>
              
              {/* Skip button */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                onClick={handleSkip}
                className="text-white/40 text-xs hover:text-white/70 transition-colors px-4 py-1.5 rounded-full bg-white/5 hover:bg-white/10"
              >
                Passer
              </motion.button>
            </motion.div>
          </div>
        </>
      )}

      {/* Fade out animation when complete - smoother */}
      {!isRevealing && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="fixed inset-0 z-50 bg-black pointer-events-none"
        />
      )}
    </div>
  );
};

export default CursorRevealTransition;
