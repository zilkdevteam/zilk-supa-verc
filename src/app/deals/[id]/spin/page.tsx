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
  const prizes: Prize[] = [
    {
      name: dealTitle,
      color: '#4361EE', // retro-accent
      discount_amount: dealDiscount,
      discount_type: dealType,
    },
    {
      name: 'Try Again',
      color: '#E94F37', // retro-primary
      discount_amount: 0,
      discount_type: 'fixed',
    },
    {
      name: '5% Off',
      color: '#4361EE',
      discount_amount: 5,
      discount_type: 'percentage',
    },
    {
      name: 'Try Again',
      color: '#E94F37',
      discount_amount: 0,
      discount_type: 'fixed',
    },
    {
      name: '$5 Off',
      color: '#4361EE',
      discount_amount: 5,
      discount_type: 'fixed',
    },
    {
      name: 'Try Again',
      color: '#E94F37',
      discount_amount: 0,
      discount_type: 'fixed',
    },
  ];
  return prizes;
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

            <div className="relative w-96 h-96">
              {/* Wheel */}
              <div
                className="absolute inset-0 rounded-full border-8 border-retro-dark bg-white shadow-retro-xl transition-transform duration-5000 ease-out"
                style={{
                  transform: `rotate(${rotation}deg)`,
                }}
              >
                {prizes.map((prize, index) => {
                  const rotation = (360 / prizes.length) * index;
                  return (
                    <div
                      key={index}
                      className="absolute inset-0 flex items-center justify-center"
                      style={{
                        transform: `rotate(${rotation}deg)`,
                      }}
                    >
                      <div
                        className="absolute inset-0"
                        style={{
                          background: prize.color,
                          clipPath: `polygon(50% 50%, 100% -100%, -100% -100%)`,
                        }}
                      />
                      <span
                        className="relative text-white font-bold text-sm -mt-32 transform -rotate-90"
                        style={{ transformOrigin: 'center' }}
                      >
                        {prize.name}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Center Point */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-retro-dark shadow-retro z-10"></div>
              </div>

              {/* Pointer */}
              <div className="absolute top-0 left-1/2 -ml-4 w-8 h-12">
                <div className="w-8 h-8 bg-retro-primary transform rotate-45"></div>
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