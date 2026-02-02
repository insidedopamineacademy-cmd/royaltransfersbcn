'use client';

/**
 * Location Autocomplete Component
 * Google Places Autocomplete with Barcelona focus
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { searchPlacesInBarcelona, getPlaceDetails } from '@/app/[locale]/services/googleMaps';
import { debounce } from '@/lib/booking/utils';
import type { LocationSuggestion, Location } from '@/lib/booking/types';

// ============================================================================
// COMPONENT PROPS
// ============================================================================

interface LocationAutocompleteProps {
  value: string;
  onChange: (location: Location) => void;
  placeholder?: string;
  label?: string;
  type?: 'pickup' | 'dropoff';
  error?: string;
  disabled?: boolean;
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
}: LocationAutocompleteProps) {
  const t = useTranslations('booking.location');
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // ============================================================================
  // SEARCH HANDLER
  // ============================================================================

  const searchLocations = useCallback(
    async (query: string) => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const results = await searchPlacesInBarcelona(query);
        setSuggestions(results);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error searching locations:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((query: string) => searchLocations(query), 300),
    [searchLocations]
  );

  // ============================================================================
  // INPUT CHANGE HANDLER
  // ============================================================================

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setSelectedIndex(-1);
    
    if (newValue.length >= 2) {
      debouncedSearch(newValue);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // ============================================================================
  // SUGGESTION SELECTION
  // ============================================================================

  const handleSelectSuggestion = async (suggestion: LocationSuggestion) => {
    setInputValue(suggestion.mainText);
    setShowSuggestions(false);
    setSuggestions([]);
    setIsLoading(true);

    try {
      const details = await getPlaceDetails(suggestion.placeId);
      
      // Determine location type
      let locationType: Location['type'] = 'address';
      if (suggestion.types.includes('airport')) {
        locationType = 'airport';
      } else if (suggestion.types.includes('lodging')) {
        locationType = 'hotel';
      } else if (suggestion.types.includes('transit_station')) {
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
    if (value !== inputValue) {
      setInputValue(value);
    }
  }, [value]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="relative w-full">
      {/* Label */}
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
        </label>
      )}

      {/* Input Field */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
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
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={placeholder || t('pickupPlaceholder')}
          disabled={disabled}
          className={`
            w-full pl-12 pr-12 py-3.5 
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

        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
            <LoadingSpinner />
          </div>
        )}

        {/* Clear Button */}
        {inputValue && !isLoading && !disabled && (
          <button
            type="button"
            onClick={() => {
              setInputValue('');
              setSuggestions([]);
              setShowSuggestions(false);
              onChange({ address: '' });
              inputRef.current?.focus();
            }}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-red-600"
        >
          {error}
        </motion.p>
      )}

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
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
                  key={suggestion.placeId}
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
                        {suggestion.mainText}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {suggestion.secondaryText}
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Results */}
      {showSuggestions && !isLoading && suggestions.length === 0 && inputValue.length >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 p-4"
        >
          <p className="text-sm text-gray-500 text-center">
            {t('noResults')}
          </p>
        </motion.div>
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

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <svg
      className="animate-spin h-5 w-5 text-blue-500"
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