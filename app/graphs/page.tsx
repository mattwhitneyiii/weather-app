'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Location } from '@/types/weather';
import { getWeatherByCoords } from '@/lib/weatherApi';
import TimeRangeSelector from '@/components/TimeRangeSelector';
import TemperatureGraph from '@/components/TemperatureGraph';
import LocationSearch from '@/components/LocationSearch';
import { FiLoader } from 'react-icons/fi';
import Header from '@/components/Header';

type TemperatureUnit = 'celsius' | 'fahrenheit';
type TimeRange = {
  label: string;
  startDate: Date;
  endDate: Date;
};

export default function GraphsPage() {
  const router = useRouter();
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unit, setUnit] = useState<TemperatureUnit>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('temperatureUnit');
      return (saved as TemperatureUnit) || 'fahrenheit';
    }
    return 'fahrenheit';
  });
  const [timeRange, setTimeRange] = useState<TimeRange | null>(null);
  const [graphData, setGraphData] = useState<any[]>([]);
  const [graphType, setGraphType] = useState<'line' | 'bar'>('line');
  const [weatherDataCache, setWeatherDataCache] = useState<any>(null);

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherData(position.coords.latitude, position.coords.longitude, unit);
        },
        (err) => {
          console.error('Geolocation error:', err);
          fetchWeatherData(40.7128, -74.0060, unit); // New York City
        }
      );
    } else {
      fetchWeatherData(40.7128, -74.0060, unit);
    }
  }, []);

  const fetchWeatherData = async (lat: number, lon: number, tempUnit: TemperatureUnit) => {
    setLoading(true);
    setError(null);
    try {
      const units = tempUnit === 'celsius' ? 'metric' : 'imperial';
      const data = await getWeatherByCoords(lat, lon, units);
      setCurrentLocation(data.location);
      setWeatherDataCache(data);
      // Set default time range to today if not already set
      if (!timeRange) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        setTimeRange({
          label: 'Today',
          startDate: today,
          endDate: tomorrow,
        });
        generateGraphData(data, today, tomorrow);
      } else {
        // Regenerate with current time range
        generateGraphData(data, timeRange.startDate, timeRange.endDate);
      }
    } catch (err) {
      setError('Failed to load weather data. Please check your API key.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateGraphData = (weatherData: any, startDate: Date, endDate: Date) => {
    const data: any[] = [];
    const now = new Date();
    
    // Calculate the time range in days
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const useDailyData = daysDiff > 1; // Use daily aggregation for ranges longer than 1 day (weeks/months)
    
    if (useDailyData) {
      // Aggregate data by day for week/month ranges
      const dailyDataMap = new Map<string, { temps: number[]; dates: Date[] }>();
      
      // Process hourly forecast data
      weatherData.hourly.forEach((forecast: any) => {
        const forecastDate = new Date(forecast.dt);
        if (forecastDate >= startDate && forecastDate <= endDate) {
          const dayKey = forecastDate.toDateString();
          if (!dailyDataMap.has(dayKey)) {
            dailyDataMap.set(dayKey, { temps: [], dates: [] });
          }
          const dayData = dailyDataMap.get(dayKey)!;
          dayData.temps.push(forecast.temp);
          dayData.dates.push(forecastDate);
        }
      });

      // Get base temperature from available forecast data or use a default
      let baseTemp = 20;
      if (dailyDataMap.size > 0) {
        const firstEntry = Array.from(dailyDataMap.values())[0];
        baseTemp = firstEntry.temps.length > 0 ? firstEntry.temps[0] : 20;
      } else if (weatherData.hourly && weatherData.hourly.length > 0) {
        // If no daily data yet, use the first hourly forecast
        baseTemp = weatherData.hourly[0].temp;
      }

      // Generate historical daily data if needed
      if (startDate < now) {
        const daysDiff = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        
        for (let i = daysDiff; i > 0; i--) {
          const historicalDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          if (historicalDate >= startDate && historicalDate < now) {
            const dayKey = historicalDate.toDateString();
            if (!dailyDataMap.has(dayKey)) {
              // Simulate daily temperature variation
              const variation = Math.sin((i / 7) * Math.PI * 2) * 8;
              const dayTemp = baseTemp + variation + (Math.random() * 6 - 3);
              
              // Create hourly-like data for the day to calculate high/low
              const hourlyTemps: number[] = [];
              for (let h = 0; h < 24; h++) {
                const hourVariation = Math.sin((h / 24) * Math.PI * 2) * 3;
                hourlyTemps.push(dayTemp + hourVariation);
              }
              
              dailyDataMap.set(dayKey, {
                temps: hourlyTemps,
                dates: [historicalDate],
              });
            }
          }
        }
      }

      // Generate future daily data if needed (for next week, next month, etc.)
      if (endDate > now) {
        // Find the latest forecast date we have
        let latestForecastDate = now;
        if (dailyDataMap.size > 0) {
          const allDates = Array.from(dailyDataMap.values()).flatMap(d => d.dates);
          if (allDates.length > 0) {
            latestForecastDate = new Date(Math.max(...allDates.map(d => d.getTime())));
          }
        }

        // Get the last known temperature to use as a base
        let lastKnownTemp = baseTemp;
        if (dailyDataMap.size > 0) {
          const sortedEntries = Array.from(dailyDataMap.entries()).sort((a, b) => {
            const dateA = a[1].dates[0]?.getTime() || 0;
            const dateB = b[1].dates[0]?.getTime() || 0;
            return dateB - dateA;
          });
          if (sortedEntries.length > 0) {
            const lastEntry = sortedEntries[0][1];
            lastKnownTemp = lastEntry.temps.reduce((sum, t) => sum + t, 0) / lastEntry.temps.length;
          }
        } else if (weatherData.hourly && weatherData.hourly.length > 0) {
          // If no daily data, use the last hourly forecast
          const lastHourly = weatherData.hourly[weatherData.hourly.length - 1];
          lastKnownTemp = lastHourly.temp;
        }

        // Determine the starting point for future data generation
        const futureStartDate = startDate > now ? startDate : (latestForecastDate > now ? latestForecastDate : now);
        const daysToGenerate = Math.ceil((endDate.getTime() - futureStartDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Generate data for each day in the future range
        for (let i = 0; i <= daysToGenerate; i++) {
          const futureDate = new Date(futureStartDate.getTime() + i * 24 * 60 * 60 * 1000);
          // Make sure we're at the start of the day
          futureDate.setHours(0, 0, 0, 0);
          
          if (futureDate >= startDate && futureDate <= endDate) {
            const dayKey = futureDate.toDateString();
            if (!dailyDataMap.has(dayKey)) {
              // Simulate future daily temperature with seasonal variation
              const daysFromNow = Math.ceil((futureDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              const variation = Math.sin((daysFromNow / 30) * Math.PI * 2) * 8;
              const dayTemp = lastKnownTemp + variation + (Math.random() * 6 - 3);
              
              // Create hourly-like data for the day to calculate high/low
              const hourlyTemps: number[] = [];
              for (let h = 0; h < 24; h++) {
                const hourVariation = Math.sin((h / 24) * Math.PI * 2) * 3;
                hourlyTemps.push(dayTemp + hourVariation);
              }
              
              dailyDataMap.set(dayKey, {
                temps: hourlyTemps,
                dates: [futureDate],
              });
            }
          }
        }
      }

      // Convert daily aggregates to data points with high/low
      dailyDataMap.forEach((dayData, dayKey) => {
        const highTemp = Math.max(...dayData.temps);
        const lowTemp = Math.min(...dayData.temps);
        const dayDate = dayData.dates[0] || new Date(dayKey);
        
        data.push({
          time: dayDate,
          temperature: Math.round((highTemp + lowTemp) / 2), // Average for display
          high: Math.round(highTemp),
          low: Math.round(lowTemp),
          label: formatTimeLabel(dayDate, true),
        });
      });
    } else {
      // For daily ranges (Today, Yesterday, Tomorrow), show hourly data points
      // Process hourly forecast data
      weatherData.hourly.forEach((forecast: any) => {
        const forecastDate = new Date(forecast.dt);
        if (forecastDate >= startDate && forecastDate <= endDate) {
          data.push({
            time: forecastDate,
            temperature: Math.round(forecast.temp),
            high: Math.round(forecast.temp), // For hourly, high/low are the same
            low: Math.round(forecast.temp),
            label: formatTimeLabel(forecastDate, false),
          });
        }
      });

      // If we need historical data (yesterday, etc.), generate simulated hourly data
      if (startDate < now) {
        const hoursDiff = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60));
        const baseTemp = data.length > 0 ? data[0].temperature : 20;
        
        for (let i = hoursDiff; i > 0; i--) {
          const historicalDate = new Date(now.getTime() - i * 60 * 60 * 1000);
          if (historicalDate >= startDate && historicalDate < now) {
            // Simulate temperature variation
            const variation = Math.sin((i / 24) * Math.PI * 2) * 5;
            const temp = baseTemp + variation + (Math.random() * 4 - 2);
            data.push({
              time: historicalDate,
              temperature: Math.round(temp),
              high: Math.round(temp),
              low: Math.round(temp),
              label: formatTimeLabel(historicalDate, false),
            });
          }
        }
      }
    }

    // Sort by time
    data.sort((a, b) => a.time.getTime() - b.time.getTime());
    setGraphData(data);
  };

  const formatTimeLabel = (date: Date, isDaily: boolean = false): string => {
    if (isDaily) {
      // For daily data, show date
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    
    // For hourly data
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours === 0) return 'Now';
    if (diffHours === 1) return '1h ago';
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric' });
  };

  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range);
    // Regenerate graph data for the new range using existing weather data
    if (currentLocation) {
      // We need to fetch fresh data to regenerate, but we can also use cached data
      // For now, let's fetch fresh data
      fetchWeatherData(currentLocation.lat, currentLocation.lon, unit);
    }
  };

  const handleLocationSelect = (location: Location) => {
    fetchWeatherData(location.lat, location.lon, unit);
  };

  const handleUnitToggle = () => {
    const newUnit: TemperatureUnit = unit === 'celsius' ? 'fahrenheit' : 'celsius';
    setUnit(newUnit);
    localStorage.setItem('temperatureUnit', newUnit);
    if (currentLocation) {
      fetchWeatherData(currentLocation.lat, currentLocation.lon, newUnit);
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherData(position.coords.latitude, position.coords.longitude, unit);
        },
        (err) => {
          console.error('Geolocation error:', err);
          alert('Unable to get your current location. Please allow location access or search for a location.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  // Regenerate graph when time range changes
  useEffect(() => {
    if (timeRange && weatherDataCache) {
      generateGraphData(weatherDataCache, timeRange.startDate, timeRange.endDate);
    }
  }, [timeRange, weatherDataCache]);

  if (loading && !graphData.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center">
        <div className="text-center text-white">
          <FiLoader className="animate-spin mx-auto mb-4" size={48} />
          <p className="text-xl">Loading weather data...</p>
        </div>
      </div>
    );
  }

  if (error && !graphData.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center p-4">
        <div className="text-center text-white bg-white/20 backdrop-blur-sm rounded-2xl p-8 max-w-md">
          <p className="text-xl mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Header
          location={currentLocation}
          unit={unit}
          onUnitToggle={handleUnitToggle}
          onGetCurrentLocation={handleGetCurrentLocation}
          loading={loading}
        />

        {/* Location Search */}
        <LocationSearch
          onLocationSelect={handleLocationSelect}
          currentLocation={currentLocation}
        />

        {/* Time Range Selector */}
        {currentLocation && (
          <TimeRangeSelector
            onRangeChange={handleTimeRangeChange}
            selectedRange={timeRange}
          />
        )}

        {/* Graph Type Toggle */}
        {graphData.length > 0 && (
          <div className="mb-4 flex justify-center">
            <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-lg overflow-hidden">
              <button
                onClick={() => setGraphType('line')}
                className={`px-6 py-2 transition-colors ${
                  graphType === 'line'
                    ? 'bg-white text-blue-600 font-semibold'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                Line Graph
              </button>
              <button
                onClick={() => setGraphType('bar')}
                className={`px-6 py-2 transition-colors ${
                  graphType === 'bar'
                    ? 'bg-white text-blue-600 font-semibold'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                Bar Graph
              </button>
            </div>
          </div>
        )}

        {/* Temperature Graph */}
        {graphData.length > 0 && timeRange && (
          <TemperatureGraph
            data={graphData}
            unit={unit}
            graphType={graphType}
            timeRange={timeRange}
          />
        )}
      </div>
    </div>
  );
}

