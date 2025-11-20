import React, { useState } from 'react';
import { format, isToday, isTomorrow } from 'date-fns';
import { DailyForecast as DailyForecastType } from '@/types/weather';
import WeatherIcon from './WeatherIcon';

interface DailyForecastProps {
  forecasts: DailyForecastType[];
  unit: 'celsius' | 'fahrenheit';
}

export default function DailyForecast({ forecasts, unit }: DailyForecastProps) {
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
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const getDayLabel = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEE');
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          5-Day Forecast
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        {forecasts.map((forecast, index) => {
          const date = new Date(forecast.dt);
          const isSelected = selectedDay === forecast.dt;
          const isCurrentDay = isToday(date);

          return (
            <div
              key={forecast.dt}
              onClick={() => setSelectedDay(isSelected ? null : forecast.dt)}
              className={`p-4 rounded-xl cursor-pointer transition-all ${
                isSelected
                  ? 'bg-blue-500 text-white shadow-lg scale-105'
                  : isCurrentDay
                  ? 'bg-blue-100 border-2 border-blue-400'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className={`text-sm font-medium mb-2 ${isSelected ? 'text-white' : 'text-gray-600'}`}>
                {getDayLabel(date)}
              </div>
              <div className={`text-xs mb-2 ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>
                {format(date, 'MMM d')}
              </div>
              <div className="flex justify-center my-2">
                <WeatherIcon
                  icon={forecast.weather[0].icon}
                  description={forecast.weather[0].description}
                  size={36}
                  className={isSelected ? 'text-white' : ''}
                />
              </div>
              <div className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                {Math.round(forecast.temp.max)}{getUnitSymbol()}
              </div>
              <div className={`text-sm ${isSelected ? 'text-blue-100' : 'text-gray-600'}`}>
                {Math.round(forecast.temp.min)}{getUnitSymbol()}
              </div>
              {isSelected && (
                <div className="mt-3 pt-3 border-t border-blue-400 text-xs space-y-1">
                  <div>Feels: {Math.round(forecast.feels_like.day)}{getUnitSymbol()}</div>
                  <div>Humidity: {Math.round(forecast.humidity)}%</div>
                  <div>Wind: {getWindSpeed(forecast.wind_speed)} {getWindUnit()}</div>
                  <div>Precip: {Math.round(forecast.pop * 100)}%</div>
                  <div className="capitalize">{forecast.weather[0].description}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}

