import React from 'react';
import { useI18n } from '../i18n';
import { PageHero } from '../components/ui/PageHero';

export const CookiesPage: React.FC = () => {
  const { t } = useI18n();

  return (
    <div className="space-y-12 pb-20">
      <PageHero
        title={t.legal.cookiesTitle}
        subtitle="Local Storage & Cookie Policy Specification"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 bg-white p-8 sm:p-12 rounded-2xl border border-slate-200/90 shadow-2xs space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs italic">
          {t.legal.disclaimer}
        </div>

        <h3 className="text-lg font-bold text-[#101828] border-b border-slate-100 pb-2">
          1. Essential Local Storage Usage
        </h3>
        <p>
          EditorynIQ™ utilizes browser IndexedDB and localStorage exclusively for functional user preferences (such as selected interface language EN/ES/FR) and saving local book project drafts on your browser.
        </p>

        <h3 className="text-lg font-bold text-[#101828] border-b border-slate-100 pb-2">
          2. No Third-Party Tracking Cookies
        </h3>
        <p>
          We do not employ cross-site tracking cookies, third-party advertising pixels, or invasive behavioral monitoring technologies in this application.
        </p>
      </div>
    </div>
  );
};
