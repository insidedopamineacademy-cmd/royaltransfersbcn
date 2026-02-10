'use client';

import { useRef, useMemo, memo } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

// ============================================================================
// PERFORMANCE: Memoized main component
// ============================================================================
export default function EightSeaterVanPage() {
  const t = useTranslations('fleet.eightSeaterVan');

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
  t: ReturnType<typeof useTranslations<'fleet.eightSeaterVan'>> 
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
          className="absolute top-1/4 -left-20 w-64 h-64 sm:w-80 sm:h-80 bg-indigo-500/10 rounded-full blur-3xl"
          style={{ willChange: 'transform' }}
        />
        <div 
          className="absolute bottom-1/4 -right-20 w-64 h-64 sm:w-80 sm:h-80 bg-violet-500/10 rounded-full blur-3xl"
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
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs sm:text-sm font-medium mb-4 sm:mb-6">
            <UsersIcon className="w-3 h-3 sm:w-4 sm:h-4" />
            {t('hero.badge')}
          </div>

          {/* MOBILE FIX: Responsive text sizing with proper line height */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-[1.15] sm:leading-tight">
            {t('hero.title')}{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent inline-block">
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
  t: ReturnType<typeof useTranslations<'fleet.eightSeaterVan'>> 
}) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1, margin: "0px 0px -50px 0px" });

  // Define image paths for each van
  const vehicleImages = {
    vito: '/images/fleet/vito.png',
    tourneo: '/images/fleet/ford.png', // Assuming ford.png is the Tourneo
  };

  const vehicles = useMemo(() => [
    {
      key: 'vito',
      color: 'from-indigo-500 to-violet-500',
      bgColor: 'from-indigo-50 to-violet-50',
      borderColor: 'border-indigo-200 hover:border-indigo-400',
      iconBg: 'bg-indigo-100 text-indigo-600',
      features: ['passengers', 'luggage', 'seats', 'climate', 'driver'],
      perfectFor: ['airport', 'cruise', 'hotel', 'sightseeing', 'hourly', 'longDistance'],
      image: vehicleImages.vito, // Add image path
    },
    {
      key: 'tourneo',
      color: 'from-slate-600 to-slate-700',
      bgColor: 'from-slate-50 to-gray-100',
      borderColor: 'border-slate-200 hover:border-slate-400',
      iconBg: 'bg-slate-100 text-slate-600',
      features: ['luggage', 'passengers', 'connectivity', 'climate', 'driver'],
      perfectFor: ['airport', 'cruise', 'hotel', 'tours', 'hourly', 'intercity'],
      image: vehicleImages.tourneo, // Add image path
    },
  ], [vehicleImages]);

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
    image: string; // Add image property
  };
  t: ReturnType<typeof useTranslations<'fleet.eightSeaterVan'>>;
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
        {/* Image Side - UPDATED with actual van images */}
        <div className={`${isReversed ? 'lg:order-2' : ''}`}>
          <div 
            className={`relative aspect-[4/3] bg-gradient-to-br ${vehicle.bgColor} rounded-2xl sm:rounded-3xl border-2 ${vehicle.borderColor} transition-colors overflow-hidden group`}
            style={{ minHeight: '250px', willChange: isInView ? 'auto' : 'transform' }}
          >
            {/* 8 Passengers badge */}
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10">
              <span className={`px-2 sm:px-3 py-1 text-xs font-bold text-white bg-gradient-to-r ${vehicle.color} rounded-full flex items-center gap-1`}>
                <UsersIcon className="w-3 h-3" />
                {t('labels.eightPassengers')}
              </span>
            </div>
            
            {/* Van image using Next.js Image component */}
            <Image
              src={vehicle.image}
              alt={t(`vehicles.${vehicle.key}.name`)}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              quality={85}
              priority={index < 2} // Load both images with priority
              onError={(e) => {
                // Fallback if van image fails to load
                console.error(`Failed to load van image: ${vehicle.image}`);
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                
                // Show fallback content
                const fallback = document.createElement('div');
                fallback.className = 'absolute inset-0 flex items-center justify-center';
                fallback.innerHTML = `
                  <div class="text-center p-6 sm:p-8">
                    <svg class="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 text-gray-400 mx-auto mb-3 sm:mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 17h8M8 17a2 2 0 11-4 0 2 2 0 014 0zm8 0a2 2 0 104 0 2 2 0 00-4 0zM4 11l2-6h12l2 6M4 11h16M4 11v6h16v-6" />
                    </svg>
                    <p class="text-gray-500 text-xs sm:text-sm font-medium">${t(`vehicles.${vehicle.key}.name`)}</p>
                  </div>
                `;
                target.parentElement?.appendChild(fallback);
              }}
            />
            {/* Gradient overlay for better visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          </div>
        </div>

        {/* Content Side */}
        <div className={`${isReversed ? 'lg:order-1' : ''}`}>
          {/* Vehicle Title */}
          <div className="mb-4 sm:mb-6">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 break-words">
              {t(`vehicles.${vehicle.key}.name`)}
            </h2>
            <p className={`text-base sm:text-lg font-medium bg-gradient-to-r ${vehicle.color} bg-clip-text text-transparent`}>
              {t(`vehicles.${vehicle.key}.tagline`)}
            </p>
          </div>

          {/* Key Features */}
          <div className="mb-6 sm:mb-8">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
              <SparklesIcon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
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

          {/* Pricing & CTA */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4 border-t border-gray-200">
            <div className="w-full sm:w-auto">
              <p className="text-xs sm:text-sm text-gray-500">{t('labels.startingFrom')}</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{t(`vehicles.${vehicle.key}.price`)}</p>
              <p className="text-xs text-gray-500">{t(`vehicles.${vehicle.key}.priceNote`)}</p>
            </div>
            <a
              href="https://wa.me/34617629115"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center justify-center px-5 sm:px-6 py-3 sm:py-3.5 min-h-[44px] text-sm sm:text-base font-semibold text-white bg-gradient-to-r ${vehicle.color} rounded-xl hover:opacity-90 active:opacity-80 transition-opacity shadow-lg sm:ml-auto w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
              aria-label={`Book ${t(`vehicles.${vehicle.key}.name`)} via WhatsApp`}
            >
              <WhatsAppIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
              <span className="truncate">{t('labels.bookWhatsApp')}</span>
            </a>
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
  t: ReturnType<typeof useTranslations<'fleet.eightSeaterVan'>> 
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
          className="text-center bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-600 rounded-2xl sm:rounded-3xl p-8 sm:p-10 lg:p-16 shadow-2xl"
        >
          {/* Badge - MOBILE FIX: Responsive sizing */}
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/10 border border-white/20 rounded-full text-white text-xs sm:text-sm font-medium mb-4 sm:mb-6">
            <UsersIcon className="w-3 h-3 sm:w-4 sm:h-4" />
            {t('cta.badge')}
          </div>
          
          {/* MOBILE FIX: Responsive heading */}
          <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-white mb-3 sm:mb-4 px-2 sm:px-0">
            {t('cta.title')}
          </h2>
          
          <p className="text-base sm:text-lg text-indigo-100 mb-6 sm:mb-8 max-w-2xl mx-auto px-2 sm:px-0 leading-relaxed">
            {t('cta.subtitle')}
          </p>
          
          {/* MOBILE FIX: Proper button sizing and spacing with 44x44px minimum touch targets */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
            <a
              href="https://wa.me/34617629115"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 sm:px-8 py-4 min-h-[44px] text-sm sm:text-base font-semibold text-indigo-700 bg-white rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
              aria-label="Book via WhatsApp"
            >
              <WhatsAppIcon className="w-5 h-5 mr-2 flex-shrink-0" />
              <span className="truncate">{t('cta.whatsapp')}</span>
            </a>
            <a
              href="tel:+34617629115"
              className="inline-flex items-center justify-center px-6 sm:px-8 py-4 min-h-[44px] text-sm sm:text-base font-semibold text-white bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 active:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
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
    case 'passengers':
      return <UsersIcon className={className} />;
    case 'luggage':
      return <LuggageIcon className={className} />;
    case 'seats':
      return <SeatIcon className={className} />;
    case 'climate':
      return <SnowflakeIcon className={className} />;
    case 'driver':
      return <UserIcon className={className} />;
    case 'connectivity':
      return <WifiIcon className={className} />;
    default:
      return <CheckIcon className={className} />;
  }
});

const PerfectForIcon = memo(function PerfectForIcon({ use, className }: { use: string; className?: string }) {
  switch (use) {
    case 'airport':
      return <PlaneIcon className={className} />;
    case 'cruise':
      return <ShipIcon className={className} />;
    case 'hotel':
      return <HotelIcon className={className} />;
    case 'sightseeing':
    case 'tours':
      return <CameraIcon className={className} />;
    case 'hourly':
      return <ClockIcon className={className} />;
    case 'longDistance':
    case 'intercity':
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

const VanIcon = memo(function VanIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 17h8M8 17a2 2 0 11-4 0 2 2 0 014 0zm8 0a2 2 0 104 0 2 2 0 00-4 0zM2 9h3l2-4h8l4 4h3v6h-1M2 9v6h1m18-6v6" />
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

const UserIcon = memo(function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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

const LuggageIcon = memo(function LuggageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
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

const SnowflakeIcon = memo(function SnowflakeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m0-18l-3 3m3-3l3 3m-3 15l-3-3m3 3l3-3M3 12h18M3 12l3-3m-3 3l3 3m15-3l-3-3m3 3l-3 3" />
    </svg>
  );
});

const WifiIcon = memo(function WifiIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
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

const ShipIcon = memo(function ShipIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 15l2-2m0 0l7-7 7 7M5 13v8a2 2 0 002 2h10a2 2 0 002-2v-8" />
    </svg>
  );
});

const HotelIcon = memo(function HotelIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
});

const CameraIcon = memo(function CameraIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
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

const GlobeIcon = memo(function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
});