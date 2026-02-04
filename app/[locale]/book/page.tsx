'use client';

/**
 * Booking Page
 * Main booking wizard page with state management
 * UPDATED: Properly loads ALL data from homepage including service type, dates, passengers
 */

import { useEffect } from 'react';
import { BookingProvider, useBooking } from '@/lib/booking/context';
import BookingStepsWizard from '@/components/booking/BookingStepsWizard';
import type { ServiceType, Location, TransferType } from '@/lib/booking/types';

function BookingPageContent() {
  const { updateBookingData, goToStep } = useBooking();

  // Check for pre-filled data from homepage widget
  useEffect(() => {
    const draftData = sessionStorage.getItem('booking-draft');
    if (draftData) {
      try {
        const parsed = JSON.parse(draftData);
        console.log('📥 Loading draft data from homepage:', parsed);
        
        // Build the complete booking data object with proper typing
        interface BookingUpdate {
          serviceType?: ServiceType | null;
          transferType?: TransferType;
          pickup?: Location;
          dropoff?: Location;
          dateTime?: {
            date: string;
            time: string;
          };
          passengers?: {
            count: number;
            luggage: number;
            childSeats: number;
          };
        }
        
        const bookingUpdate: BookingUpdate = {};
        
        // Service type (required)
        if (parsed.serviceType) {
          bookingUpdate.serviceType = parsed.serviceType as ServiceType;
          console.log('  ✓ Service type:', parsed.serviceType);
        }
        
        // Transfer type for distance-based bookings (with validation)
        if (parsed.transferType) {
          // Validate that it's actually 'oneWay' or 'return'
          if (parsed.transferType === 'oneWay' || parsed.transferType === 'return') {
            bookingUpdate.transferType = parsed.transferType as TransferType;
            console.log('  ✓ Transfer type:', parsed.transferType);
          }
        }
        
        // Pickup location (required)
        if (parsed.pickup) {
          bookingUpdate.pickup = {
            address: parsed.pickup.address || '',
            placeId: parsed.pickup.placeId || '',
            lat: parsed.pickup.lat,
            lng: parsed.pickup.lng,
            type: parsed.pickup.type || 'address',
          };
          console.log('  ✓ Pickup:', bookingUpdate.pickup.address);
        }
        
        // Dropoff location (optional for hourly bookings)
        if (parsed.dropoff) {
          bookingUpdate.dropoff = {
            address: parsed.dropoff.address || '',
            placeId: parsed.dropoff.placeId || '',
            lat: parsed.dropoff.lat,
            lng: parsed.dropoff.lng,
            type: parsed.dropoff.type || 'address',
          };
          console.log('  ✓ Dropoff:', bookingUpdate.dropoff.address);
        }
        
        // Date and time (required)
        if (parsed.dateTime) {
          bookingUpdate.dateTime = {
            date: parsed.dateTime.date || '',
            time: parsed.dateTime.time || '',
          };
          console.log('  ✓ Date/Time:', bookingUpdate.dateTime.date, bookingUpdate.dateTime.time);
        }
        
        // Passengers (required)
        if (parsed.passengers) {
          bookingUpdate.passengers = {
            count: parsed.passengers.count || 1,
            luggage: parsed.passengers.luggage || 0,
            childSeats: parsed.passengers.childSeats || 0,
          };
          console.log('  ✓ Passengers:', bookingUpdate.passengers.count);
        }
        
        // Update the booking context with all the data
        console.log('📝 Updating booking context with:', bookingUpdate);
        updateBookingData(bookingUpdate);
        
        // Stay on Step 1 (index 0) - don't skip ahead
        // The user came from homepage, they should see Step 1 pre-filled
        goToStep(0);
        
        console.log('✅ Booking data loaded successfully');
        
        // Clear draft after loading
        sessionStorage.removeItem('booking-draft');
        
      } catch (error) {
        console.error('❌ Error loading draft booking:', error);
        // Don't clear sessionStorage on error so user can retry
      }
    } else {
      console.log('ℹ️ No draft data found - user started directly on booking page');
    }
  }, [updateBookingData, goToStep]);

  return <BookingStepsWizard />;
}

export default function BookingPage() {
  return (
    <BookingProvider>
      <BookingPageContent />
    </BookingProvider>
  );
}
