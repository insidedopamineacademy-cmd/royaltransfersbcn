'use client';

import React, { useState, memo, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { m, useReducedMotion, LazyMotion, domAnimation } from 'framer-motion';
import LocationAutocomplete from './ui/LocationAutocomplete';
import type { Location } from '@/lib/booking/types';

type ServiceType = 'distance' | 'hourly';
type TransferType = 'oneWay' | 'return';

// ============================================================================
// CONFIG
// ============================================================================
const MIN_ADVANCE_MINUTES = 120;

// ============================================================================
// DATE HELPERS
// ============================================================================
function getMinPickupDateTime() {
  // Use current system time and add minimum advance minutes
  const d = new Date(Date.now() + MIN_ADVANCE_MINUTES * 60 * 1000);

  // Normalize seconds and milliseconds
  d.setSeconds(0, 0);

  return d;
}

function toDateString(d: Date) {
  return d.toISOString().slice(0, 10);
}

function toTimeString(d: Date) {
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

// ============================================================================
// HELPER: Generate a return date/time that is always > pickup date
// ============================================================================
function generateReturnDateTime(baseDateString: string): { returnDate: string; returnTime: string } {
  const base = new Date(`${baseDateString}T00:00:00`);
  const daysToAdd = Math.floor(Math.random() * 3) + 1; // 1..3 days later
  base.setDate(base.getDate() + daysToAdd);

  const year = base.getFullYear();
  const month = String(base.getMonth() + 1).padStart(2, '0');
  const day = String(base.getDate()).padStart(2, '0');
  const returnDate = `${year}-${month}-${day}`;

  const randomHour = Math.floor(Math.random() * 17) + 6; // 6..22
  const randomMinuteOptions = [0, 15, 30, 45];
  const randomMinute = randomMinuteOptions[Math.floor(Math.random() * randomMinuteOptions.length)];
  const returnTime = `${String(randomHour).padStart(2, '0')}:${String(randomMinute).padStart(2, '0')}`;

  return { returnDate, returnTime };
}

const HeroBookingForm = memo(function HeroBookingForm() {
  const router = useRouter();
  const t = useTranslations('heroBooking');
  const locale = useLocale();
  const prefersReducedMotion = useReducedMotion();

  const [serviceType, setServiceType] = useState<ServiceType>('distance');
  const [transferType, setTransferType] = useState<TransferType>('oneWay');
  const [pickup, setPickup] = useState<Location>({ address: '' });
  const [dropoff, setDropoff] = useState<Location>({ address: '' });
  const [formError, setFormError] = useState<string | null>(null);

  // ✅ iOS-safe date/time input style (fix “lifted text”)
  const inputDateTime =
    'block w-full min-h-[40px] sm:min-h-[48px] pl-10 pr-3 py-2 sm:py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 ' +
    'text-[16px] leading-[1.25] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ' +
    'transition-all appearance-none [color-scheme:light]';

  // Default pickup date/time = now + 2 hours (safe)
  const getDefaultDateTime = useCallback(() => {
    const min = getMinPickupDateTime();
    return { dateString: toDateString(min), timeString: toTimeString(min) };
  }, []);

  const [date, setDate] = useState(() => getDefaultDateTime().dateString);
  const [time, setTime] = useState(() => getDefaultDateTime().timeString);

  // ✅ Passengers + Luggage
  const [passengers, setPassengers] = useState(1);
  const [luggage, setLuggage] = useState(0);

  // Return date/time combined state (avoids mismatched pairs)
  const [returnDateTime, setReturnDateTime] = useState<{ returnDate: string; returnTime: string }>(() =>
    generateReturnDateTime(getDefaultDateTime().dateString)
  );

  const returnDate = returnDateTime.returnDate;
  const returnTime = returnDateTime.returnTime;

  const setReturnDate = useCallback((val: string) => {
    setReturnDateTime((prev) => ({ ...prev, returnDate: val }));
  }, []);
  const setReturnTime = useCallback((val: string) => {
    setReturnDateTime((prev) => ({ ...prev, returnTime: val }));
  }, []);

  const [hourlyDuration, setHourlyDuration] = useState<number>(2);

  // Re-generate return date/time whenever pickup date changes while return type is selected
  useEffect(() => {
    if (serviceType === 'distance' && transferType === 'return') {
      setReturnDateTime(generateReturnDateTime(date));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, transferType, serviceType]);

  // ✅ Pickup time validity
  const isPickupTimeValid = useCallback((): boolean => {
    if (!date || !time) return false;
    const selected = new Date(`${date}T${time}:00`);
    if (Number.isNaN(selected.getTime())) return false;

    selected.setSeconds(0, 0);
    const min = getMinPickupDateTime();
    return selected.getTime() >= min.getTime();
  }, [date, time]);

  // Auto-correct to minimum if invalid
  useEffect(() => {
    if (!date || !time) return;
    const selected = new Date(`${date}T${time}:00`);
    if (Number.isNaN(selected.getTime())) return;

    selected.setSeconds(0, 0);
    const min = getMinPickupDateTime();

    if (selected.getTime() < min.getTime()) {
      setDate(toDateString(min));
      setTime(toTimeString(min));
    }
  }, [date, time]);

  const minDateString = useMemo(() => toDateString(getMinPickupDateTime()), []);

  const getMinReturnDate = useCallback(() => {
    const base = new Date(`${date}T00:00:00`);
    base.setDate(base.getDate() + 1);
    return toDateString(base);
  }, [date]);

  const canSearch = useMemo(() => {
    if (!pickup.address) return false;
    if (!date || !time) return false;
    if (!isPickupTimeValid()) return false;

    if (serviceType === 'distance') {
      if (!dropoff.address) return false;
      if (!pickup.placeId || !dropoff.placeId) return false;

      if (transferType === 'return') {
        if (!returnDate || !returnTime) return false;

        const pickupDT = new Date(`${date}T${time}:00`).getTime();
        const returnDT = new Date(`${returnDate}T${returnTime}:00`).getTime();
        if (!Number.isFinite(pickupDT) || !Number.isFinite(returnDT)) return false;
        if (returnDT <= pickupDT) return false;
      }
    }

    if (serviceType === 'hourly') {
      if (!hourlyDuration || hourlyDuration < 2) return false;
    }

    if (luggage < 0) return false;

    return true;
  }, [
    pickup.address,
    pickup.placeId,
    dropoff.address,
    dropoff.placeId,
    date,
    time,
    serviceType,
    transferType,
    returnDate,
    returnTime,
    hourlyDuration,
    luggage,
    isPickupTimeValid,
  ]);

  useEffect(() => {
    if (canSearch && formError) {
      setFormError(null);
    }
  }, [canSearch, formError]);

  const handleSearch = useCallback(() => {
    if (!canSearch) {
      setFormError(t('validation.fillAllFields'));
      return;
    }

    const bookingDraft = {
      version: '2.0' as const,
      timestamp: Date.now(),
      fromHomepage: true,

      serviceType,
      transferType,

      pickup: {
        address: pickup.address,
        placeId: pickup.placeId || '',
        lat: pickup.lat,
        lng: pickup.lng,
        type: pickup.type || 'address',
      },

      ...(serviceType === 'distance'
        ? {
            dropoff: {
              address: dropoff.address,
              placeId: dropoff.placeId || '',
              lat: dropoff.lat,
              lng: dropoff.lng,
              type: dropoff.type || 'address',
            },
          }
        : {}),

      pickupDateTime: { date, time },

      ...(serviceType === 'distance' && transferType === 'return'
        ? { returnDateTime: { date: returnDate, time: returnTime } }
        : {}),

      passengers: {
        count: passengers,
        luggage,
        childSeats: 0,
      },

      ...(serviceType === 'hourly' ? { hourlyDuration } : {}),

      _legacy: {
        serviceType: serviceType === 'distance' ? 'airport' : 'hourly',
        transferType: 'oneWay',
      },
    };

    sessionStorage.setItem('booking-draft', JSON.stringify(bookingDraft));
    router.push(`/${locale}/book`);
  }, [
    canSearch,
    t,
    setFormError,
    serviceType,
    transferType,
    pickup,
    dropoff,
    date,
    time,
    returnDate,
    returnTime,
    passengers,
    luggage,
    hourlyDuration,
    router,
    locale,
  ]);

  return (
    <LazyMotion features={domAnimation} strict>
      <m.div
        initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0.15 : 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-5xl mx-auto px-1 sm:px-0"
        role="search"
        aria-label={t('aria.bookingForm')}
        style={{ willChange: 'opacity, transform' }}
      >
        <div className="bg-white/95 sm:backdrop-blur-sm rounded-2xl shadow-2xl p-2 sm:p-6 [@media(max-height:750px)]:p-1.5 border border-gray-100">
          {/* Service Type Toggle */}
          <div className="flex gap-2 mb-3 sm:mb-4 [@media(max-height:750px)]:mb-2" role="tablist" aria-label={t('aria.serviceType')}>
            <ServiceTypeButton
              active={serviceType === 'distance'}
              onClick={() => {
                setServiceType('distance');
                setTransferType('oneWay');
              }}
              label={t('serviceType.distance')}
              icon={RouteIcon}
            />
            <ServiceTypeButton
              active={serviceType === 'hourly'}
              onClick={() => {
                setServiceType('hourly');
                setTransferType('oneWay');
              }}
              label={t('serviceType.hourly')}
              icon={ClockIcon}
            />
          </div>

          {/* Transfer Type */}
          {serviceType === 'distance' && (
            <div className="mb-3 sm:mb-4 [@media(max-height:750px)]:mb-2">
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">{t('transferType.label')}</label>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <TransferTypeButton active={transferType === 'oneWay'} onClick={() => setTransferType('oneWay')} label={t('transferType.oneWay')} icon={ArrowRightIcon} />
                <TransferTypeButton
                  active={transferType === 'return'}
                  onClick={() => {
                    setReturnDateTime(generateReturnDateTime(date));
                    setTransferType('return');
                  }}
                  label={t('transferType.return')}
                  icon={ArrowsIcon}
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5 sm:space-y-3 [@media(max-height:750px)]:space-y-1">
            {/* Pickup */}
            <div>
              <label htmlFor="pickup-location" className="block text-xs font-medium text-gray-700 mb-1 sm:mb-1.5">
                {t('fields.pickup.label')}
              </label>
              <LocationAutocomplete
                value={pickup.address}
                onChange={(location) => setPickup(location)}
                placeholder={t('fields.pickup.placeholder')}
                type="pickup"
                aria-label={t('fields.pickup.label')}
              />
            </div>

            {/* Dropoff */}
            {serviceType === 'distance' && (
              <div>
                <label htmlFor="dropoff-location" className="block text-xs font-medium text-gray-700 mb-1 sm:mb-1.5">
                  {t('fields.dropoff.label')}
                </label>
                <LocationAutocomplete
                  value={dropoff.address}
                  onChange={(location) => setDropoff(location)}
                  placeholder={t('fields.dropoff.placeholder')}
                  type="dropoff"
                  pickupLocation={pickup}
                  aria-label={t('fields.dropoff.label')}
                />
              </div>
            )}

            {/* Return Date/Time */}
            {serviceType === 'distance' && transferType === 'return' && (
              <div className="rounded-xl border-2 border-blue-100 bg-blue-50/60 p-2 sm:p-3 [@media(max-height:750px)]:p-2 space-y-2 sm:space-y-3">
                <p className="text-xs font-semibold text-blue-700 flex items-center gap-1.5">
                  <ArrowsIcon className="w-3.5 h-3.5" />
                  {t('transferType.returnDetails')}
                </p>

                {/* ✅ FIX: stack on mobile to prevent iOS date wrapping */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div>
                    <label htmlFor="return-date" className="block text-xs font-medium text-gray-700 mb-1 sm:mb-1.5">
                      {t('fields.returnDate.label')}
                    </label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                      <input
                        id="return-date"
                        type="date"
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        min={getMinReturnDate()}
                        aria-label={t('fields.returnDate.label')}
                        className={inputDateTime}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="return-time" className="block text-xs font-medium text-gray-700 mb-1 sm:mb-1.5">
                      {t('fields.returnTime.label')}
                    </label>
                    <div className="relative">
                      <ClockIconSmall className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                      <input
                        id="return-time"
                        type="time"
                        value={returnTime}
                        onChange={(e) => setReturnTime(e.target.value)}
                        aria-label={t('fields.returnTime.label')}
                        className={inputDateTime}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Pickup Date & Time */}
            {/* ✅ FIX: stack on mobile to prevent iOS date wrapping */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div>
                <label htmlFor="pickup-date" className="block text-xs font-medium text-gray-700 mb-1 sm:mb-1.5">
                  {t('fields.date.label')}
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                  <input
                    id="pickup-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={minDateString}
                    aria-label={t('fields.date.label')}
                    className={inputDateTime}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="pickup-time" className="block text-xs font-medium text-gray-700 mb-1 sm:mb-1.5">
                  {t('fields.time.label')}
                </label>
                <div className="relative">
                  <ClockIconSmall className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                  <input
                    id="pickup-time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    aria-label={t('fields.time.label')}
                    className={inputDateTime}
                  />
                </div>
              </div>
            </div>

            {/* Hourly Duration */}
            {serviceType === 'hourly' && (
              <div>
                <label htmlFor="hourly-duration" className="block text-xs font-medium text-gray-700 mb-1 sm:mb-1.5">
                  {t('fields.duration.label')}
                </label>
                <div className="relative">
                  <ClockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                  <select
                    id="hourly-duration"
                    value={hourlyDuration}
                    onChange={(e) => setHourlyDuration(Number(e.target.value))}
                    aria-label={t('fields.duration.label')}
                    className="block w-full min-h-[40px] sm:min-h-[48px] pl-10 pr-10 py-2 sm:py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 text-[16px] leading-[1.25] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
                  >
                    {Array.from({ length: 23 }, (_, i) => i + 2).map((hours) => (
                      <option key={hours} value={hours}>
                        {hours} {t('fields.duration.hours', { count: hours })}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Passengers + Luggage */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div>
                <label htmlFor="passengers" className="block text-xs font-medium text-gray-700 mb-1 sm:mb-1.5">
                  {t('fields.passengers.label')}
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                  <select
                    id="passengers"
                    value={passengers}
                    onChange={(e) => setPassengers(Number(e.target.value))}
                    aria-label={t('fields.passengers.label')}
                    className="block w-full min-h-[40px] sm:min-h-[48px] pl-10 pr-10 py-2 sm:py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 text-[16px] leading-[1.25] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                      <option key={num} value={num}>
                        {num} {t('fields.passengers.count', { count: num })}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label htmlFor="luggage" className="block text-xs font-medium text-gray-700 mb-1 sm:mb-1.5">
                  Luggage
                </label>
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 7V6a3 3 0 013-3h0a3 3 0 013 3v1m-9 0h10a2 2 0 012 2v10a3 3 0 01-3 3H8a3 3 0 01-3-3V9a2 2 0 012-2z"
                    />
                  </svg>

                  <select
                    id="luggage"
                    value={luggage}
                    onChange={(e) => setLuggage(Number(e.target.value))}
                    aria-label="Luggage"
                    className="block w-full min-h-[40px] sm:min-h-[48px] pl-10 pr-10 py-2 sm:py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 text-[16px] leading-[1.25] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
                  >
                    {Array.from({ length: 9 }, (_, i) => i).map((n) => (
                      <option key={n} value={n}>
                        {n} bag{n === 1 ? '' : 's'}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {formError && (
              <div
                role="alert"
                aria-live="polite"
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium"
              >
                {formError}
              </div>
            )}

            {/* Search Button */}
            <button
              onClick={handleSearch}
              disabled={!canSearch}
              aria-label={t('button.search')}
              className={`w-full px-6 py-2.5 sm:py-4 rounded-xl font-bold text-sm transition-all duration-200 shadow-lg active:scale-95 ${
                canSearch
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-amber-500/25'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <SearchIcon className="w-5 h-5" />
                <span>{t('button.search')}</span>
              </div>
            </button>
          </div>
        </div>
      </m.div>
    </LazyMotion>
  );
});

// ============================================================================
// BUTTONS + ICONS (unchanged)
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
      className={`flex-1 px-3 py-2 sm:px-4 sm:py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
        active ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95'
      }`}
    >
      <div className="flex items-center justify-center gap-2">
        <Icon className="w-4 h-4" />
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
      className={`px-3 py-2 sm:px-4 sm:py-3 rounded-xl border-2 font-semibold text-sm transition-all duration-200 active:scale-95 ${
        active ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-700 hover:border-gray-300'
      }`}
    >
      <div className="flex items-center justify-center gap-2">
        <Icon className="w-4 h-4" />
        <span>{label}</span>
      </div>
    </button>
  );
});

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

const ClockIconSmall = memo(function ClockIconSmall({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
});

const CalendarIcon = memo(function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
});

const UserIcon = memo(function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
});

const SearchIcon = memo(function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 9 9 0 0114 0z" />
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

const ChevronDownIcon = memo(function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
});

export default HeroBookingForm;
