import React from 'react';
import { useI18n } from '../../i18n';
import { E3ReadinessReport } from '../../domain/visual/visualTypes';
import { PremiumButton } from '../ui/PremiumButton';

export interface E3ReadinessPanelProps {
  report: E3ReadinessReport;
  onOpenStudio?: (subpath: string) => void;
}

export const E3ReadinessPanel: React.FC<E3ReadinessPanelProps> = ({ report, onOpenStudio }) => {
  const { t } = useI18n();

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-6 border border-slate-800 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                report.overallStatus === 'READY'
                  ? 'bg-[#16C8BA]'
                  : report.overallStatus === 'NEEDS_ATTENTION'
                  ? 'bg-[#E9BC72]'
                  : 'bg-rose-500'
              }`}
            />
            <h3 className="text-lg font-bold text-white">E3 Visual Production Readiness™</h3>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Overall Readiness Score: <span className="font-mono font-bold text-[#16C8BA]">{report.score}%</span> · Evaluated At: {new Date(report.evaluatedAt).toLocaleDateString()}
          </p>
        </div>

        <span className="text-xs font-mono font-bold bg-slate-800 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700">
          STATUS: {report.overallStatus}
        </span>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700/80 text-center space-y-1">
          <span className="text-2xs text-slate-400 uppercase tracking-wider block">Total Visual Assets</span>
          <span className="text-2xl font-extrabold font-mono text-white">{report.totalAssetsCount}</span>
        </div>

        <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700/80 text-center space-y-1">
          <span className="text-2xs text-slate-400 uppercase tracking-wider block">Unverified Rights</span>
          <span className={`text-2xl font-extrabold font-mono ${report.unverifiedRightsCount > 0 ? 'text-amber-400' : 'text-[#16C8BA]'}`}>
            {report.unverifiedRightsCount}
          </span>
        </div>

        <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700/80 text-center space-y-1">
          <span className="text-2xs text-slate-400 uppercase tracking-wider block">Readiness Checks</span>
          <span className="text-2xl font-extrabold font-mono text-[#345CFF]">
            {report.checks.filter((c) => c.status === 'PASS').length} / {report.checks.length}
          </span>
        </div>
      </div>

      {/* Checks Checklist */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Production Audit Criteria</h4>
        <div className="space-y-2">
          {report.checks.map((check) => (
            <div key={check.id} className="p-3 bg-slate-800/60 rounded-xl border border-slate-700 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="font-bold text-white block">{check.title}</span>
                <span className="text-2xs text-slate-300 block">{check.details}</span>
              </div>
              <span
                className={`text-2xs font-bold font-mono px-2.5 py-1 rounded ${
                  check.status === 'PASS'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : check.status === 'WARNING'
                    ? 'bg-amber-950 text-amber-400 border border-amber-800'
                    : 'bg-rose-950 text-rose-400 border border-rose-800'
                }`}
              >
                {check.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
