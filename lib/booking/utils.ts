/**
 * Booking Utility Functions
 * Helper functions for calculations, formatting, and validation
 */

import type { BookingData, PriceBreakdown, Vehicle, Location, DistanceMatrixResult } from './types';
import { PRICING_RULES, BOOKING_CONFIG } from './constants';

// ============================================================================
// PRICE CALCULATION
// ============================================================================

/**
 * Calculate total price based on booking data
 */
export function calculatePrice(
  bookingData: BookingData,
  distance?: number
): PriceBreakdown {
  const vehicle = bookingData.selectedVehicle;
  
  if (!vehicle) {
    return createEmptyPriceBreakdown();
  }

  const basePrice = vehicle.basePrice;
  let distanceCharge = 0;
  let timeCharge = 0;
  let extraStopsCharge = 0;
  let meetAndGreetCharge = 0;
  let childSeatsCharge = 0;
  let airportFee = 0;

  // Calculate based on service type
  if (bookingData.serviceType === 'hourly') {
    // [UPDATED] Use hourlyDuration from bookingData instead of hardcoded 4 hours
    const hours = bookingData.hourlyDuration ?? 4;
    timeCharge = vehicle.pricePerHour ? vehicle.pricePerHour * hours : 0;
  } else {
    // Distance-based service
    if (distance && vehicle.pricePerKm) {
      distanceCharge = distance * vehicle.pricePerKm;
    }
  }

  // Airport fee (if pickup or dropoff is airport)
 if (isAirportLocation(bookingData.pickup) || isAirportLocation(bookingData.dropoff)) {
    airportFee = PRICING_RULES.airportFee;
  }

  // Meet & greet
  if (bookingData.extras.meetAndGreet) {
    meetAndGreetCharge = PRICING_RULES.meetAndGreetFee;
  }

  // Child seats
  if (bookingData.passengers.childSeats > 0) {
    childSeatsCharge = bookingData.passengers.childSeats * PRICING_RULES.childSeatFee;
  }

  // Additional stops
  if (bookingData.extras.additionalStops.length > 0) {
    extraStopsCharge = bookingData.extras.additionalStops.length * PRICING_RULES.additionalStopFee;
  }

  // Calculate subtotal
  const subtotal =
    basePrice +
    distanceCharge +
    timeCharge +
    extraStopsCharge +
    meetAndGreetCharge +
    childSeatsCharge +
    airportFee;

  // Calculate tax
  const tax = (subtotal * PRICING_RULES.taxRate) / 100;

  // Calculate total
  const total = subtotal + tax;

  return {
    basePrice,
    distanceCharge,
    timeCharge,
    extraStopsCharge,
    meetAndGreetCharge,
    childSeatsCharge,
    airportFee,
    subtotal,
    tax,
    total,
    currency: BOOKING_CONFIG.currency,
  };
}

/**
 * Create empty price breakdown
 */
function createEmptyPriceBreakdown(): PriceBreakdown {
  return {
    basePrice: 0,
    distanceCharge: 0,
    timeCharge: 0,
    extraStopsCharge: 0,
    meetAndGreetCharge: 0,
    childSeatsCharge: 0,
    airportFee: 0,
    subtotal: 0,
    tax: 0,
    total: 0,
    currency: BOOKING_CONFIG.currency,
  };
}

// ============================================================================
// VEHICLE FILTERING
// ============================================================================

/**
 * Filter vehicles based on passenger and luggage requirements
 */
export function filterAvailableVehicles(
  vehicles: Vehicle[],
  passengers: number,
  luggage: number
): Vehicle[] {
  return vehicles.filter(
    (vehicle) =>
      vehicle.capacity.passengers >= passengers &&
      vehicle.capacity.luggage >= luggage
  );
}

/**
 * Get recommended vehicle for given requirements
 */
export function getRecommendedVehicle(
  vehicles: Vehicle[],
  passengers: number,
  luggage: number
): Vehicle | null {
  const available = filterAvailableVehicles(vehicles, passengers, luggage);
  
  if (available.length === 0) return null;
  
  // Sort by price and return cheapest that fits requirements
  return available.sort((a, b) => a.basePrice - b.basePrice)[0];
}

// ============================================================================
// LOCATION UTILITIES
// ============================================================================

/**
 * Check if location is an airport
 */
export function isAirportLocation(location?: Location): boolean {
  if (!location?.address) return false;

  const addr = location.address.toLowerCase();

  return (
    location.type === 'airport' ||
    addr.includes('airport') ||
    addr.includes('bcn') ||
    addr.includes('el prat')
  );
}

/**
 * Check if location is a cruise port
 */
export function isCruisePort(location?: Location): boolean {
  if (!location?.address) return false;

  const addr = location.address.toLowerCase();

  return (
    location.type === 'cruise' ||
    addr.includes('cruise') ||
    addr.includes('port')
  );
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * Returns straight-line distance in km — use calculateDistanceByPlaceId for
 * actual driving distance via the Google Maps Distance Matrix API.
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

// ============================================================================
// DATE & TIME UTILITIES
// ============================================================================

/**
 * Check if date/time is in the future with minimum advance booking
 */
export function isValidBookingDateTime(date: string, time: string): boolean {
  const bookingDateTime = new Date(`${date}T${time}`);
  const now = new Date();
  const minBookingTime = new Date(
    now.getTime() + BOOKING_CONFIG.minAdvanceBookingHours * 60 * 60 * 1000
  );
  
  return bookingDateTime >= minBookingTime;
}

/**
 * Get minimum bookable date (today + min hours)
 */
export function getMinBookableDate(): Date {
  const now = new Date();
  return new Date(now.getTime() + BOOKING_CONFIG.minAdvanceBookingHours * 60 * 60 * 1000);
}

/**
 * Get maximum bookable date
 */
export function getMaxBookableDate(): Date {
  const now = new Date();
  return new Date(now.getTime() + BOOKING_CONFIG.maxAdvanceBookingDays * 24 * 60 * 60 * 1000);
}

/**
 * Format date for display (e.g., "Mon, Jan 22, 2026")
 */
export function formatDateForDisplay(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format time for display (e.g., "14:30")
 */
export function formatTimeForDisplay(timeString: string): string {
  return timeString;
}

// ============================================================================
// CURRENCY FORMATTING
// ============================================================================

/**
 * Format price with currency symbol
 */
export function formatPrice(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number
 */
export function isValidPhone(phone: string): boolean {
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length >= 7 && cleanPhone.length <= 15;
}

/**
 * Validate flight number format
 */
export function isValidFlightNumber(flightNumber: string): boolean {
  // Basic validation: 2 letters followed by 1-4 digits
  const flightRegex = /^[A-Z]{2}\d{1,4}$/i;
  return flightRegex.test(flightNumber.replace(/\s/g, ''));
}

// ============================================================================
// BOOKING ID GENERATION
// ============================================================================

/**
 * Generate unique booking ID
 */
export function generateBookingId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 9);
  return `RT-${timestamp}-${randomStr}`.toUpperCase();
}

/**
 * Generate confirmation number
 */
export function generateConfirmationNumber(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// ============================================================================
// STRING UTILITIES
// ============================================================================

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Format phone number with country code
 */
export function formatPhoneNumber(phone: string, countryCode: string): string {
  return `${countryCode} ${phone}`;
}

// ============================================================================
// DEBOUNCE UTILITY
// ============================================================================

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ============================================================================
// GOOGLE MAPS DISTANCE MATRIX
// ============================================================================

/**
 * Calculate the real driving distance and duration between two Google Places
 * using the Maps JavaScript API Distance Matrix Service.
 *
 * ⚠️  CLIENT-SIDE ONLY — requires the Google Maps JS API script to be loaded
 *     (window.google must exist). Only call this from inside useEffect or an
 *     event handler, never during SSR.
 *
 * Return values:
 *   result.distance.value  → metres   → divide by 1000 for km
 *   result.duration.value  → seconds  → divide by 60 for minutes
 *
 * Used by:
 *   - app/[locale]/book/page.tsx        (pre-calculates before jumping to Step 2)
 *   - components/booking/steps/BookingDetailsStep.tsx  (live calculation in Step 1)
 */
export function calculateDistanceByPlaceId(
  originPlaceId: string,
  destinationPlaceId: string
): Promise<DistanceMatrixResult> {
  return new Promise((resolve, reject) => {
    // Guard: Google Maps JS API must already be loaded in the browser
    if (
      typeof window === 'undefined' ||
      !window.google?.maps?.DistanceMatrixService
    ) {
      reject(
        new Error(
          'Google Maps JavaScript API is not loaded. ' +
          'Ensure the Maps script tag is present before calling this function.'
        )
      );
      return;
    }

    const service = new window.google.maps.DistanceMatrixService();

    service.getDistanceMatrix(
      {
        origins:      [{ placeId: originPlaceId }],
        destinations: [{ placeId: destinationPlaceId }],
        travelMode:   window.google.maps.TravelMode.DRIVING,
        unitSystem:   window.google.maps.UnitSystem.METRIC,
      },
      (response, status) => {
        if (status !== 'OK' || !response) {
          reject(new Error(`Distance Matrix API returned status: ${status}`));
          return;
        }

        const element = response.rows[0]?.elements[0];

        if (!element || element.status !== 'OK') {
          reject(
            new Error(
              `No driving route found between the selected locations ` +
              `(element status: ${element?.status ?? 'UNKNOWN'})`
            )
          );
          return;
        }

        resolve({
          distance: element.distance, // e.g. { text: "25.3 km", value: 25300 }
          duration: element.duration, // e.g. { text: "32 mins", value: 1920 }
        });
      }
    );
  });
}