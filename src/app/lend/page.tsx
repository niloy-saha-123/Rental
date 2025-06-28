/**
 * @file src/app/lend/page.tsx
 * @description This page allows users to list items for rent on the platform.
 * Users can fill out a form with item details including name, description, 
 * daily rental price, and upload a photo. The form data is currently logged 
 * to the console for development purposes, but will be connected to the 
 * backend API in future iterations.
 * 
 * Features:
 * - Form validation with HTML5 and React state
 * - File upload for item photos
 * - Responsive design with Tailwind CSS
 * - Form state management with React hooks
 * - Client-side form submission handling
 * - Authentication protection - only signed-in users can access
 */

"use client"; // This component needs client-side interactivity for forms, state, and file uploads

import React, { useState, useRef, useEffect } from "react"; // Import useState for state management and useRef for DOM access
import { useSession } from "next-auth/react"; // Import useSession for authentication
import { useRouter } from "next/navigation"; // Import useRouter for navigation

export default function LendPage() {
  const { data: session, status } = useSession(); // Get session data and loading status
  const router = useRouter(); // Get router for navigation
  
  // State management for form fields
  const [itemName, setItemName] = useState(""); // State for the item name input
  const [description, setDescription] = useState(""); // State for the item description textarea
  const [rentPerDay, setRentPerDay] = useState(""); // State for the daily rental price
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // State for the uploaded image file
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref to access the file input DOM element for clearing

  // Authentication check - redirect to login if not authenticated
  useEffect(() => {
    if (status === "loading") return; // Don't redirect while loading
    
    if (!session) {
      // Redirect to login page with callback URL to return here after login
      router.push("/login?callbackUrl=/lend");
    }
  }, [session, status, router]);

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <main className="min-h-[calc(100vh-120px)] flex flex-col items-center justify-center bg-gray-50 py-12 px-4">
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl p-10 border border-gray-200">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#766be0] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </main>
    );
  }

  // Don't render the form if user is not authenticated
  if (!session) {
    return null; // This will be replaced by the redirect
  }

  /**
   * Handles file selection from the file input
   * @param event - The change event from the file input
   */
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]); // Store the selected file in state
    } else {
      setSelectedFile(null); // Clear the file selection if no file is selected
    }
  };

  /**
   * Handles form submission
   * Currently logs form data to console and shows an alert
   * In production, this would send data to the backend API
   * @param event - The form submission event
   */
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent default form submission behavior
    
    // Log the form data to console for development/debugging
    console.log("Lending Item Data:", {
      itemName,
      description,
      rentPerDay,
      fileName: selectedFile ? selectedFile.name : "No file selected", // Display the selected file name
      file: selectedFile, // The actual File object for backend processing
      userId: session?.user?.id, // Include user ID for backend processing
    });

    // Clear all form fields after successful submission
    setItemName("");
    setDescription("");
    setRentPerDay("");
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = ""; // Clear the file input element
    
    // Show success message to user
    alert("Item submitted! (Check console for data)");
  };

  return (
    // Main container with full viewport height minus header space
    <main className="min-h-[calc(100vh-120px)] flex flex-col items-center justify-center bg-gray-50 py-12 px-4">
      {/* Form container with white background, shadow, and rounded corners */}
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl p-10 border border-gray-200">
        {/* Page title using the site's serif font and brand color */}
        <h1 className="text-3xl font-serif font-bold text-center text-[#766be0] mb-8">Lend Your Item</h1>
        
        {/* Welcome message for authenticated user */}
        <p className="text-center text-gray-600 mb-6">
          Welcome, {session.user?.name || session.user?.email}! Ready to lend your item?
        </p>
        
        {/* Form element with proper spacing between fields */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Item Name Input Field */}
          <div>
            <label htmlFor="itemName" className="block text-gray-700 font-semibold mb-2">Item Name</label>
            <input
              type="text"
              id="itemName" // Unique ID for label association and accessibility
              value={itemName} // Controlled input - value bound to state
              onChange={(e) => setItemName(e.target.value)} // Update state when input changes
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#766be0] focus:outline-none text-gray-800"
              placeholder="e.g., Electric Drill" // Helpful placeholder text
              required // HTML5 validation - field must be filled
            />
          </div>

          {/* Description Textarea Field */}
          <div>
            <label htmlFor="description" className="block text-gray-700 font-semibold mb-2">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#766be0] focus:outline-none text-gray-800 h-28 resize-none" // Fixed height, no resize
              placeholder="Describe your item, its condition, and any accessories."
              required
            ></textarea>
          </div>

          {/* Daily Rental Price Input Field */}
          <div>
            <label htmlFor="rentPerDay" className="block text-gray-700 font-semibold mb-2">Rent per day ($)</label>
            <input
              type="number" // Number input for price
              id="rentPerDay"
              value={rentPerDay}
              onChange={(e) => setRentPerDay(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#766be0] focus:outline-none text-gray-800"
              placeholder="e.g., 15"
              required
              min="0" // Minimum value validation
              step="0.01" // Allow decimal values for cents
            />
          </div>

          {/* Photo Upload Field */}
          <div>
            <label htmlFor="itemPhoto" className="block text-gray-700 font-semibold mb-2">Upload Photo</label>
            <input
              type="file"
              id="itemPhoto"
              accept="image/*" // Only allow image files
              onChange={handleFileChange} // Custom handler for file selection
              ref={fileInputRef} // Attach ref for programmatic access
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" // Styled file input
              required
            />
            {/* Display selected file name if a file is chosen */}
            {selectedFile && (
              <p className="mt-2 text-sm text-gray-600">Selected file: {selectedFile.name}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-[#766be0] hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full focus:outline-none focus:ring-2 focus:ring-[#766be0] text-lg shadow-md transition-colors" // Brand colors and hover effects
            >
              List Item
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
