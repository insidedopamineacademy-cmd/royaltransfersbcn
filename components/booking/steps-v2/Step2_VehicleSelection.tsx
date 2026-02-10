'use client';

/**
 * Step 2: Choose a Vehicle - IMPROVED
 * - Mobile optimized
 * - SEO friendly
 * - Performance optimized
 * - i18n ready
 */

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { m } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useBooking } from '@/lib/booking/context';
import { formatPrice, calculatePrice } from '@/lib/booking/utils';
import type { VehicleCategory } from '@/lib/booking/types';

// Memoized vehicle categories
const VEHICLE_CATEGORIES = [
  {
    id: 'standard-sedan' as VehicleCategory,
    name: 'Standard Sedan',
    description: 'Toyota Prius+ or similar',
    capacity: 3,
    luggage: 2,
    basePrice: 35,
    image: '/images/fleet/toyota-prius-plus.jpg', // or tesla-model-3.jpg
    features: ['Air-conditioned', 'Hybrid efficiency', 'Professional driver'],
  },
  {
    id: 'premium-sedan' as VehicleCategory,
    name: 'Premium Sedan',
    description: 'Mercedes E-Class or BMW 5 Series',
    capacity: 3,
    luggage: 3,
    basePrice: 55,
    image: '/images/fleet/mercedes-e-class.jpg', // or bmw-5-series.jpg
    features: ['Executive seating', 'Premium interior', 'Climate control'],
  },
  {
    id: 'luxury-sedan' as VehicleCategory,
    name: 'Luxury Sedan',
    description: 'Mercedes S-Class',
    capacity: 3,
    luggage: 3,
    basePrice: 103,
    image: '/images/fleet/mercedes-s-class.jpg',
    features: ['First-class seating', 'Massage seats', 'Premium sound system'],
  },
  {
    id: 'standard-minivan-7' as VehicleCategory,
    name: 'Standard Minivan',
    subtitle: '7 seats',
    description: 'Mercedes V-Class',
    capacity: 7,
    luggage: 7,
    basePrice: 75,
    image: '/images/fleet/mercedes-vclass.jpg',
    features: ['Spacious interior', 'Dual climate control', 'Large luggage space'],
  },
  {
    id: 'standard-minivan-8' as VehicleCategory,
    name: 'Standard Minivan',
    subtitle: 'up to 8 passengers',
    description: 'Mercedes Vito or Ford Tourneo',
    capacity: 8,
    luggage: 8,
    basePrice: 85,
    image: '/images/fleet/mercedes-vito.jpg', // or ford-tourneo-custom.jpg
    features: ['8 full-size seats', 'Ample legroom', 'Large luggage capacity'],
  },
  {
    id: 'executive-minivan' as VehicleCategory,
    name: 'Executive Minivan',
    subtitle: '7-8 seats',
    description: 'Mercedes V-Class Executive',
    capacity: 7,
    luggage: 7,
    basePrice: 95,
    image: '/images/fleet/mercedes-vclass-executive.jpg',
    features: ['Premium leather seats', 'Conference seating', 'Executive comfort'],
  },
] as const;
export default function VehicleSelectionStep() {
  const t = useTranslations('step2');
  const { bookingData, updateBookingData, updatePricing } = useBooking();
  const [childSeats, setChildSeats] = useState(0);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  // Check if booking is hourly type
  const isHourlyBooking = bookingData.serviceType === 'hourly';

  // Memoized filtered vehicles
  const availableVehicles = useMemo(
    () => VEHICLE_CATEGORIES.filter(
      (vehicle) => vehicle.capacity >= bookingData.passengers.count
    ),
    [bookingData.passengers.count]
  );

  // Price calculation effect
  useEffect(() => {
    if (selectedVehicleId) {
      const vehicle = VEHICLE_CATEGORIES.find((v) => v.id === selectedVehicleId);
      if (vehicle) {
        const mockVehicle = {
          id: vehicle.id,
          category: vehicle.id,
          name: vehicle.name,
          description: '',
          image: vehicle.image,
          capacity: { passengers: vehicle.capacity, luggage: vehicle.luggage },
          features: [],
          basePrice: vehicle.basePrice,
          pricePerKm: 1.2,
          pricePerHour: 45,
        };

        updateBookingData({
          passengers: {
            ...bookingData.passengers,
            childSeats: childSeats,
          },
          selectedVehicle: mockVehicle,
        });

        const pricing = calculatePrice(
          { ...bookingData, selectedVehicle: mockVehicle, passengers: { ...bookingData.passengers, childSeats } },
          bookingData.distance
        );
        updatePricing(pricing);
      }
    }
  }, [selectedVehicleId, childSeats, bookingData, updateBookingData, updatePricing]);

  const handleSelectVehicle = useCallback((vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
  }, []);

  const incrementChildSeats = useCallback(() => {
    setChildSeats((prev) => Math.min(3, prev + 1));
  }, []);

  const decrementChildSeats = useCallback(() => {
    setChildSeats((prev) => Math.max(0, prev - 1));
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Title */}
      <header className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">
          {t('title')}
        </h1>
        <p className="text-sm sm:text-lg text-gray-600">
          {t('subtitle')}
        </p>
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
            value={isHourlyBooking ? t('summary.hourly') : t('summary.distance')} 
          />
          <SummaryItem label={t('summary.transferType')} value={t('summary.oneWay')} />
          <SummaryItem label={t('summary.pickup')} value={bookingData.pickup.address || t('summary.notSet')} />
          
          {/* Only show dropoff for distance-based bookings */}
          {!isHourlyBooking && (
            <SummaryItem label={t('summary.dropoff')} value={bookingData.dropoff.address || t('summary.notSet')} />
          )}
          
          <SummaryItem 
            label={t('summary.dateTime')} 
            value={`${bookingData.dateTime.date} ${bookingData.dateTime.time}`} 
          />
          
          {/* Distance info only for distance-based bookings */}
          {!isHourlyBooking && bookingData.distance && (
            <SummaryItem label={t('summary.distance')} value={`${bookingData.distance.toFixed(1)} km`} />
          )}
          
          {!isHourlyBooking && bookingData.duration && (
            <SummaryItem label={t('summary.time')} value={`${Math.round(bookingData.duration)} min`} />
          )}
          
          <SummaryItem label={t('summary.passengers')} value={`${bookingData.passengers.count}`} />
        </div>
      </section>

      {/* Vehicle Selection */}
      <section className="max-w-6xl mx-auto">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
          {t('vehicles.heading')}
        </h2>
        
        {availableVehicles.length > 0 ? (
          <div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
            role="radiogroup"
            aria-label={t('vehicles.aria')}
          >
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
        <m.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
            {t('extras.heading')}
          </h2>
          <div className="bg-white rounded-xl border-2 border-gray-200 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <ChildSeatIcon className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                    {t('extras.childSeat.title')}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {t('extras.childSeat.price')}
                  </p>
                </div>
              </div>

              <div 
                className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end"
                role="group"
                aria-label={t('extras.childSeat.aria')}
              >
                <button
                  onClick={decrementChildSeats}
                  disabled={childSeats === 0}
                  aria-label={t('extras.childSeat.decrease')}
                  className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors touch-manipulation"
                >
                  <MinusIcon />
                </button>
                <span 
                  className="text-xl sm:text-2xl font-bold text-gray-900 w-10 sm:w-12 text-center"
                  aria-live="polite"
                  aria-atomic="true"
                >
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-gray-600 mb-1" id="pricing-heading">
                {t('pricing.totalCost')}
              </p>
              <p className="text-3xl sm:text-4xl font-bold text-gray-900">
                {formatPrice(bookingData.pricing.total)}
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mt-2">
                {t('pricing.base')}: {formatPrice(bookingData.pricing.basePrice)} + 
                {t('pricing.distance')}: {formatPrice(bookingData.pricing.distanceCharge)}
                {childSeats > 0 && ` + ${t('pricing.childSeats')}: ${formatPrice(childSeats * 5)}`}
                {bookingData.pricing.airportFee > 0 && ` + ${t('pricing.airportFee')}: ${formatPrice(bookingData.pricing.airportFee)}`}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs sm:text-sm text-gray-600">{t('pricing.tax')}</p>
              <p className="text-lg sm:text-xl font-semibold text-gray-900">
                {formatPrice(bookingData.pricing.tax)}
              </p>
            </div>
          </div>
        </m.section>
      )}
    </div>
  );
}

// ============================================================================
// VEHICLE CARD COMPONENT (Memoized)
// ============================================================================

interface Vehicle {
  id: string;
  name: string;
  subtitle?: string;
  capacity: number;
  luggage: number;
  basePrice: number;
  image: string;
}

const VehicleCard = React.memo(({
  vehicle,
  isSelected,
  onSelect,
  index,
}: {
  vehicle: Vehicle;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}) => {
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
      {/* Selected Badge */}
      {isSelected && (
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
            <CheckIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
        </div>
      )}

      {/* Vehicle Image Placeholder */}
      <div className={`aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${isSelected ? 'from-blue-50 to-cyan-50' : ''}`}>
        <CarIcon className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400" />
      </div>

      {/* Vehicle Info */}
      <div className="p-4 sm:p-5">
        <h3 className="text-base sm:text-lg font-bold text-gray-900">{vehicle.name}</h3>
        {vehicle.subtitle && (
          <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">{vehicle.subtitle}</p>
        )}

        {/* Capacity */}
        <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4 text-xs sm:text-sm text-gray-700">
          <div className="flex items-center gap-1">
            <UserIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{vehicle.capacity} {t('vehicles.pax')}</span>
          </div>
          <div className="flex items-center gap-1">
            <LuggageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{vehicle.luggage} {t('vehicles.bags')}</span>
          </div>
        </div>

        {/* Price */}
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

const CarIcon = React.memo(({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 17h8M8 17a2 2 0 11-4 0 2 2 0 014 0zm8 0a2 2 0 104 0 2 2 0 00-4 0zM4 11l2-6h12l2 6M4 11h16M4 11v6h16v-6" />
  </svg>
));
CarIcon.displayName = 'CarIcon';

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