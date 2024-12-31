'use client';

import { Navigation } from '@/components/Navigation';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { MapPin, Clock, Phone } from 'lucide-react';

interface BusinessHours {
  open: string;
  close: string;
  closed: boolean;
}

type WeeklyHours = {
  [key in 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday']: BusinessHours;
};

const defaultHours: BusinessHours = { open: '09:00', close: '17:00', closed: false };

export default function BusinessOnboarding() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }

      // Convert address to coordinates (you'll need to implement this)
      // For now, we'll use dummy coordinates
      const coordinates = { latitude: 40.7128, longitude: -74.0060 };

      const { error } = await supabase.from('businesses').insert([
        {
          id: user.id,
          name: formData.name,
          address: formData.address,
          phone: formData.phone,
          location: `POINT(${coordinates.longitude} ${coordinates.latitude})`,
          operating_hours: formData.hours,
        },
      ]);

      if (error) throw error;

      router.push('/business/dashboard');
    } catch (error) {
      console.error('Error creating business:', error);
      alert('Error creating business. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Business Setup</h1>
              <p className="mt-2 text-sm text-gray-600">
                Let's get your business set up so you can start creating deals.
              </p>
            </div>

            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`flex items-center ${s < 3 ? 'flex-1' : ''}`}
                  >
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full ${
                        s <= step
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {s}
                    </div>
                    {s < 3 && (
                      <div
                        className={`flex-1 h-1 mx-4 ${
                          s < step ? 'bg-primary-600' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-sm text-gray-600">Basic Info</span>
                <span className="text-sm text-gray-600">Location</span>
                <span className="text-sm text-gray-600">Hours</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <label htmlFor="name" className="label">
                      Business Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="input-field mt-1"
                      placeholder="Your Business Name"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="label">
                      Business Phone
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="input-field pl-10"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <label htmlFor="address" className="label">
                      Business Address
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        required
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        className="input-field pl-10"
                        placeholder="123 Main St, City, State, ZIP"
                      />
                    </div>
                  </div>

                  {/* Map will be added here */}
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Map Preview (Coming Soon)</p>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-gray-400 mr-2" />
                    <h3 className="text-lg font-medium text-gray-900">Operating Hours</h3>
                  </div>
                  
                  {Object.entries(formData.hours).map(([day, hours]) => (
                    <div key={day} className="flex items-center space-x-4">
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
                        <>
                          <div className="flex items-center space-x-2">
                            <label htmlFor={`${day}-open`} className="sr-only">Opening time for {day}</label>
                            <input
                              id={`${day}-open`}
                              type="time"
                              value={hours.open}
                              onChange={(e) => handleHoursChange(day as keyof WeeklyHours, 'open', e.target.value)}
                              className="input-field"
                              aria-label={`Opening time for ${day}`}
                            />
                            <span className="text-gray-500">to</span>
                            <label htmlFor={`${day}-close`} className="sr-only">Closing time for {day}</label>
                            <input
                              id={`${day}-close`}
                              type="time"
                              value={hours.close}
                              onChange={(e) => handleHoursChange(day as keyof WeeklyHours, 'close', e.target.value)}
                              className="input-field"
                              aria-label={`Closing time for ${day}`}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between pt-6">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="btn-secondary"
                  >
                    Back
                  </button>
                ) : (
                  <div />
                )}
                
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step + 1)}
                    className="btn-primary"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                  >
                    {loading ? 'Creating...' : 'Create Business'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  );
} 