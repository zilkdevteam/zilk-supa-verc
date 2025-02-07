'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';

interface Prize {
  name: string;
  color: string;
  discount_amount: number;
  discount_type: 'percentage' | 'fixed';
}

const generatePrizes = (dealTitle: string, dealDiscount: number, dealType: 'percentage' | 'fixed'): Prize[] => {
  return [
    { 
      name: dealTitle, 
      color: "#FF6B6B",
      discount_amount: dealDiscount,
      discount_type: dealType
    },
    { 
      name: "Try Again", 
      color: "#95A5A6",
      discount_amount: 0,
      discount_type: 'fixed'
    },
    { 
      name: `${Math.floor(dealDiscount * 0.5)}${dealType === 'percentage' ? '%' : '$'} Off`, 
      color: "#4ECDC4",
      discount_amount: Math.floor(dealDiscount * 0.5),
      discount_type: dealType
    },
    { 
      name: "Better Luck Next Time", 
      color: "#FFEEAD",
      discount_amount: 0,
      discount_type: 'fixed'
    },
    { 
      name: `${Math.floor(dealDiscount * 0.25)}${dealType === 'percentage' ? '%' : '$'} Off`, 
      color: "#96CEB4",
      discount_amount: Math.floor(dealDiscount * 0.25),
      discount_type: dealType
    },
    { 
      name: "No Prize", 
      color: "#D4A5A5",
      discount_amount: 0,
      discount_type: 'fixed'
    },
    { 
      name: `${Math.floor(dealDiscount * 0.75)}${dealType === 'percentage' ? '%' : '$'} Off`, 
      color: "#9B59B6",
      discount_amount: Math.floor(dealDiscount * 0.75),
      discount_type: dealType
    },
    { 
      name: "Spin Again", 
      color: "#45B7D1",
      discount_amount: 0,
      discount_type: 'fixed'
    }
  ];
};

export default function SpinPage() {
  const params = useParams();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [currentPrize, setCurrentPrize] = useState<Prize | null>(null);
  const [dealTitle, setDealTitle] = useState('');
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [spinsRemaining, setSpinsRemaining] = useState(0);

  useEffect(() => {
    loadDealData();
  }, [params.id]);

  const loadDealData = async () => {
    try {
      const { data: deal, error: dealError } = await supabase
        .from('deals')
        .select('*')
        .eq('id', params.id)
        .single();

      if (dealError) throw dealError;

      setDealTitle(deal.title);
      setPrizes(generatePrizes(deal.title, deal.discount_amount, deal.discount_type));
      
      // Get remaining spins
      const { data: spins, error: spinsError } = await supabase
        .from('deal_spins')
        .select('spins_remaining')
        .eq('deal_id', params.id)
        .single();

      if (spinsError && spinsError.code !== 'PGRST116') throw spinsError;
      
      setSpinsRemaining(spins?.spins_remaining || 3); // Default to 3 spins if no record
    } catch (err) {
      console.error('Error loading deal:', err);
      setError('Failed to load deal data');
    } finally {
      setLoading(false);
    }
  };

  const spinWheel = async () => {
    if (!isSpinning && spinsRemaining > 0) {
      setIsSpinning(true);
      const spinDegrees = (Math.floor(Math.random() * 3) + 3) * 360 + Math.random() * 360;
      const newRotation = rotation + spinDegrees;
      
      setRotation(newRotation);
      
      // Calculate winning prize after spin
      setTimeout(async () => {
        const normalizedRotation = newRotation % 360;
        const prizeIndex = Math.floor((360 - (normalizedRotation % 360)) / (360 / prizes.length));
        const prize = prizes[prizeIndex];
        setCurrentPrize(prize);
        setIsSpinning(false);

        // Update spins remaining
        const newSpinsRemaining = spinsRemaining - 1;
        setSpinsRemaining(newSpinsRemaining);

        try {
          // Record the spin result
          await supabase.from('deal_spins').upsert({
            deal_id: params.id,
            user_id: (await supabase.auth.getUser()).data.user?.id,
            spins_remaining: newSpinsRemaining,
            last_prize: prize.name,
            last_spin_date: new Date().toISOString()
          });

          // If they won a prize, record it in deal_redemptions
          if (prize.discount_amount > 0) {
            const { data: { user } } = await supabase.auth.getUser();
            await supabase.from('deal_redemptions').insert({
              deal_id: params.id,
              user_id: user?.id,
              redemption_date: new Date().toISOString(),
              status: 'pending',
              notes: `Spin Wheel Prize: ${prize.name} - ${prize.discount_amount}${prize.discount_type === 'percentage' ? '%' : '$'} off`
            });
          }
        } catch (err) {
          console.error('Error recording spin:', err);
        }
      }, 3000);
    }
  };

  const sliceDegrees = 360 / prizes.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-retro-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">Error Loading Deal</h2>
          <p className="mt-2 text-retro-muted">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8 py-12">
      <h1 className="text-3xl font-display text-retro-dark text-center">
        Spin to Win: {dealTitle}
      </h1>
      
      {/* Static pointer triangle */}
      <div className="relative">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-20">
          <div className="w-8 h-8 bg-retro-primary"
              style={{
                clipPath: 'polygon(50% 100%, 0% 0%, 100% 0%)'
              }} />
        </div>
        
        {/* Wheel container */}
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
              
              const startRad = (startAngle - 90) * Math.PI / 180;
              const endRad = (endAngle - 90) * Math.PI / 180;
              
              const x1 = 50 + 50 * Math.cos(startRad);
              const y1 = 50 + 50 * Math.sin(startRad);
              const x2 = 50 + 50 * Math.cos(endRad);
              const y2 = 50 + 50 * Math.sin(endRad);
              
              const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
              
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
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg z-10" />
        </div>
      </div>
      
      <div className="text-center space-y-4">
        <div className="text-lg font-medium text-retro-muted mb-4">
          Spins Remaining: {spinsRemaining}
        </div>

        <button
          onClick={spinWheel}
          disabled={isSpinning || spinsRemaining === 0}
          className={`btn-primary text-lg ${
            isSpinning || spinsRemaining === 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isSpinning ? 'Spinning...' : spinsRemaining === 0 ? 'No Spins Left' : 'Spin the Wheel!'}
        </button>
        
        {currentPrize && !isSpinning && (
          <div className="text-xl font-semibold text-retro-dark mt-4">
            You landed on: {currentPrize.name}!
            {currentPrize.discount_amount > 0 && (
              <div className="text-lg text-retro-primary mt-2">
                Congratulations! Your prize has been saved.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 