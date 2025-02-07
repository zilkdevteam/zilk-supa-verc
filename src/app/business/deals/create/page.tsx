'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

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

export default function CreateDealPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
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

      const { error: insertError } = await supabase
        .from('deals')
        .insert([
          {
            business_id: user.id,
            title: formData.title,
            description: formData.description,
            discount_type: formData.discount_type,
            discount_amount: discountAmount,
            start_date: formData.start_date,
            end_date: formData.end_date,
            max_redemptions: maxRedemptions,
            is_active: formData.is_active,
            current_redemptions: 0,
          },
        ]);

      if (insertError) throw insertError;

      router.push('/business/deals');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create deal');
      setLoading(false);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Create New Deal</h1>
        <p className="mt-2 text-sm text-gray-700">
          Set up a new deal or promotion for your business.
        </p>
      </div>

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

      <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow rounded-lg p-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Deal Title *
          </label>
          <input
            type="text"
            id="title"
            required
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            placeholder="e.g., Summer Special 20% Off"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description *
          </label>
          <textarea
            id="description"
            required
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            placeholder="Describe your deal..."
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="discount_type" className="block text-sm font-medium text-gray-700">
              Discount Type *
            </label>
            <select
              id="discount_type"
              required
              value={formData.discount_type}
              onChange={(e) => setFormData(prev => ({ ...prev, discount_type: e.target.value as 'percentage' | 'fixed' }))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
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
                required
                min="0"
                step={formData.discount_type === 'fixed' ? '0.01' : '1'}
                max={formData.discount_type === 'percentage' ? '100' : undefined}
                value={formData.discount_amount}
                onChange={(e) => setFormData(prev => ({ ...prev, discount_amount: e.target.value }))}
                className={`block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 ${
                  formData.discount_type === 'fixed' ? 'pl-7' : 'pl-3'
                } pr-12 py-2`}
                placeholder="0"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">
                  {formData.discount_type === 'percentage' ? '%' : ''}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
              Start Date *
            </label>
            <input
              type="datetime-local"
              id="start_date"
              required
              value={formData.start_date}
              onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div>
            <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
              End Date *
            </label>
            <input
              type="datetime-local"
              id="end_date"
              required
              value={formData.end_date}
              onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div>
            <label htmlFor="max_redemptions" className="block text-sm font-medium text-gray-700">
              Maximum Redemptions
            </label>
            <input
              type="number"
              id="max_redemptions"
              min="1"
              value={formData.max_redemptions}
              onChange={(e) => setFormData(prev => ({ ...prev, max_redemptions: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="Leave empty for unlimited"
            />
            <p className="mt-1 text-sm text-gray-500">
              Optional. Leave empty for unlimited redemptions.
            </p>
          </div>

          <div className="flex items-center">
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700 mr-3">
              Active Status
            </label>
            <div className="relative inline-block w-10 mr-2 align-middle select-none">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="sr-only"
              />
              <div
                className={`block h-6 w-10 rounded-full ${
                  formData.is_active ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <div
                  className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transform transition-transform ${
                    formData.is_active ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </div>
            </div>
            <span className="text-sm text-gray-500">
              {formData.is_active ? 'Deal is active' : 'Deal is inactive'}
            </span>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.push('/business/deals')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Deal'}
          </button>
        </div>
      </form>
    </main>
  );
} 