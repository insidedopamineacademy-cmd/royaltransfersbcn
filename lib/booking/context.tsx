'use client';

/**
 * Booking Context Provider
 * Manages booking state across the wizard steps
 *
 * Includes:
 *  - Deep-merge nested BookingData updates (prevents accidental overwrite)
 *  - canProceedToNextStep rules (distance/return/hourly validation)
 *  - ✅ hydrateFromDraft helper (supports BOTH legacy + HeroBookingForm v2.0 drafts)
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { BookingData, PriceBreakdown, Location, ServiceType, TransferType } from './types';

// ============================================================================
// INITIAL STATE
// ============================================================================

const INITIAL_BOOKING_DATA: BookingData = {
  serviceType: null,
  transferType: 'oneWay',
  pickup: { address: '' },
  dropoff: { address: '' }, // keep a default object to simplify UI
  distance: undefined,
  duration: undefined,
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
  hourlyDuration: undefined,
};

// ============================================================================
// DRAFT TYPES (NO `any`)
// ============================================================================

type DraftServiceTypeV2 = 'distance' | 'hourly';
type DraftTransferType = 'oneWay' | 'return';

type DraftDateTime = { date: string; time: string };

type HeroDraftV2 = {
  version: '2.0';
  timestamp?: number;
  fromHomepage?: boolean;

  serviceType: DraftServiceTypeV2;
  transferType: DraftTransferType;

  pickup: Location;
  dropoff?: Location;

  pickupDateTime: DraftDateTime;
  returnDateTime?: DraftDateTime;

  passengers?: {
    count?: number;
    luggage?: number;
    childSeats?: number;
  };

  hourlyDuration?: number;

  _legacy?: {
    serviceType?: string;
    transferType?: string;
  };
};

type LegacyDraft = Partial<BookingData> & {
  // older drafts sometimes included these extra hints
  serviceCategory?: 'distance' | 'hourly';
  fromHomepage?: boolean;
  timestamp?: number;
  version?: string;
};

export type DraftInput = HeroDraftV2 | LegacyDraft;

// ============================================================================
// CONTEXT TYPE
// ============================================================================

interface BookingContextType {
  bookingData: BookingData;
  currentStep: number;
  isLoading: boolean;

  goToNextStep: () => void;
  goToPreviousStep: () => void;
  goToStep: (step: number) => void;

  updateBookingData: (data: Partial<BookingData>) => void;
  updatePricing: (pricing: PriceBreakdown) => void;

  /**
   * ✅ Use this when you load sessionStorage("booking-draft") on /book
   * Supports:
   *  - HeroBookingForm v2.0 draft shape (serviceType: distance|hourly, pickupDateTime, returnDateTime)
   *  - Legacy draft shape (BookingData-ish)
   */
  hydrateFromDraft: (draft: DraftInput) => void;

  resetBooking: () => void;

  setLoading: (loading: boolean) => void;
  canProceedToNextStep: () => boolean;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

// ============================================================================
// HELPERS
// ============================================================================

function isFiniteDateTime(date: string, time: string) {
  const ts = new Date(`${date}T${time}:00`).getTime();
  return Number.isFinite(ts) ? ts : null;
}

function isHeroDraftV2(draft: DraftInput): draft is HeroDraftV2 {
  return (draft as HeroDraftV2).version === '2.0';
}

/**
 * Deep merge BookingData updates so nested objects don't get overwritten.
 * This prevents bugs when updates come from different steps or draft loading.
 */
function mergeBookingData(prev: BookingData, next: Partial<BookingData>): BookingData {
  const prevDropoff: Location = prev.dropoff ?? { address: '' };
  const nextDropoff: Location | undefined = next.dropoff;

  return {
    ...prev,
    ...next,

    pickup: next.pickup ? { ...prev.pickup, ...next.pickup } : prev.pickup,

    // dropoff is optional in types, so merge safely
    dropoff:
      nextDropoff !== undefined
        ? { ...prevDropoff, ...nextDropoff }
        : prev.dropoff,

    dateTime: next.dateTime ? { ...prev.dateTime, ...next.dateTime } : prev.dateTime,

    passengers: next.passengers ? { ...prev.passengers, ...next.passengers } : prev.passengers,

    passengerDetails: next.passengerDetails
      ? { ...prev.passengerDetails, ...next.passengerDetails }
      : prev.passengerDetails,

    extras: next.extras ? { ...prev.extras, ...next.extras } : prev.extras,
  };
}

// ============================================================================
// PROVIDER
// ============================================================================

interface BookingProviderProps {
  children: ReactNode;
  initialStep?: number;
}

export function BookingProvider({ children, initialStep = 0 }: BookingProviderProps) {
  const [bookingData, setBookingData] = useState<BookingData>(INITIAL_BOOKING_DATA);
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [isLoading, setIsLoading] = useState(false);

  // Wizard navigation
  const goToNextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  }, []);

  const goToPreviousStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step <= 3) setCurrentStep(step);
  }, []);

  // Data updates (deep merge)
  const updateBookingData = useCallback((data: Partial<BookingData>) => {
    setBookingData((prev) => mergeBookingData(prev, data));
  }, []);

  const updatePricing = useCallback((pricing: PriceBreakdown) => {
    setBookingData((prev) => ({ ...prev, pricing }));
  }, []);

  // ✅ Draft hydration (Hero -> Step1/Step2)
  const hydrateFromDraft = useCallback((draft: DraftInput) => {
    setBookingData((prev) => {
      const v2 = isHeroDraftV2(draft);

      // -------------------------
      // ✅ Service type mapping (canonical)
      // Always becomes: 'distance' | 'hourly'
      // -------------------------
      const mappedServiceType: NonNullable<BookingData['serviceType']> = v2
        ? (draft.serviceType === 'hourly' ? 'hourly' : 'distance')
        : (
            (draft.serviceType as ServiceType | undefined) ??
            (draft.serviceCategory === 'hourly'
              ? 'hourly'
              : draft.serviceCategory === 'distance'
                ? 'distance'
                : (prev.serviceType ?? 'distance'))
          );

      const isHourly = mappedServiceType === 'hourly';
      const isDistance = mappedServiceType === 'distance';

      // -------------------------
      // Transfer type preserve (✅ never undefined in our normalized patch)
      // -------------------------
      const legacyTransferType: DraftTransferType | undefined =
        draft.transferType === 'return' || draft.transferType === 'oneWay'
          ? draft.transferType
          : undefined;

      const mappedTransferType: DraftTransferType = v2
        ? draft.transferType
        : legacyTransferType ?? (prev.transferType ?? 'oneWay');

      // -------------------------
      // Locations preserve
      // -------------------------
      const pickup: Location = v2
        ? { ...prev.pickup, ...draft.pickup }
        : draft.pickup
          ? { ...prev.pickup, ...draft.pickup }
          : prev.pickup;

      const prevDropoff: Location = prev.dropoff ?? { address: '' };

      const dropoff: Location = v2
        ? (draft.dropoff ? { ...prevDropoff, ...draft.dropoff } : prevDropoff)
        : draft.dropoff
          ? { ...prevDropoff, ...draft.dropoff }
          : prevDropoff;

      // -------------------------
      // Date/time mapping
      // v2: pickupDateTime + optional returnDateTime
      // legacy: dateTime (+ optional returnDate/returnTime inside dateTime)
      // -------------------------
      const pickupDate = v2 ? draft.pickupDateTime.date : draft.dateTime?.date ?? prev.dateTime.date ?? '';
      const pickupTime = v2 ? draft.pickupDateTime.time : draft.dateTime?.time ?? prev.dateTime.time ?? '';

      const returnDate = v2 ? draft.returnDateTime?.date : draft.dateTime?.returnDate;
      const returnTime = v2 ? draft.returnDateTime?.time : draft.dateTime?.returnTime;

      const dateTime: BookingData['dateTime'] = {
        ...prev.dateTime,
        date: pickupDate,
        time: pickupTime,
        ...(isDistance && mappedTransferType === 'return'
          ? {
              returnDate: returnDate ?? prev.dateTime.returnDate,
              returnTime: returnTime ?? prev.dateTime.returnTime,
            }
          : {
              returnDate: undefined,
              returnTime: undefined,
            }),
      };

      // -------------------------
      // Passengers preserve
      // -------------------------
      const passengers = v2
        ? {
            ...prev.passengers,
            ...(draft.passengers ?? {}),
            count: draft.passengers?.count ?? prev.passengers.count,
            luggage: draft.passengers?.luggage ?? prev.passengers.luggage,
            childSeats: draft.passengers?.childSeats ?? prev.passengers.childSeats,
          }
        : draft.passengers
          ? { ...prev.passengers, ...draft.passengers }
          : prev.passengers;

      // -------------------------
      // Hourly duration
      // -------------------------
      const hourlyDuration =
        typeof draft.hourlyDuration === 'number' && draft.hourlyDuration > 0
          ? draft.hourlyDuration
          : prev.hourlyDuration;

      // -------------------------
      // Normalize final patch
      // - hourly: clear distance-only fields and set dropoff to blank
      // - distance: keep dropoff
      // -------------------------
      const normalized: Partial<BookingData> = {
        serviceType: mappedServiceType,
        transferType: isDistance ? (mappedTransferType as TransferType) : 'oneWay',

        pickup,
        ...(isDistance ? { dropoff } : { dropoff: { address: '' } }),

        dateTime,
        passengers,

        ...(isHourly
          ? {
              hourlyDuration,
              distance: undefined,
              duration: undefined,
            }
          : {
              hourlyDuration: undefined,
            }),
      };

      return mergeBookingData(prev, normalized);
    });

    // default to Step 1; caller can goToStep afterwards
    setCurrentStep(0);
  }, []);

  const resetBooking = useCallback(() => {
    setBookingData(INITIAL_BOOKING_DATA);
    setCurrentStep(0);
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  // --------------------------------------------------------------------------
  // ✅ Proceed rules
  // --------------------------------------------------------------------------
  const canProceedToNextStep = useCallback((): boolean => {
    const isHourly = bookingData.serviceType === 'hourly';
    const isDistance = bookingData.serviceType === 'distance';

    switch (currentStep) {
      case 0: {
        // Step 1: Ride Details
        if (!bookingData.pickup.address) return false;
        if (!bookingData.dateTime.date || !bookingData.dateTime.time) return false;

        // hourly: require duration
        if (isHourly) {
          if (!bookingData.hourlyDuration || bookingData.hourlyDuration < 2) return false;
          return true;
        }

        // distance: require dropoff + placeIds
        if (isDistance) {
          if (!bookingData.dropoff?.address) return false;
          if (!bookingData.pickup.placeId || !bookingData.dropoff?.placeId) return false;

          // return trips: require returnDate/returnTime and return > pickup
          if (bookingData.transferType === 'return') {
            const rd = bookingData.dateTime.returnDate;
            const rt = bookingData.dateTime.returnTime;
            if (!rd || !rt) return false;

            const pickupTS = isFiniteDateTime(bookingData.dateTime.date, bookingData.dateTime.time);
            const returnTS = isFiniteDateTime(rd, rt);
            if (!pickupTS || !returnTS) return false;
            if (returnTS <= pickupTS) return false;
          }

          return true;
        }

        return false;
      }

      case 1:
        // Step 2: Vehicle Selection
        return bookingData.selectedVehicle !== null;

      case 2:
        // Step 3: Contact Details
        return Boolean(
          bookingData.passengerDetails.firstName &&
            bookingData.passengerDetails.lastName &&
            bookingData.passengerDetails.email &&
            bookingData.passengerDetails.phone
        );

      case 3:
        return true;

      default:
        return false;
    }
  }, [currentStep, bookingData]);

  const value: BookingContextType = {
    bookingData,
    currentStep,
    isLoading,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    updateBookingData,
    updatePricing,
    hydrateFromDraft,
    resetBooking,
    setLoading,
    canProceedToNextStep,
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

// Hook
export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}

export type { BookingContextType };