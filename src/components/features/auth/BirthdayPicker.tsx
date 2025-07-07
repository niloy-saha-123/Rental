/**
 * @file src/components/features/auth/BirthdayPicker.tsx
 * @description Birthday picker component for our app, allowing users to select their date of birth. We use this in onboarding and profile flows to collect and validate user age.
 */
'use client';

import React, { useState } from 'react';
import { format, isAfter } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Calendar } from '../../ui/Calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/Popover';
import { cn } from '@/lib/utils';

interface BirthdayPickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  error?: string | null;
  required?: boolean;
  className?: string;
}

export const BirthdayPicker: React.FC<BirthdayPickerProps> = ({
  value,
  onChange,
  error,
  required = false,
  className,
}) => {
  // Calculate the latest allowed birthday (today - 16 years)
  const today = new Date();
  const minAgeDate = new Date(
    today.getFullYear() - 16,
    today.getMonth(),
    today.getDate()
  );
  const [showTooltip, setShowTooltip] = useState(false);

  // Handler to allow selecting any date
  const handleSelect = (date: Date | undefined) => {
    onChange(date ?? null);
  };

  return (
    <div className='w-full relative'>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type='button'
            variant='outline'
            className={cn(
              'w-full justify-start text-left font-normal pl-3',
              !value && 'text-muted-foreground',
              error && 'border-red-500',
              className
            )}
          >
            <CalendarIcon className='mr-2 h-4 w-4 text-muted-foreground' />
            {value ? (
              format(value, 'MM/dd/yyyy')
            ) : (
              <span className='text-muted-foreground'>
                Select your birthday
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align='start' className='p-0 mt-2'>
          <Calendar
            selected={value}
            onSelect={handleSelect}
            fromYear={1900}
            toYear={today.getFullYear()}
            initialMonth={today}
          />
        </PopoverContent>
      </Popover>
      {error && <div className='text-xs text-red-500 mt-1'>{error}</div>}
    </div>
  );
};
