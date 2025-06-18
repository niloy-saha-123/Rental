// src/app/loading.tsx
// You can optionally add "use client"; here if your loading component needs client-side interactivity
// "use client";

export default function Loading() {
  return (
    <div className='flex items-center justify-center min-h-[calc(100vh-128px)] p-4'>
      <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
      <p className='ml-4 text-lg text-gray-600'>Loading content...</p>
    </div>
  );
}
