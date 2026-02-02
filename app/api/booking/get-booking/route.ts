/**
 * Get Booking by ID API Route
 * GET /api/booking/get-booking?booking_id=xxx
 * 
 * Fetches booking details from database
 * Used for cash payments success page
 */

import { NextRequest, NextResponse } from 'next/server';
import { getBookingById } from '@/lib/database/booking';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface GetBookingResponse {
  success: boolean;
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
    // Get booking_id from query params
    const searchParams = request.nextUrl.searchParams;
    const bookingId = searchParams.get('booking_id');

    // Validate booking_id
    if (!bookingId) {
      return NextResponse.json(
        {
          success: false,
          error: 'No booking_id provided',
        } as GetBookingResponse,
        { status: 400 }
      );
    }

    // Fetch booking from database
    const booking = await getBookingById(bookingId);

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          error: 'Booking not found',
        } as GetBookingResponse,
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

    // Return booking details
    return NextResponse.json(
      {
        success: true,
        bookingDetails,
      } as GetBookingResponse,
      { status: 200 }
    );

  } catch (error) {
    console.error('❌ Error fetching booking:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Failed to fetch booking',
        } as GetBookingResponse,
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred',
      } as GetBookingResponse,
      { status: 500 }
    );
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export type { GetBookingResponse };