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
import { Eye, EyeOff } from 'lucide-react';

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
  const [showPassword, setShowPassword] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  // Email format validation
  const emailFormatValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleCredentialsSignIn = async () => {
    setLoading(true);
    setError(null);
    // Prevent login if email format is invalid
    if (!emailFormatValid) {
      setError('Invalid email address');
      setLoading(false);
      return;
    }
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        // Show specific error for wrong email or password
        if (result.error.toLowerCase().includes('email')) {
          setError('Email does not exist');
        } else if (result.error.toLowerCase().includes('password')) {
          setError('Incorrect password');
        } else {
          setError(result.error);
        }
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
      <div className='w-[320px] max-w-[320px] min-w-[320px] min-h-[500px] bg-white p-8 rounded-lg shadow-md border border-primary-light'>
        <h1 className='text-2xl font-bold text-center mb-6 text-primary font-serif'>
          Log In to Gear Up
        </h1>
        {error && <p className='text-red-500 text-center mb-4'>{error}</p>}
        <form
          className='space-y-4'
          onSubmit={(e) => {
            e.preventDefault();
            handleCredentialsSignIn();
          }}
        >
          <Input
            type='email'
            placeholder='Email'
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailTouched(true);
              if (error && error.toLowerCase().includes('email'))
                setError(null);
            }}
            onBlur={() => setEmailTouched(true)}
            className='rounded-md w-full'
          />
          {/* Show instant email format error if touched and invalid */}
          {emailTouched && email && !emailFormatValid && (
            <div className='text-xs text-red-500 mt-1'>
              Invalid email address
            </div>
          )}
          <div className='relative'>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder='Password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='rounded-md w-full pr-10'
            />
            <button
              type='button'
              tabIndex={-1}
              className='absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <Button
            type='submit'
            disabled={Boolean(
              loading || (emailTouched && email && !emailFormatValid)
            )}
            className='w-full bg-primary hover:bg-primary-dark rounded-md'
          >
            {loading ? 'Logging in...' : 'Login with Email'}
          </Button>
        </form>
        <div className='my-6 text-center text-gray-500'>OR</div>
        <GoogleButton
          type='signin'
          onClick={handleGoogleSignIn}
          disabled={loading}
          className='rounded-full overflow-hidden w-full font-sans font-normal text-base'
        />
        <p className='text-center text-sm mt-6'>
          Don&apos;t have an account?{' '}
          <button
            onClick={() => router.push('/signup')}
            className='text-primary hover:underline font-medium'
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}
