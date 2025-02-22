'use client';

import Navigation from '../components/Navigation';
import DealFilters from '../components/DealFilters';
import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { MapPin, Calendar, Compass } from 'lucide-react';
import {NavLink} from 'react-router';
import Footer from '../components/Footer';

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
    const [error, setError] = useState<string | null>(null);
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
                setError(null);

                console.log('Fetching deals...');

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
            is_active,
            businesses (
              name,
              address,
              location
            )
          `)
                    .eq('is_active', true)
                    .eq('is_spin_exclusive', false);

                if (error) {
                    console.error('Supabase error:', error);
                    console.error('Error details:', {
                        code: error.code,
                        message: error.message,
                        details: error.details,
                        hint: error.hint
                    });
                    throw new Error(`Database error: ${error.message}`);
                }

                if (!data) {
                    console.log('No data returned from Supabase');
                    setDeals([]);
                    return;
                }

                console.log('Raw deals data:', data);
                console.log('Number of deals found:', data.length);

                // Transform the data to match our Deal interface
                const transformedDeals = data
                    .filter(deal => {
                        // Filter out expired deals
                        const endDate = new Date(deal.end_date);
                        const now = new Date();
                        const isValid = endDate > now;
                        if (!isValid) {
                            console.log(`Filtering out expired deal: ${deal.title}, end date: ${deal.end_date}`);
                        }
                        return isValid;
                    })
                    .map(deal => {
                        try {
                            // Safely transform the business data
                            const business = Array.isArray(deal.businesses) ? deal.businesses[0] : deal.businesses;

                            if (!business) {
                                console.warn(`No business data found for deal: ${deal.title}`);
                            }

                            return {
                                ...deal,
                                businesses: {
                                    name: business?.name || 'Unknown Business',
                                    address: business?.address || 'Address not available',
                                    location: business?.location || ''
                                }
                            };
                        } catch (err) {
                            console.error(`Error transforming deal ${deal.id}:`, err);
                            throw err;
                        }
                    });

                console.log('Transformed deals:', transformedDeals);
                setDeals(transformedDeals);
            } catch (error) {
                console.error('Error in fetchDeals:', error);
                setError(error instanceof Error ? error.message : 'Failed to load deals. Please try again later.');
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
        <div className="min-h-screen flex flex-col">
            <Navigation />
            <main className="flex-grow bg-retro-light py-8 sm:py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col space-y-6 sm:space-y-8">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0">
                            <h1 className="text-3xl sm:text-4xl font-display text-retro-dark">Deals Near You</h1>
                            <NavLink
                                to="/spin"
                                className="btn-primary inline-flex items-center justify-center space-x-2 text-base sm:text-lg font-bold py-3 px-4 sm:px-6"
                            >
                                <Compass className="h-5 w-5" />
                                <span>Spin & Win!</span>
                            </NavLink>
                        </div>

                        <DealFilters onFilterChange={setFilters} hasLocation={!!userLocation} />

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

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
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                {filteredDeals.map((deal) => (
                                    <NavLink
                                        key={deal.id}
                                        to={`/deals/${deal.id}`}
                                        className="card card-hover transition-transform hover:-translate-y-1"
                                    >
                                        <div className="flex items-start sm:items-center justify-between mb-4 gap-2">
                                            <h2 className="text-lg sm:text-xl font-display text-retro-dark">{deal.title}</h2>
                                            <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-sm font-medium bg-retro-primary/10 text-retro-primary whitespace-nowrap">
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
                                                {(() => {
                                                    const getCoordinates = (locationString: string) => {
                                                        const match = locationString.match(/POINT\((.+) (.+)\)/);
                                                        return match ? { longitude: parseFloat(match[1]), latitude: parseFloat(match[2]) } : null;
                                                    };

                                                    const location = getCoordinates(deal.businesses.location);
                                                    if (!location) return null;

                                                    const distance = calculateDistance(
                                                        userLocation.latitude,
                                                        userLocation.longitude,
                                                        location.latitude,
                                                        location.longitude
                                                    );

                                                    return `${distance.toFixed(1)} miles away`;
                                                })()}
                                            </div>
                                        )}
                                    </NavLink>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
} 