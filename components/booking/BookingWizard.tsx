'use client';

/**
 * Compact Hero Booking Form - IMPROVED
 * - Transfer Type (One Way / Return)
 * - Mobile optimized
 * - SEO optimized
 * - i18n ready with next-intl
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';

import { motion } from 'framer-motion';
import LocationAutocomplete from './ui/LocationAutocomplete';
import type { Location } from '@/lib/booking/types';

type ServiceType = 'distance' | 'hourly';
type TransferType = 'oneWay' | 'return';

export default function HeroBookingForm() {
  const router = useRouter();
  const t = useTranslations('heroBooking');
  
  const [serviceType, setServiceType] = useState<ServiceType>('distance');
  const [transferType, setTransferType] = useState<TransferType>('oneWay');
  const [pickup, setPickup] = useState<Location>({ address: '' });
  const [dropoff, setDropoff] = useState<Location>({ address: '' });
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [passengers, setPassengers] = useState(1);
  const locale = useLocale();

  const handleSearch = () => {
    // Validate required fields
    if (!pickup.address || !dropoff.address || !date || !time) {
      alert(t('validation.fillAllFields'));
      return;
    }

    // Store data in sessionStorage
    const bookingData = {
      serviceType,
      transferType,
      pickup,
      dropoff,
      date,
      time,
      passengers,
    };
    
    sessionStorage.setItem('booking-draft', JSON.stringify(bookingData));
    

    // Redirect to booking page (wizard will open on Step 2)
    router.push(`/${locale}/book`);

  };

  const isValid = pickup.address && dropoff.address && date && time;

  const minDate = new Date();
  minDate.setHours(minDate.getHours() + 2); // Minimum 2 hours from now
  const minDateString = minDate.toISOString().split('T')[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-5xl mx-auto"
      role="search"
      aria-label={t('aria.bookingForm')}
    >
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-4 sm:p-6 border border-gray-100">
        {/* Service Type Toggle */}
        <div className="flex gap-2 mb-4" role="tablist" aria-label={t('aria.serviceType')}>
          <button
            onClick={() => setServiceType('distance')}
            role="tab"
            aria-selected={serviceType === 'distance'}
            aria-label={t('serviceType.distance')}
            className={`flex-1 px-3 sm:px-4 py-2.5 rounded-lg font-semibold text-xs sm:text-sm transition-all ${
              serviceType === 'distance'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center justify-center gap-1.5 sm:gap-2">
              <RouteIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{t('serviceType.distance')}</span>
            </div>
          </button>
          <button
            onClick={() => setServiceType('hourly')}
            role="tab"
            aria-selected={serviceType === 'hourly'}
            aria-label={t('serviceType.hourly')}
            className={`flex-1 px-3 sm:px-4 py-2.5 rounded-lg font-semibold text-xs sm:text-sm transition-all ${
              serviceType === 'hourly'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center justify-center gap-1.5 sm:gap-2">
              <ClockIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{t('serviceType.hourly')}</span>
            </div>
          </button>
        </div>

        {/* Transfer Type (Only for Distance-Based) */}
        {serviceType === 'distance' && (
          <div className="mb-4">
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
              {t('transferType.label')}
            </label>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <button
                onClick={() => setTransferType('oneWay')}
                aria-pressed={transferType === 'oneWay'}
                aria-label={t('transferType.oneWay')}
                className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 font-semibold text-xs sm:text-sm transition-all ${
                  transferType === 'oneWay'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                  <ArrowRightIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>{t('transferType.oneWay')}</span>
                </div>
              </button>
              <button
                onClick={() => setTransferType('return')}
                aria-pressed={transferType === 'return'}
                aria-label={t('transferType.return')}
                className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 font-semibold text-xs sm:text-sm transition-all ${
                  transferType === 'return'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                  <ArrowsIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>{t('transferType.return')}</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Compact Form Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3">
          {/* Pickup Location */}
          <div className="sm:col-span-2 md:col-span-2">
            <label htmlFor="pickup-location" className="sr-only">
              {t('fields.pickup.label')}
            </label>
            <LocationAutocomplete
              value={pickup.address}
              onChange={setPickup}
              placeholder={t('fields.pickup.placeholder')}
              type="pickup"
              aria-label={t('fields.pickup.label')}
            />
          </div>

          {/* Dropoff Location */}
          <div className="sm:col-span-2 md:col-span-2">
            <label htmlFor="dropoff-location" className="sr-only">
              {t('fields.dropoff.label')}
            </label>
            <LocationAutocomplete
              value={dropoff.address}
              onChange={setDropoff}
              placeholder={t('fields.dropoff.placeholder')}
              type="dropoff"
              aria-label={t('fields.dropoff.label')}
            />
          </div>

          {/* Date */}
          <div className="sm:col-span-1 md:col-span-1">
            <label htmlFor="pickup-date" className="sr-only">
              {t('fields.date.label')}
            </label>
            <input
              id="pickup-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={minDateString}
              aria-label={t('fields.date.label')}
              className="w-full px-3 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          {/* Time */}
          <div className="sm:col-span-1 md:col-span-1">
            <label htmlFor="pickup-time" className="sr-only">
              {t('fields.time.label')}
            </label>
            <input
              id="pickup-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              aria-label={t('fields.time.label')}
              className="w-full px-3 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
        </div>

        {/* Passengers & Search Button Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3 mt-3">
          {/* Passengers */}
          <div className="sm:col-span-2 md:col-span-2">
            <label htmlFor="passengers" className="sr-only">
              {t('fields.passengers.label')}
            </label>
            <select
              id="passengers"
              value={passengers}
              onChange={(e) => setPassengers(Number(e.target.value))}
              aria-label={t('fields.passengers.label')}
              className="w-full px-3 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <option key={num} value={num}>
                  {num} {t('fields.passengers.count', { count: num })}
                </option>
              ))}
            </select>
          </div>

          {/* Spacer (desktop only) */}
          <div className="hidden md:block md:col-span-2" />

          {/* Search Button */}
          <div className="sm:col-span-2 md:col-span-2">
            <motion.button
              whileHover={isValid ? { scale: 1.02 } : {}}
              whileTap={isValid ? { scale: 0.98 } : {}}
              onClick={handleSearch}
              disabled={!isValid}
              aria-label={t('button.search')}
              className={`w-full px-4 sm:px-6 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-lg ${
                isValid
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-amber-500/25'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <SearchIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>{t('button.search')}</span>
              </div>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// ICON COMPONENTS
// ============================================================================

function RouteIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  );
}

function ArrowsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  );
}