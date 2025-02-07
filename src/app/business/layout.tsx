'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navigation from '@/components/Navigation';
import BusinessNavigation from '@/components/BusinessNavigation';

export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/auth');
          return;
        }

        // Check if user has a business account
        const { data: business, error } = await supabase
          .from('businesses')
          .select('id')
          .eq('id', user.id)
          .single();

        if (error || !business) {
          router.push('/business/onboarding');
          return;
        }

        setLoading(false);
      } catch (error) {
        console.error('Error checking auth:', error);
        router.push('/auth');
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-retro-light">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-retro-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-retro-light">
      <Navigation />
      <BusinessNavigation />
      <main className="py-8">{children}</main>
    </div>
  );
} 