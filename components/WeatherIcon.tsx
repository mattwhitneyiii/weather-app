import React from 'react';
import { BsCloudDrizzle, BsCloudHaze } from 'react-icons/bs';
import { IoMdSunny, IoMdCloudy, IoMdRainy, IoMdThunderstorm, IoMdSnow, IoMdPartlySunny } from 'react-icons/io';
import { MdWbTwilight, MdFoggy } from 'react-icons/md';

interface WeatherIconProps {
  icon: string;
  description: string;
  size?: number;
  className?: string;
}

export default function WeatherIcon({ icon, description, size = 48, className = '' }: WeatherIconProps) {
  const getIconAndColor = () => {
    const isNight = icon.includes('n');
    const mainCondition = description.toLowerCase();
    const iconCode = icon.substring(0, 2);

    // Use OpenWeatherMap icon codes for accurate mapping
    if (iconCode === '01') {
      // Clear sky - Yellow/Orange for sun
      return {
        icon: isNight ? <MdWbTwilight size={size} /> : <IoMdSunny size={size} />,
        color: isNight ? 'text-indigo-400' : 'text-yellow-400'
      };
    }
    if (iconCode === '02') {
      // Few clouds - Light blue/yellow mix
      return {
        icon: isNight ? <IoMdCloudy size={size} /> : <IoMdPartlySunny size={size} />,
        color: isNight ? 'text-gray-400' : 'text-yellow-300'
      };
    }
    if (iconCode === '03' || iconCode === '04') {
      // Scattered/Broken clouds - Sun peeking out from behind cloud
      return {
        icon: isNight ? <IoMdCloudy size={size} /> : <IoMdPartlySunny size={size} />,
        color: isNight ? 'text-gray-500' : 'text-yellow-300'
      };
    }
    if (iconCode === '09' || iconCode === '10') {
      // Rain - Blue
      if (mainCondition.includes('drizzle')) {
        return {
          icon: <BsCloudDrizzle size={size} />,
          color: 'text-blue-400'
        };
      }
      return {
        icon: <IoMdRainy size={size} />,
        color: 'text-blue-600'
      };
    }
    if (iconCode === '11') {
      // Thunderstorm - Purple/Dark blue
      return {
        icon: <IoMdThunderstorm size={size} />,
        color: 'text-purple-600'
      };
    }
    if (iconCode === '13') {
      // Snow - Light blue/White
      return {
        icon: <IoMdSnow size={size} />,
        color: 'text-blue-200'
      };
    }
    if (iconCode === '50') {
      // Mist/Fog/Haze - Light gray
      return {
        icon: <BsCloudHaze size={size} />,
        color: 'text-gray-400'
      };
    }

    // Fallback based on description
    if (mainCondition.includes('clear')) {
      return {
        icon: isNight ? <MdWbTwilight size={size} /> : <IoMdSunny size={size} />,
        color: isNight ? 'text-indigo-400' : 'text-yellow-400'
      };
    }
    if (mainCondition.includes('cloud')) {
      if (mainCondition.includes('few') || mainCondition.includes('scattered') || mainCondition.includes('broken')) {
        return {
          icon: isNight ? <IoMdCloudy size={size} /> : <IoMdPartlySunny size={size} />,
          color: isNight ? 'text-gray-400' : 'text-yellow-300'
        };
      }
      return {
        icon: <IoMdCloudy size={size} />,
        color: 'text-gray-500'
      };
    }
    if (mainCondition.includes('rain') || mainCondition.includes('drizzle')) {
      if (mainCondition.includes('drizzle')) {
        return {
          icon: <BsCloudDrizzle size={size} />,
          color: 'text-blue-400'
        };
      }
      return {
        icon: <IoMdRainy size={size} />,
        color: 'text-blue-600'
      };
    }
    if (mainCondition.includes('thunderstorm')) {
      return {
        icon: <IoMdThunderstorm size={size} />,
        color: 'text-purple-600'
      };
    }
    if (mainCondition.includes('snow')) {
      return {
        icon: <IoMdSnow size={size} />,
        color: 'text-blue-200'
      };
    }
    if (mainCondition.includes('mist') || mainCondition.includes('fog') || mainCondition.includes('haze')) {
      return {
        icon: <BsCloudHaze size={size} />,
        color: 'text-gray-400'
      };
    }
    
    // Default to sunny
    return {
      icon: isNight ? <MdWbTwilight size={size} /> : <IoMdSunny size={size} />,
      color: isNight ? 'text-indigo-400' : 'text-yellow-400'
    };
  };

  const { icon: iconElement, color } = getIconAndColor();

  return (
    <div className={`${color} ${className}`}>
      {iconElement}
    </div>
  );
}
