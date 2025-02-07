'use client';

import Navigation from '@/components/Navigation';
import DealFilters from '@/components/DealFilters';
import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { MapPin, Calendar, Compass } from 'lucide-react';
import Link from 'next/link';

interface Deal {
  id: string;
  title: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_amount: number;
  start_date: string;
  end_date: string;
  business_id: string;
  businesses: {
    name: string;
    address: string;
    location: string; // Supabase returns POINT as string
  };
}

interface FilterOptions {
  search: string;
  sortBy: 'distance' | 'discount' | 'endDate';
  discountType: 'all' | 'percentage' | 'fixed';
  maxDistance: number;
}

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{latitude: number; longitude: number} | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    sortBy: 'distance',
    discountType: 'all',
    maxDistance: 50,
  });

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
        setLoading(true);
        const { data, error } = await supabase
          .from('deals')
          .select(`
            id,
            title,
            description,
            discount_type,
            discount_amount,
            start_date,
            end_date,
            business_id,
            businesses (
              name,
              address,
              location
            )
          `)
          .eq('is_active', true)
          .is('is_spin_exclusive', false)
          .gte('end_date', new Date().toISOString());

        if (error) throw error;
        
        // Transform the data to match our Deal interface
        const transformedDeals = (data || []).map(deal => ({
          ...deal,
          businesses: {
            name: deal.businesses.name,
            address: deal.businesses.address,
            location: deal.businesses.location
          }
        }));

        setDeals(transformedDeals);
      } catch (error) {
        console.error('Error fetching deals:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDeals();
  }, []);

  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  function formatDiscount(deal: Deal): string {
    return deal.discount_type === 'percentage'
      ? `${deal.discount_amount}% off`
      : `$${deal.discount_amount.toFixed(2)} off`;
  }

  const filteredDeals = useMemo(() => {
    let filtered = [...deals];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(deal => 
        deal.title.toLowerCase().includes(searchLower) ||
        deal.description.toLowerCase().includes(searchLower) ||
        deal.businesses.name.toLowerCase().includes(searchLower)
      );
    }

    // Apply discount type filter
    if (filters.discountType !== 'all') {
      filtered = filtered.filter(deal => deal.discount_type === filters.discountType);
    }

    // Sort deals
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'distance':
          if (!userLocation) return 0;
          // Parse location string from Supabase POINT type
          const getCoordinates = (locationString: string) => {
            const match = locationString.match(/POINT\((.+) (.+)\)/);
            return match ? { longitude: parseFloat(match[1]), latitude: parseFloat(match[2]) } : null;
          };
          
          const locationA = getCoordinates(a.businesses.location);
          const locationB = getCoordinates(b.businesses.location);
          
          if (!locationA || !locationB) return 0;
          
          const distA = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            locationA.latitude,
            locationA.longitude
          );
          const distB = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            locationB.latitude,
            locationB.longitude
          );
          return distA - distB;
        
        case 'discount':
          if (a.discount_type === b.discount_type) {
            return b.discount_amount - a.discount_amount;
          }
          return a.discount_type === 'percentage' ? -1 : 1;
        
        case 'endDate':
          return new Date(a.end_date).getTime() - new Date(b.end_date).getTime();
        
        default:
          return 0;
      }
    });

    return filtered;
  }, [deals, filters, userLocation]);

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-retro-light py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col space-y-8">
            <div className="flex justify-between items-center">
              <h1 className="text-4xl font-display text-retro-dark">Deals Near You</h1>
              <Link
                href="/spin"
                className="btn-primary inline-flex items-center space-x-2 text-lg font-bold"
              >
                <Compass className="h-5 w-5" />
                <span>Spin & Win!</span>
              </Link>
            </div>

            <DealFilters onFilterChange={setFilters} hasLocation={!!userLocation} />
            
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-retro-primary mx-auto"></div>
                <p className="mt-4 text-retro-muted">Loading deals...</p>
              </div>
            ) : deals.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border-2 border-retro-dark shadow-retro">
                <p className="text-xl text-retro-dark">No deals available in your area yet.</p>
                {!userLocation && (
                  <p className="mt-2 text-sm text-retro-muted">
                    Enable location services to see deals near you.
                  </p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDeals.map((deal) => (
                  <div key={deal.id} className="card card-hover transition-transform hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-display text-retro-dark">{deal.title}</h2>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-retro-primary/10 text-retro-primary">
                        {formatDiscount(deal)}
                      </span>
                    </div>
                    <p className="text-retro-muted mb-4">{deal.description}</p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center text-retro-muted">
                        <MapPin className="h-5 w-5 mr-2 text-retro-primary" />
                        <span>{deal.businesses.name}</span>
                      </div>
                      <div className="flex items-center text-retro-muted">
                        <Calendar className="h-5 w-5 mr-2 text-retro-primary" />
                        <span>Ends {new Date(deal.end_date).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {userLocation && deal.businesses.location && (
                      <div className="mt-4 text-sm text-retro-muted">
                        {calculateDistance(
                          userLocation.latitude,
                          userLocation.longitude,
                          deal.businesses.location.latitude,
                          deal.businesses.location.longitude
                        ).toFixed(1)} miles away
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
} 