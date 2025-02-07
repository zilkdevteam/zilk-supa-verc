// app/page.tsx
'use client';

import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { ArrowRight, Tag, Compass, MapPin } from 'lucide-react';

export default function Home() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50">
        <div className="mx-auto max-w-7xl px-6 pt-24 lg:px-8">
          {/* Hero Section */}
          <div className="relative">
            {/* Floating Cards */}
            <div className="absolute right-0 top-0 w-1/2">
              {/* Card 1 - 50% Off Deal */}
              <div className="absolute right-[20%] top-0 w-72 animate-float-slow">
                <div className="rounded-2xl bg-white p-6 shadow-[0_2px_40px_-12px_rgba(0,0,0,0.1)] border border-gray-100">
                  <Tag className="h-5 w-5 text-retro-primary mb-3" />
                  <h3 className="text-xl font-semibold text-gray-900">50% Off Deal</h3>
                  <p className="mt-1 text-sm text-gray-500">Limited time offer!</p>
                </div>
              </div>

              {/* Card 2 - Spin & Win */}
              <div className="absolute right-0 top-40 w-72 animate-float">
                <div className="rounded-2xl bg-white p-6 shadow-[0_2px_40px_-12px_rgba(0,0,0,0.1)] border border-gray-100">
                  <Compass className="h-5 w-5 text-blue-500 mb-3" />
                  <h3 className="text-xl font-semibold text-gray-900">Spin & Win</h3>
                  <p className="mt-1 text-sm text-gray-500">Try your luck today!</p>
                </div>
              </div>

              {/* Card 3 - Local Favorites */}
              <div className="absolute right-[30%] top-80 w-72 animate-float-slower">
                <div className="rounded-2xl bg-white p-6 shadow-[0_2px_40px_-12px_rgba(0,0,0,0.1)] border border-gray-100">
                  <MapPin className="h-5 w-5 text-green-500 mb-3" />
                  <h3 className="text-xl font-semibold text-gray-900">Local Favorites</h3>
                  <p className="mt-1 text-sm text-gray-500">Discover nearby deals</p>
                </div>
              </div>
            </div>

            {/* Hero Content */}
            <div className="max-w-2xl">
              <div className="flex items-center gap-x-4">
                <span className="rounded-full bg-pink-100 px-3 py-1 text-sm font-medium text-retro-primary">
                  What's New
                </span>
                <span className="inline-flex items-center text-sm text-gray-600">
                  Just launched
                  <ArrowRight className="ml-1 h-4 w-4" />
                </span>
              </div>

              <h1 className="mt-10">
                <span className="block text-5xl font-medium tracking-tight text-gray-900 sm:text-6xl">
                  Discover Amazing
                </span>
                <span className="mt-2 block text-5xl font-medium tracking-tight text-retro-primary sm:text-6xl">
                  Local Deals
                </span>
              </h1>

              <p className="mt-6 text-lg leading-8 text-gray-600">
                Find exclusive discounts and offers from your favorite local 
                businesses. Save money while supporting your community with our 
                innovative spin-to-win deals!
              </p>

              <div className="mt-10 flex items-center gap-x-6">
                <Link
                  href="/deals"
                  className="rounded-full bg-retro-primary px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-retro-primary/90 transition-colors"
                >
                  Browse Deals
                  <ArrowRight className="ml-2 h-5 w-5 inline-block" />
                </Link>
                <Link 
                  href="/business" 
                  className="text-base font-medium text-gray-900 hover:text-retro-primary transition-colors"
                >
                  For Business 
                  <ArrowRight className="ml-2 h-5 w-5 inline-block" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}