import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import ResponsiveGameWrapper from '../ResponsiveGameWrapper';
import TouchControls from '../TouchControls';

interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityX?: number;
  velocityY?: number;
  color?: string;
  active?: boolean;
}

interface Invader extends GameObject {
  type: 'basic' | 'medium' | 'strong' | 'elite' | 'boss';
  points: number;
  health?: number;
  maxHealth?: number;
  pattern?: 'normal' | 'zigzag' | 'circle' | 'dive';
  animationPhase?: number;
}

interface Bullet extends GameObject {
  isPlayerBullet: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size?: number;
  type?: 'explosion' | 'trail' | 'star';
}

interface PowerUp extends GameObject {
  type: 'rapidFire' | 'tripleShot' | 'shield' | 'bomb';
  duration?: number;
}

interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  brightness: number;
}

const CosmicDefense: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameOver'>('menu');
  const [highScore, setHighScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [combo, setCombo] = useState(0);
  const [powerUpActive, setPowerUpActive] = useState<string | null>(null);
  const [powerUpTimer, setPowerUpTimer] = useState(0);
  const [screenShake, setScreenShake] = useState(0);

  // Game objects refs
  const playerRef = useRef<GameObject>({ x: 0, y: 0, width: 40, height: 30 });
  const invadersRef = useRef<Invader[]>([]);
  const bulletsRef = useRef<Bullet[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const invaderDirectionRef = useRef(1);
  const invaderSpeedRef = useRef(0.5);
  const lastShotRef = useRef(0);
  const invaderLastShotRef = useRef(0);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const starsRef = useRef<Star[]>([]);
  const animationTimeRef = useRef(0);
  const backgroundPlanetsRef = useRef<{x: number, y: number, radius: number, color: string}[]>([]);

  // Touch controls state
  const [touchPosition, setTouchPosition] = useState<{ x: number } | null>(null);
  const [isShooting, setIsShooting] = useState(false);
  const touchIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize game
  useEffect(() => {
    // Check if mobile
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    
    // Load high score
    const savedHighScore = localStorage.getItem('cosmicDefenseHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
    
    // Initialize stars
    for (let i = 0; i < 100; i++) {
      starsRef.current.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.5 + 0.1,
        brightness: Math.random()
      });
    }
  }, []);

  // Get formation based on level
  const getFormation = useCallback((levelNum: number) => {
    const formations = [
      'classic', 'vshape', 'diamond', 'zigzag', 'circle', 'waves', 'cross', 'spiral'
    ];
    return formations[(levelNum - 1) % formations.length];
  }, []);

  // Get level colors
  const getLevelColors = useCallback((levelNum: number) => {
    const themes = [
      { basic: '#00ff00', medium: '#00ffff', strong: '#ff00ff', elite: '#ffff00' }, // Classic
      { basic: '#ff6b6b', medium: '#ff9f40', strong: '#ffd93d', elite: '#6bcf7f' }, // Warm
      { basic: '#4ecdc4', medium: '#44a3ff', strong: '#7b68ee', elite: '#ff6b9d' }, // Cool
      { basic: '#f72585', medium: '#7209b7', strong: '#3a0ca3', elite: '#4361ee' }, // Purple
      { basic: '#ffbe0b', medium: '#fb5607', strong: '#ff006e', elite: '#8338ec' }, // Neon
    ];
    return themes[(levelNum - 1) % themes.length];
  }, []);

  // Initialize player and invaders
  const initGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Reset game state
    playerRef.current = {
      x: canvas.width / 2 - 20,
      y: canvas.height - 60,
      width: 40,
      height: 30
    };

    // Initialize background planets for this level
    backgroundPlanetsRef.current = [];
    const numPlanets = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numPlanets; i++) {
      backgroundPlanetsRef.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.5,
        radius: Math.random() * 50 + 20,
        color: `hsla(${Math.random() * 360}, 50%, 50%, 0.3)`
      });
    }

    // Create invader grid based on level
    invadersRef.current = [];
    const formation = getFormation(level);
    const colors = getLevelColors(level);
    const isBossLevel = level % 5 === 0;
    
    if (isBossLevel) {
      // Create boss enemy
      invadersRef.current.push({
        x: canvas.width / 2 - 60,
        y: 50,
        width: 120,
        height: 80,
        type: 'boss',
        points: 500,
        health: 20 + level * 2,
        maxHealth: 20 + level * 2,
        active: true,
        color: '#ff00ff',
        pattern: 'zigzag',
        animationPhase: 0
      });
    } else {
      const baseRows = 5 + Math.floor(level / 3);
      const baseCols = 8 + Math.floor(level / 5);
      const invaderWidth = 30;
      const invaderHeight = 24;
      const spacing = 10;
      
      // Different formations
      for (let row = 0; row < baseRows; row++) {
        for (let col = 0; col < baseCols; col++) {
          let x = 0, y = 0;
          let skipInvader = false;
          
          switch (formation) {
            case 'vshape':
              x = 50 + col * (invaderWidth + spacing);
              y = 50 + row * (invaderHeight + spacing) + Math.abs(col - baseCols / 2) * 10;
              break;
            case 'diamond':
              x = 50 + col * (invaderWidth + spacing);
              y = 50 + row * (invaderHeight + spacing);
              skipInvader = Math.abs(row - baseRows / 2) + Math.abs(col - baseCols / 2) > baseRows / 2 + 2;
              break;
            case 'zigzag':
              x = 50 + col * (invaderWidth + spacing) + (row % 2) * 20;
              y = 50 + row * (invaderHeight + spacing);
              break;
            case 'circle':
              const angle = (col / baseCols) * Math.PI * 2;
              const radius = 100 + row * 30;
              x = canvas.width / 2 + Math.cos(angle) * radius - invaderWidth / 2;
              y = 150 + Math.sin(angle) * radius / 2;
              break;
            case 'waves':
              x = 50 + col * (invaderWidth + spacing);
              y = 50 + row * (invaderHeight + spacing) + Math.sin(col * 0.5) * 20;
              break;
            case 'cross':
              x = 50 + col * (invaderWidth + spacing);
              y = 50 + row * (invaderHeight + spacing);
              skipInvader = !(row === Math.floor(baseRows / 2) || col === Math.floor(baseCols / 2));
              break;
            case 'spiral':
              const spiralAngle = (row * baseCols + col) * 0.3;
              const spiralRadius = 20 + (row * baseCols + col) * 3;
              x = canvas.width / 2 + Math.cos(spiralAngle) * spiralRadius - invaderWidth / 2;
              y = 150 + Math.sin(spiralAngle) * spiralRadius / 2;
              break;
            default: // classic
              x = 50 + col * (invaderWidth + spacing);
              y = 50 + row * (invaderHeight + spacing);
          }
          
          if (!skipInvader) {
            const typeRoll = Math.random();
            const type = level > 10 && typeRoll < 0.1 ? 'elite' : 
                        row < 1 ? 'strong' : 
                        row < 3 ? 'medium' : 'basic';
            const points = type === 'elite' ? 50 : type === 'strong' ? 30 : type === 'medium' ? 20 : 10;
            
            invadersRef.current.push({
              x,
              y,
              width: invaderWidth,
              height: invaderHeight,
              type,
              points,
              active: true,
              color: colors[type] || colors.basic,
              pattern: type === 'elite' ? 'zigzag' : 'normal',
              animationPhase: Math.random() * Math.PI * 2
            });
          }
        }
      }
    }

    bulletsRef.current = [];
    particlesRef.current = [];
    powerUpsRef.current = [];
    invaderSpeedRef.current = 0.5 + (level - 1) * 0.2;
    setCombo(0);
  }, [level, getFormation, getLevelColors]);

  // Create explosion particles
  const createExplosion = (x: number, y: number, color: string) => {
    for (let i = 0; i < 15; i++) {
      const angle = (Math.PI * 2 * i) / 15;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * (2 + Math.random() * 3),
        vy: Math.sin(angle) * (2 + Math.random() * 3),
        life: 1,
        color
      });
    }
  };

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default for game control keys to stop page scrolling
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'w', 'a', 's', 'd', 'Escape'].includes(e.key)) {
        e.preventDefault();
      }
      
      keysRef.current[e.key] = true;
      
      if (e.key === ' ' || e.key === 'Enter') {
        if (gameState === 'menu') {
          setGameState('playing');
          initGame();
        } else if (gameState === 'gameOver') {
          setScore(0);
          setLives(3);
          setLevel(1);
          setGameState('playing');
          initGame();
        }
      }
      
      if (e.key === 'Escape' && gameState === 'playing') {
        setGameState('paused');
      } else if (e.key === 'Escape' && gameState === 'paused') {
        setGameState('playing');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Prevent default for game control keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'w', 'a', 's', 'd'].includes(e.key)) {
        e.preventDefault();
      }
      keysRef.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, initGame]);

  // Handle touch controls
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setTouchPosition({ x: touch.clientX - rect.left });
      
      // Check if touching upper half (shoot) or lower half (move)
      if (touch.clientY - rect.top < rect.height / 2) {
        setIsShooting(true);
      }
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setTouchPosition({ x: touch.clientX - rect.left });
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    setTouchPosition(null);
    setIsShooting(false);
  }, []);

  // Game loop
  const gameLoop = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || gameState !== 'playing') return;

    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 20, 0.95)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw stars background
    for (let i = 0; i < 50; i++) {
      const x = (i * 73) % canvas.width;
      const y = (i * 37) % canvas.height;
      const brightness = Math.sin(timestamp * 0.001 + i) * 0.5 + 0.5;
      ctx.fillStyle = `rgba(255, 255, 255, ${brightness * 0.5})`;
      ctx.fillRect(x, y, 1, 1);
    }

    // Update player position
    const player = playerRef.current;
    const speed = 5;
    
    if (touchPosition) {
      // Mobile controls
      const targetX = touchPosition.x - player.width / 2;
      const diff = targetX - player.x;
      player.x += diff * 0.2; // Smooth movement
    } else {
      // Keyboard controls
      if (keysRef.current['ArrowLeft'] || keysRef.current['a']) {
        player.x = Math.max(0, player.x - speed);
      }
      if (keysRef.current['ArrowRight'] || keysRef.current['d']) {
        player.x = Math.min(canvas.width - player.width, player.x + speed);
      }
    }

    // Player shooting with power-ups
    const shootDelay = powerUpActive === 'rapidFire' ? 100 : 250;
    if ((keysRef.current[' '] || isShooting) && timestamp - lastShotRef.current > shootDelay) {
      if (powerUpActive === 'tripleShot') {
        // Triple shot
        for (let i = -1; i <= 1; i++) {
          bulletsRef.current.push({
            x: player.x + player.width / 2 - 2 + i * 10,
            y: player.y,
            width: 4,
            height: 10,
            velocityX: i * 2,
            velocityY: -8,
            isPlayerBullet: true,
            active: true
          });
        }
      } else if (powerUpActive === 'bomb') {
        // Bomb clears screen
        invadersRef.current.forEach(invader => {
          if (invader.active && invader.type !== 'boss') {
            invader.active = false;
            setScore(prev => prev + invader.points);
            createExplosion(invader.x + invader.width / 2, invader.y + invader.height / 2, invader.color!);
          }
        });
        setPowerUpActive(null);
        setScreenShake(30);
      } else {
        // Normal shot
        bulletsRef.current.push({
          x: player.x + player.width / 2 - 2,
          y: player.y,
          width: 4,
          height: 10,
          velocityY: -8,
          isPlayerBullet: true,
          active: true
        });
      }
      lastShotRef.current = timestamp;
    }

    // Update invaders
    let shouldDescend = false;
    const activeInvaders = invadersRef.current.filter(inv => inv.active);
    
    activeInvaders.forEach(invader => {
      invader.x += invaderSpeedRef.current * invaderDirectionRef.current;
      
      if (invader.x <= 0 || invader.x + invader.width >= canvas.width) {
        shouldDescend = true;
      }
    });

    if (shouldDescend) {
      invaderDirectionRef.current *= -1;
      activeInvaders.forEach(invader => {
        invader.y += 20;
      });
    }

    // Invader shooting
    if (activeInvaders.length > 0 && timestamp - invaderLastShotRef.current > 2000 / (level * 0.5 + 1)) {
      const shooter = activeInvaders[Math.floor(Math.random() * activeInvaders.length)];
      bulletsRef.current.push({
        x: shooter.x + shooter.width / 2 - 2,
        y: shooter.y + shooter.height,
        width: 4,
        height: 10,
        velocityY: 3,
        isPlayerBullet: false,
        active: true,
        color: '#ff6b6b'
      });
      invaderLastShotRef.current = timestamp;
    }

    // Update bullets
    bulletsRef.current = bulletsRef.current.filter(bullet => {
      if (!bullet.active) return false;
      
      bullet.y += bullet.velocityY!;
      if (bullet.velocityX) {
        bullet.x += bullet.velocityX;
      }
      
      // Check collision with invaders (player bullets)
      if (bullet.isPlayerBullet) {
        for (const invader of invadersRef.current) {
          if (invader.active &&
              bullet.x < invader.x + invader.width &&
              bullet.x + bullet.width > invader.x &&
              bullet.y < invader.y + invader.height &&
              bullet.y + bullet.height > invader.y) {
            invader.active = false;
            bullet.active = false;
            setScore(prev => prev + invader.points);
            createExplosion(invader.x + invader.width / 2, invader.y + invader.height / 2, invader.color!);
            break;
          }
        }
      }
      
      // Check collision with player (enemy bullets)
      if (!bullet.isPlayerBullet &&
          bullet.x < player.x + player.width &&
          bullet.x + bullet.width > player.x &&
          bullet.y < player.y + player.height &&
          bullet.y + bullet.height > player.y) {
        bullet.active = false;
        setLives(prev => {
          const newLives = prev - 1;
          if (newLives <= 0) {
            setGameState('gameOver');
            // Update high score
            setHighScore(prev => {
              const newHigh = Math.max(prev, score);
              localStorage.setItem('cosmicDefenseHighScore', newHigh.toString());
              return newHigh;
            });
          }
          return newLives;
        });
        createExplosion(player.x + player.width / 2, player.y + player.height / 2, '#ff0000');
      }
      
      return bullet.active && bullet.y > -10 && bullet.y < canvas.height + 10;
    });

    // Update particles
    particlesRef.current = particlesRef.current.filter(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life -= 0.02;
      particle.vx *= 0.98;
      particle.vy *= 0.98;
      return particle.life > 0;
    });

    // Check level complete
    if (activeInvaders.length === 0) {
      setLevel(prev => prev + 1);
      initGame();
    }

    // Draw player
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(player.x, player.y, player.width, 5);
    ctx.fillRect(player.x + 10, player.y + 5, 20, 10);
    ctx.fillRect(player.x + 15, player.y + 15, 10, 10);
    ctx.fillRect(player.x + 18, player.y - 5, 4, 5);
    
    // Add glow effect
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00ffff';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.shadowBlur = 0;

    // Draw invaders
    invadersRef.current.forEach(invader => {
      if (!invader.active) return;
      
      ctx.fillStyle = invader.color!;
      ctx.shadowBlur = 8;
      ctx.shadowColor = invader.color!;
      
      // Simple invader shape
      const wobble = Math.sin(timestamp * 0.003) * 2;
      ctx.fillRect(invader.x + 5, invader.y, 20, 10);
      ctx.fillRect(invader.x, invader.y + 10, 30, 10);
      ctx.fillRect(invader.x + 5 + wobble, invader.y + 20, 5, 4);
      ctx.fillRect(invader.x + 20 - wobble, invader.y + 20, 5, 4);
      
      ctx.shadowBlur = 0;
    });

    // Draw bullets
    bulletsRef.current.forEach(bullet => {
      if (!bullet.active) return;
      
      if (bullet.isPlayerBullet) {
        ctx.fillStyle = '#00ff00';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00ff00';
      } else {
        ctx.fillStyle = bullet.color || '#ff6b6b';
        ctx.shadowBlur = 10;
        ctx.shadowColor = bullet.color || '#ff6b6b';
      }
      
      ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
      ctx.shadowBlur = 0;
    });

    // Draw particles
    particlesRef.current.forEach(particle => {
      ctx.fillStyle = particle.color;
      ctx.globalAlpha = particle.life;
      ctx.fillRect(particle.x - 2, particle.y - 2, 4, 4);
      ctx.globalAlpha = 1;
    });

    // Draw UI elements
    ctx.restore(); // Restore from screen shake
    
    // Draw combo meter
    if (combo > 0) {
      ctx.fillStyle = `hsla(${combo * 36}, 100%, 50%, 0.8)`;
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`${combo}x COMBO!`, 10, 30);
    }
    
    // Draw power-up timer
    if (powerUpActive && powerUpTimer > 0) {
      setPowerUpTimer(prev => prev - 1);
      if (powerUpTimer <= 0) {
        setPowerUpActive(null);
      }
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = '16px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(`Power: ${powerUpActive} (${Math.ceil(powerUpTimer / 60)}s)`, canvas.width - 10, 30);
    }
    
    // Draw level indicator
    const formation = getFormation(level);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Level ${level} - ${formation.toUpperCase()} Formation`, canvas.width / 2, canvas.height - 10);
    
    requestRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, score, touchPosition, isShooting, initGame, combo, powerUpActive, powerUpTimer, level, getFormation, screenShake]);

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

  // Handle canvas resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const container = canvas.parentElement;
      if (!container) return;
      
      const { width, height } = container.getBoundingClientRect();
      const aspectRatio = 4 / 3;
      
      if (width / height > aspectRatio) {
        canvas.height = height;
        canvas.width = height * aspectRatio;
      } else {
        canvas.width = width;
        canvas.height = width / aspectRatio;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Touch control handlers
  const handleTouchMoveButton = useCallback((direction: 'left' | 'right') => {
    if (gameState !== 'playing' || !playerRef.current) return;
    const moveSpeed = 8;
    if (direction === 'left') {
      playerRef.current.x = Math.max(20, playerRef.current.x - moveSpeed);
    } else {
      playerRef.current.x = Math.min((canvasRef.current?.width || 800) - 60, playerRef.current.x + moveSpeed);
    }
  }, [gameState]);

  const handleTouchShootButton = useCallback(() => {
    if (gameState !== 'playing') return;
    const currentTime = Date.now();
    const shotDelay = powerUpActive === 'rapidFire' ? 100 : 300;
    
    if (currentTime - lastShotRef.current > shotDelay && playerRef.current) {
      const player = playerRef.current;
      
      if (powerUpActive === 'tripleShot') {
        // Triple shot
        bulletsRef.current.push(
          { x: player.x + player.width / 2 - 2, y: player.y, width: 4, height: 10, velocityY: -10, isPlayerBullet: true, active: true },
          { x: player.x + player.width / 2 - 2 - 15, y: player.y, width: 4, height: 10, velocityY: -10, isPlayerBullet: true, active: true },
          { x: player.x + player.width / 2 - 2 + 15, y: player.y, width: 4, height: 10, velocityY: -10, isPlayerBullet: true, active: true }
        );
      } else {
        // Normal shot
        bulletsRef.current.push({
          x: player.x + player.width / 2 - 2,
          y: player.y,
          width: 4,
          height: 10,
          velocityY: -10,
          isPlayerBullet: true,
          active: true
        });
      }
      
      lastShotRef.current = currentTime;
    }
  }, [gameState, powerUpActive]);

  // Clear touch interval on unmount
  useEffect(() => {
    return () => {
      if (touchIntervalRef.current) {
        clearInterval(touchIntervalRef.current);
      }
    };
  }, []);

  return (
    <ResponsiveGameWrapper baseWidth={800} baseHeight={600} gameName="Cosmic Defense">
      <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-indigo-900 via-purple-900 to-black p-2 md:p-4">
      {/* Game Header */}
      <div className="w-full max-w-4xl mb-4 flex justify-between items-center text-white">
        <div className="flex gap-6">
          <div className="text-lg">
            Score: <span className="text-2xl font-bold text-cyan-400">{score}</span>
          </div>
          <div className="text-lg">
            Level: <span className="text-2xl font-bold text-green-400">{level}</span>
          </div>
        </div>
        <div className="flex gap-6">
          <div className="text-lg">
            Lives: <span className="text-2xl font-bold text-red-400">{lives}</span>
          </div>
          <div className="text-lg">
            High: <span className="text-2xl font-bold text-yellow-400">{highScore}</span>
          </div>
        </div>
      </div>

      {/* Game Canvas Container */}
      <div className="relative w-full max-w-4xl aspect-[4/3] bg-black rounded-lg overflow-hidden shadow-2xl border-2 border-purple-500">
        <canvas
          ref={canvasRef}
          className="w-full h-full touch-none"
          style={{ imageRendering: 'pixelated' }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
        
        {/* Game Overlays */}
        {gameState === 'menu' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white"
          >
            <h1 className="text-6xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">
              COSMIC DEFENSE
            </h1>
            <p className="text-xl mb-8">Defend Earth from the alien invasion!</p>
            <div className="space-y-4 text-center">
              <p className="text-lg">
                {isMobile ? 'Touch to move • Tap upper screen to shoot' : 'Arrow Keys/WASD to move • Space to shoot'}
              </p>
              <button
                onClick={() => {
                  setGameState('playing');
                  initGame();
                }}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-xl font-bold hover:scale-105 transition-transform"
              >
                START GAME
              </button>
            </div>
          </motion.div>
        )}

        {gameState === 'paused' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white"
          >
            <h2 className="text-4xl font-bold mb-8">PAUSED</h2>
            <p className="text-xl">Press ESC to continue</p>
          </motion.div>
        )}

        {gameState === 'gameOver' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white"
          >
            <h2 className="text-5xl font-bold mb-4 text-red-500">GAME OVER</h2>
            <p className="text-2xl mb-2">Final Score: {score}</p>
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

      {/* Mobile Touch Controls Hint */}
      {isMobile && gameState === 'playing' && (
        <div className="mt-4 text-white text-center">
          <p className="text-sm opacity-75">Use controls below to play</p>
        </div>
      )}

      {/* Desktop Controls */}
      {!isMobile && (
        <div className="mt-4 text-white text-center">
          <p className="text-sm opacity-75">
            Arrow Keys/WASD: Move • Space: Shoot • ESC: Pause
          </p>
        </div>
      )}
      
      {/* Touch Controls */}
      {isMobile && gameState !== 'menu' && gameState !== 'gameOver' && (
        <TouchControls
          variant="cosmic"
          onLeft={() => {
            if (touchIntervalRef.current) clearInterval(touchIntervalRef.current);
            handleTouchMoveButton('left');
            touchIntervalRef.current = setInterval(() => handleTouchMoveButton('left'), 50);
          }}
          onRight={() => {
            if (touchIntervalRef.current) clearInterval(touchIntervalRef.current);
            handleTouchMoveButton('right');
            touchIntervalRef.current = setInterval(() => handleTouchMoveButton('right'), 50);
          }}
          onAction={() => {
            handleTouchShootButton();
            if (touchIntervalRef.current) clearInterval(touchIntervalRef.current);
            touchIntervalRef.current = setInterval(() => handleTouchShootButton(), 100);
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
          showUp={false}
          showDown={false}
        />
      )}
    </div>
    </ResponsiveGameWrapper>
  );
};

export default CosmicDefense;