/// <reference types="@types/google.maps" />

// src/components/common/SearchBar.tsx
"use client"; // This component needs client-side interactivity for scroll detection, state, and click events

import React, { useState, useEffect, useRef } from 'react'; // Import necessary hooks
import { Loader } from '@googlemaps/js-api-loader';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// --- Elegant, High-Contrast Search Icon ---
const SearchIcon = () => (
  <span className="bg-purple-100 w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="w-6 h-6"
      fill="none"
      stroke="#766be0"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="6" />
      <line x1="16" y1="16" x2="21" y2="21" />
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

// Add a new, smaller SearchIcon component for the collapsed bar:
const SmallSearchIcon = () => (
  <span className="flex items-center justify-center">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="w-5 h-5"
      fill="none"
      stroke="#766be0"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="6" />
      <line x1="16" y1="16" x2="21" y2="21" />
    </svg>
  </span>
);

// Add at the top of the component:
function formatDate(date: string) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString();
}

// --- Elegant, Responsive Search Bar with Collapse ---
export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const [googleMapsError, setGoogleMapsError] = useState<string | null>(null);
  const [showFromPlaceholder, setShowFromPlaceholder] = useState(true);
  const [showToPlaceholder, setShowToPlaceholder] = useState(true);

  const searchBarRef = useRef<HTMLDivElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const fromDateInputRef = useRef<HTMLInputElement>(null);
  const toDateInputRef = useRef<HTMLInputElement>(null);

  // Fix hydration issue by ensuring client-side rendering
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Initialize Google Places API
  useEffect(() => {
    const initGooglePlaces = async () => {
      if (typeof window !== 'undefined' && window.google) {
        // Google Places API is already loaded
        setIsGoogleMapsLoaded(true);
        return;
      }

      try {
        // Load Google Places API
        const loader = new Loader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || '',
          version: 'weekly',
          libraries: ['places'],
        });

        await loader.load();
        console.log('Google Places API loaded successfully');
        setIsGoogleMapsLoaded(true);
        setGoogleMapsError(null);
      } catch (error) {
        const errorMsg = `Error loading Google Places API: ${error}`;
        console.error(errorMsg);
        setGoogleMapsError(errorMsg);
      }
    };

    initGooglePlaces();
  }, []);

  // Get user's current location on mount
  useEffect(() => {
    const setLocationFromGeocoding = async (latitude: number, longitude: number) => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || '';
        const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`);
        const data = await response.json();
        if (data.status === 'OK' && data.results.length > 0) {
          const cityComponent = data.results[0].address_components.find((comp: any) => comp.types.includes('locality'));
          const stateComponent = data.results[0].address_components.find((comp: any) => comp.types.includes('administrative_area_level_1'));
          const countryComponent = data.results[0].address_components.find((comp: any) => comp.types.includes('country'));
          if (cityComponent && stateComponent && countryComponent) {
            setLocation(`${cityComponent.long_name}, ${stateComponent.short_name}, ${countryComponent.short_name}`);
          } else if (cityComponent && stateComponent) {
            setLocation(`${cityComponent.long_name}, ${stateComponent.short_name}`);
          } else if (cityComponent) {
            setLocation(cityComponent.long_name);
          } else {
            setLocation(data.results[0].formatted_address);
          }
          return true;
        }
      } catch (err) {
        // fallback: do nothing
      }
      return false;
    };

    const setLocationFromIP = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        if (data && data.city && data.region_code && data.country_code) {
          setLocation(`${data.city}, ${data.region_code}, ${data.country_code}`);
        } else if (data && data.city && data.country_code) {
          setLocation(`${data.city}, ${data.country_code}`);
        } else if (data && data.city) {
          setLocation(data.city);
        } else {
          setLocation('Location unavailable');
        }
      } catch (err) {
        setLocation('Location unavailable');
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const success = await setLocationFromGeocoding(latitude, longitude);
          if (!success) {
            await setLocationFromIP();
          }
        },
        async (error) => {
          await setLocationFromIP();
        }
      );
    } else {
      setLocationFromIP();
    }
  }, []);

  // Handle location change with autocomplete
  const handleLocationChange = (value: string) => {
    setLocation(value);
    setShowSuggestions(value.length > 0);

    if (value.length > 0 && isGoogleMapsLoaded && typeof window !== 'undefined' && window.google && window.google.maps && window.google.maps.places) {
      setIsLoadingSuggestions(true);
      
      try {
        const service = new window.google.maps.places.AutocompleteService();
        service.getPlacePredictions(
          {
            input: value,
            types: ['(cities)'],
          },
          (predictions, status) => {
            setIsLoadingSuggestions(false);
            if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
              setSuggestions(predictions.map(prediction => prediction.description));
            } else {
              console.warn('Google Places API returned status:', status);
              setSuggestions([]);
            }
          }
        );
      } catch (error) {
        console.error('Error using Google Places API:', error);
        setIsLoadingSuggestions(false);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setLocation(suggestion);
    setShowSuggestions(false);
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
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

  // Show a loading state while mounting to prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className="fixed top-[64px] left-1/2 -translate-x-1/2 w-full max-w-4xl px-8 py-6 bg-white rounded-3xl shadow-2xl border border-gray-200 z-40">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="flex-1 min-w-0 w-full">
            <div className="h-6 bg-gray-200 rounded mb-2"></div>
            <div className="h-12 bg-gray-200 rounded-xl"></div>
          </div>
          <div className="flex-1 min-w-0 w-full">
            <div className="h-6 bg-gray-200 rounded mb-2"></div>
            <div className="h-12 bg-gray-200 rounded-xl"></div>
          </div>
          <div className="flex-1 min-w-0 w-full">
            <div className="h-6 bg-gray-200 rounded mb-2"></div>
            <div className="h-12 bg-gray-200 rounded-xl"></div>
          </div>
          <div className="flex-1 min-w-0 w-full">
            <div className="h-6 bg-gray-200 rounded mb-2"></div>
            <div className="h-12 bg-gray-200 rounded-xl"></div>
          </div>
          <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    );
  }

  // --- Big, Elegant Bar ---
  const bigContainerClasses = `
    fixed top-[64px] left-1/2 -translate-x-1/2 w-full max-w-4xl px-8 py-6 bg-white rounded-3xl shadow-2xl border border-gray-200 z-40
    flex flex-col sm:flex-row items-center gap-6 transition-all duration-300 ease-in-out
    ${isCollapsed ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}
  `;
  const labelClass = 'block text-lg font-serif text-gray-800 tracking-wide';
  const inputClass = 'w-full bg-gray-50 rounded-xl px-5 py-4 text-base text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300 transition font-sans';

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
        <div className="flex-1 min-w-0 w-full flex flex-col justify-center">
          <label className={labelClass} htmlFor="location-input">
            <span className="flex items-center gap-2">
              <span className="bg-purple-100 p-1 rounded-full mr-2"><LocationIcon /></span>
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
              placeholder="Detecting location..."
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
            {/* Google Maps API Error Indicator */}
            {googleMapsError && (
              <div className="absolute top-full left-0 right-0 bg-red-50 border border-red-200 rounded-lg shadow-lg z-50 mt-2 p-3">
                <div className="flex items-center gap-2 text-red-700 text-sm">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>Location autocomplete unavailable</span>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Search Object Field */}
        <div className="flex-1 min-w-0 w-full flex flex-col justify-center">
          <label className={labelClass} htmlFor="object-input">Object</label>
          <input
            id="object-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for objects"
            className={inputClass}
          />
        </div>
        {/* From Date Field */}
        <div className="flex-1 min-w-0 w-full flex flex-col justify-center">
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
        <div className="flex-1 min-w-0 w-full flex flex-col justify-center">
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
        <button className="group flex-none w-16 h-16 bg-purple-100 border-2 border-[borderColor:#766be0] shadow-lg rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-200 transition ml-2 mt-8 sm:mt-0" aria-label="Search">
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
          <ReactDatePicker
            selected={dateFrom ? new Date(dateFrom) : null}
            onChange={date => setDateFrom(date ? (date as Date).toISOString().slice(0, 10) : '')}
            placeholderText="From"
            className={compactInputClass}
            dateFormat="MM/dd/yyyy"
            id="collapsed-from-date"
            isClearable
          />
        </div>
        {/* To Date Field */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <ReactDatePicker
            selected={dateTo ? new Date(dateTo) : null}
            onChange={date => setDateTo(date ? (date as Date).toISOString().slice(0, 10) : '')}
            placeholderText="To"
            className={compactInputClass}
            dateFormat="MM/dd/yyyy"
            id="collapsed-to-date"
            minDate={dateFrom ? new Date(dateFrom) : undefined}
            isClearable
          />
        </div>
        {/* Search Button */}
        <button className="flex-none w-12 h-12 bg-purple-100 border-2 border-[borderColor:#766be0] shadow-md rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-200 transition ml-2" aria-label="Search">
          <SmallSearchIcon />
        </button>
      </div>
    </>
  );
}

// --- Compact Search Bar (for future use, not exported) ---
// function CompactSearchBar() { /* ...keep previous compact bar code here if needed... */ }