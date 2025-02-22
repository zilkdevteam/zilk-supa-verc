import { useEffect } from 'react';
import { useNavigate , useNavigationType} from 'react-router';
import { supabase } from '../lib/supabase';
import BusinessLayout from "./BusinessLayout.tsx";

export default function BusinessPage() {
    const navigate = useNavigate();
    const navigationType = useNavigationType();

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/auth');
                return;
            }

            // Fix for being unable to go backwards
            if(navigationType == "POP"){
                navigate(-1);
            }

            // Redirect to deals page by default
            navigate('/business/deals');
        };

        checkAuth();
    }, [navigate]);

    // Show loading state while redirecting
    return (
        <BusinessLayout>
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-retro-primary"></div>
        </div>
        </BusinessLayout>
    );
}