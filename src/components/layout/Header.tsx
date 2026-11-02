import React, { useState } from 'react';
import { useI18n } from '../../i18n';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';

export interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPath, onNavigate }) => {
  const { t } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleNavClick('/')}
            type="button"
            className="group text-xl font-black tracking-tight text-[#081629] flex items-center gap-2 hover:opacity-90 transition-opacity whitespace-nowrap shrink-0"
          >
            {/* Vector Brand Emblem Icon */}
            <span className="w-8 h-8 rounded-lg bg-[#081629] text-[#E9BC72] flex items-center justify-center font-serif text-lg font-bold shadow-xs group-hover:scale-105 transition-transform">
              E
            </span>
            <span>EditorynIQ™</span>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Strictly Home & Pricing only) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-700">
          <button
            onClick={() => handleNavClick('/')}
            type="button"
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#345CFF] ${
              currentPath === '/' ? 'text-[#345CFF] underline underline-offset-4 font-bold' : ''
            }`}
          >
            {t.nav.home}
          </button>
          <button
            onClick={() => handleNavClick('/pricing')}
            type="button"
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#345CFF] ${
              currentPath === '/pricing' ? 'text-[#345CFF] underline underline-offset-4 font-bold' : ''
            }`}
          >
            {t.nav.pricing}
          </button>
        </nav>

        {/* Zone 3: Language Switcher & Mobile Menu Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <LanguageSwitcher />

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            type="button"
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-2 animate-in slide-in-from-top-2 duration-150">
          <button
            onClick={() => handleNavClick('/')}
            type="button"
            className={`block w-full text-left px-3 py-2 text-base font-semibold rounded-md ${
              currentPath === '/' ? 'bg-slate-100 text-[#345CFF]' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            {t.nav.home}
          </button>
          <button
            onClick={() => handleNavClick('/pricing')}
            type="button"
            className={`block w-full text-left px-3 py-2 text-base font-semibold rounded-md ${
              currentPath === '/pricing' ? 'bg-slate-100 text-[#345CFF]' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            {t.nav.pricing}
          </button>
        </div>
      )}
    </header>
  );
};
