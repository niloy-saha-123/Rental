/**
 * @file src/app/(auth)/signup/page.tsx
 * @description This is the client-side component for the user signup page.
 * It provides a form for new users to register an account using their email,
 * a chosen password, name, birthday, and optionally a phone number.
 * It interacts with the backend tRPC `auth.signup` mutation and then
 * automatically logs the user in upon successful registration.
 * This page also offers "Sign up with Google" for social registration.
 */
'use client'; // This is a client component

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react'; // For auto-login after signup and social sign-in

// Import the tRPC client (api) and Zod schema
import { api } from '@/lib/trpc/client';
import { signupSchema } from '@/lib/validators/authSchema';
import { z } from 'zod'; // Zod for client-side validation

// Using Input and Button components from components/ui (now possibly Shadcn's versions)
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

// NEW: Import Shadcn DatePicker components
import { Calendar } from '@/components/ui/Calendar'; // The calendar UI itself
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/Popover'; // For the pop-up behavior
import { format } from 'date-fns'; // Utility for date formatting (e.g., to YYYY-MM-DD string)
import { CalendarIcon } from 'lucide-react'; // Calendar icon (requires lucide-react)
import { cn } from '@/lib/utils'; // cn utility for conditional class names

// Define the Google SVG icon directly here (or import from a central icon file)
const GoogleIcon = () => (
  <svg
    width='24'
    height='24'
    viewBox='0 0 24 24'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path
      d='M12.0003 4.40997C14.0893 4.40997 15.7763 5.16997 17.0503 6.39997L20.5003 2.95997C18.3973 0.949973 15.4853 0 12.0003 0C7.27933 0 3.19933 2.61997 1.02033 6.60997L5.00033 9.73997C5.90333 7.02997 8.71833 4.40997 12.0003 4.40997Z'
      fill='#EA4335'
    />
    <path
      d='M23.9999 12.16H23.5189L23.4909 12.443L23.9999 12.16Z'
      fill='#4285F4'
    />
    <path
      d='M23.9999 12C23.9999 11.7371 23.9806 11.478 23.9559 11.221L12.0001 11.219L12.0001 15.986L18.7311 15.986C18.423 17.9622 17.2144 19.5772 15.5392 20.672L19.5692 23.792C21.8492 21.672 23.9999 18.232 23.9999 12Z'
      fill='#4285F4'
    />
    <path
      d='M12.0003 24.0001C15.4853 24.0001 18.3973 23.0501 20.5003 21.0401L17.0503 17.5901C15.7763 18.8201 14.0893 19.5801 12.0003 19.5801C8.71833 19.5801 5.90333 16.9601 5.00033 14.2501L1.02033 17.3801C3.19933 21.3701 7.27933 24.0001 12.0003 24.0001Z'
      fill='#34A853'
    />
    <path
      d='M5.00033 14.25L1.02033 17.38C1.40133 18.107 1.83633 18.805 2.30833 19.467L6.40133 16.337C6.18333 15.698 6.00033 14.992 5.90333 14.25H5.00033Z'
      fill='#FBBD00'
    />
    <path
      d='M23.9559 11.221H23.9999V12H23.5189L23.4909 11.221H23.9559Z'
      fill='#FBBD00'
    />
  </svg>
);

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    birthday: '', // Will be stored as YYYY-MM-DD string from date picker
    phoneNumber: '', // Optional
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date>(); // State for the DatePicker component

  // Use the tRPC mutation hook for signup
  const signupMutation = api.auth.signup.useMutation({
    onSuccess: async (data) => {
      setSuccess('Account created successfully! Redirecting to login...');
      setError(null);
      // Automatically log in the user after successful signup
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (result?.error) {
        setError(
          'Account created, but automatic login failed: ' + result.error
        );
        setSuccess(null);
      } else if (result?.ok) {
        router.push('/');
      }
    },
    onError: (err) => {
      console.error('Signup Error:', err);
      if (err.data?.zodError) {
        setError(
          Object.values(err.data.zodError.fieldErrors).flat().join('. ') ||
            'Validation error.'
        );
      } else {
        setError(err.message || 'An unexpected error occurred during signup.');
      }
      setSuccess(null);
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Client-side validation using Zod before sending to API
      // Ensure birthday is formatted correctly if using date picker.
      const dataToSend = {
        ...formData,
        birthday: date ? format(date, 'yyyy-MM-dd') : '', // Format date object to YYYY-MM-DD string
      };
      signupSchema.parse(dataToSend); // Validate formatted data

      await signupMutation.mutateAsync(dataToSend); // Send formatted data
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors.map((e) => e.message).join('. '));
      } else {
        setError('An unexpected client-side error occurred.');
      }
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signIn('google', {
        callbackUrl: '/',
      });
    } catch (err) {
      console.error('Google Sign-in Error:', err);
      setError('An unexpected error occurred during Google sign-in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex flex-col items-center justify-center min-h-[calc(100vh-128px)] p-4'>
      <div className='w-full max-w-md bg-white p-8 rounded-lg shadow-md border border-primary-light'>
        <h1 className='text-2xl font-bold text-center mb-6 text-primary font-serif'>
          Sign Up for Gear Up
        </h1>

        {error && <p className='text-red-500 text-center mb-4'>{error}</p>}
        {success && (
          <p className='text-green-500 text-center mb-4'>{success}</p>
        )}

        <form onSubmit={handleSubmit} className='space-y-4'>
          <Input
            name='name'
            type='text'
            placeholder='Full Name'
            value={formData.name}
            onChange={handleChange}
            required
            className='rounded-md' // Ensure input rounding
          />
          <Input
            name='email'
            type='email'
            placeholder='Email'
            value={formData.email}
            onChange={handleChange}
            required
            className='rounded-md' // Ensure input rounding
          />
          <Input
            name='password'
            type='password'
            placeholder='Password (min 8 chars)'
            value={formData.password}
            onChange={handleChange}
            required
            className='rounded-md' // Ensure input rounding
          />
          {/* Date Picker Component for Birthday */}
          {/* Replaced original birthday input */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'w-full justify-start text-left font-normal rounded-md', // Added rounded-md
                  !date && 'text-muted-foreground' // Class for placeholder text color
                )}
              >
                <CalendarIcon className='mr-2 h-4 w-4' /> {/* Calendar icon */}
                {date ? format(date, 'PPP') : <span>Pick a birthday</span>}{' '}
                {/* Display formatted date or placeholder */}
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0'>
              {' '}
              {/* Popover content for the calendar */}
              <Calendar
                mode='single' // Allows selection of a single date
                selected={date} // The currently selected date
                onSelect={setDate} // Callback when a date is selected
                initialFocus // Focuses the calendar on open
                captionLayout='dropdown' // Enables dropdowns for month/year selection
                fromYear={1900} // Start year for selection
                toYear={new Date().getFullYear()} // Current year as end year
              />
            </PopoverContent>
          </Popover>

          <Input
            name='phoneNumber'
            type='tel'
            placeholder='Phone Number (Optional)'
            value={formData.phoneNumber}
            onChange={handleChange}
            className='rounded-md' // Ensure input rounding
          />
          <Button
            type='submit'
            disabled={loading}
            className='w-full bg-primary hover:bg-primary-dark rounded-md'
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </Button>
        </form>

        <div className='my-6 text-center text-gray-500'>OR</div>

        <Button
          onClick={handleGoogleSignIn}
          disabled={loading}
          icon={<GoogleIcon />}
          variant='outline' // Use outline variant for social buttons
          className='w-full border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-md' // Styled for Google
        >
          {loading ? 'Signing up...' : 'Sign up with Google'}
        </Button>

        <p className='text-center text-sm mt-6'>
          Already have an account?{' '}
          <button
            onClick={() => router.push('/login')}
            className='text-primary hover:underline font-medium'
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}
