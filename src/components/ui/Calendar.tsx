/**
 * @file src/components/ui/Calendar.tsx
 * @description A reusable React Calendar component from Shadcn UI, built on `react-day-picker`.
 * It provides a highly customizable and accessible date picker UI for selecting dates.
 */

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
  modifiers?: any;
}

export function Calendar({
  selected,
  onSelect,
  fromYear = 1900,
  toYear = new Date().getFullYear(),
  initialMonth,
  className,
  modifiers,
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
    // How many years per page? (4 columns x 3 rows = 12 years)
    const yearsPerPage = 12;
    const currentYear = month.getFullYear();
    // Find the first year of the current page
    const pageStartYear =
      Math.floor((currentYear - fromYear) / yearsPerPage) * yearsPerPage +
      fromYear;
    const pageEndYear = Math.min(pageStartYear + yearsPerPage - 1, toYear);
    const years = Array.from(
      { length: pageEndYear - pageStartYear + 1 },
      (_, i) => pageStartYear + i
    );
    // Pad with empty cells if needed
    const paddedYears = [
      ...years,
      ...Array(yearsPerPage - years.length).fill(null),
    ];
    // Can we go left/right?
    const canGoPrev = pageStartYear > fromYear;
    const canGoNext = pageEndYear < toYear;
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
              setMonth(
                new Date(pageStartYear - yearsPerPage, month.getMonth(), 1)
              )
            }
            disabled={!canGoPrev}
          >
            &lt;
          </button>
          <span className='font-semibold text-xl'>Select Year</span>
          <button
            aria-label='Next years'
            className='p-2 rounded hover:bg-gray-100 text-lg'
            onClick={() =>
              setMonth(
                new Date(pageStartYear + yearsPerPage, month.getMonth(), 1)
              )
            }
            disabled={!canGoNext}
          >
            &gt;
          </button>
        </div>
        <div
          className='grid grid-cols-4 gap-4'
          style={{ minHeight: `${3 * 44 + 2 * 16}px` }}
        >
          {paddedYears.map((y, idx) =>
            y !== null ? (
              <button
                key={y}
                className={cn(
                  'h-[44px] min-h-[44px] max-h-[44px] w-full rounded-lg text-base font-medium hover:bg-primary/10 transition',
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
            ) : (
              <div
                key={`empty-${idx}`}
                className='h-[44px] min-h-[44px] max-h-[44px] w-full rounded-lg text-base font-medium transition flex items-center justify-center'
                aria-hidden='true'
              />
            )
          )}
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
        fixedWeeks
        startMonth={new Date(fromYear, 0)}
        endMonth={new Date(toYear, 11)}
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
          head_cell: 'h-12 w-12 text-center font-normal',
          day: 'h-12 w-12 p-0 mt-2 font-normal rounded-lg text-lg text-center hover:bg-primary/10 transition',
          day_selected:
            'bg-primary text-white hover:bg-primary focus:bg-primary',
          day_today: 'border border-primary',
          day_outside: 'text-gray-400 opacity-50',
          day_disabled: 'text-gray-300 opacity-50',
          day_range_middle: 'bg-primary/20',
          day_hidden: 'invisible',
        }}
        {...(initialMonth ? { initialMonth } : {})}
        {...(modifiers ? { modifiers } : {})}
      />
    </div>
  );
}
