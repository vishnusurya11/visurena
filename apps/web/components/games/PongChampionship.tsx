import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import ResponsiveGameWrapper from '../ResponsiveGameWrapper';
import TouchControls from '../TouchControls';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;
const PADDLE_HEIGHT = 80;
const PADDLE_WIDTH = 15;
const BALL_SIZE = 12;
const PADDLE_SPEED = 6;
const INITIAL_BALL_SPEED = 5;

interface Paddle {
  x: number;
  y: number;
  score: number;
}

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
}

const PongChampionship: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameOver'>('menu');
  const [winner, setWinner] = useState<'player' | 'ai' | null>(null);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  
  // Game objects
  const playerRef = useRef<Paddle>({ x: 30, y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2, score: 0 });
  const aiRef = useRef<Paddle>({ x: CANVAS_WIDTH - 45, y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2, score: 0 });
  const ballRef = useRef<Ball>({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, vx: INITIAL_BALL_SPEED, vy: 0, speed: INITIAL_BALL_SPEED });
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const particlesRef = useRef<{x: number, y: number, vx: number, vy: number, color: string, life: number}[]>([]);
  const trailRef = useRef<{x: number, y: number, opacity: number}[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const touchIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Reset ball
  const resetBall = useCallback((towardsPlayer: boolean) => {
    ballRef.current = {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
      vx: (towardsPlayer ? -1 : 1) * INITIAL_BALL_SPEED,
      vy: (Math.random() - 0.5) * 4,
      speed: INITIAL_BALL_SPEED
    };
    
    // Create explosion at center
    for (let i = 0; i < 20; i++) {
      particlesRef.current.push({
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 2,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        color: '#00ffff',
        life: 1
      });
    }
  }, []);

  // Initialize game
  const initGame = useCallback(() => {
    playerRef.current = { x: 30, y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2, score: 0 };
    aiRef.current = { x: CANVAS_WIDTH - 45, y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2, score: 0 };
    resetBall(Math.random() > 0.5);
    particlesRef.current = [];
    trailRef.current = [];
    setWinner(null);
  }, [resetBall]);

  // Initialize mobile check
  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);

  // Handle keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'w', 's', 'Escape'].includes(e.key)) {
        e.preventDefault();
      }
      
      keysRef.current[e.key] = true;
      
      if (e.key === 'Enter' || e.key === ' ') {
        if (gameState === 'menu' || gameState === 'gameOver') {
          setGameState('playing');
          initGame();
        }
      }
      
      if (e.key === 'Escape') {
        if (gameState === 'playing') {
          setGameState('paused');
        } else if (gameState === 'paused') {
          setGameState('playing');
        }
      }
      
      // Difficulty selection in menu
      if (gameState === 'menu') {
        if (e.key === '1') setDifficulty('easy');
        if (e.key === '2') setDifficulty('medium');
        if (e.key === '3') setDifficulty('hard');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, initGame]);

  // Game loop
  const gameLoop = useCallback((timestamp: number) => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 20, 0.2)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Update player paddle
    const player = playerRef.current;
    if (keysRef.current['ArrowUp'] || keysRef.current['w']) {
      player.y = Math.max(0, player.y - PADDLE_SPEED);
    }
    if (keysRef.current['ArrowDown'] || keysRef.current['s']) {
      player.y = Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, player.y + PADDLE_SPEED);
    }

    // Update AI paddle
    const ai = aiRef.current;
    const ball = ballRef.current;
    const aiSpeed = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 5 : 7;
    const aiReaction = difficulty === 'easy' ? 0.02 : difficulty === 'medium' ? 0.05 : 0.1;
    
    if (Math.random() < aiReaction) {
      const targetY = ball.y - PADDLE_HEIGHT / 2;
      if (ai.y < targetY) {
        ai.y = Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, ai.y + aiSpeed);
      } else if (ai.y > targetY) {
        ai.y = Math.max(0, ai.y - aiSpeed);
      }
    }

    // Update ball
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Add trail
    trailRef.current.push({ x: ball.x, y: ball.y, opacity: 0.8 });
    if (trailRef.current.length > 20) {
      trailRef.current.shift();
    }

    // Ball collision with walls
    if (ball.y <= BALL_SIZE / 2 || ball.y >= CANVAS_HEIGHT - BALL_SIZE / 2) {
      ball.vy *= -1;
      
      // Wall hit particles
      for (let i = 0; i < 5; i++) {
        particlesRef.current.push({
          x: ball.x,
          y: ball.y,
          vx: (Math.random() - 0.5) * 5,
          vy: ball.y <= BALL_SIZE / 2 ? Math.random() * 5 : -Math.random() * 5,
          color: '#ffffff',
          life: 1
        });
      }
    }

    // Ball collision with paddles
    // Player paddle
    if (ball.x - BALL_SIZE / 2 <= player.x + PADDLE_WIDTH &&
        ball.x + BALL_SIZE / 2 >= player.x &&
        ball.y >= player.y &&
        ball.y <= player.y + PADDLE_HEIGHT &&
        ball.vx < 0) {
      
      const relativeIntersectY = (player.y + PADDLE_HEIGHT / 2) - ball.y;
      const normalizedRelativeIntersectionY = relativeIntersectY / (PADDLE_HEIGHT / 2);
      const bounceAngle = normalizedRelativeIntersectionY * Math.PI / 4;
      
      ball.speed = Math.min(ball.speed * 1.05, 15);
      ball.vx = ball.speed * Math.cos(bounceAngle);
      ball.vy = ball.speed * -Math.sin(bounceAngle);
      
      // Paddle hit effect
      for (let i = 0; i < 10; i++) {
        particlesRef.current.push({
          x: player.x + PADDLE_WIDTH,
          y: ball.y,
          vx: Math.random() * 5,
          vy: (Math.random() - 0.5) * 10,
          color: '#00ff00',
          life: 1
        });
      }
    }

    // AI paddle
    if (ball.x + BALL_SIZE / 2 >= ai.x &&
        ball.x - BALL_SIZE / 2 <= ai.x + PADDLE_WIDTH &&
        ball.y >= ai.y &&
        ball.y <= ai.y + PADDLE_HEIGHT &&
        ball.vx > 0) {
      
      const relativeIntersectY = (ai.y + PADDLE_HEIGHT / 2) - ball.y;
      const normalizedRelativeIntersectionY = relativeIntersectY / (PADDLE_HEIGHT / 2);
      const bounceAngle = normalizedRelativeIntersectionY * Math.PI / 4;
      
      ball.speed = Math.min(ball.speed * 1.05, 15);
      ball.vx = -ball.speed * Math.cos(bounceAngle);
      ball.vy = ball.speed * -Math.sin(bounceAngle);
      
      // Paddle hit effect
      for (let i = 0; i < 10; i++) {
        particlesRef.current.push({
          x: ai.x,
          y: ball.y,
          vx: -Math.random() * 5,
          vy: (Math.random() - 0.5) * 10,
          color: '#ff00ff',
          life: 1
        });
      }
    }

    // Score
    if (ball.x < 0) {
      ai.score++;
      if (ai.score >= 11) {
        setWinner('ai');
        setGameState('gameOver');
      } else {
        resetBall(false);
      }
    } else if (ball.x > CANVAS_WIDTH) {
      player.score++;
      if (player.score >= 11) {
        setWinner('player');
        setGameState('gameOver');
      } else {
        resetBall(true);
      }
    }

    // Draw center line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, 0);
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw trail
    trailRef.current.forEach((trail, i) => {
      trail.opacity -= 0.04;
      if (trail.opacity > 0) {
        ctx.fillStyle = `rgba(0, 255, 255, ${trail.opacity * 0.5})`;
        ctx.beginPath();
        ctx.arc(trail.x, trail.y, BALL_SIZE / 2 * (i / trailRef.current.length), 0, Math.PI * 2);
        ctx.fill();
      }
    });
    trailRef.current = trailRef.current.filter(t => t.opacity > 0);

    // Draw paddles
    // Player paddle
    const playerGradient = ctx.createLinearGradient(player.x, player.y, player.x + PADDLE_WIDTH, player.y + PADDLE_HEIGHT);
    playerGradient.addColorStop(0, '#00ff00');
    playerGradient.addColorStop(1, '#00aa00');
    ctx.fillStyle = playerGradient;
    ctx.fillRect(player.x, player.y, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#00ff00';
    ctx.fillRect(player.x, player.y, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.shadowBlur = 0;

    // AI paddle
    const aiGradient = ctx.createLinearGradient(ai.x, ai.y, ai.x + PADDLE_WIDTH, ai.y + PADDLE_HEIGHT);
    aiGradient.addColorStop(0, '#ff00ff');
    aiGradient.addColorStop(1, '#aa00aa');
    ctx.fillStyle = aiGradient;
    ctx.fillRect(ai.x, ai.y, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#ff00ff';
    ctx.fillRect(ai.x, ai.y, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.shadowBlur = 0;

    // Draw ball
    const ballGradient = ctx.createRadialGradient(ball.x, ball.y, 0, ball.x, ball.y, BALL_SIZE);
    ballGradient.addColorStop(0, '#ffffff');
    ballGradient.addColorStop(0.5, '#00ffff');
    ballGradient.addColorStop(1, '#0088ff');
    ctx.fillStyle = ballGradient;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#00ffff';
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw particles
    particlesRef.current = particlesRef.current.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.98;
      p.vy *= 0.98;
      p.life -= 0.02;
      
      if (p.life > 0) {
        ctx.fillStyle = p.color + Math.floor(p.life * 255).toString(16).padStart(2, '0');
        ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
        return true;
      }
      return false;
    });

    // Draw scores
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(player.score.toString(), CANVAS_WIDTH / 4, 60);
    ctx.fillText(ai.score.toString(), (CANVAS_WIDTH * 3) / 4, 60);

    // Draw difficulty
    ctx.font = '14px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillText(`Difficulty: ${difficulty.toUpperCase()}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 10);

    requestRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, difficulty, resetBall]);

  // Start/stop game loop
  useEffect(() => {
    if (gameState === 'playing') {
      requestRef.current = requestAnimationFrame(gameLoop);
    } else if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [gameState, gameLoop]);

  // Touch control handlers
  const handleTouchMove = useCallback((direction: 'up' | 'down') => {
    if (gameState !== 'playing' || !playerRef.current) return;
    const paddle = playerRef.current;
    if (direction === 'up') {
      paddle.y = Math.max(0, paddle.y - PADDLE_SPEED * 2);
    } else {
      paddle.y = Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, paddle.y + PADDLE_SPEED * 2);
    }
  }, [gameState]);

  // Clear interval on unmount
  useEffect(() => {
    return () => {
      if (touchIntervalRef.current) {
        clearInterval(touchIntervalRef.current);
      }
    };
  }, []);

  return (
    <ResponsiveGameWrapper baseWidth={CANVAS_WIDTH} baseHeight={CANVAS_HEIGHT} gameName="Pong Championship">
      <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-blue-900 via-purple-900 to-black">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-2 border-cyan-500 rounded-lg shadow-2xl touch-none"
          style={{ 
            imageRendering: 'crisp-edges',
            background: 'linear-gradient(90deg, rgba(0,20,40,1) 0%, rgba(10,10,30,1) 50%, rgba(0,20,40,1) 100%)'
          }}
        />

        {/* Game Overlays */}
        {gameState === 'menu' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white rounded-lg"
          >
            <h1 className="text-6xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
              PONG CHAMPIONSHIP
            </h1>
            <p className="text-xl mb-8">First to 11 points wins!</p>
            <div className="space-y-2 text-center mb-4">
              <p>↑/W: Move Up • ↓/S: Move Down</p>
              <p className="mt-4">Select Difficulty:</p>
              <div className="flex gap-4 justify-center mt-2">
                <button
                  onClick={() => setDifficulty('easy')}
                  className={`px-4 py-2 rounded ${difficulty === 'easy' ? 'bg-green-600' : 'bg-gray-700'}`}
                >
                  1: Easy
                </button>
                <button
                  onClick={() => setDifficulty('medium')}
                  className={`px-4 py-2 rounded ${difficulty === 'medium' ? 'bg-yellow-600' : 'bg-gray-700'}`}
                >
                  2: Medium
                </button>
                <button
                  onClick={() => setDifficulty('hard')}
                  className={`px-4 py-2 rounded ${difficulty === 'hard' ? 'bg-red-600' : 'bg-gray-700'}`}
                >
                  3: Hard
                </button>
              </div>
            </div>
            <button
              onClick={() => {
                setGameState('playing');
                initGame();
              }}
              className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-lg text-xl font-bold hover:scale-105 transition-transform mt-4"
            >
              START GAME
            </button>
          </motion.div>
        )}

        {gameState === 'paused' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white rounded-lg"
          >
            <h2 className="text-4xl font-bold mb-8">PAUSED</h2>
            <p className="text-xl">Press ESC to continue</p>
          </motion.div>
        )}

        {gameState === 'gameOver' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white rounded-lg"
          >
            <h2 className="text-5xl font-bold mb-4">
              {winner === 'player' ? (
                <span className="text-green-500">YOU WIN!</span>
              ) : (
                <span className="text-red-500">AI WINS!</span>
              )}
            </h2>
            <p className="text-2xl mb-4">
              Final Score: {playerRef.current.score} - {aiRef.current.score}
            </p>
            <button
              onClick={() => {
                setGameState('playing');
                initGame();
              }}
              className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-lg text-xl font-bold hover:scale-105 transition-transform mt-4"
            >
              PLAY AGAIN
            </button>
          </motion.div>
        )}
      </div>
      
      {/* Touch Controls */}
      {isMobile && gameState === 'playing' && (
        <TouchControls
          variant="pong"
          onUp={() => {
            if (touchIntervalRef.current) clearInterval(touchIntervalRef.current);
            handleTouchMove('up');
            touchIntervalRef.current = setInterval(() => handleTouchMove('up'), 50);
          }}
          onDown={() => {
            if (touchIntervalRef.current) clearInterval(touchIntervalRef.current);
            handleTouchMove('down');
            touchIntervalRef.current = setInterval(() => handleTouchMove('down'), 50);
          }}
          onRelease={() => {
            if (touchIntervalRef.current) {
              clearInterval(touchIntervalRef.current);
              touchIntervalRef.current = null;
            }
          }}
          onPause={() => {
            if (gameState === 'playing') setGameState('paused');
            else if (gameState === 'paused') setGameState('playing');
          }}
          showLeft={false}
          showRight={false}
          showAction={false}
        />
      )}
    </div>
    </ResponsiveGameWrapper>
  );
};

export default PongChampionship;