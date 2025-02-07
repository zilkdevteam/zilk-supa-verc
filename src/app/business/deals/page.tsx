'use client';

import { useEffect, useState, useMemo } from 'react';
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
  const [filters, setFilters] = useState({
    status: 'all', // 'all' | 'active' | 'inactive'
    sortBy: 'newest', // 'newest' | 'oldest' | 'redemptions'
  });

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

  const filteredDeals = useMemo(() => {
    let filtered = [...deals];

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(deal => 
        filters.status === 'active' ? deal.is_active : !deal.is_active
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'oldest':
          return new Date(a.end_date).getTime() - new Date(b.end_date).getTime();
        case 'redemptions':
          return b.redemptions - a.redemptions;
        case 'newest':
        default:
          return new Date(b.end_date).getTime() - new Date(a.end_date).getTime();
      }
    });

    return filtered;
  }, [deals, filters]);

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
          <h1 className="text-3xl font-display text-retro-dark">Deal Management</h1>
          <p className="mt-2 text-sm text-retro-muted">
            Create and manage your deals
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            href="/business/deals/create"
            className="inline-flex items-center px-4 py-2 rounded-md shadow-retro text-sm font-medium text-white bg-retro-primary hover:bg-retro-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-retro-primary focus:ring-offset-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Deal
          </Link>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow-retro rounded-lg border-2 border-retro-dark/10">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Tag className="h-6 w-6 text-retro-primary" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-retro-muted truncate">Total Deals</dt>
                  <dd className="text-lg font-semibold text-retro-dark">{stats.totalDeals}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-retro rounded-lg border-2 border-retro-dark/10">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Tag className="h-6 w-6 text-retro-primary" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-retro-muted truncate">Active Deals</dt>
                  <dd className="text-lg font-semibold text-retro-dark">{stats.activeDeals}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-retro rounded-lg border-2 border-retro-dark/10">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Tag className="h-6 w-6 text-retro-primary" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-retro-muted truncate">Total Redemptions</dt>
                  <dd className="text-lg font-semibold text-retro-dark">{stats.totalRedemptions}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="mt-8 bg-white shadow-retro rounded-lg border-2 border-retro-dark/10 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-retro-dark mb-1">
              Status
            </label>
            <select
              id="status-filter"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="block w-full rounded-md border-2 border-retro-dark/10 px-3 py-1.5 text-sm shadow-retro focus:border-retro-primary focus:outline-none focus:ring-1 focus:ring-retro-primary"
            >
              <option value="all">All Deals</option>
              <option value="active">Active Deals</option>
              <option value="inactive">Inactive Deals</option>
            </select>
          </div>
          <div>
            <label htmlFor="sort-by" className="block text-sm font-medium text-retro-dark mb-1">
              Sort By
            </label>
            <select
              id="sort-by"
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
              className="block w-full rounded-md border-2 border-retro-dark/10 px-3 py-1.5 text-sm shadow-retro focus:border-retro-primary focus:outline-none focus:ring-1 focus:ring-retro-primary"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="redemptions">Most Redemptions</option>
            </select>
          </div>
        </div>
      </div>

      {/* Deals List */}
      <div className="mt-4 bg-white shadow-retro rounded-lg border-2 border-retro-dark/10">
        <div className="px-4 py-5 sm:px-6 border-b-2 border-retro-dark/10">
          <h3 className="text-lg font-display text-retro-dark">
            Your Deals {filters.status !== 'all' && `(${filters.status})`}
          </h3>
        </div>
        
        {filteredDeals.length > 0 ? (
          filteredDeals.map((deal) => (
            <div key={deal.id} className="px-4 py-4 sm:px-6 hover:bg-retro-light/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Link 
                    href={`/business/deals/${deal.id}`}
                    className="text-sm font-medium text-retro-primary truncate hover:text-retro-primary/80 transition-colors"
                  >
                    {deal.title}
                  </Link>
                  <Link
                    href={`/business/deals/${deal.id}/edit`}
                    className="px-2 py-1 text-xs font-medium text-retro-dark bg-retro-light border-2 border-retro-dark/10 rounded-md hover:bg-retro-light/80 transition-colors shadow-retro"
                  >
                    Edit Deal
                  </Link>
                </div>
                <div className="ml-2 flex-shrink-0 flex items-center space-x-4">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    deal.is_active 
                      ? 'bg-retro-primary/20 text-retro-primary'
                      : 'bg-retro-muted/20 text-retro-muted'
                  }`}>
                    {deal.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-retro-accent/20 text-retro-accent">
                    {deal.redemptions} redemptions
                  </p>
                </div>
              </div>
              <div className="mt-2 sm:flex sm:justify-between">
                <div className="sm:flex">
                  <p className="flex items-center text-sm text-retro-muted">
                    Ends {new Date(deal.end_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="px-4 py-12 text-center">
            <p className="text-sm text-retro-muted">
              {filters.status === 'all' 
                ? 'No deals created yet'
                : `No ${filters.status} deals found`}
            </p>
            <Link
              href="/business/deals/create"
              className="mt-4 inline-flex items-center px-4 py-2 rounded-md shadow-retro text-sm font-medium text-white bg-retro-primary hover:bg-retro-primary/90 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create your first deal
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 