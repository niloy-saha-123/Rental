'use client';

import * as React from 'react';
import { format, parse, isValid } from 'date-fns';
import { Input } from './Input';
import { Calendar } from './Calendar';
import { Popover, PopoverTrigger, PopoverContent } from './Popover';
import { Button } from './Button';
import { CalendarIcon } from 'lucide-react';

interface DateInputProps {
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  placeholder?: string;
  minYear?: number;
  maxYear?: number;
  label?: string;
  required?: boolean;
  disabled?: boolean;
}

export const DateInput: React.FC<DateInputProps> = ({
  value,
  onChange,
  placeholder = 'MM/DD/YYYY',
  minYear = 1900,
  maxYear = new Date().getFullYear(),
  required = false,
  disabled = false,
}) => {
  const [inputValue, setInputValue] = React.useState<string>(
    value ? format(value, 'MM/dd/yyyy') : ''
  );
  const [calendarOpen, setCalendarOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Sync input when value changes externally
  React.useEffect(() => {
    if (value && isValid(value)) {
      setInputValue(format(value, 'MM/dd/yyyy'));
    }
  }, [value]);

  // Helper: get max days in month
  function getMaxDay(mm: number, yyyy: number) {
    return new Date(yyyy, mm, 0).getDate();
  }

  // Masked input handler
  const handleMaskedInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^\d]/g, ''); // Only digits
    let mm = val.slice(0, 2);
    let dd = val.slice(2, 4);
    let yyyy = val.slice(4, 8);
    let formatted = '';
    let errorMsg = null;

    // Month
    if (mm.length === 1) {
      if (parseInt(mm) > 1) mm = '0' + mm; // e.g. '2' -> '02'
    }
    if (mm.length === 2) {
      if (parseInt(mm) < 1 || parseInt(mm) > 12) {
        errorMsg = 'Month must be 01-12';
      }
      formatted = mm;
      if (val.length > 2) formatted += '/';
    } else {
      formatted = mm;
    }
    // Day
    if (dd.length > 0) {
      if (dd.length === 1 && val.length > 2) {
        if (parseInt(dd) > 3) dd = '0' + dd;
      }
      if (dd.length === 2) {
        const m = parseInt(mm);
        const y = yyyy ? parseInt(yyyy) : 2000;
        const maxDay = getMaxDay(m, y);
        if (parseInt(dd) < 1 || parseInt(dd) > maxDay) {
          errorMsg = 'Invalid day for month';
        }
        formatted += dd ? '/' + dd : '';
        if (val.length > 4) formatted += '/';
      } else {
        formatted += dd ? '/' + dd : '';
      }
    }
    // Year
    if (yyyy.length > 0) {
      formatted += yyyy ? '/' + yyyy : '';
      if (yyyy.length === 4) {
        const y = parseInt(yyyy);
        if (y < minYear || y > maxYear) {
          errorMsg = `Year must be ${minYear}-${maxYear}`;
        }
      }
    }
    setInputValue(formatted);
    setError(errorMsg);
    // Only update on valid full date
    if (formatted.length === 10 && !errorMsg) {
      const parsed = parse(formatted, 'MM/dd/yyyy', new Date());
      if (isValid(parsed)) {
        onChange?.(parsed);
      } else {
        onChange?.(null);
      }
    } else {
      onChange?.(null);
    }
  };

  // When a date is picked from calendar
  const handleCalendarSelect = (date: Date | undefined) => {
    if (date && isValid(date)) {
      setInputValue(format(date, 'MM/dd/yyyy'));
      setError(null);
      onChange?.(date);
      setCalendarOpen(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className='w-full relative'>
      <Input
        ref={inputRef}
        type='text'
        value={inputValue}
        onChange={handleMaskedInput}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={10}
        pattern='\d{2}/\d{2}/\d{4}'
        className={
          error
            ? 'border-red-500 pl-10' // leave space for icon
            : 'pl-10' // leave space for icon
        }
        autoComplete='off'
        inputMode='numeric'
      />
      {/* Calendar icon inside input, left side */}
      <div className='absolute inset-y-0 left-0 flex items-center pl-2'>
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <button
              type='button'
              tabIndex={-1}
              aria-label='Open calendar'
              disabled={disabled}
              className='p-0 bg-transparent border-0 outline-none focus:ring-0'
            >
              <CalendarIcon className='w-5 h-5 text-muted-foreground' />
            </button>
          </PopoverTrigger>
          <PopoverContent align='start' className='p-0 mt-2'>
            <Calendar
              selected={
                inputValue &&
                isValid(parse(inputValue, 'MM/dd/yyyy', new Date()))
                  ? parse(inputValue, 'MM/dd/yyyy', new Date())
                  : undefined
              }
              onSelect={handleCalendarSelect}
              fromYear={minYear}
              toYear={maxYear}
              initialMonth={
                inputValue &&
                isValid(parse(inputValue, 'MM/dd/yyyy', new Date()))
                  ? parse(inputValue, 'MM/dd/yyyy', new Date())
                  : undefined
              }
            />
          </PopoverContent>
        </Popover>
      </div>
      {error && <div className='text-xs text-red-500 mt-1'>{error}</div>}
    </div>
  );
};
