'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navigation from '@/components/Navigation';

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
  const router = useRouter();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [currentPrize, setCurrentPrize] = useState<Prize | null>(null);
  const [dealTitle, setDealTitle] = useState('');
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [spinsRemaining, setSpinsRemaining] = useState(3);

  useEffect(() => {
    loadDealData();
  }, [params.id]);

  const loadDealData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }

      const { data: deal, error: dealError } = await supabase
        .from('deals')
        .select('*')
        .eq('id', params.id)
        .single();

      if (dealError) throw dealError;

      setDealTitle(deal.title);
      setPrizes(generatePrizes(deal.title, deal.discount_amount, deal.discount_type));

      // Check spins remaining
      const { data: spinData, error: spinError } = await supabase
        .from('deal_spins')
        .select('spins_remaining')
        .eq('deal_id', params.id)
        .eq('user_id', user.id)
        .single();

      if (!spinError && spinData) {
        setSpinsRemaining(spinData.spins_remaining);
      }

    } catch (err) {
      console.error('Error loading deal:', err);
      setError('Failed to load deal data');
    } finally {
      setLoading(false);
    }
  };

  const spinWheel = async () => {
    if (isSpinning || spinsRemaining <= 0) return;

    try {
      setIsSpinning(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }

      // Calculate random rotation (ensure it spins at least 5 times)
      const minSpins = 5;
      const extraSpins = Math.floor(Math.random() * 3); // 0-2 extra spins
      const totalSpins = minSpins + extraSpins;
      const baseRotation = totalSpins * 360;
      const prizeIndex = Math.floor(Math.random() * prizes.length);
      const prizeRotation = (360 / prizes.length) * prizeIndex;
      const newRotation = baseRotation + prizeRotation;

      setRotation(newRotation);
      setCurrentPrize(prizes[prizeIndex]);

      // Update spins remaining in database
      const { error: updateError } = await supabase
        .from('deal_spins')
        .upsert({
          deal_id: params.id,
          user_id: user.id,
          spins_remaining: spinsRemaining - 1,
          last_prize: prizes[prizeIndex].name,
          last_spin_date: new Date().toISOString(),
        });

      if (updateError) throw updateError;
      setSpinsRemaining(prev => prev - 1);

      // Wait for animation to complete
      setTimeout(() => {
        setIsSpinning(false);
      }, 5000);

    } catch (err) {
      console.error('Error spinning wheel:', err);
      setError('Failed to spin the wheel');
      setIsSpinning(false);
    }
  };

  const sliceDegrees = 360 / prizes.length;

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="flex items-center justify-center min-h-screen bg-retro-light">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-retro-accent"></div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navigation />
        <div className="flex items-center justify-center min-h-screen bg-retro-light">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600">Error</h2>
            <p className="mt-2 text-retro-muted">{error}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-retro-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col items-center gap-8">
            <h1 className="text-3xl font-display text-retro-dark text-center">
              Spin to Win: {dealTitle}
            </h1>

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
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg z-10 border-2 border-retro-dark" />
              </div>
            </div>

            {/* Controls */}
            <div className="text-center space-y-4">
              <p className="text-lg font-bold text-retro-dark">
                Spins Remaining: {spinsRemaining}
              </p>
              
              <button
                onClick={spinWheel}
                disabled={isSpinning || spinsRemaining <= 0}
                className="btn-primary text-lg font-bold px-8 py-3 disabled:opacity-50"
              >
                {isSpinning ? 'Spinning...' : spinsRemaining > 0 ? 'Spin!' : 'No Spins Left'}
              </button>

              {currentPrize && !isSpinning && (
                <div className="mt-6 p-6 bg-retro-accent/10 rounded-lg border-2 border-retro-accent/20">
                  <h2 className="text-xl font-display text-retro-dark mb-2">
                    {currentPrize.name === 'Try Again' ? 'Better Luck Next Time!' : 'Congratulations!'}
                  </h2>
                  <p className="text-retro-dark font-bold">
                    {currentPrize.name === 'Try Again' 
                      ? 'Give it another spin!'
                      : `You won: ${currentPrize.name}`}
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