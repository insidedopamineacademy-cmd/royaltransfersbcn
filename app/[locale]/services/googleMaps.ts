/**
 * Google Maps Service - PRODUCTION VERSION
 * Uses script loading approach for latest Google Maps API
 */

import type { LocationSuggestion, GeocodeResult, DistanceMatrixResult } from '@/lib/booking/types';

// ============================================================================
// INITIALIZATION
// ============================================================================

let googleMapsLoaded = false;
let loadingPromise: Promise<void> | null = null;

/**
 * Load Google Maps script dynamically
 */
function loadGoogleMapsScript(apiKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if script already exists
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=Function.prototype`;
    script.async = true;
    script.defer = true;

    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps script'));

    document.head.appendChild(script);
  });
}

/**
 * Initialize Google Maps API
 */
export async function initializeGoogleMaps(): Promise<void> {
  if (googleMapsLoaded) return;
  if (loadingPromise) return loadingPromise;

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    throw new Error('Google Maps API key is not configured. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file');
  }

  loadingPromise = (async () => {
    try {
      await loadGoogleMapsScript(apiKey);
      
      // Wait for google.maps to be available
      await new Promise<void>((resolve) => {
        const checkGoogle = () => {
          if (window.google && window.google.maps) {
            resolve();
          } else {
            setTimeout(checkGoogle, 100);
          }
        };
        checkGoogle();
      });
      
      googleMapsLoaded = true;
      console.log('✅ Google Maps API loaded successfully');
    } catch (error) {
      console.error('❌ Error loading Google Maps:', error);
      loadingPromise = null;
      throw new Error('Failed to load Google Maps API');
    }
  })();

  return loadingPromise;
}

// ============================================================================
// PLACES AUTOCOMPLETE
// ============================================================================

/**
 * Search for places using Autocomplete Service
 */
export async function searchPlaces(
  input: string,
  options?: {
    types?: string[];
    componentRestrictions?: { country: string | string[] };
    bounds?: google.maps.LatLngBounds;
  }
): Promise<LocationSuggestion[]> {
  await initializeGoogleMaps();

  if (!input || input.length < 2) {
    return [];
  }

  return new Promise((resolve, reject) => {
    const service = new google.maps.places.AutocompleteService();

    const request: google.maps.places.AutocompletionRequest = {
      input,
      ...options,
    };

    service.getPlacePredictions(request, (predictions, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
        const suggestions: LocationSuggestion[] = predictions.map((prediction) => ({
          placeId: prediction.place_id,
          description: prediction.description,
          mainText: prediction.structured_formatting.main_text,
          secondaryText: prediction.structured_formatting.secondary_text || '',
          types: prediction.types,
        }));
        resolve(suggestions);
      } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
        resolve([]);
      } else {
        reject(new Error(`Places API error: ${status}`));
      }
    });
  });
}

/**
 * Search for places in Barcelona area
 */
export async function searchPlacesInBarcelona(input: string): Promise<LocationSuggestion[]> {
  await initializeGoogleMaps();
  
  // Barcelona bounds (approximate)
  const barcelonaBounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(41.320, 2.052), // Southwest
    new google.maps.LatLng(41.470, 2.228)  // Northeast
  );

  return searchPlaces(input, {
    componentRestrictions: { country: 'es' },
    bounds: barcelonaBounds,
  });
}

/**
 * Search specifically for airports
 */
export async function searchAirports(input: string): Promise<LocationSuggestion[]> {
  return searchPlaces(input, {
    types: ['airport'],
    componentRestrictions: { country: 'es' },
  });
}

// ============================================================================
// GEOCODING
// ============================================================================

/**
 * Get place details from Place ID
 */
export async function getPlaceDetails(placeId: string): Promise<GeocodeResult> {
  await initializeGoogleMaps();

  return new Promise((resolve, reject) => {
    const geocoder = new google.maps.Geocoder();

    geocoder.geocode({ placeId }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
        const result = results[0];
        resolve({
          address: result.formatted_address,
          placeId: result.place_id,
          location: {
            lat: result.geometry.location.lat(),
            lng: result.geometry.location.lng(),
          },
          types: result.types,
        });
      } else {
        reject(new Error(`Geocoding error: ${status}`));
      }
    });
  });
}

/**
 * Geocode an address string to coordinates
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult> {
  await initializeGoogleMaps();

  return new Promise((resolve, reject) => {
    const geocoder = new google.maps.Geocoder();

    geocoder.geocode({ address }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
        const result = results[0];
        resolve({
          address: result.formatted_address,
          placeId: result.place_id,
          location: {
            lat: result.geometry.location.lat(),
            lng: result.geometry.location.lng(),
          },
          types: result.types,
        });
      } else {
        reject(new Error(`Geocoding error: ${status}`));
      }
    });
  });
}

/**
 * Reverse geocode coordinates to address
 */
export async function reverseGeocode(lat: number, lng: number): Promise<GeocodeResult> {
  await initializeGoogleMaps();

  return new Promise((resolve, reject) => {
    const geocoder = new google.maps.Geocoder();
    const location = new google.maps.LatLng(lat, lng);

    geocoder.geocode({ location }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
        const result = results[0];
        resolve({
          address: result.formatted_address,
          placeId: result.place_id,
          location: {
            lat: result.geometry.location.lat(),
            lng: result.geometry.location.lng(),
          },
          types: result.types,
        });
      } else {
        reject(new Error(`Reverse geocoding error: ${status}`));
      }
    });
  });
}

// ============================================================================
// DISTANCE MATRIX
// ============================================================================

/**
 * Calculate distance and duration between two locations
 */
export async function calculateDistance(
  origin: string | { lat: number; lng: number },
  destination: string | { lat: number; lng: number }
): Promise<DistanceMatrixResult> {
  await initializeGoogleMaps();

  return new Promise((resolve, reject) => {
    const service = new google.maps.DistanceMatrixService();

    const request: google.maps.DistanceMatrixRequest = {
      origins: [typeof origin === 'string' ? origin : new google.maps.LatLng(origin.lat, origin.lng)],
      destinations: [
        typeof destination === 'string'
          ? destination
          : new google.maps.LatLng(destination.lat, destination.lng),
      ],
      travelMode: google.maps.TravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.METRIC,
    };

    service.getDistanceMatrix(request, (response, status) => {
      if (status === google.maps.DistanceMatrixStatus.OK && response) {
        const result = response.rows[0]?.elements[0];

        if (result && result.status === google.maps.DistanceMatrixElementStatus.OK) {
          resolve({
            distance: {
              text: result.distance.text,
              value: result.distance.value,
            },
            duration: {
              text: result.duration.text,
              value: result.duration.value,
            },
          });
        } else {
          reject(new Error('No route found between locations'));
        }
      } else {
        reject(new Error(`Distance Matrix error: ${status}`));
      }
    });
  });
}

/**
 * Calculate distance between two Place IDs
 */
export async function calculateDistanceByPlaceId(
  originPlaceId: string,
  destinationPlaceId: string
): Promise<DistanceMatrixResult> {
  // Get coordinates for both places
  const [origin, destination] = await Promise.all([
    getPlaceDetails(originPlaceId),
    getPlaceDetails(destinationPlaceId),
  ]);

  return calculateDistance(origin.location, destination.location);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if a place is an airport based on types
 */
export function isAirport(types: string[]): boolean {
  return types.includes('airport');
}

/**
 * Check if a place is a hotel
 */
export function isHotel(types: string[]): boolean {
  return types.includes('lodging') || types.includes('hotel');
}

/**
 * Format distance in kilometers
 */
export function formatDistance(meters: number): string {
  const km = meters / 1000;
  return `${km.toFixed(1)} km`;
}

/**
 * Format duration in minutes/hours
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

export class GoogleMapsError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = 'GoogleMapsError';
  }
}

/**
 * Handle Google Maps API errors
 */
export function handleGoogleMapsError(error: unknown): GoogleMapsError {
  if (error instanceof GoogleMapsError) {
    return error;
  }

  if (error instanceof Error) {
    return new GoogleMapsError(error.message, 'UNKNOWN_ERROR');
  }

  return new GoogleMapsError('An unknown error occurred', 'UNKNOWN_ERROR');
}