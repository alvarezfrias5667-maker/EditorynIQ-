import React, { useState } from 'react';
import { useI18n } from '../../i18n';
import { InfographicSpec, VisualAsset } from '../../domain/visual/visualTypes';
import { createDefaultInfographicSpec, generateInfographicSVG } from '../../domain/visual/infographicEngine';
import { visualExportService } from '../../services/visualExportService';
import { createRightsRecord, computeSHA256Hash } from '../../domain/visual/visualRights';
import { PremiumButton } from '../ui/PremiumButton';

export interface InfographicEditorProps {
  bookId: string;
  chapters?: Array<{ id: string; title: string }>;
  initialAsset?: VisualAsset;
  onSaveAsset: (asset: VisualAsset) => Promise<boolean>;
}

export const InfographicEditor: React.FC<InfographicEditorProps> = ({ bookId, chapters = [], initialAsset, onSaveAsset }) => {
  const { t } = useI18n();

  const [spec, setSpec] = useState<InfographicSpec>(() => {
    if (initialAsset?.metadata?.infographicSpec) {
      return initialAsset.metadata.infographicSpec as InfographicSpec;
    }
    return createDefaultInfographicSpec();
  });

  const [selectedChapterId, setSelectedChapterId] = useState<string>(initialAsset?.chapterId || '');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [blockTitle, setBlockTitle] = useState('');
  const [blockContent, setBlockContent] = useState('');
  const [blockNum, setBlockNum] = useState('');
  const [blockUnit, setBlockUnit] = useState('');

  const handleAddBlock = () => {
    if (!blockTitle.trim() || !blockContent.trim()) {
      setMsg({ type: 'error', text: 'Please enter block title and content.' });
      return;
    }

    const newBlock = {
      id: `b_${Date.now()}`,
      title: blockTitle.trim(),
      content: blockContent.trim(),
      highlightNumber: blockNum.trim() || undefined,
      highlightUnit: blockUnit.trim() || undefined,
      blockType: (blockNum.trim() ? 'metric' : 'text') as any,
    };

    setSpec((prev) => ({
      ...prev,
      blocks: [...prev.blocks, newBlock],
    }));

    setBlockTitle('');
    setBlockContent('');
    setBlockNum('');
    setBlockUnit('');
    setMsg(null);
  };

  const handleRemoveBlock = (id: string) => {
    setSpec((prev) => ({
      ...prev,
      blocks: prev.blocks.filter((b) => b.id !== id),
    }));
  };

  const svgContent = generateInfographicSVG(spec);

  const handleExportSVG = () => {
    visualExportService.exportSVG(svgContent, `${bookId}_infographic.svg`);
  };

  const handleExportPNG = async () => {
    await visualExportService.exportPNG(svgContent, `${bookId}_infographic.png`, 1280, 1040);
  };

  const handleSaveToLibrary = async () => {
    setSaving(true);
    setMsg(null);

    const rights = createRightsRecord('VECTOR_EDITOR', 'Author Editorial Infographic Spec');
    const hash = computeSHA256Hash(svgContent);

    const asset: VisualAsset = {
      id: initialAsset?.id || `infographic_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      bookId,
      assetType: 'infographic',
      sourceType: 'VECTOR_EDITOR',
      createdAt: initialAsset?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: (initialAsset?.version || 0) + 1,
      rightsStatus: rights.rightsStatus,
      chapterId: selectedChapterId || undefined,
      title: spec.title || 'Editorial Infographic',
      description: `${spec.subtitle} (${spec.blocks.length} editorial blocks).`,
      sha256: hash,
      svgContent,
      mimeType: 'image/svg+xml',
      licenseInfo: rights.licenseInfo,
      metadata: {
        infographicSpec: spec,
      },
    };

    const success = await onSaveAsset(asset);
    setSaving(false);

    if (success) {
      setMsg({ type: 'success', text: t.visual.infographicSaveSuccess || 'Editorial infographic saved to Visual Asset Library.' });
    } else {
      setMsg({ type: 'error', text: 'Failed to save infographic asset.' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h3 className="text-lg font-bold text-[#081629]">{t.visual.infographicTitle || 'Editorial Infographic Factory™'}</h3>
          <p className="text-xs text-slate-500">
            {t.visual.infographicSubtitle || 'Compose structured editorial infographics with key metrics and info blocks'}
          </p>
        </div>
      </div>

      {msg && (
        <div
          className={`p-4 rounded-xl text-xs font-medium ${
            msg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {msg.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-2xs">
          <h4 className="text-xs font-bold text-[#081629] uppercase tracking-wider border-b border-slate-100 pb-2">
            Infographic Content & Blocks
          </h4>

          <div>
            <label className="text-2xs text-slate-500 font-semibold block mb-1">Header Title</label>
            <input
              type="text"
              value={spec.title}
              onChange={(e) => setSpec({ ...spec, title: e.target.value })}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 font-bold"
            />
          </div>

          <div>
            <label className="text-2xs text-slate-500 font-semibold block mb-1">Subtitle / Kicker</label>
            <input
              type="text"
              value={spec.subtitle}
              onChange={(e) => setSpec({ ...spec, subtitle: e.target.value })}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
            />
          </div>

          <div>
            <label className="text-2xs text-slate-500 font-semibold block mb-1">Associated Chapter</label>
            <select
              value={selectedChapterId}
              onChange={(e) => setSelectedChapterId(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
            >
              <option value="">-- Unassigned (Book General) --</option>
              {chapters.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  {ch.title}
                </option>
              ))}
            </select>
          </div>

          {/* Add Block Form */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="text-2xs font-bold text-[#081629] uppercase tracking-wider block">Add Infographic Info Block</span>
            <input
              type="text"
              placeholder="Block Title..."
              value={blockTitle}
              onChange={(e) => setBlockTitle(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-slate-300"
            />
            <textarea
              rows={2}
              placeholder="Block content summary..."
              value={blockContent}
              onChange={(e) => setBlockContent(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-slate-300"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Metric (e.g. 100%)..."
                value={blockNum}
                onChange={(e) => setBlockNum(e.target.value)}
                className="text-xs p-2 rounded-lg border border-slate-300 font-bold"
              />
              <input
                type="text"
                placeholder="Metric Unit..."
                value={blockUnit}
                onChange={(e) => setBlockUnit(e.target.value)}
                className="text-xs p-2 rounded-lg border border-slate-300"
              />
            </div>
            <PremiumButton variant="outline" size="sm" onClick={handleAddBlock}>
              + Add Info Block
            </PremiumButton>
          </div>

          {/* Current Blocks List */}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            <span className="text-2xs font-bold text-slate-500 uppercase tracking-wider block">
              Editorial Blocks ({spec.blocks.length})
            </span>
            {spec.blocks.map((b) => (
              <div key={b.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-100 text-2xs">
                <div>
                  <span className="font-bold text-slate-800 block">{b.title}</span>
                  <span className="text-slate-500 truncate block max-w-[200px]">{b.content}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveBlock(b.id)}
                  className="text-rose-600 hover:underline font-bold"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <PremiumButton variant="primary" size="md" onClick={handleSaveToLibrary} disabled={saving}>
              {saving ? 'Saving...' : t.visual.saveInfographicToLibrary || 'Save Infographic to Visual Asset Library'}
            </PremiumButton>
          </div>
        </div>

        {/* Right Preview */}
        <div className="lg:col-span-7 bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-300 border-b border-slate-800 pb-3">
            <span className="font-bold uppercase tracking-wider text-[#16C8BA]">Vector Infographic Canvas</span>
            <span className="font-mono text-slate-400">INFOGRAPHIC</span>
          </div>

          <div className="bg-white p-4 rounded-xl flex items-center justify-center min-h-[420px]">
            <div className="w-full" dangerouslySetInnerHTML={{ __html: svgContent }} />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <PremiumButton variant="outline" size="sm" onClick={handleExportSVG}>
              Export Vector SVG
            </PremiumButton>
            <PremiumButton variant="gold" size="sm" onClick={handleExportPNG}>
              Export PNG Image
            </PremiumButton>
          </div>
        </div>
      </div>
    </div>
  );
};
