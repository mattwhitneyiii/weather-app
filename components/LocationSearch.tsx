import React, { useState, useEffect, useRef } from 'react';
import { Location } from '@/types/weather';
import { searchLocations } from '@/lib/weatherApi';
import { FiSearch, FiMapPin } from 'react-icons/fi';

interface LocationSearchProps {
  onLocationSelect: (location: Location) => void;
  currentLocation: Location | null;
}

export default function LocationSearch({ onLocationSelect, currentLocation }: LocationSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Location[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    if (searchQuery.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsSearching(true);
    try {
      const locations = await searchLocations(searchQuery);
      setResults(locations);
      setIsOpen(locations.length > 0);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelect = (location: Location) => {
    onLocationSelect(location);
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div className="relative mb-6" ref={searchRef}>
      <div className="relative">
        <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsOpen(results.length > 0)}
          placeholder="Search for a city..."
          className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-gray-800 bg-white/90 backdrop-blur-sm"
        />
        {isSearching && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 max-h-64 overflow-y-auto">
          {results.map((location, index) => (
            <button
              key={index}
              onClick={() => handleSelect(location)}
              className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors flex items-center gap-2"
            >
              <FiMapPin className="text-blue-500" size={18} />
              <div>
                <div className="font-medium text-gray-800">
                  {location.name}
                  {location.state && `, ${location.state}`}
                </div>
                <div className="text-sm text-gray-500">{location.country}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {currentLocation && (
        <div className="mt-2 text-sm text-gray-600 flex items-center gap-2">
          <FiMapPin size={16} />
          <span>
            Current: {currentLocation.name}
            {currentLocation.state && `, ${currentLocation.state}`}, {currentLocation.country}
          </span>
        </div>
      )}
    </div>
  );
}

