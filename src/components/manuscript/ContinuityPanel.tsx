import React from 'react';
import { EditorialReviewReport } from '../../domain/manuscript/manuscriptTypes';

export interface ContinuityPanelProps {
  report: EditorialReviewReport;
  onRunAudit: () => void;
}

export const ContinuityPanel: React.FC<ContinuityPanelProps> = ({ report, onRunAudit }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-2xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-bold text-[#101828]">Editorial Truth & Integrity™</h3>
          <p className="text-xs text-slate-500 mt-1">
            Automated chapter continuity, repetition detection, and target length auditing.
          </p>
        </div>

        <button
          type="button"
          onClick={onRunAudit}
          className="px-3 py-1.5 text-xs font-semibold text-[#345CFF] bg-[#345CFF]/10 border border-[#345CFF]/30 rounded-lg hover:bg-[#345CFF]/20"
        >
          🔄 Run Continuity Audit
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div>
          <span className="text-slate-400 block">Total Manuscript Words:</span>
          <span className="font-extrabold font-mono text-sm text-[#081629]">{report.totalWords.toLocaleString()}</span>
        </div>

        <div>
          <span className="text-slate-400 block">Estimated Standard Pages:</span>
          <span className="font-extrabold font-mono text-sm text-[#345CFF]">{report.totalEstimatedPages} pgs</span>
        </div>

        <div>
          <span className="text-slate-400 block">Audit Status:</span>
          <span className={`font-extrabold text-xs px-2 py-0.5 rounded inline-block mt-0.5 ${report.isPassed ? 'bg-[#16836D]/15 text-[#16836D]' : 'bg-[#D14343]/15 text-[#D14343]'}`}>
            {report.isPassed ? '✓ CONTINUITY PASSED' : '⚠ AUDIT ISSUES DETECTED'}
          </span>
        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#081629]">Audit Issue Log</h4>
        {report.issues.length === 0 ? (
          <p className="text-xs text-[#16836D] font-medium bg-[#16836D]/10 p-3 rounded-lg border border-[#16836D]/20">
            ✓ No structural repetitions or target deviations detected across manuscript chapters.
          </p>
        ) : (
          report.issues.map((iss) => (
            <div key={iss.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between text-xs gap-3">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${iss.severity === 'error' ? 'bg-[#D14343]' : 'bg-amber-500'}`} />
                <span className="font-medium text-slate-800">{iss.message}</span>
              </div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                {iss.type.replace('_', ' ')}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
