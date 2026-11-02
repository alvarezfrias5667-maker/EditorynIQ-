import React, { useState } from 'react';
import { useI18n } from '../../i18n';
import { VisualAsset, VisualAssetType } from '../../domain/visual/visualTypes';
import { visualExportService } from '../../services/visualExportService';
import { PremiumButton } from '../ui/PremiumButton';

export interface VisualLibraryPanelProps {
  assets: VisualAsset[];
  onDeleteAsset: (assetId: string) => Promise<void>;
  onSelectAssetForEdit?: (asset: VisualAsset) => void;
}

export const VisualLibraryPanel: React.FC<VisualLibraryPanelProps> = ({
  assets,
  onDeleteAsset,
  onSelectAssetForEdit,
}) => {
  const { t } = useI18n();
  const [filterType, setFilterType] = useState<VisualAssetType | 'ALL'>('ALL');
  const [selectedAsset, setSelectedAsset] = useState<VisualAsset | null>(null);

  const filteredAssets = filterType === 'ALL' ? assets : assets.filter((a) => a.assetType === filterType);

  const handleExportAssetSVG = (asset: VisualAsset) => {
    if (asset.svgContent) {
      visualExportService.exportSVG(asset.svgContent, `${asset.title.toLowerCase().replace(/\s+/g, '_')}.svg`);
    }
  };

  const handleExportAssetPNG = async (asset: VisualAsset) => {
    if (asset.svgContent) {
      await visualExportService.exportPNG(asset.svgContent, `${asset.title.toLowerCase().replace(/\s+/g, '_')}.png`);
    } else if (asset.dataUrl) {
      const anchor = document.createElement('a');
      anchor.href = asset.dataUrl;
      anchor.download = `${asset.title.toLowerCase().replace(/\s+/g, '_')}.png`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Category Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h3 className="text-lg font-bold text-[#081629]">{t.visual.libraryTitle || 'Visual Asset Library™'}</h3>
          <p className="text-xs text-slate-500">
            {t.visual.librarySubtitle || 'IndexedDB persistent gallery of covers, illustrations, diagrams, charts, and infographics'}
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          {(['ALL', 'cover', 'illustration', 'diagram', 'chart', 'infographic'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors capitalize ${
                filterType === type ? 'bg-white text-[#081629] shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {type === 'ALL' ? 'All Assets' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Grid */}
      {filteredAssets.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <p className="text-sm font-bold text-[#081629]">{t.visual.emptyLibraryTitle || 'No Visual Assets Found'}</p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {t.visual.emptyLibrarySubtitle || 'Create covers, diagrams, or charts in the studios or upload illustrations to populate this library.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-shadow space-y-3 p-5 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Asset Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-2xs font-bold uppercase tracking-wider text-[#345CFF] bg-blue-50 px-2 py-0.5 rounded">
                    {asset.assetType}
                  </span>
                  <span
                    className={`text-2xs font-bold px-2 py-0.5 rounded ${
                      asset.rightsStatus === 'RIGHTS_APPROVED'
                        ? 'bg-emerald-50 text-emerald-800'
                        : 'bg-amber-50 text-amber-800'
                    }`}
                  >
                    {asset.rightsStatus}
                  </span>
                </div>

                {/* Preview Box */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 flex items-center justify-center min-h-[180px] max-h-[220px] overflow-hidden">
                  {asset.svgContent ? (
                    <div
                      className="w-full max-h-[180px] flex items-center justify-center"
                      dangerouslySetInnerHTML={{ __html: asset.svgContent }}
                    />
                  ) : asset.dataUrl ? (
                    <img src={asset.dataUrl} alt={asset.title} className="max-h-[180px] object-contain rounded" />
                  ) : (
                    <div className="text-xs text-slate-400 font-mono">No Image Preview</div>
                  )}
                </div>

                {/* Info */}
                <div>
                  <h4 className="text-sm font-bold text-[#081629] truncate">{asset.title}</h4>
                  <p className="text-2xs text-slate-500 line-clamp-2 mt-0.5">{asset.description}</p>
                </div>

                <div className="text-2xs text-slate-400 font-mono space-y-0.5 border-t border-slate-100 pt-2">
                  <div>Version: v{asset.version} · Source: {asset.sourceType}</div>
                  {asset.sha256 && <div className="truncate">Hash: {asset.sha256}</div>}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedAsset(asset)}
                  className="text-2xs font-bold text-[#345CFF] hover:underline"
                >
                  Inspect
                </button>

                <div className="flex items-center gap-2">
                  {asset.svgContent && (
                    <button
                      type="button"
                      onClick={() => handleExportAssetSVG(asset)}
                      className="text-2xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded hover:bg-slate-200"
                    >
                      SVG
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleExportAssetPNG(asset)}
                    className="text-2xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded hover:bg-slate-200"
                  >
                    PNG
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteAsset(asset.id)}
                    className="text-2xs font-bold text-rose-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inspect Detail Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-[#081629]">{selectedAsset.title}</h3>
                <span className="text-2xs font-mono text-slate-400">Asset ID: {selectedAsset.id}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAsset(null)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                ✕ Close
              </button>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl flex items-center justify-center min-h-[260px]">
              {selectedAsset.svgContent ? (
                <div className="w-full max-w-[380px]" dangerouslySetInnerHTML={{ __html: selectedAsset.svgContent }} />
              ) : (
                <img src={selectedAsset.dataUrl} alt={selectedAsset.title} className="max-h-[260px] object-contain" />
              )}
            </div>

            <div className="p-4 bg-slate-50 rounded-xl space-y-2 text-2xs text-slate-700 font-mono">
              <div>Type: {selectedAsset.assetType} | Source: {selectedAsset.sourceType}</div>
              <div>Rights Status: {selectedAsset.rightsStatus}</div>
              <div>License: {selectedAsset.licenseInfo?.licenseName}</div>
              <div>Usage Notes: {selectedAsset.licenseInfo?.usageNotes}</div>
              {selectedAsset.sha256 && <div>SHA256: {selectedAsset.sha256}</div>}
              <div>Created At: {selectedAsset.createdAt}</div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              {selectedAsset.svgContent && (
                <PremiumButton variant="outline" size="sm" onClick={() => handleExportAssetSVG(selectedAsset)}>
                  Export SVG
                </PremiumButton>
              )}
              <PremiumButton variant="gold" size="sm" onClick={() => handleExportAssetPNG(selectedAsset)}>
                Export PNG
              </PremiumButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
