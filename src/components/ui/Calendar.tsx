'use client';

import * as React from 'react';
import { DayPicker } from 'react-day-picker';
import type { CalendarMonth } from 'react-day-picker';
import { cn } from '@/lib/utils';

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

interface CalendarProps {
  selected?: Date | null;
  onSelect?: (date: Date | undefined) => void;
  fromYear?: number;
  toYear?: number;
  initialMonth?: Date;
  className?: string;
}

export function Calendar({
  selected,
  onSelect,
  fromYear = 1900,
  toYear = new Date().getFullYear(),
  initialMonth,
  className,
}: CalendarProps) {
  const [mode, setMode] = React.useState<'days' | 'months' | 'years'>('days');
  const [month, setMonth] = React.useState<Date>(
    initialMonth || selected || new Date()
  );

  // Month grid view
  if (mode === 'months') {
    return (
      <div
        className={cn(
          'bg-white text-gray-900 p-6 rounded-xl shadow-lg w-96',
          className
        )}
      >
        <div className='flex justify-between items-center mb-6'>
          <button
            aria-label='Previous year'
            className='p-2 rounded hover:bg-gray-100 text-lg'
            onClick={() =>
              setMonth(new Date(month.getFullYear() - 1, month.getMonth(), 1))
            }
          >
            &lt;
          </button>
          <span className='font-semibold text-xl'>{month.getFullYear()}</span>
          <button
            aria-label='Next year'
            className='p-2 rounded hover:bg-gray-100 text-lg'
            onClick={() =>
              setMonth(new Date(month.getFullYear() + 1, month.getMonth(), 1))
            }
          >
            &gt;
          </button>
        </div>
        <div className='grid grid-cols-3 gap-4'>
          {months.map((m, idx) => (
            <button
              key={m}
              className={cn(
                'p-3 rounded-lg text-base font-medium hover:bg-primary/10 transition',
                month.getMonth() === idx
                  ? 'bg-primary/20 font-bold text-primary'
                  : ''
              )}
              onClick={() => {
                setMonth(new Date(month.getFullYear(), idx, 1));
                setMode('days');
              }}
            >
              {m}
            </button>
          ))}
        </div>
        <button
          className='mt-6 text-blue-500 underline'
          onClick={() => setMode('days')}
        >
          Back to days
        </button>
      </div>
    );
  }

  // Year grid view
  if (mode === 'years') {
    const currentYear = month.getFullYear();
    const startYear = Math.max(fromYear, currentYear - 8);
    const endYear = Math.min(toYear, startYear + 11);
    const years = Array.from(
      { length: endYear - startYear + 1 },
      (_, i) => startYear + i
    );
    return (
      <div
        className={cn(
          'bg-white text-gray-900 p-6 rounded-xl shadow-lg w-96',
          className
        )}
      >
        <div className='flex justify-between items-center mb-6'>
          <button
            aria-label='Previous years'
            className='p-2 rounded hover:bg-gray-100 text-lg'
            onClick={() =>
              setMonth(new Date(startYear - 12, month.getMonth(), 1))
            }
            disabled={startYear - 12 < fromYear}
          >
            &lt;
          </button>
          <span className='font-semibold text-xl'>Select Year</span>
          <button
            aria-label='Next years'
            className='p-2 rounded hover:bg-gray-100 text-lg'
            onClick={() => setMonth(new Date(endYear + 1, month.getMonth(), 1))}
            disabled={endYear + 1 > toYear}
          >
            &gt;
          </button>
        </div>
        <div className='grid grid-cols-4 gap-4'>
          {years.map((y) => (
            <button
              key={y}
              className={cn(
                'p-3 rounded-lg text-base font-medium hover:bg-primary/10 transition',
                month.getFullYear() === y
                  ? 'bg-primary/20 font-bold text-primary'
                  : ''
              )}
              onClick={() => {
                setMonth(new Date(y, month.getMonth(), 1));
                setMode('months');
              }}
            >
              {y}
            </button>
          ))}
        </div>
        <button
          className='mt-6 text-blue-500 underline'
          onClick={() => setMode('days')}
        >
          Back to days
        </button>
      </div>
    );
  }

  // Custom caption for day view
  function CustomCaption({ calendarMonth }: { calendarMonth: CalendarMonth }) {
    const displayMonth = calendarMonth.date;
    return (
      <div className='flex items-center justify-center gap-4 relative py-2'>
        <button
          aria-label='Previous month'
          className='absolute left-0 p-2 rounded hover:bg-gray-100 text-xl'
          onClick={() =>
            setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))
          }
        >
          &lt;
        </button>
        <button
          className='font-semibold text-xl px-2 hover:underline'
          onClick={() => setMode('months')}
        >
          {months[displayMonth.getMonth()]}
        </button>
        <button
          className='font-semibold text-xl px-2 hover:underline'
          onClick={() => setMode('years')}
        >
          {displayMonth.getFullYear()}
        </button>
        <button
          aria-label='Next month'
          className='absolute right-0 p-2 rounded hover:bg-gray-100 text-xl'
          onClick={() =>
            setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))
          }
        >
          &gt;
        </button>
      </div>
    );
  }

  // Day view (default)
  return (
    <div
      className={cn(
        'bg-white text-gray-900 p-6 rounded-xl shadow-lg w-96',
        className
      )}
    >
      <DayPicker
        mode='single'
        selected={selected || undefined}
        onSelect={onSelect}
        month={month}
        onMonthChange={setMonth}
        showOutsideDays
        fromYear={fromYear}
        toYear={toYear}
        components={{
          MonthCaption: (props) => (
            <CustomCaption calendarMonth={props.calendarMonth} />
          ),
        }}
        className=''
        classNames={{
          months: 'flex flex-col',
          month: 'space-y-4',
          caption: 'flex justify-center pt-1 relative items-center',
          caption_label: 'text-base font-medium',
          nav: 'hidden', // Hide default nav
          day: 'h-12 w-12 p-0 font-normal rounded-lg text-lg hover:bg-primary/10 transition',
          day_selected:
            'bg-primary text-white hover:bg-primary focus:bg-primary',
          day_today: 'border border-primary',
          day_outside: 'text-gray-400 opacity-50',
          day_disabled: 'text-gray-300 opacity-50',
          day_range_middle: 'bg-primary/20',
          day_hidden: 'invisible',
        }}
        {...(initialMonth ? { initialMonth } : {})}
      />
    </div>
  );
}
