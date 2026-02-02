'use client';

/**
 * Step 1: Ride Details - IMPROVED
 * - Mobile optimized
 * - SEO friendly
 * - Performance optimized
 * - i18n ready
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useBooking } from '@/lib/booking/context';
import LocationAutocomplete from '../ui/LocationAutocomplete';
import { calculateDistanceByPlaceId } from '@/app/[locale]/services/googleMaps';
import { getMinBookableDate } from '@/lib/booking/utils';

type ServiceCategory = 'distance' | 'hourly';
type TransferType = 'oneWay' | 'return';

export default function RideDetailsStep() {
  const t = useTranslations('step1');
  const { bookingData, updateBookingData } = useBooking();
  
  const [serviceCategory, setServiceCategory] = useState<ServiceCategory>('distance');
  const [transferType, setTransferType] = useState<TransferType>('oneWay');
  const [duration, setDuration] = useState<number>(3);
  const [isCalculating, setIsCalculating] = useState(false);
  const [distanceInfo, setDistanceInfo] = useState<{
    distance: string;
    duration: string;
    distanceKm: number;
  } | null>(null);

  const minDate = getMinBookableDate();
  const minDateString = minDate.toISOString().split('T')[0];

  // Memoized time options for performance
  const timeOptions = useMemo(() => 
    Array.from({ length: 48 }, (_, i) => {
      const hour = Math.floor(i / 2);
      const minute = i % 2 === 0 ? '00' : '30';
      return `${hour.toString().padStart(2, '0')}:${minute}`;
    }), []
  );

  // Memoized duration options
  const durationOptions = useMemo(() => [1,2,3, 4, 5, 6, 7, 8, 9, 10, 11, 12], []);

  // Memoized passenger options
  const passengerOptions = useMemo(() => Array.from({ length: 8 }, (_, i) => i + 1), []);

  // Debounced distance calculation
  const calculateDistance = useCallback(async () => {
    if (
      bookingData.pickup.placeId &&
      bookingData.dropoff.placeId &&
      bookingData.pickup.placeId !== bookingData.dropoff.placeId
    ) {
      setIsCalculating(true);
      try {
        const result = await calculateDistanceByPlaceId(
          bookingData.pickup.placeId,
          bookingData.dropoff.placeId
        );
        
        const distanceKm = result.distance.value / 1000;
        
        setDistanceInfo({
          distance: result.distance.text,
          duration: result.duration.text,
          distanceKm: distanceKm,
        });

        updateBookingData({
          distance: distanceKm,
          duration: result.duration.value / 60,
        });
      } catch (error) {
        console.error('Error calculating distance:', error);
      } finally {
        setIsCalculating(false);
      }
    }
  }, [bookingData.pickup.placeId, bookingData.dropoff.placeId, updateBookingData]);

  useEffect(() => {
    calculateDistance();
  }, [calculateDistance]);

  // Update service type
  useEffect(() => {
    updateBookingData({
      serviceType: serviceCategory === 'distance' ? 'airport' : 'hourly',
    });
  }, [serviceCategory, updateBookingData]);

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

      {/* Service Category Tabs */}
      <div className="max-w-md mx-auto">
        <div 
          className="bg-gray-100 rounded-xl p-1.5 sm:p-2 flex gap-1.5 sm:gap-2"
          role="tablist"
          aria-label={t('serviceType.aria')}
        >
          <button
            onClick={() => setServiceCategory('distance')}
            role="tab"
            aria-selected={serviceCategory === 'distance'}
            aria-label={t('serviceType.distance.label')}
            className={`flex-1 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all ${
              serviceCategory === 'distance'
                ? 'bg-white text-blue-600 shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center justify-center gap-1.5 sm:gap-2">
              <RouteIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden xs:inline">{t('serviceType.distance.full')}</span>
              <span className="xs:hidden">{t('serviceType.distance.short')}</span>
            </div>
          </button>
          <button
            onClick={() => setServiceCategory('hourly')}
            role="tab"
            aria-selected={serviceCategory === 'hourly'}
            aria-label={t('serviceType.hourly.label')}
            className={`flex-1 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all ${
              serviceCategory === 'hourly'
                ? 'bg-white text-blue-600 shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center justify-center gap-1.5 sm:gap-2">
              <ClockIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden xs:inline">{t('serviceType.hourly.full')}</span>
              <span className="xs:hidden">{t('serviceType.hourly.short')}</span>
            </div>
          </button>
        </div>
      </div>

      {/* Form Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={serviceCategory}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="max-w-3xl mx-auto space-y-4 sm:space-y-6"
        >
          {/* Date & Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Pickup Date */}
            <div>
              <label 
                htmlFor="pickup-date"
                className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2"
              >
                {t('fields.date.label')}
              </label>
              <input
                id="pickup-date"
                type="date"
                value={bookingData.dateTime.date}
                onChange={(e) =>
                  updateBookingData({
                    dateTime: { ...bookingData.dateTime, date: e.target.value },
                  })
                }
                min={minDateString}
                aria-label={t('fields.date.label')}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 text-sm sm:text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            {/* Pickup Time */}
            <div>
              <label 
                htmlFor="pickup-time"
                className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2"
              >
                {t('fields.time.label')}
              </label>
              <select
                id="pickup-time"
                value={bookingData.dateTime.time}
                onChange={(e) =>
                  updateBookingData({
                    dateTime: { ...bookingData.dateTime, time: e.target.value },
                  })
                }
                aria-label={t('fields.time.label')}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 text-sm sm:text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
              >
                <option value="">{t('fields.time.placeholder')}</option>
                {timeOptions.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Locations */}
          <div className="space-y-3 sm:space-y-4">
            <LocationAutocomplete
              value={bookingData.pickup.address}
              onChange={(location) => updateBookingData({ pickup: location })}
              placeholder={t('fields.pickup.placeholder')}
              label={t('fields.pickup.label')}
              type="pickup"
            />

            <LocationAutocomplete
              value={bookingData.dropoff.address}
              onChange={(location) => updateBookingData({ dropoff: location })}
              placeholder={t('fields.dropoff.placeholder')}
              label={t('fields.dropoff.label')}
              type="dropoff"
            />
          </div>

          {/* Distance-Based: Transfer Type */}
          {serviceCategory === 'distance' && (
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                {t('fields.transferType.label')}
              </label>
              <div 
                className="grid grid-cols-2 gap-3 sm:gap-4"
                role="radiogroup"
                aria-label={t('fields.transferType.label')}
              >
                <button
                  onClick={() => setTransferType('oneWay')}
                  role="radio"
                  aria-checked={transferType === 'oneWay'}
                  aria-label={t('fields.transferType.oneWay')}
                  className={`px-4 sm:px-6 py-3 sm:py-4 rounded-xl border-2 font-semibold text-sm sm:text-base transition-all ${
                    transferType === 'oneWay'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                    <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>{t('fields.transferType.oneWay')}</span>
                  </div>
                </button>
                <button
                  onClick={() => setTransferType('return')}
                  role="radio"
                  aria-checked={transferType === 'return'}
                  aria-label={t('fields.transferType.return')}
                  className={`px-4 sm:px-6 py-3 sm:py-4 rounded-xl border-2 font-semibold text-sm sm:text-base transition-all ${
                    transferType === 'return'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                    <ArrowsIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>{t('fields.transferType.return')}</span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                    {t('fields.transferType.returnNote')}
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Hourly-Based: Duration */}
          {serviceCategory === 'hourly' && (
            <div>
              <label 
                htmlFor="duration"
                className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2"
              >
                {t('fields.duration.label')}
              </label>
              <select
                id="duration"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                aria-label={t('fields.duration.label')}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 text-sm sm:text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
              >
                {durationOptions.map((hours) => (
                  <option key={hours} value={hours}>
                    {t('fields.duration.hours', { count: hours })}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-[10px] sm:text-xs text-gray-500">
                {t('fields.duration.note')}
              </p>
            </div>
          )}

          {/* Passengers */}
          <div>
            <label 
              htmlFor="passengers"
              className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2"
            >
              {t('fields.passengers.label')}
            </label>
            <select
              id="passengers"
              value={bookingData.passengers.count}
              onChange={(e) =>
                updateBookingData({
                  passengers: {
                    ...bookingData.passengers,
                    count: Number(e.target.value),
                  },
                })
              }
              aria-label={t('fields.passengers.label')}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 text-sm sm:text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
            >
              {passengerOptions.map((num) => (
                <option key={num} value={num}>
                  {t('fields.passengers.count', { count: num })}
                </option>
              ))}
            </select>
          </div>

          {/* Distance Info */}
          {distanceInfo && !isCalculating && serviceCategory === 'distance' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 sm:p-6 border border-blue-100"
              role="status"
              aria-live="polite"
            >
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">{t('summary.distance')}</p>
                  <p className="text-lg sm:text-xl font-bold text-gray-900">{distanceInfo.distance}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">{t('summary.time')}</p>
                  <p className="text-lg sm:text-xl font-bold text-gray-900">{distanceInfo.duration}</p>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">{t('summary.transferType')}</p>
                  <p className="text-lg sm:text-xl font-bold text-gray-900">
                    {transferType === 'oneWay' ? t('fields.transferType.oneWay') : t('fields.transferType.return')}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Calculating Indicator */}
          {isCalculating && (
            <div className="text-center py-3 sm:py-4" role="status" aria-live="polite">
              <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-gray-50 rounded-full">
                <LoadingSpinner />
                <span className="text-xs sm:text-sm text-gray-600">{t('calculating')}</span>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// ICON COMPONENTS (Memoized for performance)
// ============================================================================

const RouteIcon = React.memo(({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
  </svg>
));
RouteIcon.displayName = 'RouteIcon';

const ClockIcon = React.memo(({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
));
ClockIcon.displayName = 'ClockIcon';

const ArrowRightIcon = React.memo(({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
));
ArrowRightIcon.displayName = 'ArrowRightIcon';

const ArrowsIcon = React.memo(({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
  </svg>
));
ArrowsIcon.displayName = 'ArrowsIcon';

const LoadingSpinner = React.memo(() => (
  <svg
    className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-blue-500"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
));
LoadingSpinner.displayName = 'LoadingSpinner';