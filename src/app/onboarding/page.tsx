/**
 * @file src/app/onboarding/page.tsx
 * @description This is a client-side page component for onboarding new users who signed up
 * via social login (e.g., Google) and need to complete their profile with essential details
 * like birthday and phone number. It displays pre-filled information and collects missing data,
 * then updates the user's profile via tRPC.
 */

'use client'; // This is a client component

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react'; // To access user session
import { api } from '@/lib/trpc/client'; // Your tRPC client
import { z } from 'zod'; // For client-side validation
// Assuming Input and Button components exist
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ValidatedPhoneInput } from '@/components/features/auth/ValidatedPhoneInput';
import { BirthdayPicker } from '@/components/features/auth/BirthdayPicker';

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, status } = useSession(); // Get session data
  const [formData, setFormData] = useState({
    birthday: null as Date | null,
    phoneNumber: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [birthdayError, setBirthdayError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // tRPC mutation to update user profile
  const updateProfileMutation = api.user.updateProfile.useMutation({
    onSuccess: () => {
      // If profile updated successfully, redirect to homepage
      router.push('/');
    },
    onError: (err: any) => {
      console.error('Profile Update Error:', err);
      if (err.data?.zodError) {
        setError(
          Object.values(err.data.zodError.fieldErrors).flat().join('. ') ||
            'Validation error.'
        );
      } else {
        setError(err.message || 'Failed to update profile.');
      }
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  useEffect(() => {
    // If user is not authenticated or not loaded, do nothing
    if (status === 'loading') return;

    // If user is not logged in, redirect to login page
    if (!session || !session.user) {
      router.push('/login');
      return;
    }

    // Populate form if user has existing data (e.g., if they came back to this page)
    const user = session.user as any; // Type assertion for extended session user
    if (user?.birthday) {
      // Convert string to Date object for BirthdayPicker
      const date = new Date(user.birthday);
      setFormData((prev) => ({ ...prev, birthday: date }));
    }
    if (user?.phoneNumber) {
      setFormData((prev) => ({
        ...prev,
        phoneNumber: user.phoneNumber as string,
      }));
    }

    // TODO: Add logic here to redirect if profile is already complete
    // This depends on how you define "complete" (e.g., both birthday and phone number present)
    // if (session.user.birthday && session.user.phoneNumber) {
    //   router.push('/'); // Redirect if already complete
    // }
  }, [session, status, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setBirthdayError(null);

    // Birthday age validation
    const today = new Date();
    const minAgeDate = new Date(
      today.getFullYear() - 16,
      today.getMonth(),
      today.getDate()
    );
    if (!formData.birthday) {
      setBirthdayError('Birthday is required.');
      setLoading(false);
      return;
    }
    if (formData.birthday > minAgeDate) {
      setBirthdayError('You must be at least 16 years old.');
      setLoading(false);
      return;
    }

    try {
      // Basic client-side validation using Zod
      const formSchema = z.object({
        birthday: z.date({
          required_error: 'Birthday is required.',
        }),
        phoneNumber: z.string().optional().nullable(),
      });
      formSchema.parse(formData);

      await updateProfileMutation.mutateAsync({
        birthday: formData.birthday!.toISOString().split('T')[0],
        phoneNumber: formData.phoneNumber || null, // Ensure null if empty string
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors.map((e) => e.message).join('. '));
      } else {
        setError('An unexpected error occurred during profile update.');
      }
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className='flex items-center justify-center min-h-[calc(100vh-128px)]'>
        Loading session...
      </div>
    );
  }

  // Ensure session.user exists before trying to access its properties
  if (!session || !session.user) {
    // This case should be handled by useEffect redirect, but good for initial render.
    return null;
  }

  return (
    <div className='flex flex-col items-center justify-center min-h-[calc(100vh-128px)] p-4'>
      <div className='w-full max-w-md bg-white p-8 rounded-lg shadow-md'>
        <h1 className='text-2xl font-bold text-center mb-6'>
          Complete Your Profile
        </h1>
        <p className='text-center text-gray-600 mb-4'>
          Welcome, {session.user.name || session.user.email}! Please provide a
          few more details.
        </p>

        {error && <p className='text-red-500 text-center mb-4'>{error}</p>}

        <form onSubmit={handleSubmit} className='space-y-4'>
          {/* Display Name and Email (not editable on this form) */}
          <Input
            type='text'
            value={session.user.name || ''}
            readOnly
            className='cursor-not-allowed bg-gray-50'
            placeholder='Name'
          />
          <Input
            type='email'
            value={session.user.email || ''}
            readOnly
            className='cursor-not-allowed bg-gray-50'
            placeholder='Email'
          />

          <BirthdayPicker
            value={formData.birthday}
            onChange={(date) => {
              setFormData((prev) => ({ ...prev, birthday: date }));
              // Validate on change
              const today = new Date();
              const minAgeDate = new Date(
                today.getFullYear() - 16,
                today.getMonth(),
                today.getDate()
              );
              if (date && date > minAgeDate) {
                setBirthdayError('You must be at least 16 years old.');
              } else {
                setBirthdayError(null);
              }
            }}
            required
            className='rounded-md'
            error={birthdayError}
          />
          <ValidatedPhoneInput
            value={formData.phoneNumber}
            onChange={(val) =>
              setFormData((prev) => ({ ...prev, phoneNumber: val }))
            }
            name='phoneNumber'
            className='rounded-md'
          />
          <Button type='submit' disabled={loading} className='w-full'>
            {loading ? 'Saving...' : 'Complete Profile'}
          </Button>
        </form>
      </div>
    </div>
  );
}
