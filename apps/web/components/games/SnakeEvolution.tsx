import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import ResponsiveGameWrapper from '../ResponsiveGameWrapper';
import TouchControls from '../TouchControls';

const GRID_SIZE = 20;
const CELL_SIZE = 25;
const INITIAL_SPEED = 150;

interface Position {
  x: number;
  y: number;
}

interface Food {
  position: Position;
  type: 'normal' | 'super' | 'speed' | 'slow';
  color: string;
  points: number;
}

const SnakeEvolution: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const lastMoveRef = useRef(0);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameOver'>('menu');
  const [highScore, setHighScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [level, setLevel] = useState(1);

  // Game state refs
  const snakeRef = useRef<Position[]>([{ x: 10, y: 10 }]);
  const directionRef = useRef<Position>({ x: 1, y: 0 });
  const nextDirectionRef = useRef<Position>({ x: 1, y: 0 });
  const foodRef = useRef<Food[]>([]);
  const obstaclesRef = useRef<Position[]>([]);
  const particlesRef = useRef<{x: number, y: number, vx: number, vy: number, color: string, life: number}[]>([]);
  const trailRef = useRef<{x: number, y: number, opacity: number}[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  // Initialize game
  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    const saved = localStorage.getItem('snakeEvolutionHighScore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  // Generate food
  const generateFood = useCallback(() => {
    const types: Food['type'][] = ['normal', 'normal', 'normal', 'super', 'speed', 'slow'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    let position: Position;
    do {
      position = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
    } while (
      snakeRef.current.some(s => s.x === position.x && s.y === position.y) ||
      obstaclesRef.current.some(o => o.x === position.x && o.y === position.y)
    );

    const foodConfig = {
      normal: { color: '#00ff00', points: 10 },
      super: { color: '#ffff00', points: 50 },
      speed: { color: '#ff00ff', points: 20 },
      slow: { color: '#00ffff', points: 20 }
    };

    return {
      position,
      type,
      ...foodConfig[type]
    };
  }, []);

  // Generate obstacles
  const generateObstacles = useCallback((level: number) => {
    const obstacles: Position[] = [];
    const count = Math.min(level * 2, 15);
    
    for (let i = 0; i < count; i++) {
      let position: Position;
      do {
        position = {
          x: Math.floor(Math.random() * GRID_SIZE),
          y: Math.floor(Math.random() * GRID_SIZE)
        };
      } while (
        (position.x === 10 && position.y === 10) || // Starting position
        obstacles.some(o => o.x === position.x && o.y === position.y)
      );
      obstacles.push(position);
    }
    
    return obstacles;
  }, []);

  // Initialize game
  const initGame = useCallback(() => {
    snakeRef.current = [{ x: 10, y: 10 }];
    directionRef.current = { x: 1, y: 0 };
    nextDirectionRef.current = { x: 1, y: 0 };
    obstaclesRef.current = generateObstacles(level);
    foodRef.current = [generateFood()];
    particlesRef.current = [];
    trailRef.current = [];
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setLevel(1);
  }, [generateFood, generateObstacles, level]);

  // Create explosion
  const createExplosion = (x: number, y: number, color: string) => {
    for (let i = 0; i < 10; i++) {
      particlesRef.current.push({
        x: x * CELL_SIZE + CELL_SIZE / 2,
        y: y * CELL_SIZE + CELL_SIZE / 2,
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 5,
        color,
        life: 1
      });
    }
  };

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', 'Escape'].includes(e.key)) {
        e.preventDefault();
      }

      if (gameState === 'playing') {
        const current = directionRef.current;
        
        if ((e.key === 'ArrowUp' || e.key === 'w') && current.y === 0) {
          nextDirectionRef.current = { x: 0, y: -1 };
        } else if ((e.key === 'ArrowDown' || e.key === 's') && current.y === 0) {
          nextDirectionRef.current = { x: 0, y: 1 };
        } else if ((e.key === 'ArrowLeft' || e.key === 'a') && current.x === 0) {
          nextDirectionRef.current = { x: -1, y: 0 };
        } else if ((e.key === 'ArrowRight' || e.key === 'd') && current.x === 0) {
          nextDirectionRef.current = { x: 1, y: 0 };
        }
      }

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
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, initGame]);

  // Game loop
  const gameLoop = useCallback((timestamp: number) => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Move snake
    if (timestamp - lastMoveRef.current > speed) {
      directionRef.current = nextDirectionRef.current;
      const head = snakeRef.current[0];
      const newHead = {
        x: head.x + directionRef.current.x,
        y: head.y + directionRef.current.y
      };

      // Check wall collision (wrap around)
      if (newHead.x < 0) newHead.x = GRID_SIZE - 1;
      if (newHead.x >= GRID_SIZE) newHead.x = 0;
      if (newHead.y < 0) newHead.y = GRID_SIZE - 1;
      if (newHead.y >= GRID_SIZE) newHead.y = 0;

      // Check self collision
      if (snakeRef.current.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setGameState('gameOver');
        if (score > highScore) {
          setHighScore(score);
          localStorage.setItem('snakeEvolutionHighScore', score.toString());
        }
        return;
      }

      // Check obstacle collision
      if (obstaclesRef.current.some(obs => obs.x === newHead.x && obs.y === newHead.y)) {
        setGameState('gameOver');
        if (score > highScore) {
          setHighScore(score);
          localStorage.setItem('snakeEvolutionHighScore', score.toString());
        }
        return;
      }

      // Add trail effect
      trailRef.current.push({ x: head.x, y: head.y, opacity: 0.5 });
      if (trailRef.current.length > 20) {
        trailRef.current.shift();
      }

      snakeRef.current.unshift(newHead);

      // Check food collision
      let ate = false;
      foodRef.current = foodRef.current.filter(food => {
        if (food.position.x === newHead.x && food.position.y === newHead.y) {
          ate = true;
          setScore(prev => prev + food.points);
          createExplosion(food.position.x, food.position.y, food.color);

          // Apply food effects
          if (food.type === 'speed') {
            setSpeed(prev => Math.max(50, prev - 20));
          } else if (food.type === 'slow') {
            setSpeed(prev => Math.min(300, prev + 20));
          } else if (food.type === 'super') {
            // Grow snake by 3
            for (let i = 0; i < 2; i++) {
              snakeRef.current.push(snakeRef.current[snakeRef.current.length - 1]);
            }
          }

          return false;
        }
        return true;
      });

      if (ate) {
        foodRef.current.push(generateFood());
        
        // Level up every 100 points
        if (score > 0 && score % 100 === 0) {
          setLevel(prev => {
            const newLevel = prev + 1;
            obstaclesRef.current = generateObstacles(newLevel);
            return newLevel;
          });
        }
      } else {
        snakeRef.current.pop();
      }

      lastMoveRef.current = timestamp;
    }

    // Clear canvas
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, 'rgba(10, 10, 40, 0.95)');
    gradient.addColorStop(1, 'rgba(20, 10, 50, 0.95)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, GRID_SIZE * CELL_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(GRID_SIZE * CELL_SIZE, i * CELL_SIZE);
      ctx.stroke();
    }

    // Draw trail
    trailRef.current.forEach(trail => {
      trail.opacity -= 0.02;
      if (trail.opacity > 0) {
        ctx.fillStyle = `rgba(0, 255, 255, ${trail.opacity * 0.3})`;
        ctx.fillRect(trail.x * CELL_SIZE + 2, trail.y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4);
      }
    });
    trailRef.current = trailRef.current.filter(t => t.opacity > 0);

    // Draw obstacles
    obstaclesRef.current.forEach(obs => {
      const obstacleGradient = ctx.createRadialGradient(
        obs.x * CELL_SIZE + CELL_SIZE / 2,
        obs.y * CELL_SIZE + CELL_SIZE / 2,
        0,
        obs.x * CELL_SIZE + CELL_SIZE / 2,
        obs.y * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 2
      );
      obstacleGradient.addColorStop(0, '#ff0000');
      obstacleGradient.addColorStop(1, '#880000');
      ctx.fillStyle = obstacleGradient;
      ctx.fillRect(obs.x * CELL_SIZE + 2, obs.y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4);
    });

    // Draw food
    foodRef.current.forEach(food => {
      const pulse = Math.sin(timestamp * 0.005) * 0.2 + 0.8;
      
      ctx.save();
      ctx.shadowBlur = 20;
      ctx.shadowColor = food.color;
      
      const foodGradient = ctx.createRadialGradient(
        food.position.x * CELL_SIZE + CELL_SIZE / 2,
        food.position.y * CELL_SIZE + CELL_SIZE / 2,
        0,
        food.position.x * CELL_SIZE + CELL_SIZE / 2,
        food.position.y * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 2
      );
      foodGradient.addColorStop(0, food.color);
      foodGradient.addColorStop(1, food.color + '88');
      ctx.fillStyle = foodGradient;
      
      const size = (CELL_SIZE - 8) * pulse;
      const offset = (CELL_SIZE - size) / 2;
      ctx.fillRect(
        food.position.x * CELL_SIZE + offset,
        food.position.y * CELL_SIZE + offset,
        size,
        size
      );
      ctx.restore();
    });

    // Draw snake
    snakeRef.current.forEach((segment, index) => {
      const isHead = index === 0;
      const intensity = 1 - (index / snakeRef.current.length) * 0.5;
      
      const segmentGradient = ctx.createLinearGradient(
        segment.x * CELL_SIZE,
        segment.y * CELL_SIZE,
        (segment.x + 1) * CELL_SIZE,
        (segment.y + 1) * CELL_SIZE
      );
      
      if (isHead) {
        segmentGradient.addColorStop(0, '#00ffff');
        segmentGradient.addColorStop(1, '#0088ff');
      } else {
        segmentGradient.addColorStop(0, `rgba(0, 255, 0, ${intensity})`);
        segmentGradient.addColorStop(1, `rgba(0, 128, 0, ${intensity})`);
      }
      
      ctx.fillStyle = segmentGradient;
      ctx.fillRect(segment.x * CELL_SIZE + 2, segment.y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4);
      
      if (isHead) {
        // Draw eyes
        ctx.fillStyle = 'white';
        const eyeOffset = 6;
        if (directionRef.current.x === 1) {
          ctx.fillRect(segment.x * CELL_SIZE + CELL_SIZE - eyeOffset, segment.y * CELL_SIZE + 5, 3, 3);
          ctx.fillRect(segment.x * CELL_SIZE + CELL_SIZE - eyeOffset, segment.y * CELL_SIZE + CELL_SIZE - 8, 3, 3);
        } else if (directionRef.current.x === -1) {
          ctx.fillRect(segment.x * CELL_SIZE + eyeOffset - 3, segment.y * CELL_SIZE + 5, 3, 3);
          ctx.fillRect(segment.x * CELL_SIZE + eyeOffset - 3, segment.y * CELL_SIZE + CELL_SIZE - 8, 3, 3);
        } else if (directionRef.current.y === 1) {
          ctx.fillRect(segment.x * CELL_SIZE + 5, segment.y * CELL_SIZE + CELL_SIZE - eyeOffset, 3, 3);
          ctx.fillRect(segment.x * CELL_SIZE + CELL_SIZE - 8, segment.y * CELL_SIZE + CELL_SIZE - eyeOffset, 3, 3);
        } else {
          ctx.fillRect(segment.x * CELL_SIZE + 5, segment.y * CELL_SIZE + eyeOffset - 3, 3, 3);
          ctx.fillRect(segment.x * CELL_SIZE + CELL_SIZE - 8, segment.y * CELL_SIZE + eyeOffset - 3, 3, 3);
        }
      }
    });

    // Update and draw particles
    particlesRef.current = particlesRef.current.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2;
      p.life -= 0.02;
      
      if (p.life > 0) {
        ctx.fillStyle = p.color + Math.floor(p.life * 255).toString(16).padStart(2, '0');
        ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
        return true;
      }
      return false;
    });

    // Draw UI
    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(`Score: ${score}`, 10, 25);
    ctx.fillText(`Level: ${level}`, 10, 45);
    ctx.fillText(`High: ${highScore}`, 10, 65);
    ctx.fillText(`Length: ${snakeRef.current.length}`, 10, 85);

    requestRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, score, highScore, speed, level, generateFood, generateObstacles]);

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
  const handleTouchDirection = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameState !== 'playing') return;
    
    let newDirection: Position = { x: 0, y: 0 };
    
    switch (direction) {
      case 'up':
        newDirection = { x: 0, y: -1 };
        break;
      case 'down':
        newDirection = { x: 0, y: 1 };
        break;
      case 'left':
        newDirection = { x: -1, y: 0 };
        break;
      case 'right':
        newDirection = { x: 1, y: 0 };
        break;
    }
    
    // Prevent moving into itself
    if (directionRef.current.x === -newDirection.x && directionRef.current.y === -newDirection.y) {
      return;
    }
    
    nextDirectionRef.current = newDirection;
  }, [gameState]);

  return (
    <ResponsiveGameWrapper baseWidth={GRID_SIZE * CELL_SIZE} baseHeight={GRID_SIZE * CELL_SIZE} gameName="Snake Evolution">
      <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-green-900 via-blue-900 to-black">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={GRID_SIZE * CELL_SIZE}
          height={GRID_SIZE * CELL_SIZE}
          className="border-2 border-green-500 rounded-lg shadow-2xl touch-none"
          style={{ imageRendering: 'crisp-edges' }}
        />

        {/* Game Overlays */}
        {gameState === 'menu' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white rounded-lg"
          >
            <h1 className="text-6xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">
              SNAKE EVOLUTION
            </h1>
            <p className="text-xl mb-8">Eat, grow, and evolve!</p>
            <div className="space-y-2 text-center mb-8">
              <p>Arrow Keys/WASD to move</p>
              <p className="text-green-400">Green: Normal Food (+10)</p>
              <p className="text-yellow-400">Yellow: Super Food (+50)</p>
              <p className="text-purple-400">Purple: Speed Boost</p>
              <p className="text-cyan-400">Cyan: Slow Down</p>
            </div>
            <button
              onClick={() => {
                setGameState('playing');
                initGame();
              }}
              className="px-8 py-4 bg-gradient-to-r from-green-600 to-cyan-600 rounded-lg text-xl font-bold hover:scale-105 transition-transform"
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
            <h2 className="text-5xl font-bold mb-4 text-red-500">GAME OVER</h2>
            <p className="text-2xl mb-2">Score: {score}</p>
            <p className="text-xl mb-2">Length: {snakeRef.current.length}</p>
            {score >= highScore && score > 0 && (
              <p className="text-xl text-yellow-400 mb-4">NEW HIGH SCORE!</p>
            )}
            <button
              onClick={() => {
                setGameState('playing');
                initGame();
              }}
              className="px-8 py-4 bg-gradient-to-r from-green-600 to-cyan-600 rounded-lg text-xl font-bold hover:scale-105 transition-transform mt-4"
            >
              PLAY AGAIN
            </button>
          </motion.div>
        )}
      </div>
      
      {/* Touch Controls */}
      {isMobile && gameState === 'playing' && (
        <TouchControls
          variant="snake"
          onUp={() => handleTouchDirection('up')}
          onDown={() => handleTouchDirection('down')}
          onLeft={() => handleTouchDirection('left')}
          onRight={() => handleTouchDirection('right')}
          onPause={() => {
            if (gameState === 'playing') setGameState('paused');
            else if (gameState === 'paused') setGameState('playing');
          }}
          showAction={false}
        />
      )}
    </div>
    </ResponsiveGameWrapper>
  );
};

export default SnakeEvolution;