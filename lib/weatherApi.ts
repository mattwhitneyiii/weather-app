import axios from 'axios';
import { WeatherData, Location } from '@/types/weather';

const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY || '';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Note: OpenWeatherMap free tier provides 5-day forecast, not 30 days
// For demo purposes, we'll extend the forecast data
// In production, you'd need a premium API or combine multiple sources

export async function getWeatherByCoords(lat: number, lon: number, units: 'imperial' | 'metric' = 'imperial'): Promise<WeatherData> {
  try {
    const [currentRes, forecastRes] = await Promise.all([
      axios.get(`${BASE_URL}/weather`, {
        params: {
          lat,
          lon,
          appid: API_KEY,
          units,
        },
      }),
      axios.get(`${BASE_URL}/forecast`, {
        params: {
          lat,
          lon,
          appid: API_KEY,
          units,
        },
      }),
    ]);

    // Get hourly forecast (next 48 hours from 3-hourly data)
    const hourly = forecastRes.data.list.slice(0, 16).map((item: any) => ({
      dt: item.dt * 1000,
      temp: item.main.temp,
      feels_like: item.main.feels_like,
      humidity: item.main.humidity,
      weather: item.weather,
      wind_speed: item.wind.speed,
    }));

    // Get daily forecast (5 days from API, then extend for demo)
    const dailyData = forecastRes.data.list.filter((item: any, index: number) => {
      const date = new Date(item.dt * 1000);
      const hour = date.getHours();
      // Get one forecast per day (around noon)
      return hour >= 11 && hour <= 14;
    }).slice(0, 5);

    const daily = dailyData.map((item: any) => ({
      dt: item.dt * 1000,
      temp: {
        min: item.main.temp_min,
        max: item.main.temp_max,
        day: item.main.temp,
        night: item.main.temp - 10, // Estimate night temp
      },
      feels_like: {
        day: item.main.feels_like,
        night: item.main.feels_like - 10,
      },
      humidity: item.main.humidity,
      weather: item.weather,
      wind_speed: item.wind.speed,
      pop: item.pop || 0,
    }));

    // Extend daily forecast to 5 days for demo
    // In production, you'd fetch this from a premium API
    const extendedDaily = extendForecast(daily, 5);

    return {
      location: {
        name: currentRes.data.name,
        country: currentRes.data.sys.country,
        lat: currentRes.data.coord.lat,
        lon: currentRes.data.coord.lon,
      },
      current: {
        temp: currentRes.data.main.temp,
        feels_like: currentRes.data.main.feels_like,
        humidity: currentRes.data.main.humidity,
        pressure: currentRes.data.main.pressure,
        wind_speed: currentRes.data.wind.speed,
        weather: currentRes.data.weather,
      },
      hourly,
      daily: extendedDaily,
    };
  } catch (error) {
    console.error('Error fetching weather:', error);
    throw new Error('Failed to fetch weather data');
  }
}

export async function searchLocations(query: string): Promise<Location[]> {
  try {
    if (!API_KEY) {
      console.error('API key is missing');
      return [];
    }

    const response = await axios.get('https://api.openweathermap.org/geo/1.0/direct', {
      params: {
        q: query,
        limit: 5,
        appid: API_KEY,
      },
    });

    if (!response.data || !Array.isArray(response.data)) {
      return [];
    }

    return response.data.map((item: any) => ({
      name: item.name,
      country: item.country,
      lat: item.lat,
      lon: item.lon,
      state: item.state,
    }));
  } catch (error: any) {
    console.error('Error searching locations:', error);
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
    }
    return [];
  }
}

// Helper function to extend forecast (for demo purposes)
function extendForecast(baseForecast: any[], days: number): any[] {
  const extended = [...baseForecast];
  const lastForecast = baseForecast[baseForecast.length - 1];
  
  for (let i = baseForecast.length; i < days; i++) {
    const dayOffset = i * 24 * 60 * 60 * 1000;
    const baseDate = new Date(baseForecast[0].dt);
    const newDate = new Date(baseDate.getTime() + dayOffset);
    
    // Create variation in temperature (seasonal simulation)
    const variation = Math.sin((i / 30) * Math.PI * 2) * 10;
    
    extended.push({
      dt: newDate.getTime(),
      temp: {
        min: lastForecast.temp.min + variation - 5,
        max: lastForecast.temp.max + variation + 5,
        day: lastForecast.temp.day + variation,
        night: lastForecast.temp.night + variation - 5,
      },
      feels_like: {
        day: lastForecast.feels_like.day + variation,
        night: lastForecast.feels_like.night + variation - 5,
      },
      humidity: lastForecast.humidity + (Math.random() * 20 - 10),
      weather: lastForecast.weather,
      wind_speed: lastForecast.wind_speed + (Math.random() * 5 - 2.5),
      pop: Math.max(0, Math.min(100, lastForecast.pop + (Math.random() * 20 - 10))),
    });
  }
  
  return extended;
}

