/**
 * Database Helper Functions for Bookings
 * Handles all database operations for the bookings table
 */

import { sql } from '@vercel/postgres';
import type { BookingData } from '@/lib/booking/types';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface DatabaseBooking {
  id: number;
  booking_id: string;
  payment_method: 'card' | 'cash';
  payment_status: 'paid' | 'pending' | 'cancelled' | 'refunded';
  stripe_session_id?: string;
  stripe_payment_intent_id?: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_phone: string;
  customer_country_code: string;
  service_type: string;
  pickup_address: string;
  dropoff_address: string;
  pickup_date: Date;
  pickup_time: string;
  pickup_lat?: number;
  pickup_lng?: number;
  dropoff_lat?: number;
  dropoff_lng?: number;
  distance_km?: number;
  duration_minutes?: number;
  vehicle_name: string;
  vehicle_category: string;
  passengers_count: number;
  luggage_count: number;
  child_seats_count: number;
  base_price: number;
  distance_charge: number;
  airport_fee: number;
  child_seats_charge: number;
  total_price: number;
  currency: string;
  flight_number?: string;
  special_requests?: string;
  booking_status: 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  created_at: Date;
  updated_at: Date;
}

export interface SaveBookingInput {
  bookingId: string;
  paymentMethod: 'card' | 'cash';
  paymentStatus: 'paid' | 'pending';
  stripeSessionId?: string;
  bookingData: BookingData;
}

// ============================================================================
// SAVE BOOKING
// ============================================================================

/**
 * Save a new booking to the database
 */
export async function saveBooking(input: SaveBookingInput): Promise<DatabaseBooking> {
  const { bookingId, paymentMethod, paymentStatus, stripeSessionId, bookingData } = input;

  try {
    const result = await sql<DatabaseBooking>`
      INSERT INTO bookings (
        booking_id,
        payment_method,
        payment_status,
        stripe_session_id,
        customer_first_name,
        customer_last_name,
        customer_email,
        customer_phone,
        customer_country_code,
        service_type,
        pickup_address,
        dropoff_address,
        pickup_date,
        pickup_time,
        pickup_lat,
        pickup_lng,
        dropoff_lat,
        dropoff_lng,
        distance_km,
        duration_minutes,
        vehicle_name,
        vehicle_category,
        passengers_count,
        luggage_count,
        child_seats_count,
        base_price,
        distance_charge,
        airport_fee,
        child_seats_charge,
        total_price,
        currency,
        flight_number,
        special_requests,
        booking_status
      ) VALUES (
        ${bookingId},
        ${paymentMethod},
        ${paymentStatus},
        ${stripeSessionId || null},
        ${bookingData.passengerDetails.firstName},
        ${bookingData.passengerDetails.lastName},
        ${bookingData.passengerDetails.email},
        ${bookingData.passengerDetails.phone},
        ${bookingData.passengerDetails.countryCode},
        ${bookingData.serviceType || 'airport'},
        ${bookingData.pickup.address},
        ${bookingData.dropoff?.address ?? ''},
        ${bookingData.dateTime.date},
        ${bookingData.dateTime.time},
        ${bookingData.pickup.lat || null},
        ${bookingData.pickup.lng || null},
        ${bookingData.dropoff?.lat ?? null},
        ${bookingData.dropoff?.lng ?? null},
        ${bookingData.distance || null},
        ${bookingData.duration ? Math.round(bookingData.duration) : null},
        ${bookingData.selectedVehicle?.name || 'Unknown'},
        ${bookingData.selectedVehicle?.category || 'standard'},
        ${bookingData.passengers.count},
        ${bookingData.passengers.luggage},
        ${bookingData.passengers.childSeats},
        ${bookingData.pricing?.basePrice || 0},
        ${bookingData.pricing?.distanceCharge || 0},
        ${bookingData.pricing?.airportFee || 0},
        ${bookingData.pricing?.childSeatsCharge || 0},
        ${bookingData.pricing?.total || 0},
        ${'EUR'},
        ${bookingData.passengerDetails.flightNumber || null},
        ${bookingData.passengerDetails.specialRequests || null},
        ${'confirmed'}
      )
      RETURNING *;
    `;

    if (result.rows.length === 0) {
      throw new Error('Failed to save booking - no rows returned');
    }

    console.log('✅ Booking saved to database:', bookingId);
    return result.rows[0];
  } catch (error) {
    console.error('❌ Error saving booking to database:', error);
    throw new Error(`Failed to save booking: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ============================================================================
// GET BOOKING BY ID
// ============================================================================

/**
 * Get a booking by its booking_id
 */
export async function getBookingById(bookingId: string): Promise<DatabaseBooking | null> {
  try {
    const result = await sql<DatabaseBooking>`
      SELECT * FROM bookings
      WHERE booking_id = ${bookingId}
      LIMIT 1;
    `;

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  } catch (error) {
    console.error('❌ Error fetching booking:', error);
    throw new Error(`Failed to fetch booking: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ============================================================================
// GET BOOKING BY STRIPE SESSION ID
// ============================================================================

/**
 * Get a booking by Stripe session ID
 */
export async function getBookingByStripeSessionId(sessionId: string): Promise<DatabaseBooking | null> {
  try {
    const result = await sql<DatabaseBooking>`
      SELECT * FROM bookings
      WHERE stripe_session_id = ${sessionId}
      LIMIT 1;
    `;

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  } catch (error) {
    console.error('❌ Error fetching booking by session ID:', error);
    throw new Error(`Failed to fetch booking: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ============================================================================
// UPDATE BOOKING STATUS
// ============================================================================

/**
 * Update booking payment status (e.g., after Stripe webhook confirms payment)
 */
export async function updateBookingPaymentStatus(
  bookingId: string,
  paymentStatus: 'paid' | 'pending' | 'cancelled' | 'refunded',
  stripePaymentIntentId?: string
): Promise<DatabaseBooking> {
  try {
    const result = await sql<DatabaseBooking>`
      UPDATE bookings
      SET 
        payment_status = ${paymentStatus},
        stripe_payment_intent_id = ${stripePaymentIntentId || null},
        updated_at = CURRENT_TIMESTAMP
      WHERE booking_id = ${bookingId}
      RETURNING *;
    `;

    if (result.rows.length === 0) {
      throw new Error(`Booking not found: ${bookingId}`);
    }

    console.log(`✅ Updated booking ${bookingId} payment status to: ${paymentStatus}`);
    return result.rows[0];
  } catch (error) {
    console.error('❌ Error updating booking status:', error);
    throw new Error(`Failed to update booking: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Update booking status (e.g., confirmed → in_progress → completed)
 */
export async function updateBookingStatus(
  bookingId: string,
  bookingStatus: 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
): Promise<DatabaseBooking> {
  try {
    const result = await sql<DatabaseBooking>`
      UPDATE bookings
      SET 
        booking_status = ${bookingStatus},
        updated_at = CURRENT_TIMESTAMP
      WHERE booking_id = ${bookingId}
      RETURNING *;
    `;

    if (result.rows.length === 0) {
      throw new Error(`Booking not found: ${bookingId}`);
    }

    console.log(`✅ Updated booking ${bookingId} status to: ${bookingStatus}`);
    return result.rows[0];
  } catch (error) {
    console.error('❌ Error updating booking status:', error);
    throw new Error(`Failed to update booking: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ============================================================================
// GET BOOKINGS BY EMAIL
// ============================================================================

/**
 * Get all bookings for a customer by email
 */
export async function getBookingsByEmail(email: string): Promise<DatabaseBooking[]> {
  try {
    const result = await sql<DatabaseBooking>`
      SELECT * FROM bookings
      WHERE customer_email = ${email}
      ORDER BY pickup_date DESC, pickup_time DESC;
    `;

    return result.rows;
  } catch (error) {
    console.error('❌ Error fetching bookings by email:', error);
    throw new Error(`Failed to fetch bookings: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ============================================================================
// GET TODAY'S BOOKINGS (Admin Dashboard)
// ============================================================================

/**
 * Get all bookings for today (useful for admin dashboard)
 */
export async function getTodaysBookings(): Promise<DatabaseBooking[]> {
  try {
    const result = await sql<DatabaseBooking>`
      SELECT * FROM bookings
      WHERE pickup_date = CURRENT_DATE
      ORDER BY pickup_time ASC;
    `;

    return result.rows;
  } catch (error) {
    console.error('❌ Error fetching today\'s bookings:', error);
    throw new Error(`Failed to fetch bookings: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ============================================================================
// GET ALL BOOKINGS (Admin Dashboard)
// ============================================================================

/**
 * Get all bookings with optional filters
 */
export async function getAllBookings(): Promise<DatabaseBooking[]> {
  try {
    const result = await sql<DatabaseBooking>`
      SELECT * FROM bookings
      ORDER BY pickup_date DESC, pickup_time DESC;
    `;
    return result.rows;
  } catch (error) {
    console.error('❌ Error fetching all bookings:', error);
    throw new Error(`Failed to fetch bookings: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
