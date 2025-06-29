/**
 * @file src/app/(auth)/layout.tsx
 * @description This layout component applies to all pages within the `(auth)` route group,
 * such as `/login` and `/signup`. It provides a common UI wrapper for authentication-related pages,
 * allowing for consistent styling or components specific to login/signup flows,
 * distinct from the main application's layout.
 */

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // A simple section or div to wrap the children (our login/signup pages).
    // We can add specific styling or components here later that are unique
    // to our auth flows, e.g., centering the form or a background image.
    <section className='flex items-center justify-center min-h-[calc(100vh-128px)] bg-gray-100'>
      {children}
    </section>
  );
}
