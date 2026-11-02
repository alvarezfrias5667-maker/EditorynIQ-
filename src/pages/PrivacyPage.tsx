import React from 'react';
import { useI18n } from '../i18n';
import { PageHero } from '../components/ui/PageHero';

export const PrivacyPage: React.FC = () => {
  const { t } = useI18n();

  return (
    <div className="space-y-12 pb-20">
      <PageHero
        title={t.legal.privacyTitle}
        subtitle="Foundational Privacy & Data Governance Architecture"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 bg-white p-8 sm:p-12 rounded-2xl border border-slate-200/90 shadow-2xs space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs italic">
          {t.legal.disclaimer}
        </div>

        <h3 className="text-lg font-bold text-[#101828] border-b border-slate-100 pb-2">
          1. Local-First Data Processing Architecture
        </h3>
        <p>
          EditorynIQ™ Foundation operates under a strict Local-First privacy protocol. In this release, all manuscript inputs, book working titles, outlines, target page budgets, and author notes are saved exclusively in your browser’s IndexedDB storage.
        </p>

        <h3 className="text-lg font-bold text-[#101828] border-b border-slate-100 pb-2">
          2. No Unsolicited Remote Telemetry
        </h3>
        <p>
          We do not transmit your local book project drafts, source text files, or author notes to any third-party analytics services or unauthorized remote endpoints. Your data remains strictly on your device until you manually initiate an export.
        </p>

        <h3 className="text-lg font-bold text-[#101828] border-b border-slate-100 pb-2">
          3. Author Intellectual Property Rights
        </h3>
        <p>
          All intellectual property rights in manuscripts, uploaded source texts, generated blueprints, and exported book packages belong 100% exclusively to the author or publishing entity.
        </p>

        <h3 className="text-lg font-bold text-[#101828] border-b border-slate-100 pb-2">
          4. Data Deletion & Storage Control
        </h3>
        <p>
          You retain full control over your local data. You may delete project drafts at any time directly from the Studio Workspace, which immediately purges the corresponding IndexedDB record from your browser.
        </p>
      </div>
    </div>
  );
};
