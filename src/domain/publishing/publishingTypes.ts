export type EditionType =
  | 'FIRST_EDITION'
  | 'REVISED_EDITION'
  | 'SPECIAL_EDITION'
  | 'TRANSLATION_EDITION'
  | 'PAPERBACK_STANDARD'
  | 'HARDCOVER_COLLECTOR'
  | 'DIGITAL_EBOOK';

export type EditionFormat = 'PDF' | 'EPUB' | 'DOCX';

export type RightsDeclaration =
  | 'ALL_OWNED'
  | 'LICENSED_CREATIVE_COMMONS'
  | 'PUBLIC_DOMAIN'
  | 'REQUIRES_PERMIT'
  | 'UNVERIFIED';

export type TerritoryScope =
  | 'WORLDWIDE'
  | 'NORTH_AMERICA'
  | 'LATIN_AMERICA'
  | 'EUROPE'
  | 'ASIA_PACIFIC'
  | 'SPECIFIC_TERRITORIES';

export type IsbnStatus = 'UNASSIGNED' | 'VALID_ISBN13' | 'INVALID_ISBN13';

export interface EditionRecord {
  id: string; // EDITION_ID (e.g. ed_1730000000)
  bookId: string; // BOOK_ID
  editionName: string;
  editionType: EditionType;
  version: string; // e.g. "1.0.0"
  productionLanguage: 'en' | 'es';
  authorName: string;
  publisherImprint: string;
  formats: EditionFormat[];
  rightsStatus: RightsDeclaration;
  rightsEvidence: string;
  territoryScope: TerritoryScope;
  specificTerritories: string[];
  isbn13: string;
  isbnStatus: IsbnStatus;
  derivedFromE4EditionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CanonicalMetadata {
  bookId: string;
  title: string;
  subtitle: string;
  author: string;
  originalLanguage: 'en' | 'es';
  category: string;
  centralConcept: string;
  totalChapters: number;
  targetPages: number;
  coverAssetId?: string;
  e1PackageStatus?: string;
}

export interface EditionMetadata {
  editionId: string;
  editionTitle: string;
  editionType: EditionType;
  publisherImprint: string;
  publicationDate: string;
  synopsis: string;
  keywords: string[];
  bisacCategories: string[];
  seriesName: string;
  seriesNumber: string;
  copyrightNotice: string;
  editionLanguage: 'en' | 'es';
}

export interface ChannelMetadataOverride {
  channelId: ChannelId;
  titleOverride?: string;
  priceCents?: number;
  currency?: string;
  drmEnabled?: boolean;
  distributionTerritories?: string[];
  targetAudienceNotes?: string;
  adultContent?: boolean;
  notes?: string;
}

export interface PublicationMetadataRecord {
  bookId: string;
  editionId: string;
  canonical: CanonicalMetadata;
  edition: EditionMetadata;
  channelOverrides: Record<string, ChannelMetadataOverride>;
  updatedAt: string;
}

export type ChannelId =
  | 'kdp'
  | 'apple_books'
  | 'google_play'
  | 'kobo'
  | 'draft2digital'
  | 'ingramspark'
  | 'lulu'
  | 'lulu_direct'
  | 'lulu_print_api'
  | 'publishdrive'
  | 'direct_distribution';

export type QualityGate4DB2AStatus =
  | 'LOCAL_PACKAGE_VERIFIED'
  | 'PACKAGE_INCOMPLETE'
  | 'ARTIFACT_CORRUPTED'
  | 'HASH_MISMATCH'
  | 'EDITION_MISMATCH'
  | 'METADATA_INCOMPLETE'
  | 'RIGHTS_NOT_VERIFIED'
  | 'STORAGE_UNAVAILABLE'
  | 'BROWSER_DOWNLOAD_NOT_TESTED'
  | 'EXTERNAL_VALIDATION_PENDING'
  | 'BLOCKED_SCOPE';

export type StorePackageStatus =
  | 'LOCAL_PACKAGE_VERIFIED'
  | 'PACKAGE_GENERATED_LOCAL'
  | 'PACKAGE_INCOMPLETE'
  | 'ARTIFACT_CORRUPTED'
  | 'HASH_MISMATCH'
  | 'EDITION_MISMATCH'
  | 'METADATA_INCOMPLETE'
  | 'RIGHTS_NOT_VERIFIED'
  | 'ARTIFACT_MISSING'
  | 'STORAGE_UNAVAILABLE'
  | 'BROWSER_DOWNLOAD_NOT_TESTED'
  | 'EXTERNAL_VALIDATION_PENDING'
  | 'BLOCKED_SCOPE'
  | 'STORE_UPLOAD_READY'
  | 'STORE_ACCEPTED'
  | 'PUBLISHED';

export interface QualityGate4DB2AReport {
  status: QualityGate4DB2AStatus;
  channelId: ChannelId | 'universal';
  verifiedFilesCount: number;
  totalEntries: number;
  entries: string[];
  recalculatedSha256: Record<string, string>;
  checksumMatches: boolean;
  securityClean: boolean;
  metadataCoherent: boolean;
  epubValidLocal?: boolean;
  pdfValidLocal?: boolean;
  coverValidJpeg?: boolean;
  details: string;
}

export interface StorePackageProfile {
  storeId: ChannelId;
  storeName: string;
  officialPortalUrl: string;
  allowedFormats: EditionFormat[];
  prohibitedFormats: EditionFormat[];
  coverRequirement: string;
  recommendedCoverRatio: string;
  externalValidationStatus: 'REQUIRED_EXTERNAL_VALIDATION' | 'NOT_REQUIRED' | 'RECOMMENDED';
  requiresIsbn: boolean;
  notes: string;
}

export type ChannelStatus =
  | 'NOT_CONFIGURED'
  | 'EXTERNAL_REQUIRED'
  | 'MANUAL_EXPORT_AVAILABLE'
  | 'CONNECTED_VERIFIED';

export interface ChannelRequirement {
  id: string;
  name: string;
  category: 'METADATA' | 'FILE_FORMAT' | 'COVER' | 'RIGHTS' | 'ISBN';
  rule: string;
  isMandatory: boolean;
}

export interface ChannelProfile {
  id: ChannelId;
  displayName: string;
  description: string;
  supportedFormats: EditionFormat[];
  isbnRequirement: 'OPTIONAL' | 'MANDATORY' | 'FREE_ASSIGNMENT_POSSIBLE';
  status: ChannelStatus;
  statusReason: string;
  officialPortalUrl: string;
  submissionGuide: string;
  requirements: ChannelRequirement[];
}

export type ArtifactType = 'PDF' | 'EPUB' | 'DOCX' | 'QUALITY_PASSPORT' | 'COVER_IMAGE';

export interface VerifiedArtifact {
  type: ArtifactType;
  fileName: string;
  fileSizeBytes: number;
  sha256: string;
  verifiedAt: string;
  sourceEngine: 'E4_EDITORIAL' | 'E3_VISUAL';
  provenanceId: string;
  isAvailable: boolean;
  blobUrl?: string;
  rawContent?: string;
}

export interface PublicationPackage {
  packageId: string;
  bookId: string;
  editionId: string;
  targetChannelId: ChannelId | 'universal';
  createdAt: string;
  manifestSha256: string;
  packageZipSha256?: string;
  packageZipBlobUrl?: string;
  packageZipSizeBytes?: number;
  artifacts: VerifiedArtifact[];
  manifest: any;
  readinessStatus: 'READY' | 'ARTIFACTS_NOT_READY' | 'NEEDS_ATTENTION';
}

export type ReadinessDimension =
  | 'METADATA'
  | 'EDITION'
  | 'RIGHTS'
  | 'ARTIFACTS'
  | 'CHANNEL_COMPATIBILITY';

export type DimensionStatus =
  | 'READY'
  | 'NEEDS_ATTENTION'
  | 'BLOCKED_DEPENDENCY'
  | 'NOT_TESTED';

export interface ReadinessCheckItem {
  id: string;
  label: string;
  passed: boolean;
  details: string;
}

export interface ReadinessEvaluation {
  overallStatus: DimensionStatus;
  overallScore: number;
  channelId?: ChannelId | 'universal';
  dimensions: Record<
    ReadinessDimension,
    {
      status: DimensionStatus;
      score: number;
      checks: ReadinessCheckItem[];
    }
  >;
}

export type LedgerEventType =
  | 'PACKAGE_PREPARED'
  | 'MANUAL_EXPORT_COMPLETED'
  | 'USER_REPORTED_SUBMISSION'
  | 'PROVIDER_CONFIRMED';

export type LedgerActor = 'SYSTEM' | 'USER' | 'PROVIDER';

export interface LedgerEvent {
  eventId: string;
  bookId: string;
  editionId: string;
  channelId: ChannelId | 'universal';
  eventType: LedgerEventType;
  actor: LedgerActor;
  timestamp: string;
  summary: string;
  metadata: Record<string, any>;
  sha256Evidence?: string;
}

// ==========================================
// FASE 4D-B2B: STORE VALIDATION & PUBLISHING READINESS
// ==========================================

export type RequirementLevel =
  | 'REQUIRED'
  | 'RECOMMENDED'
  | 'MANUAL_REVIEW'
  | 'EXTERNAL_VALIDATION';

export type RequirementResult =
  | 'PASS'
  | 'FAIL'
  | 'NOT_TESTED'
  | 'NOT_APPLICABLE'
  | 'REQUIREMENT_NOT_VERIFIED';

export type StoreQualityGateStatus =
  | 'STORE_UPLOAD_READY'
  | 'LOCAL_PACKAGE_VERIFIED'
  | 'EXTERNAL_VALIDATION_PENDING'
  | 'MANUAL_REVIEW_REQUIRED'
  | 'NEEDS_FIX'
  | 'RIGHTS_NOT_VERIFIED'
  | 'REQUIREMENT_NOT_VERIFIED'
  | 'BOOK_END_TO_END_NOT_TESTED'
  | 'BLOCKED_SCOPE';

export type StoreRequirementCategory =
  | 'PACKAGE'
  | 'EPUB'
  | 'COVER'
  | 'PDF'
  | 'METADATA'
  | 'RIGHTS'
  | 'TOOL_EXTERNAL';

export interface StoreRequirementRule {
  requirementId: string;
  storeId: 'kdp' | 'apple_books' | 'google_play' | 'kobo';
  title: string;
  sourceUrl: string;
  sourceCheckedDate: string;
  level: RequirementLevel;
  category: StoreRequirementCategory;
  validationMethod: string;
  description: string;
}

export interface StoreRequirementEvaluation {
  rule: StoreRequirementRule;
  result: RequirementResult;
  evidence: string;
  artifactHash?: string;
  testedAt: string;
}

export interface ExternalToolCheckRecord {
  toolName: string;
  toolVersion: string;
  artifactSha256: string;
  executionDate: string;
  result: 'PASS' | 'FAIL' | 'NOT_TESTED';
  errors: string[];
  warnings: string[];
  evidenceSource: string;
}

export interface StorePublishingReadinessReport {
  storeId: 'kdp' | 'apple_books' | 'google_play' | 'kobo';
  bookId: string;
  editionId: string;
  approvedSnapshotId: string;
  epubSha256: string;
  coverSha256: string;
  pdfSha256?: string;
  packageZipSha256: string;
  metadataVersion: string;
  requirementsVersion: string;
  localPackageStatus: QualityGate4DB2AStatus;
  overallStatus: StoreQualityGateStatus;
  evaluatedAt: string;
  evaluations: StoreRequirementEvaluation[];
  externalTools: ExternalToolCheckRecord[];
  summary: {
    total: number;
    requiredPassed: number;
    requiredFailed: number;
    recommendedPassed: number;
    recommendedNotTested: number;
    pendingExternal: number;
    blockedReasons: string[];
  };
}
