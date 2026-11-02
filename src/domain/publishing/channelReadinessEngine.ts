import {
  ReadinessEvaluation,
  ReadinessDimension,
  DimensionStatus,
  ReadinessCheckItem,
  ChannelId,
  EditionRecord,
  PublicationMetadataRecord,
  VerifiedArtifact,
} from './publishingTypes';
import { DISTRIBUTION_CHANNELS } from './channelRequirements';

/**
 * Evaluates readiness across 5 independent dimensions:
 * 1. METADATA
 * 2. EDITION
 * 3. RIGHTS
 * 4. ARTIFACTS
 * 5. CHANNEL_COMPATIBILITY
 */
export function evaluateChannelReadiness(
  channelId: ChannelId | 'universal',
  edition: EditionRecord,
  metadata: PublicationMetadataRecord,
  artifacts: VerifiedArtifact[]
): ReadinessEvaluation {
  const channel = channelId !== 'universal' ? DISTRIBUTION_CHANNELS[channelId] : null;

  // 1. METADATA CHECKS
  const metadataChecks: ReadinessCheckItem[] = [
    {
      id: 'meta_title',
      label: 'Book Title & Subtitle Defined',
      passed: Boolean(metadata.canonical.title && metadata.canonical.title.trim().length > 0),
      details: metadata.canonical.title ? `Title: "${metadata.canonical.title}"` : 'Book title is missing.',
    },
    {
      id: 'meta_author',
      label: 'Author / Contributor Name Registered',
      passed: Boolean(metadata.canonical.author && metadata.canonical.author.trim().length > 0),
      details: metadata.canonical.author ? `Author: ${metadata.canonical.author}` : 'Author name is missing.',
    },
    {
      id: 'meta_synopsis',
      label: 'Publication Synopsis & Description (>= 50 chars)',
      passed: Boolean(metadata.edition.synopsis && metadata.edition.synopsis.trim().length >= 50),
      details:
        metadata.edition.synopsis && metadata.edition.synopsis.length >= 50
          ? `${metadata.edition.synopsis.length} characters description registered.`
          : 'Synopsis is too brief or missing (minimum 50 characters required for distribution).',
    },
    {
      id: 'meta_bisac',
      label: 'BISAC / Thema Subject Category Assigned',
      passed: metadata.edition.bisacCategories.length > 0,
      details:
        metadata.edition.bisacCategories.length > 0
          ? `Assigned: ${metadata.edition.bisacCategories[0]}`
          : 'No BISAC category assigned.',
    },
  ];

  // 2. EDITION CHECKS
  const editionChecks: ReadinessCheckItem[] = [
    {
      id: 'ed_name',
      label: 'Edition Name & Version Specified',
      passed: Boolean(edition.editionName && edition.version),
      details: `${edition.editionName} (v${edition.version})`,
    },
    {
      id: 'ed_lang',
      label: 'Production Language Validated (EN/ES)',
      passed: ['en', 'es'].includes(edition.productionLanguage),
      details: `Language: ${edition.productionLanguage.toUpperCase()}`,
    },
    {
      id: 'ed_imprint',
      label: 'Publisher Imprint Identified',
      passed: Boolean(edition.publisherImprint && edition.publisherImprint.trim().length > 0),
      details: `Imprint: ${edition.publisherImprint}`,
    },
    {
      id: 'ed_formats',
      label: 'Target Formats Selected',
      passed: edition.formats.length > 0,
      details: `Formats: ${edition.formats.join(', ')}`,
    },
  ];

  // 3. RIGHTS CHECKS
  const rightsChecks: ReadinessCheckItem[] = [
    {
      id: 'rights_declaration',
      label: 'Material Rights Status Declared',
      passed: edition.rightsStatus !== 'UNVERIFIED',
      details:
        edition.rightsStatus !== 'UNVERIFIED'
          ? `Status: ${edition.rightsStatus}`
          : 'Material rights are currently unverified.',
    },
    {
      id: 'rights_evidence',
      label: 'Documented Provenance / Evidence Notes',
      passed: Boolean(edition.rightsEvidence && edition.rightsEvidence.trim().length > 10),
      details:
        edition.rightsEvidence && edition.rightsEvidence.length > 10
          ? 'Provenance documentation recorded.'
          : 'Documentation notes are required to clarify authorship or licensing.',
    },
    {
      id: 'rights_territory',
      label: 'Territorial Scope Defined',
      passed: Boolean(edition.territoryScope),
      details: `Scope: ${edition.territoryScope}`,
    },
  ];

  // 4. ARTIFACTS CHECKS
  const pdfArtifact = artifacts.find((a) => a.type === 'PDF' && a.isAvailable);
  const epubArtifact = artifacts.find((a) => a.type === 'EPUB' && a.isAvailable);
  const docxArtifact = artifacts.find((a) => a.type === 'DOCX' && a.isAvailable);
  const passportArtifact = artifacts.find((a) => a.type === 'QUALITY_PASSPORT' && a.isAvailable);

  const artifactChecks: ReadinessCheckItem[] = [
    {
      id: 'art_pdf',
      label: 'Authentic PDF Master Compiled (E4)',
      passed: Boolean(pdfArtifact),
      details: pdfArtifact
        ? `${pdfArtifact.fileName} (${(pdfArtifact.fileSizeBytes / 1024).toFixed(1)} KB, SHA: ${pdfArtifact.sha256.substring(0, 10)}...)`
        : 'PDF Master has not been compiled yet in E4 Editorial Hub.',
    },
    {
      id: 'art_epub',
      label: 'EPUB 3.3 Digital Package Compiled (E4)',
      passed: Boolean(epubArtifact),
      details: epubArtifact
        ? `${epubArtifact.fileName} (${(epubArtifact.fileSizeBytes / 1024).toFixed(1)} KB, SHA: ${epubArtifact.sha256.substring(0, 10)}...)`
        : 'EPUB 3.3 package has not been compiled yet in E4 Editorial Hub.',
    },
    {
      id: 'art_passport',
      label: 'Book Quality Passport Signed (E4)',
      passed: Boolean(passportArtifact),
      details: passportArtifact
        ? `Quality Passport recorded with signature ${passportArtifact.sha256.substring(0, 10)}...`
        : 'Quality Passport not signed or compiled yet in E4.',
    },
    {
      id: 'art_docx',
      label: 'OOXML DOCX Archive Compiled (E4)',
      passed: Boolean(docxArtifact),
      details: docxArtifact
        ? `${docxArtifact.fileName} (${(docxArtifact.fileSizeBytes / 1024).toFixed(1)} KB)`
        : 'Optional DOCX archive not compiled.',
    },
  ];

  // 5. CHANNEL COMPATIBILITY CHECKS
  const channelChecks: ReadinessCheckItem[] = [];

  if (channel) {
    // Check format compatibility
    const hasRequiredFormat = channel.supportedFormats.some((fmt) =>
      artifacts.some((a) => a.type === fmt && a.isAvailable)
    );
    channelChecks.push({
      id: 'chan_formats',
      label: `Channel Supported Formats (${channel.supportedFormats.join(', ')}) Available`,
      passed: hasRequiredFormat,
      details: hasRequiredFormat
        ? 'At least one supported format is verified.'
        : `Requires at least one of: ${channel.supportedFormats.join(', ')}.`,
    });

    // Check ISBN requirement
    if (channel.isbnRequirement === 'MANDATORY') {
      const isIsbnValid = edition.isbnStatus === 'VALID_ISBN13';
      channelChecks.push({
        id: 'chan_isbn_mand',
        label: 'Mandatory Author-Owned ISBN-13 Validated',
        passed: isIsbnValid,
        details: isIsbnValid
          ? `Verified ISBN-13: ${edition.isbn13}`
          : 'This channel requires a registered 13-digit ISBN. Unassigned or invalid ISBN is not accepted.',
      });
    } else {
      channelChecks.push({
        id: 'chan_isbn_opt',
        label: 'ISBN Specification Met (Optional / Channel Assigned)',
        passed: true,
        details:
          edition.isbnStatus === 'VALID_ISBN13'
            ? `Author-owned ISBN-13 provided: ${edition.isbn13}`
            : 'Channel can assign an internal ASIN/identifier or allow direct distribution.',
      });
    }
  } else {
    // Universal check
    channelChecks.push({
      id: 'chan_universal',
      label: 'Universal Export Package Requirements',
      passed: Boolean(pdfArtifact || epubArtifact),
      details:
        pdfArtifact || epubArtifact
          ? 'Core digital/print assets available for universal publication package.'
          : 'At least one master format (PDF or EPUB) required.',
    });
  }

  // Calculate scores and dimension statuses
  const calculateDimension = (checks: ReadinessCheckItem[]) => {
    const passed = checks.filter((c) => c.passed).length;
    const total = checks.length;
    const score = Math.round((passed / total) * 100);
    let status: DimensionStatus = 'READY';
    if (score < 50) {
      status = 'BLOCKED_DEPENDENCY';
    } else if (score < 100) {
      status = 'NEEDS_ATTENTION';
    }
    return { status, score, checks };
  };

  const dimensions: Record<ReadinessDimension, { status: DimensionStatus; score: number; checks: ReadinessCheckItem[] }> = {
    METADATA: calculateDimension(metadataChecks),
    EDITION: calculateDimension(editionChecks),
    RIGHTS: calculateDimension(rightsChecks),
    ARTIFACTS: calculateDimension(artifactChecks),
    CHANNEL_COMPATIBILITY: calculateDimension(channelChecks),
  };

  const dimValues = Object.values(dimensions);
  const overallScore = Math.round(dimValues.reduce((sum, d) => sum + d.score, 0) / dimValues.length);

  let overallStatus: DimensionStatus = 'READY';
  if (dimValues.some((d) => d.status === 'BLOCKED_DEPENDENCY')) {
    overallStatus = 'BLOCKED_DEPENDENCY';
  } else if (dimValues.some((d) => d.status === 'NEEDS_ATTENTION')) {
    overallStatus = 'NEEDS_ATTENTION';
  }

  return {
    overallStatus,
    overallScore,
    channelId,
    dimensions,
  };
}
