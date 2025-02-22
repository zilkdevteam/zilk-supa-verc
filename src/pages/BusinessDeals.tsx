import { useEffect, useState } from 'react';
import { useNavigate,NavLink } from 'react-router';
import { supabase } from '../lib/supabase';
import { Tag, Plus, Edit2, Calendar, Users, ArrowUpRight } from 'lucide-react';
import BusinessLayout from "./BusinessLayout.tsx";
interface DealStats {
    totalDeals: number;
    activeDeals: number;
    totalRedemptions: number;
    spinExclusiveDeals: number;
}

interface Deal {
    id: string;
    title: string;
    redemptions: number;
    end_date: string;
    is_active: boolean;
    is_spin_exclusive: boolean;
}

export default function DealsPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deals, setDeals] = useState<Deal[]>([]);
    const [stats, setStats] = useState<DealStats>({
        totalDeals: 0,
        activeDeals: 0,
        totalRedemptions: 0,
        spinExclusiveDeals: 0,
    });

    const loadDealsData = async () => {
        try {
            setLoading(true);
            setError(null);

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/auth');
                return;
            }

            const { data: deals, error: dealsError } = await supabase
                .from('deals')
                .select('*')
                .eq('business_id', user.id)
                .order('created_at', { ascending: false });

            if (dealsError) throw dealsError;

            if (deals) {
                setDeals(deals);
                setStats({
                    totalDeals: deals.length,
                    activeDeals: deals.filter(d => d.is_active).length,
                    totalRedemptions: deals.reduce((sum, deal) => sum + (deal.current_redemptions || 0), 0),
                    spinExclusiveDeals: deals.filter(d => d.is_spin_exclusive).length,
                });
            }
        } catch (err) {
            console.error('Error loading deals:', err);
            setError(err instanceof Error ? err.message : 'Failed to load deals');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDealsData();
    }, []);

    const regularDeals = deals.filter(deal => !deal.is_spin_exclusive);
    const spinDeals = deals.filter(deal => deal.is_spin_exclusive);

    if (loading) {
        return (
            <BusinessLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>
                </BusinessLayout>
        );
    }

    if (error) {
        return (
            <BusinessLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-red-600">Error Loading Deals</h2>
                    <p className="mt-2 text-gray-600">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 btn-primary"
                    >
                        Try Again
                    </button>
                </div>
            </div>
                </BusinessLayout>
        );
    }

    return (
        <BusinessLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-display text-retro-dark">Business Deals</h1>
                    <p className="mt-2 text-sm text-retro-muted">
                        Manage your deals and track their performance
                    </p>
                </div>
                <NavLink
                    to="/business/deals/create"
                    className="btn-primary inline-flex items-center space-x-2"
                >
                    <Plus className="h-5 w-5" />
                    <span>Create New Deal</span>
                </NavLink>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <div className="card">
                    <div className="flex items-center space-x-3">
                        <Tag className="h-6 w-6 text-retro-primary" />
                        <div>
                            <h3 className="text-lg font-display text-retro-dark">Total Deals</h3>
                            <p className="mt-1 text-2xl font-display text-retro-primary">{stats.totalDeals}</p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center space-x-3">
                        <Users className="h-6 w-6 text-green-500" />
                        <div>
                            <h3 className="text-lg font-display text-retro-dark">Active Deals</h3>
                            <p className="mt-1 text-2xl font-display text-green-500">{stats.activeDeals}</p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center space-x-3">
                        <ArrowUpRight className="h-6 w-6 text-blue-500" />
                        <div>
                            <h3 className="text-lg font-display text-retro-dark">Total Redemptions</h3>
                            <p className="mt-1 text-2xl font-display text-blue-500">{stats.totalRedemptions}</p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center space-x-3">
                        <Calendar className="h-6 w-6 text-purple-500" />
                        <div>
                            <h3 className="text-lg font-display text-retro-dark">Spin Exclusive</h3>
                            <p className="mt-1 text-2xl font-display text-purple-500">{stats.spinExclusiveDeals}</p>
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="mb-8 bg-red-50 border border-red-200 rounded-md p-4">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            <div className="space-y-8">
                {/* Regular Deals Section */}
                <div className="card">
                    <h2 className="text-xl font-display text-retro-dark mb-6">Regular Deals</h2>

                    <div className="divide-y divide-retro-dark/10">
                        {regularDeals.map((deal) => (
                            <div key={deal.id} className="py-4 hover:bg-retro-light/50 transition-colors rounded-lg">
                                <div className="flex items-center justify-between px-4">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3">
                                            <h3 className="text-lg font-medium text-retro-dark">{deal.title}</h3>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                deal.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                        {deal.is_active ? 'Active' : 'Inactive'}
                      </span>
                                        </div>
                                        <div className="mt-1 flex items-center text-sm text-retro-muted space-x-4">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Ends {new Date(deal.end_date).toLocaleDateString()}
                      </span>
                                            <span className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                                                {deal.redemptions} redemptions
                      </span>
                                        </div>
                                    </div>
                                    <div className="ml-4 flex items-center space-x-3">
                                        <NavLink
                                            to={`/deals/${deal.id}`}
                                            className="text-retro-primary hover:text-retro-primary/80 transition-colors"
                                            target="_blank"
                                        >
                                            View Public Page
                                        </NavLink>
                                        <NavLink
                                            to={`/business/deals/${deal.id}/edit`}
                                            className="inline-flex items-center px-3 py-1.5 border border-retro-dark/10 rounded-md text-sm font-medium text-retro-dark hover:bg-retro-light/50 transition-colors"
                                        >
                                            <Edit2 className="h-4 w-4 mr-1" />
                                            Edit
                                        </NavLink>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {regularDeals.length === 0 && (
                            <div className="py-8 text-center text-retro-muted">
                                <Tag className="h-12 w-12 mx-auto mb-4 text-retro-muted/50" />
                                <p className="text-lg font-medium">No regular deals created yet</p>
                                <p className="mt-1">Create your first deal to start attracting customers</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Spin & Win Deals Section */}
                <div className="card">
                    <h2 className="text-xl font-display text-retro-dark mb-6">Spin & Win Exclusive Deals</h2>

                    <div className="divide-y divide-retro-dark/10">
                        {spinDeals.map((deal) => (
                            <div key={deal.id} className="py-4 hover:bg-retro-light/50 transition-colors rounded-lg">
                                <div className="flex items-center justify-between px-4">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3">
                                            <h3 className="text-lg font-medium text-retro-dark">{deal.title}</h3>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                deal.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                        {deal.is_active ? 'Active' : 'Inactive'}
                      </span>
                                        </div>
                                        <div className="mt-1 flex items-center text-sm text-retro-muted space-x-4">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Ends {new Date(deal.end_date).toLocaleDateString()}
                      </span>
                                            <span className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                                                {deal.redemptions} redemptions
                      </span>
                                        </div>
                                    </div>
                                    <div className="ml-4 flex items-center space-x-3">
                                        <NavLink
                                            to={`/deals/${deal.id}`}
                                            className="text-retro-primary hover:text-retro-primary/80 transition-colors"
                                            target="_blank"
                                        >
                                            View Public Page
                                        </NavLink>
                                        <NavLink
                                            to={`/business/deals/${deal.id}/edit`}
                                            className="inline-flex items-center px-3 py-1.5 border border-retro-dark/10 rounded-md text-sm font-medium text-retro-dark hover:bg-retro-light/50 transition-colors"
                                        >
                                            <Edit2 className="h-4 w-4 mr-1" />
                                            Edit
                                        </NavLink>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {spinDeals.length === 0 && (
                            <div className="py-8 text-center text-retro-muted">
                                <Calendar className="h-12 w-12 mx-auto mb-4 text-retro-muted/50" />
                                <p className="text-lg font-medium">No spin exclusive deals created yet</p>
                                <p className="mt-1">Create a spin exclusive deal to engage customers with exciting rewards</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
            </BusinessLayout>
    );
}