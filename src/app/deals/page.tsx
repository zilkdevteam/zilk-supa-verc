'use client';

import { Navigation } from '@/components/Navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Deal {
  id: string;
  title: string;
  description: string;
  business_name: string;
  expiration_date: string;
  terms: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{latitude: number; longitude: number} | null>(null);

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  useEffect(() => {
    async function fetchDeals() {
      try {
        const { data, error } = await supabase
          .from('deals')
          .select('*')
          .eq('is_active', true)
          .eq('requires_spin', false);

        if (error) throw error;

        // TODO: Filter deals by distance once we have location data
        setDeals(data || []);
      } catch (error) {
        console.error('Error fetching deals:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDeals();
  }, [userLocation]);

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Local Deals</h1>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading deals...</p>
            </div>
          ) : deals.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-xl text-gray-600">No deals available in your area yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {deals.map((deal) => (
                <div key={deal.id} className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-2">{deal.title}</h2>
                  <p className="text-gray-600 mb-4">{deal.description}</p>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">at {deal.business_name}</p>
                    <p className="text-sm text-gray-500">
                      Expires: {new Date(deal.expiration_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600">{deal.terms}</p>
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