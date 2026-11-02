import React, { useState, useEffect } from 'react';
import { useI18n } from '../../i18n';
import { PageHero } from '../../components/ui/PageHero';
import { PremiumButton } from '../../components/ui/PremiumButton';
import { DeliverableItem, DeliveryArtifactStatus } from '../../domain/operations/operationsTypes';
import { inspectDeliverables } from '../../domain/operations/deliveryAuthority';
import { operationsExportService } from '../../services/operationsExportService';
import { localEditorialRepository } from '../../services/localEditorialRepository';
import { editorialExportService } from '../../services/editorialExportService';

export interface LocalDeliveryPageProps {
  projectId: string;
  onNavigate: (path: string) => void;
}

export const LocalDeliveryPage: React.FC<LocalDeliveryPageProps> = ({ projectId, onNavigate }) => {
  const { t } = useI18n();
  const [deliverables, setDeliverables] = useState<DeliverableItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDownloadId, setActiveDownloadId] = useState<string | null>(null);
  const [compilingType, setCompilingType] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const loadData = async () => {
    setLoading(true);
    const items = await inspectDeliverables(projectId);
    setDeliverables(items);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleDownload = async (item: DeliverableItem) => {
    setActiveDownloadId(item.id);
    try {
      if (item.type === 'PDF_MASTER') {
        const eds = await localEditorialRepository.getEditionsByBookId(projectId);
        if (eds[0]) {
          const res = await editorialExportService.exportPDF(eds[0]);
          showNotification(`PDF Master downloaded successfully (${(res.fileSizeBytes / 1024).toFixed(1)} KB).`, 'success');
        }
      } else if (item.type === 'EPUB_MASTER') {
        const eds = await localEditorialRepository.getEditionsByBookId(projectId);
        if (eds[0]) {
          await editorialExportService.exportEPUB(eds[0]);
          showNotification(`EPUB 3.3 package downloaded successfully.`, 'success');
        }
      } else if (item.type === 'DOCX_MANUSCRIPT') {
        const eds = await localEditorialRepository.getEditionsByBookId(projectId);
        if (eds[0]) {
          await editorialExportService.exportDOCX(eds[0]);
          showNotification(`DOCX manuscript downloaded successfully.`, 'success');
        }
      } else {
        await operationsExportService.downloadDeliverable(item);
        showNotification(`${item.title} exported successfully.`, 'success');
      }
    } catch (err: any) {
      showNotification(`Download failed: ${err?.message || 'Export error'}`, 'error');
    } finally {
      setActiveDownloadId(null);
    }
  };

  const handleCompileOnDemand = async (type: string) => {
    setCompilingType(type);
    try {
      const eds = await localEditorialRepository.getEditionsByBookId(projectId);
      if (!eds || eds.length === 0) {
        showNotification('No E4 Editorial Edition found. Open Editorial Production to assemble layout first.', 'error');
        return;
      }

      if (type === 'PDF') {
        await editorialExportService.exportPDF(eds[0]);
        showNotification('Editorial Master PDF compiled and certified successfully.', 'success');
      } else if (type === 'EPUB') {
        await editorialExportService.exportEPUB(eds[0]);
        showNotification('EPUB 3.3 reflowable book compiled successfully.', 'success');
      } else if (type === 'DOCX') {
        await editorialExportService.exportDOCX(eds[0]);
        showNotification('Word DOCX manuscript generated successfully.', 'success');
      }

      await loadData();
    } catch (err: any) {
      showNotification(`Compilation failed: ${err?.message || 'Build fault'}`, 'error');
    } finally {
      setCompilingType(null);
    }
  };

  const getStatusBadge = (status: DeliveryArtifactStatus) => {
    switch (status) {
      case 'VERIFIED_READY':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          label: 'VERIFIED READY',
        };
      case 'ARTIFACT_NOT_READY':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-300',
          label: 'ARTIFACT NOT READY',
        };
      case 'INTEGRITY_FAILED':
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-300',
          label: 'INTEGRITY FAILED',
        };
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500 text-sm">
        Verifying cryptographic integrity of local deliverables...
      </div>
    );
  }

  const readyCount = deliverables.filter((d) => d.status === 'VERIFIED_READY').length;

  return (
    <div className="space-y-10 pb-20">
      <PageHero
        title="Local Delivery Center™"
        subtitle="Cryptographically Verified Local Workspace Deliverables · Zero Simulated Files"
        badge={`${readyCount} / ${deliverables.length} DELIVERABLES READY`}
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

          <PremiumButton variant="outline" size="sm" onClick={loadData}>
            Re-Verify Artifacts
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

        {/* Mandatory Legal Disclosure Notice */}
        <div className="p-4 rounded-2xl bg-[#081629] text-white border border-slate-800 space-y-2 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E9BC72]" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#E9BC72]">
              Author Workspace Operations Disclosure
            </h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            These downloads are local editorial workspace deliverables intended exclusively for the author/publisher.
            They are strictly <strong className="text-white">NOT commercial marketplace purchase entitlements</strong> or buyer licenses.
            No monetary checkout or customer rights transfer is executed during these workspace operations.
          </p>
        </div>

        {/* Deliverables List */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#081629]">
            Publication Deliverables Inventory ({deliverables.length})
          </h3>

          <div className="grid grid-cols-1 gap-4">
            {deliverables.map((item) => {
              const badge = getStatusBadge(item.status);
              const isReady = item.status === 'VERIFIED_READY';
              const isWorking = activeDownloadId === item.id;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4 transition-all hover:border-slate-300"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-2xs font-bold bg-slate-100 text-slate-700 font-mono">
                          {item.formatBadge}
                        </span>
                        <span className="text-2xs font-mono text-slate-400">[{item.sourceEngine}]</span>
                        <h4 className="text-base font-bold text-[#101828]">{item.title}</h4>
                      </div>
                      <p className="text-xs font-mono text-slate-500">Target File: {item.fileName}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-2xs font-bold border ${badge.bg}`}>
                        {badge.label}
                      </span>

                      {isReady ? (
                        <PremiumButton
                          variant="primary"
                          size="sm"
                          disabled={isWorking}
                          onClick={() => handleDownload(item)}
                          icon={
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          }
                        >
                          {isWorking ? 'Exporting...' : 'Download Verified File'}
                        </PremiumButton>
                      ) : (
                        <div className="flex items-center gap-2">
                          {(item.type === 'PDF_MASTER' || item.type === 'EPUB_MASTER' || item.type === 'DOCX_MANUSCRIPT') && (
                            <PremiumButton
                              variant="outline"
                              size="sm"
                              disabled={compilingType !== null}
                              onClick={() => handleCompileOnDemand(item.type.replace('_MASTER', '').replace('_MANUSCRIPT', ''))}
                            >
                              {compilingType === item.type.replace('_MASTER', '').replace('_MANUSCRIPT', '') ? 'Compiling...' : 'Compile Now'}
                            </PremiumButton>
                          )}
                          {item.actionRoute && (
                            <button
                              onClick={() => onNavigate(item.actionRoute!)}
                              className="text-xs font-semibold text-[#345CFF] hover:underline"
                            >
                              {item.actionLabel || 'Configure'} →
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Metadata & Checksum Bar */}
                  <div className="border-t border-slate-100 pt-3 flex flex-wrap items-center justify-between gap-2 text-2xs">
                    <div className="flex items-center gap-4 text-slate-500">
                      <span>
                        Size: <strong className="font-mono text-slate-700">{item.fileSizeBytes > 0 ? `${(item.fileSizeBytes / 1024).toFixed(1)} KB` : '0 KB'}</strong>
                      </span>
                      <span>
                        Verified: <strong className="font-mono text-slate-700">{new Date(item.lastVerifiedAt).toLocaleTimeString()}</strong>
                      </span>
                    </div>

                    {item.sha256 ? (
                      <div className="flex items-center gap-1.5 font-mono text-slate-600 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                        <span className="text-slate-400 font-bold">SHA-256:</span>
                        <span className="truncate max-w-xs">{item.sha256}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">No checksum available</span>
                    )}
                  </div>

                  {/* Error & Prerequisite Explanation */}
                  {item.errorDetails && !isReady && (
                    <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                      <svg className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <strong className="block font-semibold">Prerequisite Pending:</strong>
                        <span>{item.errorDetails}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
