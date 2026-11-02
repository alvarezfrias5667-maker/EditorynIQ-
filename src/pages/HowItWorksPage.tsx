import React from 'react';
import { useI18n } from '../i18n';
import { PageHero } from '../components/ui/PageHero';
import { PremiumButton } from '../components/ui/PremiumButton';

export interface HowItWorksPageProps {
  onNavigate: (path: string) => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ onNavigate }) => {
  const { t } = useI18n();

  return (
    <div className="space-y-12 pb-20">
      <PageHero
        title={t.howItWorks.title}
        subtitle={t.howItWorks.subtitle}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="space-y-6">
          {/* Phase 1 */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <span className="text-xs font-bold text-[#345CFF] uppercase tracking-wider">Phase 1</span>
            <h3 className="text-xl font-bold text-[#101828]">{t.howItWorks.phase1Title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{t.howItWorks.phase1Desc}</p>
          </div>

          {/* Phase 2 */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <span className="text-xs font-bold text-[#16C8BA] uppercase tracking-wider">Phase 2</span>
            <h3 className="text-xl font-bold text-[#101828]">{t.howItWorks.phase2Title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{t.howItWorks.phase2Desc}</p>
          </div>

          {/* Phase 3 */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <span className="text-xs font-bold text-[#E9BC72] uppercase tracking-wider">Phase 3</span>
            <h3 className="text-xl font-bold text-[#101828]">{t.howItWorks.phase3Title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{t.howItWorks.phase3Desc}</p>
          </div>

          {/* Phase 4 */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <span className="text-xs font-bold text-[#345CFF] uppercase tracking-wider">Phase 4</span>
            <h3 className="text-xl font-bold text-[#101828]">{t.howItWorks.phase4Title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{t.howItWorks.phase4Desc}</p>
          </div>

          {/* Phase 5 */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <span className="text-xs font-bold text-[#16836D] uppercase tracking-wider">Phase 5</span>
            <h3 className="text-xl font-bold text-[#101828]">{t.howItWorks.phase5Title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{t.howItWorks.phase5Desc}</p>
          </div>
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
