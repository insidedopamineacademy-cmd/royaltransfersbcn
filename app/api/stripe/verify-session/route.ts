/**
 * Stripe Session Verification API Route
 * GET /api/stripe/verify-session?session_id=xxx
 * 
 * Verifies payment status after Stripe redirect
 * Fetches booking from database
 */

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/config';
import { getBookingByStripeSessionId } from '@/lib/database/booking';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface VerifySessionResponse {
  success: boolean;
  paymentStatus?: 'paid' | 'unpaid' | 'processing';
  bookingDetails?: {
    bookingId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    serviceType: string;
    pickupAddress: string;
    dropoffAddress: string;
    pickupDate: string;
    pickupTime: string;
    vehicleName: string;
    passengers: number;
    luggage: number;
    flightNumber?: string;
    totalPrice: number;
    currency: string;
  };
  error?: string;
}

// ============================================================================
// API ROUTE HANDLER
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // Get session_id from query params
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('session_id');

    // Validate session_id
    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: 'No session_id provided',
        } as VerifySessionResponse,
        { status: 400 }
      );
    }

    // Validate session_id format
    if (!sessionId.startsWith('cs_')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid session_id format',
        } as VerifySessionResponse,
        { status: 400 }
      );
    }

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent'],
    });

    // Check if session exists
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: 'Session not found',
        } as VerifySessionResponse,
        { status: 404 }
      );
    }

    // Extract payment status from Stripe
    const paymentStatus = session.payment_status as 'paid' | 'unpaid' | 'no_payment_required';

    // Fetch booking from database
    const booking = await getBookingByStripeSessionId(sessionId);

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          error: 'Booking not found in database',
        } as VerifySessionResponse,
        { status: 404 }
      );
    }

    // Format booking details for response
    const bookingDetails = {
      bookingId: booking.booking_id,
      customerName: `${booking.customer_first_name} ${booking.customer_last_name}`,
      customerEmail: booking.customer_email,
      customerPhone: `${booking.customer_country_code} ${booking.customer_phone}`,
      serviceType: booking.service_type,
      pickupAddress: booking.pickup_address,
      dropoffAddress: booking.dropoff_address,
      pickupDate: booking.pickup_date.toISOString().split('T')[0], // Format as YYYY-MM-DD
      pickupTime: booking.pickup_time,
      vehicleName: booking.vehicle_name,
      passengers: booking.passengers_count,
      luggage: booking.luggage_count,
      flightNumber: booking.flight_number || undefined,
      totalPrice: Number(booking.total_price),
      currency: booking.currency,
    };

    // Map payment status
    let mappedPaymentStatus: 'paid' | 'unpaid' | 'processing' = 'processing';
    if (paymentStatus === 'paid' || paymentStatus === 'no_payment_required') {
      mappedPaymentStatus = 'paid';
    } else if (paymentStatus === 'unpaid') {
      mappedPaymentStatus = 'unpaid';
    }

    // Return verification result
    return NextResponse.json(
      {
        success: true,
        paymentStatus: mappedPaymentStatus,
        bookingDetails,
      } as VerifySessionResponse,
      { status: 200 }
    );

  } catch (error) {
    console.error('❌ Error verifying Stripe session:', error);
    
    // Handle Stripe-specific errors
    if (error instanceof Error) {
      // Check if it's a Stripe "resource not found" error
      if (error.message.includes('No such checkout.session')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Session not found or expired',
          } as VerifySessionResponse,
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Failed to verify session',
        } as VerifySessionResponse,
        { status: 500 }
      );
    }

    // Handle unknown errors
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred',
      } as VerifySessionResponse,
      { status: 500 }
    );
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export type { VerifySessionResponse };
