import React from 'react';
import { useI18n } from '../i18n';
import { PageHero } from '../components/ui/PageHero';

export const RefundPolicyPage: React.FC = () => {
  const { t } = useI18n();

  return (
    <div className="space-y-12 pb-20">
      <PageHero
        title={t.legal.refundPolicyTitle}
        subtitle="Commercial Scope & Satisfaction Commitments"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 bg-white p-8 sm:p-12 rounded-2xl border border-slate-200/90 shadow-2xs space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs italic">
          {t.legal.disclaimer}
        </div>

        <h3 className="text-lg font-bold text-[#101828] border-b border-slate-100 pb-2">
          1. Free Local Foundation Access
        </h3>
        <p>
          The EditorynIQ™ Foundation release is provided as a local browser tool for manuscript intake and local blueprinting without automated recurring charges.
        </p>

        <h3 className="text-lg font-bold text-[#101828] border-b border-slate-100 pb-2">
          2. Commercial Services Guarantee
        </h3>
        <p>
          Custom commercial editorial production services, once introduced, will be governed by explicit intake agreements specifying page counts, deliverables, and satisfaction guarantees.
        </p>
      </div>
    </div>
  );
};
