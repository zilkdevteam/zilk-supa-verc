'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';

interface Prize {
  name: string;
  color: string;
}

const prizes: Prize[] = [
  { name: "Grand Prize", color: "#FF6B6B" },
  { name: "Free Spin", color: "#4ECDC4" },
  { name: "Try Again", color: "#95A5A6" },
  { name: "Small Prize", color: "#45B7D1" },
  { name: "Medium Prize", color: "#96CEB4" },
  { name: "Better Luck", color: "#FFEEAD" },
  { name: "Bonus Spin", color: "#D4A5A5" },
  { name: "Mini Prize", color: "#9B59B6" }
];

export default function SpinPage() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [currentPrize, setCurrentPrize] = useState('');

  const spinWheel = () => {
    if (!isSpinning) {
      setIsSpinning(true);
      // Random number of full rotations (3-5) plus random degrees
      const spinDegrees = (Math.floor(Math.random() * 3) + 3) * 360 + Math.random() * 360;
      const newRotation = rotation + spinDegrees;
      
      setRotation(newRotation);
      
      // Calculate winning prize after spin
      setTimeout(() => {
        const normalizedRotation = newRotation % 360;
        const prizeIndex = Math.floor((360 - (normalizedRotation % 360)) / (360 / prizes.length));
        setCurrentPrize(prizes[prizeIndex].name);
        setIsSpinning(false);
      }, 3000);
    }
  };

  const sliceDegrees = 360 / prizes.length;

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-retro-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col items-center gap-8">
            <h1 className="text-3xl font-display text-retro-dark text-center">
              Spin to Win!
            </h1>

            {/* Wheel Container */}
            <div className="relative">
              {/* Static pointer triangle */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-20">
                <div 
                  className="w-8 h-8 bg-retro-primary"
                  style={{
                    clipPath: 'polygon(50% 100%, 0% 0%, 100% 0%)'
                  }} 
                />
              </div>

              {/* Wheel */}
              <div 
                className="relative w-96 h-96"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: isSpinning ? 'transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none'
                }}
              >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {prizes.map((prize, index) => {
                    const startAngle = index * sliceDegrees;
                    const endAngle = (index + 1) * sliceDegrees;
                    
                    // Calculate the path for the slice
                    const startRad = (startAngle - 90) * Math.PI / 180;
                    const endRad = (endAngle - 90) * Math.PI / 180;
                    
                    const x1 = 50 + 50 * Math.cos(startRad);
                    const y1 = 50 + 50 * Math.sin(startRad);
                    const x2 = 50 + 50 * Math.cos(endRad);
                    const y2 = 50 + 50 * Math.sin(endRad);
                    
                    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
                    
                    // Calculate text position (closer to outer edge)
                    const textAngle = (startAngle + endAngle) / 2;
                    const textRad = (textAngle - 90) * Math.PI / 180;
                    const textX = 50 + 35 * Math.cos(textRad);
                    const textY = 50 + 35 * Math.sin(textRad);
                    
                    const pathData = `
                      M 50 50
                      L ${x1} ${y1}
                      A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2}
                      Z
                    `;

                    return (
                      <g key={index}>
                        <path
                          d={pathData}
                          fill={prize.color}
                          stroke="white"
                          strokeWidth="0.5"
                        />
                        <text
                          x={textX}
                          y={textY}
                          transform={`rotate(${textAngle}, ${textX}, ${textY})`}
                          textAnchor="middle"
                          fontSize="3.5"
                          fill="white"
                          style={{ userSelect: 'none' }}
                        >
                          {prize.name}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Center point */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg z-10 border-2 border-retro-dark" />
              </div>
            </div>

            {/* Controls */}
            <div className="text-center space-y-4">
              <button
                onClick={spinWheel}
                disabled={isSpinning}
                className={`btn-primary text-lg font-bold px-8 py-3 rounded-full ${
                  isSpinning ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSpinning ? 'Spinning...' : 'Spin the Wheel!'}
              </button>

              {currentPrize && !isSpinning && (
                <div className="mt-6 p-6 bg-retro-accent/10 rounded-lg border-2 border-retro-accent/20">
                  <h2 className="text-xl font-display text-retro-dark mb-2">
                    Congratulations!
                  </h2>
                  <p className="text-retro-dark font-bold">
                    You landed on: {currentPrize}!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
} 