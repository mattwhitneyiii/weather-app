'use client';

import React, { useState, useEffect } from 'react';
import { WeatherData, Location } from '@/types/weather';
import { getWeatherByCoords } from '@/lib/weatherApi';
import HourlyForecast from '@/components/HourlyForecast';
import DailyForecast from '@/components/DailyForecast';
import LocationSearch from '@/components/LocationSearch';
import WeatherIcon from '@/components/WeatherIcon';
import { FiLoader } from 'react-icons/fi';
import Header from '@/components/Header';

type TemperatureUnit = 'celsius' | 'fahrenheit';

export default function Home() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unit, setUnit] = useState<TemperatureUnit>(() => {
    // Get from localStorage or default to fahrenheit
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('temperatureUnit');
      return (saved as TemperatureUnit) || 'fahrenheit';
    }
    return 'fahrenheit';
  });

  const fetchWeather = async (lat: number, lon: number, tempUnit?: TemperatureUnit) => {
    setLoading(true);
    setError(null);
    try {
      const units = (tempUnit || unit) === 'celsius' ? 'metric' : 'imperial';
      const data = await getWeatherByCoords(lat, lon, units);
      setWeatherData(data);
      setCurrentLocation(data.location);
    } catch (err) {
      setError('Failed to load weather data. Please check your API key.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnitToggle = () => {
    const newUnit: TemperatureUnit = unit === 'celsius' ? 'fahrenheit' : 'celsius';
    setUnit(newUnit);
    localStorage.setItem('temperatureUnit', newUnit);
    // Refetch weather data with new unit if we have a location
    if (currentLocation) {
      fetchWeather(currentLocation.lat, currentLocation.lon, newUnit);
    }
  };

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude, unit);
        },
        (err) => {
          console.error('Geolocation error:', err);
          // Default to a location if geolocation fails
          fetchWeather(40.7128, -74.0060, unit); // New York City
        }
      );
    } else {
      // Default location if geolocation is not supported
      fetchWeather(40.7128, -74.0060, unit);
    }
  }, []);

  const handleLocationSelect = (location: Location) => {
    fetchWeather(location.lat, location.lon, unit);
  };

  const handleRefresh = () => {
    if (currentLocation) {
      fetchWeather(currentLocation.lat, currentLocation.lon, unit);
    }
  };

  const getUnitSymbol = () => unit === 'celsius' ? '°C' : '°F';

  if (loading && !weatherData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center">
        <div className="text-center text-white">
          <FiLoader className="animate-spin mx-auto mb-4" size={48} />
          <p className="text-xl">Loading weather data...</p>
        </div>
      </div>
    );
  }

  if (error && !weatherData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center p-4">
        <div className="text-center text-white bg-white/20 backdrop-blur-sm rounded-2xl p-8 max-w-md">
          <p className="text-xl mb-4">{error}</p>
          <p className="text-sm mb-4">
            To use this app, you need to set up a free API key from OpenWeatherMap:
          </p>
          <ol className="text-sm text-left list-decimal list-inside space-y-2 mb-4">
            <li>Visit <a href="https://openweathermap.org/api" target="_blank" rel="noopener noreferrer" className="underline">openweathermap.org/api</a></li>
            <li>Sign up for a free account</li>
            <li>Get your API key</li>
            <li>Create a <code className="bg-white/20 px-2 py-1 rounded">.env.local</code> file</li>
            <li>Add: <code className="bg-white/20 px-2 py-1 rounded">NEXT_PUBLIC_WEATHER_API_KEY=your_key_here</code></li>
          </ol>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!weatherData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Header
          location={weatherData.location}
          unit={unit}
          onUnitToggle={handleUnitToggle}
          onRefresh={handleRefresh}
          loading={loading}
        />

        {/* Location Search */}
        <LocationSearch
          onLocationSelect={handleLocationSelect}
          currentLocation={currentLocation}
        />

        {/* Current Weather */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-6 mb-4 md:mb-0">
              <div className="text-blue-500">
                <WeatherIcon
                  icon={weatherData.current.weather[0].icon}
                  description={weatherData.current.weather[0].description}
                  size={120}
                />
              </div>
              <div>
                <div className="text-6xl md:text-7xl font-bold text-gray-800">
                  {Math.round(weatherData.current.temp)}{getUnitSymbol()}
                </div>
                <div className="text-xl text-gray-600 capitalize">
                  {weatherData.current.weather[0].description}
                </div>
                <div className="text-lg text-gray-500 mt-2">
                  Feels like {Math.round(weatherData.current.feels_like)}{getUnitSymbol()}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="text-sm text-gray-600 mb-1">Humidity</div>
                <div className="text-2xl font-bold text-gray-800">{weatherData.current.humidity}%</div>
              </div>
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="text-sm text-gray-600 mb-1">Wind Speed</div>
                <div className="text-2xl font-bold text-gray-800">
                  {unit === 'celsius' 
                    ? Math.round(weatherData.current.wind_speed * 3.6) // Convert m/s to kph
                    : Math.round(weatherData.current.wind_speed)
                  } {unit === 'celsius' ? 'kph' : 'mph'}
                </div>
              </div>
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="text-sm text-gray-600 mb-1">Pressure</div>
                <div className="text-2xl font-bold text-gray-800">{weatherData.current.pressure} hPa</div>
              </div>
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="text-sm text-gray-600 mb-1">Feels Like</div>
                <div className="text-2xl font-bold text-gray-800">{Math.round(weatherData.current.feels_like)}{getUnitSymbol()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Hourly Forecast */}
        <HourlyForecast forecasts={weatherData.hourly} unit={unit} />

        {/* Daily Forecast */}
        <DailyForecast forecasts={weatherData.daily} unit={unit} />
      </div>
    </div>
  );
}

