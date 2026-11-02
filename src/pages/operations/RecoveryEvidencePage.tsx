import React, { useState, useEffect, useRef } from 'react';
import { useI18n } from '../../i18n';
import { PageHero } from '../../components/ui/PageHero';
import { PremiumButton } from '../../components/ui/PremiumButton';
import { ProjectBackupBundle, RestoreCollisionReport, RestoreExecutionResult } from '../../domain/operations/operationsTypes';
import { generateProjectBackupBundle, inspectBackupForRestore, executeRestore } from '../../domain/operations/recoveryEngine';
import { operationsExportService } from '../../services/operationsExportService';

export interface RecoveryEvidencePageProps {
  projectId: string;
  onNavigate: (path: string) => void;
}

export const RecoveryEvidencePage: React.FC<RecoveryEvidencePageProps> = ({ projectId, onNavigate }) => {
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentBundle, setCurrentBundle] = useState<ProjectBackupBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Restore states
  const [uploadedBundle, setUploadedBundle] = useState<ProjectBackupBundle | null>(null);
  const [collisionReport, setCollisionReport] = useState<RestoreCollisionReport | null>(null);
  const [inspecting, setInspecting] = useState(false);
  const [confirmOverwrite, setConfirmOverwrite] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [restoreResult, setRestoreResult] = useState<RestoreExecutionResult | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const loadCurrentState = async () => {
    setLoading(true);
    try {
      const bundle = await generateProjectBackupBundle(projectId);
      setCurrentBundle(bundle);
    } catch (err: any) {
      console.error('Failed to generate current bundle:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCurrentState();
  }, [projectId]);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleExportBackup = async () => {
    setExporting(true);
    try {
      await operationsExportService.exportFullProjectBackup(projectId);
      showNotification('Project Backup Bundle JSON exported successfully.', 'success');
    } catch (err: any) {
      showNotification(`Export failed: ${err?.message || 'Error writing file'}`, 'error');
    } finally {
      setExporting(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setInspecting(true);
    setRestoreResult(null);
    setCollisionReport(null);
    setConfirmOverwrite(false);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const report = await inspectBackupForRestore(text);
        setCollisionReport(report);

        if (report.compatible) {
          const parsed = JSON.parse(text);
          setUploadedBundle(parsed);
        }
      } catch (err: any) {
        showNotification(`Inspection failed: ${err?.message || 'Invalid file'}`, 'error');
      } finally {
        setInspecting(false);
      }
    };

    reader.onerror = () => {
      showNotification('Failed to read selected file.', 'error');
      setInspecting(false);
    };

    reader.readAsText(file);
  };

  const handlePerformRestore = async (mode: 'OVERWRITE' | 'CLONE_AS_NEW') => {
    if (!uploadedBundle) return;
    setRestoring(true);

    try {
      const res = await executeRestore(
        uploadedBundle,
        mode,
        mode === 'CLONE_AS_NEW' ? collisionReport?.newClonedBookId : undefined
      );
      setRestoreResult(res);
      showNotification(res.message, 'success');
      if (mode === 'CLONE_AS_NEW' && res.restoredBookId) {
        setTimeout(() => {
          onNavigate(`/books/${res.restoredBookId}`);
        }, 2000);
      } else {
        await loadCurrentState();
      }
    } catch (err: any) {
      showNotification(`Restore failed: ${err?.message || 'Execution error'}`, 'error');
    } finally {
      setRestoring(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500 text-sm">
        Compiling cryptographic recovery evidence...
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      <PageHero
        title="Recovery & Evidence Center™"
        subtitle={`Cryptographic Project Manifest, Backup Archival & Non-Destructive Restore · ADN V100`}
        badge={currentBundle?.manifest.isComplete ? 'BACKUP MANIFEST: COMPLETE' : 'BACKUP MANIFEST: INCOMPLETE'}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Navigation bar */}
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

          <PremiumButton variant="outline" size="sm" onClick={loadCurrentState}>
            Refresh State
          </PremiumButton>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div
            className={`p-4 rounded-xl border text-xs font-semibold flex items-center justify-between ${
              notification.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-rose-50 border-rose-300 text-rose-800'
            }`}
          >
            <span>{notification.message}</span>
            <button onClick={() => setNotification(null)} className="text-2xs underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Section 1: Full Project Backup Export */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-2xs">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#101828]">Full Project Backup & Evidence Manifest</h3>
              <p className="text-xs text-slate-500">
                Exports all metadata, E1 blueprint snapshot, E2 chapters, E3 visuals, E4 editions, E5 packages and E6 listings into a single cryptographically signed bundle.
              </p>
            </div>

            <PremiumButton
              variant="primary"
              size="md"
              disabled={exporting}
              onClick={handleExportBackup}
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              }
            >
              {exporting ? 'Exporting...' : 'Export Project Backup Bundle (JSON)'}
            </PremiumButton>
          </div>

          {currentBundle && (
            <div className="space-y-5">
              {/* Manifest Headers */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block mb-1">Schema Version</span>
                  <span className="font-mono font-bold text-slate-800">{currentBundle.manifest.formatVersion}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block mb-1">Payload Size</span>
                  <span className="font-mono font-bold text-slate-800">
                    {(currentBundle.manifest.totalSizeEstimateBytes / 1024).toFixed(1)} KB
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block mb-1">Chapters</span>
                  <span className="font-mono font-bold text-slate-800">
                    {currentBundle.manifest.recordsSummary.chaptersCount} chapters
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block mb-1">Visual Assets</span>
                  <span className="font-mono font-bold text-slate-800">
                    {currentBundle.manifest.recordsSummary.visualAssetsCount} assets
                  </span>
                </div>
              </div>

              {/* Master Checksum */}
              <div className="p-3.5 bg-slate-900 text-slate-200 rounded-xl font-mono text-2xs space-y-1">
                <span className="text-slate-400 font-bold block">BUNDLE MASTER SHA-256:</span>
                <span className="text-emerald-400 break-all text-xs">{currentBundle.manifest.bundleSha256}</span>
              </div>

              {/* Section Hashes */}
              <div className="space-y-2">
                <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 block">
                  Individual Engine Cryptographic Section Hashes
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-2xs font-mono">
                  {Object.entries(currentBundle.manifest.sectionHashes).map(([sec, hash]) => (
                    <div key={sec} className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                      <span className="text-slate-500">{sec.replace('Sha256', '')}:</span>
                      <span className="text-slate-700 truncate max-w-xs">{hash}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Incomplete warning if any missing */}
              {!currentBundle.manifest.isComplete && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1">
                  <span className="font-bold block">Notice: Partial Project State</span>
                  <p>
                    The following stages have not been initialized or saved yet: {currentBundle.manifest.missingSections.join(', ')}.
                    The backup is valid, but will restore an in-progress workflow.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Section 2: Inspect & Restore with Collision Check */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-2xs">
          <div className="space-y-1 border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-[#101828]">Project Restore & Collision Inspector</h3>
            <p className="text-xs text-slate-500">
              Inspect an existing backup bundle before restoring. EditorynIQ™ prevents silent data destruction by verifying schemas, hashes, and existing ID collisions.
            </p>
          </div>

          {/* Upload trigger */}
          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              className="hidden"
              onChange={handleFileUpload}
            />

            <div className="border-2 border-dashed border-slate-200 hover:border-[#345CFF] rounded-2xl p-8 text-center space-y-3 transition-colors bg-slate-50/50">
              <svg className="w-10 h-10 text-slate-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>

              <div>
                <span className="text-sm font-bold text-[#101828] block">Select an EditorynIQ™ Backup Bundle (.json)</span>
                <span className="text-xs text-slate-500">File is inspected locally in browser memory without transmission to external servers.</span>
              </div>

              <div>
                <PremiumButton
                  variant="outline"
                  size="sm"
                  disabled={inspecting}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {inspecting ? 'Inspecting File...' : 'Choose Backup File'}
                </PremiumButton>
              </div>
            </div>
          </div>

          {/* Inspection & Collision Report */}
          {collisionReport && (
            <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50/70 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/70 pb-3">
                <div>
                  <h4 className="text-base font-bold text-[#101828]">
                    Pre-Restore Inspection: "{collisionReport.sourceBookTitle}"
                  </h4>
                  <span className="text-xs font-mono text-slate-500">
                    Source Book ID: {collisionReport.sourceBookId} · Exported: {new Date(collisionReport.exportedAt).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-2xs font-bold border ${
                      collisionReport.bundleIntegrityValid
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-rose-50 text-rose-800 border-rose-300'
                    }`}
                  >
                    {collisionReport.bundleIntegrityValid ? 'INTEGRITY: SHA-256 VERIFIED' : 'INTEGRITY: FAILED'}
                  </span>
                </div>
              </div>

              {/* Collision Warnings */}
              {collisionReport.conflictsSummary.length > 0 ? (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2 text-xs text-amber-900">
                  <span className="font-bold block flex items-center gap-2">
                    <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Collisions and Potential Overwrite Detected:
                  </span>
                  <ul className="list-disc pl-5 space-y-1">
                    {collisionReport.conflictsSummary.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                  No collisions detected. Book ID does not currently exist in your workspace.
                </div>
              )}

              {/* Restore Execution Modes */}
              <div className="space-y-4 pt-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Select Restore Strategy:
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Option A: Clone as New */}
                  <div className="p-5 rounded-xl bg-white border border-slate-200 space-y-3">
                    <div>
                      <span className="font-bold text-sm text-[#101828] block">Clone as New Independent Project</span>
                      <p className="text-xs text-slate-500 mt-1">
                        Safest option. Generates a new unique Book ID while preserving all manuscript chapters, visuals, and editions.
                      </p>
                    </div>

                    <PremiumButton
                      variant="secondary"
                      size="sm"
                      disabled={!collisionReport.compatible || restoring}
                      onClick={() => handlePerformRestore('CLONE_AS_NEW')}
                    >
                      {restoring ? 'Cloning...' : 'Restore as Cloned Project'}
                    </PremiumButton>
                  </div>

                  {/* Option B: Overwrite Existing */}
                  <div className="p-5 rounded-xl bg-white border border-slate-200 space-y-3">
                    <div>
                      <span className="font-bold text-sm text-[#101828] block">Overwrite Existing Records</span>
                      <p className="text-xs text-slate-500 mt-1">
                        Replaces the current records under ID "{collisionReport.sourceBookId}" with this bundle.
                      </p>
                    </div>

                    <label className="flex items-start gap-2 cursor-pointer text-xs text-slate-700">
                      <input
                        type="checkbox"
                        checked={confirmOverwrite}
                        onChange={(e) => setConfirmOverwrite(e.target.checked)}
                        className="mt-0.5 rounded text-[#345CFF]"
                      />
                      <span>I understand that this will overwrite existing records for Book ID {collisionReport.sourceBookId}.</span>
                    </label>

                    <PremiumButton
                      variant="outline"
                      size="sm"
                      disabled={!collisionReport.canOverwrite || !confirmOverwrite || restoring}
                      onClick={() => handlePerformRestore('OVERWRITE')}
                    >
                      {restoring ? 'Restoring...' : 'Confirm Overwrite'}
                    </PremiumButton>
                  </div>
                </div>
              </div>

              {/* Success Result Summary */}
              {restoreResult && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 space-y-2">
                  <span className="font-bold text-sm block">Restore Completed Successfully</span>
                  <p>{restoreResult.message}</p>
                  <div className="grid grid-cols-3 gap-2 font-mono text-2xs pt-1">
                    <span>Chapters: {restoreResult.recordsRestored.chapters}</span>
                    <span>Visuals: {restoreResult.recordsRestored.visuals}</span>
                    <span>Editions: {restoreResult.recordsRestored.editorialEditions}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Technical Architecture Disclosure */}
          <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
            <svg className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="space-y-1">
              <span className="font-bold text-slate-800">IndexedDB Architectural Notice:</span>
              <p>
                Browser IndexedDB storage engines do not support cross-database atomic transactions.
                To prevent corrupted partial state, EditorynIQ™ executes pre-flight payload validation and sequential atomic store writes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
