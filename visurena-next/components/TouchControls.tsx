import React from 'react';

interface TouchControlsProps {
  onLeft?: () => void;
  onRight?: () => void;
  onUp?: () => void;
  onDown?: () => void;
  onAction?: () => void;
  onPause?: () => void;
  onRelease?: () => void;
  showDirectional?: boolean;
  showAction?: boolean;
  showPause?: boolean;
  variant?: 'cosmic' | 'tetris' | 'snake' | 'pong' | 'brick' | 'missile';
}

const TouchControls: React.FC<TouchControlsProps> = ({
  onLeft,
  onRight,
  onUp,
  onDown,
  onAction,
  onPause,
  onRelease,
  showDirectional = true,
  showAction = true,
  showPause = true,
  variant = 'cosmic'
}) => {
  const colors = {
    cosmic: 'from-cyan-500 to-blue-500',
    tetris: 'from-purple-500 to-pink-500',
    snake: 'from-green-500 to-emerald-500',
    pong: 'from-white to-gray-300',
    brick: 'from-orange-500 to-red-500',
    missile: 'from-red-500 to-orange-500'
  };

  const buttonColor = colors[variant];

  return (
    <>
      {/* Directional Controls */}
      {showDirectional && (
        <div className="fixed bottom-4 left-4 z-50 md:hidden">
          <div className="relative w-32 h-32">
            {/* Up */}
            {onUp && (
              <button
                onTouchStart={onUp}
                onTouchEnd={onRelease}
                className={`absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 bg-gradient-to-br ${buttonColor} rounded-lg opacity-70 active:opacity-100`}
              >
                ▲
              </button>
            )}
            {/* Left */}
            {onLeft && (
              <button
                onTouchStart={onLeft}
                onTouchEnd={onRelease}
                className={`absolute top-1/2 left-0 -translate-y-1/2 w-10 h-10 bg-gradient-to-br ${buttonColor} rounded-lg opacity-70 active:opacity-100`}
              >
                ◄
              </button>
            )}
            {/* Right */}
            {onRight && (
              <button
                onTouchStart={onRight}
                onTouchEnd={onRelease}
                className={`absolute top-1/2 right-0 -translate-y-1/2 w-10 h-10 bg-gradient-to-br ${buttonColor} rounded-lg opacity-70 active:opacity-100`}
              >
                ►
              </button>
            )}
            {/* Down */}
            {onDown && (
              <button
                onTouchStart={onDown}
                onTouchEnd={onRelease}
                className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-10 bg-gradient-to-br ${buttonColor} rounded-lg opacity-70 active:opacity-100`}
              >
                ▼
              </button>
            )}
          </div>
        </div>
      )}

      {/* Action Button */}
      {showAction && onAction && (
        <button
          onTouchStart={onAction}
          onTouchEnd={onRelease}
          className={`fixed bottom-8 right-4 z-50 md:hidden w-16 h-16 bg-gradient-to-br ${buttonColor} rounded-full opacity-70 active:opacity-100 font-bold text-white text-lg`}
        >
          FIRE
        </button>
      )}

      {/* Pause Button */}
      {showPause && onPause && (
        <button
          onTouchStart={onPause}
          className={`fixed top-4 right-4 z-50 md:hidden w-12 h-12 bg-gray-800 bg-opacity-70 rounded-lg opacity-70 active:opacity-100 text-white`}
        >
          ⏸
        </button>
      )}
    </>
  );
};

export default TouchControls;