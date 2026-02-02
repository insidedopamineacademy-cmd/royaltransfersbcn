'use client';

/**
 * Booking Success Page
 * Displays booking confirmation after successful payment
 * Handles both cash and card payments
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/navigation';
import { formatPrice } from '@/lib/booking/utils';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface BookingDetails {
  bookingId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceType: string;
  pickupAddress: string;
  dropoffAddress: string;
  pickupDate: string;
  pickupTime: string;
  vehicleName: string;
  passengers: number;
  luggage: number;
  flightNumber?: string;
  totalPrice: number;
  currency: string;
}

type PaymentStatus = 'paid' | 'unpaid' | 'processing' | 'cash';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function BookingSuccessPage() {
  const t = useTranslations('success');
  const searchParams = useSearchParams();
  
  const [isLoading, setIsLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('processing');
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get payment type and session_id from URL
  const paymentType = searchParams.get('payment'); // 'cash' or 'card'
  const sessionId = searchParams.get('session_id');

useEffect(() => {
  async function verifyPayment() {
    try {
      if (paymentType === 'cash') {
        // Cash payment - fetch booking from database
        const bookingId = searchParams.get('booking_id');
        
        if (!bookingId) {
          throw new Error('No booking ID provided');
        }

        // Fetch booking details from database
        const response = await fetch(`/api/booking/get-booking?booking_id=${bookingId}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to fetch booking');
        }

        setPaymentStatus('cash');
        setBookingDetails(data.bookingDetails);
      } else {
        // Card payment - verify Stripe session
        if (!sessionId) {
          throw new Error('No session ID provided');
        }

        // Verify Stripe payment
        const response = await fetch(`/api/stripe/verify-session?session_id=${sessionId}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to verify payment');
        }

        setPaymentStatus(data.paymentStatus);
        setBookingDetails(data.bookingDetails);
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  verifyPayment();
}, [sessionId, paymentType, searchParams]);

  // Loading state
  if (isLoading) {
    return <LoadingState />;
  }

  // Error state
  if (error) {
    return <ErrorState error={error} />;
  }

  // Success state
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="text-center mb-8"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500 rounded-full mb-6 shadow-lg shadow-emerald-500/25"
          >
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            {t('title')}
          </h1>

          {/* Subtitle based on payment type */}
          <p className="text-lg text-gray-600 mb-2">
            {paymentStatus === 'cash' 
              ? t('subtitleCash')
              : t('subtitleCard')}
          </p>

          {/* Booking ID */}
          {bookingDetails?.bookingId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 rounded-full text-emerald-700 font-mono text-sm"
            >
              <span className="font-semibold">{t('bookingId')}:</span>
              <span>{bookingDetails.bookingId}</span>
            </motion.div>
          )}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Booking Details - Left Column */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 space-y-6"
          >
            {bookingDetails && (
              <>
                {/* Transfer Details */}
                <DetailsCard title={t('transferDetails')}>
                  <DetailRow 
                    icon={<MapPinIcon />}
                    label={t('pickup')} 
                    value={bookingDetails.pickupAddress} 
                  />
                  <DetailRow 
                    icon={<MapPinIcon />}
                    label={t('dropoff')} 
                    value={bookingDetails.dropoffAddress} 
                  />
                  <DetailRow 
                    icon={<CalendarIcon />}
                    label={t('dateTime')} 
                    value={`${bookingDetails.pickupDate} at ${bookingDetails.pickupTime}`} 
                  />
                  <DetailRow 
                    icon={<CarIcon />}
                    label={t('vehicle')} 
                    value={bookingDetails.vehicleName} 
                  />
                  <DetailRow 
                    icon={<UsersIcon />}
                    label={t('passengers')} 
                    value={`${bookingDetails.passengers} passengers, ${bookingDetails.luggage} luggage`} 
                  />
                  {bookingDetails.flightNumber && (
                    <DetailRow 
                      icon={<PlaneIcon />}
                      label={t('flightNumber')} 
                      value={bookingDetails.flightNumber} 
                    />
                  )}
                </DetailsCard>

                {/* Customer Details */}
                <DetailsCard title={t('customerDetails')}>
                  <DetailRow 
                    icon={<UserIcon />}
                    label={t('name')} 
                    value={bookingDetails.customerName} 
                  />
                  <DetailRow 
                    icon={<MailIcon />}
                    label={t('email')} 
                    value={bookingDetails.customerEmail} 
                  />
                  <DetailRow 
                    icon={<PhoneIcon />}
                    label={t('phone')} 
                    value={bookingDetails.customerPhone} 
                  />
                </DetailsCard>

                {/* Payment Details */}
                <DetailsCard title={t('paymentDetails')}>
                  <DetailRow 
                    icon={<CreditCardIcon />}
                    label={t('paymentMethod')} 
                    value={paymentStatus === 'cash' ? t('cash') : t('card')} 
                  />
                  <DetailRow 
                    icon={<CheckCircleIcon />}
                    label={t('paymentStatus')} 
                    value={getPaymentStatusText(paymentStatus, t)} 
                    valueClassName={getPaymentStatusColor(paymentStatus)}
                  />
                  <DetailRow 
                    icon={<DollarIcon />}
                    label={t('totalPaid')} 
                    value={formatPrice(bookingDetails.totalPrice)} 
                    valueClassName="text-lg font-bold text-emerald-600"
                  />
                </DetailsCard>
              </>
            )}
          </motion.div>

          {/* Quick Actions - Right Column */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg sticky top-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">{t('quickActions')}</h2>
              
              <div className="space-y-3">
                {/* Email Confirmation */}
                <ActionButton
                  icon={<MailIcon />}
                  label={t('emailSent')}
                  description={bookingDetails?.customerEmail || ''}
                  variant="success"
                />

                {/* Download Receipt */}
                <ActionButton
                  icon={<DownloadIcon />}
                  label={t('downloadReceipt')}
                  onClick={() => handleDownloadReceipt(bookingDetails)}
                  variant="secondary"
                />

                {/* Add to Calendar */}
                <ActionButton
                  icon={<CalendarIcon />}
                  label={t('addToCalendar')}
                  onClick={() => handleAddToCalendar(bookingDetails)}
                  variant="secondary"
                />

                {/* Print Confirmation */}
                <ActionButton
                  icon={<PrinterIcon />}
                  label={t('print')}
                  onClick={() => window.print()}
                  variant="secondary"
                />
              </div>

              {/* Need Help */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-3">{t('needHelp')}</p>
                <Link
                  href="/contact"
                  className="block text-center py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold text-gray-700 transition-colors"
                >
                  {t('contactSupport')}
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* What's Next Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-blue-50 border border-blue-200 rounded-2xl p-6 sm:p-8 mb-8"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <InfoIcon className="w-6 h-6 text-blue-500" />
            {t('whatsNext.title')}
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <NextStep
              number={1}
              title={t('whatsNext.step1.title')}
              description={t('whatsNext.step1.description')}
            />
            <NextStep
              number={2}
              title={t('whatsNext.step2.title')}
              description={t('whatsNext.step2.description')}
            />
            <NextStep
              number={3}
              title={t('whatsNext.step3.title')}
              description={t('whatsNext.step3.description')}
            />
          </div>
        </motion.div>

        {/* Back to Home */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t('backToHome')}
          </Link>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// LOADING STATE COMPONENT
// ============================================================================

function LoadingState() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4" />
        <p className="text-lg text-gray-600">Verifying your payment...</p>
      </div>
    </div>
  );
}

// ============================================================================
// ERROR STATE COMPONENT
// ============================================================================

function ErrorState({ error }: { error: string }) {
  const t = useTranslations('success');
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-red-200 p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('error.title')}</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          
          <div className="space-y-3">
            <Link
              href="/book"
              className="block py-3 px-6 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-colors"
            >
              {t('error.tryAgain')}
            </Link>
            <Link
              href="/contact"
              className="block py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
            >
              {t('error.contactSupport')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function DetailsCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900 mb-4">{title}</h2>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}

interface DetailRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClassName?: string;
}

function DetailRow({ icon, label, value, valueClassName = 'text-gray-900' }: DetailRowProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 w-5 h-5 text-gray-400 mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500">{label}</p>
        <p className={`text-sm font-semibold ${valueClassName} break-words`}>{value}</p>
      </div>
    </div>
  );
}

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success';
}

function ActionButton({ icon, label, description, onClick, variant = 'secondary' }: ActionButtonProps) {
  const baseClasses = "flex items-center gap-3 w-full p-3 rounded-xl transition-all";
  const variantClasses = {
    primary: "bg-blue-500 hover:bg-blue-600 text-white",
    secondary: "bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  };

  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex-shrink-0 w-5 h-5">{icon}</div>
      <div className="flex-1 text-left">
        <p className="text-sm font-semibold">{label}</p>
        {description && <p className="text-xs opacity-75">{description}</p>}
      </div>
    </Component>
  );
}

function NextStep({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm">
        {number}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getPaymentStatusText(status: PaymentStatus, t: ReturnType<typeof useTranslations<'success'>>): string {
  switch (status) {
    case 'paid':
      return t('paymentStatusPaid');
    case 'cash':
      return t('paymentStatusCash');
    case 'processing':
      return t('paymentStatusProcessing');
    default:
      return t('paymentStatusUnpaid');
  }
}

function getPaymentStatusColor(status: PaymentStatus): string {
  switch (status) {
    case 'paid':
    case 'cash':
      return 'text-emerald-600 font-semibold';
    case 'processing':
      return 'text-amber-600 font-semibold';
    default:
      return 'text-red-600 font-semibold';
  }
}

function handleDownloadReceipt(bookingDetails: BookingDetails | null) {
  if (!bookingDetails) return;
  
  // TODO: Implement PDF generation or download
  alert('Receipt download feature coming soon!');
  console.log('Download receipt for booking:', bookingDetails.bookingId);
}

function handleAddToCalendar(bookingDetails: BookingDetails | null) {
  if (!bookingDetails) return;
  
  // Create iCal format event
  const event = {
    title: `Transfer: ${bookingDetails.pickupAddress} → ${bookingDetails.dropoffAddress}`,
    description: `Vehicle: ${bookingDetails.vehicleName}\nBooking ID: ${bookingDetails.bookingId}`,
    location: bookingDetails.pickupAddress,
    startDate: `${bookingDetails.pickupDate}T${bookingDetails.pickupTime}`,
  };
  
  // TODO: Generate proper .ics file
  alert('Add to calendar feature coming soon!');
  console.log('Add to calendar:', event);
}

// ============================================================================
// ICON COMPONENTS
// ============================================================================

function MapPinIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function CarIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 17h8M8 17a2 2 0 11-4 0 2 2 0 014 0zm8 0a2 2 0 104 0 2 2 0 00-4 0zM4 11l2-6h12l2 6M4 11h16M4 11v6h16v-6" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function PlaneIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  );
}

function CreditCardIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function DollarIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}

function PrinterIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
    </svg>
  );
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}