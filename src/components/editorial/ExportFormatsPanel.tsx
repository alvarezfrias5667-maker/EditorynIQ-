import React, { useState } from 'react';
import { useI18n } from '../../i18n';
import { EditorialEdition, FormatExportResult } from '../../domain/editorial/editorialTypes';
import { editorialExportService } from '../../services/editorialExportService';
import { PremiumButton } from '../ui/PremiumButton';

export interface ExportFormatsPanelProps {
  edition: EditorialEdition;
  onExportComplete?: (result: FormatExportResult) => void;
}

export const ExportFormatsPanel: React.FC<ExportFormatsPanelProps> = ({ edition, onExportComplete }) => {
  const { t } = useI18n();

  const [exportingFormat, setExportingFormat] = useState<'PDF' | 'EPUB' | 'DOCX' | null>(null);
  const [lastResults, setLastResults] = useState<FormatExportResult[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleExportPDF = async () => {
    setExportingFormat('PDF');
    setErrorMsg(null);
    try {
      const res = await editorialExportService.exportPDF(edition);
      setLastResults((prev) => [res, ...prev.filter((r) => r.format !== 'PDF')]);
      if (onExportComplete) onExportComplete(res);
    } catch {
      setErrorMsg('Failed to compile PDF file.');
    } finally {
      setExportingFormat(null);
    }
  };

  const handleExportEPUB = async () => {
    setExportingFormat('EPUB');
    setErrorMsg(null);
    try {
      const res = await editorialExportService.exportEPUB(edition);
      setLastResults((prev) => [res, ...prev.filter((r) => r.format !== 'EPUB')]);
      if (onExportComplete) onExportComplete(res);
    } catch {
      setErrorMsg('Failed to compile EPUB 3.3 package.');
    } finally {
      setExportingFormat(null);
    }
  };

  const handleExportDOCX = async () => {
    setExportingFormat('DOCX');
    setErrorMsg(null);
    try {
      const res = await editorialExportService.exportDOCX(edition);
      setLastResults((prev) => [res, ...prev.filter((r) => r.format !== 'DOCX')]);
      if (onExportComplete) onExportComplete(res);
    } catch {
      setErrorMsg('Failed to build DOCX file.');
    } finally {
      setExportingFormat(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-2xs">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-lg font-bold text-[#081629]">{t.editorial.exportsTitle}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{t.editorial.exportsSubtitle}</p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-xl border border-rose-200 font-medium">
            {errorMsg}
          </div>
        )}

        {/* 3 Format Export Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* PDF Card */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#345CFF]">PDF Master</span>
                <span className="text-3xs font-mono font-bold bg-blue-50 text-[#345CFF] px-2 py-0.5 rounded">PDF 1.4 Vector</span>
              </div>
              <h4 className="text-sm font-bold text-[#081629]">Press-Ready Master PDF</h4>
              <p className="text-2xs text-slate-500">
                Vector text streams, running headers, table of contents, embedded metadata, and SHA-256 signature.
              </p>
            </div>

            <div className="pt-2">
              <PremiumButton
                variant="primary"
                size="sm"
                disabled={exportingFormat === 'PDF'}
                onClick={handleExportPDF}
              >
                {exportingFormat === 'PDF' ? 'Compiling PDF...' : t.editorial.exportPdfBtn}
              </PremiumButton>
            </div>
          </div>

          {/* EPUB Card */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">EPUB 3.3</span>
                <span className="text-3xs font-mono font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded">
                  {t.editorial.epubVersionBadge}
                </span>
              </div>
              <h4 className="text-sm font-bold text-[#081629]">Reflowable Digital EPUB3</h4>
              <p className="text-2xs text-slate-500">
                Authentic XHTML chapter structure, META-INF/container.xml, nav.xhtml, toc.ncx, and CSS stylesheet.
              </p>
            </div>

            <div className="pt-2">
              <PremiumButton
                variant="gold"
                size="sm"
                disabled={exportingFormat === 'EPUB'}
                onClick={handleExportEPUB}
              >
                {exportingFormat === 'EPUB' ? 'Building EPUB3...' : t.editorial.exportEpubBtn}
              </PremiumButton>
            </div>
          </div>

          {/* DOCX Card */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800">DOCX OOXML</span>
                <span className="text-3xs font-mono font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded">
                  {t.editorial.docxSchemaBadge}
                </span>
              </div>
              <h4 className="text-sm font-bold text-[#081629]">Microsoft Word Document</h4>
              <p className="text-2xs text-slate-500">
                Genuine WordprocessingML archive with heading styles, paragraph runs, and page breaks.
              </p>
            </div>

            <div className="pt-2">
              <PremiumButton
                variant="outline"
                size="sm"
                disabled={exportingFormat === 'DOCX'}
                onClick={handleExportDOCX}
              >
                {exportingFormat === 'DOCX' ? 'Building DOCX...' : t.editorial.exportDocxBtn}
              </PremiumButton>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-2xs text-slate-500 font-mono italic">
          * {t.editorial.pressReadyNotice}
        </div>
      </div>

      {/* Compiled Export Records & Hashes */}
      {lastResults.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-4 shadow-2xs">
          <h4 className="text-sm font-bold text-[#081629]">Generated Export Hashes & Verifications</h4>
          <div className="space-y-3">
            {lastResults.map((res, i) => (
              <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-2xs font-mono space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#081629]">{res.fileName} ({res.format})</span>
                  <span className="text-slate-400">{(res.fileSizeBytes / 1024).toFixed(1)} KB</span>
                </div>
                <div className="text-slate-600 truncate">SHA-256: {res.sha256}</div>
                <div className="text-slate-400">Generated At: {res.generatedAt}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
