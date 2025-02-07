'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { BarChart3, TrendingUp, Users, Tag, ArrowUp, ArrowDown } from 'lucide-react';

interface DealAnalytics {
  id: string;
  title: string;
  total_redemptions: number;
  total_views: number;
  conversion_rate: number;
  start_date: string;
  end_date: string;
}

interface AnalyticsSummary {
  total_deals: number;
  active_deals: number;
  total_redemptions: number;
  total_views: number;
  average_conversion_rate: number;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dealAnalytics, setDealAnalytics] = useState<DealAnalytics[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary>({
    total_deals: 0,
    active_deals: 0,
    total_redemptions: 0,
    total_views: 0,
    average_conversion_rate: 0,
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }

      // Fetch deals with their analytics
      const { data: deals, error: dealsError } = await supabase
        .from('deals')
        .select(`
          id,
          title,
          start_date,
          end_date,
          current_redemptions,
          views,
          is_active
        `)
        .eq('business_id', user.id);

      if (dealsError) throw dealsError;

      // Process analytics data
      const now = new Date();
      const processedDeals = deals.map(deal => ({
        id: deal.id,
        title: deal.title,
        total_redemptions: deal.current_redemptions || 0,
        total_views: deal.views || 0,
        conversion_rate: deal.views ? (deal.current_redemptions / deal.views) * 100 : 0,
        start_date: deal.start_date,
        end_date: deal.end_date,
      }));

      const activeDealCount = deals.filter(deal => 
        deal.is_active && new Date(deal.end_date) > now
      ).length;

      const totalRedemptions = deals.reduce((sum, deal) => sum + (deal.current_redemptions || 0), 0);
      const totalViews = deals.reduce((sum, deal) => sum + (deal.views || 0), 0);
      const averageConversion = totalViews ? (totalRedemptions / totalViews) * 100 : 0;

      setDealAnalytics(processedDeals);
      setSummary({
        total_deals: deals.length,
        active_deals: activeDealCount,
        total_redemptions: totalRedemptions,
        total_views: totalViews,
        average_conversion_rate: averageConversion,
      });

    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-red-600">Error Loading Analytics</h2>
            <p className="mt-2 text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Track your deals performance and customer engagement
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Tag className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Deals</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {summary.active_deals}
                      </div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold">
                        <span className="text-gray-500">of {summary.total_deals} total</span>
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Views</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {summary.total_views.toLocaleString()}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BarChart3 className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Redemptions</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {summary.total_redemptions.toLocaleString()}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Conversion Rate</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {summary.average_conversion_rate.toFixed(1)}%
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Deals Performance Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Deals Performance
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deal
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Views
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Redemptions
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conversion Rate
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dealAnalytics.map((deal) => {
                  const isActive = new Date(deal.end_date) > new Date();
                  return (
                    <tr key={deal.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{deal.title}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(deal.start_date).toLocaleDateString()} - {new Date(deal.end_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {deal.total_views.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {deal.total_redemptions.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {deal.conversion_rate > summary.average_conversion_rate ? (
                            <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                          ) : (
                            <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                          )}
                          <span className="text-sm text-gray-900">
                            {deal.conversion_rate.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          isActive 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {isActive ? 'Active' : 'Ended'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
} 