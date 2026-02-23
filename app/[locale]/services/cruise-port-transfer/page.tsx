'use client';

import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

export default function CruisePortTaxiPage() {
  const t = useTranslations('services.cruisePortTaxi');

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'TaxiService',
            name: t('structuredData.name'),
            description: t('structuredData.description'),
            areaServed: 'Barcelona',
            serviceType: 'Cruise Port Transfer',
            provider: {
              '@type': 'LocalBusiness',
              name: 'Cruise Port Taxi Barcelona'
            }
          })
        }}
      />

      {/* Structured Data for FAQ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: t('faq.q1.question'),
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: t('faq.q1.answer')
                }
              },
              {
                '@type': 'Question',
                name: t('faq.q2.question'),
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: t('faq.q2.answer')
                }
              },
              {
                '@type': 'Question',
                name: t('faq.q3.question'),
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: t('faq.q3.answer')
                }
              },
              {
                '@type': 'Question',
                name: t('faq.q4.question'),
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: t('faq.q4.answer')
                }
              }
            ]
          })
        }}
      />

      {/* Main Content */}
      <main role="main" itemScope itemType="https://schema.org/Service">
        <HeroSection t={t} />
        <FeaturesSection t={t} />
        <RoutesSection t={t} />
        <HowItWorksSection t={t} />
        <FleetSection t={t} />
        <FAQSection t={t} />
        <CTASection t={t} />
      </main>
    </>
  );
}

// ============================================================================
// HERO SECTION
// ============================================================================
function HeroSection({ t }: { t: ReturnType<typeof useTranslations<'services.cruisePortTaxi'>> }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3, margin: '-100px' });

  const badges = [
    { key: 'fixedPrice', icon: '💰' },
    { key: 'meetGreet', icon: '👋' },
    { key: 'luggage', icon: '🧳' },
    { key: 'availability', icon: '⏰' },
    { key: 'childSeats', icon: '👶' },
    { key: 'vans', icon: '🚐' }
  ];

  return (
    <section 
      ref={ref}
      className="relative py-12 sm:py-16 overflow-hidden bg-gradient-to-br from-blue-900 via-navy-800 to-blue-900"
      aria-labelledby="hero-title"
      itemScope
      itemType="https://schema.org/WPHeader"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/4 -left-20 w-64 h-64 md:w-80 md:h-80 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-64 h-64 md:w-80 md:h-80 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-900 to-transparent" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-4xl"
          itemScope
          itemType="https://schema.org/TaxiService"
        >
          <h1 
            id="hero-title"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 leading-tight"
            itemProp="name"
          >
            {t('hero.title')}
          </h1>
          <p 
            className="text-base sm:text-lg md:text-xl text-blue-200 mb-6 md:mb-8 leading-relaxed max-w-3xl"
            itemProp="description"
          >
            {t('hero.subtitle')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 md:mb-10">
            <a
              href="https://wa.me/34617629115"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg active:scale-95 touch-manipulation"
              aria-label={t('hero.aria.whatsapp')}
            >
              <WhatsAppIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
              {t('hero.ctaWhatsApp')}
            </a>
            <a
              href="tel:+34617629115"
              className="inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 text-sm sm:text-base font-semibold text-white bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/15 transition-all active:scale-95 touch-manipulation"
              aria-label={t('hero.aria.call')}
            >
              <PhoneIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
              {t('hero.ctaCall')}
            </a>
          </div>

          {/* Badges */}
          <div 
            className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3"
            role="list"
            aria-label={t('hero.aria.features')}
          >
            {badges.map((badge, index) => (
              <motion.div
                key={badge.key}
                initial={{ opacity: 0, y: 15 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
                transition={{ duration: 0.4, delay: 0.2 + index * 0.05 }}
                className="flex items-center gap-2 text-xs sm:text-sm text-blue-100 p-2 sm:p-3 bg-white/5 rounded-lg"
                role="listitem"
              >
                <span className="text-base" aria-hidden="true">{badge.icon}</span>
                <span className="font-medium">{t(`hero.badges.${badge.key}`)}</span>
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
function FeaturesSection({ t }: { t: ReturnType<typeof useTranslations<'services.cruisePortTaxi'>> }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2, margin: '-50px' });

  const features = [
    { key: 'specialists', icon: ShipIcon, color: 'from-blue-500 to-cyan-400' },
    { key: 'fleet', icon: CarIcon, color: 'from-emerald-500 to-teal-400' },
    { key: 'pricing', icon: PriceIcon, color: 'from-amber-500 to-orange-400' },
    { key: 'support', icon: SupportIcon, color: 'from-purple-500 to-pink-400' },
  ];

  return (
    <section 
      ref={ref} 
      className="py-12 sm:py-16 bg-white"
      aria-labelledby="features-title"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <motion.article
              key={feature.key}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
              className="text-center p-5 sm:p-6 lg:p-8 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow"
              itemScope
              itemType="https://schema.org/Service"
            >
              <div 
                className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${feature.color} text-white mb-4 sm:mb-5`}
                aria-hidden="true"
              >
                <feature.icon className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h3 
                className="text-base sm:text-lg font-bold text-gray-900 mb-2"
                itemProp="name"
              >
                {t(`features.${feature.key}.title`)}
              </h3>
              <p 
                className="text-gray-600 text-xs sm:text-sm leading-relaxed"
                itemProp="description"
              >
                {t(`features.${feature.key}.description`)}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// ROUTES SECTION
// ============================================================================
function RoutesSection({ t }: { t: ReturnType<typeof useTranslations<'services.cruisePortTaxi'>> }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2, margin: '-50px' });

  const routes = [
    { key: 'airport', popular: true },
    { key: 'city', popular: false },
    { key: 'sightseeing', popular: false },
    { key: 'coastal', popular: false },
  ];

  return (
    <section 
      ref={ref} 
      className="py-12 sm:py-16 bg-gray-50"
      aria-labelledby="routes-title"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.header
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-12"
        >
          <h2 
            id="routes-title"
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4"
          >
            {t('routes.title')}
          </h2>
          <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
            {t('routes.subtitle')}
          </p>
        </motion.header>

        {/* Routes grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {routes.map((route, index) => (
            <motion.article
              key={route.key}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
              className={`relative bg-white rounded-2xl p-5 sm:p-6 border-2 ${
                route.popular ? 'border-blue-500 shadow-lg' : 'border-gray-100 shadow-md'
              }`}
              itemScope
              itemType="https://schema.org/Offer"
            >
              {route.popular && (
                <div className="absolute -top-2 sm:-top-3 right-3 sm:right-4">
                  <span 
                    className="px-2 sm:px-3 py-1 text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                    aria-label={t('routes.popularLabel')}
                  >
                    {t('routes.popular')}
                  </span>
                </div>
              )}

              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <RouteIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                  <h3 
                    className="text-base sm:text-lg font-bold text-gray-900"
                    itemProp="name"
                  >
                    {t(`routes.${route.key}.name`)}
                  </h3>
                </div>
              </div>

              <p 
                className="text-xl sm:text-2xl font-bold text-gray-900 mb-1"
                itemProp="price"
              >
                {t(`routes.${route.key}.price`)}
              </p>
              <p 
                className="text-xs sm:text-sm text-gray-500 mb-3"
                itemProp="description"
              >
                {t(`routes.${route.key}.description`)}
              </p>
              <div className="text-xs text-gray-400">
                {t(`routes.${route.key}.note`)}
              </div>
            </motion.article>
          ))}
        </div>

        {/* Note and CTA */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-8 sm:mt-10"
        >
          <p className="text-gray-600 text-sm sm:text-base mb-6">
            {t('routes.note')}
          </p>
          <a
            href="https://wa.me/34617629115"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg active:scale-95 touch-manipulation"
            aria-label={t('routes.aria.quote')}
          >
            {t('routes.cta')}
          </a>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// HOW IT WORKS SECTION
// ============================================================================
function HowItWorksSection({ t }: { t: ReturnType<typeof useTranslations<'services.cruisePortTaxi'>> }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2, margin: '-50px' });

  const steps = ['step1', 'step2', 'step3'];

  return (
    <section 
      ref={ref} 
      className="py-12 sm:py-16 bg-white"
      aria-labelledby="how-it-works-title"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.header
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-12"
        >
          <h2 
            id="how-it-works-title"
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4"
          >
            {t('howItWorks.title')}
          </h2>
          <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
            {t('howItWorks.subtitle')}
          </p>
        </motion.header>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line - desktop */}
          <div className="hidden lg:block absolute top-8 left-[16.67%] right-[16.67%] h-0.5 bg-gradient-to-r from-blue-200 via-cyan-200 to-teal-200" aria-hidden="true" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {steps.map((step, index) => (
              <motion.article
                key={step}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.15 }}
                className="text-center"
                itemScope
                itemType="https://schema.org/HowToStep"
              >
                <div className="flex justify-center mb-4 sm:mb-6">
                  <div 
                    className="relative z-10 w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center text-lg sm:text-xl font-bold shadow-lg"
                    aria-hidden="true"
                  >
                    {index + 1}
                  </div>
                </div>
                <h3 
                  className="text-base sm:text-lg font-bold text-gray-900 mb-2"
                  itemProp="name"
                >
                  {t(`howItWorks.${step}.title`)}
                </h3>
                <p 
                  className="text-gray-600 text-sm leading-relaxed"
                  itemProp="text"
                >
                  {t(`howItWorks.${step}.description`)}
                </p>
              </motion.article>
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
function FleetSection({ t }: { t: ReturnType<typeof useTranslations<'services.cruisePortTaxi'>> }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2, margin: '-50px' });

  // Define image paths for each vehicle
  const vehicleImages = {
    tesla: '/images/tesla-Model-3-Front-View-standard-scaled.webp',
    prius: '/images/toyota-prius-plus-transfer-front.webp',
    vito: '/images/ford-tourneo-custom-front-barcelona.webp',
    vclass: '/images/luxury-chauffeur-van-barcelona-service.webp'
  };

  const vehicles = [
    { key: 'tesla', pax: 4 },
    { key: 'prius', pax: 4 },
    { key: 'vito', pax: 8 },
    { key: 'vclass', pax: 7 },
  ];

  return (
    <section 
      ref={ref} 
      className="py-12 sm:py-16 bg-gradient-to-br from-navy-900 via-blue-800 to-navy-900 text-white"
      aria-labelledby="fleet-title"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.header
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-12"
        >
          <h2 
            id="fleet-title"
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4"
          >
            {t('fleet.title')}
          </h2>
          <p className="text-blue-200 text-sm sm:text-base max-w-2xl mx-auto">
            {t('fleet.subtitle')}
          </p>
        </motion.header>

        {/* Fleet grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {vehicles.map((vehicle, index) => (
            <motion.article
              key={vehicle.key}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-blue-500/30 transition-all hover:shadow-xl group"
              itemScope
              itemType="https://schema.org/Product"
            >
              {/* Image container */}
              <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br from-blue-800 to-navy-900">
                {/* Car Image */}
                <Image
                  src={vehicleImages[vehicle.key as keyof typeof vehicleImages]}
                  alt={t(`fleet.${vehicle.key}.name`)}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="w-full h-full object-contain p-6 transition-transform duration-500 group-hover:scale-105"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-navy-900/70 via-transparent to-transparent" />
              </div>
              
              <div className="p-4 sm:p-5">
                <h3 
                  className="text-base sm:text-lg font-bold text-white mb-1"
                  itemProp="name"
                >
                  {t(`fleet.${vehicle.key}.name`)}
                </h3>
                <p 
                  className="text-xs sm:text-sm text-blue-300 mb-2"
                  itemProp="description"
                >
                  {t(`fleet.${vehicle.key}.type`)}
                </p>
                <div 
                  className="flex items-center gap-1 text-xs sm:text-sm text-amber-300"
                  aria-label={`${vehicle.pax} ${t('fleet.paxLabel', { count: vehicle.pax })}`}
                >
                  <UserIcon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" aria-hidden="true" />
                  <span>
                    {vehicle.pax} {t('fleet.pax', { count: vehicle.pax })}
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// FAQ SECTION
// ============================================================================
function FAQSection({ t }: { t: ReturnType<typeof useTranslations<'services.cruisePortTaxi'>> }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2, margin: '-50px' });
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = ['q1', 'q2', 'q3', 'q4'];

  return (
    <section 
      ref={ref} 
      className="py-12 sm:py-16 bg-gray-50"
      aria-labelledby="faq-title"
      itemScope
      itemType="https://schema.org/FAQPage"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.header
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-12"
        >
          <h2 
            id="faq-title"
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4"
          >
            {t('faq.title')}
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            {t('faq.subtitle')}
          </p>
        </motion.header>

        {/* FAQ accordion */}
        <div className="space-y-3 sm:space-y-4">
          {faqs.map((faq, index) => (
            <motion.section
              key={faq}
              initial={{ opacity: 0, y: 15 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
              itemScope
              itemType="https://schema.org/Question"
              itemProp="mainEntity"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
                id={`faq-question-${index}`}
              >
                <span 
                  className="font-semibold text-gray-900 pr-4 text-sm sm:text-base"
                  itemProp="name"
                >
                  {t(`faq.${faq}.question`)}
                </span>
                <ChevronDownIcon
                  className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>
              <div
                id={`faq-answer-${index}`}
                role="region"
                aria-labelledby={`faq-question-${index}`}
                className={`transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                {openIndex === index && (
                  <div 
                    className="px-4 pb-4 sm:px-5 sm:pb-5"
                    itemScope
                    itemType="https://schema.org/Answer"
                    itemProp="acceptedAnswer"
                  >
                    <p 
                      className="text-gray-600 text-sm leading-relaxed"
                      itemProp="text"
                    >
                      {t(`faq.${faq}.answer`)}
                    </p>
                  </div>
                )}
              </div>
            </motion.section>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// CTA SECTION
// ============================================================================
function CTASection({ t }: { t: ReturnType<typeof useTranslations<'services.cruisePortTaxi'>> }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3, margin: '-50px' });

  return (
    <section 
      ref={ref} 
      className="py-12 sm:py-16 bg-white"
      aria-labelledby="cta-title"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 rounded-2xl sm:rounded-3xl p-8 sm:p-10 lg:p-16 shadow-2xl"
        >
          <h2 
            id="cta-title"
            className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-3 sm:mb-4"
          >
            {t('cta.title')}
          </h2>
          <p className="text-sm sm:text-lg text-blue-100 mb-6 sm:mb-8 max-w-2xl mx-auto">
            {t('cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <a
              href="https://wa.me/34617629115"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 text-sm sm:text-base font-semibold text-blue-700 bg-white rounded-xl hover:bg-gray-100 transition-colors shadow-lg active:scale-95 touch-manipulation w-full sm:w-auto"
              aria-label={t('cta.aria.whatsapp')}
            >
              <WhatsAppIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
              {t('cta.whatsapp')}
            </a>
            <a
              href="tel:+34617629115"
              className="inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 text-sm sm:text-base font-semibold text-white bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/15 transition-colors active:scale-95 touch-manipulation w-full sm:w-auto"
              aria-label={t('cta.aria.call')}
            >
              <PhoneIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
              {t('cta.call')}
            </a>
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
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  );
}

function ShipIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4m16 0l-3.343 3.343a2 2 0 01-2.829 0l-1.172-1.172a2 2 0 00-2.829 0l-1.172 1.172a2 2 0 01-2.829 0L4 12m16 0l-3.343-3.343a2 2 0 00-2.829 0l-1.172 1.172a2 2 0 01-2.829 0l-1.172-1.172a2 2 0 00-2.829 0L4 12" />
    </svg>
  );
}

function CarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 17h8M8 17a2 2 0 11-4 0 2 2 0 014 0zm8 0a2 2 0 104 0 2 2 0 00-4 0zM4 11l2-6h12l2 6M4 11h16M4 11v6h16v-6" />
    </svg>
  );
}

function PriceIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function SupportIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function RouteIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}
