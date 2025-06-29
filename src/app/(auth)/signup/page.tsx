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

// Using Input and Button components from components/ui
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

// Removed: DatePicker components and date-fns import
// import { Calendar } from '@/components/ui/Calendar';
// import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover';
// import { format } from 'date-fns';
// import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils'; // cn utility for conditional class names

// Importing the GoogleButton component from the icons folder
import GoogleButton from '@/components/icons/GoogleIcon';

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    birthday: '', // Birthday is now a simple text input in YYYY-MM-DD format
    phoneNumber: '', // Optional
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // Removed: DatePicker state
  // const [date, setDate] = useState<Date>();

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
      // Birthday is now taken directly from formData
      signupSchema.parse(formData); // Validate formData directly

      await signupMutation.mutateAsync(formData); // Send formData directly
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
        callbackUrl: '/', // Redirect to homepage after Google signup/login
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
            className='rounded-md'
          />
          <Input
            name='email'
            type='email'
            placeholder='Email'
            value={formData.email}
            onChange={handleChange}
            required
            className='rounded-md'
          />
          <Input
            name='password'
            type='password'
            placeholder='Password (min 8 chars)'
            value={formData.password}
            onChange={handleChange}
            required
            className='rounded-md'
          />
          {/* Re-added: Simple Input field for Birthday, without date picker functionality */}
          <Input
            name='birthday'
            type='text' // Use 'text' or 'date' (native browser picker)
            placeholder='Birthday (YYYY-MM-DD)' // Inform user of format
            value={formData.birthday}
            onChange={handleChange}
            className='rounded-md'
          />

          <Input
            name='phoneNumber'
            type='tel'
            placeholder='Phone Number (Optional)'
            value={formData.phoneNumber}
            onChange={handleChange}
            className='rounded-md'
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

        <GoogleButton
          type='signup'
          onClick={handleGoogleSignIn}
          disabled={loading}
          className='rounded-full overflow-hidden'
        />

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
