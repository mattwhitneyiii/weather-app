'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiRefreshCw, FiMapPin, FiBarChart2, FiHome, FiNavigation } from 'react-icons/fi';

type TemperatureUnit = 'celsius' | 'fahrenheit';

interface HeaderProps {
  location?: {
    name: string;
    country: string;
  } | null;
  unit: TemperatureUnit;
  onUnitToggle: () => void;
  onRefresh?: () => void;
  onGetCurrentLocation?: () => void;
  loading?: boolean;
}

export default function Header({
  location,
  unit,
  onUnitToggle,
  onRefresh,
  onGetCurrentLocation,
  loading = false,
}: HeaderProps) {
  const pathname = usePathname();
  const isGraphsPage = pathname === '/graphs';

  return (
    <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="flex items-center gap-4">
        {isGraphsPage && (
          <Link
            href="/"
            className="p-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors"
            title="Back to main page"
          >
            <FiHome size={20} />
          </Link>
        )}
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            {isGraphsPage ? 'Temperature Graphs' : 'Weather Forecast'}
          </h1>
          {location && (
            <div className="flex items-center gap-2 text-white/90">
              <FiMapPin size={18} />
              <span className="text-lg">
                {location.name}, {location.country}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {/* Temperature Unit Toggle */}
        <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-lg overflow-hidden">
          <button
            onClick={() => unit !== 'celsius' && onUnitToggle()}
            className={`px-4 py-2 transition-colors ${
              unit === 'celsius'
                ? 'bg-white text-blue-600 font-semibold'
                : 'text-white hover:bg-white/20'
            }`}
          >
            °C
          </button>
          <button
            onClick={() => unit !== 'fahrenheit' && onUnitToggle()}
            className={`px-4 py-2 transition-colors ${
              unit === 'fahrenheit'
                ? 'bg-white text-blue-600 font-semibold'
                : 'text-white hover:bg-white/20'
            }`}
          >
            °F
          </button>
        </div>
        {/* Navigation Links */}
        {!isGraphsPage && (
          <Link
            href="/graphs"
            className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2"
          >
            <FiBarChart2 size={18} />
            Graphs
          </Link>
        )}
        {isGraphsPage && (
          <Link
            href="/"
            className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2"
          >
            <FiHome size={18} />
            Home
          </Link>
        )}
        {/* Get Current Location Button */}
        {onGetCurrentLocation && (
          <button
            onClick={onGetCurrentLocation}
            className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2"
            disabled={loading}
            title="Get forecast for current location"
          >
            <FiNavigation className={loading ? 'animate-spin' : ''} size={18} />
            Current Location
          </button>
        )}
        {/* Refresh Button (only on main page) */}
        {onRefresh && !isGraphsPage && (
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2"
            disabled={loading}
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} size={18} />
            Refresh
          </button>
        )}
      </div>
    </div>
  );
}

