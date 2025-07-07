/**
 * @file src/app/lend/page.tsx
 * @description This page allows users to list items for rent on the platform.
 * Uses a step-by-step flow similar to Airbnb's listing process with category selection,
 * item details, pricing, and photo upload.
 */

"use client";

import React, { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { AnimatePresence, motion } from "framer-motion";
import { GoogleMap, Marker, useJsApiLoader, Autocomplete } from '@react-google-maps/api';
import HomeButton from '@/components/ui/HomeButton';

// Define categories with icons and descriptions
const categories = [
  {
    id: "electronics",
    name: "Electronics",
    icon: "📱",
    description: "Phones, laptops, cameras, speakers, etc.",
    examples: ["Smartphone", "Laptop", "Camera", "Speaker", "Tablet"]
  },
  {
    id: "kitchenware",
    name: "Kitchenware",
    icon: "🍳",
    description: "Cooking equipment, appliances, utensils",
    examples: ["Blender", "Coffee Maker", "Stand Mixer", "Air Fryer", "Pots & Pans"]
  },
  {
    id: "gardening",
    name: "Gardening",
    icon: "🌱",
    description: "Tools, equipment, and supplies for gardening",
    examples: ["Lawn Mower", "Hedge Trimmer", "Garden Tools", "Planters", "Sprinkler"]
  },
  {
    id: "tools",
    name: "Tools",
    icon: "🔧",
    description: "Hand tools, power tools, construction equipment",
    examples: ["Drill", "Saw", "Hammer Set", "Ladder", "Tool Box"]
  },
  {
    id: "games",
    name: "Games & Entertainment",
    icon: "🎮",
    description: "Board games, video games, sports equipment",
    examples: ["Board Games", "Video Game Console", "Tennis Racket", "Bicycle", "VR Headset"]
  },
  {
    id: "furniture",
    name: "Furniture",
    icon: "🪑",
    description: "Tables, chairs, storage, home decor",
    examples: ["Folding Table", "Chairs", "Storage Unit", "Lamp", "Mirror"]
  },
  {
    id: "outdoor",
    name: "Outdoor & Sports",
    icon: "🏕️",
    description: "Camping gear, sports equipment, outdoor activities",
    examples: ["Tent", "Camping Gear", "Bicycle", "Skateboard", "Fishing Rod"]
  },
  {
    id: "music",
    name: "Music",
    icon: "🎵",
    description: "Musical instruments, speakers, audio equipment",
    examples: ["Guitar", "Piano", "Microphone", "DJ Equipment", "Studio Speakers"]
  },
  {
    id: "books",
    name: "Books",
    icon: "📚",
    description: "Fiction, non-fiction, textbooks, magazines",
    examples: ["Novels", "Textbooks", "Cookbooks", "Magazines", "Reference Books"]
  },
  {
    id: "other",
    name: "Other",
    icon: "📦",
    description: "Clothing, art supplies, unique items, and more",
    examples: ["Clothing", "Art Supplies", "Costumes", "Collectibles", "Custom Items"]
  }
];

type Step = "welcome" | "categories" | "item-details" | "pricing" | "photos" | "location" | "review";

// Add SmallSearchIcon for reuse
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

export default function LendPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();
  const containerRef = useRef<HTMLDivElement>(null);
  const confettiContainerRef = useRef<HTMLDivElement>(null);
  
  // Step management
  const [currentStep, setCurrentStep] = useState<Step>("welcome");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  // Form data
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [rentPerDay, setRentPerDay] = useState("");
  const [photoSlots, setPhotoSlots] = useState<(File | null)[]>([null, null, null, null, null, null]);
  const fileInputRefs = Array.from({ length: 6 }, () => useRef<HTMLInputElement>(null));

  // 2. Add state for location
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [addressInput, setAddressInput] = useState("");
  const addressInputRef = useRef<HTMLInputElement>(null);
  const [autocomplete, setAutocomplete] = useState<any>(null);

  // Move this to the top level of LendPage, after other hooks
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || '',
    libraries: ['places'],
  });

  // Get user's current location when component mounts
  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          // Set initial location to user's current location
          setLocation({ lat: latitude, lng: longitude, address: '' });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Fallback to a more generic default if geolocation fails
          setUserLocation({ lat: 37.7749, lng: -122.4194 }); // San Francisco as fallback
        }
      );
    }
  }, []);

  // Function to handle address search
  const handleAddressSearch = () => {
    if (!addressInput.trim() || !isLoaded) return;
    
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: addressInput }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const lat = results[0].geometry.location.lat();
        const lng = results[0].geometry.location.lng();
        const address = results[0].formatted_address;
        
        setLocation({ lat, lng, address });
        setAddressInput(address); // Update input with formatted address
      } else {
        alert('Address not found. Please try a different address.');
      }
    });
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handlePhotoChange = (idx: number, event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const newSlots = [...photoSlots];
      newSlots[idx] = event.target.files[0];
      setPhotoSlots(newSlots);
    }
  };

  const handleRemovePhoto = (idx: number) => {
    const newSlots = [...photoSlots];
    newSlots[idx] = null;
    setPhotoSlots(newSlots);
  };

  const uploadedCount = photoSlots.filter(Boolean).length;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    console.log("Lending Item Data:", {
      categories: selectedCategories,
      itemName,
      description,
      rentPerDay,
      fileName: photoSlots.filter(Boolean).map(file => file?.name).join(", "),
      files: photoSlots.filter(Boolean),
      userId: session?.user?.id,
    });

    // Show confetti burst only after submission (true burst)
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2500); // Show for 2.5 seconds for classic burst

    setTimeout(() => {
      setCurrentStep("welcome");
      setSelectedCategories([]);
      setItemName("");
      setDescription("");
      setRentPerDay("");
      setPhotoSlots([null, null, null, null, null, null]);
      fileInputRefs.forEach(ref => { if (ref.current) ref.current.value = ""; });
      alert("Item submitted! (Check console for data)");
    }, 2000);
  };

  // 1. Update Step type and step order
  const steps: Step[] = ["welcome", "categories", "item-details", "pricing", "photos", "location", "review"];
  const nextStep = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };
  const prevStep = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const getStepProgress = () => {
    const steps: Step[] = ["welcome", "categories", "item-details", "pricing", "photos", "location", "review"];
    const currentIndex = steps.indexOf(currentStep);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  // Renders the welcome step with a friendly intro and checklist
  const renderWelcomeStep = () => (
    <>
      <div className="w-full h-screen flex items-center mt-[-150px]">
        {/* Heading and Description, left-aligned with negative margin */}
        <div className="pl-0 ml-[-300px]" style={{ width: '1000px' }}>
          <h1 className="text-7xl font-serif font-extrabold text-[#8b7ee8] mb-2 whitespace-nowrap">Become a lender</h1>
          <p className="text-lg text-gray-700 max-w-2xl">Lend anything you want. Let's get started with a few simple steps.</p>
        </div>
        {/* Instructions, plain white background */}
        <div className="ml-[300px]" style={{ minWidth: 480, maxWidth: 500 }}>
          <h2 className="text-2xl font-bold text-[#8b7ee8] mb-6">Instructions</h2>
          <div className="space-y-7">
            <div className="flex items-start gap-4">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#8b7ee8] text-white font-bold text-lg">1</span>
              <div>
                <div className="font-semibold text-gray-900 text-lg">Create your listing</div>
                <div className="text-gray-600">Set up your item with photos and details to attract renters.</div>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#8b7ee8] text-white font-bold text-lg">2</span>
              <div>
                <div className="font-semibold text-gray-900 text-lg">Set your price</div>
                <div className="text-gray-600">Choose a competitive daily rental rate for your item.</div>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#8b7ee8] text-white font-bold text-lg">3</span>
              <div>
                <div className="font-semibold text-gray-900 text-lg">Verify details</div>
                <div className="text-gray-600">Confirm your address and item information.</div>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#8b7ee8] text-white font-bold text-lg">4</span>
              <div>
                <div className="font-semibold text-gray-900 text-lg">Start earning</div>
                <div className="text-gray-600">Your item goes live and you can start accepting bookings.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Bottom Centered Button */}
      <div className="w-full flex justify-center absolute left-0 bottom-[150px]">
        <button
          onClick={nextStep}
          className="bg-[#8b7ee8] hover:bg-[#766be0] text-white font-bold py-4 px-10 rounded-full text-xl shadow-lg transition-colors"
        >
          Let's Get Started
        </button>
      </div>
    </>
  );

  // Renders the category selection step with all available categories
  const renderCategoriesStep = () => (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-serif font-bold text-[#8b7ee8] mb-4 text-center">
        What type of item are you lending?
      </h2>
      <p className="text-gray-600 mb-12 text-center text-lg">
        Select all categories that apply to your item
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryToggle(category.id)}
            className={`p-6 rounded-2xl transition-all duration-200 ${
              selectedCategories.includes(category.id)
                ? "bg-purple-50 ring-2 ring-[#8b7ee8] ring-opacity-50"
                : "bg-gray-50 hover:bg-gray-100"
            }`}
          >
            <div className="flex items-start gap-4">
              <span className="text-3xl">{category.icon}</span>
              <div className="text-left">
                <h3 className="font-semibold text-gray-800 text-lg mb-2">{category.name}</h3>
                <p className="text-gray-600 mb-3">{category.description}</p>
                <p className="text-sm text-gray-500">
                  Examples: {category.examples.slice(0, 3).join(", ")}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
      
      <div className="flex justify-between items-center">
        <button
          onClick={prevStep}
          className="px-8 py-3 text-gray-600 hover:text-gray-800 transition-colors text-lg"
        >
          ← Back
        </button>
        <button
          onClick={nextStep}
          disabled={selectedCategories.length === 0}
          className="bg-[#8b7ee8] hover:bg-[#766be0] disabled:bg-gray-300 text-white font-bold py-3 px-8 rounded-full transition-colors text-lg"
        >
          Continue
        </button>
      </div>
    </div>
  );

  // Renders the item details step with name and description fields
  const renderItemDetailsStep = () => (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-serif font-bold text-[#8b7ee8] mb-8 text-center">
        Tell us about your item
      </h2>
      <p className="text-gray-600 mb-16 text-center text-lg">
        Help renters understand what you're offering
      </p>
      
      <div className="space-y-12">
        <div>
          <label htmlFor="itemName" className="block text-gray-700 font-semibold mb-4 text-lg">
            What's the name of your item?
          </label>
          <input
            type="text"
            id="itemName"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            className="w-full px-6 py-5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8b7ee8] focus:border-transparent focus:outline-none text-lg"
            placeholder="e.g., Professional DSLR Camera"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-gray-700 font-semibold mb-4 text-lg">
            Describe your item
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-6 py-5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8b7ee8] focus:border-transparent focus:outline-none h-48 resize-none text-lg"
            placeholder="Include details like condition, brand, model, accessories, and any special features..."
            required
          />
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-16">
        <button
          onClick={prevStep}
          className="px-8 py-3 text-gray-600 hover:text-gray-800 transition-colors text-lg"
        >
          ← Back
        </button>
        <button
          onClick={nextStep}
          disabled={!itemName.trim() || !description.trim()}
          className="bg-[#8b7ee8] hover:bg-[#766be0] disabled:bg-gray-300 text-white font-bold py-3 px-8 rounded-full transition-colors text-lg"
        >
          Continue
        </button>
      </div>
    </div>
  );

  // Renders the pricing step for setting daily rental price
  const renderPricingStep = () => (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-serif font-bold text-[#8b7ee8] mb-4 text-center">
        Set your daily rental price
      </h2>
      <p className="text-gray-600 mb-12 text-center text-lg">
        How much would you like to charge per day?
      </p>
      
      <div className="max-w-md mx-auto">
        <div className="relative mb-8">
          <span className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-500 text-2xl">$</span>
          <input
            type="number"
            value={rentPerDay}
            onChange={(e) => setRentPerDay(e.target.value)}
            className="w-full pl-12 pr-6 py-6 text-3xl border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8b7ee8] focus:border-transparent focus:outline-none text-center"
            placeholder="0"
            required
            min="0"
            step="0.01"
          />
        </div>
        
        <div className="text-center text-gray-600 mb-8">
          <p className="text-lg">💡 Tip: Check similar items in your area for competitive pricing</p>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <button
          onClick={prevStep}
          className="px-8 py-3 text-gray-600 hover:text-gray-800 transition-colors text-lg"
        >
          ← Back
        </button>
        <button
          onClick={nextStep}
          disabled={!rentPerDay || parseFloat(rentPerDay) <= 0}
          className="bg-[#8b7ee8] hover:bg-[#766be0] disabled:bg-gray-300 text-white font-bold py-3 px-8 rounded-full transition-colors text-lg"
        >
          Continue
        </button>
      </div>
    </div>
  );

  // Renders the photo upload step for the item
  const renderPhotosStep = () => (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-serif font-bold text-[#8b7ee8] mb-4 text-center">
        Add photos of your item
      </h2>
      <p className="text-gray-600 mb-4 text-center text-lg font-semibold">
        You must upload at least 3 photos of your item.
      </p>
      <p className="text-gray-600 mb-12 text-center text-lg">
        You can upload up to 6 photos. A clear photo helps renters know exactly what they're getting.
      </p>
      <div className="max-w-xl mx-auto">
        <div className="grid grid-cols-3 gap-6 mb-8">
          {photoSlots.map((file, idx) => (
            <div
              key={idx}
              className={`relative flex flex-col items-center justify-center border-2 rounded-xl cursor-pointer transition-colors aspect-square
                ${file ? 'border-[#8b7ee8] bg-white' : 'border-dashed border-gray-300 bg-gray-50 hover:border-[#8b7ee8]'}
              `}
              style={{ minHeight: 140 }}
              onClick={() => fileInputRefs[idx].current?.click()}
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter') fileInputRefs[idx].current?.click(); }}
            >
              <input
                type="file"
                accept="image/*"
                ref={fileInputRefs[idx]}
                className="hidden"
                onChange={e => handlePhotoChange(idx, e)}
                tabIndex={-1}
              />
              {file ? (
                <>
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Photo ${idx + 1}`}
                    className="w-full h-full object-cover rounded-xl"
                    onLoad={e => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                  />
                  <button
                    type="button"
                    className="absolute top-2 right-2 bg-white text-[#8b7ee8] rounded-full w-7 h-7 flex items-center justify-center shadow"
                    onClick={e => { e.stopPropagation(); handleRemovePhoto(idx); }}
                    tabIndex={0}
                  >
                    ×
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <span className="text-5xl mb-2">+</span>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="text-center text-gray-600">
          <p className="text-lg">💡 Tip: Use good lighting and show the item clearly</p>
        </div>
      </div>
      <div className="flex justify-between items-center mt-12">
        <button
          onClick={prevStep}
          className="px-8 py-3 text-gray-600 hover:text-gray-800 transition-colors text-lg"
        >
          ← Back
        </button>
        <button
          onClick={nextStep}
          disabled={uploadedCount < 3}
          className="bg-[#8b7ee8] hover:bg-[#766be0] disabled:bg-gray-300 text-white font-bold py-3 px-8 rounded-full transition-colors text-lg"
        >
          Continue
        </button>
      </div>
    </div>
  );

  // 3. Add renderLocationStep
  const mapContainerStyle = { width: '100%', height: '400px', borderRadius: '1rem' };

  // Update renderLocationStep to use isLoaded from the parent scope
  const renderLocationStep = () => {
    // Center map on user's location, then selected location, then fallback
    const center = location ? { lat: location.lat, lng: location.lng } : 
                   userLocation ? { lat: userLocation.lat, lng: userLocation.lng } : 
                   { lat: 37.7749, lng: -122.4194 }; // San Francisco as final fallback

    // Handle pin drag
    const handleMarkerDragEnd = async (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        // Reverse geocode to get address
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            setLocation({ lat, lng, address: results[0].formatted_address });
          } else {
            setLocation({ lat, lng, address: '' });
          }
        });
      }
    };

    return (
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-serif font-bold text-[#8b7ee8] mb-4 text-center">
          Confirm your item location
        </h2>
        <p className="text-gray-600 mb-8 text-center text-lg">
          Drag the pin to adjust the exact pickup location. This address will only be shared with renters after booking.
        </p>
        <div className="mb-6">
          <div className="max-w-xl mx-auto mb-4">
            <div className="flex items-center bg-white rounded-full shadow-lg border border-gray-200 px-4 py-2 w-full">
              <div className="flex items-center flex-1 min-w-0">
                <Autocomplete
                  onLoad={ac => setAutocomplete(ac)}
                  onPlaceChanged={() => {
                    if (autocomplete) {
                      const place = autocomplete.getPlace();
                      if (place.geometry && place.geometry.location) {
                        const lat = place.geometry.location.lat();
                        const lng = place.geometry.location.lng();
                        const address = place.formatted_address || '';
                        setLocation({ lat, lng, address });
                        setAddressInput(address);
                      }
                    }
                  }}
                  restrictions={{ country: 'us' }}
                >
                  <input
                    ref={addressInputRef}
                    type="text"
                    value={addressInput}
                    onChange={(e) => setAddressInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddressSearch();
                      }
                    }}
                    placeholder="Enter your address"
                    className="w-full flex-1 bg-transparent outline-none text-gray-700 font-sans text-base px-2 py-2"
                    autoComplete="off"
                  />
                </Autocomplete>
              </div>
              <button
                onClick={handleAddressSearch}
                className="flex-none w-10 h-10 bg-purple-100 border-2 border-[#766be0] shadow-md rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-200 transition ml-2"
                aria-label="Search"
                type="button"
              >
                <SmallSearchIcon />
              </button>
            </div>
          </div>
          {userLocation && (
            <div className="text-center mb-4">
              <button
                onClick={() => {
                  setLocation({ lat: userLocation.lat, lng: userLocation.lng, address: '' });
                  // Get address for current location
                  const geocoder = new window.google.maps.Geocoder();
                  geocoder.geocode({ location: userLocation }, (results, status) => {
                    if (status === 'OK' && results && results[0]) {
                      setLocation(prev => prev ? { ...prev, address: results[0].formatted_address } : null);
                      setAddressInput(results[0].formatted_address);
                    }
                  });
                }}
                className="bg-[#8b7ee8] hover:bg-[#766be0] text-white px-6 py-2 rounded-full text-sm font-medium transition-colors"
              >
                📍 Use My Current Location
              </button>
            </div>
          )}
          <div className="rounded-2xl overflow-hidden border-2 border-gray-200">
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={15}
              >
                <Marker
                  position={center}
                  draggable
                  onDragEnd={handleMarkerDragEnd}
                  icon={{
                    url: 'https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi2_hdpi.png',
                    scaledSize: new window.google.maps.Size(40, 40),
                  }}
                />
              </GoogleMap>
            ) : (
              <div className="flex items-center justify-center h-[400px] text-gray-400">Loading map...</div>
            )}
          </div>
        </div>
        <div className="flex justify-between items-center mt-12">
          <button
            onClick={prevStep}
            className="px-8 py-3 text-gray-600 hover:text-gray-800 transition-colors text-lg"
          >
            ← Back
          </button>
          <button
            onClick={nextStep}
            disabled={!location}
            className="bg-[#8b7ee8] hover:bg-[#766be0] disabled:bg-gray-300 text-white font-bold py-3 px-8 rounded-full transition-colors text-lg"
          >
            Continue
          </button>
        </div>
      </div>
    );
  };

  // Renders the review step to confirm all details before publishing
  const renderReviewStep = () => (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-serif font-bold text-[#8b7ee8] mb-4 text-center">
        Review your listing
      </h2>
      <p className="text-gray-600 mb-12 text-center text-lg">
        Make sure everything looks good before you publish
      </p>
      
      <div className="bg-gray-50 rounded-2xl p-8 mb-12">
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-gray-800 text-lg mb-2">Categories</h3>
            <p className="text-gray-600 text-lg">
              {selectedCategories.map(id => 
                categories.find(c => c.id === id)?.name
              ).join(", ")}
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-800 text-lg mb-2">Item Name</h3>
            <p className="text-gray-600 text-lg">{itemName}</p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-800 text-lg mb-2">Description</h3>
            <p className="text-gray-600 text-lg">{description}</p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-800 text-lg mb-2">Daily Price</h3>
            <p className="text-gray-600 text-lg">${rentPerDay}</p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-800 text-lg mb-2">Photos</h3>
            <p className="text-gray-600 text-lg">{photoSlots.filter(Boolean).map(file => file?.name).join(", ")}</p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-800 text-lg mb-2">Address</h3>
            <p className="text-gray-600 text-lg">{location?.address || 'No address selected'}</p>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="flex justify-between items-center">
        <button
          type="button"
          onClick={prevStep}
          className="px-8 py-3 text-gray-600 hover:text-gray-800 transition-colors text-lg"
        >
          ← Back
        </button>
        <button
          type="submit"
          className="bg-[#8b7ee8] hover:bg-[#766be0] text-white font-bold py-4 px-10 rounded-full text-xl shadow-lg transition-colors"
        >
          Publish Listing
        </button>
      </form>
    </div>
  );

  // 5. Update renderCurrentStep
  const renderCurrentStep = () => {
    switch (currentStep) {
      case "welcome":
        return renderWelcomeStep();
      case "categories":
        return renderCategoriesStep();
      case "item-details":
        return renderItemDetailsStep();
      case "pricing":
        return renderPricingStep();
      case "photos":
        return renderPhotosStep();
      case "location":
        return renderLocationStep();
      case "review":
        return renderReviewStep();
      default:
        return renderWelcomeStep();
    }
  };

  // Main layout: step content, then progress bar at the bottom for better UX
  const stepIndex = steps.indexOf(currentStep) + 1;
  return (
    <main className="min-h-[calc(100vh-120px)] bg-gray-50 py-12 px-4 relative" ref={containerRef}>
      {/* Home Button - Fixed position in top left */}
      <div className="fixed top-4 left-4 z-50">
        <HomeButton className="text-[#8b7ee8] bg-white rounded-full px-4 py-2 shadow-lg" />
      </div>
      {/* Confetti burst only after submission */}
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          numberOfPieces={800}
          recycle={false}
          gravity={0.1}
          wind={0}
          initialVelocityY={{ min: 10, max: 20 }}
          initialVelocityX={{ min: -5, max: 5 }}
          confettiSource={{ x: 0, y: 0, w: width, h: 10 }}
        />
      )}
      <div className="max-w-4xl mx-auto">
        {/* Step Content */}
        <div className="p-12 min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
            >
              {renderCurrentStep()}
            </motion.div>
          </AnimatePresence>
        </div>
        {/* Progress Bar at the bottom */}
        {currentStep !== "welcome" && (
          <div className="mt-12">
            <div className="flex justify-between text-lg text-gray-600 mb-4">
              <span>Step {["welcome", "categories", "item-details", "pricing", "photos", "location", "review"].indexOf(currentStep)} of 6</span>
              <span>{Math.round(getStepProgress())}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-[#8b7ee8] h-3 rounded-full transition-all duration-500"
                style={{ width: `${getStepProgress()}%` }}
              />
            </div>
          </div>
        )}
      </div>
      <style>{`
        .google-places-autocomplete-flex-1 > div:first-child {
          flex: 1 1 0%;
          min-width: 0;
        }
      `}</style>
    </main>
  );
}
