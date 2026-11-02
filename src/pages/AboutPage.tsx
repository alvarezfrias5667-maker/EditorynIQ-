import React from 'react';
import { useI18n } from '../i18n';
import { PageHero } from '../components/ui/PageHero';
import { PremiumButton } from '../components/ui/PremiumButton';

export interface AboutPageProps {
  onNavigate: (path: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  const { t } = useI18n();

  return (
    <div className="space-y-12 pb-20">
      <PageHero
        title={t.about.title}
        subtitle={t.about.subtitle}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-10">
        <div className="bg-white p-8 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <span className="text-xs font-bold text-[#345CFF] uppercase tracking-wider">
            {t.about.visionTitle}
          </span>
          <p className="text-sm text-slate-700 leading-relaxed">
            {t.about.visionText}
          </p>
        </div>

        <div className="bg-[#081629] text-white p-8 rounded-2xl border border-[#101F37] space-y-4">
          <span className="text-xs font-bold text-[#16C8BA] uppercase tracking-wider">
            {t.about.adnTitle}
          </span>
          <p className="text-sm text-slate-300 leading-relaxed">
            {t.about.adnText}
          </p>
        </div>

        <div className="text-center pt-4">
          <PremiumButton variant="primary" size="lg" onClick={() => onNavigate('/start')}>
            {t.start.submitCreate}
          </PremiumButton>
        </div>
      </div>
    </div>
  );
};
