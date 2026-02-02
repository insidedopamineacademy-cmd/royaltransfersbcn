'use client';

/**
 * Booking Page
 * Main booking wizard page with state management
 */

import { useEffect } from 'react';
import { BookingProvider, useBooking } from '@/lib/booking/context';
import BookingStepsWizard from '@/components/booking/BookingStepsWizard';

function BookingPageContent() {
  const { updateBookingData, goToStep } = useBooking();

  // Check for pre-filled data from homepage widget
  useEffect(() => {
    const draftData = sessionStorage.getItem('booking-draft');
    if (draftData) {
      try {
        const parsed = JSON.parse(draftData);
        // Pre-fill Step 1 data
        updateBookingData({
          serviceType: parsed.serviceType,
          pickup: parsed.pickup,
          dropoff: parsed.dropoff,
          dateTime: {
            date: parsed.date,
            time: parsed.time,
          },
        });
        // Jump to Step 2 (vehicle selection)
        goToStep(0);
        // Clear draft
        sessionStorage.removeItem('booking-draft');
      } catch (error) {
        console.error('Error loading draft booking:', error);
      }
    }
  }, []);

  return <BookingStepsWizard />;
}

export default function BookingPage() {
  return (
    <BookingProvider>
      <BookingPageContent />
    </BookingProvider>
  );
}