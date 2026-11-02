import React, { useState } from 'react';
import { useI18n } from '../../i18n';
import { VisualAsset, RightsStatus } from '../../domain/visual/visualTypes';
import { updateAssetRightsStatus } from '../../domain/visual/visualRights';
import { PremiumButton } from '../ui/PremiumButton';

export interface VisualRightsPanelProps {
  assets: VisualAsset[];
  onSaveAsset: (asset: VisualAsset) => Promise<boolean>;
}

export const VisualRightsPanel: React.FC<VisualRightsPanelProps> = ({ assets, onSaveAsset }) => {
  const { t } = useI18n();
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<RightsStatus>('RIGHTS_DECLARED');
  const [auditNotes, setAuditNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleStartEdit = (asset: VisualAsset) => {
    setEditingAssetId(asset.id);
    setNewStatus(asset.rightsStatus);
    setAuditNotes('');
    setMsg(null);
  };

  const handleUpdateRights = async (asset: VisualAsset) => {
    setSaving(true);
    setMsg(null);

    const updated = updateAssetRightsStatus(asset, newStatus, auditNotes);
    const success = await onSaveAsset(updated);
    setSaving(false);

    if (success) {
      setMsg(t.visual.rightsUpdatedSuccess || 'Rights status updated successfully.');
      setEditingAssetId(null);
    } else {
      setMsg('Failed to update rights status.');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-2xs">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-lg font-bold text-[#081629]">{t.visual.rightsPanelTitle || 'Rights & Provenance™ Audit'}</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          {t.visual.rightsPanelSubtitle || 'Track copyright provenance, SHA256 file hashes, and author declarations per asset'}
        </p>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium">
          {msg}
        </div>
      )}

      {assets.length === 0 ? (
        <p className="text-xs text-slate-500 py-4 text-center">No visual assets available for rights auditing.</p>
      ) : (
        <div className="space-y-4">
          {assets.map((asset) => (
            <div key={asset.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                <div>
                  <span className="text-2xs font-bold text-[#345CFF] uppercase mr-2">{asset.assetType}</span>
                  <span className="text-xs font-bold text-[#081629]">{asset.title}</span>
                </div>
                <span
                  className={`text-2xs font-bold px-2.5 py-0.5 rounded ${
                    asset.rightsStatus === 'RIGHTS_APPROVED'
                      ? 'bg-emerald-100 text-emerald-900'
                      : asset.rightsStatus === 'RIGHTS_DECLARED'
                      ? 'bg-blue-100 text-blue-900'
                      : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  {asset.rightsStatus}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-2xs font-mono text-slate-600">
                <div>Source: {asset.sourceType}</div>
                <div>Version: v{asset.version}</div>
                <div>License: {asset.licenseInfo?.licenseName || 'N/A'}</div>
                <div className="truncate">Hash: {asset.sha256 || 'N/A'}</div>
              </div>

              {editingAssetId === asset.id ? (
                <div className="p-3 bg-white rounded-lg border border-slate-300 space-y-3 pt-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-2xs font-semibold text-slate-600 block mb-1">Select Rights Status</label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value as RightsStatus)}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                      >
                        <option value="RIGHTS_DECLARED">RIGHTS_DECLARED (Author Declaration)</option>
                        <option value="RIGHTS_REVIEW_REQUIRED">RIGHTS_REVIEW_REQUIRED (Needs Verification)</option>
                        <option value="RIGHTS_APPROVED">RIGHTS_APPROVED (Fully Approved)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-2xs font-semibold text-slate-600 block mb-1">Audit Notes / Declaration</label>
                      <input
                        type="text"
                        placeholder="e.g. Author original vector drawing..."
                        value={auditNotes}
                        onChange={(e) => setAuditNotes(e.target.value)}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingAssetId(null)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:underline"
                    >
                      Cancel
                    </button>
                    <PremiumButton variant="primary" size="sm" onClick={() => handleUpdateRights(asset)} disabled={saving}>
                      {saving ? 'Updating...' : 'Save Audit Status'}
                    </PremiumButton>
                  </div>
                </div>
              ) : (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(asset)}
                    className="text-2xs font-bold text-[#345CFF] hover:underline"
                  >
                    Edit Rights Status & Declarations
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
