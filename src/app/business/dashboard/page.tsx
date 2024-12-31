'use client';

import { Navigation } from '@/components/Navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { BarChart3, Tag, Users, QrCode, Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';

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
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalDeals: 0,
    activeDeals: 0,
    totalRedemptions: 0,
    totalSpins: 0,
  });
  const [recentDeals, setRecentDeals] = useState<RecentDeal[]>([]);
  const [businessName, setBusinessName] = useState('');

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/auth');
          return;
        }

        // Load business info
        const { data: business } = await supabase
          .from('businesses')
          .select('name')
          .eq('id', user.id)
          .single();

        if (business) {
          setBusinessName(business.name);
        }

        // Load stats
        const now = new Date().toISOString();
        const { data: deals } = await supabase
          .from('deals')
          .select('id, is_active')
          .eq('business_id', user.id);

        const { data: redemptions } = await supabase
          .from('deal_redemptions')
          .select('id')
          .eq('business_id', user.id)
          .eq('status', 'completed');

        const { data: spins } = await supabase
          .from('spin_attempts')
          .select('id, deal_id')
          .in('deal_id', deals?.map(d => d.id) || []);

        setStats({
          totalDeals: deals?.length || 0,
          activeDeals: deals?.filter(d => d.is_active).length || 0,
          totalRedemptions: redemptions?.length || 0,
          totalSpins: spins?.length || 0,
        });

        // Load recent deals
        const { data: recentDealsData } = await supabase
          .from('deals')
          .select(`
            id,
            title,
            end_date,
            current_redemptions
          `)
          .eq('business_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (recentDealsData) {
          setRecentDeals(recentDealsData.map(deal => ({
            id: deal.id,
            title: deal.title,
            redemptions: deal.current_redemptions,
            end_date: deal.end_date,
          })));
        }
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [router]);

  if (loading) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-gray-50 py-12">
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
        </main>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {businessName}
            </h1>
            <Link
              href="/business/deals/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create New Deal
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Tag className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Deals</dt>
                      <dd className="text-lg font-semibold text-gray-900">{stats.totalDeals}</dd>
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
                      <dt className="text-sm font-medium text-gray-500 truncate">Active Deals</dt>
                      <dd className="text-lg font-semibold text-gray-900">{stats.activeDeals}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <QrCode className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Redemptions</dt>
                      <dd className="text-lg font-semibold text-gray-900">{stats.totalRedemptions}</dd>
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
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Spins</dt>
                      <dd className="text-lg font-semibold text-gray-900">{stats.totalSpins}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Deals */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Recent Deals</h2>
              <Link
                href="/business/deals"
                className="text-sm font-medium text-primary-600 hover:text-primary-500 inline-flex items-center"
              >
                View all
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <div className="border-t border-gray-200 divide-y divide-gray-200">
              {recentDeals.map((deal) => (
                <div key={deal.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-primary-600 truncate">{deal.title}</p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {deal.redemptions} redemptions
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        Ends {new Date(deal.end_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {recentDeals.length === 0 && (
                <div className="px-4 py-12 text-center">
                  <p className="text-sm text-gray-500">No deals created yet</p>
                  <Link
                    href="/business/deals/new"
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create your first deal
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
} 