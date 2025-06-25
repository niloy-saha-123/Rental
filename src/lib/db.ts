/**
 * @file src/lib/db.ts
 * @description This file initializes and exports a single, globally accessible instance of the Prisma Client.
 * It implements the "singleton" pattern to prevent multiple instances of PrismaClient from being created
 * during development with Next.js's Hot Module Replacement, which helps avoid exhausting database connections.
 * This ensures efficient and consistent database interactions throughout the application.
 */

import { PrismaClient } from '@prisma/client';

// This is crucial for preventing multiple PrismaClient instances in development,
// in a Next.js hot-reloading environment.
//
// Augment the global object for TypeScript:
// This tells TypeScript that there might be a 'prisma' property on the global object.
// This avoids TypeScript errors when we try to attach our Prisma client to `globalThis`.
declare global {
  var prisma: PrismaClient | undefined;
}

// Create or reuse the PrismaClient instance:
// `globalThis.prisma`: Checks if an instance already exists globally.
//  `|| new PrismaClient()`: If not, create a new instance.
//  - `export const db`: Makes this `db` constant available for import in other files.
export const db = globalThis.prisma || new PrismaClient();

// In development, store the Prisma client in the global object
// so it's not recreated on every hot reload.
//
// Store the instance globally only in development:
// `process.env.NODE_ENV !== "production"`: This check ensures this logic only runs in development.
// `globalThis.prisma = db`: Stores the created or reused instance on the global object.
//  This is what enables the hot-reloading fix.
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = db;
}
