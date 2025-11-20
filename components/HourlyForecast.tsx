import React from 'react';
import { format } from 'date-fns';
import { HourlyForecast as HourlyForecastType } from '@/types/weather';
import WeatherIcon from './WeatherIcon';

interface HourlyForecastProps {
  forecasts: HourlyForecastType[];
  unit: 'celsius' | 'fahrenheit';
}

export default function HourlyForecast({ forecasts, unit }: HourlyForecastProps) {
  const getUnitSymbol = () => unit === 'celsius' ? '°C' : '°F';
  const getWindUnit = () => unit === 'celsius' ? 'kph' : 'mph';
  
  // Convert wind speed: API returns m/s for metric, mph for imperial
  const getWindSpeed = (speed: number) => {
    if (unit === 'celsius') {
      // Convert m/s to kph (multiply by 3.6)
      return Math.round(speed * 3.6);
    }
    // Already in mph for imperial
    return Math.round(speed);
  };
  const todayForecasts = forecasts.filter((forecast) => {
    const forecastDate = new Date(forecast.dt);
    const today = new Date();
    return forecastDate.toDateString() === today.toDateString();
  });

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Today's Hourly Forecast</h2>
      <div className="overflow-x-auto">
        <div className="flex gap-4 pb-2">
          {todayForecasts.length > 0 ? (
            todayForecasts.map((forecast, index) => {
              const date = new Date(forecast.dt);
              const isNow = index === 0 && date.getHours() === new Date().getHours();
              
              return (
                <div
                  key={forecast.dt}
                  className={`flex flex-col items-center min-w-[100px] p-4 rounded-xl transition-all ${
                    isNow
                      ? 'bg-blue-500 text-white shadow-lg scale-105'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className={`text-sm font-medium ${isNow ? 'text-white' : 'text-gray-600'}`}>
                    {format(date, 'h a')}
                  </div>
                  <div className="my-2">
                    <WeatherIcon
                      icon={forecast.weather[0].icon}
                      description={forecast.weather[0].description}
                      size={40}
                      className={isNow ? 'text-white' : ''}
                    />
                  </div>
                  <div className={`text-xl font-bold ${isNow ? 'text-white' : 'text-gray-800'}`}>
                    {Math.round(forecast.temp)}{getUnitSymbol()}
                  </div>
                  <div className={`text-xs mt-1 ${isNow ? 'text-blue-100' : 'text-gray-500'}`}>
                    {forecast.weather[0].description}
                  </div>
                  <div className={`text-xs mt-1 ${isNow ? 'text-blue-100' : 'text-gray-400'}`}>
                    💨 {getWindSpeed(forecast.wind_speed)} {getWindUnit()}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-gray-500">No hourly data available</div>
          )}
        </div>
      </div>
    </div>
  );
}

