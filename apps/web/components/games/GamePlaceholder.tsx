import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface GamePlaceholderProps {
  title: string;
  description?: string;
  color?: string;
}

const GamePlaceholder: React.FC<GamePlaceholderProps> = ({ 
  title, 
  description = "This classic game is coming soon! Check back later for the full experience.",
  color = "#00ffff"
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const [gameState, setGameState] = useState<'demo' | 'info'>('demo');
  
  // Simple demo animation
  const animate = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear canvas
    ctx.fillStyle = 'rgba(10, 10, 30, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Animated elements
    const time = timestamp * 0.001;
    
    // Draw floating particles
    for (let i = 0; i < 20; i++) {
      const x = (Math.sin(time + i) * 100 + i * 40) % canvas.width;
      const y = (Math.cos(time * 0.5 + i) * 50 + canvas.height / 2);
      const size = Math.sin(time + i) * 3 + 5;
      
      ctx.fillStyle = `${color}${Math.floor((Math.sin(time + i) * 0.5 + 0.5) * 255).toString(16).padStart(2, '0')}`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw title
    ctx.fillStyle = color;
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(title.toUpperCase(), canvas.width / 2, canvas.height / 2 - 50);
    
    // Draw coming soon
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.fillText('COMING SOON', canvas.width / 2, canvas.height / 2);
    
    // Draw pulsing circle
    const pulse = Math.sin(time * 2) * 0.3 + 0.7;
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.globalAlpha = pulse;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2 + 80, 40 * pulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;

    requestRef.current = requestAnimationFrame(animate);
  }, [title, color]);

  useEffect(() => {
    if (gameState === 'demo') {
      requestRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [gameState, animate]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 via-purple-900/20 to-black p-4">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          className="border-2 border-purple-500 rounded-lg shadow-2xl"
          style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #0a0a0a 100%)' }}
        />
        
        {gameState === 'info' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 text-white rounded-lg p-8"
          >
            <h1 className="text-5xl font-bold mb-4" style={{ color }}>
              {title.toUpperCase()}
            </h1>
            <p className="text-xl mb-8 text-center max-w-md">
              {description}
            </p>
            <div className="space-y-4">
              <p className="text-lg">🎮 Full game experience coming soon!</p>
              <p className="text-lg">🚀 Check back for updates</p>
              <p className="text-lg">✨ More features in development</p>
            </div>
            <button
              onClick={() => setGameState('demo')}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-xl font-bold hover:scale-105 transition-transform mt-8"
            >
              Back to Demo
            </button>
          </motion.div>
        )}
      </div>
      
      <button
        onClick={() => setGameState(gameState === 'demo' ? 'info' : 'demo')}
        className="mt-4 px-6 py-2 bg-purple-600/50 hover:bg-purple-600/70 rounded-lg text-white transition-colors"
      >
        {gameState === 'demo' ? 'Game Info' : 'View Demo'}
      </button>
    </div>
  );
};

export default GamePlaceholder;