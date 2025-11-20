import React, { useState } from 'react';
import { format, startOfDay, endOfDay, subDays, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';
import { FiCalendar } from 'react-icons/fi';

export type TimeRange = {
  label: string;
  startDate: Date;
  endDate: Date;
};

interface TimeRangeSelectorProps {
  onRangeChange: (range: TimeRange) => void;
  selectedRange: TimeRange | null;
}

export default function TimeRangeSelector({ onRangeChange, selectedRange }: TimeRangeSelectorProps) {
  const [showCustom, setShowCustom] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const getPredefinedRanges = (): TimeRange[] => {
    const now = new Date();
    const today = startOfDay(now);
    const tomorrow = endOfDay(addDays(today, 1));
    const yesterday = startOfDay(subDays(today, 1));
    const yesterdayEnd = endOfDay(yesterday);

    // This week
    const thisWeekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
    const thisWeekEnd = endOfWeek(today, { weekStartsOn: 1 });

    // Last week
    const lastWeekStart = startOfWeek(subDays(thisWeekStart, 7), { weekStartsOn: 1 });
    const lastWeekEnd = endOfWeek(subDays(thisWeekStart, 7), { weekStartsOn: 1 });

    // Next week
    const nextWeekStart = startOfWeek(addDays(thisWeekEnd, 1), { weekStartsOn: 1 });
    const nextWeekEnd = endOfWeek(addDays(thisWeekEnd, 1), { weekStartsOn: 1 });

    // This month
    const thisMonthStart = startOfMonth(today);
    const thisMonthEnd = endOfMonth(today);

    // Last month
    const lastMonthStart = startOfMonth(subMonths(today, 1));
    const lastMonthEnd = endOfMonth(subMonths(today, 1));

    // Next month
    const nextMonthStart = startOfMonth(addMonths(today, 1));
    const nextMonthEnd = endOfMonth(addMonths(today, 1));

    return [
      { label: 'Today', startDate: today, endDate: tomorrow },
      { label: 'Yesterday', startDate: yesterday, endDate: yesterdayEnd },
      { label: 'Tomorrow', startDate: tomorrow, endDate: endOfDay(addDays(tomorrow, 1)) },
      { label: 'This Week', startDate: thisWeekStart, endDate: thisWeekEnd },
      { label: 'Last Week', startDate: lastWeekStart, endDate: lastWeekEnd },
      { label: 'Next Week', startDate: nextWeekStart, endDate: nextWeekEnd },
      { label: 'This Month', startDate: thisMonthStart, endDate: thisMonthEnd },
      { label: 'Last Month', startDate: lastMonthStart, endDate: lastMonthEnd },
      { label: 'Next Month', startDate: nextMonthStart, endDate: nextMonthEnd },
    ];
  };

  const handlePredefinedRange = (range: TimeRange) => {
    onRangeChange(range);
    setShowCustom(false);
  };

  const handleCustomRange = () => {
    if (customStart && customEnd) {
      const start = startOfDay(new Date(customStart));
      const end = endOfDay(new Date(customEnd));
      
      if (start <= end) {
        onRangeChange({
          label: `Custom: ${format(start, 'MMM d')} - ${format(end, 'MMM d')}`,
          startDate: start,
          endDate: end,
        });
        setShowCustom(false);
      } else {
        alert('Start date must be before end date');
      }
    }
  };

  const ranges = getPredefinedRanges();

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <FiCalendar className="text-blue-500" size={20} />
        <h2 className="text-2xl font-bold text-gray-800">Select Time Range</h2>
      </div>

      {/* Predefined Ranges */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
        {ranges.map((range) => (
          <button
            key={range.label}
            onClick={() => handlePredefinedRange(range)}
            className={`px-4 py-3 rounded-lg font-medium transition-colors ${
              selectedRange?.label === range.label
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
            }`}
          >
            {range.label}
          </button>
        ))}
        <button
          onClick={() => setShowCustom(!showCustom)}
          className={`px-4 py-3 rounded-lg font-medium transition-colors ${
            showCustom || (selectedRange && !ranges.find(r => r.label === selectedRange.label))
              ? 'bg-blue-500 text-white shadow-lg'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
          }`}
        >
          Custom Range
        </button>
      </div>

      {/* Custom Range Picker */}
      {showCustom && (
        <div className="mt-4 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
          <h3 className="font-semibold text-gray-800 mb-3">Select Custom Date Range</h3>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleCustomRange}
                disabled={!customStart || !customEnd}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selected Range Display */}
      {selectedRange && (
        <div className="mt-4 p-3 bg-blue-100 rounded-lg">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Selected:</span> {selectedRange.label}
            {' '}({format(selectedRange.startDate, 'MMM d, yyyy')} - {format(selectedRange.endDate, 'MMM d, yyyy')})
          </p>
        </div>
      )}
    </div>
  );
}

