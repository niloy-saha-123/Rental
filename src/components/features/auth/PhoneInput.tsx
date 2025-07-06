/**
 * @file src/components/features/auth/PhoneInput.tsx
 * @description Phone input component for our app. We use this to collect and format US phone numbers, enforcing the '+1' country code and digit-only input.
 */
'use client';

import * as React from 'react';
import { Input } from '../../ui/Input';

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
    // We only store digits after +1 for consistency
    const getDigits = (val: string) => val.replace(/\D/g, '');

    // We handle input changes and enforce digit-only input after +1
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let raw = e.target.value;
      let digits = getDigits(raw.replace(/^\+1\s?/, ''));
      if (digits.length > 10) digits = digits.slice(0, 10);
      onChange?.(digits ? `+1 ${digits}` : '');
    };

    // We block invalid characters and prevent removing '+1 ' prefix
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
        if (
          e.key === 'Backspace' &&
          input.selectionStart !== null &&
          input.selectionStart <= 3
        ) {
          e.preventDefault();
        }
        return;
      }
      if (!/\d/.test(e.key)) {
        e.preventDefault();
      }
    };

    // We show the placeholder if the value is empty or just '+1 '
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
