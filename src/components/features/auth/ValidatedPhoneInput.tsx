/**
 * @file src/components/features/auth/ValidatedPhoneInput.tsx
 * @description Phone input component for our app with built-in validation. We use this to collect and validate US phone numbers in onboarding and profile flows.
 */
'use client';

import React, { useState } from 'react';
import { PhoneInput } from './PhoneInput';

interface ValidatedPhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
  name?: string;
  placeholder?: string;
}

export const ValidatedPhoneInput: React.FC<ValidatedPhoneInputProps> = ({
  value,
  onChange,
  required = false,
  className,
  name,
  placeholder = 'Phone number (optional)',
}) => {
  const [error, setError] = useState<string | null>(null);

  // We clear the error as the user types
  const handleChange = (val: string) => {
    onChange(val);
    setError(null);
  };

  // We validate the phone number on blur, but only if the field is not empty
  const handleBlur = () => {
    // Our app expects phone numbers in the format '+1 1234567890' (13 characters)
    if (value && value.length > 0 && value.length < 13) {
      setError('Enter a valid US phone number');
    } else {
      setError(null);
    }
  };

  return (
    <PhoneInput
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      error={error}
      name={name}
      placeholder={placeholder}
      className={className}
    />
  );
};
