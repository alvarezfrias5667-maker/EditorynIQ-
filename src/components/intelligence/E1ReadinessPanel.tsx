import React, { useState } from 'react';
import { useI18n, getTranslationKey } from '../../i18n';
import { E1ReadinessReport, E1ProjectStatus, ApprovedBlueprintSnapshot } from '../../domain/intelligence/bookIntelligenceTypes';
import { PremiumButton } from '../ui/PremiumButton';

export interface E1ReadinessPanelProps {
  readinessReport: E1ReadinessReport;
  onApproveBlueprint: (approverName: string) => Promise<void>;
  isApproved: boolean;
  approvedAt?: string;
  approvedBy?: string;
  approvedSnapshot?: ApprovedBlueprintSnapshot;
}

export const E1ReadinessPanel: React.FC<E1ReadinessPanelProps> = ({
  readinessReport,
  onApproveBlueprint,
  isApproved,
  approvedAt,
  approvedBy,
  approvedSnapshot,
}) => {
  const { t } = useI18n();

  const [approverName, setApproverName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approverName.trim()) {
      setErrorMsg('Approver name or editorial role is required.');
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await onApproveBlueprint(approverName.trim());
    } catch (err: any) {
      setErrorMsg(err.message || 'Approval failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusBadgeMap: Record<E1ProjectStatus, { bg: string; text: string; labelKey: string }> = {
    DRAFT: { bg: 'bg-slate-100 border-slate-200', text: 'text-slate-700', labelKey: 'status.draft' },
    RESEARCH_IN_PROGRESS: { bg: 'bg-[#345CFF]/15 border-[#345CFF]/30', text: 'text-[#345CFF]', labelKey: 'status.research' },
    BLUEPRINT_IN_PROGRESS: { bg: 'bg-[#345CFF]/15 border-[#345CFF]/30', text: 'text-[#345CFF]', labelKey: 'status.blueprint' },
    READY_FOR_REVIEW: { bg: 'bg-[#E9BC72]/20 border-[#E9BC72]/40', text: 'text-[#9E7326]', labelKey: 'status.review' },
    APPROVED: { bg: 'bg-[#16836D]/15 border-[#16836D]/30', text: 'text-[#16836D]', labelKey: 'status.approved' },
    BLOCKED: { bg: 'bg-[#D14343]/15 border-[#D14343]/30', text: 'text-[#D14343]', labelKey: 'status.blocked' },
  };

  const badge = statusBadgeMap[readinessReport.status] || statusBadgeMap.DRAFT;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-2xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-bold text-[#101828]">E1 Readiness & Blueprint Approval™</h3>
          <p className="text-xs text-slate-500 mt-1">
            Validate all structural requirements prior to authorizing the Book Blueprint™.
          </p>
        </div>

        <span className={`text-xs font-bold px-3 py-1 rounded border ${badge.bg} ${badge.text}`}>
          STATUS: {getTranslationKey(t, badge.labelKey)}
        </span>
      </div>

      {/* Approval Success & Immutable Snapshot Banner */}
      {isApproved && (
        <div className="p-5 rounded-xl bg-[#16836D]/10 border border-[#16836D]/30 space-y-3 text-xs sm:text-sm text-[#16836D]">
          <div className="flex items-center justify-between font-bold">
            <span>✓ E1 BOOK BLUEPRINT APPROVED & IMMUTABLE SNAPSHOT RECORDED</span>
            {approvedSnapshot && (
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#16836D]/20">
                Snapshot v{approvedSnapshot.version}
              </span>
            )}
          </div>

          <p className="text-xs text-slate-700 leading-relaxed">
            Authorized by <span className="font-bold">{approvedBy || 'Author'}</span> on {approvedAt ? new Date(approvedAt).toLocaleString() : ''}. Project parameters and snapshot are locked and delivered to E2 Manuscript Factory™.
          </p>

          {approvedSnapshot && (
            <div className="pt-2 border-t border-[#16836D]/20 text-[11px] text-slate-600 grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono">
              <div>• Chapters Snapshot: {approvedSnapshot.chapters.length} chapters</div>
              <div>• Budget Target: {approvedSnapshot.pageBudget.targetPages} pgs</div>
              <div>• Allocated: {approvedSnapshot.pageBudget.allocatedPages} pgs</div>
            </div>
          )}
        </div>
      )}

      {/* Readiness Check List */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#081629]">
          Readiness Checks Checklist
        </h4>

        <div className="space-y-2">
          {readinessReport.checks.map((check) => (
            <div
              key={check.id}
              className={`p-3 rounded-lg border flex items-center justify-between gap-3 text-xs ${
                check.passed
                  ? 'bg-slate-50 border-slate-200 text-slate-800'
                  : check.isBlocking
                  ? 'bg-red-50/50 border-red-200 text-red-900'
                  : 'bg-amber-50/50 border-amber-200 text-amber-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${check.passed ? 'bg-[#16836D] text-white' : 'bg-[#D14343] text-white'}`}>
                  {check.passed ? '✓' : '!'}
                </span>
                <div>
                  <span className="font-bold block">{getTranslationKey(t, check.key)}</span>
                  <p className="text-[11px] opacity-80">{check.details}</p>
                </div>
              </div>

              {check.isBlocking && !check.passed && (
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-red-100 text-red-800">
                  BLOCKING
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Approval Form (if not approved yet) */}
      {!isApproved && (
        <form onSubmit={handleApprove} className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 space-y-4">
          <h4 className="text-sm font-bold text-white">Explicit Editorial Approval Confirmation</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Approving the E1 Blueprint validates title, budget, chapter layout, and research evidence.
          </p>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-[#D14343]/20 text-[#D14343] border border-[#D14343]/40 text-xs font-semibold">
              ⚠ {errorMsg}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-end gap-3">
            <div className="flex-1 space-y-1 w-full">
              <label className="text-xs font-bold text-slate-300 block">Approver Name / Role *</label>
              <input
                type="text"
                placeholder="e.g. Jane Doe (Lead Editor / Author)"
                value={approverName}
                onChange={(e) => setApproverName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded border border-slate-700 bg-slate-800 text-white focus:ring-2 focus:ring-[#345CFF]"
              />
            </div>

            <PremiumButton
              type="submit"
              variant="gold"
              size="md"
              disabled={!readinessReport.isReadyForApproval || isSubmitting}
            >
              {isSubmitting ? 'Approving...' : 'Approve Book Blueprint™'}
            </PremiumButton>
          </div>

          {!readinessReport.isReadyForApproval && (
            <p className="text-[11px] text-[#E9BC72] italic">
              * Resolve all blocking checks above to enable the Approve button.
            </p>
          )}
        </form>
      )}
    </div>
  );
};
