'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslations } from 'next-intl';

export default function StandardSedanPage() {
  const t = useTranslations('fleet.standard');

  return (
    <>
      <HeroSection t={t} />
      <VehiclesSection t={t} />
      <CTASection t={t} />
    </>
  );
}

// ============================================================================
// HERO SECTION
// ============================================================================
function HeroSection({ t }: { t: ReturnType<typeof useTranslations<'fleet.standard'>> }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section
      ref={ref}
      className="relative py-20 lg:py-28 overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium mb-6">
            <UserIcon className="w-4 h-4" />
            {t('hero.badge')}
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            {t('hero.title')}{' '}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              {t('hero.titleHighlight')}
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 leading-relaxed max-w-3xl mx-auto">
            {t('hero.subtitle')}
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// VEHICLES SECTION
// ============================================================================
function VehiclesSection({ t }: { t: ReturnType<typeof useTranslations<'fleet.standard'>> }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  const vehicles = [
    {
      key: 'tesla',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-50 to-cyan-50',
      borderColor: 'border-blue-200 hover:border-blue-400',
      iconBg: 'bg-blue-100 text-blue-600',
      features: ['electric', 'leather', 'climate', 'navigation', 'drivers'],
      perfectFor: ['eco', 'airport', 'business', 'hourly', 'tours'],
    },
    {
      key: 'prius',
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'from-emerald-50 to-teal-50',
      borderColor: 'border-emerald-200 hover:border-emerald-400',
      iconBg: 'bg-emerald-100 text-emerald-600',
      features: ['hybrid', 'luggage', 'climate', 'infotainment', 'drivers'],
      perfectFor: ['airport', 'hotel', 'cruise', 'local', 'hourly'],
    },
  ];

  return (
    <section ref={ref} className="py-20 lg:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-16 lg:space-y-24">
          {vehicles.map((vehicle, index) => (
            <motion.div
              key={vehicle.key}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <VehicleCard vehicle={vehicle} t={t} index={index} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function VehicleCard({
  vehicle,
  t,
  index,
}: {
  vehicle: {
    key: string;
    color: string;
    bgColor: string;
    borderColor: string;
    iconBg: string;
    features: string[];
    perfectFor: string[];
  };
  t: ReturnType<typeof useTranslations<'fleet.standard'>>;
  index: number;
}) {
  const isReversed = index % 2 === 1;

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center ${isReversed ? 'lg:flex-row-reverse' : ''}`}>
      {/* Image Side */}
      <div className={`${isReversed ? 'lg:order-2' : ''}`}>
        <div className={`aspect-[4/3] bg-gradient-to-br ${vehicle.bgColor} rounded-3xl flex items-center justify-center border-2 ${vehicle.borderColor} transition-colors overflow-hidden`}>
          <div className="text-center p-8">
            <CarIcon className="w-24 h-24 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-sm">{t(`vehicles.${vehicle.key}.name`)}</p>
          </div>
        </div>
      </div>

      {/* Content Side */}
      <div className={`${isReversed ? 'lg:order-1' : ''}`}>
        {/* Vehicle Title */}
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            {t(`vehicles.${vehicle.key}.name`)}
          </h2>
          <p className={`text-lg font-medium bg-gradient-to-r ${vehicle.color} bg-clip-text text-transparent`}>
            {t(`vehicles.${vehicle.key}.tagline`)}
          </p>
        </div>

        {/* Key Features */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-amber-500" />
            {t('labels.keyFeatures')}
          </h3>
          <ul className="space-y-3">
            {vehicle.features.map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <span className={`w-8 h-8 rounded-lg ${vehicle.iconBg} flex items-center justify-center shrink-0`}>
                  <FeatureIcon feature={feature} className="w-4 h-4" />
                </span>
                <span className="text-gray-700 pt-1">{t(`vehicles.${vehicle.key}.features.${feature}`)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Perfect For */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CheckBadgeIcon className="w-5 h-5 text-emerald-500" />
            {t('labels.perfectFor')}
          </h3>
          <div className="flex flex-wrap gap-2">
            {vehicle.perfectFor.map((use) => (
              <span
                key={use}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-700"
              >
                <PerfectForIcon use={use} className="w-4 h-4 text-gray-500" />
                {t(`vehicles.${vehicle.key}.perfectFor.${use}`)}
              </span>
            ))}
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4 border-t border-gray-200">
          <div>
            <p className="text-sm text-gray-500">{t('labels.startingFrom')}</p>
            <p className="text-3xl font-bold text-gray-900">{t(`vehicles.${vehicle.key}.price`)}</p>
            <p className="text-xs text-gray-500">{t(`vehicles.${vehicle.key}.priceNote`)}</p>
          </div>
          <a
            href="https://wa.me/34617629115"
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-gradient-to-r ${vehicle.color} rounded-xl hover:opacity-90 transition-opacity shadow-lg sm:ml-auto`}
          >
            <WhatsAppIcon className="w-5 h-5 mr-2" />
            {t('labels.bookWhatsApp')}
          </a>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CTA SECTION
// ============================================================================
function CTASection({ t }: { t: ReturnType<typeof useTranslations<'fleet.standard'>> }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section ref={ref} className="py-20 lg:py-28 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 rounded-3xl p-10 lg:p-16 shadow-2xl"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
            {t('cta.title')}
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            {t('cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://wa.me/34617629115"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-blue-700 bg-white rounded-xl hover:bg-gray-100 transition-colors shadow-lg w-full sm:w-auto"
            >
              <WhatsAppIcon className="w-5 h-5 mr-2" />
              {t('cta.whatsapp')}
            </a>
            <a
              href="tel:+34617629115"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-colors w-full sm:w-auto"
            >
              <PhoneIcon className="w-5 h-5 mr-2" />
              {t('cta.call')}
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// FEATURE ICONS HELPER
// ============================================================================
function FeatureIcon({ feature, className }: { feature: string; className?: string }) {
  switch (feature) {
    case 'electric':
      return <BoltIcon className={className} />;
    case 'hybrid':
      return <FuelIcon className={className} />;
    case 'leather':
    case 'luggage':
      return <SeatIcon className={className} />;
    case 'climate':
      return <SnowflakeIcon className={className} />;
    case 'navigation':
    case 'infotainment':
      return <ScreenIcon className={className} />;
    case 'drivers':
      return <UserIcon className={className} />;
    default:
      return <CheckIcon className={className} />;
  }
}

function PerfectForIcon({ use, className }: { use: string; className?: string }) {
  switch (use) {
    case 'eco':
      return <LeafIcon className={className} />;
    case 'airport':
      return <PlaneIcon className={className} />;
    case 'business':
    case 'local':
      return <BuildingIcon className={className} />;
    case 'hourly':
      return <ClockIcon className={className} />;
    case 'tours':
      return <MapIcon className={className} />;
    case 'hotel':
      return <HotelIcon className={className} />;
    case 'cruise':
      return <ShipIcon className={className} />;
    default:
      return <CheckIcon className={className} />;
  }
}

// ============================================================================
// ICON COMPONENTS
// ============================================================================
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  );
}

function CarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 17h8M8 17a2 2 0 11-4 0 2 2 0 014 0zm8 0a2 2 0 104 0 2 2 0 00-4 0zM4 11l2-6h12l2 6M4 11h16M4 11v6h16v-6" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}

function CheckBadgeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function BoltIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function FuelIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  );
}

function SeatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}

function SnowflakeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m0-18l-3 3m3-3l3 3m-3 15l-3-3m3 3l3-3M3 12h18M3 12l3-3m-3 3l3 3m15-3l-3-3m3 3l-3 3" />
    </svg>
  );
}

function ScreenIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function LeafIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}

function PlaneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  );
}

function BuildingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function MapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  );
}

function HotelIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

function ShipIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 15l2-2m0 0l7-7 7 7M5 13v8a2 2 0 002 2h10a2 2 0 002-2v-8" />
    </svg>
  );
}