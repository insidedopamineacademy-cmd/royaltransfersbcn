'use client';

import { useState, memo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { motion, useReducedMotion, LazyMotion, domAnimation } from 'framer-motion';
import LocationAutocomplete from './ui/LocationAutocomplete';
import type { Location } from '@/lib/booking/types';

type ServiceType = 'distance' | 'hourly';
type TransferType = 'oneWay' | 'return';

const HeroBookingForm = memo(function HeroBookingForm() {
  const router = useRouter();
  const t = useTranslations('heroBooking');
  const locale = useLocale();
  const prefersReducedMotion = useReducedMotion();
  
  const [serviceType, setServiceType] = useState<ServiceType>('distance');
  const [transferType, setTransferType] = useState<TransferType>('oneWay');
  const [pickup, setPickup] = useState<Location>({ address: '' });
  const [dropoff, setDropoff] = useState<Location>({ address: '' });
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [passengers, setPassengers] = useState(1);

  const handleSearch = useCallback(() => {
    if (!pickup.address || !dropoff.address || !date || !time) {
      alert(t('validation.fillAllFields'));
      return;
    }

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
    router.push(`/${locale}/book`);
  }, [pickup, dropoff, date, time, serviceType, transferType, passengers, t, router, locale]);

  const isValid = pickup.address && dropoff.address && date && time;

  const minDate = new Date();
  minDate.setHours(minDate.getHours() + 2);
  const minDateString = minDate.toISOString().split('T')[0];

  return (
    <LazyMotion features={domAnimation} strict>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-5xl mx-auto"
        role="search"
        aria-label={t('aria.bookingForm')}
        style={{ willChange: 'opacity, transform' }}
      >
        <div className="bg-white/95 sm:backdrop-blur-sm rounded-2xl shadow-2xl p-4 sm:p-6 border border-gray-100">
          {/* Service Type Toggle */}
          <div className="flex gap-2 mb-4" role="tablist" aria-label={t('aria.serviceType')}>
            <ServiceTypeButton
              active={serviceType === 'distance'}
              onClick={() => setServiceType('distance')}
              label={t('serviceType.distance')}
              icon={RouteIcon}
            />
            <ServiceTypeButton
              active={serviceType === 'hourly'}
              onClick={() => setServiceType('hourly')}
              label={t('serviceType.hourly')}
              icon={ClockIcon}
            />
          </div>

          {/* Transfer Type (Only for Distance-Based) */}
          {serviceType === 'distance' && (
            <div className="mb-4">
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                {t('transferType.label')}
              </label>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <TransferTypeButton
                  active={transferType === 'oneWay'}
                  onClick={() => setTransferType('oneWay')}
                  label={t('transferType.oneWay')}
                  icon={ArrowRightIcon}
                />
                <TransferTypeButton
                  active={transferType === 'return'}
                  onClick={() => setTransferType('return')}
                  label={t('transferType.return')}
                  icon={ArrowsIcon}
                />
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
              <button
                onClick={handleSearch}
                disabled={!isValid}
                aria-label={t('button.search')}
                className={`w-full px-4 sm:px-6 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 shadow-lg active:scale-95 ${
                  isValid
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-amber-500/25'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <SearchIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>{t('button.search')}</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </LazyMotion>
  );
});

// ============================================================================
// MEMOIZED BUTTON COMPONENTS
// ============================================================================

const ServiceTypeButton = memo(function ServiceTypeButton({
  active,
  onClick,
  label,
  icon: Icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <button
      onClick={onClick}
      role="tab"
      aria-selected={active}
      aria-label={label}
      className={`flex-1 px-3 sm:px-4 py-2.5 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-200 ${
        active
          ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95'
      }`}
    >
      <div className="flex items-center justify-center gap-1.5 sm:gap-2">
        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span>{label}</span>
      </div>
    </button>
  );
});

const TransferTypeButton = memo(function TransferTypeButton({
  active,
  onClick,
  label,
  icon: Icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 font-semibold text-xs sm:text-sm transition-all duration-200 active:scale-95 ${
        active
          ? 'border-blue-500 bg-blue-50 text-blue-700'
          : 'border-gray-200 text-gray-700 hover:border-gray-300'
      }`}
    >
      <div className="flex items-center justify-center gap-1.5 sm:gap-2">
        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span>{label}</span>
      </div>
    </button>
  );
});

// ============================================================================
// MEMOIZED ICON COMPONENTS
// ============================================================================

const RouteIcon = memo(function RouteIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  );
});

const ClockIcon = memo(function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
});

const SearchIcon = memo(function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
});

const ArrowRightIcon = memo(function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  );
});

const ArrowsIcon = memo(function ArrowsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  );
});

export default HeroBookingForm;