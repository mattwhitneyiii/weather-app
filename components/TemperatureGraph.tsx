'use client';

import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TimeRange } from './TimeRangeSelector';

interface TemperatureGraphProps {
  data: Array<{
    time: Date;
    temperature: number;
    high: number;
    low: number;
    label: string;
  }>;
  unit: 'celsius' | 'fahrenheit';
  graphType: 'line' | 'bar';
  timeRange: TimeRange;
}

export default function TemperatureGraph({
  data,
  unit,
  graphType,
  timeRange,
}: TemperatureGraphProps) {
  const unitSymbol = unit === 'celsius' ? '°C' : '°F';

  // Format data for the chart
  const chartData = data.map((item) => ({
    ...item,
    time: item.time.getTime(),
    name: item.label,
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-800 mb-2">
            {payload[0].payload.name}
          </p>
          {payload.map((entry: any, index: number) => (
            <p
              key={index}
              className="text-sm"
              style={{ color: entry.color }}
            >
              {entry.name}: {entry.value}{unitSymbol}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Format X-axis labels based on time range
  const formatXAxisLabel = (tickItem: number) => {
    const date = new Date(tickItem);
    const diffDays = Math.ceil(
      (timeRange.endDate.getTime() - timeRange.startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays <= 3) {
      // Show hours for today/yesterday/tomorrow (short ranges)
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffDays <= 14) {
      // Show day and date for weeks
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    } else {
      // Show date for months
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  if (chartData.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 text-center">
        <p className="text-gray-600">No data available for the selected time range.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Temperature Over Time ({timeRange.label})
      </h2>
      
      <ResponsiveContainer width="100%" height={500}>
        {graphType === 'line' ? (
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="time"
              tickFormatter={formatXAxisLabel}
              stroke="#666"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              label={{ value: `Temperature (${unitSymbol})`, angle: -90, position: 'insideLeft' }}
              stroke="#666"
              style={{ fontSize: '12px' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="temperature"
              name={`Temperature (${unitSymbol})`}
              stroke="#3B82F6"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        ) : (
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="time"
              tickFormatter={formatXAxisLabel}
              stroke="#666"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              label={{ value: `Temperature (${unitSymbol})`, angle: -90, position: 'insideLeft' }}
              stroke="#666"
              style={{ fontSize: '12px' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey="temperature"
              name={`Temperature (${unitSymbol})`}
              fill="#3B82F6"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        )}
      </ResponsiveContainer>

      <div className="mt-4 text-sm text-gray-600 text-center">
        <p>Showing {data.length} data points from {new Date(timeRange.startDate).toLocaleDateString()} to {new Date(timeRange.endDate).toLocaleDateString()}</p>
      </div>
    </div>
  );
}

