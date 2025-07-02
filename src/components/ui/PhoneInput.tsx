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
    // Only store digits, always start with 1
    const getDigits = (val: string) => val.replace(/\D/g, '');
    const formatPhone = (digits: string) => {
      if (!digits || digits === '1') return '';
      let formatted = '';
      if (digits.length > 0) formatted += '+1 ';
      if (digits.length > 1) formatted += '(' + digits.slice(1, 4);
      if (digits.length >= 4) formatted += ') ';
      if (digits.length >= 4) formatted += digits.slice(4, 7);
      if (digits.length >= 7) formatted += '-' + digits.slice(7, 11);
      return formatted.trim();
    };

    // Handler for input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let digits = getDigits(e.target.value);
      if (!digits.startsWith('1')) digits = '1' + digits;
      if (digits.length > 11) digits = digits.slice(0, 11);
      onChange?.('+' + digits);
    };

    // Handler for blur (validate only on blur)
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      if (onBlur) onBlur(e);
    };

    // Always format for display, but keep value as digits
    const digits = getDigits(value);
    // If empty or just '1', show empty string so placeholder appears
    const formattedValue = !digits || digits === '1' ? '' : formatPhone(digits);

    return (
      <div className='w-full'>
        <Input
          ref={ref}
          type='tel'
          name={name}
          value={formattedValue}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={className}
          maxLength={17}
          {...props}
        />
        {error && <div className='text-xs text-red-500 mt-1'>{error}</div>}
      </div>
    );
  }
);
PhoneInput.displayName = 'PhoneInput';
