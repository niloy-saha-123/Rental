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

// Using draft Input and Button components from the components/ui
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/'; // Redirect back after login

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Handle traditional email/password login
  const handleCredentialsSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signIn('credentials', {
        redirect: false, // Prevent NextAuth from redirecting automatically
        email,
        password,
        // callbackUrl: callbackUrl, // We can pass callbackUrl if we want Auth.js to handle redirect
      });

      if (result?.error) {
        setError(result.error); // Display error message from Auth.js (e.g., "CredentialsSignin")
      } else if (result?.ok) {
        router.push(callbackUrl); // Manually redirect on success
      }
    } catch (err) {
      console.error('Credentials Sign-in Error:', err);
      setError('An unexpected error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Google OAuth sign-in
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signIn('google', {
        callbackUrl: callbackUrl, // Let Auth.js handle redirect for OAuth
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
      <div className='w-full max-w-md bg-white p-8 rounded-lg shadow-md'>
        <h1 className='text-2xl font-bold text-center mb-6'>
          Login to Gear Up
        </h1>

        {error && <p className='text-red-500 text-center mb-4'>{error}</p>}

        <div className='space-y-4'>
          <Input
            type='email'
            placeholder='Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type='password'
            placeholder='Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            onClick={handleCredentialsSignIn}
            disabled={loading}
            className='w-full'
          >
            {loading ? 'Logging in...' : 'Login with Email'}
          </Button>
        </div>

        <div className='my-6 text-center text-gray-500'>OR</div>

        <Button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className='w-full bg-blue-500 hover:bg-blue-600'
        >
          {loading ? 'Signing in...' : 'Sign in with Google'}
        </Button>

        <p className='text-center text-sm mt-6'>
          Don't have an account?{' '}
          <button
            onClick={() => router.push('/signup')}
            className='text-blue-600 hover:underline'
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}
