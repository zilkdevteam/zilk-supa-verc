'use client';

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '../lib/supabase';
import { MapPin, Clock, Phone, Mail } from 'lucide-react';
import AddressInput from '../components/AddressInput';
import BusinessLayout from './BusinessLayout';

interface BusinessHours {
    open: string;
    close: string;
    closed: boolean;
}

type WeeklyHours = {
    [key in 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday']: BusinessHours;
};

const defaultHours: BusinessHours = { open: '09:00', close: '17:00', closed: false };

export default function OnboardingPage() {
    const router = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        address: '',
        phone: '',
        location: {
            latitude: 0,
            longitude: 0,
        },
        hours: {
            monday: { ...defaultHours },
            tuesday: { ...defaultHours },
            wednesday: { ...defaultHours },
            thursday: { ...defaultHours },
            friday: { ...defaultHours },
            saturday: { ...defaultHours, open: '10:00', close: '15:00' },
            sunday: { ...defaultHours, closed: true },
        } as WeeklyHours,
    });

    const handleHoursChange = (day: keyof WeeklyHours, field: keyof BusinessHours, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            hours: {
                ...prev.hours,
                [day]: {
                    ...prev.hours[day],
                    [field]: value,
                },
            },
        }));
    };

    const handleAddressChange = (address: string, coordinates: { latitude: number; longitude: number }) => {
        setFormData(prev => ({
            ...prev,
            address,
            location: coordinates,
        }));
    };

    const validateForm = () => {
        if (!formData.name || !formData.phone) {
            setError('Business name and phone are required');
            return false;
        }
        if (!formData.address || formData.location.latitude === 0) {
            setError('Valid address with location is required');
            return false;
        }
        const hasValidHours = Object.values(formData.hours).some(
            day => !day.closed && day.open && day.close
        );
        if (!hasValidHours) {
            setError('At least one day must have business hours set');
            return false;
        }
        setError(null);
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router('/auth');
                return;
            }

            // Get user's email from auth if not provided in form
            const email = formData.email || user.email;
            if (!email) {
                throw new Error('Email is required');
            }

            // Update existing business record
            const { error: updateError } = await supabase
                .from('businesses')
                .update({
                    name: formData.name,
                    email: email,
                    address: formData.address,
                    phone: formData.phone,
                    location: `POINT(${formData.location.longitude} ${formData.location.latitude})`,
                    operating_hours: formData.hours,
                    is_active: true,
                })
                .eq('id', user.id);

            if (updateError) {
                throw new Error(updateError.message);
            }

            router('/business/dashboard');
        } catch (err) {
            console.error('Error updating business:', err);
            setError(err instanceof Error ? err.message : 'Failed to update business. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <BusinessLayout>
        <main className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Business Setup</h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Let's get your business set up so you can start creating deals.
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

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                    Business Name *
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                    placeholder="Your Business Name"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Business Email
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        id="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                        className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                        placeholder="business@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                    Business Phone *
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Phone className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="tel"
                                        id="phone"
                                        required
                                        value={formData.phone}
                                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                        className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                                    Business Address *
                                </label>
                                <AddressInput
                                    value={formData.address}
                                    onChange={handleAddressChange}
                                    required
                                    className="mt-1 block w-full"
                                />
                            </div>

                            <div className="pt-6 border-t border-gray-200">
                                <div className="flex items-center mb-4">
                                    <Clock className="h-5 w-5 text-gray-400 mr-2" />
                                    <h3 className="text-lg font-medium text-gray-900">Operating Hours *</h3>
                                </div>

                                {Object.entries(formData.hours).map(([day, hours]) => (
                                    <div key={day} className="flex items-center space-x-4 mb-4">
                                        <div className="w-32">
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {day}
                      </span>
                                        </div>
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={!hours.closed}
                                                onChange={(e) => handleHoursChange(day as keyof WeeklyHours, 'closed', !e.target.checked)}
                                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                            />
                                            <span className="ml-2 text-sm text-gray-900">Open</span>
                                        </label>
                                        {!hours.closed && (
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="time"
                                                    value={hours.open}
                                                    onChange={(e) => handleHoursChange(day as keyof WeeklyHours, 'open', e.target.value)}
                                                    className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                                    aria-label={`Opening time for ${day}`}
                                                />
                                                <span className="text-gray-500">to</span>
                                                <input
                                                    type="time"
                                                    value={hours.close}
                                                    onChange={(e) => handleHoursChange(day as keyof WeeklyHours, 'close', e.target.value)}
                                                    className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                                    aria-label={`Closing time for ${day}`}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end pt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                                {loading ? 'Saving...' : 'Complete Setup'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
            </BusinessLayout>
    );
}