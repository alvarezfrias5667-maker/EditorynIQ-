import React, { useState } from 'react';
import { useI18n } from '../../i18n';
import { ResearchSource, SourceVerificationStatus } from '../../domain/intelligence/bookIntelligenceTypes';
import { createDefaultSource, validateResearchSource, detectDuplicateSources } from '../../domain/intelligence/researchEvidence';
import { PremiumButton } from '../ui/PremiumButton';

export interface ResearchEvidencePanelProps {
  sources: ResearchSource[];
  onUpdateSources: (sources: ResearchSource[]) => Promise<boolean>;
}

export const ResearchEvidencePanel: React.FC<ResearchEvidencePanelProps> = ({ sources, onUpdateSources }) => {
  const { t } = useI18n();

  const [editingSource, setEditingSource] = useState<ResearchSource | null>(null);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [duplicateWarning, setDuplicateWarning] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleAddNew = () => {
    setEditingSource(createDefaultSource());
    setFormErrors([]);
    setDuplicateWarning(false);
    setSaveError(null);
  };

  const handleSaveSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSource) return;

    const errors = validateResearchSource(editingSource);
    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    if (detectDuplicateSources(sources, editingSource)) {
      setDuplicateWarning(true);
    }

    const idx = sources.findIndex((s) => s.id === editingSource.id);
    let updated: ResearchSource[];
    if (idx >= 0) {
      updated = [...sources];
      updated[idx] = { ...editingSource, updatedAt: new Date().toISOString() };
    } else {
      updated = [...sources, { ...editingSource, updatedAt: new Date().toISOString() }];
    }

    const success = await onUpdateSources(updated);
    if (!success) {
      setSaveError('Storage error: Both IndexedDB and LocalStorage failed to write. Your changes are preserved in memory.');
    } else {
      setEditingSource(null);
      setSaveError(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this research source?')) {
      const updated = sources.filter((s) => s.id !== id);
      await onUpdateSources(updated);
    }
  };

  const statusBadge = (status: SourceVerificationStatus) => {
    const map = {
      UNVERIFIED: 'bg-slate-100 text-slate-700 border-slate-200',
      CONFIRMED: 'bg-[#16836D]/15 text-[#16836D] border-[#16836D]/30',
      DISPUTED: 'bg-[#D14343]/15 text-[#D14343] border-[#D14343]/30',
      OUTDATED: 'bg-[#E9BC72]/20 text-[#9E7326] border-[#E9BC72]/40',
    };
    return (
      <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${map[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-2xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-[#101828]">Research & Evidence™</h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
              Provider: Manual Entry
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Log verified factual sources, academic references, and documented verification methods.
          </p>
        </div>

        <PremiumButton variant="primary" size="sm" onClick={handleAddNew}>
          + Add Research Source
        </PremiumButton>
      </div>

      {/* Provider Status Note */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#E9BC72]" />
          <span>Status: RESEARCH_PROVIDER_NOT_CONFIGURED (Manual editorial log active)</span>
        </div>
        <span className="text-slate-400">ADN V100</span>
      </div>

      {/* Sources List */}
      {sources.length === 0 ? (
        <div className="text-center py-8 text-xs text-slate-500 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
          No research sources logged yet. Click "+ Add Research Source" to register references.
        </div>
      ) : (
        <div className="space-y-4">
          {sources.map((src) => (
            <div key={src.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-[#101828]">{src.title}</h4>
                  {statusBadge(src.status)}
                </div>
                <p className="text-xs text-slate-600">
                  Author: <span className="font-semibold">{src.author}</span>
                  {src.publishedDate && ` · Published: ${src.publishedDate}`}
                </p>
                {src.status === 'CONFIRMED' && (
                  <p className="text-[11px] text-[#16836D] font-medium pt-0.5">
                    ✓ Verified by {src.verifiedBy} on {src.verifiedAt} ({src.verificationMethod})
                  </p>
                )}
                {src.url && (
                  <a href={src.url} target="_blank" rel="noreferrer" className="text-xs text-[#345CFF] hover:underline block truncate max-w-md">
                    🔗 {src.url}
                  </a>
                )}
                {src.notes && <p className="text-xs text-slate-500 pt-1 italic">{src.notes}</p>}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setEditingSource(src);
                    setFormErrors([]);
                  }}
                  className="px-3 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-50"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(src.id)}
                  className="px-3 py-1 text-xs font-semibold text-[#D14343] bg-red-50 border border-red-200 rounded hover:bg-red-100"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Add Source Modal */}
      {editingSource && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <form onSubmit={handleSaveSource} className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <h4 className="text-base font-bold text-[#101828]">
              {sources.some((s) => s.id === editingSource.id) ? 'Edit Research Source' : 'Add Research Source'}
            </h4>

            {formErrors.length > 0 && (
              <div className="p-3 rounded-lg bg-[#D14343]/10 text-[#D14343] text-xs font-medium space-y-1">
                {formErrors.map((err, i) => (
                  <p key={i}>• {err}</p>
                ))}
              </div>
            )}

            {saveError && (
              <div className="p-3 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-medium">
                ⚠ {saveError}
              </div>
            )}

            {duplicateWarning && (
              <div className="p-3 rounded-lg bg-[#E9BC72]/20 text-[#9E7326] text-xs font-medium">
                ⚠ Warning: A source with matching URL or title/author already exists.
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Source Title *</label>
              <input
                type="text"
                value={editingSource.title}
                onChange={(e) => setEditingSource({ ...editingSource, title: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded border border-slate-300 focus:ring-2 focus:ring-[#345CFF]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Author / Publisher *</label>
                <input
                  type="text"
                  value={editingSource.author}
                  onChange={(e) => setEditingSource({ ...editingSource, author: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded border border-slate-300"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Publication Date</label>
                <input
                  type="text"
                  placeholder="e.g. 2026-05"
                  value={editingSource.publishedDate || ''}
                  onChange={(e) => setEditingSource({ ...editingSource, publishedDate: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded border border-slate-300"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">URL / Citation Link</label>
              <input
                type="text"
                placeholder="https://..."
                value={editingSource.url || ''}
                onChange={(e) => setEditingSource({ ...editingSource, url: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded border border-slate-300"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Verification Status *</label>
              <select
                value={editingSource.status}
                onChange={(e) =>
                  setEditingSource({
                    ...editingSource,
                    status: e.target.value as SourceVerificationStatus,
                    verifiedAt: e.target.value === 'CONFIRMED' && !editingSource.verifiedAt ? new Date().toISOString().split('T')[0] : editingSource.verifiedAt,
                  })
                }
                className="w-full px-3 py-2 text-xs rounded border border-slate-300 bg-white"
              >
                <option value="UNVERIFIED">UNVERIFIED</option>
                <option value="CONFIRMED">CONFIRMED (Requires validator, date & method)</option>
                <option value="DISPUTED">DISPUTED</option>
                <option value="OUTDATED">OUTDATED</option>
              </select>
            </div>

            {/* CONFIRMED Fields */}
            {editingSource.status === 'CONFIRMED' && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#16836D]">Verified By *</label>
                    <input
                      type="text"
                      placeholder="Validator Name / Editorial Role"
                      value={editingSource.verifiedBy || ''}
                      onChange={(e) => setEditingSource({ ...editingSource, verifiedBy: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded border border-slate-300 bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#16836D]">Verification Date *</label>
                    <input
                      type="date"
                      value={editingSource.verifiedAt || new Date().toISOString().split('T')[0]}
                      onChange={(e) => setEditingSource({ ...editingSource, verifiedAt: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded border border-slate-300 bg-white font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#16836D]">Verification Method / Evidence Document *</label>
                  <input
                    type="text"
                    placeholder="e.g. Peer-reviewed journal cross-reference / Archival primary doc"
                    value={editingSource.verificationMethod || ''}
                    onChange={(e) => setEditingSource({ ...editingSource, verificationMethod: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded border border-slate-300 bg-white"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Notes & Key Findings</label>
              <textarea
                rows={3}
                value={editingSource.notes}
                onChange={(e) => setEditingSource({ ...editingSource, notes: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded border border-slate-300"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingSource(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <PremiumButton type="submit" variant="primary" size="sm">
                Save Source
              </PremiumButton>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
