import React from 'react';
import { Sun, Moon, Globe, Layers } from 'lucide-react';
import { Language, TabType } from '../types';
import { translations } from '../i18n/translations';

interface NavbarProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  lang: Language;
  onLangToggle: () => void;
  darkMode: boolean;
  onThemeToggle: () => void;
  onOpenUpload: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  lang,
  onLangToggle,
  darkMode,
  onThemeToggle,
  onOpenUpload
}) => {
  const t = translations[lang];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 h-16">
        
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onTabChange('studio')}
          className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-neutral-900 dark:text-white whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            BF
          </div>
          <span className="font-extrabold">{t.appName}</span>
        </button>

        {/* Zone 2: 4-5 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-600 dark:text-neutral-300">
          <button
            onClick={() => onTabChange('studio')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              currentTab === 'studio'
                ? 'text-blue-600 dark:text-blue-400 font-semibold'
                : 'hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            {t.studioNav}
          </button>

          <button
            onClick={() => onTabChange('batch')}
            className={`flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors ${
              currentTab === 'batch'
                ? 'text-blue-600 dark:text-blue-400 font-semibold'
                : 'hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{t.batchMode}</span>
          </button>

          <button
            onClick={() => onTabChange('pricing')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              currentTab === 'pricing'
                ? 'text-blue-600 dark:text-blue-400 font-semibold'
                : 'hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            {t.pricingNav}
          </button>


          <button
            onClick={() => onTabChange('faq')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              currentTab === 'faq'
                ? 'text-blue-600 dark:text-blue-400 font-semibold'
                : 'hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            {t.faqNav}
          </button>

          <button
            onClick={() => onTabChange('privacy')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              currentTab === 'privacy'
                ? 'text-blue-600 dark:text-blue-400 font-semibold'
                : 'hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            {t.privacyNav}
          </button>
        </nav>

        {/* Zone 3: 1 primary action + compact controls */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Language Toggle Button */}
          <button
            onClick={onLangToggle}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-md border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors whitespace-nowrap shrink-0"
            title="Toggle Language (English / বাংলা)"
            aria-label="Toggle Language"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'বাংলা' : 'EN'}</span>
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={onThemeToggle}
            className="p-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shrink-0"
            title="Toggle Dark / Light Theme"
            aria-label="Toggle Dark / Light Theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-neutral-600" />}
          </button>

          {/* Primary Action Button */}
          <button
            onClick={onOpenUpload}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0"
          >
            {t.newImage}
          </button>
        </div>

      </div>
    </header>
  );
};
