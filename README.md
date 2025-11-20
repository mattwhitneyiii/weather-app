# Weather App

A beautiful, modern weather application built with Next.js, TypeScript, and Tailwind CSS. Features hourly forecasts for today and daily forecasts for the next 5 days.

## Features

- 🌍 **Current Location**: Automatically detects and displays weather for your current location
- 🔍 **Location Search**: Search and select any location worldwide
- ⏰ **Hourly Forecast**: View today's weather by the hour with detailed information
- 📅 **5-Day Forecast**: Daily forecast for the next 5 days
- 🎨 **Beautiful Icons**: Weather-specific icons and graphics for different conditions
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A free OpenWeatherMap API key ([Get one here](https://openweathermap.org/api))

### Installation

1. Clone or download this repository

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_WEATHER_API_KEY=your_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## API Setup

This app uses the OpenWeatherMap API. To get your free API key:

1. Visit [https://openweathermap.org/api](https://openweathermap.org/api)
2. Sign up for a free account
3. Navigate to your API keys section
4. Copy your API key
5. Add it to your `.env.local` file as shown above

**Note**: The free tier provides 5-day forecasts, which is what the app displays.

## Technologies Used

- **Next.js 14**: React framework for production
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **React Icons**: Beautiful icon library
- **date-fns**: Date formatting utilities
- **Axios**: HTTP client for API requests

## Project Structure

```
├── app/
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main page component
├── components/
│   ├── DailyForecast.tsx # 5-day daily forecast component
│   ├── HourlyForecast.tsx # Hourly forecast component
│   ├── LocationSearch.tsx # Location search component
│   └── WeatherIcon.tsx   # Weather icon component
├── lib/
│   └── weatherApi.ts     # Weather API service
├── types/
│   └── weather.ts        # TypeScript type definitions
└── package.json
```

## Features in Detail

### Hourly Forecast
- Shows weather for today by the hour
- Displays temperature, weather conditions, wind speed
- Highlights current hour
- Beautiful card-based design

### Daily Forecast
- 5-day forecast
- Weekly pagination for easy navigation
- Click on any day to see detailed information
- Shows high/low temperatures, precipitation probability, and more

### Location Features
- Automatic geolocation detection
- Search for any city worldwide
- Quick location switching
- Current location indicator

## Building for Production

```bash
npm run build
npm start
```

## License

This project is open source and available for personal and commercial use.

