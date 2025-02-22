'use client';

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '../lib/supabase';
import BusinessLayout from './BusinessLayout';

export default function NewDealPage() {
    const router = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        terms: '',
        start_date: '',
        end_date: '',
        discount_type: 'percentage' as 'percentage' | 'fixed',
        discount_amount: '',
        max_redemptions: '',
        is_active: true,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router('/auth');
                return;
            }

            // Validate required fields
            if (!formData.title || !formData.description || !formData.start_date || !formData.end_date || !formData.discount_amount) {
                throw new Error('Please fill in all required fields');
            }

            // Validate dates
            const startDate = new Date(formData.start_date);
            const endDate = new Date(formData.end_date);
            if (endDate <= startDate) {
                throw new Error('End date must be after start date');
            }

            // Validate discount amount
            const discountAmount = parseFloat(formData.discount_amount);
            if (isNaN(discountAmount) || discountAmount <= 0) {
                throw new Error('Please enter a valid discount amount');
            }
            if (formData.discount_type === 'percentage' && discountAmount > 100) {
                throw new Error('Percentage discount cannot be greater than 100%');
            }

            // Validate max redemptions if provided
            let maxRedemptions = null;
            if (formData.max_redemptions) {
                maxRedemptions = parseInt(formData.max_redemptions);
                if (isNaN(maxRedemptions) || maxRedemptions <= 0) {
                    throw new Error('Maximum redemptions must be a positive number');
                }
            }

            const { error: insertError } = await supabase.from('deals').insert([
                {
                    business_id: user.id,
                    title: formData.title,
                    description: formData.description,
                    terms: formData.terms,
                    start_date: formData.start_date,
                    end_date: formData.end_date,
                    discount_type: formData.discount_type,
                    discount_amount: discountAmount,
                    max_redemptions: maxRedemptions,
                    is_active: formData.is_active,
                    current_redemptions: 0,
                },
            ]);

            if (insertError) throw insertError;

            router('/business/dashboard');
        } catch (err) {
            console.error('Error creating deal:', err);
            setError(err instanceof Error ? err.message : 'Failed to create deal');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    return (
        <BusinessLayout>
        <main className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-4xl font-bold mb-8">Create New Deal</h1>

                {error && (
                    <div className="mb-6 rounded-md bg-red-50 p-4">
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

                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                Deal Title *
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                required
                                value={formData.title}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                Description *
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                required
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="terms" className="block text-sm font-medium text-gray-700">
                                Terms & Conditions
                            </label>
                            <textarea
                                id="terms"
                                name="terms"
                                value={formData.terms}
                                onChange={handleChange}
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="discount_type" className="block text-sm font-medium text-gray-700">
                                    Discount Type *
                                </label>
                                <select
                                    id="discount_type"
                                    name="discount_type"
                                    required
                                    value={formData.discount_type}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="percentage">Percentage Off</option>
                                    <option value="fixed">Fixed Amount Off</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="discount_amount" className="block text-sm font-medium text-gray-700">
                                    Discount Amount *
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">
                      {formData.discount_type === 'fixed' ? '$' : ''}
                    </span>
                                    </div>
                                    <input
                                        type="number"
                                        id="discount_amount"
                                        name="discount_amount"
                                        required
                                        min="0"
                                        step={formData.discount_type === 'fixed' ? '0.01' : '1'}
                                        max={formData.discount_type === 'percentage' ? '100' : undefined}
                                        value={formData.discount_amount}
                                        onChange={handleChange}
                                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                                            formData.discount_type === 'fixed' ? 'pl-7' : 'pl-3'
                                        }`}
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">
                      {formData.discount_type === 'percentage' ? '%' : ''}
                    </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
                                    Start Date *
                                </label>
                                <input
                                    type="datetime-local"
                                    id="start_date"
                                    name="start_date"
                                    required
                                    value={formData.start_date}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
                                    End Date *
                                </label>
                                <input
                                    type="datetime-local"
                                    id="end_date"
                                    name="end_date"
                                    required
                                    value={formData.end_date}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="max_redemptions" className="block text-sm font-medium text-gray-700">
                                Maximum Redemptions
                            </label>
                            <input
                                type="number"
                                id="max_redemptions"
                                name="max_redemptions"
                                min="1"
                                value={formData.max_redemptions}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                placeholder="Leave empty for unlimited"
                            />
                            <p className="mt-1 text-sm text-gray-500">
                                Optional. Leave empty for unlimited redemptions.
                            </p>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="is_active"
                                name="is_active"
                                checked={formData.is_active}
                                onChange={handleChange}
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                                Make deal active immediately
                            </label>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => router(-1)}
                            className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            {loading ? 'Creating...' : 'Create Deal'}
                        </button>
                    </div>
                </form>
            </div>
        </main>
            </BusinessLayout>
    );
}