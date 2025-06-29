/**
 * @file src/components/icons/GoogleIcon.tsx
 * @description A reusable React component that renders the official "Sign in with Google"
 * or "Sign up with Google" SVG button assets downloaded from Google's branding guidelines.
 * This component handles loading the correct SVG based on its type and makes it clickable.
 *
 */
import * as React from 'react';
import Image from 'next/image';

// Define props for the GoogleButton component to specify its type and onClick handler.
interface GoogleButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  type: 'signin' | 'signup'; // 'signin' for login page, 'signup' for signup page
  onClick: () => void; // Click handler for the button
  disabled?: boolean; // Optional disabled prop
}

const GoogleButton = ({
  type,
  onClick,
  disabled,
  className,
  ...props
}: GoogleButtonProps) => {
  // Determine which SVG file to load based on the 'type' prop.
  const svgSrc =
    type === 'signin' ? '/google_signin_pill.svg' : '/google_signup_pill.svg';

  return (
    // Wrap the <img> tag in a native <button> element to ensure it's clickable and accessible.
    // The SVG is the visual, the <button> provides the functionality.
    <button
      onClick={onClick}
      disabled={disabled}
      // Apply Tailwind CSS for full width, basic styling, and merge any custom classes.
      className={`w-full h-10 flex items-center justify-center relative overflow-hidden rounded-full transition-opacity duration-300
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}
                  ${className || ''}`}
      {...props} // Pass any additional button attributes
    >
      <Image
        src={svgSrc}
        alt={`Sign ${type} with Google`}
        fill
        // Ensure the image covers the button area without distortion.
        className='object-cover pointer-events-none'
      />
      {/* Optional: Add text overlay if needed, but the SVG already contains text.
          If the SVG contains text, this is mostly for screen readers or fallback. */}
      <span className='relative z-10 text-transparent text-sm font-medium'>
        {type === 'signin' ? 'Sign in with Google' : 'Sign up with Google'}
      </span>
    </button>
  );
};

export default GoogleButton;
