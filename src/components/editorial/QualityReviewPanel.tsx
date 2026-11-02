import React, { useState } from 'react';
import { useI18n } from '../../i18n';
import { EditorialEdition, QualityAuditReport } from '../../domain/editorial/editorialTypes';
import { editorialValidationService } from '../../services/editorialValidationService';
import { PremiumButton } from '../ui/PremiumButton';

export interface QualityReviewPanelProps {
  edition: EditorialEdition;
  onRunAudit?: (report: QualityAuditReport) => void;
}

export const QualityReviewPanel: React.FC<QualityReviewPanelProps> = ({ edition, onRunAudit }) => {
  const { t } = useI18n();

  const [report, setReport] = useState<QualityAuditReport | null>(() =>
    editorialValidationService.runQualityAudit(edition)
  );

  const handleExecuteAudit = () => {
    const newReport = editorialValidationService.runQualityAudit(edition);
    setReport(newReport);
    if (onRunAudit) onRunAudit(newReport);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-[#081629]">{t.editorial.qualityTitle}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{t.editorial.qualitySubtitle}</p>
          </div>

          <PremiumButton variant="primary" size="sm" onClick={handleExecuteAudit}>
            {t.editorial.runAuditBtn}
          </PremiumButton>
        </div>

        {/* Audit Metrics Grid */}
        {report && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-rose-50/60 rounded-xl border border-rose-200/80">
              <span className="text-2xs font-bold uppercase text-rose-800">{t.editorial.criticalFindings}</span>
              <div className="text-2xl font-bold text-rose-900 mt-1 font-mono">{report.criticalCount}</div>
            </div>

            <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/80">
              <span className="text-2xs font-bold uppercase text-amber-800">{t.editorial.warningFindings}</span>
              <div className="text-2xl font-bold text-amber-900 mt-1 font-mono">{report.warningCount}</div>
            </div>

            <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/80">
              <span className="text-2xs font-bold uppercase text-emerald-800">Overall Audit Status</span>
              <div className="text-sm font-bold text-emerald-900 mt-1 font-mono">
                {report.passed ? '✓ PASSED (0 Criticals)' : '⚠️ ATTENTION REQUIRED'}
              </div>
            </div>
          </div>
        )}

        {/* Findings List */}
        {report && report.findings.length > 0 ? (
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-[#081629] uppercase tracking-wider">Detailed Inspection Findings</h4>
            {report.findings.map((f) => (
              <div
                key={f.id}
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                  f.severity === 'CRITICAL'
                    ? 'bg-rose-50/50 border-rose-200 text-rose-900'
                    : f.severity === 'WARNING'
                    ? 'bg-amber-50/50 border-amber-200 text-amber-900'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <div>
                  <div className="font-bold flex items-center gap-2">
                    <span>{f.title}</span>
                    {f.location && <span className="text-3xs font-mono px-2 py-0.5 bg-white/80 rounded border">{f.location}</span>}
                  </div>
                  <p className="text-2xs opacity-90 mt-0.5">{f.description}</p>
                </div>

                <span className="text-2xs font-mono font-bold uppercase px-2 py-1 rounded bg-white/90 border shrink-0">
                  {f.category}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
            ✓ No quality issues detected in this derived master edition.
          </div>
        )}
      </div>
    </div>
  );
};
