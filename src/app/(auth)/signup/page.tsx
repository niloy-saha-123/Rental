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

// Import Shadcn UI Calendar components
import { Calendar } from '@/components/ui/Calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/Popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns'; // Utility for date formatting (e.g., toISOString)
import { cn } from '@/lib/utils';

// Importing the GoogleButton component from the icons folder
import GoogleButton from '@/components/icons/GoogleIcon';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { PasswordRequirements } from '@/components/ui/PasswordRequirements';
import { Eye, EyeOff } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: '', // Optional
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date | null>(null); // State for the Calendar component (holds Date object)
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const [rePassword, setRePassword] = useState('');
  const [rePasswordTouched, setRePasswordTouched] = useState(false);

  // Password requirements
  const passwordRequirements = [
    {
      label: 'Enter at least 8 characters',
      test: (pw: string) => pw.length >= 8,
    },
    {
      label: 'Enter at least one uppercase letter',
      test: (pw: string) => /[A-Z]/.test(pw),
    },
    {
      label: 'Enter at least one lowercase letter',
      test: (pw: string) => /[a-z]/.test(pw),
    },
    {
      label: 'Enter at least one digit',
      test: (pw: string) => /[0-9]/.test(pw),
    },
    {
      label: 'Enter at least one special character (e.g., !, @, #, $)',
      test: (pw: string) => /[^a-zA-Z0-9]/.test(pw),
    },
  ];

  const allPasswordValid = passwordRequirements.every((r) =>
    r.test(formData.password)
  );

  const passwordsMatch =
    formData.password === rePassword && rePassword.length > 0;
  const showRePasswordError = rePasswordTouched && !passwordsMatch;

  // Use the tRPC mutation hook for signup
  const signupMutation = api.auth.signup.useMutation({
    onSuccess: async () => {
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

  // This handleChange is only for name, email, password, phoneNumber
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, password: e.target.value });
    setPasswordTouched(true);
    // Validate password and collect all errors
    try {
      signupSchema.shape.password.parse(e.target.value);
      setPasswordErrors([]);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setPasswordErrors(err.errors.map((e) => e.message));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    // Password requirements check
    if (!allPasswordValid) {
      setPasswordTouched(true);
      setLoading(false);
      return;
    }
    // Passwords match check
    if (!passwordsMatch) {
      setRePasswordTouched(true);
      setLoading(false);
      return;
    }

    // Validate phone number before submit
    if (formData.phoneNumber && !/^\+1\d{10}$/.test(formData.phoneNumber)) {
      setPhoneError('Enter a valid US phone number');
      setLoading(false);
      return;
    }

    try {
      // Check if birthday is required
      if (!date) {
        setError('Birthday is required.');
        setLoading(false);
        return;
      }

      // Prepare dataToSend: Combine formData with the date picker's 'date' state for birthday
      const dataToSend = {
        ...formData,
        // Format the Date object from 'date' state to 'YYYY-MM-DD' string
        birthday: format(date, 'yyyy-MM-dd'),
      };

      // Client-side validation using Zod before sending to API
      signupSchema.parse(dataToSend); // Validate the combined and formatted data

      await signupMutation.mutateAsync(dataToSend); // Send the validated data
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
          <div className='relative'>
            <Input
              name='password'
              type={showPassword ? 'text' : 'password'}
              placeholder='Password (min 8 chars)'
              value={formData.password}
              onChange={handlePasswordChange}
              onFocus={() => {
                setPasswordFocused(true);
                // Auto-hide re-enter password if there's content in it
                if (rePassword.length > 0) {
                  setShowRePassword(false);
                }
              }}
              onBlur={() => {
                setPasswordFocused(false);
                setPasswordTouched(true);
              }}
              required
              className='rounded-md pr-10'
            />
            <button
              type='button'
              tabIndex={-1}
              className='absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'
              onClick={() => {
                setShowPassword((v) => !v);
                // Auto-hide re-enter password if there's content in it
                if (rePassword.length > 0) {
                  setShowRePassword(false);
                }
              }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <PasswordRequirements
            password={formData.password}
            show={passwordFocused || !!formData.password || passwordTouched}
          />

          {/* Re-enter password field */}
          <div className='relative'>
            <Input
              name='repassword'
              type={showRePassword ? 'text' : 'password'}
              placeholder='Re-enter password'
              value={rePassword}
              onChange={(e) => {
                setRePassword(e.target.value);
                setRePasswordTouched(true);
              }}
              onFocus={() => {
                setRePasswordTouched(true);
                setShowPassword(false); // Always hide main password and close eye when focusing re-enter
              }}
              required
              className='rounded-md pr-10'
            />
            <button
              type='button'
              tabIndex={-1}
              className='absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'
              onClick={() => {
                setShowRePassword((v) => !v);
                // Always hide main password when toggling re-enter password eye
                setShowPassword(false);
              }}
              aria-label={showRePassword ? 'Hide password' : 'Show password'}
            >
              {showRePassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {rePasswordTouched && (
            <div
              className={
                passwordsMatch
                  ? 'text-green-600 text-xs mt-1'
                  : 'text-red-500 text-xs mt-1'
              }
            >
              {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
            </div>
          )}

          {/* Birthday Picker - Simple Professional Setup */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type='button'
                variant='outline'
                className={cn(
                  'w-full justify-start text-left font-normal pl-3',
                  !date && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className='mr-2 h-4 w-4 text-muted-foreground' />
                {date ? (
                  format(date, 'MM/dd/yyyy')
                ) : (
                  <span className='text-muted-foreground'>
                    Select your birthday
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align='start' className='p-0 mt-2'>
              <Calendar
                selected={date}
                onSelect={(d) => setDate(d ?? null)}
                fromYear={1900}
                toYear={new Date().getFullYear()}
                initialMonth={date || undefined}
              />
            </PopoverContent>
          </Popover>

          {/* Phone Number Input */}
          <PhoneInput
            value={formData.phoneNumber}
            onChange={(val) => {
              setFormData((prev) => ({ ...prev, phoneNumber: val }));
              // No validation here!
            }}
            error={phoneError}
            name='phoneNumber'
            className='rounded-md'
            onBlur={() => {
              if (
                formData.phoneNumber &&
                !/^\+1\d{10}$/.test(formData.phoneNumber)
              ) {
                setPhoneError('Enter a valid US phone number');
              } else {
                setPhoneError(null);
              }
            }}
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

        <p className='mt-4 text-center text-sm text-gray-600'>
          Already have an account?{' '}
          <a href='/login' className='text-primary hover:underline'>
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}
