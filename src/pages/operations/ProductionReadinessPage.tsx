import React, { useState, useEffect } from 'react';
import { useI18n } from '../../i18n';
import { PageHero } from '../../components/ui/PageHero';
import { PremiumButton } from '../../components/ui/PremiumButton';
import { OperationsSummary, EngineIdentifier, EngineAuditRecord, OperationalReadinessStatus } from '../../domain/operations/operationsTypes';
import { aggregateProductionReadiness } from '../../domain/operations/readinessAggregator';

export interface ProductionReadinessPageProps {
  projectId: string;
  onNavigate: (path: string) => void;
}

export const ProductionReadinessPage: React.FC<ProductionReadinessPageProps> = ({ projectId, onNavigate }) => {
  const { t } = useI18n();
  const [summary, setSummary] = useState<OperationsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'READY' | 'ATTENTION_BLOCKED'>('ALL');

  const loadData = async () => {
    setLoading(true);
    const data = await aggregateProductionReadiness(projectId);
    setSummary(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const getStatusBadge = (status: OperationalReadinessStatus) => {
    switch (status) {
      case 'READY':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          dot: 'bg-emerald-500',
          label: 'READY',
        };
      case 'IN_PROGRESS':
        return {
          bg: 'bg-blue-50 text-blue-800 border-blue-300',
          dot: 'bg-[#345CFF]',
          label: 'IN PROGRESS',
        };
      case 'NEEDS_ATTENTION':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-300',
          dot: 'bg-amber-500',
          label: 'NEEDS ATTENTION',
        };
      case 'BLOCKED_DEPENDENCY':
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-300',
          dot: 'bg-rose-500',
          label: 'BLOCKED DEPENDENCY',
        };
      case 'NOT_TESTED':
        return {
          bg: 'bg-purple-50 text-purple-800 border-purple-300',
          dot: 'bg-purple-500',
          label: 'NOT TESTED',
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-300',
          dot: 'bg-slate-400',
          label: 'NOT STARTED',
        };
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500 text-sm">
        Running full E1–E6 Production Readiness verification audit...
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="max-w-3xl mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="text-2xl font-bold text-[#101828]">Audit Failed</h2>
        <p className="text-xs text-slate-500">Could not retrieve project with ID "{projectId}".</p>
        <PremiumButton variant="outline" size="md" onClick={() => onNavigate(`/books/${projectId}/operations`)}>
          Return to Operations Hub
        </PremiumButton>
      </div>
    );
  }

  const engineList = (Object.keys(summary.engines) as EngineIdentifier[]).map((key) => summary.engines[key]);

  const filteredEngines = engineList.filter((eng) => {
    if (filter === 'READY') return eng.status === 'READY';
    if (filter === 'ATTENTION_BLOCKED') {
      return eng.status === 'NEEDS_ATTENTION' || eng.status === 'BLOCKED_DEPENDENCY' || eng.status === 'NOT_STARTED';
    }
    return true;
  });

  return (
    <div className="space-y-10 pb-20">
      <PageHero
        title="Production Readiness Center™"
        subtitle={`Exhaustive Multi-Engine Verification & Blocker Audit · "${summary.bookTitle}"`}
        badge={`OVERALL: ${summary.overallStatus.replace('_', ' ')} (${summary.overallScore}/100)`}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Navigation & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <button
            onClick={() => onNavigate(`/books/${projectId}/operations`)}
            className="text-xs font-semibold text-[#345CFF] hover:underline flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Operations Hub
          </button>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filter buttons */}
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 text-2xs font-semibold">
              <button
                onClick={() => setFilter('ALL')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  filter === 'ALL' ? 'bg-white shadow-2xs text-[#081629]' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                All Engines (6)
              </button>
              <button
                onClick={() => setFilter('READY')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  filter === 'READY' ? 'bg-white shadow-2xs text-emerald-700' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Ready ({summary.readyCount})
              </button>
              <button
                onClick={() => setFilter('ATTENTION_BLOCKED')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  filter === 'ATTENTION_BLOCKED' ? 'bg-white shadow-2xs text-rose-700' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Needs Action ({6 - summary.readyCount})
              </button>
            </div>

            <PremiumButton variant="outline" size="sm" onClick={loadData}>
              Re-Audit All
            </PremiumButton>
          </div>
        </div>

        {/* Engine Breakdown Cards */}
        <div className="space-y-6">
          {filteredEngines.map((eng: EngineAuditRecord) => {
            const badge = getStatusBadge(eng.status);

            return (
              <div
                key={eng.engineId}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all hover:border-slate-300"
              >
                {/* Header Bar */}
                <div className="p-6 border-b border-slate-100 flex flex-wrap items-start justify-between gap-4 bg-slate-50/40">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                        {eng.engineId}
                      </span>
                      <h3 className="text-lg font-bold text-[#101828]">{eng.engineName}</h3>
                    </div>
                    <p className="text-xs text-slate-500">{eng.subTitle}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge.bg}`}>
                      <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                      {badge.label}
                    </span>
                    <PremiumButton
                      variant={eng.status === 'READY' ? 'outline' : 'primary'}
                      size="sm"
                      onClick={() => onNavigate(eng.actionRoute)}
                    >
                      {eng.actionLabel}
                    </PremiumButton>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6 space-y-6">
                  {/* Status Reason */}
                  <div>
                    <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Audit Diagnostic Summary
                    </span>
                    <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
                      {eng.statusReason}
                    </p>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {eng.metrics.map((metric, i) => (
                      <div key={i} className="bg-slate-50/70 border border-slate-200/60 rounded-xl p-3.5">
                        <span className="text-2xs text-slate-400 block mb-1">{metric.label}</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-extrabold font-mono text-[#081629]">{metric.value}</span>
                          {metric.unit && <span className="text-2xs text-slate-500">{metric.unit}</span>}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Technical Evidence & SHA-256 */}
                  <div className="border-t border-slate-100 pt-4 space-y-2">
                    <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 block">
                      Cryptographic Evidence & References
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {eng.evidence.identifier && (
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/60">
                          <span className="text-slate-500">{eng.evidence.identifierLabel || 'Record ID'}:</span>
                          <span className="font-mono font-semibold text-slate-800">{eng.evidence.identifier}</span>
                        </div>
                      )}

                      {eng.evidence.timestamp && (
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/60">
                          <span className="text-slate-500">Recorded At:</span>
                          <span className="font-mono text-slate-700">{new Date(eng.evidence.timestamp).toLocaleString()}</span>
                        </div>
                      )}

                      {eng.evidence.sha256 ? (
                        <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-900 text-slate-200 font-mono text-2xs">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <span className="text-slate-400 font-bold shrink-0">SHA-256:</span>
                            <span className="truncate text-emerald-400">{eng.evidence.sha256}</span>
                          </div>
                          <button
                            onClick={() => copyToClipboard(eng.evidence.sha256!)}
                            className="text-xs text-blue-300 hover:text-white shrink-0 font-sans font-semibold underline"
                          >
                            {copiedHash === eng.evidence.sha256 ? 'Copied ✓' : 'Copy Hash'}
                          </button>
                        </div>
                      ) : (
                        <div className="md:col-span-2 p-2.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 text-2xs">
                          SHA-256 Checksum: Not yet generated (artifact requires compilation).
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Blockers & Remediation (if any) */}
                  {eng.blockers.length > 0 && (
                    <div className="border-t border-slate-100 pt-4 space-y-2">
                      <span className="text-2xs font-bold uppercase tracking-wider text-rose-500 block">
                        Action Required / Operational Blockers ({eng.blockers.length})
                      </span>
                      <div className="space-y-1.5">
                        {eng.blockers.map((blocker, bIdx) => (
                          <div
                            key={bIdx}
                            className="flex items-start gap-2 p-3 rounded-xl bg-rose-50/70 border border-rose-200 text-xs text-rose-800"
                          >
                            <svg className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <div className="flex-1">
                              <span className="font-semibold">{blocker}</span>
                            </div>
                            <button
                              onClick={() => onNavigate(eng.actionRoute)}
                              className="text-xs font-bold text-rose-700 underline shrink-0 hover:text-rose-900"
                            >
                              Resolve →
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
