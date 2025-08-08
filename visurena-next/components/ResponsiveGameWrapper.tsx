import React, { useEffect, useRef, useState } from 'react';

interface ResponsiveGameWrapperProps {
  children: React.ReactNode;
  baseWidth: number;
  baseHeight: number;
  gameName: string;
}

const ResponsiveGameWrapper: React.FC<ResponsiveGameWrapperProps> = ({
  children,
  baseWidth,
  baseHeight,
  gameName
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [dimensions, setDimensions] = useState({ width: baseWidth, height: baseHeight });

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      
      const container = containerRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      
      // Calculate scale to fit container while maintaining aspect ratio
      const scaleX = containerWidth / baseWidth;
      const scaleY = containerHeight / baseHeight;
      const newScale = Math.min(scaleX, scaleY, 1); // Never scale above 1
      
      setScale(newScale);
      setDimensions({
        width: baseWidth * newScale,
        height: baseHeight * newScale
      });
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    
    // Check for orientation change on mobile
    window.addEventListener('orientationchange', () => {
      setTimeout(updateScale, 100);
    });

    return () => {
      window.removeEventListener('resize', updateScale);
      window.removeEventListener('orientationchange', updateScale);
    };
  }, [baseWidth, baseHeight]);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full flex items-center justify-center overflow-hidden bg-black"
    >
      <div 
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          width: baseWidth,
          height: baseHeight
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default ResponsiveGameWrapper;