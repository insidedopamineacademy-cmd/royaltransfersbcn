/**
 * Cash Booking Creation API Route
 * POST /api/booking/create-cash-booking
 * 
 * Saves booking to database for cash payments
 * No payment processing needed - customer pays driver
 */

import { NextRequest, NextResponse } from 'next/server';
import { saveBooking, getBookingById } from '@/lib/database/booking';
import { calculatePrice, generateBookingId } from '@/lib/booking/utils';
import type { BookingData } from '@/lib/booking/types';
import { sendBookingConfirmationEmail, sendAdminNotificationEmail } from '@/lib/email/sender';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface CreateCashBookingRequest {
  bookingData: BookingData;
  locale: string;
}

interface CreateCashBookingResponse {
  success: boolean;
  bookingId?: string;
  redirectUrl?: string;
  error?: string;
}

// ============================================================================
// API ROUTE HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json() as CreateCashBookingRequest;
    const { bookingData, locale } = body;

    // Validate booking data
    const validation = validateBookingData(bookingData);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
        } as CreateCashBookingResponse,
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
        } as CreateCashBookingResponse,
        { status: 400 }
      );
    }

    // Save booking to database with cash payment method
    await saveBooking({
      bookingId,
      paymentMethod: 'cash',
      paymentStatus: 'pending', // Will be marked as 'paid' after driver receives cash
      stripeSessionId: undefined, // No Stripe session for cash
      bookingData: {
        ...bookingData,
        pricing, // Use server-calculated pricing
      },
    });

    console.log('✅ Cash booking saved to database:', bookingId);

    // ✨ Send confirmation emails
    try {
      // Get the saved booking from database
      const savedBooking = await getBookingById(bookingId);
      
      if (savedBooking) {
        // Send customer confirmation email
        await sendBookingConfirmationEmail(savedBooking);
        console.log('✅ Customer confirmation email sent');

        // Send admin notification email
        await sendAdminNotificationEmail(savedBooking);
        console.log('✅ Admin notification email sent');
      }
    } catch (emailError) {
      // Don't fail the booking if email fails
      console.error('⚠️ Failed to send emails:', emailError);
      console.error('Error details:', emailError);
      if (emailError instanceof Error) {
        console.error('Error message:', emailError.message);
        console.error('Error stack:', emailError.stack);
       }
    }

    // Get origin URL for redirect
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Return success with redirect URL
    return NextResponse.json(
      {
        success: true,
        bookingId,
        redirectUrl: `${origin}/${locale}/book/success?payment=cash&booking_id=${bookingId}`,
      } as CreateCashBookingResponse,
      { status: 200 }
    );

  } catch (error) {
    console.error('❌ Error creating cash booking:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Failed to create booking',
        } as CreateCashBookingResponse,
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred. Please try again.',
      } as CreateCashBookingResponse,
      { status: 500 }
    );
  }
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate booking data before saving
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
// EXPORTS
// ============================================================================

export type { CreateCashBookingRequest, CreateCashBookingResponse };