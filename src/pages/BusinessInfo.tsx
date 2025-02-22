'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router';
import BusinessLayout from './BusinessLayout';

interface BusinessInfo {
    name: string;
    description: string;
    phone: string;
    email: string;
    website: string;
    address: string;
}

export default function BusinessInfoPage() {
    const router = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [info, setInfo] = useState<BusinessInfo>({
        name: '',
        description: '',
        phone: '',
        email: '',
        website: '',
        address: '',
    });

    useEffect(() => {
        loadBusinessInfo();
    }, []);

    const loadBusinessInfo = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router('/auth');
                return;
            }

            const { data, error } = await supabase
                .from('businesses')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) throw error;

            if (data) {
                setInfo({
                    name: data.name || '',
                    description: data.description || '',
                    phone: data.phone || '',
                    email: data.email || '',
                    website: data.website || '',
                    address: data.address || '',
                });
            }
        } catch (err) {
            console.error('Error loading business info:', err);
            setError(err instanceof Error ? err.message : 'Failed to load business information');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router('/auth');
                return;
            }

            const { error } = await supabase
                .from('businesses')
                .update(info)
                .eq('id', user.id);

            if (error) throw error;

            // Show success message
            alert('Business information updated successfully!');
        } catch (err) {
            console.error('Error saving business info:', err);
            setError(err instanceof Error ? err.message : 'Failed to save business information');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <BusinessLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
                    <div className="space-y-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-10 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
                </BusinessLayout>
        );
    }

    return (
        <BusinessLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Business Information</h1>
                <p className="mt-2 text-sm text-gray-600">
                    Update your business details and contact information
                </p>
            </div>

            {error && (
                <div className="mb-8 bg-red-50 border border-red-200 rounded-md p-4">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            <div className="bg-white shadow rounded-lg">
                <form onSubmit={handleSubmit} className="space-y-6 p-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Business Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={info.name}
                            onChange={(e) => setInfo({ ...info, name: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Description
                        </label>
                        <textarea
                            id="description"
                            value={info.description}
                            onChange={(e) => setInfo({ ...info, description: e.target.value })}
                            rows={3}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            value={info.phone}
                            onChange={(e) => setInfo({ ...info, phone: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={info.email}
                            onChange={(e) => setInfo({ ...info, email: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                            Website
                        </label>
                        <input
                            type="url"
                            id="website"
                            value={info.website}
                            onChange={(e) => setInfo({ ...info, website: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                            Address
                        </label>
                        <input
                            type="text"
                            id="address"
                            value={info.address}
                            onChange={(e) => setInfo({ ...info, address: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        />
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
            </BusinessLayout>
    );
}