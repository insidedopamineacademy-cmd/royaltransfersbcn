/**
 * Booking System Constants
 * Vehicle data, pricing rules, and configuration
 */

import type { Vehicle, PricingRules, ServiceTypeOption, ChildSeat } from './types';

// ============================================================================
// SERVICE TYPE OPTIONS
// ============================================================================

export const SERVICE_TYPES: ServiceTypeOption[] = [
  {
    id: 'airport',
    nameKey: 'booking.serviceType.airport',
    descriptionKey: 'booking.serviceType.airportDesc',
    icon: 'plane',
  },
  {
    id: 'cityToCity',
    nameKey: 'booking.serviceType.cityToCity',
    descriptionKey: 'booking.serviceType.cityToCityDesc',
    icon: 'map',
  },
  {
    id: 'hourly',
    nameKey: 'booking.serviceType.hourly',
    descriptionKey: 'booking.serviceType.hourlyDesc',
    icon: 'clock',
  },
];

// ============================================================================
// VEHICLE FLEET DATA
// ============================================================================

export const VEHICLES: Vehicle[] = [
  {
    id: 'tesla-model-3',
    category: 'standard',
    name: 'Tesla Model 3',
    description: 'Eco-luxury sedan for comfortable city transfers',
    image: '/vehicles/tesla-model-3.jpg',
    capacity: {
      passengers: 3,
      luggage: 2,
    },
    features: [
      '100% Electric',
      'Premium leather seats',
      'Climate control',
      'On-board navigation',
    ],
    basePrice: 35,
    pricePerKm: 1.2,
    pricePerHour: 45,
  },
  {
    id: 'toyota-prius',
    category: 'standard',
    name: 'Toyota Prius+',
    description: 'Efficient hybrid sedan for reliable transfers',
    image: '/vehicles/toyota-prius.jpg',
    capacity: {
      passengers: 4,
      luggage: 3,
    },
    features: [
      'Hybrid engine',
      'Fuel-efficient',
      'Air-conditioned',
      'Charging ports',
    ],
    basePrice: 33,
    pricePerKm: 1.0,
    pricePerHour: 40,
  },
  {
    id: 'mercedes-e-class',
    category: 'luxury-sedan',
    name: 'Mercedes E-Class',
    description: 'Business-class sedan for executive travel',
    image: '/vehicles/mercedes-e-class.jpg',
    capacity: {
      passengers: 3,
      luggage: 2,
    },
    features: [
      'Executive seating',
      'Climate control',
      'Quiet cabin',
      'Ambient lighting',
    ],
    basePrice: 55,
    pricePerKm: 1.8,
    pricePerHour: 70,
  },
  {
    id: 'bmw-5-series',
    category: 'luxury-sedan',
    name: 'BMW 5 Series',
    description: 'Dynamic elegance for premium transfers',
    image: '/vehicles/bmw-5-series.jpg',
    capacity: {
      passengers: 3,
      luggage: 2,
    },
    features: [
      'Luxury seating',
      'Premium sound',
      'Smooth ride',
      'Advanced comfort',
    ],
    basePrice: 55,
    pricePerKm: 1.8,
    pricePerHour: 70,
  },
  {
    id: 'mercedes-s-class',
    category: 'luxury-sedan',
    name: 'Mercedes S-Class',
    description: 'Flagship luxury for VIP transfers',
    image: '/vehicles/mercedes-s-class.jpg',
    capacity: {
      passengers: 3,
      luggage: 2,
    },
    features: [
      'First-class seating',
      'Ultra-quiet cabin',
      'Massage seats',
      'Burmester sound',
    ],
    basePrice: 103,
    pricePerKm: 2.5,
    pricePerHour: 120,
  },
  {
    id: 'mercedes-vito',
    category: '8-seater-van',
    name: 'Mercedes Vito',
    description: 'Spacious van for group travel',
    image: '/vehicles/mercedes-vito.jpg',
    capacity: {
      passengers: 8,
      luggage: 8,
    },
    features: [
      '8 passenger seats',
      'Large luggage space',
      'Dual-zone AC',
      'Comfortable ride',
    ],
    basePrice: 75,
    pricePerKm: 1.5,
    pricePerHour: 85,
  },
  {
    id: 'ford-tourneo',
    category: '8-seater-van',
    name: 'Ford Tourneo Custom',
    description: 'Modern 8-seater for families and groups',
    image: '/vehicles/ford-tourneo.jpg',
    capacity: {
      passengers: 8,
      luggage: 7,
    },
    features: [
      '8 full-size seats',
      'Apple CarPlay',
      'Rear climate control',
      'Ambient lighting',
    ],
    basePrice: 73,
    pricePerKm: 1.4,
    pricePerHour: 82,
  },
  {
    id: 'mercedes-v-class',
    category: 'luxury-van',
    name: 'Mercedes V-Class',
    description: 'Luxury chauffeur van for VIP groups',
    image: '/vehicles/mercedes-v-class.jpg',
    capacity: {
      passengers: 7,
      luggage: 7,
    },
    features: [
      'Premium interiors',
      'Privacy glass',
      'Wi-Fi on board',
      'Leather seats',
    ],
    basePrice: 95,
    pricePerKm: 2.0,
    pricePerHour: 110,
  },
];

// ============================================================================
// PRICING RULES
// ============================================================================

export const PRICING_RULES: PricingRules = {
  baseRates: {
    // Step 2 vehicle categories (current)
    'standard-sedan': 35,
    'premium-sedan': 55,
    'standard-minivan-7': 75,
    'executive-minivan': 95,
    'standard-minivan-8': 85,
    
    // Legacy categories (for backwards compatibility)
    'standard': 33,
    'luxury-sedan': 55,
    '8-seater-van': 73,
    'luxury-van': 95,
  },
  perKmRate: {
    // Step 2 vehicle categories (current)
    'standard-sedan': 1.2,
    'premium-sedan': 1.5,
    'standard-minivan-7': 1.8,
    'executive-minivan': 2.0,
    'standard-minivan-8': 1.9,
    
    // Legacy categories (for backwards compatibility)
    'standard': 1.0,
    'luxury-sedan': 1.8,
    '8-seater-van': 1.4,
    'luxury-van': 2.0,
  },
  perHourRate: {
    // Step 2 vehicle categories (current)
    'standard-sedan': 45,
    'premium-sedan': 60,
    'standard-minivan-7': 75,
    'executive-minivan': 90,
    'standard-minivan-8': 80,
    
    // Legacy categories (for backwards compatibility)
    'standard': 40,
    'luxury-sedan': 70,
    '8-seater-van': 82,
    'luxury-van': 110,
  },
  airportFee: 5,
  meetAndGreetFee: 15,
  childSeatFee: 5, // per seat
  additionalStopFee: 10,
  taxRate: 21, // 21% VAT in Spain
};

// ============================================================================
// CHILD SEAT OPTIONS
// ============================================================================

export const CHILD_SEAT_OPTIONS: ChildSeat[] = [
  {
    type: 'infant',
    ageRange: '0-12 months',
    count: 0,
  },
  {
    type: 'toddler',
    ageRange: '1-4 years',
    count: 0,
  },
  {
    type: 'booster',
    ageRange: '4-12 years',
    count: 0,
  },
];

// ============================================================================
// CONFIGURATION
// ============================================================================

export const BOOKING_CONFIG = {
  // Minimum advance booking time (in hours)
  minAdvanceBookingHours: 2,
  
  // Maximum advance booking time (in days)
  maxAdvanceBookingDays: 365,
  
  // Free waiting time at airport (in minutes)
  freeAirportWaitingTime: 60,
  
  // Free waiting time for other pickups (in minutes)
  freeStandardWaitingTime: 15,
  
  // Maximum passengers per vehicle type
  maxPassengers: {
    'standard': 4,
    'luxury-sedan': 3,
    '8-seater-van': 8,
    'luxury-van': 7,
  },
  
  // Barcelona airport code
  airportCode: 'BCN',
  
  // Default currency
  currency: 'EUR',
  
  // Distance calculation
  distanceUnit: 'km',
  
  // Hourly service options (in hours)
  hourlyServiceOptions: [3, 4, 6, 8],
  
  // Free cancellation period (in hours before pickup)
  freeCancellationHours: 24,
};

// ============================================================================
// BARCELONA LANDMARKS (for quick search)
// ============================================================================

export const BARCELONA_LANDMARKS = [
  {
    name: 'Barcelona Airport (BCN)',
    placeId: 'ChIJpTvG15DKNRIRRKgKBtGBAAQ',
    type: 'airport' as const,
  },
  {
    name: 'Sagrada Família',
    placeId: 'ChIJi-TJCdKipBIR8TvkiDgvPBE',
    type: 'poi' as const,
  },
  {
    name: 'Park Güell',
    placeId: 'ChIJfbKKBd2ipBIRNqKuK7RqUaw',
    type: 'poi' as const,
  },
  {
    name: 'Camp Nou',
    placeId: 'ChIJT4oK-d2jpBIRtMXKPVLVST8',
    type: 'poi' as const,
  },
  {
    name: 'Gothic Quarter',
    placeId: 'ChIJU5JkmPmipBIRW1Pznd5xPv4',
    type: 'poi' as const,
  },
  {
    name: 'Barcelona Cruise Port',
    placeId: 'ChIJR1LB_-WipBIRX12uNkjn5zQ',
    type: 'cruise' as const,
  },
];

// ============================================================================
// COUNTRY CODES (for phone input)
// ============================================================================

export const COUNTRY_CODES = [
  { code: '+34', country: 'Spain', flag: '🇪🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+39', country: 'Italy', flag: '🇮🇹' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+1', country: 'USA', flag: '🇺🇸' },
  { code: '+92', country: 'Pakistan', flag: '🇵🇰' },
];

// ============================================================================
// VALIDATION CONSTANTS
// ============================================================================

export const VALIDATION = {
  minPassengers: 1,
  maxPassengers: 8,
  minLuggage: 0,
  maxLuggage: 15,
  minChildSeats: 0,
  maxChildSeats: 3,
  phoneMinLength: 7,
  phoneMaxLength: 15,
  flightNumberMinLength: 4,
  flightNumberMaxLength: 10,
};
