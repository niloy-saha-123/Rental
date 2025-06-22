/**
 * @file src/app/loading.tsx
 * @description This special file defines a loading UI that Next.js automatically displays
 * when a page or route segment is being loaded. It provides instant visual feedback to the user
 * while data is being fetched or components are being rendered on the server,
 * improving the perceived performance and user experience of the application.
 */

export default function Loading() {
  return (
    <div className='flex items-center justify-center min-h-[calc(100vh-128px)] p-4'>
      <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
      <p className='ml-4 text-lg text-gray-600'>Loading content...</p>
    </div>
  );
}
