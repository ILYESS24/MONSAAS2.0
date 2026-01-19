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
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  // Gooey spring settings - more viscous/liquid feel
  const smoothX = useSpring(mouseX, { damping: 15, stiffness: 80, mass: 0.5 });
  const smoothY = useSpring(mouseY, { damping: 15, stiffness: 80, mass: 0.5 });

  // Reveal radius
  const REVEAL_RADIUS = 150;
  const GRID_SIZE = 15; // Smaller grid for smoother reveal
  
  // Generate trailing particles
  const generateParticles = useCallback((x: number, y: number) => {
    const newParticles: Particle[] = [];
    const numParticles = 5 + Math.random() * 5;
    
    for (let i = 0; i < numParticles; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 60 + 20;
      newParticles.push({
        id: particleIdRef.current++,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        size: Math.random() * 40 + 15,
        delay: Math.random() * 0.2,
        duration: 0.6 + Math.random() * 0.4,
      });
    }
    
    setParticles(prev => [...prev.slice(-50), ...newParticles]);
  }, []);

  // Calculate reveal progress
  const calculateProgress = useCallback(() => {
    if (!containerRef.current) return 0;
    const totalCells = Math.ceil(window.innerWidth / GRID_SIZE) * Math.ceil(window.innerHeight / GRID_SIZE);
    return Math.min(100, (revealedPixelsRef.current.size / totalCells) * 100);
  }, []);

  // Draw the mask on canvas with gooey effect
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

    // Cut out revealed areas with gooey effect
    ctx.globalCompositeOperation = 'destination-out';
    
    revealedPixelsRef.current.forEach((key) => {
      const [x, y] = key.split(',').map(Number);
      const centerX = x * GRID_SIZE + GRID_SIZE / 2;
      const centerY = y * GRID_SIZE + GRID_SIZE / 2;
      
      // Create radial gradient for soft, gooey edges
      const gradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, GRID_SIZE * 2
      );
      gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
      gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.8)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, GRID_SIZE * 2, 0, Math.PI * 2);
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
    
    if (distance > 20) {
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

    // Check if enough is revealed
    if (progress >= 70) {
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
      {/* SVG Filter for Gooey Effect */}
      <svg className="absolute w-0 h-0">
        <defs>
          <filter id="gooey-filter">
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 25 -10"
              result="gooey"
            />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
          <filter id="gooey-strong">
            <feGaussianBlur in="SourceGraphic" stdDeviation="20" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 35 -15"
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
            {/* Main cursor blob */}
            <motion.div
              className="absolute rounded-full bg-white/10"
              style={{
                x: smoothX,
                y: smoothY,
                width: REVEAL_RADIUS * 2.5,
                height: REVEAL_RADIUS * 2.5,
                marginLeft: -REVEAL_RADIUS * 1.25,
                marginTop: -REVEAL_RADIUS * 1.25,
              }}
            />
            
            {/* Trailing particles with gooey effect */}
            <AnimatePresence>
              {particles.map((particle) => (
                <motion.div
                  key={particle.id}
                  className="absolute rounded-full bg-white/10"
                  initial={{ 
                    x: particle.x - particle.size / 2, 
                    y: particle.y - particle.size / 2,
                    scale: 0,
                    opacity: 0.8
                  }}
                  animate={{ 
                    scale: 1,
                    opacity: 0,
                    y: particle.y - particle.size / 2 + 50
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
                  }}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Glowing cursor center */}
          <motion.div
            className="fixed z-[55] pointer-events-none"
            style={{
              x: smoothX,
              y: smoothY,
              width: 40,
              height: 40,
              marginLeft: -20,
              marginTop: -20,
            }}
          >
            <div 
              className="w-full h-full rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.2) 40%, transparent 70%)',
                boxShadow: '0 0 60px 30px rgba(255,255,255,0.15), 0 0 100px 60px rgba(255,255,255,0.1)',
              }}
            />
          </motion.div>

          {/* Viscous ring that follows slower */}
          <motion.div
            className="fixed z-[54] pointer-events-none border border-white/20 rounded-full"
            style={{
              x: useSpring(mouseX, { damping: 10, stiffness: 50, mass: 1 }),
              y: useSpring(mouseY, { damping: 10, stiffness: 50, mass: 1 }),
              width: REVEAL_RADIUS * 2.2,
              height: REVEAL_RADIUS * 2.2,
              marginLeft: -REVEAL_RADIUS * 1.1,
              marginTop: -REVEAL_RADIUS * 1.1,
            }}
          />

          {/* Even slower outer ring for viscous feel */}
          <motion.div
            className="fixed z-[53] pointer-events-none border border-white/10 rounded-full"
            style={{
              x: useSpring(mouseX, { damping: 8, stiffness: 30, mass: 1.5 }),
              y: useSpring(mouseY, { damping: 8, stiffness: 30, mass: 1.5 }),
              width: REVEAL_RADIUS * 3,
              height: REVEAL_RADIUS * 3,
              marginLeft: -REVEAL_RADIUS * 1.5,
              marginTop: -REVEAL_RADIUS * 1.5,
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
            
            {/* Gooey progress bar */}
            <div 
              className="w-56 h-2 bg-white/10 rounded-full overflow-hidden mb-3"
              style={{ filter: 'url(#gooey-filter)' }}
            >
              <motion.div
                className="h-full bg-white rounded-full"
                style={{ width: `${revealProgress}%` }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              />
            </div>
            
            <p className="text-white/40 text-xs mb-2">
              {Math.round(revealProgress)}% révélé
            </p>
            
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
        </>
      )}

      {/* Fade out animation when complete */}
      {!isRevealing && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-50 bg-black pointer-events-none"
        />
      )}
    </div>
  );
};

export default CursorRevealTransition;
