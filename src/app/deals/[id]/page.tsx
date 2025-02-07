'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navigation from '@/components/Navigation';
import { MapPin, Calendar, Compass } from 'lucide-react';
import Link from 'next/link';
import Footer from '@/components/Footer';

export default function DealPage() {
  const params = useParams();
  const [deal, setDeal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDeal();
  }, [params.id]);

  const loadDeal = async () => {
    try {
      const { data, error: dealError } = await supabase
        .from('deals')
        .select(`
          *,
          businesses (
            name,
            address,
            location
          )
        `)
        .eq('id', params.id)
        .single();

      if (dealError) throw dealError;
      setDeal(data);
    } catch (err) {
      console.error('Error loading deal:', err);
      setError('Failed to load deal');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center bg-retro-light">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-retro-accent"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !deal) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center bg-retro-light">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600">Error Loading Deal</h2>
            <p className="mt-2 text-retro-muted">{error}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow bg-retro-light py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card">
            <div className="flex flex-col space-y-6">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-display text-retro-dark">{deal.title}</h1>
                <Link
                  href={`/deals/${params.id}/spin`}
                  className="btn-primary inline-flex items-center space-x-2 text-lg font-bold"
                >
                  <Compass className="h-5 w-5" />
                  <span>Spin & Win!</span>
                </Link>
              </div>

              <div className="prose prose-lg">
                <p className="text-retro-muted">{deal.description}</p>
              </div>

              <div className="flex flex-col space-y-4">
                <div className="flex items-center text-retro-dark font-bold">
                  <MapPin className="h-5 w-5 mr-2 text-retro-primary" />
                  <span>{deal.businesses.name} - {deal.businesses.address}</span>
                </div>
                <div className="flex items-center text-retro-dark font-bold">
                  <Calendar className="h-5 w-5 mr-2 text-retro-primary" />
                  <span>Valid until {new Date(deal.end_date).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mt-6 p-6 bg-retro-accent/10 rounded-lg border-2 border-retro-accent/20">
                <h2 className="text-2xl font-display text-retro-dark mb-3">Try Your Luck!</h2>
                <p className="text-retro-dark font-bold mb-4">
                  Spin the wheel for a chance to win this deal or other exciting prizes!
                </p>
                <Link
                  href={`/deals/${params.id}/spin`}
                  className="btn-primary inline-flex items-center space-x-2 w-full justify-center text-lg font-bold shadow-retro hover:shadow-retro-lg transition-all duration-200"
                >
                  <Compass className="h-6 w-6" />
                  <span>Spin & Win!</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 