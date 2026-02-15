'use client';

/**
 * Step 4: Booking Summary & Confirmation - STRIPE INTEGRATED (FIXED)
 * - Payment method is taken from bookingData.paymentMethod (no local state reset)
 * - Updates bookingData.paymentMethod when toggled here
 * - Mobile: scroll to top on mount
 * - Summary shows correct fields for hourly vs distance and oneWay vs return
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { m } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useBooking } from '@/lib/booking/context';
import { formatPrice } from '@/lib/booking/utils';
import { useLocale } from 'next-intl';
import type { PaymentMethod } from '@/lib/booking/types';

export default function BookingSummaryStep() {
  const t = useTranslations('step4');
  const { bookingData, updateBookingData } = useBooking();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const locale = useLocale();

  // ✅ single source of truth (persisted from Step3)
  const paymentMethod: PaymentMethod = bookingData.paymentMethod ?? 'cash';

  const isHourly = bookingData.serviceType === 'hourly';
  const isDistance = bookingData.serviceType === 'distance';
  const isReturn = isDistance && bookingData.transferType === 'return';
  const dropoffAddress = bookingData.dropoff?.address ?? '';

  // ✅ scroll to top on mobile when Step4 mounts
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.innerWidth <= 768) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const handlePaymentMethodChange = useCallback(
    (method: PaymentMethod) => {
      if (isProcessing) return;
      if (paymentMethod === method) return;
      updateBookingData({ paymentMethod: method });
    },
    [isProcessing, paymentMethod, updateBookingData]
  );

  const rideDateTimeLabel = useMemo(() => {
    const base = `${bookingData.dateTime.date} ${t('at')} ${bookingData.dateTime.time}`;
    if (!isReturn) return base;

    const rd = bookingData.dateTime.returnDate;
    const rt = bookingData.dateTime.returnTime;
    if (!rd || !rt) return base;

    return `${base} • ${t('returnAt') ?? 'Return'}: ${rd} ${t('at')} ${rt}`;
  }, [bookingData.dateTime.date, bookingData.dateTime.time, bookingData.dateTime.returnDate, bookingData.dateTime.returnTime, isReturn, t]);

  const handleConfirmBooking = useCallback(async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // Safety: require pricing and selected vehicle before confirming
      if (!bookingData.selectedVehicle) {
        throw new Error('No vehicle selected');
      }
      if (!bookingData.pricing) {
        throw new Error('Pricing not calculated');
      }

      if (paymentMethod === 'cash') {
        const response = await fetch('/api/booking/create-cash-booking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingData, locale }),
        });

        const data: { success?: boolean; error?: string; redirectUrl?: string } = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to create booking');
        }
        if (!data.redirectUrl) {
          throw new Error('No redirect URL received');
        }

        window.location.href = data.redirectUrl;
        return;
      }

      // Card payment - create Stripe checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingData, locale }),
      });

      const data: { success?: boolean; error?: string; url?: string } = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create checkout session');
      }
      if (!data.url) {
        throw new Error('No checkout URL received');
      }

      window.location.href = data.url;
    } catch (err) {
      console.error('Booking error:', err);
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(msg);
      setIsProcessing(false);
    }
  }, [paymentMethod, bookingData, locale]);

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

      {/* Error Message */}
      {error && (
        <m.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-800 mb-1">Payment Error</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600 transition-colors"
              aria-label="Dismiss error"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </m.div>
      )}

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Contact */}
          <EditableSection title={t('sections.contact')}>
            <InfoRow label={t('fields.name')} value={`${bookingData.passengerDetails.firstName} ${bookingData.passengerDetails.lastName}`} />
            <InfoRow label={t('fields.email')} value={bookingData.passengerDetails.email} />
            <InfoRow label={t('fields.phone')} value={`${bookingData.passengerDetails.countryCode} ${bookingData.passengerDetails.phone}`} />
            <InfoRow label={t('fields.passengers')} value={`${bookingData.passengers.count}`} />

            {bookingData.passengerDetails.flightNumber && (
              <InfoRow label={t('fields.flightNumber')} value={bookingData.passengerDetails.flightNumber} />
            )}
            {bookingData.passengerDetails.specialRequests && (
              <InfoRow label={t('fields.comments')} value={bookingData.passengerDetails.specialRequests} />
            )}
          </EditableSection>

          {/* Payment */}
          <EditableSection title={t('sections.payment')}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4" role="radiogroup" aria-label={t('sections.payment')}>
              <button
                type="button"
                onClick={() => handlePaymentMethodChange('cash')}
                role="radio"
                aria-checked={paymentMethod === 'cash'}
                aria-label={t('payment.cash')}
                disabled={isProcessing}
                className={`p-3 sm:p-4 rounded-xl border-2 transition-all touch-manipulation ${
                  paymentMethod === 'cash' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div
                    className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      paymentMethod === 'cash' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                    }`}
                  >
                    {paymentMethod === 'cash' && <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-white rounded-full" />}
                  </div>
                  <span className="text-sm sm:text-base font-semibold text-gray-900">{t('payment.cash')}</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handlePaymentMethodChange('card')}
                role="radio"
                aria-checked={paymentMethod === 'card'}
                aria-label={t('payment.card')}
                disabled={isProcessing}
                className={`p-3 sm:p-4 rounded-xl border-2 transition-all touch-manipulation ${
                  paymentMethod === 'card' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div
                    className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      paymentMethod === 'card' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                    }`}
                  >
                    {paymentMethod === 'card' && <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-white rounded-full" />}
                  </div>
                  <span className="text-sm sm:text-base font-semibold text-gray-900">{t('payment.card')}</span>
                </div>
              </button>
            </div>

            {paymentMethod === 'card' && (
              <m.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-blue-700">
                    <p className="font-semibold mb-1">Secure Payment with Stripe</p>
                    <p className="text-xs">You&apos;ll be redirected to Stripe&apos;s secure checkout page to complete your payment.</p>
                  </div>
                </div>
              </m.div>
            )}
          </EditableSection>

          {/* Ride Details */}
          <EditableSection title={t('sections.ride')}>
            <InfoRow
              label={t('fields.serviceType')}
              value={isHourly ? t('serviceTypes.hourly') : t('serviceTypes.distance')}
            />

            {/* ✅ Transfer type only if distance */}
            {isDistance && (
              <InfoRow
                label={t('fields.transferType')}
                value={
                  bookingData.transferType === 'return'
                    ? (t('transferTypes.return') ?? 'Return')
                    : t('transferTypes.oneWay')
                }
              />
            )}

            <InfoRow label={t('fields.pickup')} value={bookingData.pickup.address} />

            {/* ✅ Dropoff only for distance */}
            {isDistance && <InfoRow label={t('fields.dropoff')} value={dropoffAddress} />}

            {/* ✅ DateTime includes return info when applicable */}
            <InfoRow label={t('fields.dateTime')} value={rideDateTimeLabel} />

            {/* ✅ Hourly duration only if hourly */}
            {isHourly && bookingData.hourlyDuration != null && (
              <InfoRow
                label={t('fields.hourlyDuration') ?? 'Duration'}
                value={`${bookingData.hourlyDuration} ${t('hours') ?? 'hours'}`}
              />
            )}

            {/* ✅ Distance info only if distance */}
            {isDistance && bookingData.distance != null && (
              <InfoRow label={t('fields.distance')} value={`${bookingData.distance.toFixed(1)} km`} />
            )}
            {isDistance && bookingData.duration != null && (
              <InfoRow label={t('fields.duration')} value={`${Math.round(bookingData.duration)} min`} />
            )}
          </EditableSection>

          {/* Vehicle */}
          {bookingData.selectedVehicle && (
            <EditableSection title={t('sections.vehicle')}>
              <InfoRow label={t('fields.vehicle')} value={bookingData.selectedVehicle.name} />
              <InfoRow
                label={t('fields.capacity')}
                value={t('capacityValue', {
                  passengers: bookingData.selectedVehicle.capacity.passengers,
                  luggage: bookingData.selectedVehicle.capacity.luggage,
                })}
              />
              {bookingData.passengers.childSeats > 0 && (
                <InfoRow label={t('fields.childSeats')} value={`${bookingData.passengers.childSeats} × €5`} />
              )}
            </EditableSection>
          )}
        </div>

        {/* Right Column: Price Summary */}
<aside className="lg:col-span-1">
  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-100 lg:sticky lg:top-4">
    <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4 sm:mb-6">{t('priceSummary.heading')}</h2>

    {bookingData.pricing ? (
      <div className="space-y-3 sm:space-y-4">
        {/* Vehicle selection price (without tax) */}
        <div className="flex justify-between items-center">
          <span className="text-sm sm:text-base text-gray-700">
            {t('priceSummary.selectedVehicle')}
            {bookingData.passengers.childSeats > 0 && (
              <span className="block text-xs text-gray-500">
                + {bookingData.passengers.childSeats} child seat{bookingData.passengers.childSeats > 1 ? 's' : ''}
              </span>
            )}
          </span>
          <span className="text-lg sm:text-xl font-semibold text-gray-900">
            {formatPrice(bookingData.pricing.subtotal)}
          </span>
        </div>

        {/* Tax note */}
        <div className="text-xs text-gray-500 italic">
          *Excludes tax
        </div>

        {/* Total with tax included */}
        <div className="border-t-2 border-blue-300 pt-3 sm:pt-4">
          <div className="flex justify-between items-center">
            <span className="text-lg sm:text-xl font-bold text-gray-900">
              {t('priceSummary.total')} (tax included)
            </span>
            <span className="text-2xl sm:text-3xl font-bold text-blue-600">
              {formatPrice(bookingData.pricing.total)}
            </span>
          </div>
        </div>

        {/* Payment Note */}
        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-white rounded-xl border border-blue-200">
          <p className="text-xs sm:text-sm text-gray-700">
            {paymentMethod === 'cash' ? (
              <>
                <strong>{t('paymentNote.cash.title')}:</strong> {t('paymentNote.cash.description')}
              </>
            ) : (
              <>
                <strong>{t('paymentNote.card.title')}:</strong> {t('paymentNote.card.description')}
              </>
            )}
          </p>
        </div>

                {/* Confirm */}
                <m.button
                  whileHover={!isProcessing ? { scale: 1.02 } : {}}
                  whileTap={!isProcessing ? { scale: 0.98 } : {}}
                  onClick={handleConfirmBooking}
                  disabled={isProcessing}
                  aria-label={t('confirmButton')}
                  className={`w-full py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all shadow-lg touch-manipulation ${
                    isProcessing
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-amber-500/25'
                  }`}
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center gap-2 sm:gap-3">
                      <LoadingSpinner />
                      <span>{paymentMethod === 'card' ? 'Redirecting to Stripe...' : t('processing')}</span>
                    </div>
                  ) : (
                    t('confirmButton')
                  )}
                </m.button>

                {paymentMethod === 'card' && (
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Secured by Stripe</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-600">Pricing not available. Please go back and select a vehicle.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

// ============================================================================
// EDITABLE SECTION
// ============================================================================

const EditableSection = React.memo(({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-200 p-4 sm:p-6">
    <div className="flex items-center justify-between mb-3 sm:mb-4">
      <h2 className="text-base sm:text-lg font-bold text-gray-900">{title}</h2>
    </div>
    <div className="space-y-2 sm:space-y-3">{children}</div>
  </section>
));
EditableSection.displayName = 'EditableSection';

// ============================================================================
// INFO ROW
// ============================================================================

const InfoRow = React.memo(({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-start py-2 border-b border-gray-100 last:border-b-0">
    <span className="text-xs sm:text-sm text-gray-600">{label}</span>
    <span className="text-xs sm:text-sm font-semibold text-gray-900 text-right max-w-[60%] break-words">{value}</span>
  </div>
));
InfoRow.displayName = 'InfoRow';

// ============================================================================
// PRICE ROW
// ============================================================================

const PriceRow = React.memo(({ label, value }: { label: string; value: number }) => (
  <div className="flex justify-between items-center">
    <span className="text-xs sm:text-sm text-gray-700">{label}</span>
    <span className="text-xs sm:text-sm font-semibold text-gray-900">{formatPrice(value)}</span>
  </div>
));
PriceRow.displayName = 'PriceRow';

// ============================================================================
// SPINNER
// ============================================================================

const LoadingSpinner = React.memo(() => (
  <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
));
LoadingSpinner.displayName = 'LoadingSpinner';