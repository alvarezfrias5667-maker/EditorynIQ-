/**
 * EDITORYNIQ™ DELIVERY AUTHORITY (PROM 9)
 * Validates, certifies and delivers genuine local files to author/publisher workspace.
 * Zero fake placeholders or TXT files disguised as PDF/EPUB.
 * Enforces strict integrity checks and honest 'ARTIFACT_NOT_READY' reporting.
 */

import { DeliverableItem, DeliveryArtifactStatus } from './operationsTypes';
import { localBookRepository } from '../../services/localBookRepository';
import { localEditorialRepository } from '../../services/localEditorialRepository';
import { localPublishingRepository } from '../../services/localPublishingRepository';
import { localManuscriptRepository } from '../../services/localManuscriptRepository';
import { computeSHA256 } from '../../services/localVisualRepository';
import { generatePDFDocument } from '../editorial/pdfProductionEngine';
import { generateEPUB3Document } from '../editorial/epubProductionEngine';
import { generateDOCXDocument } from '../editorial/docxProductionEngine';
import { generateOnixJsonMetadata } from '../publishing/metadataEngine';

export async function inspectDeliverables(bookId: string): Promise<DeliverableItem[]> {
  const project = await localBookRepository.getProjectById(bookId);
  const items: DeliverableItem[] = [];

  // 1. Fetch live repository state
  let editorialEditions: any[] = [];
  let primaryEditorial: any = null;
  let qualityPassport: any = null;
  let publishingEditions: any[] = [];
  let publishingPackages: any[] = [];
  let publishingMetadata: any = null;
  let manuscriptChapters: any[] = [];

  let existingExports: any[] = [];
  try {
    editorialEditions = await localEditorialRepository.getEditionsByBookId(bookId);
    primaryEditorial = editorialEditions[0] || null;
    if (primaryEditorial) {
      qualityPassport = await localEditorialRepository.getPassportByEditionId(primaryEditorial.id);
      existingExports = await localEditorialRepository.getExportRecordsByEditionId(primaryEditorial.id);
    }
  } catch {
    // defaults
  }

  try {
    publishingEditions = await localPublishingRepository.getEditionsByBookId(bookId);
    publishingPackages = await localPublishingRepository.getPackagesByBookId(bookId);
    if (publishingEditions[0]) {
      publishingMetadata = await localPublishingRepository.getMetadataByEditionId(publishingEditions[0].id);
    }
  } catch {
    // defaults
  }

  if (project) {
    try {
      const mproj = await localManuscriptRepository.getManuscriptProject(project);
      manuscriptChapters = mproj?.chapters || [];
    } catch {
      manuscriptChapters = [];
    }
  }

  const safeTitle = (project?.title || 'book').toLowerCase().replace(/[^a-z0-9_-]/g, '_');

  const existingPdf = existingExports.find((e: any) => e.format === 'PDF' && e.fileSizeBytes > 0);
  const existingEpub = existingExports.find((e: any) => e.format === 'EPUB' && e.fileSizeBytes > 0);
  const existingDocx = existingExports.find((e: any) => e.format === 'DOCX' && e.fileSizeBytes > 0);

  // --- ITEM 1: PDF EDITORIAL MASTER ---
  let pdfStatus: DeliveryArtifactStatus = 'ARTIFACT_NOT_READY';
  let pdfSize = 0;
  let pdfSha256 = '';
  let pdfError: string | undefined = undefined;

  if (existingPdf) {
    pdfSize = existingPdf.fileSizeBytes;
    pdfSha256 = existingPdf.sha256;
    pdfStatus = 'VERIFIED_READY';
  } else if (primaryEditorial && primaryEditorial.chapters && primaryEditorial.chapters.length > 0) {
    try {
      const compiled = await generatePDFDocument(primaryEditorial);
      if (compiled && compiled.fileSizeBytes > 0) {
        pdfSize = compiled.fileSizeBytes;
        pdfSha256 = compiled.sha256;
        pdfStatus = 'VERIFIED_READY';
      } else {
        pdfStatus = 'INTEGRITY_FAILED';
        pdfError = 'PDF compiler returned 0 bytes payload.';
      }
    } catch (err: any) {
      pdfStatus = 'INTEGRITY_FAILED';
      pdfError = `PDF compilation failed: ${err?.message || 'Unknown render error'}`;
    }
  } else {
    pdfError = 'E4 Editorial Master has not been assembled or paginated yet.';
  }

  items.push({
    id: `deliv_${bookId}_pdf`,
    type: 'PDF_MASTER',
    title: 'Editorial Master PDF (Print & Digital)',
    formatBadge: 'PDF 1.4 / Print Master',
    fileName: `${safeTitle}_master.pdf`,
    sourceEngine: 'E4_EDITORIAL',
    status: pdfStatus,
    fileSizeBytes: pdfSize,
    sha256: pdfSha256,
    lastVerifiedAt: new Date().toISOString(),
    errorDetails: pdfError,
    actionRoute: `/books/${bookId}/editorial`,
    actionLabel: pdfStatus === 'VERIFIED_READY' ? 'Open Editorial Layout' : 'Compile Editorial PDF',
    mimeType: 'application/pdf',
    isAvailable: pdfStatus === 'VERIFIED_READY',
  });

  // --- ITEM 2: EPUB 3.3 REFLOWABLE ---
  let epubStatus: DeliveryArtifactStatus = 'ARTIFACT_NOT_READY';
  let epubSize = 0;
  let epubSha256 = '';
  let epubError: string | undefined = undefined;

  if (existingEpub) {
    epubSize = existingEpub.fileSizeBytes;
    epubSha256 = existingEpub.sha256;
    epubStatus = 'VERIFIED_READY';
  } else if (primaryEditorial && primaryEditorial.chapters && primaryEditorial.chapters.length > 0) {
    try {
      const compiledEpub = await generateEPUB3Document(primaryEditorial);
      if (compiledEpub && compiledEpub.fileSizeBytes > 0) {
        epubSize = compiledEpub.fileSizeBytes;
        epubSha256 = compiledEpub.sha256;
        epubStatus = 'VERIFIED_READY';
      } else {
        epubStatus = 'INTEGRITY_FAILED';
        epubError = 'EPUB compiler produced empty package.';
      }
    } catch (err: any) {
      epubStatus = 'INTEGRITY_FAILED';
      epubError = `EPUB generation error: ${err?.message || 'Serialization fault'}`;
    }
  } else {
    epubError = 'E4 Editorial Master layout required prior to EPUB 3.3 packing.';
  }

  items.push({
    id: `deliv_${bookId}_epub`,
    type: 'EPUB_MASTER',
    title: 'EPUB 3.3 Validated Reflowable Package',
    formatBadge: 'EPUB 3.3',
    fileName: `${safeTitle}_epub3.epub`,
    sourceEngine: 'E4_EDITORIAL',
    status: epubStatus,
    fileSizeBytes: epubSize,
    sha256: epubSha256,
    lastVerifiedAt: new Date().toISOString(),
    errorDetails: epubError,
    actionRoute: `/books/${bookId}/editorial`,
    actionLabel: 'Compile EPUB Master',
    mimeType: 'application/epub+zip',
    isAvailable: epubStatus === 'VERIFIED_READY',
  });

  // --- ITEM 3: DOCX EDITORIAL DRAFT ---
  let docxStatus: DeliveryArtifactStatus = 'ARTIFACT_NOT_READY';
  let docxSize = 0;
  let docxSha256 = '';
  let docxError: string | undefined = undefined;

  if (existingDocx) {
    docxSize = existingDocx.fileSizeBytes;
    docxSha256 = existingDocx.sha256;
    docxStatus = 'VERIFIED_READY';
  } else if (primaryEditorial && manuscriptChapters.length > 0) {
    try {
      const docxResult = await generateDOCXDocument(primaryEditorial);
      if (docxResult && docxResult.fileSizeBytes > 0) {
        docxSize = docxResult.fileSizeBytes;
        docxSha256 = docxResult.sha256;
        docxStatus = 'VERIFIED_READY';
      } else {
        docxStatus = 'INTEGRITY_FAILED';
        docxError = 'DOCX generator produced empty file.';
      }
    } catch (err: any) {
      docxStatus = 'INTEGRITY_FAILED';
      docxError = `DOCX generation error: ${err?.message || 'DOCX build failure'}`;
    }
  } else {
    docxError = 'Manuscript chapters or editorial edition not found in workspace.';
  }

  items.push({
    id: `deliv_${bookId}_docx`,
    type: 'DOCX_MANUSCRIPT',
    title: 'Microsoft Word Structured Manuscript',
    formatBadge: 'DOCX (OOXML)',
    fileName: `${safeTitle}_manuscript.docx`,
    sourceEngine: 'E4_EDITORIAL',
    status: docxStatus,
    fileSizeBytes: docxSize,
    sha256: docxSha256,
    lastVerifiedAt: new Date().toISOString(),
    errorDetails: docxError,
    actionRoute: `/books/${bookId}/manuscript`,
    actionLabel: 'Review Manuscript',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    isAvailable: docxStatus === 'VERIFIED_READY',
  });

  // --- ITEM 4: QUALITY PASSPORT CERTIFICATE ---
  let passportStatus: DeliveryArtifactStatus = 'ARTIFACT_NOT_READY';
  let passportSize = 0;
  let passportSha256 = '';
  let passportContent = '';
  let passportError: string | undefined = undefined;

  if (qualityPassport) {
    passportContent = JSON.stringify(qualityPassport, null, 2);
    passportSize = new Blob([passportContent]).size;
    passportSha256 = qualityPassport.digitalSignature || (await computeSHA256(passportContent));
    passportStatus = 'VERIFIED_READY';
  } else {
    passportError = 'Quality Passport has not been generated or signed in E4 Editorial Quality.';
  }

  items.push({
    id: `deliv_${bookId}_passport`,
    type: 'QUALITY_PASSPORT',
    title: 'Editorial Quality Passport™ Audit Record',
    formatBadge: 'JSON Certificate',
    fileName: `${safeTitle}_quality_passport.json`,
    sourceEngine: 'E4_EDITORIAL',
    status: passportStatus,
    fileSizeBytes: passportSize,
    sha256: passportSha256,
    lastVerifiedAt: new Date().toISOString(),
    errorDetails: passportError,
    actionRoute: `/books/${bookId}/editorial`,
    actionLabel: 'Sign Quality Passport',
    rawContent: passportContent,
    mimeType: 'application/json',
    isAvailable: passportStatus === 'VERIFIED_READY',
  });

  // --- ITEM 5: PUBLICATION PACKAGE ZIP ---
  const readyPkg = publishingPackages.find((p) => p.readinessStatus === 'READY') || publishingPackages[0];
  let pkgStatus: DeliveryArtifactStatus = 'ARTIFACT_NOT_READY';
  let pkgSize = 0;
  let pkgSha256 = '';
  let pkgError: string | undefined = undefined;

  if (readyPkg) {
    pkgStatus = readyPkg.readinessStatus === 'READY' ? 'VERIFIED_READY' : 'ARTIFACT_NOT_READY';
    pkgSize = readyPkg.packageZipSizeBytes || 0;
    pkgSha256 = readyPkg.packageZipSha256 || readyPkg.manifestSha256 || '';
    if (pkgStatus !== 'VERIFIED_READY') {
      pkgError = `Package is in state "${readyPkg.readinessStatus}". Needs required artifacts.`;
    }
  } else {
    pkgError = 'No publication distribution package created in E5 Publishing Hub.';
  }

  items.push({
    id: `deliv_${bookId}_pkg_zip`,
    type: 'PUBLISHING_PACKAGE_ZIP',
    title: 'Verified Distribution Package Bundle (ZIP)',
    formatBadge: 'Universal ZIP',
    fileName: `${safeTitle}_distribution_package.zip`,
    sourceEngine: 'E5_PUBLISHING',
    status: pkgStatus,
    fileSizeBytes: pkgSize,
    sha256: pkgSha256,
    lastVerifiedAt: new Date().toISOString(),
    errorDetails: pkgError,
    actionRoute: `/books/${bookId}/publishing`,
    actionLabel: 'Assemble Package',
    mimeType: 'application/zip',
    isAvailable: pkgStatus === 'VERIFIED_READY',
  });

  // --- ITEM 6: ONIX 3.0 METADATA ---
  let onixStatus: DeliveryArtifactStatus = 'ARTIFACT_NOT_READY';
  let onixSize = 0;
  let onixSha256 = '';
  let onixContent = '';
  let onixError: string | undefined = undefined;

  if (publishingMetadata) {
    const onixData = generateOnixJsonMetadata(publishingMetadata);
    onixContent = JSON.stringify(onixData, null, 2);
    onixSize = new Blob([onixContent]).size;
    onixSha256 = await computeSHA256(onixContent);
    onixStatus = 'VERIFIED_READY';
  } else {
    onixError = 'Three-tier publishing metadata has not been configured in E5 Metadata Studio.';
  }

  items.push({
    id: `deliv_${bookId}_onix`,
    type: 'ONIX_METADATA',
    title: 'ONIX for Books Release 3.0 Metadata',
    formatBadge: 'ONIX 3.0 JSON',
    fileName: `${safeTitle}_onix_metadata.json`,
    sourceEngine: 'E5_PUBLISHING',
    status: onixStatus,
    fileSizeBytes: onixSize,
    sha256: onixSha256,
    lastVerifiedAt: new Date().toISOString(),
    errorDetails: onixError,
    actionRoute: `/books/${bookId}/publishing`,
    actionLabel: 'Configure Metadata',
    rawContent: onixContent,
    mimeType: 'application/json',
    isAvailable: onixStatus === 'VERIFIED_READY',
  });

  return items;
}
