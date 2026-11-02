import React from 'react';
import { useI18n } from '../i18n';
import { PageHero } from '../components/ui/PageHero';

export const AuthorTermsPage: React.FC = () => {
  const { t } = useI18n();

  return (
    <div className="space-y-12 pb-20">
      <PageHero
        title={t.legal.authorTermsTitle}
        subtitle="Author Rights, Ownership & Royalties Charter"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 bg-white p-8 sm:p-12 rounded-2xl border border-slate-200/90 shadow-2xs space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs italic">
          {t.legal.disclaimer}
        </div>

        <h3 className="text-lg font-bold text-[#101828] border-b border-slate-100 pb-2">
          1. 100% Royalty Retention
        </h3>
        <p>
          Authors retaining books through EditorynIQ™ keep 100% of net royalties generated from third-party distribution channels (including KDP, IngramSpark, and direct sales).
        </p>

        <h3 className="text-lg font-bold text-[#101828] border-b border-slate-100 pb-2">
          2. Non-Exclusive Relationship
        </h3>
        <p>
          Using EditorynIQ™ to design or prepare your manuscript does not grant EditorynIQ™ exclusive publishing rights unless explicitly agreed upon under a separate publishing agreement.
        </p>
      </div>
    </div>
  );
};
