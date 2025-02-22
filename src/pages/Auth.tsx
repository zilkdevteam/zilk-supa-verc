'use client';

import { useState } from 'react';
import { useNavigate,NavLink } from 'react-router';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function AuthPage() {
    const navigate = useNavigate();
    const [isRegistering, setIsRegistering] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        businessName: '',
        adminPassword: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;

        setLoading(true);
        setError(null);

        try {
            if (isRegistering) {
                // Validate admin password
                if (formData.adminPassword !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
                    throw new Error('Invalid admin password');
                }

                // Sign up with auto-confirm
                const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.password,
                    options: {
                        data: {
                            business_name: formData.businessName,
                        },
                    },
                });

                if (signUpError) throw signUpError;
                if (!signUpData.user) throw new Error('Registration failed - no user data received');

                // Create business record
                const { error: businessError } = await supabase
                    .from('businesses')
                    .insert([
                        {
                            id: signUpData.user.id,
                            name: formData.businessName,
                            email: formData.email,
                        },
                    ]);

                if (businessError) throw businessError;

                // If we have a session, redirect to onboarding
                if (signUpData.session) {
                    window.location.href = '/business/onboarding';
                    return;
                }

                // Otherwise, show success message and switch to sign-in
                setError('Registration successful! Please sign in with your credentials.');
                setIsRegistering(false);
                setFormData({
                    email: '',
                    password: '',
                    businessName: '',
                    adminPassword: '',
                });
            } else {
                // Sign in
                const { data, error: signInError } = await supabase.auth.signInWithPassword({
                    email: formData.email,
                    password: formData.password,
                });

                if (signInError) throw signInError;

                if (data?.session) {
                    // Check if business exists
                    const { data: business, error: businessError } = await supabase
                        .from('businesses')
                        .select('id')
                        .eq('id', data.session.user.id)
                        .single();

                    if (businessError && businessError.code === 'PGRST116') {
                        window.location.href = '/business/onboarding';
                    } else if (businessError) {
                        throw businessError;
                    } else {
                        window.location.href = '/business/dashboard';
                    }
                }
            }
        } catch (err) {
            console.error('Auth error:', err);
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 flex flex-col items-center justify-center p-4 relative">
            {/* Back Button */}
            <NavLink
                to="/"
                className="absolute top-4 left-4 inline-flex items-center text-gray-600 hover:text-retro-primary transition-colors"
            >
                <ArrowLeft className="h-5 w-5 mr-1" />
                Back
            </NavLink>

            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <NavLink to="/" className="inline-block">
                        <h1 className="text-4xl font-medium text-retro-primary">
                            Zilk
                        </h1>
                    </NavLink>
                    <p className="mt-2 text-gray-600">
                        {isRegistering ? 'Register your business' : 'Sign in to your business account'}
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-[0_2px_40px_-12px_rgba(0,0,0,0.1)] border border-gray-100 p-8">
                    {error && (
                        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {isRegistering && (
                            <>
                                <div>
                                    <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
                                        Business Name
                                    </label>
                                    <input
                                        type="text"
                                        id="businessName"
                                        required
                                        value={formData.businessName}
                                        onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                                        className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-retro-primary focus:ring-1 focus:ring-retro-primary"
                                        placeholder="Your Business Name"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="adminPassword" className="block text-sm font-medium text-gray-700">
                                        Admin Password
                                    </label>
                                    <input
                                        type="password"
                                        id="adminPassword"
                                        required
                                        value={formData.adminPassword}
                                        onChange={(e) => setFormData(prev => ({ ...prev, adminPassword: e.target.value }))}
                                        className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-retro-primary focus:ring-1 focus:ring-retro-primary"
                                        placeholder="Enter admin password"
                                    />
                                </div>
                            </>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Business Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-retro-primary focus:ring-1 focus:ring-retro-primary"
                                placeholder="email@business.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="relative mt-1">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                    className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-retro-primary focus:ring-1 focus:ring-retro-primary"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 rounded-full bg-retro-primary text-white hover:bg-retro-primary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                                isRegistering ? 'Create Account' : 'Sign In'
                            )}
                        </button>
                    </form>

                    <div className="mt-6">
                        <button
                            onClick={() => {
                                setIsRegistering(!isRegistering);
                                setError(null);
                                setFormData({
                                    email: '',
                                    password: '',
                                    businessName: '',
                                    adminPassword: '',
                                });
                            }}
                            className="w-full text-center text-sm text-gray-600 hover:text-retro-primary transition-colors"
                        >
                            {isRegistering ? 'Already have an account? Sign in' : 'Need to register your business?'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}