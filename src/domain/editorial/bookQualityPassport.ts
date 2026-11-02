import { BookQualityPassport, EditorialEdition, QualityAuditReport, AccessibilityAuditReport, FormatExportResult } from './editorialTypes';
import { computeSHA256 } from '../../services/localVisualRepository';

export async function generateBookQualityPassport(
  edition: EditorialEdition,
  qualityReport: QualityAuditReport,
  accessibilityReport: AccessibilityAuditReport,
  exports: FormatExportResult[] = [],
  unverifiedRightsAssetsCount = 0
): Promise<BookQualityPassport> {
  const pdfExport = exports.find((e) => e.format === 'PDF');
  const epubExport = exports.find((e) => e.format === 'EPUB');
  const docxExport = exports.find((e) => e.format === 'DOCX');

  const rawSignatureString = `${edition.bookId}_${edition.id}_${qualityReport.evaluatedAt}_${edition.version}_${qualityReport.passed}_${accessibilityReport.score}`;
  const digitalSignature = await computeSHA256(rawSignatureString);

  return {
    passportId: `passport_${edition.id}`,
    bookId: edition.bookId,
    editionId: edition.id,
    bookTitle: edition.editionTitle,
    productionLanguage: edition.productionLanguage,
    generatedAt: new Date().toISOString(),
    sourceBlueprintVersion: 1,
    sourceManuscriptWordCount: edition.pagination.totalWords,
    targetPages: edition.pagination.targetPages,
    actualPages: edition.pagination.actualPdfPages,
    typesettingProfile: edition.typesetting.editorialProfile,
    trimSize: edition.typesetting.trimSize,
    formatHashes: {
      pdfHash: pdfExport?.sha256,
      epubHash: epubExport?.sha256,
      docxHash: docxExport?.sha256,
    },
    qualityScore: qualityReport.passed ? 100 : Math.max(50, 100 - qualityReport.warningCount * 10 - qualityReport.criticalCount * 25),
    accessibilityScore: accessibilityReport.score,
    unverifiedRightsAssetsCount,
    isApprovedForPublishing: edition.isApproved,
    approvedByAuthorAt: edition.approvedAt,
    digitalSignature,
    signatureType: 'SHA256_INTEGRITY_CHECKSUM',
    signatureDisclaimer:
      'Data integrity checksum computed locally via SHA-256. This represents internal immutability verification, not a public-key X.509 cryptographic certificate from a Certificate Authority.',
  };
}
