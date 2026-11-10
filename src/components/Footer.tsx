import React from 'react';
import { Language, TabType } from '../types';
import { translations } from '../i18n/translations';

interface FooterProps {
  lang: Language;
  onOpenTab: (tab: TabType) => void;
}

export const Footer: React.FC<FooterProps> = ({ lang, onOpenTab }) => {
  const t = translations[lang];

  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 py-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Brand & Mission */}
        <div className="space-y-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <div className="w-5 h-5 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              BF
            </div>
            <span className="font-extrabold text-sm text-neutral-900 dark:text-white">
              {t.appName}
            </span>
          </div>
          <p className="text-xs text-neutral-500 max-w-sm">
            100% Free, ultra-fast AI background removal with client-side privacy.
          </p>
        </div>

        {/* Clean Unboxed Nav Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-neutral-600 dark:text-neutral-400">
          <button
            onClick={() => onOpenTab('studio')}
            className="hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            {t.studioNav}
          </button>
          <button
            onClick={() => onOpenTab('batch')}
            className="hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            {t.batchMode}
          </button>
          <button
            onClick={() => onOpenTab('pricing')}
            className="hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            {t.pricingNav}
          </button>
          <button
            onClick={() => onOpenTab('faq')}
            className="hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            {t.faqNav}
          </button>
          <button
            onClick={() => onOpenTab('privacy')}
            className="hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            {t.privacyNav}
          </button>
        </div>

        {/* Unboxed Metadata & Copyright */}
        <div className="text-xs text-neutral-400 flex items-center gap-2">
          <span>&copy; {new Date().getFullYear()} BG Remover Fast</span>
          <span aria-hidden="true">&middot;</span>
          <span>100% Free Forever</span>
          <span aria-hidden="true">&middot;</span>
          <span>Zero Server Storage</span>
        </div>

      </div>
    </footer>
  );
};
