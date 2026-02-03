/**
 * Stripe Checkout Session Creation API Route
 * POST /api/stripe/create-checkout-session
 * 
 * Creates a Stripe Checkout Session for booking payment
 * This is a server-side only route for security
 */

import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_CONFIG, METADATA_KEYS, eurosToCents } from '@/lib/stripe/config';
import { calculatePrice, generateBookingId } from '@/lib/booking/utils';
import type { BookingData } from '@/lib/booking/types';
import { saveBooking } from '@/lib/database/booking'; // FIXED: bookings (plural)

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface CreateCheckoutRequest {
  bookingData: BookingData;
  locale: string;
}

interface CreateCheckoutResponse {
  success: boolean;
  sessionId?: string;
  url?: string;
  bookingId?: string; // FIXED: Added bookingId
  error?: string;
}

// ============================================================================
// API ROUTE HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json() as CreateCheckoutRequest;
    const { bookingData, locale } = body;

    // Validate request
    const validation = validateBookingData(bookingData);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
        } as CreateCheckoutResponse,
        { status: 400 }
      );
    }

    // Generate unique booking ID
    const bookingId = generateBookingId();

    // Recalculate price server-side (NEVER trust client prices)
    const pricing = calculatePrice(bookingData, bookingData.distance);

    // Validate pricing
    if (!pricing || pricing.total <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid pricing calculation',
        } as CreateCheckoutResponse,
        { status: 400 }
      );
    }

    // Get origin URL for redirect URLs
    // FIXED: Hardcoded for local testing
    const origin = request.headers.get('origin') || request.headers.get('referer')?.split('/').slice(0, 3).join('/') || 'http://localhost:3000';
    console.log('🔗 Using origin for Stripe redirects:', origin);

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      // Payment configuration
      payment_method_types: ['card'],
      mode: STRIPE_CONFIG.mode,
      currency: STRIPE_CONFIG.currency,
      
      // Line items (what the customer is paying for)
      line_items: [
        {
          price_data: {
            currency: STRIPE_CONFIG.currency,
            product_data: {
              name: `Transfer Service: ${bookingData.pickup.address} → ${bookingData.dropoff.address}`,
              description: buildServiceDescription(bookingData),
              images: [], // Optional: Add vehicle image URL here
            },
            unit_amount: eurosToCents(pricing.total),
          },
          quantity: 1,
        },
      ],

      // Redirect URLs
      success_url: `${origin}/${locale}/book/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/${locale}/book?step=3&cancelled=true`,

      // Customer information
      customer_email: bookingData.passengerDetails.email,
      
      // Billing
      billing_address_collection: STRIPE_CONFIG.billingAddressCollection,
      
      // Customer creation
      customer_creation: STRIPE_CONFIG.customerCreation,

      // UI customization
      locale: mapLocaleToStripe(locale),
      
      // Session configuration
      expires_at: Math.floor(Date.now() / 1000) + STRIPE_CONFIG.expiresAfter,
      
      // Metadata (store booking details)
      metadata: buildMetadata(bookingData, bookingId, pricing.total),

      // Phone number collection (optional but useful for transfers)
      phone_number_collection: {
        enabled: true,
      },
    });

    console.log('✅ Stripe session created:', session.id);
    console.log('   Redirect URL:', session.url);

    // Save booking to database AFTER Stripe session created successfully
    try {
      await saveBooking({
        bookingId,
        paymentMethod: 'card',
        paymentStatus: 'pending', // Will be updated to 'paid' by webhook
        stripeSessionId: session.id,
        bookingData: {
          ...bookingData,
          pricing, // Use server-calculated pricing
        },
      });
      
      console.log('✅ Booking saved to database:', bookingId);
    } catch (dbError) {
      console.error('❌ Failed to save booking to database:', dbError);
      console.error('   Error details:', dbError instanceof Error ? dbError.message : 'Unknown error');
      // Still return session - booking will be recovered via webhook
      // But log this as a critical error
    }

    // Return session details
    return NextResponse.json(
      {
        success: true,
        sessionId: session.id,
        url: session.url,
        bookingId, // Return booking ID to client
      } as CreateCheckoutResponse,
      { status: 200 }
    );

  } catch (error) {
    console.error('❌ Error creating Stripe checkout session:', error);
    
    // Handle Stripe-specific errors
    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Failed to create checkout session',
        } as CreateCheckoutResponse,
        { status: 500 }
      );
    }

    // Handle unknown errors
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred. Please try again.',
      } as CreateCheckoutResponse,
      { status: 500 }
    );
  }
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate booking data before creating checkout session
 */
function validateBookingData(bookingData: BookingData): { isValid: boolean; error?: string } {
  // Check required fields
  if (!bookingData.selectedVehicle) {
    return { isValid: false, error: 'No vehicle selected' };
  }

  if (!bookingData.pickup.address || !bookingData.dropoff.address) {
    return { isValid: false, error: 'Pickup and dropoff addresses are required' };
  }

  if (!bookingData.dateTime.date || !bookingData.dateTime.time) {
    return { isValid: false, error: 'Date and time are required' };
  }

  if (!bookingData.passengerDetails.firstName || !bookingData.passengerDetails.lastName) {
    return { isValid: false, error: 'Passenger name is required' };
  }

  if (!bookingData.passengerDetails.email) {
    return { isValid: false, error: 'Email is required' };
  }

  if (!bookingData.passengerDetails.phone) {
    return { isValid: false, error: 'Phone number is required' };
  }

  // Validate passenger count
  if (bookingData.passengers.count < 1) {
    return { isValid: false, error: 'At least one passenger is required' };
  }

  return { isValid: true };
}

// ============================================================================
// METADATA BUILDERS
// ============================================================================

/**
 * Build metadata object for Stripe session
 * This data will be attached to the session and payment intent
 */
function buildMetadata(bookingData: BookingData, bookingId: string, totalPrice: number): Record<string, string> {
  return {
    [METADATA_KEYS.BOOKING_ID]: bookingId,
    [METADATA_KEYS.CUSTOMER_NAME]: `${bookingData.passengerDetails.firstName} ${bookingData.passengerDetails.lastName}`,
    [METADATA_KEYS.CUSTOMER_EMAIL]: bookingData.passengerDetails.email,
    [METADATA_KEYS.CUSTOMER_PHONE]: `${bookingData.passengerDetails.countryCode}${bookingData.passengerDetails.phone}`,
    [METADATA_KEYS.SERVICE_TYPE]: bookingData.serviceType || 'airport',
    [METADATA_KEYS.PICKUP_ADDRESS]: bookingData.pickup.address,
    [METADATA_KEYS.DROPOFF_ADDRESS]: bookingData.dropoff.address,
    [METADATA_KEYS.PICKUP_DATE]: bookingData.dateTime.date,
    [METADATA_KEYS.PICKUP_TIME]: bookingData.dateTime.time,
    [METADATA_KEYS.VEHICLE_NAME]: bookingData.selectedVehicle?.name || 'Unknown',
    [METADATA_KEYS.PASSENGERS]: bookingData.passengers.count.toString(),
    [METADATA_KEYS.LUGGAGE]: bookingData.passengers.luggage.toString(),
    [METADATA_KEYS.FLIGHT_NUMBER]: bookingData.passengerDetails.flightNumber || '',
    // Store total price for verification
    totalPrice: totalPrice.toString(),
    // Store currency
    currency: 'EUR',
    // Environment (useful for debugging)
    environment: process.env.NODE_ENV || 'development',
  };
}

/**
 * Build service description for Stripe product
 */
function buildServiceDescription(bookingData: BookingData): string {
  const parts: string[] = [];

  // Vehicle
  if (bookingData.selectedVehicle) {
    parts.push(`Vehicle: ${bookingData.selectedVehicle.name}`);
  }

  // Date and time
  parts.push(`Date: ${bookingData.dateTime.date} at ${bookingData.dateTime.time}`);

  // Passengers
  parts.push(`Passengers: ${bookingData.passengers.count}`);

  // Luggage
  if (bookingData.passengers.luggage > 0) {
    parts.push(`Luggage: ${bookingData.passengers.luggage}`);
  }

  // Distance
  if (bookingData.distance) {
    parts.push(`Distance: ${bookingData.distance.toFixed(1)} km`);
  }

  // Flight number
  if (bookingData.passengerDetails.flightNumber) {
    parts.push(`Flight: ${bookingData.passengerDetails.flightNumber}`);
  }

  return parts.join(' | ');
}

// ============================================================================
// LOCALE MAPPING
// ============================================================================

/**
 * Map Next.js locale to Stripe locale
 * Stripe supports specific locale codes
 */
function mapLocaleToStripe(locale: string): 'auto' | 'en' | 'es' | 'de' | 'it' | 'fr' | 'pt' | 'nl' {
  const localeMap: Record<string, 'auto' | 'en' | 'es' | 'de' | 'it' | 'fr' | 'pt' | 'nl'> = {
    'en': 'en',
    'es': 'es',
    'de': 'de',
    'it': 'it',
    'fr': 'fr',
    'pt': 'pt',
    'nl': 'nl',
  };

  return localeMap[locale] || 'auto';
}

// ============================================================================
// EXPORTS
// ============================================================================

export type { CreateCheckoutRequest, CreateCheckoutResponse };