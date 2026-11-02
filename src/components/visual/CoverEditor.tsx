import React, { useState } from 'react';
import { useI18n } from '../../i18n';
import {
  CoverDesignSpec,
  VisualAsset,
  VisualIdentityProfile,
  PrintCoverConfig,
  PrintProvider,
  TrimSizeOption,
  InkPaperType,
} from '../../domain/visual/visualTypes';
import {
  createInitialCoverSpec,
  generateCoverSVG,
  calculateSpineWidthMm,
  evaluateCoverQualityGate,
  checkAiCoverStatus,
  calculatePrintGeometry,
  evaluateQualityGate4BA,
  generatePrintCoverSVG,
  evaluatePreflight4BB,
} from '../../domain/visual/coverEngine';
import { visualExportService } from '../../services/visualExportService';
import { createRightsRecord, computeSHA256Hash } from '../../domain/visual/visualRights';
import { PremiumButton } from '../ui/PremiumButton';

export interface CoverEditorProps {
  bookId: string;
  bookTitle: string;
  authorName: string;
  pageCount: number;
  identity: VisualIdentityProfile;
  initialAsset?: VisualAsset;
  onSaveAsset: (asset: VisualAsset) => Promise<boolean>;
}

export const CoverEditor: React.FC<CoverEditorProps> = ({
  bookId,
  bookTitle,
  authorName,
  pageCount,
  identity,
  initialAsset,
  onSaveAsset,
}) => {
  const { t } = useI18n();

  const [activeTab, setActiveTab] = useState<'digital_ebook' | 'print_geometry'>('digital_ebook');

  const [spec, setSpec] = useState<CoverDesignSpec>(() => {
    if (initialAsset?.metadata?.coverSpec) {
      return initialAsset.metadata.coverSpec as CoverDesignSpec;
    }
    const initial = createInitialCoverSpec(bookTitle, authorName, pageCount, identity);
    initial.printConfig = {
      provider: 'KDP_PAPERBACK',
      trimSize: '6x9',
      inkPaperType: 'BW_WHITE',
      pageCount: pageCount || 200,
      pageCountVerified: true,
      isQaContext: true,
    };
    return initial;
  });

  const [printConfig, setPrintConfig] = useState<PrintCoverConfig>(() => {
    return (
      spec.printConfig || {
        provider: 'KDP_PAPERBACK',
        trimSize: '6x9',
        inkPaperType: 'BW_WHITE',
        pageCount: pageCount || 200,
        pageCountVerified: true,
        isQaContext: true,
      }
    );
  });

  const [viewMode, setViewMode] = useState<'front' | 'back' | 'full_spread'>('front');
  const [showGuides, setShowGuides] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showQualityGateModal, setShowQualityGateModal] = useState(false);

  const spineWidth = calculateSpineWidthMm(printConfig.pageCount);
  const qualityGateDigital = evaluateCoverQualityGate(spec, bookTitle, authorName, initialAsset);
  const qualityGatePrint = evaluateQualityGate4BA({ ...spec, printConfig }, printConfig.pageCount);
  const preflightReport4BB = evaluatePreflight4BB({ ...spec, printConfig }, null, printConfig.pageCount);
  const printGeometry = calculatePrintGeometry(printConfig);
  const aiStatus = checkAiCoverStatus();

  const handleUpdate = (key: keyof CoverDesignSpec, val: any) => {
    setSpec((prev) => ({ ...prev, [key]: val }));
  };

  const handleUpdatePrintConfig = (key: keyof PrintCoverConfig, val: any) => {
    setPrintConfig((prev) => {
      const updated = { ...prev, [key]: val };
      setSpec((s) => ({ ...s, printConfig: updated }));
      return updated;
    });
  };

  const svgContent =
    activeTab === 'print_geometry'
      ? generatePrintCoverSVG(spec, printConfig, showGuides, initialAsset)
      : generateCoverSVG({ ...spec, spineWidthMm: spineWidth }, viewMode, initialAsset);

  const handleExportSVG = () => {
    const filename = activeTab === 'print_geometry' ? `${bookId}_print_cover_spread.svg` : `${bookId}_cover_${viewMode}.svg`;
    visualExportService.exportSVG(svgContent, filename);
  };

  const handleExportPNG = async () => {
    const filename = activeTab === 'print_geometry' ? `${bookId}_print_cover_spread.png` : `${bookId}_cover_${viewMode}.png`;
    const w = activeTab === 'print_geometry' ? Math.round(printGeometry.totalWidthInches * 300) : (viewMode === 'full_spread' ? 3200 : 1600);
    const h = activeTab === 'print_geometry' ? Math.round(printGeometry.totalHeightInches * 300) : 2560;
    await visualExportService.exportPNG(svgContent, filename, w, h);
  };

  const handleExportJPEG = async () => {
    const filename = activeTab === 'print_geometry' ? `${bookId}_print_cover_spread.jpg` : `${bookId}_cover_${viewMode}.jpg`;
    const w = activeTab === 'print_geometry' ? Math.round(printGeometry.totalWidthInches * 300) : (viewMode === 'full_spread' ? 3200 : 1600);
    const h = activeTab === 'print_geometry' ? Math.round(printGeometry.totalHeightInches * 300) : 2560;
    await visualExportService.exportJPEG(svgContent, filename, w, h, 0.92);
  };

  const handleExportPrintCoverPDF = async () => {
    const filename = `${bookId}_full_print_cover_4BB.pdf`;
    await visualExportService.exportPrintCoverPDF(spec, printConfig, filename, initialAsset);
  };

  const handleSaveToLibrary = async () => {
    setSaving(true);
    setMsg(null);

    const rights = createRightsRecord('VECTOR_EDITOR', 'Author Proprietary Vector Cover');
    const fullSpreadSvg =
      activeTab === 'print_geometry'
        ? generatePrintCoverSVG(spec, printConfig, false, initialAsset)
        : generateCoverSVG({ ...spec, spineWidthMm: spineWidth }, 'full_spread', initialAsset);
    const hash = computeSHA256Hash(fullSpreadSvg);

    const asset: VisualAsset = {
      id: initialAsset?.id || `cover_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      bookId,
      assetType: 'cover',
      sourceType: 'VECTOR_EDITOR',
      createdAt: initialAsset?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: (initialAsset?.version || 0) + 1,
      rightsStatus: rights.rightsStatus,
      title: `${spec.frontTitle} (${activeTab === 'print_geometry' ? 'Print Cover Geometry 4B-A' : 'Book Cover Spec'})`,
      description: `Front title: "${spec.frontTitle}", Style: ${spec.style}, ${
        activeTab === 'print_geometry'
          ? `Print Provider: ${printConfig.provider}, Spine: ${printGeometry.spineWidthInches}" (${printGeometry.spineWidthMm}mm)`
          : `Spine: ${spineWidth}mm`
      }. Quality Gate: ${activeTab === 'print_geometry' ? qualityGatePrint.status : qualityGateDigital.status}.`,
      sha256: hash,
      svgContent: fullSpreadSvg,
      mimeType: 'image/svg+xml',
      licenseInfo: rights.licenseInfo,
      metadata: {
        coverSpec: { ...spec, printConfig },
        pageCount: printConfig.pageCount,
        spineWidthMm: printGeometry.spineWidthMm,
        qualityGateStatus: activeTab === 'print_geometry' ? qualityGatePrint.status : qualityGateDigital.status,
        qualityGateScore: activeTab === 'print_geometry' ? qualityGatePrint.score : qualityGateDigital.score,
        geometryVersion: '4B-A',
      },
    };

    const success = await onSaveAsset(asset);
    setSaving(false);

    if (success) {
      setMsg({ type: 'success', text: t.visual.coverSaveSuccess || 'Book cover design saved to Visual Asset Library.' });
    } else {
      setMsg({ type: 'error', text: t.visual.coverSaveError || 'Failed to persist cover design in local storage.' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h3 className="text-lg font-bold text-[#081629]">{t.visual.coverStudioTitle || 'Book Cover Factory™'}</h3>
          <p className="text-xs text-slate-500">
            {t.visual.coverStudioSubtitle || 'Vector & typographic editor for front, back, and spine covers'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('digital_ebook')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'digital_ebook' ? 'bg-[#345CFF] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Digital eBook (4A)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('print_geometry')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'print_geometry' ? 'bg-[#345CFF] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Print Cover Geometry (4B-A)
          </button>
        </div>
      </div>

      {/* AI Status Banner */}
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-2xs text-amber-900">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 font-mono font-bold bg-amber-200 text-amber-950 rounded uppercase">
            {aiStatus.code}
          </span>
          <span>{aiStatus.message}</span>
        </div>
        <span className="font-semibold text-amber-800">ADN V100 REAL ENGINE</span>
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
        {/* Left: Controls & Typography */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-2xs">
          {/* Cover Style Selector */}
          <div>
            <label className="text-2xs text-slate-500 font-semibold block mb-2 uppercase tracking-wider">
              Editorial Cover Style
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleUpdate('style', 'text-first')}
                className={`px-2.5 py-2 text-2xs font-bold rounded-xl border text-center transition-colors ${
                  (spec.style || 'technical-first').includes('text')
                    ? 'border-[#345CFF] bg-blue-50 text-[#345CFF]'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                TEXT-FIRST
              </button>
              <button
                type="button"
                onClick={() => handleUpdate('style', 'visual-first')}
                className={`px-2.5 py-2 text-2xs font-bold rounded-xl border text-center transition-colors ${
                  (spec.style || 'technical-first').includes('visual')
                    ? 'border-[#345CFF] bg-blue-50 text-[#345CFF]'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                VISUAL-FIRST
              </button>
              <button
                type="button"
                onClick={() => handleUpdate('style', 'technical-first')}
                className={`px-2.5 py-2 text-2xs font-bold rounded-xl border text-center transition-colors ${
                  (spec.style || 'technical-first').includes('technical')
                    ? 'border-[#345CFF] bg-blue-50 text-[#345CFF]'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                TECHNICAL-FIRST
              </button>
            </div>
          </div>

          {activeTab === 'print_geometry' && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-[#081629] uppercase tracking-wider">
                Print Configuration (Phase 4B-A)
              </h4>

              <div>
                <label className="text-2xs text-slate-500 font-semibold block mb-1">Print Provider</label>
                <select
                  value={printConfig.provider}
                  onChange={(e) => handleUpdatePrintConfig('provider', e.target.value as PrintProvider)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 font-semibold bg-white"
                >
                  <option value="KDP_PAPERBACK">KDP Paperback (Amazon)</option>
                  <option value="INGRAMSPARK_TEMPLATE_REQUIRED">IngramSpark (Template Required)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-2xs text-slate-500 font-semibold block mb-1">Trim Size</label>
                  <select
                    value={printConfig.trimSize}
                    onChange={(e) => handleUpdatePrintConfig('trimSize', e.target.value as TrimSizeOption)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="6x9">6.0" x 9.0" (Standard)</option>
                    <option value="5.5x8.5">5.5" x 8.5" (Trade)</option>
                    <option value="5x8">5.0" x 8.0" (Pocket)</option>
                    <option value="8.5x11">8.5" x 11.0" (Letter)</option>
                  </select>
                </div>

                <div>
                  <label className="text-2xs text-slate-500 font-semibold block mb-1">Ink & Paper Type</label>
                  <select
                    value={printConfig.inkPaperType}
                    onChange={(e) => handleUpdatePrintConfig('inkPaperType', e.target.value as InkPaperType)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="BW_WHITE">B/N White (0.002252"/pg)</option>
                    <option value="BW_CREAM">B/N Cream (0.0025"/pg)</option>
                    <option value="PREMIUM_COLOR">Premium Color (0.002347"/pg)</option>
                    <option value="STANDARD_COLOR">Standard Color (0.002252"/pg)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-2xs text-slate-500 font-semibold block mb-1">Verified Page Count</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={24}
                    max={828}
                    value={printConfig.pageCount}
                    onChange={(e) => handleUpdatePrintConfig('pageCount', parseInt(e.target.value, 10) || 200)}
                    className="w-28 text-xs p-2 rounded-lg border border-slate-300 font-mono font-bold"
                  />
                  <label className="flex items-center gap-1.5 text-2xs text-slate-600">
                    <input
                      type="checkbox"
                      checked={printConfig.pageCountVerified}
                      onChange={(e) => handleUpdatePrintConfig('pageCountVerified', e.target.checked)}
                      className="rounded border-slate-300 text-[#345CFF]"
                    />
                    Verified E4 Interior
                  </label>
                </div>
              </div>
            </div>
          )}

          <h4 className="text-xs font-bold text-[#081629] uppercase tracking-wider border-b border-slate-100 pb-2 pt-2">
            Cover Parameters & Copy
          </h4>

          <div>
            <label className="text-2xs text-slate-500 font-semibold block mb-1">Front Cover Title</label>
            <input
              type="text"
              value={spec.frontTitle}
              onChange={(e) => handleUpdate('frontTitle', e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 font-bold"
            />
          </div>

          <div>
            <label className="text-2xs text-slate-500 font-semibold block mb-1">Front Subtitle</label>
            <input
              type="text"
              value={spec.frontSubtitle}
              onChange={(e) => handleUpdate('frontSubtitle', e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
            />
          </div>

          <div>
            <label className="text-2xs text-slate-500 font-semibold block mb-1">Author Name</label>
            <input
              type="text"
              value={spec.authorName}
              onChange={(e) => handleUpdate('authorName', e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
            />
          </div>

          <div>
            <label className="text-2xs text-slate-500 font-semibold block mb-1">Publisher Name</label>
            <input
              type="text"
              value={spec.publisherName}
              onChange={(e) => handleUpdate('publisherName', e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
            />
          </div>

          <div>
            <label className="text-2xs text-slate-500 font-semibold block mb-1">Back Cover Summary / Blurb</label>
            <textarea
              rows={3}
              value={spec.backCoverBlurb}
              onChange={(e) => handleUpdate('backCoverBlurb', e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-2xs text-slate-500 font-semibold block mb-1">Background Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={spec.bgColor}
                  onChange={(e) => handleUpdate('bgColor', e.target.value)}
                  className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0"
                />
                <span className="text-2xs font-mono">{spec.bgColor}</span>
              </div>
            </div>

            <div>
              <label className="text-2xs text-slate-500 font-semibold block mb-1">Accent Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={spec.accentColor}
                  onChange={(e) => handleUpdate('accentColor', e.target.value)}
                  className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0"
                />
                <span className="text-2xs font-mono">{spec.accentColor}</span>
              </div>
            </div>
          </div>

          {/* Quality Gate Status Box */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#081629]">
                {activeTab === 'print_geometry' ? 'Quality Gate 4B-A Evaluation' : 'Quality Gate Evaluation'}
              </span>
              <span
                className={`px-2 py-0.5 rounded font-mono font-bold text-3xs ${
                  (activeTab === 'print_geometry' ? qualityGatePrint.status : qualityGateDigital.status) === 'READY' ||
                  (activeTab === 'print_geometry' ? qualityGatePrint.status : qualityGateDigital.status) === 'DESIGN_READY'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {activeTab === 'print_geometry' ? qualityGatePrint.status : qualityGateDigital.status} (
                {activeTab === 'print_geometry' ? qualityGatePrint.score : qualityGateDigital.score}%)
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowQualityGateModal(!showQualityGateModal)}
              className="text-[#345CFF] hover:underline font-semibold text-2xs block"
            >
              {showQualityGateModal ? 'Hide Check Details' : 'View Quality Gate Checks'}
            </button>

            {showQualityGateModal && (
              <div className="pt-2 border-t border-slate-200 space-y-1">
                {(activeTab === 'print_geometry' ? qualityGatePrint.checks : qualityGateDigital.checks).map((chk: { name: string; passed: boolean; details: string }, i: number) => (
                  <div key={i} className="flex items-start gap-1.5 text-3xs">
                    <span className={chk.passed ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                      {chk.passed ? '✓' : '✗'}
                    </span>
                    <div>
                      <span className="font-semibold text-slate-700">{chk.name}: </span>
                      <span className="text-slate-500">{chk.details}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Spine Allowance Info */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-2xs text-slate-600 space-y-1">
            <span className="font-bold text-[#081629] block">
              {activeTab === 'print_geometry' ? 'KDP Print Geometry Calculation' : 'Preliminary Spine Calculation'}
            </span>
            <span>Page Budget: {printConfig.pageCount} pages</span>
            <span className="block font-mono text-[#345CFF]">
              Calculated Spine Width: {printGeometry.spineWidthInches}" ({printGeometry.spineWidthMm} mm)
            </span>
            {activeTab === 'print_geometry' && (
              <span className="block font-mono text-slate-500">
                Total Spread: {printGeometry.totalWidthInches}" × {printGeometry.totalHeightInches}" ({printGeometry.totalWidthMm}mm ×{' '}
                {printGeometry.totalHeightMm}mm)
              </span>
            )}
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <PremiumButton variant="primary" size="md" onClick={handleSaveToLibrary} disabled={saving}>
              {saving ? 'Saving...' : t.visual.saveCoverToLibrary || 'Save Cover to Visual Asset Library'}
            </PremiumButton>
          </div>
        </div>

        {/* Right: Live Vector Preview & Export */}
        <div className="lg:col-span-7 bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-300 border-b border-slate-800 pb-3">
            <span className="font-bold uppercase tracking-wider text-[#16C8BA]">
              {activeTab === 'print_geometry' ? 'Print Cover Spread Preview (4B-A)' : 'Vector Canvas Preview'}
            </span>
            <div className="flex items-center gap-2">
              {activeTab === 'print_geometry' ? (
                <>
                  <label className="flex items-center gap-1 text-3xs text-slate-400">
                    <input
                      type="checkbox"
                      checked={showGuides}
                      onChange={(e) => setShowGuides(e.target.checked)}
                      className="rounded border-slate-700 text-[#345CFF]"
                    />
                    Show Bleed & Trim Guides
                  </label>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-3xs">
                    {printGeometry.totalWidthInches}" × {printGeometry.totalHeightInches}"
                  </span>
                </>
              ) : (
                <>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-3xs">
                    1600 × 2560 PX (eBook Standard)
                  </span>
                  <span className="font-mono text-slate-400">{viewMode.toUpperCase()}</span>
                </>
              )}
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-center min-h-[460px]">
            <div
              className="w-full max-w-[620px] shadow-2xl rounded"
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 flex-wrap">
            {activeTab === 'print_geometry' && (
              <PremiumButton variant="gold" size="sm" onClick={handleExportPrintCoverPDF}>
                Export Physical Cover PDF (4B-B)
              </PremiumButton>
            )}
            <PremiumButton variant="outline" size="sm" onClick={handleExportSVG}>
              Export Vector SVG
            </PremiumButton>
            <PremiumButton variant="gold" size="sm" onClick={handleExportPNG}>
              Export PNG Image
            </PremiumButton>
            <PremiumButton variant="primary" size="sm" onClick={handleExportJPEG}>
              Export JPEG Image
            </PremiumButton>
          </div>
        </div>
      </div>
    </div>
  );
};

