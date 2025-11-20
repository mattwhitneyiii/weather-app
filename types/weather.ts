export interface WeatherData {
  location: {
    name: string;
    country: string;
    lat: number;
    lon: number;
  };
  current: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
    wind_speed: number;
    weather: {
      main: string;
      description: string;
      icon: string;
    }[];
  };
  hourly: HourlyForecast[];
  daily: DailyForecast[];
}

export interface HourlyForecast {
  dt: number;
  temp: number;
  feels_like: number;
  humidity: number;
  weather: {
    main: string;
    description: string;
    icon: string;
  }[];
  wind_speed: number;
}

export interface DailyForecast {
  dt: number;
  temp: {
    min: number;
    max: number;
    day: number;
    night: number;
  };
  feels_like: {
    day: number;
    night: number;
  };
  humidity: number;
  weather: {
    main: string;
    description: string;
    icon: string;
  }[];
  wind_speed: number;
  pop: number; // probability of precipitation
}

export interface Location {
  name: string;
  country: string;
  lat: number;
  lon: number;
  state?: string;
}

