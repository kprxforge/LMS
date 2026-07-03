import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';

export function KnowledgeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const nodes: Node[] = [];
    const numNodes = 60; // Subtle density
    const connectionDistance = 200;
    
    // Pre-calculate to avoid runtime garbage collection hiccups
    let mouseX = -1000;
    let mouseY = -1000;
    
    class Node {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      baseOpacity: number;
      pulseRate: number;
      pulsePhase: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        // Very slow movement
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.radius = Math.random() * 2 + 1;
        this.baseOpacity = Math.random() * 0.3 + 0.1;
        this.pulseRate = Math.random() * 0.05 + 0.01;
        this.pulsePhase = Math.random() * Math.PI * 2;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.pulsePhase += this.pulseRate;

        // Wrap around edges
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
      }

      draw(isDark: boolean) {
        if (!ctx) return;
        
        let opacity = this.baseOpacity;
        if (isDark) {
            opacity = this.baseOpacity + Math.sin(this.pulsePhase) * 0.2;
            if (opacity < 0) opacity = 0;
            if (opacity > 1) opacity = 1;
        }

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`;
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + 3, 0, Math.PI * 2);
        ctx.fillStyle = isDark 
          ? `rgba(255, 255, 255, ${opacity * 0.15})`
          : `rgba(255, 107, 107, ${opacity * 0.2})`; // neo-accent glow for light
        ctx.fill();
      }
    }

    for (let i = 0; i < numNodes; i++) {
      nodes.push(new Node());
    }

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    let animationFrameId: number;

    const render = () => {
      const isDark = theme === 'dark';
      
      // Clear with background color instead of transparent
      // We could use gradients for dark mode here 
      if (isDark) {
        const grd = ctx.createLinearGradient(0, 0, 0, height);
        grd.addColorStop(0, "#0B0B0B");
        grd.addColorStop(1, "#18181A"); // Charcoal grey gradient
        ctx.fillStyle = grd;
      } else {
        ctx.fillStyle = '#FFFDF5';
      }
      
      ctx.fillRect(0, 0, width, height);

      nodes.forEach((node) => {
        node.update();
        
        // Parallax effect with mouse
        const dx = mouseX - node.x;
        const dy = mouseY - node.y;
        
        const parallaxX = (dx / width) * 2;
        const parallaxY = (dy / height) * 2;
        
        node.x += parallaxX * 0.1;
        node.y += parallaxY * 0.1;

        node.draw(isDark);
      });

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            let opacity = 1 - (distance / connectionDistance);
            opacity = opacity * 0.15; // Keep it subtle
            
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            if (isDark) {
                // soft white / neon grey
                ctx.strokeStyle = `rgba(200, 200, 210, ${opacity})`;
            } else {
                ctx.strokeStyle = `rgba(0, 0, 0, ${opacity})`;
            }
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 w-full h-full transition-colors duration-500"
    />
  );
}
