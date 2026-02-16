'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/lib/navigation';

export default function Footer() {
  const t = useTranslations('footer');
  const tHeader = useTranslations('header');
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: tHeader('home'), href: '/' },
    { label: tHeader('aboutUs'), href: '/about' },
    { label: tHeader('contactUs'), href: '/contact' },
    { label: tHeader('bookNow'), href: '/book' },
  ];

  const servicesLinks = [
    { label: tHeader('servicesMenu.airportTaxi'), href: '/services/airport-transfer' },
    { label: tHeader('servicesMenu.cruisePort'), href: '/services/cruise-port-transfer' },
    { label: tHeader('servicesMenu.longDistance'), href: '/services/long-distance-transfer' },
    { label: tHeader('servicesMenu.hourlyBooking'), href: '/services/hourly-transfer' },
  ];

  const fleetLinks = [
    { label: tHeader('fleetMenu.standard'), href: '/fleet/standard' },
    { label: tHeader('fleetMenu.luxurySedan'), href: '/fleet/luxury-sedan' },
    { label: tHeader('fleetMenu.eightSeaterVan'), href: '/fleet/8-seater-van' },
    { label: tHeader('fleetMenu.luxuryChaufferVan'), href: '/fleet/luxury-chauffer-van' },
  ];

  return (
    <footer className="bg-neutral-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="text-xl font-bold text-amber-500">Royal Transfers</span>
              <span className="text-sm text-neutral-400 ml-1">BCN</span>
            </Link>
            <p className="text-neutral-400 text-sm leading-relaxed mb-6">
              {t('tagline')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider mb-4">
              {t('quickLinks')}
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-400 hover:text-amber-500 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider mb-4">
              {t('ourServices')}
            </h3>
            <ul className="space-y-3">
              {servicesLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-400 hover:text-amber-500 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Fleet */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider mb-4">
              {t('ourFleet')}
            </h3>
            <ul className="space-y-3">
              {fleetLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-400 hover:text-amber-500 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider mb-4">
              {t('contact')}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <LocationIcon className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <span className="text-sm text-neutral-400">{t('address')}</span>
              </li>
              <li>
                <a
                  href={`mailto:${t('email')}`}
                  className="flex items-start gap-3 text-sm text-neutral-400 hover:text-amber-500 transition-colors"
                >
                  <EmailIcon className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <span>{t('email')}</span>
                </a>
              </li>
              <li>
                <a
                  href={`tel:${t('phone').replace(/\s/g, '')}`}
                  className="flex items-start gap-3 text-sm text-neutral-400 hover:text-amber-500 transition-colors"
                >
                  <PhoneIcon className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <span>{t('phone')}</span>
                </a>
              </li>
              <li className="flex items-start gap-3">
                <ClockIcon className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <span className="text-sm text-neutral-400">{t('available')}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-neutral-500">
              {t('copyright', { year: currentYear })}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              <Link
                href="/privacy-policy"
                className="text-sm text-neutral-500 hover:text-amber-500 transition-colors"
              >
                {t('privacyPolicy')}
              </Link>
              <Link
                href="/terms-conditions"
                className="text-sm text-neutral-500 hover:text-amber-500 transition-colors"
              >
                {t('termsConditions')}
              </Link>
              <Link
                href="/cookie-policy"
                className="text-sm text-neutral-500 hover:text-amber-500 transition-colors"
              >
                {t('cookiePolicy')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Icon Components

function LocationIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function EmailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
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

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
