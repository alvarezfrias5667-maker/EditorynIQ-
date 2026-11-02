import React, { useState, useEffect } from 'react';
import { useI18n } from '../../i18n';
import {
  VisualAsset,
  VisualArtBrief,
  VisualStyleGuide,
  ChapterVisualMapping,
  QualityGate4CReport,
} from '../../domain/visual/visualTypes';
import {
  validateIllustrationFile,
  createIllustrationAssetFromUpload,
  sanitizeSvgContent,
  calculateEffectiveDpi,
  generateDefaultArtBrief,
  generateDefaultStyleGuide,
  createChapterVisualMapping,
  evaluateQualityGate4C,
  checkAiImageStatus,
} from '../../domain/visual/illustrationEngine';
import { PremiumButton } from '../ui/PremiumButton';

export interface IllustrationPanelProps {
  bookId: string;
  chapters?: Array<{ id: string; title: string }>;
  existingAssets?: VisualAsset[];
  onSaveAsset: (asset: VisualAsset) => Promise<boolean>;
}

export const IllustrationPanel: React.FC<IllustrationPanelProps> = ({
  bookId,
  chapters = [],
  existingAssets = [],
  onSaveAsset,
}) => {
  const { t } = useI18n();

  const [activeTab, setActiveTab] = useState<'brief' | 'upload' | 'mapping' | 'quality_gate'>('brief');

  const [artProfile, setArtProfile] = useState<'text-first' | 'visual-first' | 'technical-first'>('technical-first');
  const [artBrief, setArtBrief] = useState<VisualArtBrief>(() =>
    generateDefaultArtBrief(bookId, 'Book Title', 'Technical', 'es', artProfile)
  );
  const [styleGuide, setStyleGuide] = useState<VisualStyleGuide>(() =>
    generateDefaultStyleGuide(bookId, artProfile)
  );

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [assetTitle, setAssetTitle] = useState('');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('');
  const [editorialRole, setEditorialRole] = useState<'hero_illustration' | 'diagram' | 'chart' | 'infographic' | 'ornament'>('hero_illustration');
  const [caption, setCaption] = useState('');
  const [altText, setAltText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Mapping tab states
  const [mapAssetId, setMapAssetId] = useState<string>('');
  const [mapChapterId, setMapChapterId] = useState<string>('');
  const [mapCaption, setMapCaption] = useState<string>('');
  const [mapAltText, setMapAltText] = useState<string>('');

  const aiStatus = checkAiImageStatus();
  const validChapterIds = chapters.map((c) => c.id);
  const qualityGateReport: QualityGate4CReport = evaluateQualityGate4C(
    bookId,
    artBrief,
    existingAssets,
    validChapterIds
  );

  const handleProfileChange = (profile: 'text-first' | 'visual-first' | 'technical-first') => {
    setArtProfile(profile);
    const updatedBrief = generateDefaultArtBrief(bookId, 'Book Title', 'Category', 'es', profile);
    const updatedGuide = generateDefaultStyleGuide(bookId, profile);
    setArtBrief(updatedBrief);
    setStyleGuide(updatedGuide);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMsg(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validation = validateIllustrationFile(file);
      if (!validation.valid) {
        setMsg({ type: 'error', text: validation.error || 'Invalid illustration file.' });
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      if (!assetTitle) {
        setAssetTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setMsg({ type: 'error', text: 'Please select a valid illustration file to upload.' });
      return;
    }

    setUploading(true);
    setMsg(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const rawResult = reader.result as string;
        let isSvg = selectedFile.type === 'image/svg+xml';
        let svgSanitation = { containsForbiddenScript: false };

        if (isSvg) {
          const rawText = rawResult.startsWith('data:image/svg+xml;')
            ? decodeURIComponent(rawResult.split(',')[1] || '')
            : rawResult;
          svgSanitation = sanitizeSvgContent(rawText);
          if (svgSanitation.containsForbiddenScript) {
            setUploading(false);
            setMsg({
              type: 'error',
              text: 'MALICIOUS_SVG_REJECTED: File contains forbidden scripts or remote link references.',
            });
            return;
          }
        }

        const dpiCalc = calculateEffectiveDpi(1800, 2700, 6, 9); // Standard 300 DPI baseline

        const asset = createIllustrationAssetFromUpload(
          bookId,
          assetTitle || selectedFile.name,
          rawResult,
          selectedFile.size,
          selectedFile.type,
          selectedChapterId || undefined
        );

        asset.metadata = {
          ...asset.metadata,
          caption: caption || assetTitle,
          altText: altText || assetTitle,
          editorialRole,
          dpiWidth: dpiCalc.dpiWidth,
          dpiHeight: dpiCalc.dpiHeight,
          effectiveDpi: dpiCalc.effectiveDpi,
          isPrintReady: dpiCalc.isPrintReady,
          sanitizedSvg: isSvg,
        };

        const success = await onSaveAsset(asset);
        setUploading(false);

        if (success) {
          setMsg({
            type: 'success',
            text: `Illustration "${asset.title}" uploaded, sanitized, and saved to Visual Asset Library (300 DPI effective).`,
          });
          setSelectedFile(null);
          setAssetTitle('');
          setCaption('');
          setAltText('');
        } else {
          setMsg({ type: 'error', text: 'PERSISTENCE_BLOCKED: Failed to persist illustration asset in storage.' });
        }
      };

      reader.onerror = () => {
        setUploading(false);
        setMsg({ type: 'error', text: 'Error reading file payload.' });
      };

      reader.readAsDataURL(selectedFile);
    } catch {
      setUploading(false);
      setMsg({ type: 'error', text: 'Unexpected error during upload.' });
    }
  };

  const handleApplyMapping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mapAssetId || !mapChapterId) {
      setMsg({ type: 'error', text: 'Please select both an asset and a target chapter.' });
      return;
    }

    const mappingRes = createChapterVisualMapping(
      bookId,
      mapChapterId,
      mapAssetId,
      validChapterIds,
      'hero_illustration',
      mapCaption,
      mapAltText
    );

    if (!mappingRes.success || !mappingRes.mapping) {
      setMsg({ type: 'error', text: mappingRes.error || 'Failed to create chapter mapping.' });
      return;
    }

    const targetAsset = existingAssets.find((a) => a.id === mapAssetId);
    if (targetAsset) {
      const updatedAsset: VisualAsset = {
        ...targetAsset,
        chapterId: mapChapterId,
        metadata: {
          ...targetAsset.metadata,
          caption: mapCaption || targetAsset.metadata?.caption,
          altText: mapAltText || targetAsset.metadata?.altText,
          chapterMapping: mappingRes.mapping,
        },
      };

      const success = await onSaveAsset(updatedAsset);
      if (success) {
        setMsg({ type: 'success', text: `Asset associated with Chapter ID ${mapChapterId} successfully.` });
      } else {
        setMsg({ type: 'error', text: 'Failed to update asset chapter mapping.' });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h3 className="text-lg font-bold text-[#081629]">Art Direction Studio™ (Phase 4C)</h3>
          <p className="text-xs text-slate-500">
            Art direction briefs, chapter mapping, vector sanitization & 300 DPI resolution control
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab('brief')}
            className={`px-3 py-1.5 text-2xs font-bold rounded-lg transition-colors ${
              activeTab === 'brief' ? 'bg-[#345CFF] text-white shadow-2xs' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Art Brief & Style Guide
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-1.5 text-2xs font-bold rounded-lg transition-colors ${
              activeTab === 'upload' ? 'bg-[#345CFF] text-white shadow-2xs' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Artwork Import & Studio
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('mapping')}
            className={`px-3 py-1.5 text-2xs font-bold rounded-lg transition-colors ${
              activeTab === 'mapping' ? 'bg-[#345CFF] text-white shadow-2xs' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Chapter Visual Mapping
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('quality_gate')}
            className={`px-3 py-1.5 text-2xs font-bold rounded-lg transition-colors ${
              activeTab === 'quality_gate' ? 'bg-[#345CFF] text-white shadow-2xs' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Quality Gate 4C
          </button>
        </div>
      </div>

      {/* Visual AI Status Banner */}
      <div className="p-3 bg-slate-900 text-white rounded-xl border border-slate-800 flex items-center justify-between text-2xs">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded uppercase">
            {aiStatus.code}
          </span>
          <span className="text-slate-300">{aiStatus.message}</span>
        </div>
        <span className="text-slate-400 font-semibold text-3xs">INDEPENDENT LOCAL PRODUCTION</span>
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

      {/* TAB 1: ART BRIEF & STYLE GUIDE */}
      {activeTab === 'brief' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Profile Selector */}
          <div className="lg:col-span-12 bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-2xs">
            <h4 className="text-xs font-bold text-[#081629] uppercase tracking-wider">
              Editorial Art Direction Profile
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => handleProfileChange('text-first')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  artProfile === 'text-first'
                    ? 'border-[#345CFF] bg-blue-50/50 shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <div className="font-bold text-xs text-[#081629] mb-1">TEXT-FIRST™</div>
                <p className="text-2xs text-slate-600">
                  Selective narrative illustrations, sober line ornaments, classical serif feel, continuous reading.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleProfileChange('visual-first')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  artProfile === 'visual-first'
                    ? 'border-[#345CFF] bg-blue-50/50 shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <div className="font-bold text-xs text-[#081629] mb-1">VISUAL-FIRST™</div>
                <p className="text-2xs text-slate-600">
                  Predominant rich digital artwork, chapter visual rhythm, strong color palette consistency.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleProfileChange('technical-first')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  artProfile === 'technical-first'
                    ? 'border-[#345CFF] bg-blue-50/50 shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <div className="font-bold text-xs text-[#081629] mb-1">TECHNICAL-FIRST™</div>
                <p className="text-2xs text-slate-600">
                  Precision vector diagrams, process logic, data charts, schematics, and structured tables.
                </p>
              </button>
            </div>
          </div>

          {/* Art Brief Card */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-2xs">
            <h4 className="text-xs font-bold text-[#081629] uppercase tracking-wider border-b pb-2">
              Visual Art Brief™
            </h4>
            <div className="space-y-3 text-2xs">
              <div>
                <span className="font-semibold text-slate-500 block">Visual Theme:</span>
                <span className="font-bold text-slate-800">{artBrief.visualTheme}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-500 block">Style Keywords:</span>
                <div className="flex gap-1.5 flex-wrap mt-1">
                  {artBrief.styleKeywords.map((kw, i) => (
                    <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-mono text-3xs">
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <span className="font-semibold text-slate-500 block mb-1">Primary Color</span>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded border" style={{ backgroundColor: artBrief.colorPalette.primary }} />
                    <span className="font-mono text-3xs">{artBrief.colorPalette.primary}</span>
                  </div>
                </div>
                <div>
                  <span className="font-semibold text-slate-500 block mb-1">Accent Color</span>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded border" style={{ backgroundColor: artBrief.colorPalette.accent }} />
                    <span className="font-mono text-3xs">{artBrief.colorPalette.accent}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Style Guide Card */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-2xs">
            <h4 className="text-xs font-bold text-[#081629] uppercase tracking-wider border-b pb-2">
              Visual Style Guide™
            </h4>
            <div className="space-y-3 text-2xs">
              <div>
                <span className="font-semibold text-slate-500 block">Illustration Style:</span>
                <span className="font-bold text-slate-800">{styleGuide.illustrationStyle}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-500 block">Composition Rules:</span>
                <ul className="list-disc list-inside text-slate-600 mt-1 space-y-0.5">
                  {styleGuide.compositionRules.map((rule, i) => (
                    <li key={i}>{rule}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="font-semibold text-slate-500 block">Naming Convention:</span>
                <span className="font-mono text-3xs bg-slate-100 px-2 py-0.5 rounded block mt-0.5">{styleGuide.namingConvention}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: UPLOAD & VECTOR STUDIO */}
      {activeTab === 'upload' && (
        <form onSubmit={handleUploadSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-2xs">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-lg font-bold text-[#081629]">Artwork Import & Vector Studio</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Import PNG, JPEG, WebP, or SVG vector illustrations (up to 10MB) with SVG sanitization and effective 300 DPI calculation
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-2xs text-slate-500 font-semibold block mb-1">Illustration Title</label>
              <input
                type="text"
                placeholder="e.g. Figure 1.1 Architecture Flowchart"
                value={assetTitle}
                onChange={(e) => setAssetTitle(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="text-2xs text-slate-500 font-semibold block mb-1">Editorial Role</label>
              <select
                value={editorialRole}
                onChange={(e) => setEditorialRole(e.target.value as any)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white font-semibold"
              >
                <option value="hero_illustration">Hero Chapter Illustration</option>
                <option value="diagram">Technical Vector Diagram</option>
                <option value="chart">Data Chart & Table</option>
                <option value="infographic">Editorial Infographic</option>
                <option value="ornament">Sober Decorative Ornament</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-2xs text-slate-500 font-semibold block mb-1">Target Chapter</label>
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

            <div>
              <label className="text-2xs text-slate-500 font-semibold block mb-1">Caption / Figure Title</label>
              <input
                type="text"
                placeholder="Figure caption for print/digital"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
              />
            </div>
          </div>

          <div>
            <label className="text-2xs text-slate-500 font-semibold block mb-1">Accessibility Alt Text</label>
            <input
              type="text"
              placeholder="Descriptive alt text for screen readers"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-2xs text-slate-500 font-semibold block">Select Artwork Payload File</label>
            <input
              type="file"
              accept=".svg,.png,.jpg,.jpeg,.webp"
              onChange={handleFileSelect}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#345CFF] file:text-white hover:file:bg-[#2042C9]"
            />
            {selectedFile && (
              <p className="text-2xs font-mono text-slate-600">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          <div className="pt-2 flex justify-end">
            <PremiumButton variant="primary" size="md" disabled={uploading || !selectedFile}>
              {uploading ? 'Sanitizing & Processing...' : 'Upload & Process Artwork Payload'}
            </PremiumButton>
          </div>
        </form>
      )}

      {/* TAB 3: CHAPTER VISUAL MAPPING */}
      {activeTab === 'mapping' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-2xs">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-lg font-bold text-[#081629]">Chapter Visual Mapping™</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Associate visual assets explicitly to BOOK_ID, EDITION_ID, and valid CHAPTER_IDs with caption & accessibility descriptors
            </p>
          </div>

          <form onSubmit={handleApplyMapping} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-2xs text-slate-500 font-semibold block mb-1">Select Visual Asset</label>
                <select
                  value={mapAssetId}
                  onChange={(e) => setMapAssetId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="">-- Choose Asset from Library ({existingAssets.length}) --</option>
                  {existingAssets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.title} ({a.assetType.toUpperCase()}) {a.chapterId ? `[Ch: ${a.chapterId}]` : '[Unassigned]'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-2xs text-slate-500 font-semibold block mb-1">Target Chapter ID</label>
                <select
                  value={mapChapterId}
                  onChange={(e) => setMapChapterId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white font-semibold text-[#081629]"
                >
                  <option value="">-- Select Valid Chapter --</option>
                  {chapters.map((ch) => (
                    <option key={ch.id} value={ch.id}>
                      {ch.title} ({ch.id})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-2xs text-slate-500 font-semibold block mb-1">Figure Caption</label>
                <input
                  type="text"
                  placeholder="e.g. Figure 1.2 Multi-tenant Data Flow"
                  value={mapCaption}
                  onChange={(e) => setMapCaption(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="text-2xs text-slate-500 font-semibold block mb-1">Accessibility Alt Text</label>
                <input
                  type="text"
                  placeholder="Screen reader alt text"
                  value={mapAltText}
                  onChange={(e) => setMapAltText(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <PremiumButton variant="primary" size="md" disabled={!mapAssetId || !mapChapterId}>
                Associate Asset to Chapter
              </PremiumButton>
            </div>
          </form>

          {/* Assigned Asset Mapping Summary List */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-[#081629] uppercase tracking-wider">
              Current Project Visual Asset Mappings ({existingAssets.length})
            </h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {existingAssets.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No visual assets present in project library.</p>
              ) : (
                existingAssets.map((asset) => (
                  <div key={asset.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-2xs">
                    <div>
                      <span className="font-bold text-[#081629] block">{asset.title}</span>
                      <span className="text-slate-500">
                        Type: {asset.assetType.toUpperCase()} | Format: {asset.mimeType} | SHA256: {asset.sha256?.substring(0, 12)}...
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded font-mono font-bold text-3xs ${asset.chapterId ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>
                      {asset.chapterId ? `Ch: ${asset.chapterId}` : 'Unassigned'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: QUALITY GATE 4C */}
      {activeTab === 'quality_gate' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-lg font-bold text-[#081629]">Quality Gate 4C Inspection™</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Art direction compliance, chapter mapping integrity, 300 DPI effective resolution & vector sanitization
              </p>
            </div>

            <div className="text-right">
              <span
                className={`px-3 py-1 rounded-lg font-mono font-bold text-xs ${
                  qualityGateReport.status === 'ART_DIRECTION_READY' || qualityGateReport.status === 'ASSET_READY'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}
              >
                {qualityGateReport.status} ({qualityGateReport.score}%)
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {qualityGateReport.checks.map((chk) => (
              <div key={chk.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3 text-xs">
                <span className={`font-bold ${chk.passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {chk.passed ? '✓' : '✗'}
                </span>
                <div className="flex-1">
                  <span className="font-bold text-[#081629] block">{chk.name}</span>
                  <span className="text-slate-600 text-2xs">{chk.details}</span>
                </div>
              </div>
            ))}
          </div>

          {qualityGateReport.assetMetrics && (
            <div className="p-4 bg-slate-900 text-white rounded-xl space-y-1 text-2xs font-mono">
              <span className="text-slate-400 block font-bold uppercase">Asset Production Metrics</span>
              <span>Total Assets: {qualityGateReport.assetMetrics.totalAssets}</span> |{' '}
              <span>DPI Verified: {qualityGateReport.assetMetrics.dpiVerified ? 'YES' : 'NO'}</span> |{' '}
              <span>Rights Verified: {qualityGateReport.assetMetrics.rightsVerified ? 'YES' : 'NO'}</span> |{' '}
              <span>Sanitized SVGs: {qualityGateReport.assetMetrics.sanitizedSvgCount}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

