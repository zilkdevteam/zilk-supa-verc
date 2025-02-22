'use client';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '../lib/supabase';
import Navigation from '../components/Navigation';
import BusinessNavigation from '../components/BusinessNavigation';
import Footer from '../components/Footer';

export default function BusinessLayout({
                                           children,
                                       }: {
    children: React.ReactNode;
}) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    navigate('/auth');
                    return;
                }

                // Check if user has a business account
                const { data: business, error } = await supabase
                    .from('businesses')
                    .select('id')
                    .eq('id', user.id)
                    .single();

                if (error || !business) {
                    navigate('/business/onboarding');
                    return;
                }

                setLoading(false);
            } catch (error) {
                console.error('Error checking auth:', error);
                navigate('/auth');
            }
        };

        checkAuth();
    }, [navigate]);

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
        <div className="min-h-screen bg-retro-light flex flex-col">
            <Navigation />
            <BusinessNavigation />
            <main className="py-8 flex-grow">{children}</main>
            <Footer />
        </div>
    );
}