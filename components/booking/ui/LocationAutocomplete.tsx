'use client';

/**
 * Enhanced Location Autocomplete Component
 * Features:
 * - Lazy Google Maps loading (on input focus)
 * - Barcelona bias + Spain restriction
 * - 30km radius intelligence (pickup → nearby dropoffs)
 * - Geolocation button with reverse geocoding
 * - iOS-SPECIFIC: Proper permission handling for iPhone/iPad
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
  const [permissionDenied, setPermissionDenied] = useState(false);
  
  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const loadingPromiseRef = useRef<Promise<void> | null>(null);

  // ============================================================================
  // 🎯 iOS DETECTION
  // ============================================================================

  const isIOS = useCallback(() => {
    if (typeof window === 'undefined') return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }, []);

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
  // 🎯 iOS-OPTIMIZED GEOLOCATION: "USE MY LOCATION" BUTTON
  // ============================================================================

  const handleUseMyLocation = async () => {
    console.log('🎯 [iOS Fix] Starting location request...', { 
      isIOS: isIOS(),
      platform: navigator.platform,
      userAgent: navigator.userAgent 
    });

    setLocationError('');
    setPermissionDenied(false);
    
    // Step 1: Check if geolocation is supported
    if (!navigator.geolocation) {
      const errorMsg = t('errors.geolocationUnsupported') || 'Geolocation is not supported by your browser';
      setLocationError(errorMsg);
      console.error('❌ Geolocation API not available');
      return;
    }

    // Step 2: Check secure context (HTTPS required for iOS)
    if (typeof window !== 'undefined') {
      const isSecure = window.isSecureContext || 
                      window.location.protocol === 'https:' || 
                      window.location.hostname === 'localhost' ||
                      window.location.hostname === '127.0.0.1';
      
      if (!isSecure) {
        const errorMsg = 'Location requires HTTPS connection';
        setLocationError(errorMsg);
        console.error('❌ [iOS Fix] Not in secure context:', {
          protocol: window.location.protocol,
          hostname: window.location.hostname,
          isSecureContext: window.isSecureContext
        });
        
        if (isIOS()) {
          alert('⚠️ HTTPS Required\n\nLocation services require a secure HTTPS connection on iOS.\n\nPlease access this site using https://');
        }
        return;
      }
    }

    console.log('✅ [iOS Fix] Security checks passed, requesting location...');
    setIsGettingLocation(true);

    // Step 3: 🔥 iOS-OPTIMIZED geolocation options
    const options: PositionOptions = {
      enableHighAccuracy: true,  // 🎯 CRITICAL for iOS precise location
      timeout: 15000,            // 🎯 15 seconds for iOS (slower than Android)
      maximumAge: 0              // 🎯 Don't use cached position
    };

    console.log('📍 [iOS Fix] Calling getCurrentPosition with options:', options);

    // Step 4: Request location with comprehensive iOS-specific error handling
    navigator.geolocation.getCurrentPosition(
      // ✅ SUCCESS CALLBACK
      async (position) => {
        console.log('✅ [iOS Fix] Location permission GRANTED!', {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        });
        
        try {
          const { latitude, longitude, accuracy } = position.coords;
          
          console.log(`📍 [iOS Fix] Coordinates obtained: ${latitude.toFixed(6)}, ${longitude.toFixed(6)} (accuracy: ${accuracy}m)`);
          
          // Step 5: Ensure Google Maps is loaded for reverse geocoding
          const isReady = await ensureGoogleMapsLoaded();
          
          if (isReady) {
            console.log('🗺️ [iOS Fix] Google Maps loaded, reverse geocoding...');
            
            // Reverse geocode to get address
            const result = await reverseGeocode(latitude, longitude);
            
            console.log('✅ [iOS Fix] Address resolved:', result.address);
            
            setInputValue(result.address);
            onChange({
              address: result.address,
              placeId: result.placeId,
              lat: result.location.lat,
              lng: result.location.lng,
              type: 'address',
            });
            
            setPermissionDenied(false);
          } else {
            // Fallback: Use coordinates as address
            console.warn('⚠️ [iOS Fix] Google Maps unavailable, using coordinates as fallback');
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
          console.error('❌ [iOS Fix] Reverse geocoding error:', error);
          setLocationError(t('errors.geocodingFailed') || 'Could not determine address from location');
        } finally {
          setIsGettingLocation(false);
        }
      },
      // ❌ ERROR CALLBACK with iOS-specific handling
      (error) => {
        console.error('❌ [iOS Fix] Geolocation error:', {
          code: error.code,
          message: error.message,
          isIOS: isIOS()
        });
        
        setIsGettingLocation(false);
        
        let errorMessage = '';
        let userMessage = '';

        switch (error.code) {
          case 1: // PERMISSION_DENIED
            console.error('🚫 [iOS Fix] User DENIED location permission');
            errorMessage = 'Location permission denied';
            setPermissionDenied(true); // 🎯 Set iOS permission denied state
            
            // 🎯 iOS-SPECIFIC instructions
            if (isIOS()) {
              userMessage = '📍 Location Permission Denied\n\n' +
                '⚙️ To enable on iPhone/iPad:\n\n' +
                '1. Open Settings app\n' +
                '2. Scroll down and tap "Safari"\n' +
                '3. Tap "Location"\n' +
                '4. Select "Allow"\n' +
                '5. Return here and refresh the page\n\n' +
                '💡 Also check:\n' +
                'Settings → Privacy & Security → Location Services → ON';
            } else {
              userMessage = 'Please enable location permissions in your browser settings.';
            }
            break;

          case 2: // POSITION_UNAVAILABLE
            console.error('📡 [iOS Fix] Position unavailable - GPS/network issue');
            errorMessage = 'Location information unavailable';
            userMessage = '⚠️ Unable to retrieve your location.\n\n' +
              'Please check:\n' +
              '• Location Services are enabled\n' +
              '• You have a GPS signal\n' +
              '• Try moving outdoors\n' +
              '• Try again in a moment';
            break;

          case 3: // TIMEOUT
            console.error('⏱️ [iOS Fix] Location request timed out after 15 seconds');
            errorMessage = 'Location request timed out';
            userMessage = '⏱️ Location request took too long.\n\n' +
              'This can happen if:\n' +
              '• GPS signal is weak\n' +
              '• You\'re indoors\n' +
              '• Location Services are slow to respond\n\n' +
              'Please try again.';
            break;

          default:
            console.error('❓ [iOS Fix] Unknown error:', error);
            errorMessage = 'Unknown error occurred';
            userMessage = 'An unexpected error occurred. Please try again.';
        }
        
        setLocationError(errorMessage);
        alert(userMessage);
      },
      options // 🎯 Pass iOS-optimized options
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
    setPermissionDenied(false);
    
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

      {/* 🎯 iOS-SPECIFIC: Permission Denied Error with Settings Instructions */}
      {permissionDenied && isIOS() && (
        <m.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 p-3 bg-red-50 border border-red-200 rounded-2xl"
        >
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <p className="text-xs font-semibold text-red-700 mb-1">
                📍 Location Permission Denied
              </p>
              <p className="text-xs text-red-600 leading-relaxed">
                To enable: <span className="font-medium">Settings → Safari → Location → Allow</span>
                <br />
                Then refresh this page.
              </p>
            </div>
          </div>
        </m.div>
      )}

      {/* Error Messages (non-iOS or non-permission errors) */}
      {(error || (locationError && !permissionDenied)) && (
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
