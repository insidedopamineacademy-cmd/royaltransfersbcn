'use client';

import { useRef, useMemo, memo } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';

// ============================================================================
// PERFORMANCE: Memoized main component
// ============================================================================
export default function LuxurySedanPage() {
  const t = useTranslations('fleet.luxurySedan');

  return (
    <>
      <HeroSection t={t} />
      <VehiclesSection t={t} />
      <CTASection t={t} />
    </>
  );
}

// ============================================================================
// UTILITY: Animation configuration respecting user preferences
// ============================================================================
function useAccessibleAnimation() {
  const shouldReduceMotion = useReducedMotion();
  
  return useMemo(() => {
    if (shouldReduceMotion) {
      return {
        initial: {},
        animate: {},
        transition: { duration: 0 },
      };
    }
    return {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.5 },
    };
  }, [shouldReduceMotion]);
}

// ============================================================================
// HERO SECTION - Optimized
// ============================================================================
const HeroSection = memo(function HeroSection({ 
  t 
}: { 
  t: ReturnType<typeof useTranslations<'fleet.luxurySedan'>> 
}) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2, margin: "0px 0px -100px 0px" });
  const animation = useAccessibleAnimation();

  return (
    <section
      ref={ref}
      className="relative py-16 sm:py-20 lg:py-28 overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
    >
      {/* PERFORMANCE FIX: Use CSS-only gradients with will-change hint */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div 
          className="absolute top-1/4 -left-20 w-64 h-64 sm:w-80 sm:h-80 bg-amber-500/10 rounded-full blur-3xl"
          style={{ willChange: 'transform' }}
        />
        <div 
          className="absolute bottom-1/4 -right-20 w-64 h-64 sm:w-80 sm:h-80 bg-yellow-500/10 rounded-full blur-3xl"
          style={{ willChange: 'transform' }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={animation.initial}
          animate={isInView ? animation.animate : animation.initial}
          transition={animation.transition}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Badge - MOBILE FIX: Better sizing */}
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-xs sm:text-sm font-medium mb-4 sm:mb-6">
            <StarIcon className="w-3 h-3 sm:w-4 sm:h-4" />
            {t('hero.badge')}
          </div>

          {/* MOBILE FIX: Responsive text sizing with proper line height */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-[1.15] sm:leading-tight">
            {t('hero.title')}{' '}
            <span className="bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent inline-block">
              {t('hero.titleHighlight')}
            </span>
          </h1>
          
          {/* MOBILE FIX: Better spacing and readability */}
          <p className="text-base sm:text-lg lg:text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto px-4 sm:px-0">
            {t('hero.subtitle')}
          </p>
        </motion.div>
      </div>
    </section>
  );
});

// ============================================================================
// VEHICLES SECTION - Optimized
// ============================================================================
const VehiclesSection = memo(function VehiclesSection({ 
  t 
}: { 
  t: ReturnType<typeof useTranslations<'fleet.luxurySedan'>> 
}) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1, margin: "0px 0px -50px 0px" });

  const vehicles = useMemo(() => [
    {
      key: 'sclass',
      color: 'from-amber-500 to-yellow-500',
      bgColor: 'from-amber-50 to-yellow-50',
      borderColor: 'border-amber-200 hover:border-amber-400',
      iconBg: 'bg-amber-100 text-amber-600',
      features: ['seating', 'cabin', 'massage', 'sound', 'chauffeur'],
      perfectFor: ['business', 'vip', 'diplomatic', 'wedding', 'hourly', 'tours'],
      flagship: true,
    },
    {
      key: 'eclass',
      color: 'from-slate-600 to-slate-700',
      bgColor: 'from-slate-50 to-gray-100',
      borderColor: 'border-slate-200 hover:border-slate-400',
      iconBg: 'bg-slate-100 text-slate-600',
      features: ['luggage', 'passengers', 'climate', 'quiet', 'chauffeur'],
      perfectFor: ['airport', 'cruise', 'longDistance', 'meetings', 'hourly', 'tours'],
      flagship: false,
    },
    {
      key: 'bmw5',
      color: 'from-blue-600 to-indigo-600',
      bgColor: 'from-blue-50 to-indigo-50',
      borderColor: 'border-blue-200 hover:border-blue-400',
      iconBg: 'bg-blue-100 text-blue-600',
      features: ['trunk', 'seating', 'sound', 'comfort', 'chauffeur'],
      perfectFor: ['airport', 'cruise', 'longDistance', 'business', 'hourly', 'tours'],
      flagship: false,
    },
  ], []);

  return (
    <section ref={ref} className="py-16 sm:py-20 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-12 sm:space-y-16 lg:space-y-24">
          {vehicles.map((vehicle, index) => (
            <VehicleCard
              key={vehicle.key}
              vehicle={vehicle}
              t={t}
              index={index}
              isInView={isInView}
            />
          ))}
        </div>
      </div>
    </section>
  );
});

// PERFORMANCE: Separate vehicle card component to prevent re-renders
const VehicleCard = memo(function VehicleCard({
  vehicle,
  t,
  index,
  isInView,
}: {
  vehicle: {
    key: string;
    color: string;
    bgColor: string;
    borderColor: string;
    iconBg: string;
    features: string[];
    perfectFor: string[];
    flagship: boolean;
  };
  t: ReturnType<typeof useTranslations<'fleet.luxurySedan'>>;
  index: number;
  isInView: boolean;
}) {
  const shouldReduceMotion = useReducedMotion();
  const isReversed = index % 2 === 1;

  return (
    <motion.div
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 30 }}
      animate={isInView && !shouldReduceMotion ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: shouldReduceMotion ? 0 : index * 0.15 }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Image Side - PERFORMANCE FIX: Explicit dimensions to prevent CLS */}
        <div className={`${isReversed ? 'lg:order-2' : ''}`}>
          <div 
            className={`relative aspect-[4/3] bg-gradient-to-br ${vehicle.bgColor} rounded-2xl sm:rounded-3xl flex items-center justify-center border-2 ${vehicle.borderColor} transition-colors overflow-hidden`}
            style={{ minHeight: '250px', willChange: isInView ? 'auto' : 'transform' }}
          >
            {/* Flagship badge - MOBILE FIX: Responsive sizing */}
            {vehicle.flagship && (
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                <span className="px-2 sm:px-3 py-1 text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full">
                  {t('labels.flagship')}
                </span>
              </div>
            )}
            <div className="text-center p-6 sm:p-8">
              <CarIcon className="w-20 h-20 sm:w-24 sm:h-24 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <p className="text-gray-500 text-xs sm:text-sm font-medium">{t(`vehicles.${vehicle.key}.name`)}</p>
            </div>
          </div>
        </div>

        {/* Content Side */}
        <div className={`${isReversed ? 'lg:order-1' : ''}`}>
          {/* Vehicle Title - MOBILE FIX: Responsive sizing */}
          <div className="mb-4 sm:mb-6">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 break-words">
              {t(`vehicles.${vehicle.key}.name`)}
            </h2>
            <p className={`text-base sm:text-lg font-medium bg-gradient-to-r ${vehicle.color} bg-clip-text text-transparent`}>
              {t(`vehicles.${vehicle.key}.tagline`)}
            </p>
          </div>

          {/* Description - MOBILE FIX: Better readability */}
          <p className="text-sm sm:text-base text-gray-600 mb-5 sm:mb-6 leading-relaxed">
            {t(`vehicles.${vehicle.key}.description`)}
          </p>

          {/* Key Features */}
          <div className="mb-6 sm:mb-8">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
              <SparklesIcon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
              {t('labels.keyFeatures')}
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              {vehicle.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 sm:gap-3">
                  <span className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg ${vehicle.iconBg} flex items-center justify-center shrink-0`}>
                    <FeatureIcon feature={feature} className="w-3 h-3 sm:w-4 sm:h-4" />
                  </span>
                  <span className="text-sm sm:text-base text-gray-700 pt-0.5 sm:pt-1 leading-relaxed">
                    {t(`vehicles.${vehicle.key}.features.${feature}`)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Perfect For */}
          <div className="mb-6 sm:mb-8">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
              <CheckBadgeIcon className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
              {t('labels.perfectFor')}
            </h3>
            {/* MOBILE FIX: Better wrapping and spacing */}
            <div className="flex flex-wrap gap-2">
              {vehicle.perfectFor.map((use) => (
                <span
                  key={use}
                  className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-white border border-gray-200 rounded-full text-xs sm:text-sm text-gray-700"
                >
                  <PerfectForIcon use={use} className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 shrink-0" />
                  <span className="truncate">{t(`vehicles.${vehicle.key}.perfectFor.${use}`)}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Pricing & CTA - MOBILE FIX: Better mobile layout */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4 border-t border-gray-200">
            <div className="w-full sm:w-auto">
              <p className="text-xs sm:text-sm text-gray-500">{t('labels.startingFrom')}</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{t(`vehicles.${vehicle.key}.price`)}</p>
              <p className="text-xs text-gray-500">{t(`vehicles.${vehicle.key}.priceNote`)}</p>
            </div>
            {/* MOBILE FIX: Proper touch targets (44x44px minimum) */}
            <div className="flex flex-col sm:flex-row gap-3 sm:ml-auto w-full sm:w-auto">
              <a
                href="https://wa.me/34617629115"
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center justify-center px-5 sm:px-6 py-3 sm:py-3.5 min-h-[44px] text-sm sm:text-base font-semibold text-white bg-gradient-to-r ${vehicle.color} rounded-xl hover:opacity-90 active:opacity-80 transition-opacity shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2`}
                aria-label={`Book ${t(`vehicles.${vehicle.key}.name`)} via WhatsApp`}
              >
                <WhatsAppIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                <span className="truncate">{t('labels.bookWhatsApp')}</span>
              </a>
              {vehicle.flagship && (
                <a
                  href="https://wa.me/34617629115"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-5 sm:px-6 py-3 sm:py-3.5 min-h-[44px] text-sm sm:text-base font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-300 active:border-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
                  aria-label="Get a quote"
                >
                  <span className="truncate">{t('labels.getQuote')}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

// ============================================================================
// CTA SECTION - Optimized
// ============================================================================
const CTASection = memo(function CTASection({ 
  t 
}: { 
  t: ReturnType<typeof useTranslations<'fleet.luxurySedan'>> 
}) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2, margin: "0px 0px -50px 0px" });
  const animation = useAccessibleAnimation();

  return (
    <section ref={ref} className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={animation.initial}
          animate={isInView ? animation.animate : animation.initial}
          transition={animation.transition}
          className="text-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl sm:rounded-3xl p-8 sm:p-10 lg:p-16 shadow-2xl"
        >
          {/* Badge - MOBILE FIX: Responsive sizing */}
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-xs sm:text-sm font-medium mb-4 sm:mb-6">
            <StarIcon className="w-3 h-3 sm:w-4 sm:h-4" />
            {t('cta.badge')}
          </div>
          
          {/* MOBILE FIX: Responsive heading */}
          <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-white mb-3 sm:mb-4 px-2 sm:px-0">
            {t('cta.title')}
          </h2>
          
          <p className="text-base sm:text-lg text-gray-400 mb-6 sm:mb-8 max-w-2xl mx-auto px-2 sm:px-0 leading-relaxed">
            {t('cta.subtitle')}
          </p>
          
          {/* MOBILE FIX: Proper button sizing and spacing with 44x44px minimum touch targets */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
            <a
              href="https://wa.me/34617629115"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 sm:px-8 py-4 min-h-[44px] text-sm sm:text-base font-semibold text-gray-900 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-xl hover:from-amber-500 hover:to-yellow-500 active:from-amber-600 active:to-yellow-600 transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-gray-900"
              aria-label="Book via WhatsApp"
            >
              <WhatsAppIcon className="w-5 h-5 mr-2 flex-shrink-0" />
              <span className="truncate">{t('cta.whatsapp')}</span>
            </a>
            <a
              href="tel:+34617629115"
              className="inline-flex items-center justify-center px-6 sm:px-8 py-4 min-h-[44px] text-sm sm:text-base font-semibold text-white bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 active:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900"
              aria-label="Call us"
            >
              <PhoneIcon className="w-5 h-5 mr-2 flex-shrink-0" />
              <span className="truncate">{t('cta.call')}</span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
});

// ============================================================================
// FEATURE ICONS HELPER - Memoized
// ============================================================================
const FeatureIcon = memo(function FeatureIcon({ feature, className }: { feature: string; className?: string }) {
  switch (feature) {
    case 'seating':
      return <SeatIcon className={className} />;
    case 'cabin':
    case 'quiet':
      return <QuietIcon className={className} />;
    case 'massage':
      return <SparklesIcon className={className} />;
    case 'sound':
      return <MusicIcon className={className} />;
    case 'chauffeur':
      return <UserIcon className={className} />;
    case 'luggage':
    case 'trunk':
      return <LuggageIcon className={className} />;
    case 'passengers':
      return <UsersIcon className={className} />;
    case 'climate':
      return <SnowflakeIcon className={className} />;
    case 'comfort':
      return <CarIcon className={className} />;
    default:
      return <CheckIcon className={className} />;
  }
});

const PerfectForIcon = memo(function PerfectForIcon({ use, className }: { use: string; className?: string }) {
  switch (use) {
    case 'business':
    case 'meetings':
      return <BriefcaseIcon className={className} />;
    case 'vip':
    case 'airport':
      return <PlaneIcon className={className} />;
    case 'diplomatic':
      return <ShieldIcon className={className} />;
    case 'wedding':
      return <HeartIcon className={className} />;
    case 'hourly':
      return <ClockIcon className={className} />;
    case 'tours':
      return <MapIcon className={className} />;
    case 'cruise':
      return <ShipIcon className={className} />;
    case 'longDistance':
      return <GlobeIcon className={className} />;
    default:
      return <CheckIcon className={className} />;
  }
});

// ============================================================================
// ICON COMPONENTS - Optimized with proper attributes
// ============================================================================
const WhatsAppIcon = memo(function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
});

const PhoneIcon = memo(function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  );
});

const CarIcon = memo(function CarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 17h8M8 17a2 2 0 11-4 0 2 2 0 014 0zm8 0a2 2 0 104 0 2 2 0 00-4 0zM4 11l2-6h12l2 6M4 11h16M4 11v6h16v-6" />
    </svg>
  );
});

const StarIcon = memo(function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
});

const UserIcon = memo(function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
});

const UsersIcon = memo(function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
});

const SparklesIcon = memo(function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
});

const CheckBadgeIcon = memo(function CheckBadgeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  );
});

const CheckIcon = memo(function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
});

const SeatIcon = memo(function SeatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
});

const QuietIcon = memo(function QuietIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
    </svg>
  );
});

const MusicIcon = memo(function MusicIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
    </svg>
  );
});

const LuggageIcon = memo(function LuggageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
});

const SnowflakeIcon = memo(function SnowflakeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m0-18l-3 3m3-3l3 3m-3 15l-3-3m3 3l3-3M3 12h18M3 12l3-3m-3 3l3 3m15-3l-3-3m3 3l-3 3" />
    </svg>
  );
});

const BriefcaseIcon = memo(function BriefcaseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
});

const PlaneIcon = memo(function PlaneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  );
});

const ShieldIcon = memo(function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
});

const HeartIcon = memo(function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
});

const ClockIcon = memo(function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
});

const MapIcon = memo(function MapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  );
});

const ShipIcon = memo(function ShipIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 15l2-2m0 0l7-7 7 7M5 13v8a2 2 0 002 2h10a2 2 0 002-2v-8" />
    </svg>
  );
});

const GlobeIcon = memo(function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
});