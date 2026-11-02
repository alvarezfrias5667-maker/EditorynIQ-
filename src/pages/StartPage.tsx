import React from 'react';
import { useI18n } from '../i18n';
import { PageHero } from '../components/ui/PageHero';
import { ProductionMode } from '../domain/bookProjectTypes';
import { SmartIntakeWizard } from '../components/intake/SmartIntakeWizard';

export interface StartPageProps {
  initialMode?: ProductionMode;
  onNavigate: (path: string) => void;
}

export const StartPage: React.FC<StartPageProps> = ({ initialMode = 'idea', onNavigate }) => {
  const { t } = useI18n();

  return (
    <div className="space-y-8 pb-20">
      <PageHero
        title="Smart Book Intake V2™"
        subtitle="Professional 6-stage publication intake configuring E1 Book Intelligence, architecture, page budget, and rights."
        badge={t.hero.badgeLocal}
      />

      <SmartIntakeWizard
        initialOrigin={initialMode === 'manuscript' ? 'manuscript' : 'idea'}
        onNavigate={onNavigate}
      />
    </div>
  );
};
