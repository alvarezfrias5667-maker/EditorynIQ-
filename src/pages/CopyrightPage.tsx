import React from 'react';
import { useI18n } from '../i18n';
import { PageHero } from '../components/ui/PageHero';

export const CopyrightPage: React.FC = () => {
  const { t } = useI18n();

  return (
    <div className="space-y-12 pb-20">
      <PageHero
        title={t.legal.copyrightTitle}
        subtitle="Intellectual Property Protection & Copyright Declaration"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 bg-white p-8 sm:p-12 rounded-2xl border border-slate-200/90 shadow-2xs space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs italic">
          {t.legal.disclaimer}
        </div>

        <h3 className="text-lg font-bold text-[#101828] border-b border-slate-100 pb-2">
          1. 100% Author Copyright Retention
        </h3>
        <p>
          Authors, creators, and publishers retain complete, unencumbered 100% copyright ownership over all manuscripts, outlines, book titles, cover designs, and generated publication master files produced using EditorynIQ™.
        </p>

        <h3 className="text-lg font-bold text-[#101828] border-b border-slate-100 pb-2">
          2. Platform Trademarks & ADN V100 Protection
        </h3>
        <p>
          EditorynIQ™, Five Integrated Capabilities™, Four Book Production Products™, Six Intelligent Engines™, Text-First™, Visual-First™, and Technical-First™ are protected trademarks and architectural design specifications.
        </p>
      </div>
    </div>
  );
};
