'use client';

import { useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/navigation';
import { useEffect, useState } from 'react';
import BookingWizard from '@/components/booking/BookingWizard';
import { BookingProvider } from '@/lib/booking/context';

export default function HomePage() {
  const t = useTranslations('home');

  return (
    <>
      <HeroSection t={t} />
      <BookingSection t={t} />
      <ServicesSection t={t} />
      <HowItWorksSection t={t} />
      <FleetSection t={t} />
      <WhyChooseUsSection t={t} />
      <TestimonialsSection t={t} />
      <CTASection t={t} />
    </>
  );
}

// ============================================================================
// HERO SECTION
// ============================================================================
function HeroSection({ t }: { t: ReturnType<typeof useTranslations<'home'>> }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.3]);

  return (
    <section
      ref={ref}
      className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
    >
      {/* Animated background */}
      <AnimatedBackground />
      
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, type: "spring", damping: 20 }}
          >
            {/* Trust badges */}
            <div className="flex flex-wrap gap-3 mb-8">
              {['trustBadge1', 'trustBadge2', 'trustBadge3'].map((badge, index) => (
                <motion.span
                  key={badge}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="px-4 py-1.5 text-sm font-medium bg-white/10 backdrop-blur-sm text-gray-300 rounded-full border border-white/10"
                >
                  {t(`hero.${badge}`)}
                </motion.span>
              ))}
            </div>

            {/* Main headline with floating animation */}
            <motion.h1 
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-tight"
              animate={isInView ? { y: [0, -10, 0] } : { y: 0 }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            >
              {t('hero.title')}{' '}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                {t('hero.titleHighlight')}
              </span>
            </motion.h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-gray-400 mb-10 max-w-2xl leading-relaxed">
              {t('hero.subtitle')}
            </p>

            {/* CTA Buttons with hover effects */}
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <a
                  href="#booking"
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-gray-900 bg-gradient-to-r from-amber-400 to-amber-500 rounded-xl hover:from-amber-500 hover:to-amber-600 transition-all shadow-lg shadow-amber-500/25"
                >
                  {t('hero.bookNow')}
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </a>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/fleet/standard"
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all"
                >
                  {t('hero.viewFleet')}
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-1 h-3 bg-white/50 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}

// GPU-friendly animated background
function AnimatedBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
        animate={{
          x: mousePosition.x * 0.5 - 25,
          y: mousePosition.y * 0.5 - 25,
        }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
      />
      <motion.div
        className="absolute bottom-1/4 -right-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"
        animate={{
          x: -mousePosition.x * 0.3 + 25,
          y: -mousePosition.y * 0.3 + 25,
        }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
      />
    </div>
  );
}

// ============================================================================
// BOOKING SECTION - Integrated Wizard
// ============================================================================
function BookingSection({ t }: { t: ReturnType<typeof useTranslations<'home'>> }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <section 
      id="booking"
      ref={ref} 
      className="py-20 lg:py-28 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden"
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : { scale: 0 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full mb-6"
          >
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-blue-600">
              {/* Updated: Use translation key */}
              {t('hero.bookingSteps.title')}
            </span>
          </motion.div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            {/* Updated: Use translation key */}
            {t('hero.bookingSteps.subtitle')}
            {' '}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Journey
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {/* Updated: Use translation key */}
            {t('hero.bookingSteps.description')}
          </p>
        </motion.div>

        {/* Booking Wizard */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <BookingProvider>
            <BookingWizard />
          </BookingProvider>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600"
        >
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
            {/* Updated: Use translation keys */}
            <span>{t('hero.features.freeCancellation')}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
            <span>{t('hero.features.instantConfirmation')}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
            <span>{t('hero.features.bestPriceGuarantee')}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
            <span>{t('hero.features.support24')}</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
// ============================================================================
// SERVICES SECTION - Optimized with minimal cards
// ============================================================================
function ServicesSection({ t }: { t: ReturnType<typeof useTranslations<'home'>> }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const services = [
    { key: 'airportTaxi', href: '/services/airport-taxi', icon: PlaneIcon, color: 'from-blue-500 to-cyan-400' },
    { key: 'cruisePort', href: '/services/cruise-port', icon: ShipIcon, color: 'from-amber-500 to-orange-400' },
    { key: 'longDistance', href: '/services/long-distance', icon: MapIcon, color: 'from-emerald-500 to-green-400' },
    { key: 'hourlyBooking', href: '/services/hourly-booking', icon: ClockIcon, color: 'from-purple-500 to-pink-400' },
  ];

  return (
    <section ref={ref} className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            {t('services.title')}{' '}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              {t('services.titleHighlight')}
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t('services.subtitle')}
          </p>
        </motion.div>

        {/* Services grid - Optimized for mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.key}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.9 }}
              transition={{ duration: 0.4, delay: 0.1 + index * 0.1, type: "spring" }}
              whileHover={{ y: -5 }}
              className="group relative"
            >
              {/* Animated border on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md" />
              
              <Link
                href={service.href}
                className="relative block h-full p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:border-transparent transition-all"
              >
                <motion.div
                  className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${service.color} text-white mb-6`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <service.icon className="w-7 h-7" />
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {t(`services.${service.key}.title`)}
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {t(`services.${service.key}.description`)}
                </p>
                <span className="inline-flex items-center text-sm font-semibold text-blue-600">
                  {t('services.learnMore')}
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <ArrowRightIcon className="w-4 h-4 ml-1" />
                  </motion.div>
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// HOW IT WORKS SECTION - Simplified animations
// ============================================================================
function HowItWorksSection({ t }: { t: ReturnType<typeof useTranslations<'home'>> }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const steps = [
    { key: 'step1', icon: CalendarIcon, color: 'from-blue-500 to-cyan-400', bgColor: 'bg-blue-50' },
    { key: 'step2', icon: CheckCircleIcon, color: 'from-amber-500 to-orange-400', bgColor: 'bg-amber-50' },
    { key: 'step3', icon: CarIcon, color: 'from-emerald-500 to-green-400', bgColor: 'bg-emerald-50' },
  ];

  return (
    <section ref={ref} className="py-20 lg:py-28 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            {t('howItWorks.title')}{' '}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              {t('howItWorks.titleHighlight')}
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t('howItWorks.subtitle')}
          </p>
        </motion.div>

        {/* Steps with minimal animations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, delay: index * 0.2 }}
              whileHover={{ scale: 1.02 }}
              className="relative"
            >
              {/* Animated step number */}
              <div className="flex justify-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={isInView ? { scale: 1 } : { scale: 0 }}
                  transition={{ delay: 0.5 + index * 0.2, type: "spring" }}
                  className={`relative z-10 w-16 h-16 rounded-full bg-gradient-to-br ${step.color} text-white flex items-center justify-center text-2xl font-bold shadow-lg`}
                >
                  {index + 1}
                </motion.div>
              </div>

              {/* Card */}
              <div className={`${step.bgColor} rounded-2xl p-6 md:p-8 text-center border border-gray-100 hover:shadow-lg transition-shadow`}>
                <motion.div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} text-white mb-5`}
                  animate={isInView ? { rotate: 360 } : { rotate: 0 }}
                  transition={{ delay: 0.8 + index * 0.2, duration: 0.6 }}
                >
                  <step.icon className="w-6 h-6" />
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {t(`howItWorks.${step.key}.title`)}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t(`howItWorks.${step.key}.description`)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// FLEET SECTION - Optimized with hover cards
// ============================================================================
function FleetSection({ t }: { t: ReturnType<typeof useTranslations<'home'>> }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const vehicles = [
    { key: 'standard', href: '/fleet/standard', passengers: 3, luggage: 2, price: '€35' },
    { key: 'luxurySedan', href: '/fleet/luxury-sedan', passengers: 3, luggage: 2, price: '€55' },
    { key: 'eightSeaterVan', href: '/fleet/8-seater-van', passengers: 8, luggage: 8, price: '€75' },
    { key: 'luxuryChaufferVan', href: '/fleet/luxury-chauffer-van', passengers: 7, luggage: 7, price: '€95' },
  ];

  return (
    <section ref={ref} className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            {t('fleet.title')}{' '}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              {t('fleet.titleHighlight')}
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t('fleet.subtitle')}
          </p>
        </motion.div>

        {/* Fleet grid with staggered animation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {vehicles.map((vehicle, index) => (
            <motion.div
              key={vehicle.key}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.5, delay: index * 0.1, type: "spring" }}
              whileHover={{ scale: 1.03 }}
              className="group"
            >
              <Link
                href={vehicle.href}
                className="block h-full bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 hover:border-blue-300 hover:shadow-xl transition-all"
              >
                {/* Image placeholder with animation */}
                <motion.div 
                  className="aspect-[4/3] bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    animate={{ x: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                  >
                    <CarIcon className="w-16 h-16 text-gray-400" />
                  </motion.div>
                </motion.div>

                <div className="p-4 md:p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {t(`fleet.${vehicle.key}.title`)}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {t(`fleet.${vehicle.key}.description`)}
                  </p>

                  {/* Specs */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <UserIcon className="w-4 h-4" />
                      {vehicle.passengers} {t('fleet.passengers')}
                    </span>
                    <span className="flex items-center gap-1">
                      <BriefcaseIcon className="w-4 h-4" />
                      {vehicle.luggage} {t('fleet.luggage')}
                    </span>
                  </div>

                  {/* Price with pulse animation */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{t('fleet.from')}</span>
                    <motion.span
                      className="text-xl font-bold text-blue-600"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 2, delay: index * 0.2 }}
                    >
                      {vehicle.price}
                    </motion.span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// WHY CHOOSE US SECTION - Minimal animations
// ============================================================================
function WhyChooseUsSection({ t }: { t: ReturnType<typeof useTranslations<'home'>> }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const features = [
    { key: 'feature1', icon: UserCheckIcon },
    { key: 'feature2', icon: RadarIcon },
    { key: 'feature3', icon: TagIcon },
    { key: 'feature4', icon: Clock24Icon },
    { key: 'feature5', icon: HandshakeIcon },
    { key: 'feature6', icon: RefundIcon },
  ];

  return (
    <section ref={ref} className="py-20 lg:py-28 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            {t('whyChooseUs.title')}{' '}
            <span className="bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">
              {t('whyChooseUs.titleHighlight')}
            </span>
          </h2>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">
            {t('whyChooseUs.subtitle')}
          </p>
        </motion.div>

        {/* Features grid with minimal animations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="p-4 md:p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-amber-500/30 transition-all"
            >
              <motion.div
                className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-gray-900 mb-5"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <feature.icon className="w-6 h-6" />
              </motion.div>
              <h3 className="text-lg font-bold text-white mb-2">
                {t(`whyChooseUs.${feature.key}.title`)}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {t(`whyChooseUs.${feature.key}.description`)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// TESTIMONIALS SECTION - Optimized animations
// ============================================================================
function TestimonialsSection({ t }: { t: ReturnType<typeof useTranslations<'home'>> }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const reviews = ['review1', 'review2', 'review3'];

  return (
    <section ref={ref} className="py-20 lg:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            {t('testimonials.title')}{' '}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              {t('testimonials.titleHighlight')}
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t('testimonials.subtitle')}
          </p>
        </motion.div>

        {/* Testimonials grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {reviews.map((review, index) => (
            <motion.div
              key={review}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.4, delay: index * 0.15 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              {/* Animated stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                  >
                    <StarIcon className="w-5 h-5 text-amber-400 fill-amber-400" />
                  </motion.div>
                ))}
              </div>

              {/* Quote with typing animation */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-gray-700 mb-6 leading-relaxed"
              >
                &ldquo;{t(`testimonials.${review}.text`)}&rdquo;
              </motion.p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1, type: "spring" }}
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold"
                >
                  {t(`testimonials.${review}.name`).charAt(0)}
                </motion.div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {t(`testimonials.${review}.name`)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {t(`testimonials.${review}.location`)}
                  </p>
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
// CTA SECTION - Eye-catching animation
// ============================================================================
function CTASection({ t }: { t: ReturnType<typeof useTranslations<'home'>> }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section ref={ref} className="py-20 lg:py-28 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="relative overflow-hidden rounded-3xl"
        >
          {/* Animated background */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600"
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{
              repeat: Infinity,
              repeatType: "mirror",
              duration: 10,
            }}
            style={{
              backgroundSize: '200% 200%',
            }}
          />
          
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          
          <div className="relative p-10 lg:p-16">
            <motion.h2
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 text-center"
              animate={isInView ? { y: [0, -10, 0] } : { y: 0 }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            >
              {t('cta.title')}
            </motion.h2>
            
            <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto text-center">
              {t('cta.subtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <a
                  href="#booking"
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-blue-700 bg-white rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
                >
                  {t('cta.bookNow')}
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <ArrowRightIcon className="w-5 h-5 ml-2" />
                  </motion.span>
                </a>
              </motion.div>
              
              <motion.span
                className="text-blue-200"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                {t('cta.or')}
              </motion.span>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-colors"
                >
                  {t('cta.contactUs')}
                </Link>
              </motion.div>
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

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
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

function ShipIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 17h18M5 17l2-8h10l2 8M8 9V5h8v4" />
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

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function BriefcaseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function UserCheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l2 2-4 4" />
    </svg>
  );
}

function RadarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a10 10 0 0110 10M12 2v10l7.07 7.07" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function TagIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
    </svg>
  );
}

function Clock24Icon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function HandshakeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 19h14" />
    </svg>
  );
}

function RefundIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}