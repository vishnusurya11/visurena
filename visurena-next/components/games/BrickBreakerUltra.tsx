import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import ResponsiveGameWrapper from '../ResponsiveGameWrapper';
import TouchControls from '../TouchControls';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 15;
const BALL_RADIUS = 8;
const BRICK_WIDTH = 75;
const BRICK_HEIGHT = 20;
const BRICK_PADDING = 5;
const BRICK_ROWS = 6;
const BRICK_COLS = 10;

interface Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  points: number;
  hits: number;
  active: boolean;
}

interface PowerUp {
  x: number;
  y: number;
  type: 'expand' | 'multi' | 'laser' | 'slow' | 'life';
  color: string;
  active: boolean;
}

const BrickBreakerUltra: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameOver'>('menu');
  const [highScore, setHighScore] = useState(0);

  // Game objects
  const paddleRef = useRef({ x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2, y: CANVAS_HEIGHT - 40, width: PADDLE_WIDTH });
  const ballsRef = useRef([{ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 60, vx: 4, vy: -4, stuck: true }]);
  const bricksRef = useRef<Brick[]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const particlesRef = useRef<{x: number, y: number, vx: number, vy: number, color: string, life: number}[]>([]);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const [isMobile, setIsMobile] = useState(false);
  const touchIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize
  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    const saved = localStorage.getItem('brickBreakerHighScore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  // Create bricks
  const createBricks = useCallback((level: number) => {
    const bricks: Brick[] = [];
    const colors = ['#ff0000', '#ff8800', '#ffff00', '#00ff00', '#00ffff', '#ff00ff'];
    
    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        const x = col * (BRICK_WIDTH + BRICK_PADDING) + 35;
        const y = row * (BRICK_HEIGHT + BRICK_PADDING) + 60;
        
        bricks.push({
          x,
          y,
          width: BRICK_WIDTH,
          height: BRICK_HEIGHT,
          color: colors[row % colors.length],
          points: (BRICK_ROWS - row) * 10,
          hits: row < 2 ? 2 : 1,
          active: true
        });
      }
    }
    
    return bricks;
  }, []);

  // Initialize game
  const initGame = useCallback(() => {
    paddleRef.current = { x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2, y: CANVAS_HEIGHT - 40, width: PADDLE_WIDTH };
    ballsRef.current = [{ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 60, vx: 4, vy: -4, stuck: true }];
    bricksRef.current = createBricks(level);
    powerUpsRef.current = [];
    particlesRef.current = [];
  }, [level, createBricks]);

  // Create explosion
  const createExplosion = (x: number, y: number, color: string) => {
    for (let i = 0; i < 10; i++) {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        color,
        life: 1
      });
    }
  };

  // Handle keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', ' ', 'Escape'].includes(e.key)) {
        e.preventDefault();
      }
      
      keysRef.current[e.key] = true;
      
      if (e.key === ' ') {
        if (gameState === 'playing') {
          ballsRef.current.forEach(ball => {
            if (ball.stuck) {
              ball.stuck = false;
              ball.vx = (Math.random() - 0.5) * 8;
              ball.vy = -5;
            }
          });
        } else if (gameState === 'menu' || gameState === 'gameOver') {
          setGameState('playing');
          initGame();
        }
      }
      
      if (e.key === 'Escape') {
        if (gameState === 'playing') setGameState('paused');
        else if (gameState === 'paused') setGameState('playing');
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
    ctx.fillStyle = 'rgba(10, 10, 30, 0.95)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Update paddle
    const paddle = paddleRef.current;
    const paddleSpeed = 8;
    
    if (keysRef.current['ArrowLeft']) {
      paddle.x = Math.max(0, paddle.x - paddleSpeed);
    }
    if (keysRef.current['ArrowRight']) {
      paddle.x = Math.min(CANVAS_WIDTH - paddle.width, paddle.x + paddleSpeed);
    }

    // Update balls
    ballsRef.current = ballsRef.current.filter((ball, ballIndex) => {
      if (ball.stuck) {
        ball.x = paddle.x + paddle.width / 2;
        ball.y = paddle.y - BALL_RADIUS - 1;
      } else {
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Wall collisions
        if (ball.x <= BALL_RADIUS || ball.x >= CANVAS_WIDTH - BALL_RADIUS) {
          ball.vx *= -1;
        }
        if (ball.y <= BALL_RADIUS) {
          ball.vy *= -1;
        }

        // Paddle collision
        if (ball.y + BALL_RADIUS >= paddle.y &&
            ball.y - BALL_RADIUS <= paddle.y + PADDLE_HEIGHT &&
            ball.x >= paddle.x &&
            ball.x <= paddle.x + paddle.width) {
          
          const relativeX = (ball.x - paddle.x) / paddle.width;
          ball.vx = 8 * (relativeX - 0.5);
          ball.vy = -Math.abs(ball.vy);
          
          createExplosion(ball.x, ball.y, '#00ffff');
        }

        // Brick collisions
        bricksRef.current.forEach(brick => {
          if (!brick.active) return;
          
          if (ball.x >= brick.x &&
              ball.x <= brick.x + brick.width &&
              ball.y >= brick.y &&
              ball.y <= brick.y + brick.height) {
            
            brick.hits--;
            if (brick.hits <= 0) {
              brick.active = false;
              setScore(prev => prev + brick.points);
              createExplosion(brick.x + brick.width / 2, brick.y + brick.height / 2, brick.color);
              
              // Random power-up
              if (Math.random() < 0.1) {
                const types: PowerUp['type'][] = ['expand', 'multi', 'laser', 'slow', 'life'];
                const type = types[Math.floor(Math.random() * types.length)];
                const colors = {
                  expand: '#00ff00',
                  multi: '#00ffff',
                  laser: '#ff00ff',
                  slow: '#ffff00',
                  life: '#ff0000'
                };
                
                powerUpsRef.current.push({
                  x: brick.x + brick.width / 2,
                  y: brick.y + brick.height / 2,
                  type,
                  color: colors[type],
                  active: true
                });
              }
            }
            
            ball.vy *= -1;
          }
        });

        // Ball lost
        if (ball.y > CANVAS_HEIGHT) {
          if (ballsRef.current.length === 1) {
            setLives(prev => {
              const newLives = prev - 1;
              if (newLives <= 0) {
                setGameState('gameOver');
                if (score > highScore) {
                  setHighScore(score);
                  localStorage.setItem('brickBreakerHighScore', score.toString());
                }
              }
              return newLives;
            });
            
            // Reset ball
            ball.x = paddle.x + paddle.width / 2;
            ball.y = paddle.y - BALL_RADIUS - 1;
            ball.vx = 0;
            ball.vy = 0;
            ball.stuck = true;
          } else {
            return false; // Remove this ball if multiple
          }
        }
      }
      
      return true;
    });

    // Update power-ups
    powerUpsRef.current = powerUpsRef.current.filter(powerUp => {
      if (!powerUp.active) return false;
      
      powerUp.y += 3;
      
      // Paddle collision
      if (powerUp.y >= paddle.y &&
          powerUp.y <= paddle.y + PADDLE_HEIGHT &&
          powerUp.x >= paddle.x &&
          powerUp.x <= paddle.x + paddle.width) {
        
        powerUp.active = false;
        
        // Apply power-up
        switch (powerUp.type) {
          case 'expand':
            paddle.width = Math.min(200, paddle.width + 30);
            break;
          case 'multi':
            const mainBall = ballsRef.current[0];
            if (mainBall && !mainBall.stuck) {
              for (let i = 0; i < 2; i++) {
                ballsRef.current.push({
                  x: mainBall.x,
                  y: mainBall.y,
                  vx: (Math.random() - 0.5) * 8,
                  vy: -5,
                  stuck: false
                });
              }
            }
            break;
          case 'slow':
            ballsRef.current.forEach(ball => {
              ball.vx *= 0.7;
              ball.vy *= 0.7;
            });
            break;
          case 'life':
            setLives(prev => Math.min(5, prev + 1));
            break;
        }
        
        return false;
      }
      
      return powerUp.y < CANVAS_HEIGHT;
    });

    // Check level complete
    if (bricksRef.current.every(brick => !brick.active)) {
      setLevel(prev => prev + 1);
      initGame();
    }

    // Draw bricks
    bricksRef.current.forEach(brick => {
      if (!brick.active) return;
      
      const gradient = ctx.createLinearGradient(brick.x, brick.y, brick.x, brick.y + brick.height);
      gradient.addColorStop(0, brick.color);
      gradient.addColorStop(1, brick.color + '88');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
      
      if (brick.hits > 1) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
      }
    });

    // Draw paddle
    const paddleGradient = ctx.createLinearGradient(paddle.x, paddle.y, paddle.x, paddle.y + PADDLE_HEIGHT);
    paddleGradient.addColorStop(0, '#00ffff');
    paddleGradient.addColorStop(1, '#0088ff');
    ctx.fillStyle = paddleGradient;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, PADDLE_HEIGHT);

    // Draw balls
    ballsRef.current.forEach(ball => {
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
      const ballGradient = ctx.createRadialGradient(ball.x, ball.y, 0, ball.x, ball.y, BALL_RADIUS);
      ballGradient.addColorStop(0, '#ffffff');
      ballGradient.addColorStop(1, '#00ffff');
      ctx.fillStyle = ballGradient;
      ctx.fill();
    });

    // Draw power-ups
    powerUpsRef.current.forEach(powerUp => {
      ctx.fillStyle = powerUp.color;
      ctx.fillRect(powerUp.x - 10, powerUp.y - 10, 20, 20);
      ctx.strokeStyle = '#ffffff';
      ctx.strokeRect(powerUp.x - 10, powerUp.y - 10, 20, 20);
    });

    // Draw particles
    particlesRef.current = particlesRef.current.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.3;
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
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`Level: ${level}`, 150, 30);
    ctx.fillText(`Lives: ${lives}`, 250, 30);
    ctx.fillText(`High: ${highScore}`, CANVAS_WIDTH - 150, 30);

    requestRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, score, highScore, level, initGame]);

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
  const handleTouchMove = useCallback((direction: 'left' | 'right') => {
    if (gameState !== 'playing' || !paddleRef.current) return;
    const paddle = paddleRef.current;
    const moveSpeed = 15;
    if (direction === 'left') {
      paddle.x = Math.max(0, paddle.x - moveSpeed);
    } else {
      paddle.x = Math.min(CANVAS_WIDTH - paddle.width, paddle.x + moveSpeed);
    }
  }, [gameState]);

  const handleTouchLaunch = useCallback(() => {
    if (gameState !== 'playing') return;
    ballsRef.current.forEach(ball => {
      if (ball.stuck) {
        ball.stuck = false;
        ball.vx = 4;
        ball.vy = -4;
      }
    });
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
    <ResponsiveGameWrapper baseWidth={CANVAS_WIDTH} baseHeight={CANVAS_HEIGHT} gameName="Brick Breaker Ultra">
      <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-purple-900 via-blue-900 to-black">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-2 border-purple-500 rounded-lg shadow-2xl touch-none"
          style={{ imageRendering: 'pixelated' }}
        />

        {/* Overlays */}
        {gameState === 'menu' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white rounded-lg"
          >
            <h1 className="text-6xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-yellow-400 to-green-400">
              BRICK BREAKER ULTRA
            </h1>
            <p className="text-xl mb-8">Destroy all bricks to advance!</p>
            <div className="space-y-2 text-center">
              <p>← → Move Paddle • Space: Launch/Start</p>
            </div>
            <button
              onClick={() => {
                setGameState('playing');
                initGame();
              }}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-xl font-bold hover:scale-105 transition-transform mt-4"
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
            <p className="text-2xl mb-2">Final Score: {score}</p>
            <p className="text-xl mb-2">Level: {level}</p>
            {score >= highScore && score > 0 && (
              <p className="text-xl text-yellow-400 mb-4">NEW HIGH SCORE!</p>
            )}
            <button
              onClick={() => {
                setScore(0);
                setLives(3);
                setLevel(1);
                setGameState('playing');
                initGame();
              }}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-xl font-bold hover:scale-105 transition-transform mt-4"
            >
              PLAY AGAIN
            </button>
          </motion.div>
        )}
      </div>
      
      {/* Touch Controls */}
      {isMobile && gameState === 'playing' && (
        <TouchControls
          variant="brick"
          onLeft={() => {
            if (touchIntervalRef.current) clearInterval(touchIntervalRef.current);
            handleTouchMove('left');
            touchIntervalRef.current = setInterval(() => handleTouchMove('left'), 50);
          }}
          onRight={() => {
            if (touchIntervalRef.current) clearInterval(touchIntervalRef.current);
            handleTouchMove('right');
            touchIntervalRef.current = setInterval(() => handleTouchMove('right'), 50);
          }}
          onAction={handleTouchLaunch}
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
          showUp={false}
          showDown={false}
        />
      )}
    </div>
    </ResponsiveGameWrapper>
  );
};

export default BrickBreakerUltra;