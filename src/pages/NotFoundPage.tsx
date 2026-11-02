import React from 'react';
import { useI18n } from '../i18n';
import { PremiumButton } from '../components/ui/PremiumButton';

export interface NotFoundPageProps {
  onNavigate: (path: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
  const { t } = useI18n();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-[#081629] text-[#E9BC72] flex items-center justify-center font-serif text-3xl font-extrabold shadow-md">
        404
      </div>
      <h1 className="text-3xl font-extrabold text-[#101828]">Page Not Found</h1>
      <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
        The route you are looking for does not exist in EditorynIQ™. Return to the homepage or access your Studio Workspace.
      </p>
      <div className="flex items-center gap-4 pt-2">
        <PremiumButton variant="primary" size="md" onClick={() => onNavigate('/')}>
          {t.nav.home}
        </PremiumButton>
        <PremiumButton variant="outline" size="md" onClick={() => onNavigate('/studio')}>
          {t.nav.studio}
        </PremiumButton>
      </div>
    </div>
  );
};
