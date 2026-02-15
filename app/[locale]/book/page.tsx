'use client';

/**
 * Booking Page
 * Main booking wizard page with state management
 *
 * UPDATED:
 *  - Reads ?step=N from URL to jump directly to a wizard step (e.g. step=2 → vehicle selection)
 *  - Calculates distance via Google Maps API BEFORE rendering Step 2 so prices are never €0
 *  - Shows a loading screen during distance calculation
 *  - Maps all new HeroBookingForm fields: returnDate, returnTime, hourlyDuration
 *  - Requires Suspense wrapper because useSearchParams() needs it in Next.js App Router
 */

import { useEffect, useState, Suspense, memo } from 'react';
import { useSearchParams } from 'next/navigation';
import { BookingProvider, useBooking } from '@/lib/booking/context';
import BookingStepsWizard from '@/components/booking/BookingStepsWizard';
import { calculateDistanceByPlaceId } from '@/lib/booking/utils';
import type { ServiceType, Location, TransferType, BookingData } from '@/lib/booking/types';
import DraftHydrator from '@/components/booking/DraftHydrator';

// ============================================================================
// LOADING SCREEN
// Shown while Google Maps Distance Matrix API is being called.
// Prevents VehicleSelectionStep from rendering with undefined distance.
// ============================================================================

const DistanceLoadingScreen = memo(function DistanceLoadingScreen() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        {/* Spinner */}
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="w-16 h-16 rounded-full border-4 border-blue-100" />
          <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
        </div>

        {/* Text */}
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Calculating your route…
        </h2>
        <p className="text-sm text-gray-500 max-w-xs mx-auto">
          We&apos;re calculating the distance so we can show you accurate prices for your journey.
        </p>
      </div>
    </div>
  );
});

// ============================================================================
// SUSPENSE FALLBACK
// Used while the component tree that calls useSearchParams() is loading.
// ============================================================================

const PageSuspenseFallback = memo(function PageSuspenseFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-4 border-blue-100 border-t-blue-500 animate-spin" />
    </div>
  );
});

// ============================================================================
// BOOKING PAGE CONTENT
// This component must be wrapped in <Suspense> because it uses useSearchParams().
// ============================================================================

function BookingPageContent() {
  const { updateBookingData, goToStep } = useBooking();
  const searchParams = useSearchParams();

  // Controls the "Calculating your route…" loading screen.
  // Set to true while the Distance Matrix API call is in-flight.
  const [isLoadingDistance, setIsLoadingDistance] = useState(false);

  useEffect(() => {
    const rawDraft = sessionStorage.getItem('booking-draft');
    if (!rawDraft) {
      console.log('ℹ️ No draft data — user started directly on the booking page');
      return;
    }

    /**
     * Async IIFE so we can await the distance calculation inside useEffect.
     * All logic is sequential:
     *   1. Parse & validate sessionStorage draft
     *   2. Map every field to BookingData (including new fields)
     *   3. updateBookingData() with the mapped data
     *   4. If step=2 and distance-based → calculate distance, then updateBookingData again
     *   5. goToStep() to the correct step index
     *   6. Clear sessionStorage
     */
    const loadDraft = async () => {
      try {
        const parsed = JSON.parse(rawDraft);
        console.log('📥 Loading draft from homepage:', parsed);

        // ------------------------------------------------------------------
        // Build the full booking update object
        // ------------------------------------------------------------------
        const bookingUpdate: Partial<BookingData> = {};

        // ① Service type  (e.g. 'airport' | 'hourly')
        if (parsed.serviceType) {
          bookingUpdate.serviceType = parsed.serviceType as ServiceType;
          console.log('  ✓ serviceType:', parsed.serviceType);
        }

        // ② Transfer type  ('oneWay' | 'return') — distance bookings only
        if (parsed.transferType === 'oneWay' || parsed.transferType === 'return') {
          bookingUpdate.transferType = parsed.transferType as TransferType;
          console.log('  ✓ transferType:', parsed.transferType);
        }

        // ③ Pickup location
        if (parsed.pickup) {
          bookingUpdate.pickup = {
            address: parsed.pickup.address || '',
            placeId:  parsed.pickup.placeId  || '',
            lat:      parsed.pickup.lat,
            lng:      parsed.pickup.lng,
            type:     parsed.pickup.type || 'address',
          } as Location;
          console.log('  ✓ pickup:', bookingUpdate.pickup.address);
        }

        // ④ Dropoff location  (absent for hourly bookings)
        if (parsed.dropoff) {
          bookingUpdate.dropoff = {
            address: parsed.dropoff.address || '',
            placeId:  parsed.dropoff.placeId  || '',
            lat:      parsed.dropoff.lat,
            lng:      parsed.dropoff.lng,
            type:     parsed.dropoff.type || 'address',
          } as Location;
          console.log('  ✓ dropoff:', bookingUpdate.dropoff.address);
        }

        // ⑤ DateTime — includes returnDate / returnTime for return journeys
        //    NOTE: DateTime interface must include returnDate? and returnTime?
        //    See types.ts additions at the bottom of this file.
        if (parsed.dateTime) {
          bookingUpdate.dateTime = {
            date: parsed.dateTime.date || '',
            time: parsed.dateTime.time || '',
            // [NEW] Return journey fields — only present when transferType === 'return'
            ...(parsed.dateTime.returnDate && { returnDate: parsed.dateTime.returnDate }),
            ...(parsed.dateTime.returnTime && { returnTime: parsed.dateTime.returnTime }),
          };
         console.log('  ✓ dateTime:', bookingUpdate.dateTime?.date, bookingUpdate.dateTime?.time);
          if (parsed.dateTime.returnDate) {
            console.log('  ✓ returnDate:', parsed.dateTime.returnDate, parsed.dateTime.returnTime);
          }
        }

        // ⑥ Passengers
        if (parsed.passengers) {
          bookingUpdate.passengers = {
            count:      parsed.passengers.count      ?? 1,
            luggage:    parsed.passengers.luggage    ?? 0,
            childSeats: parsed.passengers.childSeats ?? 0,
          };
          console.log('  ✓ passengers:', bookingUpdate.passengers.count);
        }

        // ⑦ [NEW] Hourly duration — only present for serviceCategory === 'hourly'
        //    NOTE: BookingData interface must include hourlyDuration?: number
        //    See types.ts additions at the bottom of this file.
        if (typeof parsed.hourlyDuration === 'number' && parsed.hourlyDuration > 0) {
          (bookingUpdate as Partial<BookingData> & { hourlyDuration?: number }).hourlyDuration =
            parsed.hourlyDuration;
          console.log('  ✓ hourlyDuration:', parsed.hourlyDuration, 'hours');
        }

        // ------------------------------------------------------------------
        // Apply core booking data to context
        // ------------------------------------------------------------------
        console.log('📝 Updating booking context with:', bookingUpdate);
        updateBookingData(bookingUpdate);

        // ------------------------------------------------------------------
        // Determine target wizard step
        // ?step=2  →  index 1  (VehicleSelectionStep)
        // ?step=1  →  index 0  (BookingDetailsStep) — default
        // ------------------------------------------------------------------
        const stepParam    = searchParams.get('step');
        const targetIndex  = stepParam ? Math.max(0, parseInt(stepParam, 10) - 1) : 0;
        console.log('  ✓ targetStep index:', targetIndex);

        // ------------------------------------------------------------------
        // Distance calculation — MUST happen before rendering Step 2
        // (VehicleSelectionStep needs bookingData.distance to price vehicles)
        // ------------------------------------------------------------------
        const needsDistance =
          targetIndex >= 1 &&
          parsed.serviceType === 'distance' &&
          parsed.pickup?.placeId &&
          parsed.dropoff?.placeId;

        if (needsDistance) {
          setIsLoadingDistance(true);
          try {
            console.log('📏 Calculating distance between placeIds…');
            const result = await calculateDistanceByPlaceId(
              parsed.pickup.placeId as string,
              parsed.dropoff.placeId as string
            );

            const distanceKm  = result.distance.value / 1000;     // metres → km
            const durationMin = result.duration.value / 60;        // seconds → minutes

            updateBookingData({ distance: distanceKm, duration: durationMin });
            console.log(`  ✓ distance: ${distanceKm.toFixed(1)} km  /  duration: ${durationMin.toFixed(0)} min`);
          } catch (distanceError) {
            // Non-fatal — Step 2 will show vehicles but prices may be €0.
            // The user can go back to Step 1 and re-trigger the calculation.
            console.error('⚠️ Distance calculation failed (non-fatal):', distanceError);
          } finally {
            setIsLoadingDistance(false);
          }
        }

        // ------------------------------------------------------------------
        // Jump to the correct step, then clear the draft
        // ------------------------------------------------------------------
        goToStep(targetIndex);
        sessionStorage.removeItem('booking-draft');
        console.log(`✅ Draft loaded. Wizard is at step ${targetIndex + 1}.`);

      } catch (parseError) {
        console.error('❌ Error loading draft booking:', parseError);
        // Intentionally NOT clearing sessionStorage on parse errors so the
        // user can refresh and retry without losing their data.
      }
    };

    loadDraft();
    // searchParams is stable across renders in Next.js App Router;
    // including it here is correct and satisfies the exhaustive-deps rule.
  }, [updateBookingData, goToStep, searchParams]);

  // Show full-screen loading state while distance is being calculated.
  // This prevents VehicleSelectionStep from mounting with distance === undefined.
  if (isLoadingDistance) {
    return <DistanceLoadingScreen />;
  }

  return <BookingStepsWizard />;
}

// ============================================================================
// ROOT PAGE EXPORT
// BookingPageContent must be wrapped in Suspense because useSearchParams()
// opts the component into client-side rendering and suspends on first load.
// Without Suspense the entire page would throw during static generation.
// ============================================================================

export default function BookingPage() {
  return (
    <BookingProvider>
      {/* ✅ Hydrates draft from Hero and jumps to Step 2 */}
      <DraftHydrator />

      <Suspense fallback={<PageSuspenseFallback />}>
        <BookingPageContent />
      </Suspense>
    </BookingProvider>
  );
}

// ============================================================================
// REQUIRED ADDITIONS TO src/lib/booking/types.ts
// ============================================================================
//
// 1. Extend the DateTime interface to carry optional return-journey fields:
//
//    export interface DateTime {
//      date: string;
//      time: string;
//      returnDate?: string;   // ← ADD THIS
//      returnTime?: string;   // ← ADD THIS
//    }
//
// 2. Add hourlyDuration to BookingData:
//
//    export interface BookingData {
//      ...existing fields...
//      hourlyDuration?: number;   // ← ADD THIS (hours, 2–24)
//    }
//
// No other files need to change for the data to flow through correctly.
// ============================================================================