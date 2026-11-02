import React from 'react';
import { useI18n } from '../i18n';
import { PageHero } from '../components/ui/PageHero';

export const AcceptableUsePage: React.FC = () => {
  const { t } = useI18n();

  return (
    <div className="space-y-12 pb-20">
      <PageHero
        title={t.legal.acceptableUseTitle}
        subtitle="Acceptable Use & Content Quality Standards"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 bg-white p-8 sm:p-12 rounded-2xl border border-slate-200/90 shadow-2xs space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs italic">
          {t.legal.disclaimer}
        </div>

        <h3 className="text-lg font-bold text-[#101828] border-b border-slate-100 pb-2">
          1. Prohibited Uses
        </h3>
        <p>
          Users may not utilize EditorynIQ™ to generate or format content that violates copyright laws, promotes hate speech, distributes malware, or attempts to circumvent browser security controls.
        </p>

        <h3 className="text-lg font-bold text-[#101828] border-b border-slate-100 pb-2">
          2. Editorial Quality Compliance
        </h3>
        <p>
          EditorynIQ™ is designed for professional book creation up to 600 pages. Users are expected to maintain editorial integrity and respect intellectual property rights across all project manuscripts.
        </p>
      </div>
    </div>
  );
};
