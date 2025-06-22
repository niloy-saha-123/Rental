/**
 * @file src/app/error.tsx
 * @description This special file acts as an Error Boundary for its parent route segment and its children.
 * It is a client-side component that automatically catches unexpected runtime errors in rendering or
 * data fetching within its scope. When an error occurs, it displays a fallback UI (defined here)
 * to the user instead of crashing the application, providing a graceful error experience.
 * It also allows for logging errors and attempting to reset the UI.
 */

'use client';

// The rest of the boilerplate code for the Error component follows...
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className='flex flex-col items-center justify-center min-h-[calc(100vh-128px)] p-4 text-center'>
      <h2 className='text-2xl font-bold text-red-600 mb-4'>
        Something went wrong!
      </h2>
      <p className='text-gray-700 mb-6'>
        We're sorry, but an unexpected error occurred. Please try again.
      </p>
      <button
        className='px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300'
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Try again
      </button>
    </div>
  );
}
