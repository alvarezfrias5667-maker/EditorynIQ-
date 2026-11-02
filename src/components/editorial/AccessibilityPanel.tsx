import React, { useState } from 'react';
import { useI18n } from '../../i18n';
import { EditorialEdition, AccessibilityAuditReport } from '../../domain/editorial/editorialTypes';
import { VisualAsset } from '../../domain/visual/visualTypes';
import { editorialValidationService } from '../../services/editorialValidationService';
import { PremiumButton } from '../ui/PremiumButton';

export interface AccessibilityPanelProps {
  edition: EditorialEdition;
  visualAssets?: VisualAsset[];
  onRunA11y?: (report: AccessibilityAuditReport) => void;
}

export const AccessibilityPanel: React.FC<AccessibilityPanelProps> = ({ edition, visualAssets = [], onRunA11y }) => {
  const { t } = useI18n();

  const [report, setReport] = useState<AccessibilityAuditReport | null>(() =>
    editorialValidationService.runAccessibilityAudit(edition, visualAssets)
  );

  const handleExecuteA11y = () => {
    const newReport = editorialValidationService.runAccessibilityAudit(edition, visualAssets);
    setReport(newReport);
    if (onRunA11y) onRunA11y(newReport);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-[#081629]">{t.editorial.accessibilityTitle}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{t.editorial.accessibilitySubtitle}</p>
          </div>

          <PremiumButton variant="primary" size="sm" onClick={handleExecuteA11y}>
            {t.editorial.runA11yBtn}
          </PremiumButton>
        </div>

        {/* Score Card */}
        {report && (
          <div className="p-6 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
            <div>
              <span className="text-2xs font-mono uppercase text-slate-400">{report.wcagLevel} Compliance Score</span>
              <div className="text-3xl font-bold text-[#16C8BA] font-mono mt-1">{report.score} / 100</div>
              <p className="text-2xs text-slate-300 mt-1">
                Evaluated across semantic XML tags, heading order, alt text, and EPUB 3 navigation.
              </p>
            </div>

            <div className="text-right">
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${
                  report.passed ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {report.passed ? '✓ COMPLIANT' : '⚠️ REVIEWS NEEDED'}
              </span>
            </div>
          </div>
        )}

        {/* Checks List */}
        {report && (
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-[#081629] uppercase tracking-wider">WCAG & EPUB Accessibility Checks</h4>
            {report.checks.map((chk) => (
              <div key={chk.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="font-bold text-[#081629] flex items-center gap-2">
                    <span>{chk.title}</span>
                    <span className="text-3xs font-mono text-slate-400">({chk.wcagCriteria})</span>
                  </div>
                  <p className="text-2xs text-slate-600">{chk.description}</p>
                </div>

                <span
                  className={`text-2xs font-mono font-bold px-2 py-0.5 rounded shrink-0 ${
                    chk.status === 'PASS'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  {chk.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
