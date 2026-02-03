'use client';

import React, { Suspense, lazy, memo, useCallback } from 'react';
import { motion, AnimatePresence, LazyMotion, domAnimation, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useBooking } from '@/lib/booking/context';

// Lazy load steps for better performance
const Step1_RideDetails = lazy(() => import('./steps-v2/Step1_RideDetails'));
const Step2_VehicleSelection = lazy(() => import('./steps-v2/Step2_VehicleSelection'));
const Step3_ContactDetails = lazy(() => import('./steps-v2/Step3_ContactDetails'));
const Step4_BookingSummary = lazy(() => import('./steps-v2/Step4_BookingSummary'));

// ============================================================================
// WIZARD STEPS CONFIGURATION
// ============================================================================

const WIZARD_STEPS = [
  {
    id: 1,
    titleKey: 'rideDetails',
    component: Step1_RideDetails,
    icon: '📍',
  },
  {
    id: 2,
    titleKey: 'chooseVehicle',
    component: Step2_VehicleSelection,
    icon: '🚗',
  },
  {
    id: 3,
    titleKey: 'contactDetails',
    component: Step3_ContactDetails,
    icon: '✉️',
  },
  {
    id: 4,
    titleKey: 'confirmation',
    component: Step4_BookingSummary,
    icon: '✓',
  },
];

const BookingWizard = memo(function BookingWizard() {
  const t = useTranslations('bookingWizard');
  const { currentStep, goToNextStep, goToPreviousStep, canProceedToNextStep, bookingData } = useBooking();
  const prefersReducedMotion = useReducedMotion();

  const CurrentStepComponent = WIZARD_STEPS[currentStep].component;
  const canProceed = canProceedToNextStep();

  const handleNext = useCallback(() => {
    if (canProceed) {
      goToNextStep();
    }
  }, [canProceed, goToNextStep]);

  const handlePrevious = useCallback(() => {
    goToPreviousStep();
  }, [goToPreviousStep]);

  return (
    <LazyMotion features={domAnimation} strict>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-6 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Progress Bar */}
          <div className="mb-6 sm:mb-8">
            <ProgressBar 
              currentStep={currentStep} 
              totalSteps={WIZARD_STEPS.length} 
              steps={WIZARD_STEPS} 
            />
          </div>

          {/* Step Content with Loading Fallback */}
          <Suspense fallback={<StepLoadingFallback />}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={!prefersReducedMotion ? { opacity: 0, x: 20 } : { opacity: 1 }}
                animate={{ opacity: 1, x: 0 }}
                exit={!prefersReducedMotion ? { opacity: 0, x: -20 } : { opacity: 1 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-gray-100"
                role="main"
                aria-label={t(`steps.${WIZARD_STEPS[currentStep].titleKey}.aria`)}
                style={{ willChange: prefersReducedMotion ? 'auto' : 'opacity, transform' }}
              >
                <CurrentStepComponent />
              </motion.div>
            </AnimatePresence>
          </Suspense>

          {/* Navigation Buttons */}
          {currentStep < WIZARD_STEPS.length - 1 && (
            <nav 
              className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-0"
              aria-label={t('navigation.aria')}
            >
              {/* Previous Button */}
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                aria-label={t('navigation.previous')}
                className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-all duration-200 shadow-md hover:shadow-lg order-2 sm:order-1 text-sm sm:text-base active:scale-95"
              >
                <ChevronLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>{t('navigation.previous')}</span>
              </button>

              {/* Step Counter */}
              <div className="text-center order-1 sm:order-2 py-2 sm:py-0">
                <p className="text-xs sm:text-sm text-gray-600" aria-live="polite">
                  {t('progress.step', { current: currentStep + 1, total: WIZARD_STEPS.length })}
                </p>
              </div>

              {/* Next Button */}
              <button
                onClick={handleNext}
                disabled={!canProceed}
                aria-label={t('navigation.next')}
                aria-disabled={!canProceed}
                className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg order-3 text-sm sm:text-base ${
                  canProceed
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-blue-500/25 active:scale-95'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <span>{t('navigation.next')}</span>
                <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </nav>
          )}

          {/* Debug Info (Development Only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-gray-100 rounded-xl text-xs text-gray-600" role="status">
              <p><strong>Debug:</strong> Step {currentStep + 1} | Can Proceed: {canProceed ? 'Yes' : 'No'}</p>
              <p className="truncate">Service: {bookingData.serviceType} | Vehicle: {bookingData.selectedVehicle?.name || 'None'}</p>
            </div>
          )}
        </div>
      </div>
    </LazyMotion>
  );
});

// ============================================================================
// PROGRESS BAR COMPONENT - Memoized
// ============================================================================

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  steps: typeof WIZARD_STEPS;
}

const ProgressBar = memo(function ProgressBar({ currentStep, totalSteps, steps }: ProgressBarProps) {
  const t = useTranslations('bookingWizard');
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="space-y-3 sm:space-y-4" role="progressbar" aria-valuenow={currentStep + 1} aria-valuemin={1} aria-valuemax={totalSteps}>
      {/* Step Indicators */}
      <div className="flex items-center justify-between relative px-2 sm:px-0">
        {/* Progress Line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 sm:h-1 bg-gray-200 -translate-y-1/2 -z-10 mx-6 sm:mx-0">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
            initial={{ width: '0%' }}
            animate={{ width: `${(currentStep / (totalSteps - 1)) * 100}%` }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>

        {/* Step Circles */}
        {steps.map((step, index) => (
          <StepIndicator
            key={step.id}
            step={step}
            index={index}
            currentStep={currentStep}
            t={t}
            prefersReducedMotion={prefersReducedMotion}
          />
        ))}
      </div>

      {/* Mobile Step Title - Shown only on mobile */}
      <div className="sm:hidden text-center">
        <p className="text-sm font-semibold text-blue-600">
          {t(`steps.${steps[currentStep].titleKey}.title`)}
        </p>
      </div>

      {/* Progress Percentage */}
      <div className="text-center">
        <p className="text-xs sm:text-sm text-gray-500">
          {t('progress.percentage', { percentage: Math.round(((currentStep + 1) / totalSteps) * 100) })}
        </p>
      </div>
    </div>
  );
});

// ============================================================================
// STEP INDICATOR - Extracted & Memoized
// ============================================================================

interface StepIndicatorProps {
  step: typeof WIZARD_STEPS[0];
  index: number;
  currentStep: number;
  t: ReturnType<typeof useTranslations<'bookingWizard'>>;
  prefersReducedMotion: boolean | null;
}

const StepIndicator = memo(function StepIndicator({ 
  step, 
  index, 
  currentStep, 
  t,
  prefersReducedMotion 
}: StepIndicatorProps) {
  const isCompleted = index < currentStep;
  const isCurrent = index === currentStep;

  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={!prefersReducedMotion ? { scale: 0.8 } : { scale: 1 }}
        animate={{
          scale: isCurrent ? 1.1 : 1,
        }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className={`
          w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-sm sm:text-base md:text-lg font-bold
          transition-all duration-300 shadow-lg
          ${
            isCompleted
              ? 'bg-emerald-500 text-white'
              : isCurrent
              ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white'
              : 'bg-white text-gray-400 border-2 border-gray-300'
          }
        `}
        aria-label={t(`steps.${step.titleKey}.label`)}
        aria-current={isCurrent ? 'step' : undefined}
      >
        {isCompleted ? (
          <CheckIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
        ) : (
          <span className="text-xs sm:text-sm md:text-base">{step.icon}</span>
        )}
      </motion.div>
      
      {/* Step Title - Hidden on mobile, shown on tablet+ */}
      <p className={`
        mt-1 sm:mt-2 text-[10px] sm:text-xs font-semibold hidden sm:block max-w-[80px] text-center leading-tight
        ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-emerald-600' : 'text-gray-400'}
      `}>
        {t(`steps.${step.titleKey}.title`)}
      </p>
    </div>
  );
});

// ============================================================================
// LOADING FALLBACK COMPONENT - Memoized
// ============================================================================

const StepLoadingFallback = memo(function StepLoadingFallback() {
  return (
    <div 
      className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-gray-100"
      role="status"
      aria-label="Loading booking step"
    >
      <div className="animate-pulse space-y-6">
        {/* Title Skeleton */}
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        
        {/* Content Skeleton */}
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
        
        {/* Input Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-12 bg-gray-200 rounded-xl"></div>
          <div className="h-12 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
});

// ============================================================================
// ICON COMPONENTS - Memoized
// ============================================================================

const ChevronLeftIcon = memo(function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
});

const ChevronRightIcon = memo(function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
});

const CheckIcon = memo(function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
});

export default BookingWizard;