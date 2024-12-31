// app/page.tsx
'use client';

import { Navigation } from '@/components/Navigation';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Navigation />
      <main className="flex min-h-screen flex-col items-center p-8 sm:p-24">
        <div className="z-10 max-w-5xl w-full">
          <h1 className="text-4xl sm:text-6xl font-bold text-center mb-8">
            Discover Amazing Local Deals
          </h1>
          <p className="text-xl text-center text-gray-600 mb-12">
            Find the best deals near you or spin the wheel for exclusive rewards!
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4">Browse Deals</h2>
              <p className="text-gray-600 mb-4">
                Explore constantly updated deals from local businesses within 50 miles of your location.
              </p>
              <Link 
                href="/deals"
                className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700"
              >
                View Deals
              </Link>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4">Spin & Win</h2>
              <p className="text-gray-600 mb-4">
                Find a Zilk NFC tag at participating locations and spin for exclusive, time-limited deals!
              </p>
              <button 
                className="bg-gray-200 text-gray-600 px-6 py-3 rounded-md cursor-not-allowed"
                disabled
              >
                Requires NFC Tag
              </button>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">For Business Owners</h2>
            <p className="text-gray-600 mb-6">
              Want to attract more customers and offer exciting deals?
            </p>
            <Link 
              href="/business"
              className="inline-block bg-indigo-600 text-white px-8 py-4 rounded-md hover:bg-indigo-700"
            >
              Join Zilk Business
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}