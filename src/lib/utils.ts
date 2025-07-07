/**
 * @file src/lib/utils.ts
 * @description This file contains a collection of reusable utility functions.
 * It primarily includes the `cn` function, which is a powerful helper for
 * conditionally joining and merging Tailwind CSS class names, often used
 * with Shadcn UI components for flexible and dynamic styling.
 */

import { type ClassValue, clsx } from 'clsx'; // Imports ClassValue type and clsx utility for conditional class names.
import { twMerge } from 'tailwind-merge'; // Imports twMerge utility for intelligently merging Tailwind CSS classes.

/**
 * @function cn
 * @description A utility function that combines `clsx` and `tailwind-merge`.
 * It's used to conditionally apply Tailwind CSS classes and intelligently merge
 * them to resolve conflicts, ensuring correct and predictable styling.
 * @param {...ClassValue[]} inputs - An array of class values (strings, objects, arrays) to be combined.
 * @returns {string} A single string containing merged and conditionally applied Tailwind CSS classes.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs)); // Combines classes using clsx and then merges them using twMerge.
}
