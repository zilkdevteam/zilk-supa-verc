import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '../lib/supabase';
import Navigation from '../components/Navigation';
import { Star, Gift, Trophy, Sparkles, Gem, Ticket, Crown, Zap } from 'lucide-react';

interface Prize {
    name: string;
    color: string;
    description: string;
    type: 'exclusive_deal' | 'bonus' | 'free_spin';
    value?: number;
    icon: keyof typeof prizeIcons;
}

const prizeIcons = {
    Star,
    Gift,
    Trophy,
    Sparkles,
    Gem,
    Ticket,
    Crown,
    Zap
};

const EXCLUSIVE_PRIZES: Prize[] = [
    {
        name: "50% Off Any Deal",
        color: "#FF6B6B",
        description: "Get 50% off any deal of your choice!",
        type: "exclusive_deal",
        value: 50,
        icon: "Star"
    },
    {
        name: "Free Spin",
        color: "#4ECDC4",
        description: "Try your luck again!",
        type: "free_spin",
        icon: "Zap"
    },
    {
        name: "Mystery Deal",
        color: "#9B59B6",
        description: "Unlock an exclusive mystery deal!",
        type: "exclusive_deal",
        icon: "Sparkles"
    },
    {
        name: "Extra 20% Off",
        color: "#45B7D1",
        description: "Stack an extra 20% off on any deal!",
        type: "bonus",
        value: 20,
        icon: "Gift"
    },
    {
        name: "VIP Deal",
        color: "#FFB627",
        description: "Unlock a special VIP-only deal!",
        type: "exclusive_deal",
        icon: "Crown"
    },
    {
        name: "Double Discount",
        color: "#96CEB4",
        description: "Double your next deal's discount!",
        type: "bonus",
        icon: "Gem"
    },
    {
        name: "Premium Deal",
        color: "#D4A5A5",
        description: "Access a premium exclusive deal!",
        type: "exclusive_deal",
        icon: "Trophy"
    },
    {
        name: "Bonus Spin",
        color: "#95A5A6",
        description: "Get another chance to win!",
        type: "free_spin",
        icon: "Ticket"
    }
];

export default function SpinPage() {
    const navigate = useNavigate();
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [currentPrize, setCurrentPrize] = useState<Prize | null>(null);
    const [spinsRemaining, setSpinsRemaining] = useState(1);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [phoneSubmitted, setPhoneSubmitted] = useState(false);

    useEffect(() => {
        loadUserSpins();
    }, []);

    const loadUserSpins = async () => {
        try {
            setLoading(true);

            const lastSpinDate = localStorage.getItem('lastSpinDate');
            const phoneSubmitted = localStorage.getItem('spinPhoneSubmitted');

            if (lastSpinDate) {
                const lastSpin = new Date(lastSpinDate);
                const now = new Date();
                const hoursSinceLastSpin = (now.getTime() - lastSpin.getTime()) / (1000 * 60 * 60);

                if (hoursSinceLastSpin >= 24) {
                    localStorage.removeItem('lastSpinDate');
                    localStorage.removeItem('spinPhoneSubmitted');
                    setSpinsRemaining(1);
                    setPhoneSubmitted(false);
                } else {
                    setSpinsRemaining(0);
                    setPhoneSubmitted(!!phoneSubmitted);
                }
            } else {
                setSpinsRemaining(1);
                setPhoneSubmitted(false);
            }
        } catch (err) {
            console.error('Error loading spins:', err);
            setError('Failed to load spin data');
        } finally {
            setLoading(false);
        }
    };

    const handlePhoneSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phoneNumber.match(/^\+?[\d\s-]{10,}$/)) {
            setError('Please enter a valid phone number');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const { data: existingPhone, error: checkError } = await supabase
                .from('phone_numbers')
                .select('id')
                .eq('phone', phoneNumber)
                .single();

            if (checkError && checkError.code !== 'PGRST116') throw checkError;

            if (!existingPhone) {
                const { error: insertError } = await supabase
                    .from('phone_numbers')
                    .insert([{ phone: phoneNumber }]);

                if (insertError) throw insertError;

                setSpinsRemaining(1);
                setPhoneSubmitted(true);
                localStorage.setItem('spinPhoneSubmitted', 'true');
            } else {
                setError('This phone number has already been used');
            }
        } catch (err) {
            console.error('Error submitting phone number:', err);
            setError('Failed to submit phone number');
        } finally {
            setLoading(false);
        }
    };

    const spinWheel = async () => {
        if (isSpinning || spinsRemaining <= 0) return;

        try {
            setIsSpinning(true);
            setError(null);

            const minSpins = 5;
            const extraSpins = Math.floor(Math.random() * 3);
            const totalSpins = minSpins + extraSpins;
            const baseRotation = totalSpins * 360;
            const prizeIndex = Math.floor(Math.random() * EXCLUSIVE_PRIZES.length);
            const sliceDegrees = 360 / EXCLUSIVE_PRIZES.length;
            const prizeRotation = (sliceDegrees * prizeIndex) + (sliceDegrees / 2);
            const newRotation = baseRotation + prizeRotation;

            setRotation(newRotation);
            const prize = EXCLUSIVE_PRIZES[prizeIndex];
            setCurrentPrize(prize);

            localStorage.setItem('lastSpinDate', new Date().toISOString());
            setSpinsRemaining(prev => prev - 1);

            setTimeout(() => {
                setIsSpinning(false);
            }, 5000);

        } catch (err) {
            console.error('Error spinning wheel:', err);
            setError('Failed to spin the wheel');
            setIsSpinning(false);
        }
    };

    const sliceDegrees = 360 / EXCLUSIVE_PRIZES.length;

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

    return (
        <>
            <Navigation />
            <main className="min-h-screen bg-retro-light">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex flex-col items-center gap-8">
                        <div className="text-center space-y-4">
                            <h1 className="text-4xl font-display text-retro-dark">
                                Spin & Win Exclusive Deals!
                            </h1>
                            <p className="text-xl text-retro-muted">
                                Try your luck to win exclusive discounts and special offers
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl mb-8">
                            <div className="card flex items-center gap-4 p-4">
                                <Star className="h-8 w-8 text-yellow-500" />
                                <div>
                                    <h3 className="font-bold text-retro-dark">Exclusive Deals</h3>
                                    <p className="text-sm text-retro-muted">Win deals not found anywhere else</p>
                                </div>
                            </div>
                            <div className="card flex items-center gap-4 p-4">
                                <Gift className="h-8 w-8 text-retro-primary" />
                                <div>
                                    <h3 className="font-bold text-retro-dark">Bonus Discounts</h3>
                                    <p className="text-sm text-retro-muted">Stack extra savings on any deal</p>
                                </div>
                            </div>
                            <div className="card flex items-center gap-4 p-4">
                                <Trophy className="h-8 w-8 text-purple-500" />
                                <div>
                                    <h3 className="font-bold text-retro-dark">VIP Rewards</h3>
                                    <p className="text-sm text-retro-muted">Unlock special VIP-only offers</p>
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-20">
                                <div
                                    className="w-8 h-8 bg-retro-primary"
                                    style={{
                                        clipPath: 'polygon(50% 100%, 0% 0%, 100% 0%)'
                                    }}
                                />
                            </div>

                            <div
                                className="relative w-96 h-96"
                                style={{
                                    transform: `rotate(${rotation}deg)`,
                                    transition: isSpinning ? 'transform 5s cubic-bezier(0.32, 0.94, 0.60, 1)' : 'none'
                                }}
                            >
                                <svg viewBox="0 0 100 100" className="w-full h-full">
                                    {EXCLUSIVE_PRIZES.map((prize, index) => {
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
                                                <foreignObject
                                                    x={textX - 5}
                                                    y={textY - 5}
                                                    width="10"
                                                    height="10"
                                                    style={{
                                                        transform: `rotate(${textAngle}deg)`,
                                                        transformOrigin: `${textX}px ${textY}px`
                                                    }}
                                                >
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        {React.createElement(prizeIcons[prize.icon], {
                                                            className: "w-6 h-6 text-white",
                                                            strokeWidth: 2.5
                                                        })}
                                                    </div>
                                                </foreignObject>
                                            </g>
                                        );
                                    })}
                                </svg>

                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg z-10 border-2 border-retro-dark" />
                            </div>
                        </div>

                        <div className="text-center space-y-4">
                            <p className="text-lg font-bold text-retro-dark">
                                Spins Remaining: {spinsRemaining}
                            </p>

                            <button
                                onClick={spinWheel}
                                disabled={isSpinning || spinsRemaining <= 0}
                                className="btn-primary text-lg font-bold px-8 py-3 disabled:opacity-50"
                            >
                                {isSpinning ? 'Spinning...' : spinsRemaining > 0 ? 'Spin to Win!' : 'No Spins Left'}
                            </button>

                            {currentPrize && !isSpinning && (
                                <div className="mt-6 p-6 bg-retro-accent/10 rounded-lg border-2 border-retro-accent/20">
                                    <h2 className="text-xl font-display text-retro-dark mb-2">
                                        Congratulations!
                                    </h2>
                                    <p className="text-retro-dark font-bold mb-2">
                                        You won: {currentPrize.name}
                                    </p>
                                    <p className="text-retro-muted">
                                        {currentPrize.description}
                                    </p>
                                </div>
                            )}

                            {!phoneSubmitted && spinsRemaining === 0 && (
                                <div className="mt-6 p-6 bg-retro-light rounded-lg border-2 border-retro-primary/20">
                                    <h3 className="text-lg font-bold text-retro-dark mb-2">
                                        Get an Extra Spin! 🎉
                                    </h3>
                                    <p className="text-retro-muted mb-4">
                                        Enter your phone number to receive exclusive deals and an extra spin!
                                    </p>
                                    <form onSubmit={handlePhoneSubmit} className="space-y-4">
                                        <div>
                                            <input
                                                type="tel"
                                                value={phoneNumber}
                                                onChange={(e) => setPhoneNumber(e.target.value)}
                                                placeholder="Enter your phone number"
                                                className="w-full px-4 py-2 rounded-lg border-2 border-retro-primary/20 focus:border-retro-primary focus:outline-none"
                                            />
                                            {error && (
                                                <p className="mt-1 text-sm text-red-600">{error}</p>
                                            )}
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={loading || !phoneNumber}
                                            className="btn-primary w-full text-lg font-bold disabled:opacity-50"
                                        >
                                            {loading ? 'Submitting...' : 'Get Extra Spin'}
                                        </button>
                                    </form>
                                </div>
                            )}

                            {spinsRemaining === 0 && phoneSubmitted && (
                                <p className="text-sm text-retro-muted">
                                    Thanks for playing! Come back in 24 hours for another spin.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}