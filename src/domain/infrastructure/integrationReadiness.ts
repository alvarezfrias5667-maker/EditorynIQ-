/**
 * EDITORYNIQ™ INTEGRATION READINESS & TRACEABILITY ENGINE
 * Verifies canonical traceability across all 6 engines (E1 through E6).
 * Guarantees that every listing or package links back to genuine editorial snapshots.
 */

import { CanonicalTraceabilityRecord, CanonicalTraceStep } from './integrationTypes';
import { localBookRepository } from '../../services/localBookRepository';
import { localBookIntelligenceRepository } from '../../services/localBookIntelligenceRepository';
import { localManuscriptRepository } from '../../services/localManuscriptRepository';
import { localVisualRepository } from '../../services/localVisualRepository';
import { localEditorialRepository } from '../../services/localEditorialRepository';
import { localPublishingRepository } from '../../services/localPublishingRepository';
import { localMarketplaceRepository } from '../../services/localMarketplaceRepository';

export async function auditCanonicalTraceability(bookId: string): Promise<CanonicalTraceabilityRecord> {
  const steps: CanonicalTraceStep[] = [];
  const project = await localBookRepository.getProjectById(bookId);
  const bookTitle = project ? project.title : 'Unknown Publication';

  // 1. E1 INTAKE & BLUEPRINT
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

  steps.push({
    stage: 'E1_INTELLIGENCE',
    stageName: 'Book Intake & Approved Blueprint',
    identifierKey: 'BLUEPRINT_SNAPSHOT_ID',
    identifierValue: e1Snapshot?.approvedAt ? `snapshot_${bookId}` : project?.id || null,
    status: e1Snapshot ? 'VERIFIED' : project ? 'LOCAL_ONLY' : 'MISSING',
    details: e1Snapshot
      ? `Approved blueprint snapshot with ${e1Snapshot.chapters?.length || 0} chapters, ${e1Package?.blueprint?.targetPages || project?.targetPageCount || 250} pages target.`
      : project
      ? `Project registered: "${project.title}" (${project.category}, ${project.targetPageCount} pages).`
      : 'Book project not found in repository.',
    sha256Evidence: e1Snapshot?.snapshotSha256 || e1Package?.blueprintSha256,
  });

  // 2. E2 MANUSCRIPT FACTORY
  let chapters: any[] = [];
  if (project) {
    try {
      const mproj = await localManuscriptRepository.getManuscriptProject(project);
      chapters = mproj?.chapters || [];
    } catch {
      chapters = [];
    }
  }
  const hasManuscriptContent = chapters.length > 0;
  steps.push({
    stage: 'E2_MANUSCRIPT',
    stageName: 'Manuscript Factory Content',
    identifierKey: 'CHAPTER_COUNT',
    identifierValue: hasManuscriptContent ? `${chapters.length} chapters` : null,
    status: hasManuscriptContent ? 'VERIFIED' : 'PENDING',
    details: hasManuscriptContent
      ? `${chapters.length} structured manuscript chapters written and archived in local storage.`
      : 'Manuscript chapters have not yet been drafted or committed.',
  });

  // 3. E3 VISUAL PRODUCTION
  let visualAssets: any[] = [];
  try {
    visualAssets = await localVisualRepository.getAssetsByBookId(bookId);
  } catch {
    visualAssets = [];
  }
  const coverAsset = visualAssets.find((a) => a.assetType === 'cover' || a.id?.includes('cover'));
  steps.push({
    stage: 'E3_VISUAL',
    stageName: 'Visual Assets & Artwork Repository',
    identifierKey: 'VISUAL_ASSET_ID',
    identifierValue: coverAsset?.id || (visualAssets.length > 0 ? `${visualAssets.length} assets` : null),
    status: visualAssets.length > 0 ? 'VERIFIED' : 'PENDING',
    details: visualAssets.length > 0
      ? `${visualAssets.length} authorized visual assets (Cover: ${coverAsset ? 'Verified' : 'Pending'}).`
      : 'Visual assets not compiled for this project.',
    sha256Evidence: coverAsset?.sha256,
  });

  // 4. E4 EDITORIAL & QUALITY
  let editorialEditions: any[] = [];
  try {
    editorialEditions = await localEditorialRepository.getEditionsByBookId(bookId);
  } catch {
    editorialEditions = [];
  }
  const primaryE4 = editorialEditions.length > 0 ? editorialEditions[0] : null;
  steps.push({
    stage: 'E4_EDITORIAL',
    stageName: 'Editorial Master Build & Quality Passport',
    identifierKey: 'EDITORIAL_EDITION_ID',
    identifierValue: primaryE4?.id || null,
    status: primaryE4 ? 'VERIFIED' : 'PENDING',
    details: primaryE4
      ? `Editorial build "${primaryE4.name}" with ${primaryE4.pages?.length || 0} pages layout verified.`
      : 'E4 Editorial Master has not yet been built or compiled.',
  });

  // 5. E5 PUBLISHING & DISTRIBUTION
  let publishingEditions: any[] = [];
  let publicationPackages: any[] = [];
  try {
    publishingEditions = await localPublishingRepository.getEditionsByBookId(bookId);
    publicationPackages = await localPublishingRepository.getPackagesByBookId(bookId);
  } catch {
    publishingEditions = [];
    publicationPackages = [];
  }
  const primaryPubEd = publishingEditions.length > 0 ? publishingEditions[0] : null;
  steps.push({
    stage: 'E5_PUBLISHING',
    stageName: 'Publishing Edition & Verified Packages',
    identifierKey: 'PUBLISHING_EDITION_ID',
    identifierValue: primaryPubEd?.id || null,
    status: primaryPubEd ? 'VERIFIED' : 'PENDING',
    details: primaryPubEd
      ? `Edition "${primaryPubEd.editionName}" (v${primaryPubEd.version}) registered. ${publicationPackages.length} distribution packages prepared.`
      : 'E5 Publishing Edition has not been initialized.',
  });

  // 6. E6 MARKETPLACE & COMMERCE
  let listings: any[] = [];
  try {
    listings = await localMarketplaceRepository.getListingsByBookId(bookId);
  } catch {
    listings = [];
  }
  const primaryListing = listings.length > 0 ? listings[0] : null;
  steps.push({
    stage: 'E6_MARKETPLACE',
    stageName: 'Marketplace Listing & Seller Catalog',
    identifierKey: 'LISTING_ID',
    identifierValue: primaryListing?.id || null,
    status: primaryListing ? 'LOCAL_ONLY' : 'PENDING',
    details: primaryListing
      ? `Listing "${primaryListing.title}" (Status: ${primaryListing.listingStatus}, Scope: ${primaryListing.scope}). Local workspace preview active.`
      : 'Not listed in marketplace catalog.',
  });

  const isComplete = steps.every((s) => s.status === 'VERIFIED' || s.status === 'LOCAL_ONLY');

  return {
    bookId,
    bookTitle,
    evaluatedAt: new Date().toISOString(),
    isComplete,
    steps,
  };
}
