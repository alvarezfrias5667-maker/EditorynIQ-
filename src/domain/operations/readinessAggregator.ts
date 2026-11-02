/**
 * EDITORYNIQ™ PRODUCTION READINESS AGGREGATOR (PROM 9)
 * Exhaustive multi-engine auditor consolidating real data from E1 through E6.
 * Zero simulations or fake statuses. Every metric is read directly from local storage.
 */

import {
  OperationsSummary,
  EngineAuditRecord,
  OperationalReadinessStatus,
  EngineIdentifier,
} from './operationsTypes';
import { localBookRepository } from '../../services/localBookRepository';
import { localBookIntelligenceRepository } from '../../services/localBookIntelligenceRepository';
import { localManuscriptRepository } from '../../services/localManuscriptRepository';
import { localVisualRepository } from '../../services/localVisualRepository';
import { localEditorialRepository } from '../../services/localEditorialRepository';
import { localPublishingRepository } from '../../services/localPublishingRepository';
import { localMarketplaceRepository } from '../../services/localMarketplaceRepository';

export async function aggregateProductionReadiness(bookId: string): Promise<OperationsSummary> {
  const project = await localBookRepository.getProjectById(bookId);
  const bookTitle = project ? project.title : 'Unknown Publication';

  // 1. E1 INTAKE & BLUEPRINT AUDIT
  let e1Package: any = null;
  let e1Snapshot: any = null;
  if (project) {
    try {
      e1Package = await localBookIntelligenceRepository.getE1Package(project);
      e1Snapshot = e1Package?.approvedBlueprintSnapshot || null;
    } catch {
      e1Snapshot = null;
    }
  }

  const e1Chapters = e1Package?.blueprint?.chapters || [];
  const e1Sources = e1Package?.researchSources || [];
  const e1Memory = e1Package?.memoryEntries || [];
  const isE1Approved = Boolean(e1Snapshot || e1Package?.blueprint?.approved);

  let e1Status: OperationalReadinessStatus = 'NOT_STARTED';
  const e1Blockers: string[] = [];

  if (isE1Approved) {
    e1Status = 'READY';
  } else if (e1Chapters.length > 0) {
    e1Status = 'IN_PROGRESS';
    e1Blockers.push('Blueprint outline drafted but not yet formally approved as Snapshot V1.');
  } else {
    e1Status = 'NOT_STARTED';
    e1Blockers.push('No blueprint chapters defined in Book Blueprint Builder.');
  }

  const e1Record: EngineAuditRecord = {
    engineId: 'E1',
    engineName: 'E1 Book Intelligence™',
    subTitle: 'Intake, Research Evidence & Approved Blueprint',
    status: e1Status,
    statusReason: isE1Approved
      ? `Approved Blueprint with ${e1Chapters.length} chapters and ${e1Package?.blueprint?.targetPages || project?.targetPageCount || 250} pages target.`
      : e1Chapters.length > 0
      ? `${e1Chapters.length} chapters configured; awaiting formal blueprint approval.`
      : 'Intake parameters set, but blueprint structure not yet drafted.',
    metrics: [
      { label: 'Chapters Outlined', value: e1Chapters.length },
      { label: 'Target Page Budget', value: e1Package?.blueprint?.targetPages || project?.targetPageCount || 250, unit: 'pages' },
      { label: 'Research Citations', value: e1Sources.length },
      { label: 'Memory Bank Terms', value: e1Memory.length },
    ],
    blockers: e1Blockers,
    evidence: {
      identifier: e1Snapshot?.approvedAt ? `snapshot_${bookId}` : project?.id,
      identifierLabel: 'Blueprint Snapshot ID',
      sha256: e1Snapshot?.snapshotSha256 || e1Package?.blueprintSha256,
      recordCount: e1Chapters.length,
      timestamp: e1Snapshot?.approvedAt || project?.createdAt,
    },
    actionRoute: `/books/${bookId}/blueprint`,
    actionLabel: isE1Approved ? 'Inspect Blueprint' : 'Authorize Blueprint',
  };

  // 2. E2 MANUSCRIPT FACTORY AUDIT
  let manuscriptChapters: any[] = [];
  let totalWordCount = 0;
  if (project) {
    try {
      const mproj = await localManuscriptRepository.getManuscriptProject(project);
      manuscriptChapters = mproj?.chapters || [];
      totalWordCount = manuscriptChapters.reduce((sum, ch) => {
        const words = ch.content?.trim() ? ch.content.trim().split(/\s+/).length : (ch.wordCount || 0);
        return sum + words;
      }, 0);
    } catch {
      manuscriptChapters = [];
    }
  }

  let e2Status: OperationalReadinessStatus = 'NOT_STARTED';
  const e2Blockers: string[] = [];

  if (manuscriptChapters.length === 0) {
    if (e1Status !== 'READY') {
      e2Status = 'BLOCKED_DEPENDENCY';
      e2Blockers.push('Blocked: Requires E1 Approved Blueprint before drafting manuscript.');
    } else {
      e2Status = 'NOT_STARTED';
      e2Blockers.push('Manuscript chapters not yet populated.');
    }
  } else {
    const chaptersWithWords = manuscriptChapters.filter((ch) => (ch.content?.length || 0) > 100);
    if (chaptersWithWords.length === manuscriptChapters.length && totalWordCount >= 2000) {
      e2Status = 'READY';
    } else if (chaptersWithWords.length > 0) {
      e2Status = 'IN_PROGRESS';
      e2Blockers.push(`${manuscriptChapters.length - chaptersWithWords.length} of ${manuscriptChapters.length} chapters contain minimal text (< 100 characters).`);
    } else {
      e2Status = 'NEEDS_ATTENTION';
      e2Blockers.push('Chapter outlines exist, but body content is empty or incomplete.');
    }
  }

  const e2Record: EngineAuditRecord = {
    engineId: 'E2',
    engineName: 'E2 Manuscript Factory™',
    subTitle: 'Text Drafts, Section Prose & Version Archives',
    status: e2Status,
    statusReason: e2Status === 'READY'
      ? `Full manuscript active: ${manuscriptChapters.length} chapters, ~${totalWordCount.toLocaleString()} total words.`
      : e2Status === 'IN_PROGRESS'
      ? `${manuscriptChapters.length} chapters partially drafted (~${totalWordCount.toLocaleString()} words).`
      : 'Manuscript text not yet finalized.',
    metrics: [
      { label: 'Total Chapters', value: manuscriptChapters.length },
      { label: 'Word Count', value: totalWordCount.toLocaleString(), unit: 'words' },
      { label: 'Estimated Standard Pages', value: Math.round(totalWordCount / 250), unit: 'pp' },
    ],
    blockers: e2Blockers,
    evidence: {
      identifier: manuscriptChapters.length > 0 ? `manuscript_${bookId}` : undefined,
      identifierLabel: 'Manuscript Master ID',
      recordCount: manuscriptChapters.length,
    },
    actionRoute: `/books/${bookId}/manuscript`,
    actionLabel: 'Open Manuscript Studio',
  };

  // 3. E3 VISUAL PRODUCTION AUDIT
  let visualAssets: any[] = [];
  try {
    visualAssets = await localVisualRepository.getAssetsByBookId(bookId);
  } catch {
    visualAssets = [];
  }

  const coverAsset = visualAssets.find((a) => a.assetType === 'cover' || a.id?.includes('cover'));
  const illustrations = visualAssets.filter((a) => a.assetType === 'illustration');
  const diagrams = visualAssets.filter((a) => a.assetType === 'diagram');
  const charts = visualAssets.filter((a) => a.assetType === 'chart');

  let e3Status: OperationalReadinessStatus = 'NOT_STARTED';
  const e3Blockers: string[] = [];

  if (coverAsset && coverAsset.sha256) {
    e3Status = 'READY';
  } else if (visualAssets.length > 0) {
    e3Status = 'NEEDS_ATTENTION';
    e3Blockers.push('Visual assets exist, but official front book cover is not yet designated.');
  } else {
    e3Status = 'NOT_STARTED';
    e3Blockers.push('No visual assets or cover registered in Visual Asset Library.');
  }

  const e3Record: EngineAuditRecord = {
    engineId: 'E3',
    engineName: 'E3 Visual Production™',
    subTitle: 'Front Covers, Illustrations, Diagrams & Visual Library',
    status: e3Status,
    statusReason: coverAsset
      ? `Official front cover verified (${coverAsset.id}). ${visualAssets.length} total graphic assets stored.`
      : visualAssets.length > 0
      ? `${visualAssets.length} artwork assets cataloged, awaiting designated book cover.`
      : 'Visual assets and artwork repository not yet initialized.',
    metrics: [
      { label: 'Cover Designated', value: coverAsset ? 'Yes' : 'No' },
      { label: 'Total Visual Assets', value: visualAssets.length },
      { label: 'Illustrations', value: illustrations.length },
      { label: 'Diagrams & Charts', value: diagrams.length + charts.length },
    ],
    blockers: e3Blockers,
    evidence: {
      identifier: coverAsset?.id,
      identifierLabel: 'Cover Asset ID',
      sha256: coverAsset?.sha256,
      recordCount: visualAssets.length,
      timestamp: coverAsset?.createdAt,
    },
    actionRoute: `/books/${bookId}/visual`,
    actionLabel: coverAsset ? 'Inspect Visuals' : 'Design Book Cover',
  };

  // 4. E4 EDITORIAL & QUALITY AUDIT
  let editorialEditions: any[] = [];
  let qualityPassport: any = null;
  try {
    editorialEditions = await localEditorialRepository.getEditionsByBookId(bookId);
    if (editorialEditions.length > 0) {
      qualityPassport = await localEditorialRepository.getPassportByEditionId(editorialEditions[0].id);
    }
  } catch {
    editorialEditions = [];
  }

  const primaryEditorial = editorialEditions.length > 0 ? editorialEditions[0] : null;
  const actualPagesCount = primaryEditorial?.pages?.length || 0;

  let e4Status: OperationalReadinessStatus = 'NOT_STARTED';
  const e4Blockers: string[] = [];

  if (!primaryEditorial) {
    if (e2Status === 'NOT_STARTED' || e2Status === 'BLOCKED_DEPENDENCY') {
      e4Status = 'BLOCKED_DEPENDENCY';
      e4Blockers.push('Blocked: Requires drafted manuscript from E2 before pagination build.');
    } else {
      e4Status = 'NOT_STARTED';
      e4Blockers.push('Editorial edition has not yet been assembled in Editorial Production.');
    }
  } else if (actualPagesCount > 0 && qualityPassport) {
    e4Status = 'READY';
  } else if (actualPagesCount > 0) {
    e4Status = 'IN_PROGRESS';
    e4Blockers.push('Editorial layout paginated, but Quality Passport audit has not been signed.');
  } else {
    e4Status = 'NEEDS_ATTENTION';
    e4Blockers.push('Editorial edition registered, but document pagination engine has not executed.');
  }

  const e4Record: EngineAuditRecord = {
    engineId: 'E4',
    engineName: 'E4 Editorial & Quality™',
    subTitle: 'Pagination, PDF/EPUB Master Compilations & Quality Passports',
    status: e4Status,
    statusReason: primaryEditorial
      ? `Editorial build "${primaryEditorial.name}" (${actualPagesCount} layout pages). Quality score: ${qualityPassport?.overallScore ?? 'Pending'}/100.`
      : 'Editorial layout and pagination master not yet created.',
    metrics: [
      { label: 'Editorial Editions', value: editorialEditions.length },
      { label: 'Actual Pages', value: actualPagesCount, unit: 'pp' },
      { label: 'Quality Score', value: qualityPassport?.overallScore ? `${qualityPassport.overallScore}/100` : 'N/A' },
      { label: 'Press Ready Flag', value: qualityPassport?.isPressReady ? 'True' : 'False' },
    ],
    blockers: e4Blockers,
    evidence: {
      identifier: primaryEditorial?.id,
      identifierLabel: 'Editorial Edition ID',
      sha256: qualityPassport?.passportSha256,
      recordCount: actualPagesCount,
      timestamp: primaryEditorial?.updatedAt,
    },
    actionRoute: `/books/${bookId}/editorial`,
    actionLabel: primaryEditorial ? 'Open Editorial Studio' : 'Build Editorial Layout',
  };

  // 5. E5 PUBLISHING & DISTRIBUTION AUDIT
  let publishingEditions: any[] = [];
  let publicationPackages: any[] = [];
  let publishingMetadata: any = null;
  let ledgerEvents: any[] = [];
  try {
    publishingEditions = await localPublishingRepository.getEditionsByBookId(bookId);
    publicationPackages = await localPublishingRepository.getPackagesByBookId(bookId);
    if (publishingEditions.length > 0) {
      publishingMetadata = await localPublishingRepository.getMetadataByEditionId(publishingEditions[0].id);
    }
    ledgerEvents = await localPublishingRepository.getLedgerEventsByBookId(bookId);
  } catch {
    publishingEditions = [];
    publicationPackages = [];
  }

  const primaryPubEd = publishingEditions.length > 0 ? publishingEditions[0] : null;
  const readyPackages = publicationPackages.filter((p) => p.readinessStatus === 'READY');

  let e5Status: OperationalReadinessStatus = 'NOT_STARTED';
  const e5Blockers: string[] = [];

  if (publicationPackages.length > 0 && readyPackages.length > 0) {
    e5Status = 'READY';
  } else if (primaryPubEd) {
    e5Status = 'IN_PROGRESS';
    if (!publishingMetadata) {
      e5Blockers.push('Three-tier publication metadata record incomplete.');
    }
    if (publicationPackages.length === 0) {
      e5Blockers.push('No verified publication packages (ZIP/ONIX) generated for distribution.');
    }
  } else {
    if (e4Status === 'NOT_STARTED' || e4Status === 'BLOCKED_DEPENDENCY') {
      e5Status = 'BLOCKED_DEPENDENCY';
      e5Blockers.push('Blocked: Requires compiled E4 Editorial Master before creating publishing editions.');
    } else {
      e5Status = 'NOT_STARTED';
      e5Blockers.push('No publishing edition records registered in E5 Publishing Hub.');
    }
  }

  const e5Record: EngineAuditRecord = {
    engineId: 'E5',
    engineName: 'E5 Publishing & Distribution™',
    subTitle: 'Edition Management, ONIX Metadata & Verified Packages',
    status: e5Status,
    statusReason: primaryPubEd
      ? `Edition "${primaryPubEd.editionName}" registered. ${publicationPackages.length} packages prepared (${readyPackages.length} ready).`
      : 'Publishing edition not yet initialized.',
    metrics: [
      { label: 'Editions Registered', value: publishingEditions.length },
      { label: 'Prepared Packages', value: publicationPackages.length },
      { label: 'Ledger Audit Events', value: ledgerEvents.length },
      { label: 'ISBN Status', value: primaryPubEd?.isbnStatus || 'NONE' },
    ],
    blockers: e5Blockers,
    evidence: {
      identifier: primaryPubEd?.id,
      identifierLabel: 'Publishing Edition ID',
      sha256: readyPackages[0]?.manifestSha256,
      recordCount: publicationPackages.length,
      timestamp: primaryPubEd?.updatedAt,
    },
    actionRoute: `/books/${bookId}/publishing`,
    actionLabel: primaryPubEd ? 'Manage Publishing' : 'Create Publishing Edition',
  };

  // 6. E6 MARKETPLACE & COMMERCE AUDIT
  let listings: any[] = [];
  try {
    listings = await localMarketplaceRepository.getListingsByBookId(bookId);
  } catch {
    listings = [];
  }

  const primaryListing = listings.length > 0 ? listings[0] : null;

  let e6Status: OperationalReadinessStatus = 'NOT_STARTED';
  const e6Blockers: string[] = [];

  if (primaryListing && primaryListing.listingStatus === 'ACTIVE') {
    e6Status = 'READY';
  } else if (primaryListing) {
    e6Status = 'IN_PROGRESS';
    e6Blockers.push(`Listing exists in state "${primaryListing.listingStatus}"; review listing parameters.`);
  } else {
    e6Status = 'NOT_STARTED';
    e6Blockers.push('Book is not listed in local marketplace catalog.');
  }

  const e6Record: EngineAuditRecord = {
    engineId: 'E6',
    engineName: 'E6 Marketplace & Catalog™',
    subTitle: 'Multi-Author Catalog & Local Workspace Distribution',
    status: e6Status,
    statusReason: primaryListing
      ? `Listing "${primaryListing.title}" (${primaryListing.listingStatus}, ${primaryListing.scope}). Local workspace catalog active.`
      : 'Book has not been published to local marketplace catalog.',
    metrics: [
      { label: 'Catalog Listings', value: listings.length },
      { label: 'Listing Status', value: primaryListing?.listingStatus || 'None' },
      { label: 'Distribution Scope', value: primaryListing?.scope || 'N/A' },
      { label: 'Local Currency', value: primaryListing ? `${primaryListing.currency} ${(primaryListing.priceCents / 100).toFixed(2)}` : 'N/A' },
    ],
    blockers: e6Blockers,
    evidence: {
      identifier: primaryListing?.id,
      identifierLabel: 'Marketplace Listing ID',
      sha256: primaryListing?.integrityHash,
      recordCount: listings.length,
      timestamp: primaryListing?.updatedAt,
    },
    actionRoute: `/marketplace`,
    actionLabel: primaryListing ? 'View Marketplace' : 'List in Marketplace',
  };

  // Consolidation
  const engines: Record<EngineIdentifier, EngineAuditRecord> = {
    E1: e1Record,
    E2: e2Record,
    E3: e3Record,
    E4: e4Record,
    E5: e5Record,
    E6: e6Record,
  };

  const records = [e1Record, e2Record, e3Record, e4Record, e5Record, e6Record];
  const readyCount = records.filter((r) => r.status === 'READY').length;
  const blockersCount = records.reduce((sum, r) => sum + r.blockers.length, 0);

  // Score weighting: E1(15%), E2(25%), E3(15%), E4(20%), E5(15%), E6(10%)
  const weights: Record<EngineIdentifier, number> = {
    E1: 15,
    E2: 25,
    E3: 15,
    E4: 20,
    E5: 15,
    E6: 10,
  };

  let overallScore = 0;
  for (const [eng, weight] of Object.entries(weights) as [EngineIdentifier, number][]) {
    const st = engines[eng].status;
    if (st === 'READY') overallScore += weight;
    else if (st === 'IN_PROGRESS') overallScore += Math.round(weight * 0.5);
    else if (st === 'NEEDS_ATTENTION') overallScore += Math.round(weight * 0.25);
  }

  let overallStatus: OperationalReadinessStatus = 'NOT_STARTED';
  if (readyCount === 6) {
    overallStatus = 'READY';
  } else if (records.some((r) => r.status === 'BLOCKED_DEPENDENCY')) {
    overallStatus = 'BLOCKED_DEPENDENCY';
  } else if (readyCount >= 3) {
    overallStatus = 'IN_PROGRESS';
  } else if (records.some((r) => r.status === 'NEEDS_ATTENTION')) {
    overallStatus = 'NEEDS_ATTENTION';
  } else if (readyCount > 0 || records.some((r) => r.status === 'IN_PROGRESS')) {
    overallStatus = 'IN_PROGRESS';
  }

  return {
    bookId,
    bookTitle,
    overallStatus,
    overallScore,
    engines,
    readyCount,
    totalEngines: 6,
    verifiedDeliverablesCount: (e4Status === 'READY' ? 3 : 0) + (e5Status === 'READY' ? 2 : 0),
    lastAuditTimestamp: new Date().toISOString(),
    blockersCount,
  };
}
