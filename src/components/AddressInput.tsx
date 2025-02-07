'use client';

import { useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';

interface AddressInputProps {
  value: string;
  onChange: (address: string, coordinates: { latitude: number; longitude: number }) => void;
  required?: boolean;
  className?: string;
}

declare global {
  interface Window {
    google: any;
  }
}

export default function AddressInput({
  value,
  onChange,
  required = false,
  className = '',
}: AddressInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load Google Maps JavaScript API
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.onload = () => {
      // Initialize autocomplete
      if (inputRef.current) {
        const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
          types: ['address'],
        });

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (!place.geometry) return;

          // Notify parent component
          onChange(place.formatted_address, {
            latitude: place.geometry.location.lat(),
            longitude: place.geometry.location.lng(),
          });
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [onChange]);

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <MapPin className="h-5 w-5 text-gray-400" />
      </div>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value, { latitude: 0, longitude: 0 })}
        required={required}
        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 pl-10 ${className}`}
        placeholder="123 Main St, City, State, ZIP"
      />
    </div>
  );
} 