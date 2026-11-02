import React, { useState, useEffect } from 'react';
import { useI18n } from '../../i18n';
import { PageHero } from '../../components/ui/PageHero';
import { PremiumButton } from '../../components/ui/PremiumButton';
import { InfinityCard } from '../../components/ui/InfinityCard';
import { OperationsSummary, EngineIdentifier } from '../../domain/operations/operationsTypes';
import { aggregateProductionReadiness } from '../../domain/operations/readinessAggregator';
import { operationsExportService } from '../../services/operationsExportService';

export interface OperationsHubPageProps {
  projectId: string;
  onNavigate: (path: string) => void;
}

export const OperationsHubPage: React.FC<OperationsHubPageProps> = ({ projectId, onNavigate }) => {
  const { t } = useI18n();
  const [summary, setSummary] = useState<OperationsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const data = await aggregateProductionReadiness(projectId);
    setSummary(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  const handleExportBackup = async () => {
    setExporting(true);
    try {
      await operationsExportService.exportFullProjectBackup(projectId);
    } catch (err) {
      console.error('Backup export error:', err);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500 text-sm">
        Consolidating Production Operations telemetry...
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="max-w-3xl mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="text-2xl font-bold text-[#101828]">Operations Record Not Found</h2>
        <p className="text-xs text-slate-500">Could not read telemetry for project ID "{projectId}".</p>
        <PremiumButton variant="outline" size="md" onClick={() => onNavigate(`/books/${projectId}`)}>
          Return to Workspace
        </PremiumButton>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'READY':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300';
      case 'IN_PROGRESS':
        return 'bg-blue-50 text-blue-700 border-blue-300';
      case 'NEEDS_ATTENTION':
        return 'bg-amber-50 text-amber-700 border-amber-300';
      case 'BLOCKED_DEPENDENCY':
        return 'bg-red-50 text-red-700 border-red-300';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-300';
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <PageHero
        title="Production Operations Hub™"
        subtitle={`Consolidated authority across E1–E6 for "${summary.bookTitle}" · ADN V100 Max Pro`}
        badge={`OVERALL: ${summary.overallStatus.replace('_', ' ')} (${summary.overallScore}/100)`}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Navigation bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <button
            onClick={() => onNavigate(`/books/${projectId}`)}
            className="text-xs font-semibold text-[#345CFF] hover:underline flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Book Workspace
          </button>

          <div className="flex items-center gap-3">
            <PremiumButton variant="outline" size="sm" onClick={loadData}>
              Refresh Telemetry
            </PremiumButton>
            <PremiumButton
              variant="primary"
              size="sm"
              disabled={exporting}
              onClick={handleExportBackup}
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              }
            >
              {exporting ? 'Exporting...' : 'Export Full Backup (JSON)'}
            </PremiumButton>
          </div>
        </div>

        {/* Executive Scorecard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-1">
            <span className="text-xs text-slate-500 font-medium block">Overall Readiness Score</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-[#081629]">{summary.overallScore}</span>
              <span className="text-xs text-slate-400">/ 100 pts</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
              <div
                className="bg-[#345CFF] h-2 rounded-full transition-all duration-500"
                style={{ width: `${summary.overallScore}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-1">
            <span className="text-xs text-slate-500 font-medium block">Engine Stages Ready</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-emerald-600">{summary.readyCount}</span>
              <span className="text-xs text-slate-400">/ 6 Engines</span>
            </div>
            <span className="text-xs text-slate-500 block pt-1">
              {summary.readyCount === 6 ? 'All pipelines cleared' : `${6 - summary.readyCount} pending or in progress`}
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-1">
            <span className="text-xs text-slate-500 font-medium block">Active Blockers</span>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-extrabold font-mono ${summary.blockersCount > 0 ? 'text-amber-600' : 'text-slate-700'}`}>
                {summary.blockersCount}
              </span>
              <span className="text-xs text-slate-400">items</span>
            </div>
            <span className="text-xs text-slate-500 block pt-1">
              {summary.blockersCount === 0 ? 'Zero operational blockers' : 'Requires author attention'}
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-1">
            <span className="text-xs text-slate-500 font-medium block">Verified Deliverables</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-[#16836D]">{summary.verifiedDeliverablesCount}</span>
              <span className="text-xs text-slate-400">artifacts ready</span>
            </div>
            <span className="text-xs text-slate-500 block pt-1">Direct local download verified</span>
          </div>
        </div>

        {/* 3 Dedicated Centers Navigation */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#081629]">
            Dedicated Operations Centers™
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InfinityCard
              title="Production Readiness Center™"
              subtitle="Center 1 · /operations/readiness"
              description="Live audit of E1–E6 engines. Verify approved blueprint snapshots, manuscript word counts, cover hashes, page pagination & ONIX packages."
              accentColor="royal"
              onClick={() => onNavigate(`/books/${projectId}/operations/readiness`)}
            />

            <InfinityCard
              title="Local Delivery Center™"
              subtitle="Center 2 · /operations/delivery"
              description="Download genuine author deliverables: Editorial Master PDF, EPUB 3.3, DOCX, Quality Passport, and Distribution ZIP bundles with integrity verification."
              accentColor="turquoise"
              onClick={() => onNavigate(`/books/${projectId}/operations/delivery`)}
            />

            <InfinityCard
              title="Recovery & Evidence Center™"
              subtitle="Center 3 · /operations/recovery"
              description="Cryptographic project backup export, structural schema validation, collision-checked restore, and non-destructive project cloning."
              accentColor="gold"
              onClick={() => onNavigate(`/books/${projectId}/operations/recovery`)}
            />
          </div>
        </div>

        {/* Multi-Engine Pipeline Summary Matrix */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-[#101828]">E1–E6 Editorial Pipeline Audit Matrix</h3>
              <p className="text-xs text-slate-500">Real-time status snapshot sourced from local IndexedDB registries.</p>
            </div>
            <button
              onClick={() => onNavigate(`/books/${projectId}/operations/readiness`)}
              className="text-xs font-semibold text-[#345CFF] hover:underline"
            >
              View Detailed Audit & Blockers →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(Object.keys(summary.engines) as EngineIdentifier[]).map((engKey) => {
              const eng = summary.engines[engKey];
              return (
                <div key={engKey} className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{engKey} Engine</span>
                    <span className={`px-2 py-0.5 text-2xs font-bold uppercase rounded-md border ${getStatusColor(eng.status)}`}>
                      {eng.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-[#101828]">{eng.engineName}</h4>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-1">{eng.statusReason}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-2xs border-t border-slate-200/60 pt-2">
                    {eng.metrics.slice(0, 2).map((m, i) => (
                      <div key={i}>
                        <span className="text-slate-400 block">{m.label}</span>
                        <span className="font-mono font-bold text-slate-700">{m.value} {m.unit || ''}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-1">
                    <button
                      onClick={() => onNavigate(eng.actionRoute)}
                      className="w-full text-center py-1.5 px-3 rounded-lg text-xs font-semibold text-[#345CFF] bg-blue-50/70 hover:bg-blue-100/70 transition-colors"
                    >
                      {eng.actionLabel} →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Operational Notice */}
        <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
          <svg className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="space-y-1">
            <span className="font-bold text-slate-800">Operational Integrity Guarantee:</span>
            <p>
              EditorynIQ™ enforces zero simulated telemetry. All page budgets, chapter word counts, cryptographic hashes,
              and delivery packages represent actual local device computations. No unauthorized external connections or fake entitlements are permitted.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
