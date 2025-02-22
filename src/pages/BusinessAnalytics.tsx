import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '../lib/supabase';
import { BarChart3, TrendingUp, Users, Tag, ArrowUp, ArrowDown, Calendar, Filter } from 'lucide-react';
import BusinessLayout from "./BusinessLayout.tsx";

interface DealAnalytics {
    id: string;
    title: string;
    total_redemptions: number;
    total_views: number;
    conversion_rate: number;
    start_date: string;
    end_date: string;
    is_spin_exclusive: boolean;
    is_active: boolean;
}

interface AnalyticsSummary {
    total_deals: number;
    active_deals: number;
    total_redemptions: number;
    total_views: number;
    average_conversion_rate: number;
    spin_exclusive_deals: number;
    spin_exclusive_redemptions: number;
}

type SortKey = keyof DealAnalytics;

interface SortConfig {
    key: SortKey;
    direction: 'asc' | 'desc';
}

export default function AnalyticsPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dealAnalytics, setDealAnalytics] = useState<DealAnalytics[]>([]);
    const [sortConfig, setSortConfig] = useState<SortConfig>({
        key: 'total_views',
        direction: 'desc',
    });
    const [timeFilter, setTimeFilter] = useState('all'); // all, week, month, year
    const [summary, setSummary] = useState<AnalyticsSummary>({
        total_deals: 0,
        active_deals: 0,
        total_redemptions: 0,
        total_views: 0,
        average_conversion_rate: 0,
        spin_exclusive_deals: 0,
        spin_exclusive_redemptions: 0,
    });

    useEffect(() => {
        fetchAnalytics();
    }, [timeFilter]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            setError(null);

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/auth');
                return;
            }

            console.log('Fetching analytics for user:', user.id);

            // Get the date range based on timeFilter
            const now = new Date();
            let startDate = new Date();
            switch(timeFilter) {
                case 'week':
                    startDate.setDate(startDate.getDate() - 7);
                    break;
                case 'month':
                    startDate.setDate(startDate.getDate() - 30);
                    break;
                case 'year':
                    startDate.setDate(startDate.getDate() - 365);
                    break;
                case 'all':
                    startDate = new Date(0); // Beginning of time
                    break;
            }

            // Fetch deals
            const { data: deals, error: dealsError } = await supabase
                .from('deals')
                .select(`
          id,
          title,
          start_date,
          end_date,
          current_redemptions,
          is_active,
          is_spin_exclusive,
          created_at
        `)
                .eq('business_id', user.id);

            if (dealsError) throw dealsError;

            if (!deals || deals.length === 0) {
                console.log('No deals found');
                setDealAnalytics([]);
                setSummary({
                    total_deals: 0,
                    active_deals: 0,
                    total_redemptions: 0,
                    total_views: 0,
                    average_conversion_rate: 0,
                    spin_exclusive_deals: 0,
                    spin_exclusive_redemptions: 0,
                });
                return;
            }

            // Fetch analytics events for views
            const { data: viewEvents, error: viewsError } = await supabase
                .from('analytics_events')
                .select('*')
                .eq('business_id', user.id)
                .eq('event_type', 'deal_view')
                .gte('created_at', startDate.toISOString());

            if (viewsError) throw viewsError;

            // Process analytics data
            const dealViews = (viewEvents || []).reduce((acc: { [key: string]: number }, event) => {
                if (event.deal_id) {
                    acc[event.deal_id] = (acc[event.deal_id] || 0) + 1;
                }
                return acc;
            }, {});

            const processedDeals = deals.map(deal => {
                const views = dealViews[deal.id] || 0;
                const redemptions = deal.current_redemptions || 0;
                return {
                    id: deal.id,
                    title: deal.title,
                    total_redemptions: redemptions,
                    total_views: views,
                    conversion_rate: views > 0 ? (redemptions / views) * 100 : 0,
                    start_date: deal.start_date,
                    end_date: deal.end_date,
                    is_spin_exclusive: deal.is_spin_exclusive || false,
                    is_active: deal.is_active,
                };
            });

            const activeDealCount = deals.filter(deal =>
                deal.is_active && new Date(deal.end_date) > now
            ).length;

            const spinExclusiveDeals = deals.filter(deal => deal.is_spin_exclusive);
            const spinExclusiveRedemptions = spinExclusiveDeals.reduce(
                (sum, deal) => sum + (deal.current_redemptions || 0),
                0
            );

            const totalRedemptions = deals.reduce((sum, deal) => sum + (deal.current_redemptions || 0), 0);
            const totalViews = Object.values(dealViews).reduce((sum, views) => sum + views, 0);
            const averageConversion = totalViews > 0 ? (totalRedemptions / totalViews) * 100 : 0;

            console.log('Setting analytics data:', {
                totalDeals: deals.length,
                activeDealCount,
                totalRedemptions,
                totalViews,
                averageConversion,
            });

            setDealAnalytics(processedDeals);
            setSummary({
                total_deals: deals.length,
                active_deals: activeDealCount,
                total_redemptions: totalRedemptions,
                total_views: totalViews,
                average_conversion_rate: averageConversion,
                spin_exclusive_deals: spinExclusiveDeals.length,
                spin_exclusive_redemptions: spinExclusiveRedemptions,
            });

        } catch (err) {
            console.error('Error fetching analytics:', err);
            setError(err instanceof Error ? err.message : 'Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (key: SortKey) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    const sortedDeals = [...dealAnalytics].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (sortConfig.direction === 'asc') {
            return aValue > bValue ? 1 : -1;
        }
        return aValue < bValue ? 1 : -1;
    });

    if (loading) {
        return (
            <BusinessLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="animate-pulse space-y-8">
                    <div className="h-8 bg-retro-light rounded w-1/4"></div>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-32 bg-retro-light rounded-lg"></div>
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="card">
                    <h2 className="text-xl font-semibold text-retro-dark">No Analytics Data Yet</h2>
                    <p className="mt-2 text-retro-muted">
                        Create some deals to start tracking their performance. Once you have active deals,
                        you'll see analytics data here including views, redemptions, and conversion rates.
                    </p>
                    <button
                        onClick={() => navigate('/business/deals/create')}
                        className="mt-4 btn-primary"
                    >
                        Create Your First Deal
                    </button>
                </div>
            </div>
                </BusinessLayout>
        );
    }

    return (
        <BusinessLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-display text-retro-dark">Analytics Dashboard</h1>
                    <p className="mt-2 text-sm text-retro-muted">
                        Track your deals performance and customer engagement
                    </p>
                </div>
                <div className="flex items-center space-x-4">
                    <select
                        value={timeFilter}
                        onChange={(e) => setTimeFilter(e.target.value)}
                        className="form-select rounded-md border-retro-dark/10 text-sm"
                        aria-label="Time period filter"
                    >
                        <option value="all">All Time</option>
                        <option value="week">Last 7 Days</option>
                        <option value="month">Last 30 Days</option>
                        <option value="year">Last Year</option>
                    </select>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <div className="card">
                    <div className="flex items-center space-x-3">
                        <Tag className="h-6 w-6 text-retro-primary" />
                        <div>
                            <h3 className="text-lg font-display text-retro-dark">Active Deals</h3>
                            <p className="mt-1 text-2xl font-display text-retro-primary">
                                {summary.active_deals}
                                <span className="text-sm text-retro-muted ml-2">of {summary.total_deals}</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center space-x-3">
                        <Users className="h-6 w-6 text-green-500" />
                        <div>
                            <h3 className="text-lg font-display text-retro-dark">Total Views</h3>
                            <p className="mt-1 text-2xl font-display text-green-500">
                                {summary.total_views.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center space-x-3">
                        <BarChart3 className="h-6 w-6 text-blue-500" />
                        <div>
                            <h3 className="text-lg font-display text-retro-dark">Redemptions</h3>
                            <p className="mt-1 text-2xl font-display text-blue-500">
                                {summary.total_redemptions.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center space-x-3">
                        <TrendingUp className="h-6 w-6 text-purple-500" />
                        <div>
                            <h3 className="text-lg font-display text-retro-dark">Conversion Rate</h3>
                            <p className="mt-1 text-2xl font-display text-purple-500">
                                {summary.average_conversion_rate.toFixed(1)}%
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Spin & Win Stats */}
            <div className="card mb-8">
                <h3 className="text-xl font-display text-retro-dark mb-4">Spin & Win Performance</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-retro-light/50 rounded-lg">
                            <Calendar className="h-6 w-6 text-retro-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-retro-muted">Active Spin Deals</p>
                            <p className="text-2xl font-display text-retro-dark">{summary.spin_exclusive_deals}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-retro-light/50 rounded-lg">
                            <TrendingUp className="h-6 w-6 text-retro-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-retro-muted">Spin Redemptions</p>
                            <p className="text-2xl font-display text-retro-dark">{summary.spin_exclusive_redemptions}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Deals Performance Table */}
            <div className="card">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-display text-retro-dark">
                        Deals Performance
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-retro-muted">
                        <Filter className="h-4 w-4" />
                        <span>Click column headers to sort</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-retro-dark/10">
                            <th className="px-6 py-3 text-left text-xs font-medium text-retro-muted uppercase tracking-wider">
                                Deal
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-retro-muted uppercase tracking-wider cursor-pointer"
                                onClick={() => handleSort('total_views')}
                            >
                                <div className="flex items-center space-x-1">
                                    <span>Views</span>
                                    {sortConfig.key === 'total_views' && (
                                        sortConfig.direction === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                                    )}
                                </div>
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-retro-muted uppercase tracking-wider cursor-pointer"
                                onClick={() => handleSort('total_redemptions')}
                            >
                                <div className="flex items-center space-x-1">
                                    <span>Redemptions</span>
                                    {sortConfig.key === 'total_redemptions' && (
                                        sortConfig.direction === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                                    )}
                                </div>
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-retro-muted uppercase tracking-wider cursor-pointer"
                                onClick={() => handleSort('conversion_rate')}
                            >
                                <div className="flex items-center space-x-1">
                                    <span>Conversion</span>
                                    {sortConfig.key === 'conversion_rate' && (
                                        sortConfig.direction === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                                    )}
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-retro-muted uppercase tracking-wider">
                                Status
                            </th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-retro-dark/10">
                        {sortedDeals.map((deal) => (
                            <tr key={deal.id} className="hover:bg-retro-light/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div>
                                        <div className="font-medium text-retro-dark">{deal.title}</div>
                                        <div className="text-sm text-retro-muted">
                                            {deal.is_spin_exclusive && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                            Spin Exclusive
                          </span>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-retro-dark">
                                    {deal.total_views.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-retro-dark">
                                    {deal.total_redemptions.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-retro-dark">
                                    {deal.conversion_rate.toFixed(1)}%
                                </td>
                                <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        deal.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {deal.is_active ? 'Active' : 'Inactive'}
                    </span>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    {dealAnalytics.length === 0 && (
                        <div className="text-center py-8">
                            <BarChart3 className="mx-auto h-12 w-12 text-retro-muted/50" />
                            <p className="mt-4 text-lg font-medium text-retro-dark">No deals data available</p>
                            <p className="mt-1 text-retro-muted">Create some deals to start tracking performance</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
        </BusinessLayout>
    );
}