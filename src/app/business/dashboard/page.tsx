'use client';

import { Navigation } from '@/components/Navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface BusinessDeal {
  id: string;
  title: string;
  description: string;
  expiration_date: string;
  is_active: boolean;
  requires_spin: boolean;
  redemption_count: number;
  view_count: number;
}

export default function BusinessDashboard() {
  const router = useRouter();
  const [deals, setDeals] = useState<BusinessDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }
      setUser(user);
    }

    checkAuth();
  }, [router]);

  useEffect(() => {
    if (!user) return;

    async function fetchDeals() {
      try {
        const { data, error } = await supabase
          .from('deals')
          .select('*')
          .eq('business_id', user.id);

        if (error) throw error;
        setDeals(data || []);
      } catch (error) {
        console.error('Error fetching deals:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDeals();
  }, [user]);

  const handleCreateDeal = () => {
    router.push('/business/deals/new');
  };

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">Business Dashboard</h1>
            <button
              onClick={handleCreateDeal}
              className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700"
            >
              Create New Deal
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading your deals...</p>
            </div>
          ) : deals.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-xl text-gray-600 mb-4">You haven't created any deals yet.</p>
              <button
                onClick={handleCreateDeal}
                className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700"
              >
                Create Your First Deal
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {deals.map((deal) => (
                <div key={deal.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-semibold">{deal.title}</h2>
                      <p className="text-gray-600">{deal.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      deal.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {deal.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-sm text-gray-600">Redemptions</p>
                      <p className="text-2xl font-semibold">{deal.redemption_count}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-sm text-gray-600">Views</p>
                      <p className="text-2xl font-semibold">{deal.view_count}</p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600">
                      Expires: {new Date(deal.expiration_date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      Type: {deal.requires_spin ? 'Spin Wheel' : 'Regular Deal'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
} 