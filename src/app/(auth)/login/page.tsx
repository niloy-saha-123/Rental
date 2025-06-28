/**
 * @file src/app/(auth)/login/page.tsx
 * @description This is the client-side component for the user login page.
 * It provides a form for users to log in using either traditional email and password
 * credentials (handled by NextAuth.js's CredentialsProvider) or via Google OAuth.
 * It interacts directly with the NextAuth.js client-side functions.
 */
'use client'; // This is a client component

import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

// Using Input and Button components from components/ui (now possibly Shadcn's versions)
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

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

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCredentialsSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError(result.error);
      } else if (result?.ok) {
        router.push(callbackUrl);
      }
    } catch (err) {
      console.error('Credentials Sign-in Error:', err);
      setError('An unexpected error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signIn('google', {
        callbackUrl: callbackUrl,
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
        {' '}
        {/* Added border */}
        <h1 className='text-2xl font-bold text-center mb-6 text-primary font-serif'>
          {' '}
          {/* Added text color & font-serif */}
          Login to Gear Up
        </h1>
        {error && <p className='text-red-500 text-center mb-4'>{error}</p>}
        <div className='space-y-4'>
          <Input
            type='email'
            placeholder='Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='rounded-md' // Ensure input rounding
          />
          <Input
            type='password'
            placeholder='Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className='rounded-md' // Ensure input rounding
          />
          <Button
            onClick={handleCredentialsSignIn}
            disabled={loading}
            className='w-full bg-primary hover:bg-primary-dark rounded-md' // Updated button colors & rounding
          >
            {loading ? 'Logging in...' : 'Login with Email'}
          </Button>
        </div>
        <div className='my-6 text-center text-gray-500'>OR</div>
        <Button
          onClick={handleGoogleSignIn}
          disabled={loading}
          icon={<GoogleIcon />}
          variant='outline' // Use outline variant for social buttons
          className='w-full border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-md' // Styled for Google
        >
          {loading ? 'Signing in...' : 'Sign in with Google'}
        </Button>
        <p className='text-center text-sm mt-6'>
          Don't have an account?{' '}
          <button
            onClick={() => router.push('/signup')}
            className='text-primary hover:underline font-medium' // Updated link color
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}
