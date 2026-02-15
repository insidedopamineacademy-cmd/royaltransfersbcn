/**
 * Booking System Types
 * Core TypeScript interfaces for the Royal Transfers booking system
 *
 * ✅ Updated to align with the new canonical service model:
 *    - serviceType: 'distance' | 'hourly'
 *    - transferType: 'oneWay' | 'return' (distance only)
 *    - dropoff is OPTIONAL (hourly may not have dropoff)
 *    - DateTime includes optional returnDate/returnTime
 *    - BookingData includes hourlyDuration
 *    - Added safe default helpers (EMPTY_LOCATION, etc.)
 */

// ============================================================================
// SERVICE TYPES
// ============================================================================

export type ServiceType = 'distance' | 'hourly';

export interface ServiceTypeOption {
  id: ServiceType;
  nameKey: string;
  descriptionKey: string;
  icon: string;
}

// ============================================================================
// LOCATION TYPES
// ============================================================================

export type LocationType = 'airport' | 'hotel' | 'cruise' | 'address' | 'poi';

export interface Location {
  address: string;
  placeId?: string;
  lat?: number;
  lng?: number;
  type?: LocationType;
  city?: string;
  country?: string;
}

export interface LocationSuggestion {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
  types: string[];
}

// Helpful defaults for “clear/reset” operations in UI/context
export const EMPTY_LOCATION: Location = { address: '' };

// ============================================================================
// DATE & TIME TYPES
// ============================================================================

export interface DateTime {
  date: string; // YYYY-MM-DD format
  time: string; // HH:MM format (24-hour)
  timezone?: string;

  // Return journey fields (only when transferType === 'return')
  returnDate?: string; // YYYY-MM-DD
  returnTime?: string; // HH:MM
}

export const DEFAULT_DATE_TIME: DateTime = {
  date: '',
  time: '',
};

// ============================================================================
// PASSENGER & LUGGAGE TYPES
// ============================================================================

export interface PassengerInfo {
  count: number;
  luggage: number;
  childSeats: number;
  childSeatTypes?: ChildSeatType[];
}

export type ChildSeatType = 'infant' | 'toddler' | 'booster';

export interface ChildSeat {
  type: ChildSeatType;
  ageRange: string;
  count: number;
}

export const DEFAULT_PASSENGERS: PassengerInfo = {
  count: 1,
  luggage: 0,
  childSeats: 0,
};

// ============================================================================
// VEHICLE TYPES
// ============================================================================

export type VehicleCategory =
  | 'standard-sedan'
  | 'premium-sedan'
  | 'standard-minivan-7'
  | 'executive-minivan'
  | 'standard-minivan-8'
  | 'standard'
  | 'luxury-sedan'
  | '8-seater-van'
  | 'luxury-van';

export interface Vehicle {
  id: string;
  category: VehicleCategory;
  name: string;
  description: string;
  image: string;
  capacity: {
    passengers: number;
    luggage: number;
  };
  features: string[];
  basePrice: number;
  pricePerKm?: number;
  pricePerHour?: number;
}

// ============================================================================
// PASSENGER DETAILS TYPES
// ============================================================================

export interface PassengerDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;
  flightNumber?: string;
  airline?: string;
  specialRequests?: string;
}

// ============================================================================
// EXTRAS & ADD-ONS TYPES
// ============================================================================

export interface Extras {
  meetAndGreet: boolean;
  waitingTime: number; // in minutes
  additionalStops: AdditionalStop[];
  specialRequests?: string;
}

export interface AdditionalStop {
  address: string;
  placeId?: string;
  duration: number; // estimated stop duration in minutes
}

// ============================================================================
// PRICING TYPES
// ============================================================================

export interface PriceBreakdown {
  basePrice: number;
  distanceCharge: number;
  timeCharge: number;
  extraStopsCharge: number;
  meetAndGreetCharge: number;
  childSeatsCharge: number;
  airportFee: number;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
}

export interface PricingRules {
  baseRates: {
    [key in VehicleCategory]: number;
  };
  perKmRate: {
    [key in VehicleCategory]: number;
  };
  perHourRate: {
    [key in VehicleCategory]: number;
  };
  airportFee: number;
  meetAndGreetFee: number;
  childSeatFee: number;
  additionalStopFee: number;
  taxRate: number; // percentage
}

// ============================================================================
// PAYMENT TYPES
// ============================================================================

export type PaymentMethod = 'cash' | 'card';

// Transfer type for distance-based bookings
export type TransferType = 'oneWay' | 'return';

// Detailed payment information (for Stripe integration)
export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  clientSecret?: string;
}

export interface PaymentMethodDetails {
  type: 'card' | 'paypal' | 'bank_transfer';
  last4?: string;
  brand?: string;
}

export interface PaymentDetails {
  paymentIntent: PaymentIntent;
  paymentMethod: PaymentMethodDetails;
}

export const DEFAULT_PAYMENT_METHOD: PaymentMethod = 'cash';

// ============================================================================
// BOOKING DATA TYPES
// ============================================================================

export interface BookingData {
  // Step 1: Service Type & Ride Details
  serviceType: ServiceType | null;

  /**
   * Transfer type for distance-based bookings only.
   * For hourly bookings this should be undefined.
   */
  transferType?: TransferType;

  // Step 1: Locations
  pickup: Location;

  /**
   * Dropoff is required only for distance bookings.
   * Hourly bookings may omit it.
   */
  dropoff?: Location;

  /**
   * Distance (km) and duration (min) calculated for distance bookings only.
   */
  distance?: number;
  duration?: number;

  // Step 1: Date & Time
  dateTime: DateTime;

  // Step 1: Passengers & Luggage
  passengers: PassengerInfo;

  // Step 2: Vehicle Selection
  selectedVehicle: Vehicle | null;

  // Step 3: Passenger Details & Payment Method
  passengerDetails: PassengerDetails;
  paymentMethod?: PaymentMethod;

  // Step 4: Extras (optional)
  extras: Extras;

  // Pricing
  pricing: PriceBreakdown | null;

  /**
   * Hourly service duration in hours (2–24).
   * Only set when serviceType === 'hourly'
   */
  hourlyDuration?: number;

  // Metadata
  bookingId?: string;
  status?: BookingStatus;
  createdAt?: string;
  updatedAt?: string;
}

export type BookingStatus =
  | 'draft'
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled';

// ============================================================================
// WIZARD STEP TYPES
// ============================================================================

export type WizardStep =
  | 'service-type'
  | 'location'
  | 'date-time'
  | 'passengers'
  | 'vehicle'
  | 'details'
  | 'extras'
  | 'review';

export interface StepConfig {
  id: WizardStep;
  titleKey: string;
  descriptionKey?: string;
  isComplete: (data: BookingData) => boolean;
}

// ============================================================================
// FORM VALIDATION TYPES
// ============================================================================

export interface ValidationError {
  field: string;
  message: string;
}

export interface StepValidation {
  isValid: boolean;
  errors: ValidationError[];
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface BookingConfirmation {
  bookingId: string;
  confirmationNumber: string;
  status: BookingStatus;
  totalPrice: number;
  currency: string;
  estimatedPickupTime: string;
}

// ============================================================================
// GOOGLE MAPS TYPES
// ============================================================================

export interface DistanceMatrixResult {
  distance: {
    text: string;
    value: number; // in meters
  };
  duration: {
    text: string;
    value: number; // in seconds
  };
}

export interface GeocodeResult {
  address: string;
  placeId: string;
  location: {
    lat: number;
    lng: number;
  };
  types: string[];
}