'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Tag, Plus } from 'lucide-react';
import Link from 'next/link';

interface DealStats {
  totalDeals: number;
  activeDeals: number;
  totalRedemptions: number;
}

interface Deal {
  id: string;
  title: string;
  redemptions: number;
  end_date: string;
  is_active: boolean;
}

export default function DealsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DealStats>({
    totalDeals: 0,
    activeDeals: 0,
    totalRedemptions: 0,
  });
  const [deals, setDeals] = useState<Deal[]>([]);

  useEffect(() => {
    loadDealsData();
  }, []);

  const loadDealsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data: deals, error: dealsError } = await supabase
        .from('deals')
        .select(`
          id,
          title,
          is_active,
          end_date,
          current_redemptions
        `)
        .eq('business_id', user.id)
        .order('created_at', { ascending: false });

      if (dealsError) throw dealsError;

      // Calculate stats
      const activeDeals = deals?.filter(d => d.is_active).length || 0;
      const totalRedemptions = deals?.reduce((sum, deal) => 
        sum + (deal.current_redemptions || 0), 0) || 0;

      setStats({
        totalDeals: deals?.length || 0,
        activeDeals,
        totalRedemptions,
      });

      setDeals(deals?.map(deal => ({
        id: deal.id,
        title: deal.title,
        redemptions: deal.current_redemptions || 0,
        end_date: deal.end_date,
        is_active: deal.is_active,
      })) || []);

    } catch (err) {
      console.error('Error loading deals:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
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
    );
  }

  if (error) {
    return (
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
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Deal Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            Create and manage your deals
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            href="/business/deals/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Deal
          </Link>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                <Tag className="h-6 w-6 text-primary-600" />
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
                <Tag className="h-6 w-6 text-primary-600" />
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
      </div>

      {/* Deals List */}
      <div className="mt-8 bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Your Deals
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {deals.map((deal) => (
            <div key={deal.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <Link 
                  href={`/business/deals/${deal.id}`}
                  className="text-sm font-medium text-primary-600 truncate hover:text-primary-900"
                >
                  {deal.title}
                </Link>
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
                <div className="mt-2 sm:mt-0">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    deal.is_active 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {deal.is_active ? 'Active' : 'Ended'}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {deals.length === 0 && (
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
  );
} 