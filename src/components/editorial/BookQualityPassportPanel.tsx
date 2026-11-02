import React, { useState } from 'react';
import { useI18n } from '../../i18n';
import { BookQualityPassport, EditorialEdition, QualityAuditReport, AccessibilityAuditReport, FormatExportResult } from '../../domain/editorial/editorialTypes';
import { editorialValidationService } from '../../services/editorialValidationService';
import { localVisualRepository } from '../../services/localVisualRepository';
import { approveEdition } from '../../domain/editorial/editionManager';
import { PremiumButton } from '../ui/PremiumButton';

export interface BookQualityPassportPanelProps {
  edition: EditorialEdition;
  qualityReport: QualityAuditReport;
  accessibilityReport: AccessibilityAuditReport;
  exports?: FormatExportResult[];
  onApprovePassport?: (approvedEdition: EditorialEdition) => Promise<boolean>;
}

export const BookQualityPassportPanel: React.FC<BookQualityPassportPanelProps> = ({
  edition,
  qualityReport,
  accessibilityReport,
  exports = [],
  onApprovePassport,
}) => {
  const { t } = useI18n();

  const [passport, setPassport] = useState<BookQualityPassport | null>(null);
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);

  React.useEffect(() => {
    localVisualRepository.getAssetsByBookId(edition.bookId).then((assets) => {
      editorialValidationService
        .compileQualityPassport(edition, exports, assets)
        .then(setPassport);
    });
  }, [edition, exports]);

  const handleApprove = async () => {
    if (!onApprovePassport) return;
    setApproving(true);
    const approved = approveEdition(edition);
    const success = await onApprovePassport(approved);
    setApproving(false);
    if (success) {
      const assets = await localVisualRepository.getAssetsByBookId(approved.bookId);
      const updatedPassport = await editorialValidationService.compileQualityPassport(approved, exports, assets);
      setPassport(updatedPassport);
    }
  };

  const handleExportPassportJson = () => {
    if (!passport) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(passport, null, 2));
    const anchor = document.createElement('a');
    anchor.href = dataStr;
    anchor.download = `editoryniq_${passport.bookId}_quality_passport.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  if (!passport) {
    return <div className="p-8 text-center text-xs text-slate-500">Compiling Quality Passport...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-2xs">
        {/* Header & Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <span className="text-2xs font-mono uppercase text-[#345CFF] font-bold">Official Publication Clearance</span>
            <h3 className="text-lg font-bold text-[#081629] mt-0.5">{t.editorial.passportTitle}</h3>
            <p className="text-xs text-slate-500">{t.editorial.passportSubtitle}</p>
          </div>

          <span
            className={`text-2xs font-bold px-3 py-1 rounded-md font-mono ${
              passport.isApprovedForPublishing
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}
          >
            {passport.isApprovedForPublishing ? t.editorial.approvedStatus : t.editorial.pendingApprovalStatus}
          </span>
        </div>

        {/* Passport Grid Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-slate-50 rounded-xl border border-slate-200/80 text-2xs font-mono space-y-2 text-slate-700">
          <div>
            <div><span className="text-slate-400">Passport ID:</span> {passport.passportId}</div>
            <div><span className="text-slate-400">Book ID:</span> {passport.bookId}</div>
            <div><span className="text-slate-400">Edition Title:</span> {passport.bookTitle}</div>
            <div><span className="text-slate-400">Language:</span> {passport.productionLanguage.toUpperCase()}</div>
            <div><span className="text-slate-400">Author Sign-off:</span> {passport.approvedByAuthorAt ? `Approved at ${new Date(passport.approvedByAuthorAt).toLocaleString()}` : 'Pending Local Sign-off'}</div>
          </div>

          <div>
            <div><span className="text-slate-400">Target vs Actual Pages:</span> {passport.targetPages} / {passport.actualPages} pgs</div>
            <div><span className="text-slate-400">Quality Score:</span> {passport.qualityScore}/100</div>
            <div><span className="text-slate-400">WCAG Score:</span> {passport.accessibilityScore}/100</div>
            <div><span className="text-slate-400">Generated At:</span> {passport.generatedAt}</div>
          </div>
        </div>

        {/* Format File Hashes */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-2xs font-mono">
          <div className="font-bold text-[#081629] uppercase text-3xs tracking-wider">Format SHA-256 Output Hashes</div>
          <div className="grid grid-cols-1 gap-1 text-slate-600">
            <div><span className="font-semibold text-slate-800">PDF Master:</span> {passport.formatHashes.pdfHash || 'Generated on export'}</div>
            <div><span className="font-semibold text-slate-800">EPUB 3.3:</span> {passport.formatHashes.epubHash || 'Generated on export'}</div>
            <div><span className="font-semibold text-slate-800">DOCX OOXML:</span> {passport.formatHashes.docxHash || 'Generated on export'}</div>
          </div>
        </div>

        {/* Digital Signature Box */}
        <div className="p-4 bg-slate-900 text-white rounded-xl space-y-1.5 font-mono text-2xs">
          <div className="text-slate-400 uppercase text-3xs font-bold tracking-wider">SHA-256 Passport Integrity Hash</div>
          <div className="text-[#16C8BA] font-bold break-all">{passport.digitalSignature}</div>
          <div className="text-3xs text-slate-400 italic">
            * Local editorial approval verified via SHA-256 digest immutability. No remote PKI CA certificate claimed.
          </div>
        </div>

        {/* Approval Actions */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
          <PremiumButton variant="outline" size="sm" onClick={handleExportPassportJson}>
            {t.editorial.exportPassportJson}
          </PremiumButton>

          {!passport.isApprovedForPublishing && (
            <PremiumButton variant="gold" size="md" disabled={approving} onClick={handleApprove}>
              {approving ? 'Signing Passport...' : t.editorial.approvePublishingBtn}
            </PremiumButton>
          )}
        </div>
      </div>
    </div>
  );
};
