import React, { useState } from 'react';
import { useI18n } from '../../i18n';
import { DiagramSpec, VisualAsset } from '../../domain/visual/visualTypes';
import { createDefaultDiagramSpec, generateDiagramSVG } from '../../domain/visual/diagramEngine';
import { visualExportService } from '../../services/visualExportService';
import { createRightsRecord, computeSHA256Hash } from '../../domain/visual/visualRights';
import { PremiumButton } from '../ui/PremiumButton';

export interface DiagramEditorProps {
  bookId: string;
  chapters?: Array<{ id: string; title: string }>;
  initialAsset?: VisualAsset;
  onSaveAsset: (asset: VisualAsset) => Promise<boolean>;
}

export const DiagramEditor: React.FC<DiagramEditorProps> = ({ bookId, chapters = [], initialAsset, onSaveAsset }) => {
  const { t } = useI18n();

  const [spec, setSpec] = useState<DiagramSpec>(() => {
    if (initialAsset?.metadata?.diagramSpec) {
      return initialAsset.metadata.diagramSpec as DiagramSpec;
    }
    return createDefaultDiagramSpec('flowchart');
  });

  const [selectedChapterId, setSelectedChapterId] = useState<string>(initialAsset?.chapterId || '');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [newNodeLabel, setNewNodeLabel] = useState('');
  const [newNodeType, setNewNodeType] = useState<DiagramSpec['nodes'][0]['type']>('process');

  const handleTypeChange = (type: DiagramSpec['diagramType']) => {
    setSpec(createDefaultDiagramSpec(type));
  };

  const handleAddNode = () => {
    if (!newNodeLabel.trim()) return;
    const newId = `n_${Date.now()}`;
    const count = spec.nodes.length;
    const newNode = {
      id: newId,
      label: newNodeLabel.trim(),
      type: newNodeType,
      x: 80 + (count % 3) * 180,
      y: 80 + Math.floor(count / 3) * 90,
      width: 160,
      height: 50,
      bgColor: newNodeType === 'system' ? '#101F37' : '#345CFF',
      textColor: '#FFFFFF',
    };

    setSpec((prev) => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
    }));
    setNewNodeLabel('');
  };

  const handleRemoveNode = (nodeId: string) => {
    setSpec((prev) => ({
      ...prev,
      nodes: prev.nodes.filter((n) => n.id !== nodeId),
      edges: prev.edges.filter((e) => e.sourceId !== nodeId && e.targetId !== nodeId),
    }));
  };

  const svgContent = generateDiagramSVG(spec);

  const handleExportSVG = () => {
    visualExportService.exportSVG(svgContent, `${bookId}_diagram_${spec.diagramType}.svg`);
  };

  const handleExportPNG = async () => {
    await visualExportService.exportPNG(svgContent, `${bookId}_diagram_${spec.diagramType}.png`, 1200, 900);
  };

  const handleSaveToLibrary = async () => {
    setSaving(true);
    setMsg(null);

    const rights = createRightsRecord('VECTOR_EDITOR', 'Author Technical Diagram Spec');
    const hash = computeSHA256Hash(svgContent);

    const asset: VisualAsset = {
      id: initialAsset?.id || `diagram_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      bookId,
      assetType: 'diagram',
      sourceType: 'VECTOR_EDITOR',
      createdAt: initialAsset?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: (initialAsset?.version || 0) + 1,
      rightsStatus: rights.rightsStatus,
      chapterId: selectedChapterId || undefined,
      title: spec.title || 'Technical Diagram',
      description: `Type: ${spec.diagramType.toUpperCase()}, ${spec.nodes.length} nodes, ${spec.edges.length} edges.`,
      sha256: hash,
      svgContent,
      mimeType: 'image/svg+xml',
      licenseInfo: rights.licenseInfo,
      metadata: {
        diagramSpec: spec,
      },
    };

    const success = await onSaveAsset(asset);
    setSaving(false);

    if (success) {
      setMsg({ type: 'success', text: t.visual.diagramSaveSuccess || 'Technical diagram saved to Visual Asset Library.' });
    } else {
      setMsg({ type: 'error', text: 'Failed to save diagram asset.' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h3 className="text-lg font-bold text-[#081629]">{t.visual.diagramTitle || 'Technical Diagram Factory™'}</h3>
          <p className="text-xs text-slate-500">
            {t.visual.diagramSubtitle || 'Create flowcharts, system architectures, and process logic in vector SVG'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleTypeChange('flowchart')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              spec.diagramType === 'flowchart' ? 'bg-[#345CFF] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Flowchart
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('hierarchy')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              spec.diagramType === 'hierarchy' ? 'bg-[#345CFF] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Hierarchy
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('architecture')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              spec.diagramType === 'architecture' ? 'bg-[#345CFF] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Architecture
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
        {/* Left Controls */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-2xs">
          <h4 className="text-xs font-bold text-[#081629] uppercase tracking-wider border-b border-slate-100 pb-2">
            Diagram Parameters & Nodes
          </h4>

          <div>
            <label className="text-2xs text-slate-500 font-semibold block mb-1">Diagram Title</label>
            <input
              type="text"
              value={spec.title}
              onChange={(e) => setSpec({ ...spec, title: e.target.value })}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 font-bold"
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

          {/* Add Node Sub-form */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="text-2xs font-bold text-[#081629] uppercase tracking-wider block">Add Custom Vector Node</span>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Node label..."
                value={newNodeLabel}
                onChange={(e) => setNewNodeLabel(e.target.value)}
                className="flex-1 text-xs p-2 rounded-lg border border-slate-300"
              />
              <select
                value={newNodeType}
                onChange={(e) => setNewNodeType(e.target.value as any)}
                className="text-xs p-2 rounded-lg border border-slate-300 bg-white"
              >
                <option value="process">Process</option>
                <option value="decision">Decision</option>
                <option value="system">System</option>
                <option value="database">Database</option>
              </select>
            </div>
            <PremiumButton variant="outline" size="sm" onClick={handleAddNode}>
              + Add Node
            </PremiumButton>
          </div>

          {/* Node List */}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            <span className="text-2xs font-bold text-slate-500 uppercase tracking-wider block">Current Nodes ({spec.nodes.length})</span>
            {spec.nodes.map((node) => (
              <div key={node.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-100 text-2xs">
                <span className="font-semibold text-slate-800">{node.label}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveNode(node.id)}
                  className="text-rose-600 hover:underline font-bold"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <PremiumButton variant="primary" size="md" onClick={handleSaveToLibrary} disabled={saving}>
              {saving ? 'Saving...' : t.visual.saveDiagramToLibrary || 'Save Diagram to Visual Asset Library'}
            </PremiumButton>
          </div>
        </div>

        {/* Right Preview */}
        <div className="lg:col-span-7 bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-300 border-b border-slate-800 pb-3">
            <span className="font-bold uppercase tracking-wider text-[#16C8BA]">Vector Diagram Preview</span>
            <span className="font-mono text-slate-400">{spec.diagramType.toUpperCase()}</span>
          </div>

          <div className="bg-white p-4 rounded-xl flex items-center justify-center min-h-[400px]">
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
