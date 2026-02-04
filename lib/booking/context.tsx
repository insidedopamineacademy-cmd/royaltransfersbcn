'use client';

/**
 * Booking Context Provider
 * Manages booking state across the wizard steps
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { BookingData, WizardStep, PriceBreakdown } from './types';

// ============================================================================
// INITIAL STATE
// ============================================================================

const INITIAL_BOOKING_DATA: BookingData = {
  serviceType: null,
  pickup: { address: '' },
  dropoff: { address: '' },
  dateTime: {
    date: '',
    time: '',
  },
  passengers: {
    count: 1,
    luggage: 1,
    childSeats: 0,
  },
  selectedVehicle: null,
  passengerDetails: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    countryCode: '+34',
  },
  extras: {
    meetAndGreet: false,
    waitingTime: 60,
    additionalStops: [],
  },
  pricing: null,
};

// ============================================================================
// CONTEXT TYPE
// ============================================================================

interface BookingContextType {
  // State
  bookingData: BookingData;
  currentStep: number;
  isLoading: boolean;
  
  // Wizard navigation
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  goToStep: (step: number) => void;
  
  // Data updates
  updateBookingData: (data: Partial<BookingData>) => void;
  updatePricing: (pricing: PriceBreakdown) => void;
  resetBooking: () => void;
  
  // Utilities
  setLoading: (loading: boolean) => void;
  canProceedToNextStep: () => boolean;
}

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const BookingContext = createContext<BookingContextType | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

interface BookingProviderProps {
  children: ReactNode;
  initialStep?: number;
}

export function BookingProvider({ children, initialStep = 0 }: BookingProviderProps) {
  const [bookingData, setBookingData] = useState<BookingData>(INITIAL_BOOKING_DATA);
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [isLoading, setIsLoading] = useState(false);

  // ============================================================================
  // WIZARD NAVIGATION
  // ============================================================================

  const goToNextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, 3)); // Max 4 steps (0-3)
  }, []);

  const goToPreviousStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step <= 3) {
      setCurrentStep(step);
    }
  }, []);

  // ============================================================================
  // DATA UPDATES
  // ============================================================================

  const updateBookingData = useCallback((data: Partial<BookingData>) => {
    setBookingData((prev) => ({
      ...prev,
      ...data,
    }));
  }, []);

  const updatePricing = useCallback((pricing: PriceBreakdown) => {
    setBookingData((prev) => ({
      ...prev,
      pricing,
    }));
  }, []);

  const resetBooking = useCallback(() => {
    setBookingData(INITIAL_BOOKING_DATA);
    setCurrentStep(0);
  }, []);

  // ============================================================================
  // UTILITIES
  // ============================================================================

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  const canProceedToNextStep = useCallback((): boolean => {
    switch (currentStep) {
      case 0: // Step 1: Ride Details
        // Check if service type is hourly
        const isHourlyBooking = bookingData.serviceType === 'hourly';
        
        return Boolean(
          bookingData.pickup.address &&
          bookingData.dateTime.date &&
          bookingData.dateTime.time &&
          // Dropoff only required for distance-based bookings (airport/cityToCity)
          // For hourly bookings, dropoff is optional
          (isHourlyBooking || bookingData.dropoff.address)
        );
      
      case 1: // Step 2: Vehicle Selection
        return bookingData.selectedVehicle !== null;
      
      case 2: // Step 3: Contact Details
        return Boolean(
          bookingData.passengerDetails.firstName &&
          bookingData.passengerDetails.lastName &&
          bookingData.passengerDetails.email &&
          bookingData.passengerDetails.phone
        );
      
      case 3: // Step 4: Booking Summary (Final step)
        return true;
      
      default:
        return false;
    }
  }, [currentStep, bookingData]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const value: BookingContextType = {
    bookingData,
    currentStep,
    isLoading,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    updateBookingData,
    updatePricing,
    resetBooking,
    setLoading,
    canProceedToNextStep,
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
}

// ============================================================================
// CUSTOM HOOK
// ============================================================================

export function useBooking() {
  const context = useContext(BookingContext);
  
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  
  return context;
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export type { BookingContextType };