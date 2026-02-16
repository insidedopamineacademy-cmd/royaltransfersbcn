'use client';

import React, { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react';
import { m, AnimatePresence, LazyMotion, domAnimation, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useBooking } from '@/lib/booking/context';
import LocationAutocomplete from '../ui/LocationAutocomplete';
import { calculateDistanceByPlaceId } from '@/app/[locale]/services/googleMaps';
import { getMinBookableDate } from '@/lib/booking/utils';
import type { ServiceType, TransferType } from '@/lib/booking/types';

type ServiceCategory = 'distance' | 'hourly';

const RideDetailsStep = memo(function RideDetailsStep() {
  const t = useTranslations('step1');
  const { bookingData, updateBookingData } = useBooking();
  const prefersReducedMotion = useReducedMotion();

  // ----------------------------
  // Helpers
  // ----------------------------
  const minDateTime = useMemo(() => {
    const d = getMinBookableDate();
    d.setSeconds(0, 0);
    return d;
  }, []);

  const toDateString = (d: Date) => d.toISOString().slice(0, 10);

  const toTimeString = (d: Date) => {
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const minDateString = useMemo(() => toDateString(minDateTime), [minDateTime]);

  // ----------------------------
  // ✅ iOS-safe input styles
  // - DO NOT force tight width on mobile
  // - Keep 16px font to avoid iOS zoom
  // ----------------------------
  const inputWithIcon =
    'block w-full min-h-[48px] pl-11 pr-4 py-3 bg-white border-2 border-gray-300 rounded-xl ' +
    'text-gray-900 text-[16px] leading-[1.25] font-medium focus:outline-none focus:border-blue-500 ' +
    'focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none [color-scheme:light]';

  const inputPlain =
    'block w-full min-h-[48px] px-4 py-3 bg-white border-2 border-gray-300 rounded-xl ' +
    'text-gray-900 text-[16px] leading-[1.25] font-medium focus:outline-none focus:border-blue-500 ' +
    'focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none [color-scheme:light]';

  // ----------------------------
  // Single source of truth: derive UI state from bookingData
  // ----------------------------
  const serviceCategory: ServiceCategory = bookingData.serviceType === 'hourly' ? 'hourly' : 'distance';
  const transferType: TransferType = bookingData.transferType === 'return' ? 'return' : 'oneWay';
  const hourlyDuration = bookingData.hourlyDuration ?? 2;

  // prevent strict-mode double init loops
  const didInitRef = useRef(false);

  // ----------------------------
  // Ensure bookingData has a valid default date/time (run once)
  // ----------------------------
  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;

    const currentDate = bookingData.dateTime.date;
    const currentTime = bookingData.dateTime.time;

    if (!currentDate || !currentTime) {
      updateBookingData({
        dateTime: {
          ...bookingData.dateTime,
          date: toDateString(minDateTime),
          time: toTimeString(minDateTime),
        },
      });
      return;
    }

    const selected = new Date(`${currentDate}T${currentTime}:00`);
    if (!Number.isFinite(selected.getTime())) return;

    selected.setSeconds(0, 0);

    if (selected.getTime() < minDateTime.getTime()) {
      updateBookingData({
        dateTime: {
          ...bookingData.dateTime,
          date: toDateString(minDateTime),
          time: toTimeString(minDateTime),
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----------------------------
  // Return date/time rules
  // ----------------------------
  const minReturnDate = useMemo(() => {
    if (!bookingData.dateTime.date) return '';
    const d = new Date(`${bookingData.dateTime.date}T00:00:00`);
    d.setDate(d.getDate() + 1);
    return toDateString(d);
  }, [bookingData.dateTime.date]);

  const ensureReturnIsValid = useCallback(
    (returnDate?: string, returnTime?: string) => {
      if (bookingData.serviceType !== 'distance') return;
      if (bookingData.transferType !== 'return') return;

      const pd = bookingData.dateTime.date;
      const pt = bookingData.dateTime.time;
      if (!pd || !pt || !returnDate || !returnTime) return;

      const pickupTS = new Date(`${pd}T${pt}:00`).getTime();
      const returnTS = new Date(`${returnDate}T${returnTime}:00`).getTime();

      if (!Number.isFinite(pickupTS) || !Number.isFinite(returnTS)) return;

      if (returnTS <= pickupTS) {
        const nextDay = new Date(`${pd}T${pt}:00`);
        nextDay.setDate(nextDay.getDate() + 1);
        updateBookingData({
          dateTime: {
            ...bookingData.dateTime,
            returnDate: toDateString(nextDay),
            returnTime: toTimeString(nextDay),
          },
        });
      }
    },
    [bookingData, updateBookingData]
  );

  // ----------------------------
  // Distance calculation (distance bookings only)
  // ----------------------------
  const [isCalculating, setIsCalculating] = useState(false);
  const [distanceInfo, setDistanceInfo] = useState<{
    distance: string;
    duration: string;
    distanceKm: number;
  } | null>(null);

  const calculateDistance = useCallback(async () => {
    if (bookingData.serviceType !== 'distance') return;

    const p1 = bookingData.pickup.placeId;
    const p2 = bookingData.dropoff?.placeId;

    if (!p1 || !p2 || p1 === p2) return;

    setIsCalculating(true);
    try {
      const result = await calculateDistanceByPlaceId(p1, p2);
      const distanceKm = result.distance.value / 1000;

      setDistanceInfo({
        distance: result.distance.text,
        duration: result.duration.text,
        distanceKm,
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
  }, [bookingData.serviceType, bookingData.pickup.placeId, bookingData.dropoff?.placeId, updateBookingData]);

  useEffect(() => {
    calculateDistance();
  }, [calculateDistance]);

  // ----------------------------
  // Handlers
  // ----------------------------
  const handleServiceCategoryChange = useCallback(
    (category: ServiceCategory) => {
      const mappedServiceType: ServiceType = category === 'hourly' ? 'hourly' : 'distance';

      updateBookingData({ serviceType: mappedServiceType });

      if (mappedServiceType === 'hourly') {
        updateBookingData({
          dropoff: { address: '' },
          distance: undefined,
          duration: undefined,
          transferType: 'oneWay',
          dateTime: {
            ...bookingData.dateTime,
            returnDate: undefined,
            returnTime: undefined,
          },
          hourlyDuration: bookingData.hourlyDuration ?? 2,
        });
      } else {
        updateBookingData({
          hourlyDuration: undefined,
          transferType: bookingData.transferType ?? 'oneWay',
        });
      }
    },
    [updateBookingData, bookingData.dateTime, bookingData.hourlyDuration, bookingData.transferType]
  );

  const handleTransferTypeChange = useCallback(
    (type: TransferType) => {
      if (bookingData.serviceType !== 'distance') return;

      updateBookingData({ transferType: type });

      if (type === 'oneWay') {
        if (bookingData.dateTime.returnDate || bookingData.dateTime.returnTime) {
          updateBookingData({
            dateTime: { ...bookingData.dateTime, returnDate: undefined, returnTime: undefined },
          });
        }
        return;
      }

      if (!bookingData.dateTime.returnDate || !bookingData.dateTime.returnTime) {
        const base = new Date(
          `${bookingData.dateTime.date || minDateString}T${bookingData.dateTime.time || '10:00'}:00`
        );
        base.setDate(base.getDate() + 1);
        updateBookingData({
          dateTime: {
            ...bookingData.dateTime,
            returnDate: toDateString(base),
            returnTime: toTimeString(base),
          },
        });
      }
    },
    [bookingData.serviceType, bookingData.dateTime, minDateString, updateBookingData]
  );

  const handleHourlyDurationChange = useCallback(
    (hours: number) => {
      if (bookingData.serviceType !== 'hourly') return;
      updateBookingData({ hourlyDuration: hours });
    },
    [bookingData.serviceType, updateBookingData]
  );

  return (
    <LazyMotion features={domAnimation} strict>
      <div className="space-y-6 sm:space-y-8">
        <header className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">{t('title')}</h1>
          <p className="text-sm sm:text-lg text-gray-600">{t('subtitle')}</p>
        </header>

        {/* Service Category Tabs */}
        <div className="max-w-md mx-auto">
          <div className="bg-gray-100 rounded-xl p-1.5 sm:p-2 flex gap-1.5 sm:gap-2" role="tablist" aria-label={t('serviceType.aria')}>
            <ServiceTypeButton
              active={serviceCategory === 'distance'}
              onClick={() => handleServiceCategoryChange('distance')}
              icon={RouteIcon}
              fullLabel={t('serviceType.distance.full')}
              shortLabel={t('serviceType.distance.short')}
              ariaLabel={t('serviceType.distance.label')}
            />
            <ServiceTypeButton
              active={serviceCategory === 'hourly'}
              onClick={() => handleServiceCategoryChange('hourly')}
              icon={ClockIcon}
              fullLabel={t('serviceType.hourly.full')}
              shortLabel={t('serviceType.hourly.short')}
              ariaLabel={t('serviceType.hourly.label')}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <m.div
            key={serviceCategory}
            initial={!prefersReducedMotion ? { opacity: 0, x: 20 } : { opacity: 1 }}
            animate={{ opacity: 1, x: 0 }}
            exit={!prefersReducedMotion ? { opacity: 0, x: -20 } : { opacity: 1 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl mx-auto space-y-4 sm:space-y-6"
          >
            {/* ✅ FIX: stack date/time on mobile so iOS date does NOT wrap */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label htmlFor="pickup-date" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  {t('fields.date.label')}
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                    <CalendarIcon className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="pickup-date"
                    type="date"
                    value={bookingData.dateTime.date}
                    onChange={(e) => {
                      updateBookingData({ dateTime: { ...bookingData.dateTime, date: e.target.value } });
                      ensureReturnIsValid(bookingData.dateTime.returnDate, bookingData.dateTime.returnTime);
                    }}
                    min={minDateString}
                    aria-label={t('fields.date.label')}
                    className={inputWithIcon}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="pickup-time" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  {t('fields.time.label')}
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                    <ClockIconSmall className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="pickup-time"
                    type="time"
                    value={bookingData.dateTime.time}
                    onChange={(e) => {
                      updateBookingData({ dateTime: { ...bookingData.dateTime, time: e.target.value } });
                      ensureReturnIsValid(bookingData.dateTime.returnDate, bookingData.dateTime.returnTime);
                    }}
                    aria-label={t('fields.time.label')}
                    className={inputWithIcon}
                  />
                </div>
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

              {serviceCategory === 'distance' && (
                <LocationAutocomplete
                  value={bookingData.dropoff?.address ?? ''}
                  onChange={(location) => updateBookingData({ dropoff: location })}
                  placeholder={t('fields.dropoff.placeholder')}
                  label={t('fields.dropoff.label')}
                  type="dropoff"
                  pickupLocation={bookingData.pickup}
                />
              )}
            </div>

            {/* Transfer Type */}
            {serviceCategory === 'distance' && (
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                  {t('fields.transferType.label')}
                </label>

                <div className="grid grid-cols-2 gap-3 sm:gap-4" role="radiogroup" aria-label={t('fields.transferType.label')}>
                  <TransferTypeButton
                    active={transferType === 'oneWay'}
                    onClick={() => handleTransferTypeChange('oneWay')}
                    icon={ArrowRightIcon}
                    label={t('fields.transferType.oneWay')}
                    ariaLabel={t('fields.transferType.oneWay')}
                  />
                  <TransferTypeButton
                    active={transferType === 'return'}
                    onClick={() => handleTransferTypeChange('return')}
                    icon={ArrowsIcon}
                    label={t('fields.transferType.return')}
                    ariaLabel={t('fields.transferType.return')}
                    note={t('fields.transferType.returnNote')}
                  />
                </div>

                {transferType === 'return' && (
                  <div className="mt-4 rounded-xl border-2 border-blue-100 bg-blue-50/60 p-4 space-y-3">
                    <p className="text-xs font-semibold text-blue-700 flex items-center gap-2">
                      <ArrowsIcon className="w-4 h-4" />
                      {t('fields.returnDetailsTitle')}
                    </p>

                    {/* ✅ FIX: stack return date/time on mobile so iOS date does NOT wrap */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-2">{t('fields.returnDate.label')}</label>
                        <input
                          type="date"
                          value={bookingData.dateTime.returnDate || ''}
                          min={minReturnDate}
                          onChange={(e) => {
                            updateBookingData({ dateTime: { ...bookingData.dateTime, returnDate: e.target.value } });
                            ensureReturnIsValid(e.target.value, bookingData.dateTime.returnTime);
                          }}
                          className={inputPlain}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-2">{t('fields.returnTime.label')}</label>
                        <input
                          type="time"
                          value={bookingData.dateTime.returnTime || ''}
                          onChange={(e) => {
                            updateBookingData({ dateTime: { ...bookingData.dateTime, returnTime: e.target.value } });
                            ensureReturnIsValid(bookingData.dateTime.returnDate, e.target.value);
                          }}
                          className={inputPlain}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Hourly Duration */}
            {serviceCategory === 'hourly' && (
              <div>
                <label htmlFor="hourlyDuration" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  {t('fields.duration.label')}
                </label>
                <div className="relative">
                  <select
                    id="hourlyDuration"
                    value={hourlyDuration}
                    onChange={(e) => handleHourlyDurationChange(Number(e.target.value))}
                    aria-label={t('fields.duration.label')}
                    className="w-full min-h-[48px] px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 text-[16px] leading-[1.25] font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
                  >
                    {Array.from({ length: 23 }, (_, i) => i + 2).map((h) => (
                      <option key={h} value={h}>
                        {t('fields.duration.hours', { count: h })}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
                <p className="mt-2 text-[10px] sm:text-xs text-gray-500">{t('fields.duration.note')}</p>
              </div>
            )}

            {/* Passengers */}
            <div>
              <label htmlFor="passengers" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                {t('fields.passengers.label')}
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                  <UserIcon className="w-5 h-5 text-gray-400" />
                </div>
                <select
                  id="passengers"
                  value={bookingData.passengers.count}
                  onChange={(e) =>
                    updateBookingData({ passengers: { ...bookingData.passengers, count: Number(e.target.value) } })
                  }
                  aria-label={t('fields.passengers.label')}
                  className="w-full min-h-[48px] pl-11 pr-10 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 text-[16px] leading-[1.25] font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
                >
                  {Array.from({ length: 8 }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>
                      {t('fields.passengers.count', { count: num })}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Distance Info */}
            {serviceCategory === 'distance' && distanceInfo && !isCalculating && (
              <m.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
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
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">{t('summary.transferType')}</p>
                    <p className="text-lg sm:text-xl font-bold text-gray-900">
                      {transferType === 'oneWay' ? t('fields.transferType.oneWay') : t('fields.transferType.return')}
                    </p>
                  </div>
                </div>
              </m.div>
            )}

            {isCalculating && (
              <div className="text-center py-3 sm:py-4" role="status" aria-live="polite">
                <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-gray-50 rounded-full">
                  <LoadingSpinner />
                  <span className="text-xs sm:text-sm text-gray-600">{t('calculating')}</span>
                </div>
              </div>
            )}
          </m.div>
        </AnimatePresence>
      </div>
    </LazyMotion>
  );
});

RideDetailsStep.displayName = 'RideDetailsStep';

// ============================================================================
// BUTTONS + ICONS (unchanged)
// ============================================================================

const ServiceTypeButton = memo(function ServiceTypeButton({
  active,
  onClick,
  icon: Icon,
  fullLabel,
  shortLabel,
  ariaLabel,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  fullLabel: string;
  shortLabel: string;
  ariaLabel: string;
}) {
  return (
    <button
      onClick={onClick}
      role="tab"
      aria-selected={active}
      aria-label={ariaLabel}
      className={`flex-1 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all duration-200 active:scale-95 ${
        active ? 'bg-white text-blue-600 shadow-md' : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      <div className="flex items-center justify-center gap-1.5 sm:gap-2">
        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="hidden xs:inline">{fullLabel}</span>
        <span className="xs:hidden">{shortLabel}</span>
      </div>
    </button>
  );
});

const TransferTypeButton = memo(function TransferTypeButton({
  active,
  onClick,
  icon: Icon,
  label,
  ariaLabel,
  note,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  ariaLabel: string;
  note?: string;
}) {
  return (
    <button
      onClick={onClick}
      role="radio"
      aria-checked={active}
      aria-label={ariaLabel}
      className={`px-4 sm:px-6 py-3 sm:py-4 rounded-xl border-2 font-semibold text-sm sm:text-base transition-all duration-200 active:scale-95 ${
        active ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-700 hover:border-gray-300'
      }`}
    >
      <div className="flex items-center justify-center gap-1.5 sm:gap-2">
        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        <span>{label}</span>
      </div>
      {note && <p className="text-[10px] sm:text-xs text-gray-500 mt-1">{note}</p>}
    </button>
  );
});

const RouteIcon = memo(function RouteIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
      />
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
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
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

const UserIcon = memo(function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
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

const LoadingSpinner = memo(function LoadingSpinner() {
  return (
    <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
});

export default RideDetailsStep;