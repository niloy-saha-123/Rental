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

  const handleChange = (val: string) => {
    onChange(val);
    // Clear error when user is typing (don't show error during input)
    setError(null);
  };

  const handleBlur = () => {
    // Final validation on blur - only validate if there's content (phone is optional)
    // PhoneInput formats it as "+1 1234567890" (13 characters total: +1 + space + 10 digits)
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
