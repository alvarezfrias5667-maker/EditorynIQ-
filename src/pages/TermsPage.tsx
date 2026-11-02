import React from 'react';
import { useI18n } from '../i18n';
import { PageHero } from '../components/ui/PageHero';

export const TermsPage: React.FC = () => {
  const { t } = useI18n();

  return (
    <div className="space-y-12 pb-20">
      <PageHero
        title={t.legal.termsTitle}
        subtitle="Master Platform Terms of Service & Editorial Governance"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 bg-white p-8 sm:p-12 rounded-2xl border border-slate-200/90 shadow-2xs space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs italic">
          {t.legal.disclaimer}
        </div>

        <h3 className="text-lg font-bold text-[#101828] border-b border-slate-100 pb-2">
          1. Acceptance of Master Terms
        </h3>
        <p>
          By accessing or utilizing EditorynIQ™, you agree to abide by these Master Platform Terms. EditorynIQ™ provides enterprise software tools for authors and publishers to structure, format, design, and prepare books up to 600 pages.
        </p>

        <h3 className="text-lg font-bold text-[#101828] border-b border-slate-100 pb-2">
          2. Platform Boundaries & Scope
        </h3>
        <p>
          This Foundation release provides local project intake, parameter validation, IndexedDB draft storage, and architectural blueprinting. Future engine capabilities (E1 through E6) will be introduced in subsequent modules.
        </p>

        <h3 className="text-lg font-bold text-[#101828] border-b border-slate-100 pb-2">
          3. Copyright & Content Responsibility
        </h3>
        <p>
          Users warrant that all source text, manuscripts, and author notes uploaded or pasted into the platform are original works or properly licensed. EditorynIQ™ claims zero ownership over user manuscripts.
        </p>
      </div>
    </div>
  );
};
