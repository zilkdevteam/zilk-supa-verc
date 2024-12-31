// app/page.tsx
'use client';

import { Navigation } from '@/components/Navigation';
import { MapPin, Gift, Zap } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Section */}
        <div className="relative overflow-hidden pt-16 sm:pt-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                Discover{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
                  Amazing
                </span>{' '}
                Local Deals
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Find the best deals near you or spin the wheel for exclusive rewards!
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link href="/deals" className="btn-primary">
                  View Deals
                </Link>
                <Link href="/business" className="btn-secondary">
                  List Your Business
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Local Deals */}
            <div className="card group hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary-100 text-primary-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Local Deals</h3>
              <p className="text-gray-600">
                Explore constantly updated deals from local businesses within 50 miles of your location.
              </p>
              <Link 
                href="/deals"
                className="mt-4 inline-flex items-center text-primary-600 hover:text-primary-700"
              >
                Browse Deals <Zap className="ml-2 h-4 w-4" />
              </Link>
            </div>

            {/* Spin & Win */}
            <div className="card group hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-secondary-100 text-secondary-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                <Gift className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Spin & Win</h3>
              <p className="text-gray-600">
                Find a Zilk NFC tag at participating locations and spin for exclusive, time-limited deals!
              </p>
              <button 
                className="mt-4 inline-flex items-center text-gray-400 cursor-not-allowed"
                disabled
              >
                Requires NFC Tag <span className="ml-2 text-xs">(Coming Soon)</span>
              </button>
            </div>

            {/* Business Features */}
            <div className="card group hover:shadow-lg transition-shadow duration-300 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">For Business Owners</h3>
              <p className="text-gray-600">
                Want to attract more customers and offer exciting deals? Join Zilk Business today!
              </p>
              <Link 
                href="/business"
                className="mt-4 inline-flex items-center text-primary-600 hover:text-primary-700"
              >
                Get Started <Zap className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}