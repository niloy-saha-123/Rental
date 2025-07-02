'use client';

import * as React from 'react';
import { Input } from './Input';

interface PhoneInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'onChange' | 'value'
  > {
  value?: string;
  onChange?: (value: string) => void;
  error?: string | null;
  name?: string;
  placeholder?: string;
  className?: string;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
      value = '',
      onChange,
      error,
      name,
      placeholder = 'Phone number (optional)',
      className,
      onBlur,
      ...props
    },
    ref
  ) => {
    // Only store digits after +1
    const getDigits = (val: string) => val.replace(/\D/g, '');

    // Handler for input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let raw = e.target.value;
      // Remove everything except digits after +1
      let digits = getDigits(raw.replace(/^\+1\s?/, ''));
      // Only allow up to 10 digits after +1
      if (digits.length > 10) digits = digits.slice(0, 10);
      onChange?.(digits ? `+1 ${digits}` : '');
    };

    // Handler for keydown to block invalid chars and prevent removing '+1 '
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      const input = e.currentTarget;
      const allowed = [
        'Backspace',
        'Delete',
        'ArrowLeft',
        'ArrowRight',
        'Tab',
        'Home',
        'End',
      ];
      if (
        allowed.includes(e.key) ||
        (e.ctrlKey && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase()))
      ) {
        // Prevent removing '+1 '
        if (
          e.key === 'Backspace' &&
          input.selectionStart !== null &&
          input.selectionStart <= 3
        ) {
          e.preventDefault();
        }
        return;
      }
      // Only allow digits
      if (!/\d/.test(e.key)) {
        e.preventDefault();
      }
    };

    // Show placeholder if empty or just '+1 '
    const showPlaceholder = !value || value === '+1 ';
    const displayValue = showPlaceholder ? '' : value;

    return (
      <div className='w-full'>
        <Input
          ref={ref}
          type='tel'
          name={name}
          value={displayValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={onBlur}
          placeholder={placeholder}
          className={className}
          maxLength={14}
          autoComplete='off'
          {...props}
        />
        {error && <div className='text-xs text-red-500 mt-1'>{error}</div>}
      </div>
    );
  }
);
PhoneInput.displayName = 'PhoneInput';
