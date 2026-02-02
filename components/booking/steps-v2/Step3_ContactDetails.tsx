'use client';

/**
 * Step 3: Enter Contact Details - IMPROVED
 * - Mobile optimized
 * - SEO friendly
 * - Performance optimized
 * - i18n ready
 */

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useBooking } from '@/lib/booking/context';
import { formatPrice } from '@/lib/booking/utils';
import { COUNTRY_CODES } from '@/lib/booking/constants';

type PaymentMethod = 'cash' | 'card';

export default function ContactDetailsStep() {
  const t = useTranslations('step3');
  const { bookingData, updateBookingData } = useBooking();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');

  const handleInputChange = useCallback((field: string, value: string) => {
    updateBookingData({
      passengerDetails: {
        ...bookingData.passengerDetails,
        [field]: value,
      },
    });
  }, [bookingData.passengerDetails, updateBookingData]);

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

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Column: Contact Form (2/3 width) */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Contact Information */}
          <section 
            className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-200 p-4 sm:p-6"
            aria-labelledby="contact-info-heading"
          >
            <h2 id="contact-info-heading" className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
              {t('contactInfo.heading')}
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* First Name */}
              <div>
                <label 
                  htmlFor="firstName"
                  className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2"
                >
                  {t('contactInfo.firstName.label')} *
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={bookingData.passengerDetails.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder={t('contactInfo.firstName.placeholder')}
                  aria-required="true"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              {/* Last Name */}
              <div>
                <label 
                  htmlFor="lastName"
                  className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2"
                >
                  {t('contactInfo.lastName.label')} *
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={bookingData.passengerDetails.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder={t('contactInfo.lastName.placeholder')}
                  aria-required="true"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              {/* Email Address */}
              <div>
                <label 
                  htmlFor="email"
                  className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2"
                >
                  {t('contactInfo.email.label')} *
                </label>
                <input
                  id="email"
                  type="email"
                  value={bookingData.passengerDetails.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder={t('contactInfo.email.placeholder')}
                  aria-required="true"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label 
                  htmlFor="phone"
                  className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2"
                >
                  {t('contactInfo.phone.label')} *
                </label>
                <div className="flex gap-2">
                  <select
                    id="countryCode"
                    value={bookingData.passengerDetails.countryCode}
                    onChange={(e) => handleInputChange('countryCode', e.target.value)}
                    aria-label={t('contactInfo.phone.countryCodeAria')}
                    className="w-20 sm:w-24 px-1 sm:px-2 py-2.5 sm:py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 text-sm sm:text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
                  >
                    {COUNTRY_CODES.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.flag} {country.code}
                      </option>
                    ))}
                  </select>
                  <input
                    id="phone"
                    type="tel"
                    value={bookingData.passengerDetails.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder={t('contactInfo.phone.placeholder')}
                    aria-required="true"
                    className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Flight Number (Optional) */}
            <div className="mt-4 sm:mt-6">
              <label 
                htmlFor="flightNumber"
                className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2"
              >
                {t('contactInfo.flightNumber.label')} <span className="text-gray-400 font-normal">({t('optional')})</span>
              </label>
              <input
                id="flightNumber"
                type="text"
                value={bookingData.passengerDetails.flightNumber || ''}
                onChange={(e) => handleInputChange('flightNumber', e.target.value)}
                placeholder={t('contactInfo.flightNumber.placeholder')}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            {/* Comments (Optional) */}
            <div className="mt-4 sm:mt-6">
              <label 
                htmlFor="comments"
                className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2"
              >
                {t('contactInfo.comments.label')} <span className="text-gray-400 font-normal">({t('optional')})</span>
              </label>
              <textarea
                id="comments"
                value={bookingData.passengerDetails.specialRequests || ''}
                onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                placeholder={t('contactInfo.comments.placeholder')}
                rows={4}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
              />
            </div>
          </section>

          {/* Payment Method */}
          <section 
            className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-200 p-4 sm:p-6"
            aria-labelledby="payment-heading"
          >
            <h2 id="payment-heading" className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
              {t('payment.heading')}
            </h2>
            
            <div 
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
              role="radiogroup"
              aria-label={t('payment.aria')}
            >
              {/* Cash */}
              <button
                onClick={() => setPaymentMethod('cash')}
                role="radio"
                aria-checked={paymentMethod === 'cash'}
                aria-label={t('payment.cash.aria')}
                className={`p-4 sm:p-6 rounded-xl border-2 transition-all touch-manipulation ${
                  paymentMethod === 'cash'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                    paymentMethod === 'cash' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                  }`}>
                    {paymentMethod === 'cash' && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white rounded-full"
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <CashIcon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-700" />
                    <div className="text-left">
                      <p className="text-sm sm:text-base font-semibold text-gray-900">{t('payment.cash.title')}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500">{t('payment.cash.description')}</p>
                    </div>
                  </div>
                </div>
              </button>

              {/* Card */}
              <button
                onClick={() => setPaymentMethod('card')}
                role="radio"
                aria-checked={paymentMethod === 'card'}
                aria-label={t('payment.card.aria')}
                className={`p-4 sm:p-6 rounded-xl border-2 transition-all touch-manipulation ${
                  paymentMethod === 'card'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                    paymentMethod === 'card' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                  }`}>
                    {paymentMethod === 'card' && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white rounded-full"
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <CardIcon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-700" />
                    <div className="text-left">
                      <p className="text-sm sm:text-base font-semibold text-gray-900">{t('payment.card.title')}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500">{t('payment.card.description')}</p>
                    </div>
                  </div>
                </div>
              </button>
            </div>

            {paymentMethod === 'card' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 sm:mt-4 p-3 sm:p-4 bg-blue-50 rounded-xl border border-blue-100"
                role="alert"
              >
                <p className="text-xs sm:text-sm text-blue-900">
                  <strong>{t('payment.card.note.title')}:</strong> {t('payment.card.note.description')}
                </p>
              </motion.div>
            )}
          </section>
        </div>

        {/* Right Column: Persistent Summary (1/3 width) */}
        <aside className="lg:col-span-1">
          <div 
            className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-100 lg:sticky lg:top-4"
            aria-labelledby="summary-heading"
          >
            <h2 id="summary-heading" className="text-xs sm:text-sm font-semibold text-gray-600 mb-3 sm:mb-4">
              {t('summary.heading')}
            </h2>
            
            <div className="space-y-3 sm:space-y-4">
              <SummaryItem label={t('summary.service')} value={bookingData.serviceType === 'hourly' ? t('summary.hourly') : t('summary.distance')} />
              <SummaryItem label={t('summary.from')} value={bookingData.pickup.address || t('summary.notSet')} />
              <SummaryItem label={t('summary.to')} value={bookingData.dropoff.address || t('summary.notSet')} />
              <SummaryItem 
                label={t('summary.dateTime')} 
                value={`${bookingData.dateTime.date} ${t('summary.at')} ${bookingData.dateTime.time}`} 
              />
              
              {bookingData.distance && (
                <SummaryItem label={t('summary.distance')} value={`${bookingData.distance.toFixed(1)} km`} />
              )}
              
              <SummaryItem label={t('summary.passengers')} value={`${bookingData.passengers.count}`} />

              {/* Selected Vehicle */}
              {bookingData.selectedVehicle && (
                <>
                  <div className="border-t border-blue-200 pt-3 sm:pt-4">
                    <SummaryItem label={t('summary.vehicle')} value={bookingData.selectedVehicle.name} />
                  </div>

                  {bookingData.passengers.childSeats > 0 && (
                    <SummaryItem 
                      label={t('summary.childSeats')} 
                      value={`${bookingData.passengers.childSeats} × €5`} 
                    />
                  )}
                </>
              )}

              {/* Total Cost */}
              {bookingData.pricing && (
                <div className="border-t border-blue-200 pt-3 sm:pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-[10px] sm:text-xs text-gray-600">{t('summary.subtotal')}</p>
                    <p className="text-xs sm:text-sm font-semibold text-gray-900">
                      {formatPrice(bookingData.pricing.subtotal)}
                    </p>
                  </div>
                  <div className="flex justify-between items-center mb-2 sm:mb-3">
                    <p className="text-[10px] sm:text-xs text-gray-600">{t('summary.tax')}</p>
                    <p className="text-xs sm:text-sm font-semibold text-gray-900">
                      {formatPrice(bookingData.pricing.tax)}
                    </p>
                  </div>
                  <div className="flex justify-between items-center pt-2 sm:pt-3 border-t border-blue-200">
                    <p className="text-xs sm:text-sm font-bold text-gray-900">{t('summary.total')}</p>
                    <p className="text-xl sm:text-2xl font-bold text-blue-600">
                      {formatPrice(bookingData.pricing.total)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ============================================================================
// SUMMARY ITEM COMPONENT (Memoized)
// ============================================================================

const SummaryItem = React.memo(({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-[10px] sm:text-xs text-gray-600 mb-0.5 sm:mb-1">{label}</p>
    <p className="text-xs sm:text-sm font-semibold text-gray-900 break-words">{value}</p>
  </div>
));
SummaryItem.displayName = 'SummaryItem';

// ============================================================================
// ICON COMPONENTS (Memoized)
// ============================================================================

const CashIcon = React.memo(({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
));
CashIcon.displayName = 'CashIcon';

const CardIcon = React.memo(({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
));
CardIcon.displayName = 'CardIcon';