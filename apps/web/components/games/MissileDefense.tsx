import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import ResponsiveGameWrapper from '../ResponsiveGameWrapper';
import TouchControls from '../TouchControls';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;
const CITY_COUNT = 6;
const INITIAL_MISSILES = 30;

interface City {
  x: number;
  y: number;
  width: number;
  height: number;
  alive: boolean;
}

interface Missile {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  currentX: number;
  currentY: number;
  speed: number;
  isPlayerMissile: boolean;
  active: boolean;
  trail: {x: number, y: number}[];
}

interface Explosion {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  expanding: boolean;
  color: string;
}

const MissileDefense: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [missiles, setMissiles] = useState(INITIAL_MISSILES);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameOver'>('menu');
  const [highScore, setHighScore] = useState(0);

  // Game objects
  const citiesRef = useRef<City[]>([]);
  const enemyMissilesRef = useRef<Missile[]>([]);
  const playerMissilesRef = useRef<Missile[]>([]);
  const explosionsRef = useRef<Explosion[]>([]);
  const lastEnemySpawnRef = useRef(0);
  const particlesRef = useRef<{x: number, y: number, vx: number, vy: number, color: string, life: number}[]>([]);

  // Initialize
  useEffect(() => {
    const saved = localStorage.getItem('missileDefenseHighScore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  // Initialize cities
  const initCities = useCallback(() => {
    const cities: City[] = [];
    const cityWidth = 60;
    const cityHeight = 40;
    const spacing = CANVAS_WIDTH / (CITY_COUNT + 1);
    
    for (let i = 0; i < CITY_COUNT; i++) {
      cities.push({
        x: spacing * (i + 1) - cityWidth / 2,
        y: CANVAS_HEIGHT - cityHeight - 10,
        width: cityWidth,
        height: cityHeight,
        alive: true
      });
    }
    
    return cities;
  }, []);

  // Initialize game
  const initGame = useCallback(() => {
    citiesRef.current = initCities();
    enemyMissilesRef.current = [];
    playerMissilesRef.current = [];
    explosionsRef.current = [];
    particlesRef.current = [];
    lastEnemySpawnRef.current = 0;
    setMissiles(INITIAL_MISSILES);
  }, [initCities]);

  // Handle mouse and touch events
  useEffect(() => {
    const handleInteraction = (clientX: number, clientY: number) => {
      if (gameState !== 'playing' || missiles <= 0) return;
      
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      const scaleX = CANVAS_WIDTH / rect.width;
      const scaleY = CANVAS_HEIGHT / rect.height;
      const x = (clientX - rect.left) * scaleX;
      const y = (clientY - rect.top) * scaleY;
      
      // Launch player missile from center bottom
      playerMissilesRef.current.push({
        startX: CANVAS_WIDTH / 2,
        startY: CANVAS_HEIGHT,
        endX: x,
        endY: y,
        currentX: CANVAS_WIDTH / 2,
        currentY: CANVAS_HEIGHT,
        speed: 8,
        isPlayerMissile: true,
        active: true,
        trail: []
      });
      
      setMissiles(prev => prev - 1);
    };

    const handleClick = (e: MouseEvent) => {
      handleInteraction(e.clientX, e.clientY);
    };

    const handleTouch = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length > 0) {
        handleInteraction(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('click', handleClick);
      canvas.addEventListener('touchstart', handleTouch);
      return () => {
        canvas.removeEventListener('click', handleClick);
        canvas.removeEventListener('touchstart', handleTouch);
      };
    }
  }, [gameState, missiles]);

  // Handle keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (gameState === 'playing') setGameState('paused');
        else if (gameState === 'paused') setGameState('playing');
      } else if (e.key === 'Enter' || e.key === ' ') {
        if (gameState === 'menu' || gameState === 'gameOver') {
          setGameState('playing');
          setScore(0);
          setLevel(1);
          initGame();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, initGame]);

  // Create explosion
  const createExplosion = (x: number, y: number, isPlayer: boolean) => {
    explosionsRef.current.push({
      x,
      y,
      radius: 5,
      maxRadius: isPlayer ? 50 : 30,
      expanding: true,
      color: isPlayer ? '#00ff00' : '#ff0000'
    });
    
    // Add particles
    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 * i) / 20;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * (3 + Math.random() * 5),
        vy: Math.sin(angle) * (3 + Math.random() * 5),
        color: isPlayer ? '#00ff00' : '#ff0000',
        life: 1
      });
    }
  };

  // Game loop
  const gameLoop = useCallback((timestamp: number) => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear canvas
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, 'rgba(10, 0, 30, 0.95)');
    gradient.addColorStop(1, 'rgba(50, 0, 0, 0.95)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Spawn enemy missiles
    const spawnRate = Math.max(500, 3000 - level * 200);
    if (timestamp - lastEnemySpawnRef.current > spawnRate) {
      const targetCity = citiesRef.current.filter(c => c.alive)[Math.floor(Math.random() * citiesRef.current.filter(c => c.alive).length)];
      if (targetCity) {
        enemyMissilesRef.current.push({
          startX: Math.random() * CANVAS_WIDTH,
          startY: 0,
          endX: targetCity.x + targetCity.width / 2,
          endY: targetCity.y + targetCity.height / 2,
          currentX: 0,
          currentY: 0,
          speed: 1 + level * 0.2,
          isPlayerMissile: false,
          active: true,
          trail: []
        });
        enemyMissilesRef.current[enemyMissilesRef.current.length - 1].currentX = enemyMissilesRef.current[enemyMissilesRef.current.length - 1].startX;
      }
      lastEnemySpawnRef.current = timestamp;
    }

    // Update missiles
    [...enemyMissilesRef.current, ...playerMissilesRef.current].forEach(missile => {
      if (!missile.active) return;
      
      const dx = missile.endX - missile.startX;
      const dy = missile.endY - missile.startY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const moveX = (dx / distance) * missile.speed;
      const moveY = (dy / distance) * missile.speed;
      
      missile.currentX += moveX;
      missile.currentY += moveY;
      
      // Add to trail
      missile.trail.push({x: missile.currentX, y: missile.currentY});
      if (missile.trail.length > 20) missile.trail.shift();
      
      // Check if reached target
      const distToTarget = Math.sqrt(
        Math.pow(missile.currentX - missile.endX, 2) + 
        Math.pow(missile.currentY - missile.endY, 2)
      );
      
      if (distToTarget < 5) {
        missile.active = false;
        createExplosion(missile.endX, missile.endY, missile.isPlayerMissile);
        
        // Check city destruction for enemy missiles
        if (!missile.isPlayerMissile) {
          citiesRef.current.forEach(city => {
            if (city.alive) {
              const dist = Math.sqrt(
                Math.pow(city.x + city.width / 2 - missile.endX, 2) +
                Math.pow(city.y + city.height / 2 - missile.endY, 2)
              );
              if (dist < 40) {
                city.alive = false;
                createExplosion(city.x + city.width / 2, city.y + city.height / 2, false);
              }
            }
          });
        }
      }
    });

    // Update explosions
    explosionsRef.current = explosionsRef.current.filter(explosion => {
      if (explosion.expanding) {
        explosion.radius += 2;
        if (explosion.radius >= explosion.maxRadius) {
          explosion.expanding = false;
        }
        
        // Check missile interceptions
        enemyMissilesRef.current.forEach(missile => {
          if (missile.active) {
            const dist = Math.sqrt(
              Math.pow(missile.currentX - explosion.x, 2) +
              Math.pow(missile.currentY - explosion.y, 2)
            );
            if (dist < explosion.radius) {
              missile.active = false;
              setScore(prev => prev + 10);
              createExplosion(missile.currentX, missile.currentY, false);
            }
          }
        });
      } else {
        explosion.radius -= 1;
      }
      return explosion.radius > 0;
    });

    // Update particles
    particlesRef.current = particlesRef.current.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2;
      p.life -= 0.02;
      return p.life > 0;
    });

    // Draw cities
    citiesRef.current.forEach(city => {
      if (city.alive) {
        const cityGradient = ctx.createLinearGradient(city.x, city.y, city.x, city.y + city.height);
        cityGradient.addColorStop(0, '#0088ff');
        cityGradient.addColorStop(1, '#004488');
        ctx.fillStyle = cityGradient;
        ctx.fillRect(city.x, city.y, city.width, city.height);
        
        // Windows
        ctx.fillStyle = '#ffff00';
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 2; j++) {
            ctx.fillRect(city.x + 10 + i * 15, city.y + 10 + j * 15, 5, 5);
          }
        }
      } else {
        // Rubble
        ctx.fillStyle = '#444444';
        ctx.fillRect(city.x, city.y + city.height / 2, city.width, city.height / 2);
      }
    });

    // Draw missiles
    [...enemyMissilesRef.current, ...playerMissilesRef.current].forEach(missile => {
      if (!missile.active) return;
      
      // Draw trail
      missile.trail.forEach((point, i) => {
        ctx.fillStyle = missile.isPlayerMissile ? 
          `rgba(0, 255, 0, ${i / missile.trail.length * 0.5})` : 
          `rgba(255, 0, 0, ${i / missile.trail.length * 0.5})`;
        ctx.fillRect(point.x - 1, point.y - 1, 2, 2);
      });
      
      // Draw missile head
      ctx.fillStyle = missile.isPlayerMissile ? '#00ff00' : '#ff0000';
      ctx.beginPath();
      ctx.arc(missile.currentX, missile.currentY, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw explosions
    explosionsRef.current.forEach(explosion => {
      ctx.strokeStyle = explosion.color;
      ctx.lineWidth = 3;
      ctx.globalAlpha = explosion.expanding ? 1 : explosion.radius / explosion.maxRadius;
      ctx.beginPath();
      ctx.arc(explosion.x, explosion.y, explosion.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    });

    // Draw particles
    particlesRef.current.forEach(p => {
      ctx.fillStyle = p.color + Math.floor(p.life * 255).toString(16).padStart(2, '0');
      ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
    });

    // Draw ground
    ctx.fillStyle = '#333333';
    ctx.fillRect(0, CANVAS_HEIGHT - 10, CANVAS_WIDTH, 10);

    // Draw UI
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`Level: ${level}`, 150, 30);
    ctx.fillText(`Missiles: ${missiles}`, 250, 30);
    ctx.fillText(`Cities: ${citiesRef.current.filter(c => c.alive).length}`, 380, 30);

    // Check game over
    if (citiesRef.current.filter(c => c.alive).length === 0) {
      setGameState('gameOver');
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('missileDefenseHighScore', score.toString());
      }
    }

    // Check level complete
    if (missiles === 0 && playerMissilesRef.current.filter(m => m.active).length === 0 &&
        enemyMissilesRef.current.filter(m => m.active).length === 0) {
      setLevel(prev => prev + 1);
      setMissiles(INITIAL_MISSILES);
      enemyMissilesRef.current = [];
      playerMissilesRef.current = [];
    }

    requestRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, score, highScore, level, missiles]);

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

  return (
    <ResponsiveGameWrapper baseWidth={CANVAS_WIDTH} baseHeight={CANVAS_HEIGHT} gameName="Missile Defense">
      <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-red-900 via-orange-900 to-black">
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="border-2 border-red-500 rounded-lg shadow-2xl cursor-crosshair touch-none"
            style={{ imageRendering: 'pixelated' }}
          />

        {/* Overlays */}
        {gameState === 'menu' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white rounded-lg"
          >
            <h1 className="text-6xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
              MISSILE DEFENSE
            </h1>
            <p className="text-xl mb-8">Protect your cities from incoming missiles!</p>
            <div className="space-y-2 text-center">
              <p>Click to launch interceptor missiles</p>
              <p>Chain explosions destroy enemy missiles</p>
            </div>
            <button
              onClick={() => {
                setGameState('playing');
                setScore(0);
                setLevel(1);
                initGame();
              }}
              className="px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg text-xl font-bold hover:scale-105 transition-transform mt-4"
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
            <p className="text-2xl mb-2">All cities destroyed!</p>
            <p className="text-2xl mb-2">Final Score: {score}</p>
            {score >= highScore && score > 0 && (
              <p className="text-xl text-yellow-400 mb-4">NEW HIGH SCORE!</p>
            )}
            <button
              onClick={() => {
                setGameState('playing');
                setScore(0);
                setLevel(1);
                initGame();
              }}
              className="px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg text-xl font-bold hover:scale-105 transition-transform mt-4"
            >
              PLAY AGAIN
            </button>
          </motion.div>
        )}
        </div>
        
        {/* Touch Controls for Mobile */}
        <TouchControls
          variant="missile"
          showDirectional={false}
          showAction={false}
          onPause={() => {
            if (gameState === 'playing') setGameState('paused');
            else if (gameState === 'paused') setGameState('playing');
          }}
        />
      </div>
    </ResponsiveGameWrapper>
  );
};

export default MissileDefense;