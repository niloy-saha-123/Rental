/**
 * @file src/types/booking.ts
 * @description This file defines TypeScript types and interfaces for the Booking model.
 * These types precisely mirror the structure of the `Booking` table in our `prisma/schema.prisma` file,
 * including fields like `startDate`, `endDate`, `totalCost`, and its `BookingStatus` enum.
 *
 * Purpose:
 * - **Type Safety:** Ensures that all booking-related data throughout the application (both frontend and backend)
 * conforms to a consistent and predictable shape.
 * - **Code Readability:** Makes it clearer what data is expected when working with bookings.
 * - **IDE Autocompletion:** Provides intelligent suggestions in our code editor when accessing booking properties.
 *
 * Example Usage:
 * - In tRPC procedures (backend): Defining input/output types for booking creation or fetching.
 * - In React components (frontend): Typing state variables or props that hold booking information.
 */