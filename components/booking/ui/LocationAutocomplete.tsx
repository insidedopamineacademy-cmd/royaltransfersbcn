'use client';

/**
 * Enhanced Location Autocomplete Component
 * Features:
 * - Lazy Google Maps loading (on input focus)
 * - Barcelona bias + Spain restriction
 * - 30km radius intelligence (pickup → nearby dropoffs)
 * - Geolocation button with reverse geocoding
 * - Error handling and validation
 * - Fallback mode for manual entry
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { m, AnimatePresence } from 'framer-motion';
import { 
  initializeGoogleMaps, 
  reverseGeocode,
  getPlaceDetails 
} from '@/app/[locale]/services/googleMaps';
import type { Location } from '@/lib/booking/types';

// ============================================================================
// UTILITY: TYPED DEBOUNCE FUNCTION
// ============================================================================

function debounce<T extends (...args: never[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

// ============================================================================
// TYPES
// ============================================================================

interface LocationAutocompleteProps {
  value: string;
  onChange: (location: Location) => void;
  placeholder?: string;
  label?: string;
  type?: 'pickup' | 'dropoff';
  error?: string;
  disabled?: boolean;
  pickupLocation?: Location; // For 30km radius feature
}

interface AutocompletePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  types: string[];
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function LocationAutocomplete({
  value,
  onChange,
  placeholder,
  label,
  type = 'pickup',
  error,
  disabled = false,
  pickupLocation,
}: LocationAutocompleteProps) {
  const t = useTranslations('booking.location');
  
  // State
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<AutocompletePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [googleReady, setGoogleReady] = useState(false);
  const [googleFailed, setGoogleFailed] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string>('');
  
  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const loadingPromiseRef = useRef<Promise<void> | null>(null);

  // ============================================================================
  // LAZY LOAD GOOGLE MAPS (ON INPUT FOCUS)
  // ============================================================================

  const ensureGoogleMapsLoaded = useCallback(async () => {
    if (googleFailed) return false;
    if (googleReady && window.google?.maps?.places) return true;
    
    // Prevent multiple simultaneous loading attempts
    if (loadingPromiseRef.current) {
      try {
        await loadingPromiseRef.current;
        return window.google?.maps?.places ? true : false;
      } catch {
        return false;
      }
    }

    try {
      loadingPromiseRef.current = initializeGoogleMaps();
      await loadingPromiseRef.current;
      
      if (window.google?.maps?.places) {
        setGoogleReady(true);
        autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
        return true;
      }
      
      setGoogleFailed(true);
      return false;
    } catch (error) {
      console.error('Failed to load Google Maps:', error);
      setGoogleFailed(true);
      return false;
    } finally {
      loadingPromiseRef.current = null;
    }
  }, [googleReady, googleFailed]);

  // ============================================================================
  // SEARCH WITH BARCELONA BIAS + SPAIN RESTRICTION + 30KM RADIUS
  // ============================================================================

  const searchLocations = useCallback(
    async (query: string) => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      const isReady = await ensureGoogleMapsLoaded();
      if (!isReady || !autocompleteServiceRef.current) {
        // Fallback: user can still type manually
        return;
      }

      setIsLoading(true);
      try {
        const request: google.maps.places.AutocompletionRequest = {
          input: query,
          componentRestrictions: { country: 'es' }, // Spain restriction
        };

        // Barcelona bias (default bounds)
        const barcelonaBounds = new google.maps.LatLngBounds(
          new google.maps.LatLng(41.270, 1.930), // Southwest
          new google.maps.LatLng(41.520, 2.320)  // Northeast
        );

        // 30km radius intelligence: If this is dropoff and we have pickup location
        if (type === 'dropoff' && pickupLocation?.lat && pickupLocation?.lng) {
          const pickupLatLng = new google.maps.LatLng(
            pickupLocation.lat,
            pickupLocation.lng
          );
          
          // Create 30km circle around pickup
          const circle = new google.maps.Circle({
            center: pickupLatLng,
            radius: 30000, // 30km in meters
          });
          
          const nearbyBounds = circle.getBounds();
          if (nearbyBounds) {
            request.bounds = nearbyBounds;
            // Note: strictBounds not available in AutocompletionRequest
            // But bounds still prioritizes results within the circle
          }
        } else {
          // Use Barcelona bounds for pickup or when no pickup location set
          request.bounds = barcelonaBounds;
        }

        autocompleteServiceRef.current.getPlacePredictions(
          request,
          (predictions, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
              setSuggestions(predictions);
              setShowSuggestions(true);
            } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
              setSuggestions([]);
              setShowSuggestions(true);
            } else {
              console.error('Places API error:', status);
              setSuggestions([]);
            }
            setIsLoading(false);
          }
        );
      } catch (error) {
        console.error('Error searching locations:', error);
        setSuggestions([]);
        setIsLoading(false);
      }
    },
    [type, pickupLocation, ensureGoogleMapsLoaded]
  );

  // Debounced search
  const debouncedSearchRef = useRef(
    debounce((query: string) => {
      searchLocations(query);
    }, 300)
  );

  // Update debounced function when searchLocations changes
  useEffect(() => {
    debouncedSearchRef.current = debounce((query: string) => {
      searchLocations(query);
    }, 300);
  }, [searchLocations]);

  // ============================================================================
  // GEOLOCATION: "USE MY LOCATION" BUTTON
  // ============================================================================

  const handleUseMyLocation = async () => {
    setLocationError('');
    
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setLocationError(t('errors.geolocationUnsupported') || 'Geolocation is not supported by your browser');
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Ensure Google Maps is loaded for reverse geocoding
          const isReady = await ensureGoogleMapsLoaded();
          
          if (isReady) {
            // Reverse geocode to get address
            const result = await reverseGeocode(latitude, longitude);
            
            setInputValue(result.address);
            onChange({
              address: result.address,
              placeId: result.placeId,
              lat: result.location.lat,
              lng: result.location.lng,
              type: 'address',
            });
          } else {
            // Fallback: Use coordinates as address
            const coordsAddress = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            setInputValue(coordsAddress);
            onChange({
              address: coordsAddress,
              lat: latitude,
              lng: longitude,
              type: 'address',
            });
          }
        } catch (error) {
          console.error('Reverse geocoding error:', error);
          setLocationError(t('errors.geocodingFailed') || 'Could not determine address from location');
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        setIsGettingLocation(false);
        
        let errorMessage = t('errors.geolocationDenied') || 'Location permission denied';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = t('errors.geolocationDenied') || 'Location permission denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = t('errors.geolocationUnavailable') || 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = t('errors.geolocationTimeout') || 'Location request timed out';
            break;
        }
        
        setLocationError(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      }
    );
  };

  // ============================================================================
  // INPUT CHANGE HANDLER
  // ============================================================================

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setSelectedIndex(-1);
    setLocationError('');
    
    if (newValue.length >= 2) {
      debouncedSearchRef.current(newValue);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // ============================================================================
  // SUGGESTION SELECTION
  // ============================================================================

  const handleSelectSuggestion = async (prediction: AutocompletePrediction) => {
    setInputValue(prediction.structured_formatting.main_text);
    setShowSuggestions(false);
    setSuggestions([]);
    setIsLoading(true);

    try {
      const details = await getPlaceDetails(prediction.place_id);
      
      // Determine location type
      let locationType: Location['type'] = 'address';
      if (prediction.types.includes('airport')) {
        locationType = 'airport';
      } else if (prediction.types.includes('lodging')) {
        locationType = 'hotel';
      } else if (prediction.types.includes('transit_station')) {
        locationType = 'cruise';
      }

      onChange({
        address: details.address,
        placeId: details.placeId,
        lat: details.location.lat,
        lng: details.location.lng,
        type: locationType,
      });
    } catch (error) {
      console.error('Error getting place details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================================
  // KEYBOARD NAVIGATION
  // ============================================================================

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelectSuggestion(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSuggestions([]);
        break;
    }
  };

  // ============================================================================
  // CLICK OUTSIDE HANDLER
  // ============================================================================

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ============================================================================
  // UPDATE INPUT VALUE WHEN PROP CHANGES
  // ============================================================================

  useEffect(() => {
    if (value && value !== inputValue) {
      setInputValue(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]); // inputValue intentionally excluded to prevent infinite loop

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="relative w-full">
      {/* Label */}
      {label && (
        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
          {label}
        </label>
      )}

      {/* Input Field with Geolocation Button */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
          {type === 'pickup' ? (
            <MapPinIcon className="w-5 h-5 text-blue-500" />
          ) : (
            <FlagIcon className="w-5 h-5 text-emerald-500" />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={async () => {
            // Lazy load on focus
            if (!googleReady && !googleFailed) {
              await ensureGoogleMapsLoaded();
            }
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={placeholder || t('pickupPlaceholder')}
          disabled={disabled}
          className={`
            w-full pl-12 ${type === 'pickup' ? 'pr-12' : 'pr-4'} py-3.5 
            bg-white border-2 rounded-xl
            text-base text-gray-900 placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-offset-1
            transition-all duration-200
            ${error 
              ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' 
              : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'
            }
            ${disabled ? 'bg-gray-50 cursor-not-allowed opacity-60' : ''}
          `}
        />

        {/* Geolocation Button (only for pickup) */}
        {type === 'pickup' && !disabled && (
          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={isGettingLocation}
            title={t('useMyLocation') || 'Use my location'}
            aria-label={t('useMyLocation') || 'Use my location'}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGettingLocation ? (
              <LoadingSpinner className="w-5 h-5" />
            ) : (
              <LocationTargetIcon className="w-5 h-5" />
            )}
          </button>
        )}

        {/* Loading Spinner (for autocomplete) */}
        {isLoading && type === 'dropoff' && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
            <LoadingSpinner className="w-5 h-5" />
          </div>
        )}
      </div>

      {/* Error Messages */}
      {(error || locationError) && (
        <m.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-red-600"
        >
          {error || locationError}
        </m.p>
      )}

      {/* Google Maps Unavailable Notice */}
      {googleFailed && inputValue.length >= 2 && (
        <m.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-xs text-amber-600"
        >
          {t('fallbackMode') || 'Autocomplete unavailable. You can still type addresses manually.'}
        </m.p>
      )}

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <m.div
            ref={suggestionsRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
          >
            <div className="max-h-80 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.place_id}
                  type="button"
                  onClick={() => handleSelectSuggestion(suggestion)}
                  className={`
                    w-full px-4 py-3 text-left 
                    hover:bg-blue-50 transition-colors
                    border-b border-gray-100 last:border-b-0
                    ${selectedIndex === index ? 'bg-blue-50' : 'bg-white'}
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0">
                      {suggestion.types.includes('airport') ? (
                        <PlaneIcon className="w-5 h-5 text-blue-500" />
                      ) : suggestion.types.includes('lodging') ? (
                        <HotelIcon className="w-5 h-5 text-amber-500" />
                      ) : (
                        <LocationIcon className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {suggestion.structured_formatting.main_text}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {suggestion.structured_formatting.secondary_text}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Powered by Google */}
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-right">
                Powered by Google
              </p>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {/* No Results */}
      {showSuggestions && !isLoading && suggestions.length === 0 && inputValue.length >= 2 && (
        <m.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 p-4"
        >
          <p className="text-sm text-gray-500 text-center">
            {t('noResults') || 'No locations found. Try a different search.'}
          </p>
        </m.div>
      )}
    </div>
  );
}

// ============================================================================
// ICON COMPONENTS
// ============================================================================

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function FlagIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
    </svg>
  );
}

function PlaneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  );
}

function HotelIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

function LocationIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function LocationTargetIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v3m0 14v3M2 12h3m14 0h3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16a4 4 0 100-8 4 4 0 000 8z" />
    </svg>
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}