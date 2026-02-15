'use client';

/**
 * Step 2: Choose a Vehicle - UPDATED
 * - No update loops (no bookingData in effect deps)
 * - Summary reflects Step1 selections (distance/hourly, oneWay/return, return date/time, hourlyDuration)
 * - Pricing recalculates on select + child seats change
 * - Scrolls to top on mobile when Step2 mounts
 */

import React, { useEffect, useMemo, useCallback } from 'react';
import { m } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useBooking } from '@/lib/booking/context';
import { formatPrice, calculatePrice } from '@/lib/booking/utils';
import type { VehicleCategory, Vehicle, TransferType } from '@/lib/booking/types';
import Image from 'next/image';

// Memoized vehicle categories
const VEHICLE_CATEGORIES = [
  {
    id: 'standard-sedan' as VehicleCategory,
    name: 'Standard Sedan',
    description: 'Toyota Prius+ or similar',
    capacity: 3,
    luggage: 2,
    basePrice: 35,
    image: '/images/fleet/toyota-prius.png',
    features: ['Air-conditioned', 'Hybrid efficiency', 'Professional driver'],
  },
  {
    id: 'premium-sedan' as VehicleCategory,
    name: 'Premium Sedan',
    description: 'Mercedes E-Class or similar',
    capacity: 3,
    luggage: 3,
    basePrice: 55,
    image: '/images/fleet/eclass.png',
    features: ['Executive seating', 'Premium interior', 'Climate control'],
  },
  {
    id: 'luxury-sedan' as VehicleCategory,
    name: 'Luxury Sedan',
    description: 'Mercedes S-Class',
    capacity: 3,
    luggage: 3,
    basePrice: 103,
    image: '/images/fleet/sclass.png',
    features: ['First-class seating', 'Massage seats', 'Premium sound system'],
  },
  {
    id: 'standard-minivan-7' as VehicleCategory,
    name: 'Standard Minivan',
    subtitle: '7 passengers',
    description: 'Mercedes Vito or Similar',
    capacity: 7,
    luggage: 7,
    basePrice: 75,
    image: '/images/fleet/vclass.png',
    features: ['Spacious interior', 'Dual climate control', 'Large luggage space'],
  },
  {
    id: 'standard-minivan-8' as VehicleCategory,
    name: 'Standard Minibus',
    subtitle: 'up to 8 passengers',
    description: 'Ford Custom',
    capacity: 8,
    luggage: 8,
    basePrice: 85,
    image: '/images/fleet/vito.png',
    features: ['8 full-size seats', 'Ample legroom', 'Large luggage capacity'],
  },
  {
    id: 'executive-minivan' as VehicleCategory,
    name: 'Executive Minivan',
    subtitle: 'up to 7 passengers',
    description: 'Mercedes V-Class Executive',
    capacity: 7,
    luggage: 7,
    basePrice: 95,
    image: '/images/fleet/vclass.png',
    features: ['Premium leather seats', 'Conference seating', 'Executive comfort'],
  },
] as const;

export default function VehicleSelectionStep() {
  const t = useTranslations('step2');
  const { bookingData, updateBookingData, updatePricing } = useBooking();

  // Derived (single source of truth = context)
  const isHourlyBooking = bookingData.serviceType === 'hourly';
  const isDistanceBooking = bookingData.serviceType === 'distance';

  const selectedVehicleId = bookingData.selectedVehicle?.id ?? null;
  const childSeats = bookingData.passengers.childSeats ?? 0;

  // ✅ scroll to top on mobile when Step2 mounts
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.innerWidth <= 768) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  // Memoized filtered vehicles
  const availableVehicles = useMemo(
    () => VEHICLE_CATEGORIES.filter((vehicle) => vehicle.capacity >= bookingData.passengers.count),
    [bookingData.passengers.count]
  );

  const buildVehicle = useCallback((vehicleId: string): Vehicle | null => {
    const v = VEHICLE_CATEGORIES.find((x) => x.id === vehicleId);
    if (!v) return null;

    // Your fleet list is “category-only”; we convert to the real Vehicle type used by pricing/booking.
    const mockVehicle: Vehicle = {
      id: v.id,
      category: v.id,
      name: v.name,
      description: v.description || '',
      image: v.image,
      capacity: { passengers: v.capacity, luggage: v.luggage },
      features: [...v.features], // convert readonly -> mutable string[]
      basePrice: v.basePrice,
      // pricing inputs (adjust if your rules differ)
      pricePerKm: 1.2,
      pricePerHour: 45,
    };

    return mockVehicle;
  }, []);

  const recomputePricing = useCallback(
    (nextSelectedVehicle: Vehicle | null, nextChildSeats: number) => {
      if (!nextSelectedVehicle) return;

      const nextBooking = {
        ...bookingData,
        selectedVehicle: nextSelectedVehicle,
        passengers: { ...bookingData.passengers, childSeats: nextChildSeats },
      };

      // calculatePrice already knows how to handle hourly vs distance (based on bookingData/serviceType)
      const pricing = calculatePrice(nextBooking, bookingData.distance);
      updatePricing(pricing);
    },
    [bookingData, updatePricing]
  );

  const handleSelectVehicle = useCallback(
    (vehicleId: string) => {
      const vehicle = buildVehicle(vehicleId);
      if (!vehicle) return;

      updateBookingData({
        selectedVehicle: vehicle,
        passengers: { ...bookingData.passengers, childSeats },
      });

      recomputePricing(vehicle, childSeats);
    },
    [buildVehicle, bookingData.passengers, childSeats, updateBookingData, recomputePricing]
  );

  const incrementChildSeats = useCallback(() => {
    const next = Math.min(3, childSeats + 1);

    updateBookingData({
      passengers: { ...bookingData.passengers, childSeats: next },
    });

    if (bookingData.selectedVehicle) {
      recomputePricing(bookingData.selectedVehicle, next);
    }
  }, [childSeats, bookingData.passengers, bookingData.selectedVehicle, updateBookingData, recomputePricing]);

  const decrementChildSeats = useCallback(() => {
    const next = Math.max(0, childSeats - 1);

    updateBookingData({
      passengers: { ...bookingData.passengers, childSeats: next },
    });

    if (bookingData.selectedVehicle) {
      recomputePricing(bookingData.selectedVehicle, next);
    }
  }, [childSeats, bookingData.passengers, bookingData.selectedVehicle, updateBookingData, recomputePricing]);

  // Summary display helpers
  const transferType: TransferType = bookingData.transferType === 'return' ? 'return' : 'oneWay';
  const showReturn = isDistanceBooking && transferType === 'return';

  const transferLabel =
    transferType === 'return'
      ? (t('summary.return') ?? 'Return')
      : (t('summary.oneWay') ?? 'One-way');

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Title */}
      <header className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">{t('title')}</h1>
        <p className="text-sm sm:text-lg text-gray-600">{t('subtitle')}</p>
      </header>

      {/* Ride Summary */}
      <section
        className="max-w-5xl mx-auto bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-100"
        aria-labelledby="ride-summary-heading"
      >
        <h2 id="ride-summary-heading" className="text-xs sm:text-sm font-semibold text-gray-600 mb-3 sm:mb-4">
          {t('summary.heading')}
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          <SummaryItem
            label={t('summary.serviceType')}
            value={isHourlyBooking ? (t('summary.hourly') ?? 'Hourly') : (t('summary.distance') ?? 'Distance')}
          />

          {/* ✅ show correct transfer type only for distance */}
          {!isHourlyBooking && (
            <SummaryItem label={t('summary.transferType')} value={transferLabel} />
          )}

          <SummaryItem label={t('summary.pickup')} value={bookingData.pickup.address || (t('summary.notSet') ?? 'Not set')} />

          {/* ✅ dropoff optional */}
          {!isHourlyBooking && (
            <SummaryItem
              label={t('summary.dropoff')}
              value={bookingData.dropoff?.address || (t('summary.notSet') ?? 'Not set')}
            />
          )}

          <SummaryItem label={t('summary.dateTime')} value={`${bookingData.dateTime.date} ${bookingData.dateTime.time}`} />

          {/* ✅ return date/time only if return */}
          {showReturn && (
            <SummaryItem
              label={t('summary.returnDateTime') ?? 'Return'}
              value={`${bookingData.dateTime.returnDate || ''} ${bookingData.dateTime.returnTime || ''}`.trim() || (t('summary.notSet') ?? 'Not set')}
            />
          )}

          {/* ✅ hourly duration only if hourly */}
          {isHourlyBooking && (
            <SummaryItem
              label={t('summary.duration') ?? 'Duration'}
              value={`${bookingData.hourlyDuration ?? 2} ${t('summary.hours') ?? 'hours'}`}
            />
          )}

          {/* ✅ distance only for distance bookings */}
          {!isHourlyBooking && bookingData.distance != null && (
            <SummaryItem label={t('summary.distance')} value={`${bookingData.distance.toFixed(1)} km`} />
          )}

          <SummaryItem label={t('summary.passengers')} value={`${bookingData.passengers.count}`} />
        </div>
      </section>

      {/* Vehicle Selection */}
      <section className="max-w-6xl mx-auto">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">{t('vehicles.heading')}</h2>

        {availableVehicles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" role="radiogroup" aria-label={t('vehicles.aria')}>
            {availableVehicles.map((vehicle, index) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                isSelected={selectedVehicleId === vehicle.id}
                onSelect={() => handleSelectVehicle(vehicle.id)}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-xl" role="alert">
            <p className="text-sm sm:text-base text-gray-600">
              {t('vehicles.noVehicles', { count: bookingData.passengers.count })}
            </p>
          </div>
        )}
      </section>

      {/* Optional Extras */}
      {selectedVehicleId && (
        <m.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">{t('extras.heading')}</h2>

          <div className="bg-white rounded-xl border-2 border-gray-200 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <ChildSeatIcon className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">{t('extras.childSeat.title')}</h3>
                  <p className="text-xs sm:text-sm text-gray-600">{t('extras.childSeat.price')}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end" role="group" aria-label={t('extras.childSeat.aria')}>
                <button
                  onClick={decrementChildSeats}
                  disabled={childSeats === 0}
                  aria-label={t('extras.childSeat.decrease')}
                  className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors touch-manipulation"
                >
                  <MinusIcon />
                </button>

                <span className="text-xl sm:text-2xl font-bold text-gray-900 w-10 sm:w-12 text-center" aria-live="polite" aria-atomic="true">
                  {childSeats}
                </span>

                <button
                  onClick={incrementChildSeats}
                  disabled={childSeats >= 3}
                  aria-label={t('extras.childSeat.increase')}
                  className="w-10 h-10 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors touch-manipulation"
                >
                  <PlusIcon />
                </button>
              </div>
            </div>
          </div>
        </m.section>
      )}

{/* Pricing Summary */}
{bookingData.pricing && (
  <m.section
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="max-w-6xl mx-auto bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-amber-200"
    aria-labelledby="pricing-heading"
  >
    <div className="flex flex-col items-center justify-center text-center">
      <p className="text-xs sm:text-sm text-gray-600 mb-1" id="pricing-heading">
        {t('pricing.totalCost')} (tax included)
      </p>
      <p className="text-3xl sm:text-4xl font-bold text-gray-900">{formatPrice(bookingData.pricing.total)}</p>
    </div>
  </m.section>
)}
    </div>
  );
}

// ============================================================================
// VEHICLE CARD COMPONENT (Memoized)
// ============================================================================

interface VehicleCardData {
  id: string;
  name: string;
  subtitle?: string;
  description?: string;
  capacity: number;
  luggage: number;
  basePrice: number;
  image: string;
  features?: readonly string[];
}

const VehicleCard = React.memo(function VehicleCard({
  vehicle,
  isSelected,
  onSelect,
  index,
}: {
  vehicle: VehicleCardData;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}) {
  const t = useTranslations('step2');

  return (
    <m.button
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      onClick={onSelect}
      role="radio"
      aria-checked={isSelected}
      aria-label={`${vehicle.name}, ${vehicle.capacity} passengers, ${vehicle.luggage} luggage, from ${formatPrice(vehicle.basePrice)}`}
      className={`relative text-left bg-white rounded-xl sm:rounded-2xl border-2 overflow-hidden transition-all hover:shadow-2xl touch-manipulation ${
        isSelected ? 'border-blue-500 shadow-xl shadow-blue-500/20' : 'border-gray-200 hover:border-blue-300'
      }`}
    >
      {isSelected && (
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
            <CheckIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
        </div>
      )}

      <div
        className={`relative aspect-[4/3] overflow-hidden ${
          isSelected ? 'bg-gradient-to-br from-blue-50 to-cyan-50' : 'bg-gradient-to-br from-gray-50 to-gray-100'
        }`}
      >
        <Image
          src={vehicle.image}
          alt={`${vehicle.name} - ${vehicle.description || ''}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-contain p-4 sm:p-6"
          priority={index < 3}
          quality={90}
        />
      </div>

      <div className="p-4 sm:p-5">
        <h3 className="text-base sm:text-lg font-bold text-gray-900">{vehicle.name}</h3>
        {vehicle.subtitle && <p className="text-xs sm:text-sm text-gray-600 mb-1">{vehicle.subtitle}</p>}
        {vehicle.description && <p className="text-xs text-gray-500 mb-2 sm:mb-3">{vehicle.description}</p>}

        <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4 text-xs sm:text-sm text-gray-700">
          <div className="flex items-center gap-1">
            <UserIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>
              {vehicle.capacity} {t('vehicles.pax')}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <LuggageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>
              {vehicle.luggage} {t('vehicles.bags')}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-100">
          <span className="text-xs sm:text-sm text-gray-600">{t('vehicles.from')}</span>
          <span className="text-xl sm:text-2xl font-bold text-blue-600">{formatPrice(vehicle.basePrice)}</span>
        </div>
      </div>
    </m.button>
  );
});
VehicleCard.displayName = 'VehicleCard';

// ============================================================================
// SUMMARY ITEM COMPONENT (Memoized)
// ============================================================================

const SummaryItem = React.memo(({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-[10px] sm:text-xs text-gray-600 mb-0.5 sm:mb-1">{label}</p>
    <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{value}</p>
  </div>
));
SummaryItem.displayName = 'SummaryItem';

// ============================================================================
// ICON COMPONENTS (Memoized)
// ============================================================================

const UserIcon = React.memo(({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
));
UserIcon.displayName = 'UserIcon';

const LuggageIcon = React.memo(({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
));
LuggageIcon.displayName = 'LuggageIcon';

const ChildSeatIcon = React.memo(({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
));
ChildSeatIcon.displayName = 'ChildSeatIcon';

const CheckIcon = React.memo(({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
));
CheckIcon.displayName = 'CheckIcon';

const PlusIcon = React.memo(() => (
  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
));
PlusIcon.displayName = 'PlusIcon';

const MinusIcon = React.memo(() => (
  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
  </svg>
));
MinusIcon.displayName = 'MinusIcon';