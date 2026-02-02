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
    setCurrentStep((prev) => Math.min(prev + 1, 7)); // Max 8 steps (0-7)
  }, []);

  const goToPreviousStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step <= 7) {
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
      case 0: // Service Type
        return bookingData.serviceType !== null;
      
      case 1: // Location
        return (
          bookingData.pickup.address.length > 0 &&
          bookingData.dropoff.address.length > 0
        );
      
      case 2: // Date & Time
        return (
          bookingData.dateTime.date.length > 0 &&
          bookingData.dateTime.time.length > 0
        );
      
      case 3: // Passengers
        return bookingData.passengers.count > 0;
      
      case 4: // Vehicle
        return bookingData.selectedVehicle !== null;
      
      case 5: // Details
        return (
          bookingData.passengerDetails.firstName.length > 0 &&
          bookingData.passengerDetails.lastName.length > 0 &&
          bookingData.passengerDetails.email.length > 0 &&
          bookingData.passengerDetails.phone.length > 0
        );
      
      case 6: // Extras
        return true; // Optional step
      
      case 7: // Review
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