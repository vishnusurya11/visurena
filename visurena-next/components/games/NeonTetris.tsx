import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import ResponsiveGameWrapper from '../ResponsiveGameWrapper';
import TouchControls from '../TouchControls';

// Tetris piece shapes
const PIECES = {
  I: { shape: [[1,1,1,1]], color: '#00ffff' },
  O: { shape: [[1,1],[1,1]], color: '#ffff00' },
  T: { shape: [[0,1,0],[1,1,1]], color: '#ff00ff' },
  S: { shape: [[0,1,1],[1,1,0]], color: '#00ff00' },
  Z: { shape: [[1,1,0],[0,1,1]], color: '#ff0000' },
  J: { shape: [[1,0,0],[1,1,1]], color: '#0000ff' },
  L: { shape: [[0,0,1],[1,1,1]], color: '#ff8800' }
};

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BLOCK_SIZE = 30;

interface Piece {
  type: keyof typeof PIECES;
  x: number;
  y: number;
  shape: number[][];
  color: string;
}

const NeonTetris: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const lastDropRef = useRef(0);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameOver'>('menu');
  const [highScore, setHighScore] = useState(0);
  const [nextPiece, setNextPiece] = useState<keyof typeof PIECES>('I');
  const [heldPiece, setHeldPiece] = useState<keyof typeof PIECES | null>(null);
  const [canHold, setCanHold] = useState(true);

  // Game board and piece refs
  const boardRef = useRef<number[][]>(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0)));
  const boardColorsRef = useRef<string[][]>(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill('')));
  const currentPieceRef = useRef<Piece | null>(null);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const particlesRef = useRef<{x: number, y: number, vx: number, vy: number, color: string, life: number}[]>([]);
  const touchIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Initialize game
  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    const saved = localStorage.getItem('neonTetrisHighScore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  // Create new piece
  const createPiece = useCallback((type?: keyof typeof PIECES): Piece => {
    const pieceType = type || (Object.keys(PIECES) as (keyof typeof PIECES)[])[Math.floor(Math.random() * 7)];
    const piece = PIECES[pieceType];
    return {
      type: pieceType,
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(piece.shape[0].length / 2),
      y: 0,
      shape: piece.shape,
      color: piece.color
    };
  }, []);

  // Initialize game
  const initGame = useCallback(() => {
    boardRef.current = Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0));
    boardColorsRef.current = Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(''));
    currentPieceRef.current = createPiece();
    setNextPiece((Object.keys(PIECES) as (keyof typeof PIECES)[])[Math.floor(Math.random() * 7)]);
    setScore(0);
    setLines(0);
    setLevel(1);
    setHeldPiece(null);
    setCanHold(true);
    particlesRef.current = [];
  }, [createPiece]);

  // Check collision
  const checkCollision = useCallback((piece: Piece, board: number[][]): boolean => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = piece.x + x;
          const newY = piece.y + y;
          
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
            return true;
          }
          
          if (newY >= 0 && board[newY][newX]) {
            return true;
          }
        }
      }
    }
    return false;
  }, []);

  // Rotate piece
  const rotatePiece = useCallback((piece: Piece): number[][] => {
    const rotated = piece.shape[0].map((_, i) =>
      piece.shape.map(row => row[i]).reverse()
    );
    return rotated;
  }, []);

  // Lock piece to board
  const lockPiece = useCallback((piece: Piece) => {
    piece.shape.forEach((row, y) => {
      row.forEach((val, x) => {
        if (val) {
          const boardY = piece.y + y;
          const boardX = piece.x + x;
          if (boardY >= 0) {
            boardRef.current[boardY][boardX] = 1;
            boardColorsRef.current[boardY][boardX] = piece.color;
          }
        }
      });
    });
  }, []);

  // Clear completed lines
  const clearLines = useCallback(() => {
    let linesCleared = 0;
    
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      if (boardRef.current[y].every(cell => cell === 1)) {
        // Create particles for cleared line
        for (let x = 0; x < BOARD_WIDTH; x++) {
          for (let i = 0; i < 5; i++) {
            particlesRef.current.push({
              x: x * BLOCK_SIZE + BLOCK_SIZE / 2,
              y: y * BLOCK_SIZE + BLOCK_SIZE / 2,
              vx: (Math.random() - 0.5) * 5,
              vy: (Math.random() - 0.5) * 5,
              color: boardColorsRef.current[y][x],
              life: 1
            });
          }
        }
        
        boardRef.current.splice(y, 1);
        boardRef.current.unshift(Array(BOARD_WIDTH).fill(0));
        boardColorsRef.current.splice(y, 1);
        boardColorsRef.current.unshift(Array(BOARD_WIDTH).fill(''));
        linesCleared++;
        y++; // Check same row again
      }
    }
    
    if (linesCleared > 0) {
      const points = [0, 100, 300, 500, 800][linesCleared] * level;
      setScore(prev => prev + points);
      setLines(prev => {
        const newLines = prev + linesCleared;
        setLevel(Math.floor(newLines / 10) + 1);
        return newLines;
      });
    }
  }, [level]);

  // Hold piece
  const holdPiece = useCallback(() => {
    if (!canHold || !currentPieceRef.current) return;
    
    const current = currentPieceRef.current.type;
    if (heldPiece) {
      currentPieceRef.current = createPiece(heldPiece);
    } else {
      currentPieceRef.current = createPiece(nextPiece);
      setNextPiece((Object.keys(PIECES) as (keyof typeof PIECES)[])[Math.floor(Math.random() * 7)]);
    }
    setHeldPiece(current);
    setCanHold(false);
  }, [canHold, heldPiece, nextPiece, createPiece]);

  // Get ghost piece position
  const getGhostPieceY = useCallback((piece: Piece): number => {
    let ghostY = piece.y;
    while (!checkCollision({ ...piece, y: ghostY + 1 }, boardRef.current)) {
      ghostY++;
    }
    return ghostY;
  }, [checkCollision]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'c', 'Escape'].includes(e.key)) {
        e.preventDefault();
      }
      
      keysRef.current[e.key] = true;
      
      if (gameState === 'playing' && currentPieceRef.current) {
        const piece = currentPieceRef.current;
        
        if (e.key === 'ArrowLeft') {
          const moved = { ...piece, x: piece.x - 1 };
          if (!checkCollision(moved, boardRef.current)) {
            currentPieceRef.current = moved;
          }
        } else if (e.key === 'ArrowRight') {
          const moved = { ...piece, x: piece.x + 1 };
          if (!checkCollision(moved, boardRef.current)) {
            currentPieceRef.current = moved;
          }
        } else if (e.key === 'ArrowUp' || e.key === 'x') {
          const rotated = rotatePiece(piece);
          const rotatedPiece = { ...piece, shape: rotated };
          if (!checkCollision(rotatedPiece, boardRef.current)) {
            currentPieceRef.current = rotatedPiece;
          }
        } else if (e.key === 'ArrowDown') {
          const moved = { ...piece, y: piece.y + 1 };
          if (!checkCollision(moved, boardRef.current)) {
            currentPieceRef.current = moved;
            setScore(prev => prev + 1);
          }
        } else if (e.key === ' ') {
          // Hard drop
          const ghostY = getGhostPieceY(piece);
          const dropDistance = ghostY - piece.y;
          currentPieceRef.current = { ...piece, y: ghostY };
          setScore(prev => prev + dropDistance * 2);
          lastDropRef.current = 0; // Force immediate lock
        } else if (e.key === 'c') {
          holdPiece();
        }
      }
      
      if (e.key === 'Enter') {
        if (gameState === 'menu') {
          setGameState('playing');
          initGame();
        } else if (gameState === 'gameOver') {
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

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, checkCollision, rotatePiece, initGame, holdPiece, getGhostPieceY]);

  // Game loop
  const gameLoop = useCallback((timestamp: number) => {
    if (gameState !== 'playing') return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear canvas
    ctx.fillStyle = 'rgba(10, 10, 30, 0.95)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= BOARD_WIDTH; x++) {
      ctx.beginPath();
      ctx.moveTo(x * BLOCK_SIZE, 0);
      ctx.lineTo(x * BLOCK_SIZE, BOARD_HEIGHT * BLOCK_SIZE);
      ctx.stroke();
    }
    for (let y = 0; y <= BOARD_HEIGHT; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * BLOCK_SIZE);
      ctx.lineTo(BOARD_WIDTH * BLOCK_SIZE, y * BLOCK_SIZE);
      ctx.stroke();
    }

    // Drop piece
    const dropSpeed = Math.max(50, 1000 - (level - 1) * 100);
    if (timestamp - lastDropRef.current > dropSpeed) {
      if (currentPieceRef.current) {
        const moved = { ...currentPieceRef.current, y: currentPieceRef.current.y + 1 };
        if (!checkCollision(moved, boardRef.current)) {
          currentPieceRef.current = moved;
        } else {
          lockPiece(currentPieceRef.current);
          clearLines();
          currentPieceRef.current = createPiece(nextPiece);
          setNextPiece((Object.keys(PIECES) as (keyof typeof PIECES)[])[Math.floor(Math.random() * 7)]);
          setCanHold(true);
          
          if (checkCollision(currentPieceRef.current, boardRef.current)) {
            setGameState('gameOver');
            if (score > highScore) {
              setHighScore(score);
              localStorage.setItem('neonTetrisHighScore', score.toString());
            }
          }
        }
      }
      lastDropRef.current = timestamp;
    }

    // Draw board
    boardRef.current.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          const color = boardColorsRef.current[y][x];
          
          // Draw block with gradient
          const gradient = ctx.createLinearGradient(
            x * BLOCK_SIZE, y * BLOCK_SIZE,
            (x + 1) * BLOCK_SIZE, (y + 1) * BLOCK_SIZE
          );
          gradient.addColorStop(0, color);
          gradient.addColorStop(1, color + '88');
          
          ctx.fillStyle = gradient;
          ctx.fillRect(x * BLOCK_SIZE + 1, y * BLOCK_SIZE + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
          
          // Add glow
          ctx.shadowBlur = 10;
          ctx.shadowColor = color;
          ctx.strokeStyle = color;
          ctx.strokeRect(x * BLOCK_SIZE + 1, y * BLOCK_SIZE + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
          ctx.shadowBlur = 0;
        }
      });
    });

    // Draw ghost piece
    if (currentPieceRef.current) {
      const ghostY = getGhostPieceY(currentPieceRef.current);
      const ghost = { ...currentPieceRef.current, y: ghostY };
      
      ghost.shape.forEach((row, y) => {
        row.forEach((val, x) => {
          if (val) {
            ctx.fillStyle = ghost.color + '33';
            ctx.fillRect(
              (ghost.x + x) * BLOCK_SIZE + 1,
              (ghost.y + y) * BLOCK_SIZE + 1,
              BLOCK_SIZE - 2,
              BLOCK_SIZE - 2
            );
          }
        });
      });
    }

    // Draw current piece
    if (currentPieceRef.current) {
      const piece = currentPieceRef.current;
      piece.shape.forEach((row, y) => {
        row.forEach((val, x) => {
          if (val) {
            const blockX = (piece.x + x) * BLOCK_SIZE;
            const blockY = (piece.y + y) * BLOCK_SIZE;
            
            // Draw block with gradient
            const gradient = ctx.createLinearGradient(
              blockX, blockY,
              blockX + BLOCK_SIZE, blockY + BLOCK_SIZE
            );
            gradient.addColorStop(0, piece.color);
            gradient.addColorStop(1, piece.color + '88');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(blockX + 1, blockY + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
            
            // Add glow
            ctx.shadowBlur = 15;
            ctx.shadowColor = piece.color;
            ctx.strokeStyle = piece.color;
            ctx.strokeRect(blockX + 1, blockY + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
            ctx.shadowBlur = 0;
          }
        });
      });
    }

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

    requestRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, level, score, highScore, checkCollision, lockPiece, clearLines, createPiece, nextPiece, getGhostPieceY]);

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

  // Draw next/held pieces
  const drawPreviewPiece = (ctx: CanvasRenderingContext2D, piece: keyof typeof PIECES, x: number, y: number, label: string) => {
    const p = PIECES[piece];
    
    // Draw label
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '14px Arial';
    ctx.fillText(label, x, y - 10);
    
    // Draw background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(x - 10, y, 100, 80);
    
    // Draw piece
    const offsetX = x + 20;
    const offsetY = y + 20;
    const scale = 20;
    
    p.shape.forEach((row, py) => {
      row.forEach((val, px) => {
        if (val) {
          ctx.fillStyle = p.color;
          ctx.fillRect(offsetX + px * scale, offsetY + py * scale, scale - 2, scale - 2);
        }
      });
    });
  };

  // Update preview canvases
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || gameState !== 'playing') return;
    
    const interval = setInterval(() => {
      // Clear preview area
      ctx.fillStyle = 'rgba(10, 10, 30, 0.95)';
      ctx.fillRect(BOARD_WIDTH * BLOCK_SIZE, 0, 200, canvas!.height);
      
      // Draw next piece
      drawPreviewPiece(ctx, nextPiece, BOARD_WIDTH * BLOCK_SIZE + 20, 50, 'NEXT');
      
      // Draw held piece
      if (heldPiece) {
        drawPreviewPiece(ctx, heldPiece, BOARD_WIDTH * BLOCK_SIZE + 20, 180, 'HOLD (C)');
      }
      
      // Draw stats
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = '16px Arial';
      ctx.fillText(`Score: ${score}`, BOARD_WIDTH * BLOCK_SIZE + 20, 320);
      ctx.fillText(`Lines: ${lines}`, BOARD_WIDTH * BLOCK_SIZE + 20, 350);
      ctx.fillText(`Level: ${level}`, BOARD_WIDTH * BLOCK_SIZE + 20, 380);
      ctx.fillText(`High: ${highScore}`, BOARD_WIDTH * BLOCK_SIZE + 20, 410);
    }, 100);
    
    return () => clearInterval(interval);
  }, [gameState, nextPiece, heldPiece, score, lines, level, highScore]);

  // Touch control handlers
  const handleTouchMove = useCallback((direction: 'left' | 'right') => {
    if (gameState !== 'playing' || !currentPieceRef.current) return;
    const piece = currentPieceRef.current;
    const dx = direction === 'left' ? -1 : 1;
    const moved = { ...piece, x: piece.x + dx };
    if (!checkCollision(moved, boardRef.current)) {
      currentPieceRef.current = moved;
    }
  }, [gameState, checkCollision]);

  const handleTouchRotate = useCallback(() => {
    if (gameState !== 'playing' || !currentPieceRef.current) return;
    const piece = currentPieceRef.current;
    const rotated = rotatePiece(piece);
    const rotatedPiece = { ...piece, shape: rotated };
    if (!checkCollision(rotatedPiece, boardRef.current)) {
      currentPieceRef.current = rotatedPiece;
    }
  }, [gameState, checkCollision, rotatePiece]);

  const handleTouchDrop = useCallback(() => {
    if (gameState !== 'playing' || !currentPieceRef.current) return;
    const piece = currentPieceRef.current;
    const ghostY = getGhostPieceY(piece);
    const dropDistance = ghostY - piece.y;
    currentPieceRef.current = { ...piece, y: ghostY };
    setScore(prev => prev + 10 * dropDistance);
    lockPiece(currentPieceRef.current);
    currentPieceRef.current = null;
  }, [gameState, getGhostPieceY, lockPiece]);

  const handleTouchHold = useCallback(() => {
    if (gameState !== 'playing' || !currentPieceRef.current || !canHold) return;
    holdPiece();
  }, [gameState, canHold, holdPiece]);

  // Clear interval on unmount
  useEffect(() => {
    return () => {
      if (touchIntervalRef.current) {
        clearInterval(touchIntervalRef.current);
      }
    };
  }, []);

  return (
    <ResponsiveGameWrapper baseWidth={BOARD_WIDTH * BLOCK_SIZE + 200} baseHeight={BOARD_HEIGHT * BLOCK_SIZE} gameName="Neon Tetris">
      <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-purple-900 via-blue-900 to-black">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={BOARD_WIDTH * BLOCK_SIZE + 200}
          height={BOARD_HEIGHT * BLOCK_SIZE}
          className="border-2 border-purple-500 rounded-lg shadow-2xl touch-none"
          style={{ imageRendering: 'crisp-edges' }}
        />
        
        {/* Game Overlays */}
        {gameState === 'menu' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white rounded-lg"
          >
            <h1 className="text-6xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
              NEON TETRIS
            </h1>
            <p className="text-xl mb-8">Stack blocks and clear lines!</p>
            <div className="space-y-2 text-center mb-8">
              <p>← → Move • ↑/X Rotate • ↓ Soft Drop</p>
              <p>Space: Hard Drop • C: Hold • ESC: Pause</p>
            </div>
            <button
              onClick={() => {
                setGameState('playing');
                initGame();
              }}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-lg text-xl font-bold hover:scale-105 transition-transform"
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
            <p className="text-xl mb-2">Lines: {lines}</p>
            {score >= highScore && score > 0 && (
              <p className="text-xl text-yellow-400 mb-4">NEW HIGH SCORE!</p>
            )}
            <button
              onClick={() => {
                setGameState('playing');
                initGame();
              }}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-lg text-xl font-bold hover:scale-105 transition-transform mt-4"
            >
              PLAY AGAIN
            </button>
          </motion.div>
        )}
      </div>
      
      {/* Touch Controls */}
      {isMobile && gameState === 'playing' && (
        <>
          <TouchControls
            variant="tetris"
            onLeft={() => {
              handleTouchMove('left');
            }}
            onRight={() => {
              handleTouchMove('right');
            }}
            onDown={() => {
              if (touchIntervalRef.current) clearInterval(touchIntervalRef.current);
              if (gameState === 'playing' && currentPieceRef.current) {
                const piece = currentPieceRef.current;
                const moved = { ...piece, y: piece.y + 1 };
                if (!checkCollision(moved, boardRef.current)) {
                  currentPieceRef.current = moved;
                  setScore(prev => prev + 1);
                }
              }
              touchIntervalRef.current = setInterval(() => {
                if (gameState === 'playing' && currentPieceRef.current) {
                  const piece = currentPieceRef.current;
                  const moved = { ...piece, y: piece.y + 1 };
                  if (!checkCollision(moved, boardRef.current)) {
                    currentPieceRef.current = moved;
                    setScore(prev => prev + 1);
                  }
                }
              }, 50);
            }}
            onAction={handleTouchRotate}
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
          />
          {/* Hold button */}
          <button
            onTouchStart={handleTouchHold}
            className="fixed bottom-8 left-4 z-50 md:hidden w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg opacity-70 active:opacity-100 font-bold text-white text-sm"
          >
            HOLD
          </button>
          {/* Drop button */}
          <button
            onTouchStart={handleTouchDrop}
            className="fixed bottom-28 right-4 z-50 md:hidden w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg opacity-70 active:opacity-100 font-bold text-white text-sm"
          >
            DROP
          </button>
        </>
      )}
    </div>
    </ResponsiveGameWrapper>
  );
};

export default NeonTetris;