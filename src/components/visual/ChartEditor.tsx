import React, { useState } from 'react';
import { useI18n } from '../../i18n';
import { ChartSpec, ChartDataPoint, VisualAsset } from '../../domain/visual/visualTypes';
import { createDefaultChartSpec, generateChartSVG, validateChartData } from '../../domain/visual/chartEngine';
import { visualExportService } from '../../services/visualExportService';
import { createRightsRecord, computeSHA256Hash } from '../../domain/visual/visualRights';
import { PremiumButton } from '../ui/PremiumButton';

export interface ChartEditorProps {
  bookId: string;
  chapters?: Array<{ id: string; title: string }>;
  initialAsset?: VisualAsset;
  onSaveAsset: (asset: VisualAsset) => Promise<boolean>;
}

export const ChartEditor: React.FC<ChartEditorProps> = ({ bookId, chapters = [], initialAsset, onSaveAsset }) => {
  const { t } = useI18n();

  const [spec, setSpec] = useState<ChartSpec>(() => {
    if (initialAsset?.metadata?.chartSpec) {
      return initialAsset.metadata.chartSpec as ChartSpec;
    }
    return createDefaultChartSpec('bar');
  });

  const [selectedChapterId, setSelectedChapterId] = useState<string>(initialAsset?.chapterId || '');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [newLabel, setNewLabel] = useState('');
  const [newValue, setNewValue] = useState('');

  const handleTypeChange = (type: ChartSpec['chartType']) => {
    setSpec(createDefaultChartSpec(type));
  };

  const handleAddPoint = () => {
    const valNum = parseFloat(newValue);
    if (!newLabel.trim() || isNaN(valNum)) {
      setMsg({ type: 'error', text: 'Please enter a valid string label and numeric value.' });
      return;
    }

    const defaultColors = ['#345CFF', '#16C8BA', '#E9BC72', '#101F37', '#8B5CF6'];
    const pointColor = defaultColors[spec.dataPoints.length % defaultColors.length];

    setSpec((prev) => ({
      ...prev,
      dataPoints: [...prev.dataPoints, { label: newLabel.trim(), value: valNum, color: pointColor }],
    }));

    setNewLabel('');
    setNewValue('');
    setMsg(null);
  };

  const handleRemovePoint = (index: number) => {
    setSpec((prev) => ({
      ...prev,
      dataPoints: prev.dataPoints.filter((_, i) => i !== index),
    }));
  };

  const validation = validateChartData(spec);
  const svgContent = validation.valid ? generateChartSVG(spec) : '';

  const handleExportSVG = () => {
    if (!svgContent) return;
    visualExportService.exportSVG(svgContent, `${bookId}_chart_${spec.chartType}.svg`);
  };

  const handleExportPNG = async () => {
    if (!svgContent) return;
    await visualExportService.exportPNG(svgContent, `${bookId}_chart_${spec.chartType}.png`, 1200, 720);
  };

  const handleSaveToLibrary = async () => {
    if (!validation.valid) {
      setMsg({ type: 'error', text: validation.error || 'Chart data is invalid.' });
      return;
    }

    setSaving(true);
    setMsg(null);

    const rights = createRightsRecord('DATA_RENDER', 'Author Documented Data Chart');
    const hash = computeSHA256Hash(svgContent);

    const asset: VisualAsset = {
      id: initialAsset?.id || `chart_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      bookId,
      assetType: 'chart',
      sourceType: 'DATA_RENDER',
      createdAt: initialAsset?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: (initialAsset?.version || 0) + 1,
      rightsStatus: rights.rightsStatus,
      chapterId: selectedChapterId || undefined,
      title: spec.title || 'Data Chart',
      description: `Type: ${spec.chartType.toUpperCase()}, ${spec.dataPoints.length} data points. Source: ${spec.sourceCitation}`,
      sha256: hash,
      svgContent,
      mimeType: 'image/svg+xml',
      licenseInfo: rights.licenseInfo,
      metadata: {
        chartSpec: spec,
      },
    };

    const success = await onSaveAsset(asset);
    setSaving(false);

    if (success) {
      setMsg({ type: 'success', text: t.visual.chartSaveSuccess || 'Data chart saved to Visual Asset Library.' });
    } else {
      setMsg({ type: 'error', text: 'Failed to save chart asset.' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h3 className="text-lg font-bold text-[#081629]">{t.visual.chartTitle || 'Data Chart Factory™'}</h3>
          <p className="text-xs text-slate-500">
            {t.visual.chartSubtitle || 'Render bar, line, pie, and comparative charts from real author data'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleTypeChange('bar')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              spec.chartType === 'bar' ? 'bg-[#345CFF] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Bar Chart
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('line')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              spec.chartType === 'line' ? 'bg-[#345CFF] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Line Chart
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('pie')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              spec.chartType === 'pie' ? 'bg-[#345CFF] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Pie Chart
          </button>
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
            Chart Parameters & Data Points
          </h4>

          <div>
            <label className="text-2xs text-slate-500 font-semibold block mb-1">Chart Title</label>
            <input
              type="text"
              value={spec.title}
              onChange={(e) => setSpec({ ...spec, title: e.target.value })}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-2xs text-slate-500 font-semibold block mb-1">Unit Label</label>
              <input
                type="text"
                value={spec.unit}
                onChange={(e) => setSpec({ ...spec, unit: e.target.value })}
                className="w-full text-xs p-2 rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="text-2xs text-slate-500 font-semibold block mb-1">Source Citation</label>
              <input
                type="text"
                value={spec.sourceCitation}
                onChange={(e) => setSpec({ ...spec, sourceCitation: e.target.value })}
                className="w-full text-xs p-2 rounded-lg border border-slate-300"
              />
            </div>
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

          {/* Add Data Point Row */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="text-2xs font-bold text-[#081629] uppercase tracking-wider block">Add Numeric Data Point</span>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Label (e.g. Q1)..."
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="text-xs p-2 rounded-lg border border-slate-300"
              />
              <input
                type="number"
                placeholder="Numeric value..."
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="text-xs p-2 rounded-lg border border-slate-300 font-mono"
              />
            </div>
            <PremiumButton variant="outline" size="sm" onClick={handleAddPoint}>
              + Add Data Point
            </PremiumButton>
          </div>

          {/* Current Data Points Table */}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            <span className="text-2xs font-bold text-slate-500 uppercase tracking-wider block">
              Data Series ({spec.dataPoints.length} points)
            </span>
            {spec.dataPoints.map((p, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-100 text-2xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color || '#345CFF' }} />
                  <span className="font-semibold text-slate-800">{p.label}:</span>
                  <span className="font-mono font-bold text-[#081629]">{p.value}{spec.unit}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemovePoint(idx)}
                  className="text-rose-600 hover:underline font-bold"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <PremiumButton variant="primary" size="md" onClick={handleSaveToLibrary} disabled={saving}>
              {saving ? 'Saving...' : t.visual.saveChartToLibrary || 'Save Chart to Visual Asset Library'}
            </PremiumButton>
          </div>
        </div>

        {/* Right Preview */}
        <div className="lg:col-span-7 bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-300 border-b border-slate-800 pb-3">
            <span className="font-bold uppercase tracking-wider text-[#16C8BA]">Vector Chart Canvas</span>
            <span className="font-mono text-slate-400">{spec.chartType.toUpperCase()}</span>
          </div>

          <div className="bg-white p-4 rounded-xl flex items-center justify-center min-h-[360px]">
            {validation.valid ? (
              <div className="w-full" dangerouslySetInnerHTML={{ __html: svgContent }} />
            ) : (
              <div className="text-xs text-rose-600 font-semibold">{validation.error}</div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <PremiumButton variant="outline" size="sm" onClick={handleExportSVG} disabled={!validation.valid}>
              Export Vector SVG
            </PremiumButton>
            <PremiumButton variant="gold" size="sm" onClick={handleExportPNG} disabled={!validation.valid}>
              Export PNG Image
            </PremiumButton>
          </div>
        </div>
      </div>
    </div>
  );
};
