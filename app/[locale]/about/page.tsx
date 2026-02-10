'use client';

import { useRef, useMemo, memo } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/navigation';
import Image from 'next/image';
// ============================================================================
// PERFORMANCE: Memoized main component
// ============================================================================
export default function AboutPage() {
  const t = useTranslations('about');

  return (
    <>
      <HeroSection t={t} />
      <StorySection t={t} />
      <OfferSection t={t} />
      <TrustSection t={t} />
      <RatingSection t={t} />
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
  t: ReturnType<typeof useTranslations<'about'>> 
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
          className="absolute top-1/4 -left-20 w-64 h-64 sm:w-80 sm:h-80 bg-blue-500/10 rounded-full blur-3xl"
          style={{ willChange: 'transform' }}
        />
        <div 
          className="absolute bottom-1/4 -right-20 w-64 h-64 sm:w-80 sm:h-80 bg-amber-500/10 rounded-full blur-3xl"
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
          {/* MOBILE FIX: Responsive text sizing with proper line height */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-[1.15] sm:leading-tight">
            {t('hero.title')}{' '}
            <span className="bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent inline-block">
              {t('hero.titleHighlight')}
            </span>
          </h1>
          {/* MOBILE FIX: Better spacing and readability */}
          <p className="text-base sm:text-lg lg:text-xl text-gray-300 leading-relaxed px-4 sm:px-0">
            {t('hero.subtitle')}
          </p>
        </motion.div>
      </div>
    </section>
  );
});

// ============================================================================
// STORY SECTION - Optimized
// ============================================================================



// Adjust import path as needed

const StorySection = memo(function StorySection({ 
  t 
}: { 
  t: ReturnType<typeof useTranslations<'about'>> 
}) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.15, margin: "0px 0px -50px 0px" });
  const shouldReduceMotion = useReducedMotion();

  return (
    <section ref={ref} className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center">
          {/* Text Content */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, x: -20 }}
            animate={isInView && !shouldReduceMotion ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            {/* MOBILE FIX: Responsive heading with word-break for long translations */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 break-words">
              {t('story.title')}{' '}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent inline-block">
                {t('story.titleHighlight')}
              </span>
            </h2>
            <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6 leading-relaxed">
              {t('story.paragraph1')}
            </p>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              {t('story.paragraph2')}
            </p>
          </motion.div>

          {/* Image Container */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, x: 20 }}
            animate={isInView && !shouldReduceMotion ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: shouldReduceMotion ? 0 : 0.15 }}
            className="relative"
          >
            {/* Main Image Container - Using fleet images */}
            <div 
              className="relative aspect-[4/2] rounded-2xl overflow-hidden shadow-xl"
              style={{ 
                minHeight: '150px',
                willChange: isInView ? 'auto' : 'transform' 
              }}
            >
              {/* Option 1: Single fleet image */}
              <Image
                src="/images/fleet/luxury-chauffeur.png" // or use luxury-sedan.png, standard-van.png, etc.
                alt={t('story.imageAlt') || "Our premium chauffeur service vehicle"}
                fill
                sizes="(max-width: 1000px) 80vw, 50vw"
                className="object-cover"
                priority={false}
                quality={85}
                onError={(e) => {
                  // Fallback if image doesn't exist
                  e.currentTarget.style.display = 'none';
                }}
              />
              
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              
              {/* Text overlay */}
              <div className="absolute bottom-4 left-4 right-4 text-white z-10">
                <p className="text-sm sm:text-base font-semibold opacity-95">Premium Chauffeur Service</p>
                <p className="text-xs sm:text-sm opacity-80 mt-1">Mercedes V-Class Luxury Van</p>
              </div>
            </div>
            
            {/* Decorative element with smaller car image */}
            <div 
              className="hidden sm:block absolute -bottom-4 -right-4 w-20 h-20 lg:w-24 lg:h-24 rounded-2xl overflow-hidden border-4 border-white shadow-lg -z-10"
            >
              <Image
                src="/images/fleet/standard-sedan.png"
                alt="Standard sedan"
                fill
                sizes="96px"
                className="object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
});



// ============================================================================
// OFFER SECTION - Optimized with staggered animations
// ============================================================================
const OfferSection = memo(function OfferSection({ 
  t 
}: { 
  t: ReturnType<typeof useTranslations<'about'>> 
}) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1, margin: "0px 0px -50px 0px" });
  const shouldReduceMotion = useReducedMotion();

  const offerings = useMemo(() => [
    { key: 'fleet', icon: FleetIcon },
    { key: 'drivers', icon: DriverIcon },
    { key: 'service', icon: ServiceIcon },
  ], []);

  return (
    <section ref={ref} className="py-16 sm:py-20 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 15 }}
          animate={isInView && !shouldReduceMotion ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 sm:mb-12 lg:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 break-words px-4 sm:px-0">
            {t('offer.title')}{' '}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent inline-block">
              {t('offer.titleHighlight')}
            </span>
          </h2>
        </motion.div>

        {/* Offerings grid - MOBILE FIX: Better spacing on small screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {offerings.map((item, index) => (
            <OfferingCard 
              key={item.key}
              item={item}
              index={index}
              isInView={isInView}
              t={t}
            />
          ))}
        </div>
      </div>
    </section>
  );
});

// PERFORMANCE: Separate card component to prevent re-renders
const OfferingCard = memo(function OfferingCard({ 
  item, 
  index, 
  isInView,
  t 
}: { 
  item: { key: string; icon: React.ComponentType<{ className?: string }> };
  index: number;
  isInView: boolean;
  t: ReturnType<typeof useTranslations<'about'>>;
}) {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <motion.div
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
      animate={isInView && !shouldReduceMotion ? { opacity: 1, y: 0 } : {}}
      transition={{ 
        duration: 0.5, 
        delay: shouldReduceMotion ? 0 : 0.1 + index * 0.08,
      }}
      className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300"
    >
      <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white mb-4 sm:mb-6">
        <item.icon className="w-6 h-6 sm:w-7 sm:h-7" />
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 break-words">
        {t(`offer.${item.key}.title`)}
      </h3>
      <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
        {t(`offer.${item.key}.description`)}
      </p>
    </motion.div>
  );
});

// ============================================================================
// TRUST SECTION - Optimized
// ============================================================================
const TrustSection = memo(function TrustSection({ 
  t 
}: { 
  t: ReturnType<typeof useTranslations<'about'>> 
}) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2, margin: "0px 0px -50px 0px" });
  const animation = useAccessibleAnimation();

  return (
    <section ref={ref} className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={animation.initial}
            animate={isInView ? animation.animate : animation.initial}
            transition={animation.transition}
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 break-words px-4 sm:px-0">
              {t('trust.title')}{' '}
              <span className="bg-gradient-to-r from-amber-500 to-orange-400 bg-clip-text text-transparent inline-block">
                {t('trust.titleHighlight')}
              </span>
            </h2>
            <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 leading-relaxed">
              {t('trust.description')}
            </p>
            <p className="text-base sm:text-lg text-gray-700 font-medium leading-relaxed">
              {t('trust.promise')}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
});

// ============================================================================
// RATING SECTION - Optimized with GPU-accelerated stars
// ============================================================================
const RatingSection = memo(function RatingSection({ 
  t 
}: { 
  t: ReturnType<typeof useTranslations<'about'>> 
}) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2, margin: "0px 0px -50px 0px" });
  const shouldReduceMotion = useReducedMotion();

  return (
    <section ref={ref} className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          animate={isInView && !shouldReduceMotion ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12"
        >
          {/* MOBILE FIX: Larger touch targets for stars */}
          <div className="flex justify-center gap-1 sm:gap-2 mb-4 sm:mb-6" role="img" aria-label="5 star rating">
            {[...Array(5)].map((_, i) => (
              <StarIcon 
                key={i} 
                className="w-7 h-7 sm:w-9 sm:h-9 lg:w-10 lg:h-10 text-amber-400 fill-amber-400" 
                style={{ willChange: 'transform' }}
              />
            ))}
          </div>

          <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold mb-3 sm:mb-4 px-4 sm:px-0">
            {t('rating.title')}
          </h2>
          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto px-4 sm:px-0">
            {t('rating.subtitle')}
          </p>
        </motion.div>

        {/* Testimonial Card - MOBILE FIX: Better mobile styling */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          animate={isInView && !shouldReduceMotion ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: shouldReduceMotion ? 0 : 0.15 }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 lg:p-10 border border-white/10">
            <QuoteIcon className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400 mb-4 sm:mb-6" />
            <p className="text-base sm:text-lg lg:text-xl text-gray-300 leading-relaxed mb-4 sm:mb-6 italic">
              &ldquo;{t('testimonial.quote')}&rdquo;
            </p>
            <p className="text-amber-400 font-semibold text-sm sm:text-base">
              – {t('testimonial.source')}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
});

// ============================================================================
// CTA SECTION - Optimized with proper touch targets
// ============================================================================
const CTASection = memo(function CTASection({ 
  t 
}: { 
  t: ReturnType<typeof useTranslations<'about'>> 
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
          className="text-center bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 rounded-2xl sm:rounded-3xl p-8 sm:p-10 lg:p-16 shadow-2xl"
        >
          <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-white mb-6 sm:mb-8 px-2 sm:px-0">
            {t('cta.title')}
          </h2>
          {/* MOBILE FIX: Proper button sizing and spacing with 44x44px minimum touch targets */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
            <a
              href="https://wa.me/34123456789"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 sm:px-8 py-4 min-h-[44px] text-sm sm:text-base font-semibold text-emerald-700 bg-white rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-emerald-600"
              aria-label="Book via WhatsApp"
            >
              <WhatsAppIcon className="w-5 h-5 mr-2 flex-shrink-0" />
              <span className="truncate">{t('cta.bookWhatsApp')}</span>
            </a>
            <span className="text-emerald-200 text-sm sm:text-base self-center px-2">{t('cta.or')}</span>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-6 sm:px-8 py-4 min-h-[44px] text-sm sm:text-base font-semibold text-white bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 active:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-emerald-600"
            >
              <span className="truncate">{t('cta.contactUs')}</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
});

// ============================================================================
// ICON COMPONENTS - Optimized with proper attributes
// ============================================================================
function CarIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor" 
      strokeWidth={1.5}
      role="img"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 17h8M8 17a2 2 0 11-4 0 2 2 0 014 0zm8 0a2 2 0 104 0 2 2 0 00-4 0zM4 11l2-6h12l2 6M4 11h16M4 11v6h16v-6" />
    </svg>
  );
}

const FleetIcon = memo(function FleetIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 17h8M8 17a2 2 0 11-4 0 2 2 0 014 0zm8 0a2 2 0 104 0 2 2 0 00-4 0zM4 11l2-6h12l2 6M4 11h16M4 11v6h16v-6" />
    </svg>
  );
});

const DriverIcon = memo(function DriverIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
});

const ServiceIcon = memo(function ServiceIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
});

const StarIcon = memo(function StarIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={style} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
});

const QuoteIcon = memo(function QuoteIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
    </svg>
  );
});

const WhatsAppIcon = memo(function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
});