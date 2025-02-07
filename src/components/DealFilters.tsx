'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal, X, Palmtree, Compass, Tag } from 'lucide-react';

interface FilterOptions {
  search: string;
  sortBy: 'distance' | 'discount' | 'endDate';
  discountType: 'all' | 'percentage' | 'fixed';
  maxDistance: number;
}

interface DealFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
  hasLocation: boolean;
}

export default function DealFilters({ onFilterChange, hasLocation }: DealFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    sortBy: 'distance',
    discountType: 'all',
    maxDistance: 50,
  });

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-retro-coral" />
        </div>
        <input
          type="text"
          placeholder="Search for paradise..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="block w-full pl-12 pr-12 py-3 border-3 border-retro-navy rounded-lg bg-white placeholder-retro-navy/50 focus:outline-none focus:ring-2 focus:ring-retro-coral focus:border-retro-navy text-retro-navy font-medium shadow-retro"
        />
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute inset-y-0 right-0 pr-4 flex items-center"
          aria-label="Toggle filters"
        >
          {isOpen ? (
            <X className="h-5 w-5 text-retro-coral hover:text-retro-rust transition-colors" />
          ) : (
            <SlidersHorizontal className="h-5 w-5 text-retro-coral hover:text-retro-rust transition-colors" />
          )}
        </button>
      </div>

      {/* Filter Options */}
      {isOpen && (
        <div className="bg-white border-3 border-retro-navy rounded-lg p-6 shadow-retro space-y-6">
          <div>
            <label htmlFor="sortBy" className="block text-sm font-bold text-retro-navy mb-2 flex items-center">
              <Compass className="h-5 w-5 mr-2 text-retro-coral" />
              Sort by
            </label>
            <select
              id="sortBy"
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="block w-full px-4 py-2 border-2 border-retro-navy rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-retro-coral text-retro-navy font-medium disabled:opacity-50"
              disabled={filters.sortBy === 'distance' && !hasLocation}
            >
              <option value="distance" disabled={!hasLocation}>🗺️ Distance</option>
              <option value="discount">💰 Highest Savings</option>
              <option value="endDate">⏰ Ending Soon</option>
            </select>
          </div>

          <div>
            <label htmlFor="discountType" className="block text-sm font-bold text-retro-navy mb-2 flex items-center">
              <Tag className="h-5 w-5 mr-2 text-retro-coral" />
              Deal Type
            </label>
            <select
              id="discountType"
              value={filters.discountType}
              onChange={(e) => handleFilterChange('discountType', e.target.value)}
              className="block w-full px-4 py-2 border-2 border-retro-navy rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-retro-coral text-retro-navy font-medium"
            >
              <option value="all">🌟 All Deals</option>
              <option value="percentage">% Percentage Off</option>
              <option value="fixed">$ Fixed Amount</option>
            </select>
          </div>

          {hasLocation && (
            <div>
              <label htmlFor="maxDistance" className="block text-sm font-bold text-retro-navy mb-2 flex items-center">
                <Palmtree className="h-5 w-5 mr-2 text-retro-coral" />
                Search Radius
              </label>
              <input
                type="range"
                id="maxDistance"
                min="1"
                max="100"
                value={filters.maxDistance}
                onChange={(e) => handleFilterChange('maxDistance', parseInt(e.target.value))}
                className="w-full h-2 bg-retro-mint rounded-lg appearance-none cursor-pointer accent-retro-coral"
              />
              <div className="mt-2 text-sm font-medium text-retro-teal text-center">
                🌴 Within {filters.maxDistance} miles 🌴
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 