import React from 'react';
import { useI18n } from '../i18n';
import { PageHero } from '../components/ui/PageHero';

export const AccessibilityPage: React.FC = () => {
  const { t } = useI18n();

  return (
    <div className="space-y-12 pb-20">
      <PageHero
        title={t.legal.accessibilityTitle}
        subtitle="WCAG 2.1 AA Compliance & Inclusive Design Discipline"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 bg-white p-8 sm:p-12 rounded-2xl border border-slate-200/90 shadow-2xs space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs italic">
          {t.legal.disclaimer}
        </div>

        <h3 className="text-lg font-bold text-[#101828] border-b border-slate-100 pb-2">
          1. WCAG 2.1 AA Color & Contrast Discipline
        </h3>
        <p>
          EditorynIQ™ adheres strictly to WCAG 2.1 AA accessibility guidelines, ensuring text contrast ratios exceed 4.5:1, visible focus indicators are maintained for keyboard users, and screen readers can parse semantic HTML elements cleanly.
        </p>

        <h3 className="text-lg font-bold text-[#101828] border-b border-slate-100 pb-2">
          2. Keyboard Navigation & Responsive Layouts
        </h3>
        <p>
          All interactive controls, forms, modals, language switchers, and project cards are operable via keyboard navigation and scale seamlessly across screen sizes from mobile devices to desktop displays.
        </p>
      </div>
    </div>
  );
};
