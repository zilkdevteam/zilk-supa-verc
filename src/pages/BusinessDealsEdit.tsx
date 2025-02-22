'use client';

import { Navigation } from '../components/Navigation';
import { useState, useEffect } from 'react';
import {useNavigate, useParams} from 'react-router';
import { supabase } from '../lib/supabase';
import BusinessLayout from './BusinessLayout';

interface FormData {
    title: string;
    description: string;
    discount_type: 'percentage' | 'fixed';
    discount_amount: string;
    start_date: string;
    end_date: string;
    max_redemptions: string;
    is_active: boolean;
}

interface Props {
    params: {
        id: string;
    };
}

export default function EditDealPage() {
    const params = useParams()
    const router = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<FormData>({
        title: '',
        description: '',
        discount_type: 'percentage',
        discount_amount: '',
        start_date: '',
        end_date: '',
        max_redemptions: '',
        is_active: true,
    });

    useEffect(() => {
        fetchDeal();
    }, [params.id]);

    const fetchDeal = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { data: deal, error } = await supabase
                .from('deals')
                .select('*')
                .eq('id', params.id)
                .eq('business_id', user.id)
                .single();

            if (error) throw error;
            if (!deal) throw new Error('Deal not found');

            // Format dates for datetime-local input
            const formatDate = (date: string) => {
                return new Date(date).toISOString().slice(0, 16);
            };

            setFormData({
                title: deal.title,
                description: deal.description,
                discount_type: deal.discount_type,
                discount_amount: deal.discount_amount.toString(),
                start_date: formatDate(deal.start_date),
                end_date: formatDate(deal.end_date),
                max_redemptions: deal.max_redemptions?.toString() || '',
                is_active: deal.is_active,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load deal');
            router('/business/deals');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            // Validate discount amount
            const discountAmount = parseFloat(formData.discount_amount);
            if (isNaN(discountAmount) || discountAmount <= 0) {
                throw new Error('Please enter a valid discount amount');
            }
            if (formData.discount_type === 'percentage' && discountAmount > 100) {
                throw new Error('Percentage discount cannot be greater than 100%');
            }

            // Validate dates
            const startDate = new Date(formData.start_date);
            const endDate = new Date(formData.end_date);
            const now = new Date();

            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                throw new Error('Please enter valid dates');
            }
            if (endDate <= startDate) {
                throw new Error('End date must be after start date');
            }

            // Validate max redemptions
            const maxRedemptions = formData.max_redemptions ? parseInt(formData.max_redemptions) : null;
            if (formData.max_redemptions && (isNaN(maxRedemptions!) || maxRedemptions! <= 0)) {
                throw new Error('Maximum redemptions must be a positive number');
            }

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { error: updateError } = await supabase
                .from('deals')
                .update({
                    title: formData.title,
                    description: formData.description,
                    discount_type: formData.discount_type,
                    discount_amount: discountAmount,
                    start_date: formData.start_date,
                    end_date: formData.end_date,
                    max_redemptions: maxRedemptions,
                    is_active: formData.is_active,
                })
                .eq('id', params.id)
                .eq('business_id', user.id);

            if (updateError) throw updateError;

            router('/business/deals');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update deal');
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <BusinessLayout>
            <div className="bg-retro-light min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-white/50 rounded w-1/4 mb-4"></div>
                        <div className="h-4 bg-white/50 rounded w-1/2 mb-8"></div>
                        <div className="bg-white shadow-retro rounded-lg border-2 border-retro-dark/10 p-6">
                            <div className="space-y-6">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="h-10 bg-retro-light/50 rounded"></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
                </BusinessLayout>
        );
    }

    return (
        <BusinessLayout>
        <div className="bg-retro-light min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-display text-retro-dark">Edit Deal</h1>
                        <p className="mt-2 text-sm text-retro-muted">
                            Make changes to your deal details below.
                        </p>
                    </div>
                </div>

                <div className="bg-white shadow-retro rounded-lg border-2 border-retro-dark/10 p-6">
                    {error && (
                        <div className="mb-6 rounded-md bg-red-50 p-4 border-2 border-red-100">
                            <div className="flex">
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                                    <div className="mt-2 text-sm text-red-700">
                                        <p>{error}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-retro-dark">
                                Deal Title *
                            </label>
                            <input
                                type="text"
                                id="title"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                className="mt-1 block w-full rounded-md border-2 border-retro-dark/10 px-3 py-2 shadow-retro focus:border-retro-primary focus:outline-none focus:ring-1 focus:ring-retro-primary"
                                placeholder="e.g., Summer Special 20% Off"
                            />
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-retro-dark">
                                Description *
                            </label>
                            <textarea
                                id="description"
                                required
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                rows={3}
                                className="mt-1 block w-full rounded-md border-2 border-retro-dark/10 px-3 py-2 shadow-retro focus:border-retro-primary focus:outline-none focus:ring-1 focus:ring-retro-primary"
                                placeholder="Describe your deal..."
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label htmlFor="discount_type" className="block text-sm font-medium text-retro-dark">
                                    Discount Type *
                                </label>
                                <select
                                    id="discount_type"
                                    required
                                    value={formData.discount_type}
                                    onChange={(e) => setFormData(prev => ({ ...prev, discount_type: e.target.value as 'percentage' | 'fixed' }))}
                                    className="mt-1 block w-full rounded-md border-2 border-retro-dark/10 px-3 py-2 shadow-retro focus:border-retro-primary focus:outline-none focus:ring-1 focus:ring-retro-primary"
                                >
                                    <option value="percentage">Percentage Off</option>
                                    <option value="fixed">Fixed Amount Off</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="discount_amount" className="block text-sm font-medium text-retro-dark">
                                    Discount Amount *
                                </label>
                                <div className="mt-1 relative rounded-md shadow-retro">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-retro-muted sm:text-sm">
                      {formData.discount_type === 'fixed' ? '$' : ''}
                    </span>
                                    </div>
                                    <input
                                        type="number"
                                        id="discount_amount"
                                        required
                                        min="0"
                                        step={formData.discount_type === 'fixed' ? '0.01' : '1'}
                                        max={formData.discount_type === 'percentage' ? '100' : undefined}
                                        value={formData.discount_amount}
                                        onChange={(e) => setFormData(prev => ({ ...prev, discount_amount: e.target.value }))}
                                        className={`block w-full rounded-md border-2 border-retro-dark/10 shadow-retro focus:border-retro-primary focus:outline-none focus:ring-1 focus:ring-retro-primary ${
                                            formData.discount_type === 'fixed' ? 'pl-7' : 'pl-3'
                                        } pr-12 py-2`}
                                        placeholder="0"
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-retro-muted sm:text-sm">
                      {formData.discount_type === 'percentage' ? '%' : ''}
                    </span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="start_date" className="block text-sm font-medium text-retro-dark">
                                    Start Date *
                                </label>
                                <input
                                    type="datetime-local"
                                    id="start_date"
                                    required
                                    value={formData.start_date}
                                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                                    className="mt-1 block w-full rounded-md border-2 border-retro-dark/10 px-3 py-2 shadow-retro focus:border-retro-primary focus:outline-none focus:ring-1 focus:ring-retro-primary"
                                />
                            </div>

                            <div>
                                <label htmlFor="end_date" className="block text-sm font-medium text-retro-dark">
                                    End Date *
                                </label>
                                <input
                                    type="datetime-local"
                                    id="end_date"
                                    required
                                    value={formData.end_date}
                                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                                    className="mt-1 block w-full rounded-md border-2 border-retro-dark/10 px-3 py-2 shadow-retro focus:border-retro-primary focus:outline-none focus:ring-1 focus:ring-retro-primary"
                                />
                            </div>

                            <div>
                                <label htmlFor="max_redemptions" className="block text-sm font-medium text-retro-dark">
                                    Maximum Redemptions
                                </label>
                                <input
                                    type="number"
                                    id="max_redemptions"
                                    min="1"
                                    value={formData.max_redemptions}
                                    onChange={(e) => setFormData(prev => ({ ...prev, max_redemptions: e.target.value }))}
                                    className="mt-1 block w-full rounded-md border-2 border-retro-dark/10 px-3 py-2 shadow-retro focus:border-retro-primary focus:outline-none focus:ring-1 focus:ring-retro-primary"
                                    placeholder="Leave empty for unlimited"
                                />
                                <p className="mt-1 text-sm text-retro-muted">
                                    Optional. Leave empty for unlimited redemptions.
                                </p>
                            </div>

                            <div className="flex items-center">
                                <label htmlFor="is_active" className="text-sm font-medium text-retro-dark mr-3">
                                    Deal Status
                                </label>
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked="true"
                                    aria-label={`Toggle deal status: ${formData.is_active ? 'Active' : 'Inactive'}`}
                                    onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
                                    className={`relative inline-flex h-8 w-16 items-center rounded-full border-2 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-retro-primary focus:ring-offset-2 ${
                                        formData.is_active ? 'bg-retro-primary border-retro-primary' : 'bg-retro-muted/20 border-retro-dark/10'
                                    }`}
                                >
                  <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white border-2 border-retro-dark/10 transition-transform duration-200 ease-in-out ${
                          formData.is_active ? 'translate-x-8' : 'translate-x-0'
                      }`}
                  />
                                </button>
                                <span className={`ml-2 text-sm font-medium ${
                                    formData.is_active ? 'text-retro-primary' : 'text-retro-muted'
                                }`}>
                  {formData.is_active ? 'Active' : 'Inactive'}
                </span>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => router.push('/business/deals')}
                                className="px-4 py-2 rounded-md shadow-retro text-sm font-medium text-retro-dark bg-white border-2 border-retro-dark/10 hover:bg-retro-light/50 transition-colors focus:outline-none focus:ring-2 focus:ring-retro-primary focus:ring-offset-2"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-4 py-2 rounded-md shadow-retro text-sm font-medium text-white bg-retro-primary hover:bg-retro-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-retro-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
            </BusinessLayout>
    );
} 