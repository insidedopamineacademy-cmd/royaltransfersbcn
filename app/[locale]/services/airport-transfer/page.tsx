'use client';

import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
export default function AirportTaxiPage() {
  const t = useTranslations('services.airportTaxi');

  return (
    <>
      <HeroSection t={t} />
      <FeaturesSection t={t} />
      <RoutesSection t={t} />
      <HowItWorksSection t={t} />
      <FleetSection t={t} />
      <FAQSection t={t} />
      <CTASection t={t} />
    </>
  );
}

// ============================================================================
// HERO SECTION
// ============================================================================
function HeroSection({ t }: { t: ReturnType<typeof useTranslations<'services.airportTaxi'>> }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const badges = ['fixedPrice', 'meetGreet', 'flightTracking', 'freeWait', 'childSeats', 'fastLanes'];

  return (
    <section
      ref={ref}
      className="relative py-12 sm:py-16 overflow-hidden bg-gradient-to-br from-sky-900 via-blue-800 to-sky-900"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500 via-blue-400 to-sky-500" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500/10 border border-sky-500/20 rounded-full text-sky-300 text-sm font-medium mb-6">
            <PlaneIcon className="w-4 h-4" />
            {t('hero.badge')}
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            {t('hero.title')}
          </h1>
          <p className="text-lg sm:text-xl text-sky-200 mb-8 leading-relaxed max-w-3xl">
            {t('hero.subtitle')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <a
              href="https://wa.me/34617629115"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg"
            >
              <WhatsAppIcon className="w-5 h-5 mr-2" />
              {t('hero.ctaWhatsApp')}
            </a>
            <a
              href="tel:+34617629115"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/15 transition-all"
            >
              <PhoneIcon className="w-5 h-5 mr-2" />
              {t('hero.ctaCall')}
            </a>
          </div>

          {/* Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {badges.map((badge, index) => (
              <motion.div
                key={badge}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
                className="flex items-center gap-2 text-sm text-sky-100 p-3 bg-white/5 rounded-lg backdrop-blur-sm"
              >
                <CheckIcon className="w-5 h-5 text-sky-400 shrink-0" />
                <span>{t(`hero.badges.${badge}`)}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// FEATURES SECTION
// ============================================================================
function FeaturesSection({ t }: { t: ReturnType<typeof useTranslations<'services.airportTaxi'>> }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const features = [
    { key: 'drivers', icon: DriverIcon, color: 'from-sky-500 to-blue-400' },
    { key: 'fleet', icon: CarIcon, color: 'from-emerald-500 to-teal-400' },
    { key: 'pricing', icon: PriceIcon, color: 'from-amber-500 to-orange-400' },
    { key: 'support', icon: SupportIcon, color: 'from-purple-500 to-pink-400' },
  ];

  return (
    <section ref={ref} className="py-12 sm:py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.key}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
              className="text-center p-6 lg:p-8 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-xl hover:border-sky-200 transition-all"
            >
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} text-white mb-5`}>
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {t(`features.${feature.key}.title`)}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {t(`features.${feature.key}.description`)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// ROUTES SECTION
// ============================================================================
function RoutesSection({ t }: { t: ReturnType<typeof useTranslations<'services.airportTaxi'>> }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const routes = [
    { key: 'city', popular: true, variants: ['sedan', 'van'] },
    { key: 'sagrada', popular: false },
    { key: 'cruise', popular: false },
    { key: 'sitges', popular: false },
    { key: 'portAventura', popular: false },
    { key: 'lloret', popular: false },
    { key: 'reus', popular: false },
    { key: 'girona', popular: false },
  ];

  return (
    <section ref={ref} className="py-12 sm:py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t('routes.title')}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t('routes.subtitle')}
          </p>
        </motion.div>

        {/* Routes grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {routes.map((route, index) => (
            <motion.div
              key={route.key}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.5, delay: 0.05 + index * 0.05 }}
              className={`relative bg-white rounded-2xl p-5 sm:p-6 border-2 ${
                route.popular ? 'border-sky-500 shadow-xl' : 'border-gray-100 shadow-lg'
              } hover:shadow-xl transition-shadow`}
            >
              {route.popular && (
                <div className="absolute -top-3 right-4">
                  <span className="px-3 py-1 text-xs font-bold text-white bg-gradient-to-r from-sky-500 to-blue-500 rounded-full">
                    {t('routes.popular')}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 mb-3">
                <PlaneIcon className="w-5 h-5 text-sky-500" />
                <h3 className="text-lg font-bold text-gray-900">
                  {t(`routes.${route.key}.name`)}
                </h3>
              </div>

              {route.variants ? (
                <div className="space-y-2">
                  {route.variants.map((variant) => (
                    <div key={variant} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{t(`routes.${variant}`)}</span>
                      <span className="text-lg font-bold text-gray-900">
                        {t(`routes.${route.key}.price.${variant}`)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <p className="text-2xl font-bold text-sky-600 mb-1">
                    {t(`routes.${route.key}.price`)}
                  </p>
                  <p className="text-sm text-gray-500 mb-2">
                    {t(`routes.${route.key}.description`)}
                  </p>
                </>
              )}
              <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">
                {t(`routes.${route.key}.note`)}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Note and CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-10 bg-sky-50 rounded-2xl p-8 border border-sky-100"
        >
          <p className="text-gray-700 mb-4">
            {t('routes.note')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <a
              href="https://wa.me/34617629115"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-sky-500 to-blue-500 rounded-xl hover:from-sky-600 hover:to-blue-600 transition-all shadow-lg"
            >
              {t('routes.cta')}
            </a>
            <p className="text-sm text-gray-600">
              {t('routes.timeNote')}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// HOW IT WORKS SECTION
// ============================================================================
function HowItWorksSection({ t }: { t: ReturnType<typeof useTranslations<'services.airportTaxi'>> }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const steps = ['step1', 'step2', 'step3'];

  return (
    <section ref={ref} className="py-12 sm:py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t('howItWorks.title')}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t('howItWorks.subtitle')}
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line - desktop */}
          <div className="hidden lg:block absolute top-16 left-[16.67%] right-[16.67%] h-0.5 bg-gradient-to-r from-sky-200 via-blue-200 to-sky-200" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.15 }}
                className="text-center"
              >
                <div className="flex justify-center mb-6">
                  <div className="relative z-10 w-14 h-14 rounded-full bg-gradient-to-br from-sky-500 to-blue-500 text-white flex items-center justify-center text-xl font-bold shadow-lg">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {t(`howItWorks.${step}.title`)}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t(`howItWorks.${step}.description`)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// FLEET SECTION
// ============================================================================
function FleetSection({ t }: { t: ReturnType<typeof useTranslations<'services.airportTaxi'>> }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  // Create a mapping of vehicle keys to image paths
  const vehicleImages = {
    tesla: '/images/tesla-Model-3-Front-View-standard-scaled.webp',
    prius: '/images/toyota-prius-plus-transfer-front.webp',
    vito: '/images/7-seater-standard-van-barcelona-taxi.webp',
    vclass: '/images/luxury-chauffeur-van-barcelona-service.webp',
  };

  const vehicles = [
    { key: 'tesla', pax: 4, features: ['eco', 'luxury'] },
    { key: 'prius', pax: 4, features: ['hybrid', 'efficient'] },
    { key: 'vito', pax: 8, features: ['spacious', 'family'] },
    { key: 'vclass', pax: 7, features: ['luxury', 'comfort'] },
  ];

  return (
    <section ref={ref} className="py-12 sm:py-16 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            {t('fleet.title')}
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            {t('fleet.subtitle')}
          </p>
        </motion.div>

        {/* Fleet grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {vehicles.map((vehicle, index) => (
            <motion.div
              key={vehicle.key}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-sky-500/30 transition-all hover:shadow-2xl"
            >
              {/* Image container */}
              <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br from-gray-700 to-gray-800">
                <Image
                  src={vehicleImages[vehicle.key as keyof typeof vehicleImages]}
                  alt={t(`fleet.${vehicle.key}.name`)}
                  fill
                  className="object-contain p-6 transition-transform duration-500 hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 via-transparent to-transparent" />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-white mb-1">
                  {t(`fleet.${vehicle.key}.name`)}
                </h3>
                <p className="text-sm text-gray-400 mb-3">
                  {t(`fleet.${vehicle.key}.type`)}
                </p>
                
                {/* Features */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {vehicle.features.map((feature) => (
                    <span 
                      key={feature}
                      className="px-2 py-1 text-xs bg-sky-900/30 text-sky-300 rounded"
                    >
                      {t(`fleet.features.${feature}`)}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center gap-1 text-sm text-amber-400">
                  <UserIcon className="w-4 h-4" />
                  <span>{vehicle.pax} {t('fleet.pax')}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// FAQ SECTION
// ============================================================================
function FAQSection({ t }: { t: ReturnType<typeof useTranslations<'services.airportTaxi'>> }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = ['q1', 'q2', 'q3', 'q4'];

  return (
    <section ref={ref} className="py-12 sm:py-16 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t('faq.title')}
          </h2>
          <p className="text-gray-600">
            {t('faq.subtitle')}
          </p>
        </motion.div>

        {/* FAQ accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-sky-200 transition-colors"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-sky-50 transition-colors"
                aria-expanded={openIndex === index}
              >
                <span className="font-semibold text-gray-900 pr-4 flex items-center gap-2">
                  <QuestionIcon className="w-5 h-5 text-sky-500 shrink-0" />
                  {t(`faq.${faq}.question`)}
                </span>
                <ChevronDownIcon
                  className={`w-5 h-5 text-gray-500 shrink-0 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-5 pb-5">
                  <p className="text-gray-600 leading-relaxed pl-7">
                    {t(`faq.${faq}.answer`)}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// CTA SECTION
// ============================================================================
function CTASection({ t }: { t: ReturnType<typeof useTranslations<'services.airportTaxi'>> }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section ref={ref} className="py-12 sm:py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center bg-gradient-to-br from-sky-600 via-blue-600 to-sky-700 rounded-3xl p-10 lg:p-16 shadow-2xl relative overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-sky-300/10 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10">
            <PlaneIcon className="w-16 h-16 text-white mx-auto mb-6" />
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
              {t('cta.title')}
            </h2>
            <p className="text-lg text-sky-100 mb-8 max-w-2xl mx-auto">
              {t('cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://wa.me/34617629115"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-sky-700 bg-white rounded-xl hover:bg-gray-100 transition-colors shadow-lg w-full sm:w-auto"
              >
                <WhatsAppIcon className="w-5 h-5 mr-2" />
                {t('cta.whatsapp')}
              </a>
              <a
                href="tel:+34617629115"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/15 transition-colors w-full sm:w-auto"
              >
                <PhoneIcon className="w-5 h-5 mr-2" />
                {t('cta.call')}
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
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

function PlaneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function DriverIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function CarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 17h8M8 17a2 2 0 11-4 0 2 2 0 014 0zm8 0a2 2 0 104 0 2 2 0 00-4 0zM4 11l2-6h12l2 6M4 11h16M4 11v6h16v-6" />
    </svg>
  );
}

function PriceIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function SupportIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
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

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function QuestionIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}