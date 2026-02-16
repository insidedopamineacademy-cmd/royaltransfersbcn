'use client';

import { useState, useRef, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, useRouter, usePathname } from '@/lib/navigation';
import { locales, localeNames, type Locale } from '@/lib/i18n';

export default function Header() {
  const t = useTranslations('header');
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  /* =======================
     STATE MANAGEMENT
  ======================== */

  // Desktop
  const [servicesOpen, setServicesOpen] = useState(false);
  const [fleetOpen, setFleetOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  // Mobile
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [mobileFleetOpen, setMobileFleetOpen] = useState(false);

  /* =======================
     REFS (DESKTOP ONLY)
  ======================== */

  const servicesRef = useRef<HTMLDivElement>(null);
  const fleetRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  /* =======================
     DESKTOP CLICK OUTSIDE
  ======================== */

  useEffect(() => {
    if (window.innerWidth < 1024) return;

    function handleClickOutside(event: MouseEvent) {
      if (servicesRef.current && !servicesRef.current.contains(event.target as Node)) {
        setServicesOpen(false);
      }
      if (fleetRef.current && !fleetRef.current.contains(event.target as Node)) {
        setFleetOpen(false);
      }
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /* =======================
     HELPERS
  ======================== */

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setMobileServicesOpen(false);
    setMobileFleetOpen(false);
  };

  const handleLanguageChange = (newLocale: Locale) => {
    router.replace(pathname, { locale: newLocale });
    setLangOpen(false);
    closeMobileMenu();
  };

  /* =======================
     DATA
  ======================== */

  const servicesItems = [
    { key: 'airportTaxi', href: '/services/airport-transfer' },
    { key: 'cruisePort', href: '/services/cruise-port-transfer' },
    { key: 'longDistance', href: '/services/long-distance-transfer' },
    { key: 'hourlyBooking', href: '/services/hourly-transfer' },
  ];

  const fleetItems = [
    { key: 'standard', href: '/fleet/standard' },
    { key: 'luxurySedan', href: '/fleet/luxury-sedan' },
    { key: 'eightSeaterVan', href: '/fleet/8-seater-van' },
    { key: 'luxuryChaufferVan', href: '/fleet/luxury-chauffer-van' },
  ];

  /* =======================
     RENDER
  ======================== */

  return (
    <header className="bg-neutral-900 text-white sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-xl lg:text-2xl font-bold text-amber-500">
              Royal Transfers
            </span>
            <span className="text-xs lg:text-sm text-neutral-400">BCN</span>
          </Link>

          {/* =======================
              DESKTOP NAV
          ======================== */}
          <div className="hidden lg:flex items-center gap-1">
            <Link href="/" className="px-4 py-2 text-sm font-medium text-neutral-300 hover:text-amber-500">
              {t('home')}
            </Link>

            <Link href="/about" className="px-4 py-2 text-sm font-medium text-neutral-300 hover:text-amber-500">
              {t('aboutUs')}
            </Link>

            {/* Services */}
            <div ref={servicesRef} className="relative">
              <button
                onClick={() => {
                  setServicesOpen(!servicesOpen);
                  setFleetOpen(false);
                }}
                className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-neutral-300 hover:text-amber-500"
              >
                {t('services')}
                <ChevronDownIcon className={`w-4 h-4 ${servicesOpen ? 'rotate-180' : ''}`} />
              </button>

              {servicesOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-neutral-800 rounded-2xl shadow-xl py-2 border border-neutral-700">
                  {servicesItems.map(item => (
                    <Link
                      key={item.key}
                      href={item.href}
                      className="block px-4 py-2.5 text-sm text-neutral-300 hover:bg-neutral-700 hover:text-amber-500"
                    >
                      {t(`servicesMenu.${item.key}`)}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Fleet */}
            <div ref={fleetRef} className="relative">
              <button
                onClick={() => {
                  setFleetOpen(!fleetOpen);
                  setServicesOpen(false);
                }}
                className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-neutral-300 hover:text-amber-500"
              >
                {t('fleet')}
                <ChevronDownIcon className={`w-4 h-4 ${fleetOpen ? 'rotate-180' : ''}`} />
              </button>

              {fleetOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-neutral-800 rounded-2xl shadow-xl py-2 border border-neutral-700">
                  {fleetItems.map(item => (
                    <Link
                      key={item.key}
                      href={item.href}
                      className="block px-4 py-2.5 text-sm text-neutral-300 hover:bg-neutral-700 hover:text-amber-500"
                    >
                      {t(`fleetMenu.${item.key}`)}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/contact" className="px-4 py-2 text-sm font-medium text-neutral-300 hover:text-amber-500">
              {t('contactUs')}
            </Link>
          </div>

          {/* =======================
              DESKTOP RIGHT
          ======================== */}
          <div className="hidden lg:flex items-center gap-4">
            <div ref={langRef} className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-neutral-300 border border-neutral-700 rounded-xl"
              >
                <GlobeIcon className="w-4 h-4" />
                {locale.toUpperCase()}
                <ChevronDownIcon className={`w-4 h-4 ${langOpen ? 'rotate-180' : ''}`} />
              </button>

              {langOpen && (
                <div className="absolute top-full right-0 mt-1 w-40 bg-neutral-800 rounded-2xl shadow-xl py-2 border border-neutral-700">
                  {locales.map(loc => (
                    <button
                      key={loc}
                      onClick={() => handleLanguageChange(loc)}
                      className={`w-full text-left px-4 py-2.5 text-sm ${
                        loc === locale
                          ? 'text-amber-500 bg-neutral-700'
                          : 'text-neutral-300 hover:bg-neutral-700 hover:text-amber-500'
                      }`}
                    >
                      {localeNames[loc]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/book"
              className="px-5 py-2.5 text-sm font-semibold bg-amber-500 text-neutral-900 rounded-xl hover:bg-amber-400"
            >
              {t('bookNow')}
            </Link>
          </div>

          {/* =======================
              MOBILE TOGGLE
          ======================== */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-neutral-300"
          >
            {mobileMenuOpen ? <CloseIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>

        {/* =======================
            MOBILE MENU
        ======================== */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-neutral-800 py-4">
            <Link href="/" onClick={closeMobileMenu} className="block px-4 py-3">
              {t('home')}
            </Link>

            <Link href="/about" onClick={closeMobileMenu} className="block px-4 py-3">
              {t('aboutUs')}
            </Link>

            {/* Mobile Services */}
            <button
              onClick={() => setMobileServicesOpen(p => !p)}
              className="w-full flex justify-between px-4 py-3"
            >
              {t('services')}
              <ChevronDownIcon className={`w-5 h-5 ${mobileServicesOpen ? 'rotate-180' : ''}`} />
            </button>

            {mobileServicesOpen && (
              <div className="ml-4 border-l-2 border-neutral-700 pl-4">
                {servicesItems.map(item => (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className="block px-4 py-2 text-sm"
                  >
                    {t(`servicesMenu.${item.key}`)}
                  </Link>
                ))}
              </div>
            )}

            {/* Mobile Fleet */}
            <button
              onClick={() => setMobileFleetOpen(p => !p)}
              className="w-full flex justify-between px-4 py-3"
            >
              {t('fleet')}
              <ChevronDownIcon className={`w-5 h-5 ${mobileFleetOpen ? 'rotate-180' : ''}`} />
            </button>

            {mobileFleetOpen && (
              <div className="ml-4 border-l-2 border-neutral-700 pl-4">
                {fleetItems.map(item => (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className="block px-4 py-2 text-sm"
                  >
                    {t(`fleetMenu.${item.key}`)}
                  </Link>
                ))}
              </div>
            )}

                        {/* Mobile Language Switcher */}
            <div className="px-4 py-3 border-t border-neutral-800 mt-4">
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-3">
                {t('language')}
              </p>
              <div className="flex flex-wrap gap-2">
                {locales.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => handleLanguageChange(loc)}
                    className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                      loc === locale
                        ? 'bg-amber-500 text-neutral-900'
                        : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                    }`}
                  >
                    {localeNames[loc]}
                  </button>
                ))}
              </div>
            </div>

            <Link href="/contact" onClick={closeMobileMenu} className="block px-4 py-3">
              {t('contactUs')}
            </Link>

            <div className="mt-4 px-4">
              <Link
                href="/book"
                onClick={closeMobileMenu}
                className="block w-full text-center px-5 py-3 font-semibold bg-amber-500 text-neutral-900 rounded-xl"
              >
                {t('bookNow')}
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

/* =======================
   ICONS
======================== */

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.6 9h16.8M3.6 15h16.8M12 3a15 15 0 014 9 15 15 0 01-4 9 15 15 0 01-4-9 15 15 0 014-9z" />
    </svg>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
