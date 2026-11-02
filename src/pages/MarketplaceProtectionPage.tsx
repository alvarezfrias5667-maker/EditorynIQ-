import React from 'react';
import { useI18n } from '../i18n';
import { PageHero } from '../components/ui/PageHero';

export const MarketplaceProtectionPage: React.FC = () => {
  const { t } = useI18n();

  return (
    <div className="space-y-12 pb-20">
      <PageHero
        title={t.legal.marketplaceProtectionTitle}
        subtitle="E6 Engine Architecture & Catalog Verification Standard"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 bg-white p-8 sm:p-12 rounded-2xl border border-slate-200/90 shadow-2xs space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs italic">
          {t.legal.disclaimer}
        </div>

        <h3 className="text-lg font-bold text-[#101828] border-b border-slate-100 pb-2">
          1. E6 Engine Architecture Overview
        </h3>
        <p>
          The E6 Marketplace & Commerce engine defines the structural framework for rights verification, buyer protection, catalog metadata standards, and digital rights protection across future commercial channels.
        </p>

        <h3 className="text-lg font-bold text-[#101828] border-b border-slate-100 pb-2">
          2. Non-Active State Status
        </h3>
        <p>
          In accordance with ADN V100 constitutional rules, the Marketplace is currently presented as an architectural specification. No live commercial transactions or public catalog purchases are enabled in this Foundation build.
        </p>
      </div>
    </div>
  );
};
