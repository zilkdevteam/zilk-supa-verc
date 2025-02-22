import { useEffect, useState } from 'react';
import { useNavigate,NavLink } from 'react-router';
import { supabase } from '../lib/supabase';
import { BarChart3, Tag, Users, QrCode, Plus, ArrowRight } from 'lucide-react';
import BusinessLayout from "./BusinessLayout.tsx";

interface DashboardStats {
    totalDeals: number;
    activeDeals: number;
    totalRedemptions: number;
    totalSpins: number;
}

interface RecentDeal {
    id: string;
    title: string;
    redemptions: number;
    end_date: string;
}

export default function BusinessDashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<DashboardStats>({
        totalDeals: 0,
        activeDeals: 0,
        totalRedemptions: 0,
        totalSpins: 0,
    });
    const [recentDeals, setRecentDeals] = useState<RecentDeal[]>([]);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/auth');
                return;
            }

            const [
                { data: deals, error: dealsError },
                { data: business, error: businessError }
            ] = await Promise.all([
                supabase
                    .from('deals')
                    .select('*')
                    .eq('business_id', user.id)
                    .order('created_at', { ascending: false }),
                supabase
                    .from('businesses')
                    .select('*')
                    .eq('id', user.id)
                    .single()
            ]);

            if (dealsError) throw dealsError;
            if (businessError) throw businessError;

            // Calculate dashboard stats
            const activeDeals = deals?.filter(d => d.is_active).length || 0;
            const totalRedemptions = deals?.reduce((sum, deal) => sum + (deal.current_redemptions || 0), 0) || 0;
            const totalSpins = deals?.reduce((sum, deal) => sum + (deal.total_spins || 0), 0) || 0;

            setStats({
                totalDeals: deals?.length || 0,
                activeDeals,
                totalRedemptions,
                totalSpins,
            });

            // Get recent deals
            setRecentDeals(
                (deals || [])
                    .slice(0, 5)
                    .map(deal => ({
                        id: deal.id,
                        title: deal.title,
                        redemptions: deal.current_redemptions || 0,
                        end_date: deal.end_date,
                    }))
            );

        } catch (err) {
            console.error('Error loading dashboard:', err);
            setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <BusinessLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="animate-pulse">
                    <div className="h-8 bg-retro-dark-700/10 rounded w-1/4 mb-8"></div>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-32 bg-retro-dark-700/10 rounded-lg"></div>
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
                <div className="bg-white rounded-lg shadow-retro p-6 border-2 border-retro-dark">
                    <h2 className="text-xl font-semibold text-red-600">Error Loading Dashboard</h2>
                    <p className="mt-2 text-retro-muted">{error}</p>
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
            <div className="mb-8">
                <h1 className="text-2xl font-display text-retro-dark">Business Dashboard</h1>
                <p className="mt-2 text-sm text-retro-muted">
                    Overview of your business performance
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <div className="card">
                    <h3 className="text-lg font-display text-retro-dark">Total Deals</h3>
                    <p className="mt-2 text-3xl font-display text-retro-primary">{stats.totalDeals}</p>
                </div>

                <div className="card">
                    <h3 className="text-lg font-display text-retro-dark">Active Deals</h3>
                    <p className="mt-2 text-3xl font-display text-retro-primary">{stats.activeDeals}</p>
                </div>

                <div className="card">
                    <h3 className="text-lg font-display text-retro-dark">Total Redemptions</h3>
                    <p className="mt-2 text-3xl font-display text-retro-primary">{stats.totalRedemptions}</p>
                </div>

                <div className="card">
                    <h3 className="text-lg font-display text-retro-dark">Total Spins</h3>
                    <p className="mt-2 text-3xl font-display text-retro-primary">{stats.totalSpins}</p>
                </div>
            </div>

            <div className="card">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-display text-retro-dark">Recent Deals</h2>
                    <NavLink
                        to="/business/deals/new"
                        className="btn-primary"
                    >
                        Create Deal
                    </NavLink>
                </div>

                <div className="divide-y divide-retro-dark/10">
                    {recentDeals.map((deal) => (
                        <div key={deal.id} className="py-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-medium text-retro-dark">{deal.title}</h3>
                                    <p className="mt-1 text-sm text-retro-muted">
                                        Ends {new Date(deal.end_date).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-retro-primary">{deal.redemptions} redemptions</p>
                                </div>
                            </div>
                        </div>
                    ))}

                    {recentDeals.length === 0 && (
                        <div className="py-4 text-center text-retro-muted">
                            No deals created yet
                        </div>
                    )}
                </div>

                {recentDeals.length > 0 && (
                    <div className="mt-6">
                        <NavLink
                            to="/business/deals"
                            className="text-retro-primary hover:text-retro-primary/80 font-medium"
                        >
                            View all deals →
                        </NavLink>
                    </div>
                )}
            </div>
        </div>
        </BusinessLayout>

            );
}