/**
 * @file src/app/(auth)/signup/page.tsx
 * @description This is the client-side component for the user signup page.
 * It provides a form for new users to register an account using their email,
 * a chosen password, name, birthday, and optionally a phone number.
 * It interacts with the backend tRPC `auth.signup` mutation and then
 * automatically logs the user in upon successful registration.
 */
'use client'; // This is a client component

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react'; // For auto-login after signup

// Import the tRPC client (api) and Zod schema
import { api } from '@/lib/trpc/client';
import { signupSchema } from '@/lib/validators/authSchema';
import { z } from 'zod'; // Zod for client-side validation

// Using draft Input and Button components from the components/ui
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    birthday: '', // Will be converted to Date
    phoneNumber: '', // Optional
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Use the tRPC mutation hook for signup
  const signupMutation = api.auth.signup.useMutation({
    onSuccess: async (data) => {
      setSuccess('Account created successfully! Redirecting to login...');
      setError(null);
      // Automatically log in the user after successful signup
      const result = await signIn('credentials', {
        redirect: false, // Prevent NextAuth from redirecting automatically
        email: formData.email,
        password: formData.password,
      });

      if (result?.error) {
        setError(
          'Account created, but automatic login failed: ' + result.error
        );
        setSuccess(null); // Clear success message if auto-login fails
      } else if (result?.ok) {
        router.push('/'); // Redirect to homepage or dashboard after successful signup and login
      }
    },
    onError: (err) => {
      console.error('Signup Error:', err);
      // Access specific Zod errors if present from tRPC's errorFormatter
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
      signupSchema.parse(formData);
      await signupMutation.mutateAsync(formData);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors.map((e) => e.message).join('. '));
      } else {
        setError('An unexpected client-side error occurred.');
      }
      setLoading(false);
    }
  };

  return (
    <div className='flex flex-col items-center justify-center min-h-[calc(100vh-128px)] p-4'>
      <div className='w-full max-w-md bg-white p-8 rounded-lg shadow-md'>
        <h1 className='text-2xl font-bold text-center mb-6'>
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
          />
          <Input
            name='email'
            type='email'
            placeholder='Email'
            value={formData.email}
            onChange={handleChange}
            required
          />
          <Input
            name='password'
            type='password'
            placeholder='Password (min 8 chars)'
            value={formData.password}
            onChange={handleChange}
            required
          />
          <Input
            name='birthday'
            type='date'
            placeholder='Birthday'
            value={formData.birthday}
            onChange={handleChange}
          />
          <Input
            name='phoneNumber'
            type='tel'
            placeholder='Phone Number (Optional)'
            value={formData.phoneNumber}
            onChange={handleChange}
          />
          <Button type='submit' disabled={loading} className='w-full'>
            {loading ? 'Signing up...' : 'Sign Up'}
          </Button>
        </form>

        <p className='text-center text-sm mt-6'>
          Already have an account?{' '}
          <button
            onClick={() => router.push('/login')}
            className='text-blue-600 hover:underline'
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}
