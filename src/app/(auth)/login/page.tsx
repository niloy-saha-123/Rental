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
// Importing the GoogleButton component from the icons folder
import GoogleButton from '@/components/icons/GoogleIcon'; // Changed from GoogleIcon to GoogleButton

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
        {/* Updated: Use the custom GoogleButton component directly */}
        <GoogleButton
          type='signin' // Specify 'signin' type for the button
          onClick={handleGoogleSignIn} // Attach the Google sign-in handler
          disabled={loading} // Disable button during loading
          className='rounded-full overflow-hidden' // Ensure button itself is pill-shaped if SVG is pill-shaped
        />
        <p className='text-center text-sm mt-6'>
          Don&apos;t have an account?{' '}
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
