// ✅ FIXES APPLIED:
// 1) Date/Time vertical alignment fixed (WebKit/Safari/iOS “lifted text”)
// 2) Return toggle reliability fixed (atomic updates + type="button")

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
  // ✅ Input styles
  // - inputWithIcon is used by date/time too
  // - adds WebKit pseudo selectors to vertically center date/time value
  // ----------------------------
  const inputWithIcon =
    'block w-full h-12 pl-12 pr-4 bg-white border-2 border-gray-200 rounded-xl text-gray-900 ' +
    'text-[16px] leading-normal font-medium ' +
    'focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ' +
    'transition-all appearance-none [-webkit-appearance:none] [color-scheme:light] ' +
    // ✅ Safari/iOS: force internal value alignment
    '[&::-webkit-date-and-time-value]:h-full [&::-webkit-date-and-time-value]:flex [&::-webkit-date-and-time-value]:items-center ' +
    '[&::-webkit-date-and-time-value]:p-0 [&::-webkit-date-and-time-value]:m-0 ' +
    // ✅ remove extra inner padding/widgets where possible
    '[&::-webkit-inner-spin-button]:hidden [&::-webkit-clear-button]:hidden';

  const selectPlain =
    'w-full h-12 px-4 pr-10 py-2 bg-white border-2 border-gray-200 rounded-xl text-gray-900 ' +
    'text-[16px] leading-[1.25] font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ' +
    'transition-all appearance-none cursor-pointer [color-scheme:light]';

  // ----------------------------
  // ✅ Single source of truth: derive UI state from bookingData
  // ----------------------------
  const serviceCategory: ServiceCategory = bookingData.serviceType === 'hourly' ? 'hourly' : 'distance';
  const transferType: TransferType = bookingData.transferType === 'return' ? 'return' : 'oneWay';
  const hourlyDuration = bookingData.hourlyDuration ?? 2;

  // prevent strict-mode double init loops
  const didInitRef = useRef(false);

  // ----------------------------
  // ✅ Ensure bookingData has valid defaults (run once)
  // ----------------------------
  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;

    const patches: Partial<typeof bookingData> = {};

    // date/time normalize
    const currentDate = bookingData.dateTime?.date;
    const currentTime = bookingData.dateTime?.time;

    const desiredDate = currentDate || toDateString(minDateTime);
    const desiredTime = currentTime || toTimeString(minDateTime);

    const selected = new Date(`${desiredDate}T${desiredTime}:00`);
    if (Number.isFinite(selected.getTime())) {
      selected.setSeconds(0, 0);
      if (selected.getTime() < minDateTime.getTime()) {
        patches.dateTime = {
          ...bookingData.dateTime,
          date: toDateString(minDateTime),
          time: toTimeString(minDateTime),
        };
      } else if (!currentDate || !currentTime) {
        patches.dateTime = {
          ...bookingData.dateTime,
          date: desiredDate,
          time: desiredTime,
        };
      }
    } else {
      patches.dateTime = {
        ...bookingData.dateTime,
        date: toDateString(minDateTime),
        time: toTimeString(minDateTime),
      };
    }

    // passengers defaults
    const hasPassengers = Boolean(bookingData.passengers);
    if (!hasPassengers) {
      patches.passengers = { count: 1, luggage: 0, childSeats: 0 };
    } else {
      const nextPassengers = { ...bookingData.passengers };

      const c = Number(nextPassengers.count);
      const l = Number(nextPassengers.luggage);

      if (!Number.isFinite(c) || c < 1) nextPassengers.count = 1;
      if (!Number.isFinite(l) || l < 0) nextPassengers.luggage = 0;

      const cs = Number(nextPassengers.childSeats);
      if (!Number.isFinite(cs) || cs < 0) nextPassengers.childSeats = 0;

      if (
        nextPassengers.count !== bookingData.passengers.count ||
        nextPassengers.luggage !== bookingData.passengers.luggage ||
        nextPassengers.childSeats !== bookingData.passengers.childSeats
      ) {
        patches.passengers = nextPassengers;
      }
    }

    // ensure hourlyDuration default when hourly
    if (bookingData.serviceType === 'hourly' && !bookingData.hourlyDuration) {
      patches.hourlyDuration = 2;
    }

    if (Object.keys(patches).length > 0) updateBookingData(patches);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----------------------------
  // Return date/time rules
  // ----------------------------
  const minReturnDate = useMemo(() => {
    if (!bookingData.dateTime?.date) return '';
    const d = new Date(`${bookingData.dateTime.date}T00:00:00`);
    d.setDate(d.getDate() + 1);
    return toDateString(d);
  }, [bookingData.dateTime?.date]);

  const ensureReturnIsValid = useCallback(
    (returnDate?: string, returnTime?: string) => {
      if (bookingData.serviceType !== 'distance') return;
      if (bookingData.transferType !== 'return') return;

      const pd = bookingData.dateTime?.date;
      const pt = bookingData.dateTime?.time;
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
  // ✅ Distance calculation (distance bookings only)
  // ----------------------------
  const [isCalculating, setIsCalculating] = useState(false);
  const [distanceInfo, setDistanceInfo] = useState<{
    distance: string;
    duration: string;
    distanceKm: number;
  } | null>(null);

  const calculateDistance = useCallback(async () => {
    if (bookingData.serviceType !== 'distance') return;

    const p1 = bookingData.pickup?.placeId;
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
  }, [bookingData.serviceType, bookingData.pickup?.placeId, bookingData.dropoff?.placeId, updateBookingData]);

  useEffect(() => {
    calculateDistance();
  }, [calculateDistance]);

  // ----------------------------
  // Handlers (✅ made atomic)
  // ----------------------------
  const handleServiceCategoryChange = useCallback(
    (category: ServiceCategory) => {
      const mappedServiceType: ServiceType = category === 'hourly' ? 'hourly' : 'distance';

      if (mappedServiceType === 'hourly') {
        updateBookingData({
          serviceType: 'hourly',
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
          serviceType: 'distance',
          hourlyDuration: undefined,
          // keep whatever was there, but default to oneWay if missing
          transferType: bookingData.transferType ?? 'oneWay',
        });
      }
    },
    [updateBookingData, bookingData.dateTime, bookingData.hourlyDuration, bookingData.transferType]
  );

  const handleTransferTypeChange = useCallback(
    (type: TransferType) => {
      if (bookingData.serviceType !== 'distance') return;

      // ✅ one atomic update so it never "sometimes" fails
      if (type === 'oneWay') {
        updateBookingData({
          transferType: 'oneWay',
          dateTime: {
            ...bookingData.dateTime,
            returnDate: undefined,
            returnTime: undefined,
          },
        });
        return;
      }

      // type === 'return'
      const pd = bookingData.dateTime?.date || minDateString;
      const pt = bookingData.dateTime?.time || '10:00';

      const hasReturn = Boolean(bookingData.dateTime?.returnDate && bookingData.dateTime?.returnTime);

      let nextReturnDate = bookingData.dateTime?.returnDate;
      let nextReturnTime = bookingData.dateTime?.returnTime;

      if (!hasReturn) {
        const base = new Date(`${pd}T${pt}:00`);
        base.setSeconds(0, 0);
        base.setDate(base.getDate() + 1);
        nextReturnDate = toDateString(base);
        nextReturnTime = toTimeString(base);
      }

      updateBookingData({
        transferType: 'return',
        dateTime: {
          ...bookingData.dateTime,
          returnDate: nextReturnDate,
          returnTime: nextReturnTime,
        },
      });
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

  const handlePassengersChange = useCallback(
    (count: number) => {
      updateBookingData({
        passengers: {
          ...(bookingData.passengers ?? { luggage: 0, childSeats: 0, count: 1 }),
          count,
        },
      });
    },
    [bookingData.passengers, updateBookingData]
  );

  const handleLuggageChange = useCallback(
    (luggage: number) => {
      updateBookingData({
        passengers: {
          ...(bookingData.passengers ?? { luggage: 0, childSeats: 0, count: 1 }),
          luggage,
        },
      });
    },
    [bookingData.passengers, updateBookingData]
  );

  return (
    <LazyMotion features={domAnimation} strict>
      <div className="space-y-6 sm:space-y-8">
        {/* Title */}
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

        {/* Form Content */}
        <AnimatePresence mode="wait">
          <m.div
            key={serviceCategory}
            initial={!prefersReducedMotion ? { opacity: 0, x: 20 } : { opacity: 1 }}
            animate={{ opacity: 1, x: 0 }}
            exit={!prefersReducedMotion ? { opacity: 0, x: -20 } : { opacity: 1 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl mx-auto space-y-4 sm:space-y-6"
            style={{ willChange: prefersReducedMotion ? 'auto' : 'opacity, transform' }}
          >
            {/* ✅ Date & Time */}
            <div className="grid grid-cols-2 gap-2 sm:gap-6">
              <div>
                <label htmlFor="pickup-date" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                  {t('fields.date.label')}
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                    <CalendarIcon className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="pickup-date"
                    type="date"
                    value={bookingData.dateTime?.date || ''}
                    onChange={(e) => {
                      const nextDate = e.target.value;
                      updateBookingData({ dateTime: { ...bookingData.dateTime, date: nextDate } });
                      ensureReturnIsValid(nextDate ? nextDate : bookingData.dateTime?.returnDate, bookingData.dateTime?.returnTime);
                    }}
                    min={minDateString}
                    aria-label={t('fields.date.label')}
                    className={inputWithIcon}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="pickup-time" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                  {t('fields.time.label')}
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                    <ClockIconSmall className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="pickup-time"
                    type="time"
                    value={bookingData.dateTime?.time || ''}
                    onChange={(e) => {
                      const nextTime = e.target.value;
                      updateBookingData({ dateTime: { ...bookingData.dateTime, time: nextTime } });
                      ensureReturnIsValid(bookingData.dateTime?.returnDate, nextTime);
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
                value={bookingData.pickup?.address || ''}
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

            {/* Transfer Type (distance only) */}
            {serviceCategory === 'distance' && (
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                  {t('fields.transferType.label')}
                </label>

                <div className="grid grid-cols-2 gap-2 sm:gap-4" role="radiogroup" aria-label={t('fields.transferType.label')}>
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
                  <div className="mt-3 sm:mt-4 rounded-xl border-2 border-blue-100 bg-blue-50/60 p-3 sm:p-4 space-y-3">
                    <p className="text-xs font-semibold text-blue-700 flex items-center gap-2">
                      <ArrowsIcon className="w-4 h-4" />
                      {t('fields.returnDetailsTitle')}
                    </p>

                    <div className="grid grid-cols-2 gap-2 sm:gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5 sm:mb-2">
                          {t('fields.returnDate.label')}
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                            <CalendarIcon className="w-5 h-5 text-gray-400" />
                          </div>
                          <input
                            type="date"
                            value={bookingData.dateTime?.returnDate || ''}
                            min={minReturnDate}
                            onChange={(e) => {
                              const next = e.target.value;
                              updateBookingData({ dateTime: { ...bookingData.dateTime, returnDate: next } });
                              ensureReturnIsValid(next, bookingData.dateTime?.returnTime);
                            }}
                            className={inputWithIcon}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5 sm:mb-2">
                          {t('fields.returnTime.label')}
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                            <ClockIconSmall className="w-5 h-5 text-gray-400" />
                          </div>
                          <input
                            type="time"
                            value={bookingData.dateTime?.returnTime || ''}
                            onChange={(e) => {
                              const next = e.target.value;
                              updateBookingData({ dateTime: { ...bookingData.dateTime, returnTime: next } });
                              ensureReturnIsValid(bookingData.dateTime?.returnDate, next);
                            }}
                            className={inputWithIcon}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Hourly Duration */}
            {serviceCategory === 'hourly' && (
              <div>
                <label htmlFor="hourlyDuration" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                  {t('fields.duration.label')}
                </label>
                <div className="relative">
                  <select
                    id="hourlyDuration"
                    value={hourlyDuration}
                    onChange={(e) => handleHourlyDurationChange(Number(e.target.value))}
                    aria-label={t('fields.duration.label')}
                    className={selectPlain}
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

            {/* ✅ Passengers + Luggage */}
            <div className="grid grid-cols-2 gap-3 sm:gap-6 items-start">
              <div className="min-w-0">
                <div className="min-h-[36px] sm:min-h-[40px] flex items-end">
                  <label htmlFor="passengers" className="block text-xs sm:text-sm font-semibold text-gray-700 leading-tight">
                    {t('fields.passengers.label')}
                  </label>
                </div>

                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                  <select
                    id="passengers"
                    value={bookingData.passengers?.count ?? 1}
                    onChange={(e) => handlePassengersChange(Number(e.target.value))}
                    aria-label={t('fields.passengers.label')}
                    className="w-full h-12 pl-12 pr-12 py-2 bg-white border-2 border-gray-200 rounded-xl
                               text-gray-900 text-[16px] leading-[1.25] font-medium
                               focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                               transition-all appearance-none cursor-pointer [color-scheme:light]"
                  >
                    {Array.from({ length: 8 }, (_, i) => i + 1).map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                </div>

                <p className="mt-1 text-[10px] sm:text-xs text-gray-500">
                  {t('fields.passengers.count', { count: bookingData.passengers?.count ?? 1 })}
                </p>
              </div>

              <div className="min-w-0">
                <div className="min-h-[36px] sm:min-h-[40px] flex items-end">
                  <label htmlFor="luggage" className="block text-xs sm:text-sm font-semibold text-gray-700 leading-tight">
                    Luggage
                  </label>
                </div>

                <div className="relative">
                  <SuitcaseIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                  <select
                    id="luggage"
                    value={bookingData.passengers?.luggage ?? 0}
                    onChange={(e) => handleLuggageChange(Number(e.target.value))}
                    aria-label="Luggage"
                    className="w-full h-12 pl-12 pr-12 py-2 bg-white border-2 border-gray-200 rounded-xl
                               text-gray-900 text-[16px] leading-[1.25] font-medium
                               focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                               transition-all appearance-none cursor-pointer [color-scheme:light]"
                  >
                    {Array.from({ length: 9 }, (_, i) => i).map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                </div>

                <p className="mt-1 text-[10px] sm:text-xs text-gray-500">
                  {bookingData.passengers?.luggage ?? 0} bag{(bookingData.passengers?.luggage ?? 0) === 1 ? '' : 's'}
                </p>
              </div>
            </div>

            {/* Distance Info */}
            {serviceCategory === 'distance' && distanceInfo && !isCalculating && (
              <m.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-3 sm:p-6 border border-blue-100"
                role="status"
                aria-live="polite"
              >
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
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

            {/* Calculating Indicator */}
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
// BUTTONS + ICONS
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
      type="button" // ✅ important
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
      type="button" // ✅ important
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

// Icons (unchanged)
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

const SuitcaseIcon = memo(function SuitcaseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 7V6a3 3 0 013-3h0a3 3 0 013 3v1m-9 0h10a2 2 0 012 2v10a3 3 0 01-3 3H8a3 3 0 01-3-3V9a2 2 0 012-2z"
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
  );
});

export default RideDetailsStep;