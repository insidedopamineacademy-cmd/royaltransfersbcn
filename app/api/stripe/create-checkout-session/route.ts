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
import { saveBooking } from '@/lib/database/booking';

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
  bookingId?: string;
  error?: string;
}

// ============================================================================
// API ROUTE HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateCheckoutRequest;
    const { bookingData, locale } = body;

    const validation = validateBookingData(bookingData);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.error } as CreateCheckoutResponse,
        { status: 400 }
      );
    }

    const bookingId = generateBookingId();

    // Recalculate price server-side (NEVER trust client prices)
    const pricing = calculatePrice(bookingData, bookingData.distance);

    if (!pricing || pricing.total <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid pricing calculation' } as CreateCheckoutResponse,
        { status: 400 }
      );
    }

    const origin =
      request.headers.get('origin') ||
      request.headers.get('referer')?.split('/').slice(0, 3).join('/') ||
      'http://localhost:3000';

    console.log('🔗 Using origin for Stripe redirects:', origin);

    // ------------------------------------------------------------------------
    // ✅ SAFE PRODUCT NAME (dropoff optional for hourly)
    // ------------------------------------------------------------------------
    const isDistance = bookingData.serviceType === 'distance';
    const pickupLabel = bookingData.pickup?.address ?? 'Pickup';
    const dropoffLabel = bookingData.dropoff?.address ?? 'Dropoff';

    const productName = isDistance
      ? `Transfer Service: ${pickupLabel} → ${dropoffLabel}`
      : `Hourly Service: ${pickupLabel}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: STRIPE_CONFIG.mode,
      currency: STRIPE_CONFIG.currency,

      line_items: [
        {
          price_data: {
            currency: STRIPE_CONFIG.currency,
            product_data: {
              name: productName,
              description: buildServiceDescription(bookingData),
              images: [],
            },
            unit_amount: eurosToCents(pricing.total),
          },
          quantity: 1,
        },
      ],

      success_url: `${origin}/${locale}/book/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/${locale}/book?step=3&cancelled=true`,

      customer_email: bookingData.passengerDetails.email,

      billing_address_collection: STRIPE_CONFIG.billingAddressCollection,
      customer_creation: STRIPE_CONFIG.customerCreation,
      locale: mapLocaleToStripe(locale),
      expires_at: Math.floor(Date.now() / 1000) + STRIPE_CONFIG.expiresAfter,

      // ✅ SAFE METADATA (dropoff optional)
      metadata: buildMetadata(bookingData, bookingId, pricing.total),

      phone_number_collection: { enabled: true },
    });

    console.log('✅ Stripe session created:', session.id);
    console.log('   Redirect URL:', session.url);

    try {
      await saveBooking({
        bookingId,
        paymentMethod: 'card',
        paymentStatus: 'pending',
        stripeSessionId: session.id,
        bookingData: {
          ...bookingData,
          pricing,
        },
      });

      console.log('✅ Booking saved to database:', bookingId);
    } catch (dbError) {
      console.error('❌ Failed to save booking to database:', dbError);
      console.error('   Error details:', dbError instanceof Error ? dbError.message : 'Unknown error');
      // Don't block checkout session if DB save fails
    }

    return NextResponse.json(
      {
        success: true,
        sessionId: session.id,
        url: session.url,
        bookingId,
      } as CreateCheckoutResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error creating Stripe checkout session:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message || 'Failed to create checkout session' } as CreateCheckoutResponse,
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please try again.' } as CreateCheckoutResponse,
      { status: 500 }
    );
  }
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

function validateBookingData(bookingData: BookingData): { isValid: boolean; error?: string } {
  if (!bookingData.selectedVehicle) {
    return { isValid: false, error: 'No vehicle selected' };
  }

  if (!bookingData.pickup?.address) {
    return { isValid: false, error: 'Pickup address is required' };
  }

  // ✅ Only require dropoff for distance service
  if (bookingData.serviceType === 'distance' && !bookingData.dropoff?.address) {
    return { isValid: false, error: 'Pickup and dropoff addresses are required' };
  }

  if (!bookingData.dateTime?.date || !bookingData.dateTime?.time) {
    return { isValid: false, error: 'Date and time are required' };
  }

  if (!bookingData.passengerDetails?.firstName || !bookingData.passengerDetails?.lastName) {
    return { isValid: false, error: 'Passenger name is required' };
  }

  if (!bookingData.passengerDetails?.email) {
    return { isValid: false, error: 'Email is required' };
  }

  if (!bookingData.passengerDetails?.phone) {
    return { isValid: false, error: 'Phone number is required' };
  }

  if (bookingData.passengers?.count < 1) {
    return { isValid: false, error: 'At least one passenger is required' };
  }

  return { isValid: true };
}

// ============================================================================
// METADATA BUILDERS
// ============================================================================

function buildMetadata(bookingData: BookingData, bookingId: string, totalPrice: number): Record<string, string> {
  const dropoffAddress = bookingData.dropoff?.address ?? '';

  return {
    [METADATA_KEYS.BOOKING_ID]: bookingId,
    [METADATA_KEYS.CUSTOMER_NAME]: `${bookingData.passengerDetails.firstName} ${bookingData.passengerDetails.lastName}`,
    [METADATA_KEYS.CUSTOMER_EMAIL]: bookingData.passengerDetails.email,
    [METADATA_KEYS.CUSTOMER_PHONE]: `${bookingData.passengerDetails.countryCode}${bookingData.passengerDetails.phone}`,
    [METADATA_KEYS.SERVICE_TYPE]: bookingData.serviceType || 'airport',
    [METADATA_KEYS.PICKUP_ADDRESS]: bookingData.pickup.address,
    // ✅ Safe
    [METADATA_KEYS.DROPOFF_ADDRESS]: dropoffAddress,
    [METADATA_KEYS.PICKUP_DATE]: bookingData.dateTime.date,
    [METADATA_KEYS.PICKUP_TIME]: bookingData.dateTime.time,
    [METADATA_KEYS.VEHICLE_NAME]: bookingData.selectedVehicle?.name || 'Unknown',
    [METADATA_KEYS.PASSENGERS]: bookingData.passengers.count.toString(),
    [METADATA_KEYS.LUGGAGE]: bookingData.passengers.luggage.toString(),
    [METADATA_KEYS.FLIGHT_NUMBER]: bookingData.passengerDetails.flightNumber || '',
    totalPrice: totalPrice.toString(),
    currency: 'EUR',
    environment: process.env.NODE_ENV || 'development',
  };
}

function buildServiceDescription(bookingData: BookingData): string {
  const parts: string[] = [];

  if (bookingData.selectedVehicle) parts.push(`Vehicle: ${bookingData.selectedVehicle.name}`);

  parts.push(`Date: ${bookingData.dateTime.date} at ${bookingData.dateTime.time}`);

  parts.push(`Passengers: ${bookingData.passengers.count}`);

  if (bookingData.passengers.luggage > 0) parts.push(`Luggage: ${bookingData.passengers.luggage}`);

  if (typeof bookingData.distance === 'number') parts.push(`Distance: ${bookingData.distance.toFixed(1)} km`);

  if (bookingData.passengerDetails.flightNumber) parts.push(`Flight: ${bookingData.passengerDetails.flightNumber}`);

  return parts.join(' | ');
}

// ============================================================================
// LOCALE MAPPING
// ============================================================================

function mapLocaleToStripe(locale: string): 'auto' | 'en' | 'es' | 'de' | 'it' | 'fr' | 'pt' | 'nl' {
  const localeMap: Record<string, 'auto' | 'en' | 'es' | 'de' | 'it' | 'fr' | 'pt' | 'nl'> = {
    en: 'en',
    es: 'es',
    de: 'de',
    it: 'it',
    fr: 'fr',
    pt: 'pt',
    nl: 'nl',
  };

  return localeMap[locale] || 'auto';
}

// ============================================================================
// EXPORTS
// ============================================================================

export type { CreateCheckoutRequest, CreateCheckoutResponse };