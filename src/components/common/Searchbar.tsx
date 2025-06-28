/// <reference types="@types/google.maps" />

// src/components/common/SearchBar.tsx
"use client"; // This component needs client-side interactivity for scroll detection, state, and click events

import React, { useState, useEffect, useRef } from 'react'; // Import necessary hooks
import { Loader } from '@googlemaps/js-api-loader';

// --- Elegant, High-Contrast Search Icon ---
const SearchIcon = () => (
  <span className="bg-white border-2 border-purple-600 rounded-full p-2 flex items-center justify-center">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="w-6 h-6 text-purple-600"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  </span>
);

// Add a simple Location (pin) icon component
const LocationIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5 text-purple-600"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 21c.6-1.2 4-6.2 4-9.5A4 4 0 0 0 8 11.5C8 14.8 11.4 19.8 12 21z"
    />
    <circle cx="12" cy="11.5" r="2" fill="currentColor" />
  </svg>
);

// --- Elegant, Responsive Search Bar with Collapse ---
export default function SearchBar() {
  // States for input values (same as before)
  const [location, setLocation] = useState("Current Location");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // New states for autocomplete
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  // Refs
  const searchBarRef = useRef<HTMLDivElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);

  // New states for collapse
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Initialize Google Places API
  useEffect(() => {
    const initGooglePlaces = async () => {
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || '',
        version: 'weekly',
        libraries: ['places']
      });

      try {
        await loader.load();
        autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
        // Create a dummy div for PlacesService (required by Google API)
        const dummyDiv = document.createElement('div');
        placesServiceRef.current = new google.maps.places.PlacesService(dummyDiv);
      } catch (error) {
        console.error('Failed to load Google Places API:', error);
      }
    };

    if (process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY) {
      initGooglePlaces();
    }
  }, []);

  // Auto-detect user location on mount
  useEffect(() => {
    if (location === "Current Location" && typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          // Use OpenStreetMap Nominatim for free reverse geocoding
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          // Try to get city, state, country in a nice format
          const address = data.address;
          const city = address.city || address.town || address.village || address.hamlet || '';
          const state = address.state || '';
          const country = address.country || '';
          const formatted = [city, state, country].filter(Boolean).join(', ');
          if (formatted) setLocation(formatted);
        } catch (err) {
          // If geocoding fails, do nothing (keep placeholder)
        }
      }, (err) => {
        // If user denies location, do nothing
      });
    }
  }, [location]);

  // Handle location input changes and fetch suggestions
  const handleLocationChange = (value: string) => {
    setLocation(value);
    
    if (value.length > 2 && autocompleteServiceRef.current) {
      setIsLoadingSuggestions(true);
      
      autocompleteServiceRef.current.getPlacePredictions(
        {
          input: value,
          types: ['(cities)'], // Only cities
        },
        (predictions: google.maps.places.AutocompletePrediction[] | null, status: google.maps.places.PlacesServiceStatus) => {
          setIsLoadingSuggestions(false);
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            const suggestionTexts = predictions.map((prediction: google.maps.places.AutocompletePrediction) => prediction.description);
            setSuggestions(suggestionTexts);
            setShowSuggestions(true);
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        }
      );
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: string) => {
    setLocation(suggestion);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationInputRef.current && !locationInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll-to-collapse effect
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 10) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- Big, Elegant Bar ---
  const bigContainerClasses = `
    fixed top-[64px] left-1/2 -translate-x-1/2 w-full max-w-4xl px-8 py-6 bg-white rounded-3xl shadow-2xl border border-gray-200 z-40
    flex flex-col sm:flex-row items-center gap-6 transition-all duration-300 ease-in-out
    ${isCollapsed ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}
  `;
  const labelClass = 'block text-lg font-serif text-gray-800 mb-2 tracking-wide';
  const inputClass = 'w-full bg-gray-50 rounded-xl px-5 py-4 text-base font-medium text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300 transition font-sans';

  // --- Compact Bar ---
  const compactContainerClasses = `
    fixed top-[64px] left-1/2 -translate-x-1/2 w-full max-w-3xl px-2 py-1 bg-white rounded-full shadow-lg border border-gray-200 z-40
    flex items-center gap-2 transition-all duration-300 ease-in-out
    ${isCollapsed ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
  `;
  const compactInputClass = 'bg-transparent outline-none w-full text-gray-700 font-sans text-base px-2';

  return (
    <>
      {/* Big, Elegant Bar */}
      <div ref={searchBarRef} className={bigContainerClasses}>
        {/* Location Field */}
        <div className="flex-1 min-w-0 w-full">
          <label className={labelClass} htmlFor="location-input">
            <span className="inline-flex items-center gap-2">
              <span className="bg-purple-100 p-3 rounded-full mr-2"><LocationIcon /></span>
              Location
            </span>
          </label>
          <div className="relative">
            <input
              id="location-input"
              ref={locationInputRef}
              type="text"
              value={location}
              onChange={(e) => handleLocationChange(e.target.value)}
              placeholder="Where are you? (e.g., New York, Paris, Tokyo)"
              className={inputClass}
              autoComplete="off"
            />
            {/* Autocomplete Dropdown (unchanged) */}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto mt-2">
                {isLoadingSuggestions ? (
                  <div className="p-3 text-gray-500 text-center">Loading...</div>
                ) : suggestions.length > 0 ? (
                  suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left p-3 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none border-b border-gray-100 last:border-b-0"
                    >
                      {suggestion}
                    </button>
                  ))
                ) : (
                  <div className="p-3 text-gray-500 text-center">No suggestions found</div>
                )}
              </div>
            )}
          </div>
        </div>
        {/* Search Object Field */}
        <div className="flex-1 min-w-0 w-full">
          <label className={labelClass} htmlFor="object-input">Object</label>
          <input
            id="object-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="What are you looking for? (e.g., PS5, Camera)"
            className={inputClass}
          />
        </div>
        {/* From Date Field */}
        <div className="flex-1 min-w-0 w-full">
          <label className={labelClass} htmlFor="from-date">From</label>
          <input
            id="from-date"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className={inputClass}
          />
        </div>
        {/* To Date Field */}
        <div className="flex-1 min-w-0 w-full">
          <label className={labelClass} htmlFor="to-date">To</label>
          <input
            id="to-date"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className={inputClass}
          />
        </div>
        {/* Search Button */}
        <button className="flex-none w-16 h-16 bg-white border-2 border-purple-600 shadow-lg rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-100 transition ml-2 mt-8 sm:mt-0" aria-label="Search">
          <SearchIcon />
        </button>
      </div>
      {/* Compact Bar */}
      <div className={compactContainerClasses}>
        {/* Location Field */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button
            type="button"
            className="bg-white shadow-md rounded-full p-2 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
            onClick={() => locationInputRef.current?.focus()}
            aria-label="Change location"
          >
            <LocationIcon />
          </button>
          <input
            ref={locationInputRef}
            type="text"
            value={location}
            onChange={(e) => handleLocationChange(e.target.value)}
            placeholder="Current Location"
            className={compactInputClass}
          />
          {/* Autocomplete Dropdown (unchanged) */}
          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
              {isLoadingSuggestions ? (
                <div className="p-3 text-gray-500 text-center">Loading...</div>
              ) : suggestions.length > 0 ? (
                suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left p-3 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none border-b border-gray-100 last:border-b-0"
                  >
                    {suggestion}
                  </button>
                ))
              ) : (
                <div className="p-3 text-gray-500 text-center">No suggestions found</div>
              )}
            </div>
          )}
        </div>
        {/* Search Object Field */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for objects..."
            className={compactInputClass}
          />
        </div>
        {/* From Date Field */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className={compactInputClass}
          />
        </div>
        {/* To Date Field */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className={compactInputClass}
          />
        </div>
        {/* Search Button */}
        <button className="flex-none w-12 h-12 bg-white border-2 border-purple-600 shadow-md rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-100 transition ml-2" aria-label="Search">
          <SearchIcon />
        </button>
      </div>
    </>
  );
}

// --- Compact Search Bar (for future use, not exported) ---
// function CompactSearchBar() { /* ...keep previous compact bar code here if needed... */ }