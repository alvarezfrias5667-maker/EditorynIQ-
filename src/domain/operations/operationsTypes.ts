/**
 * EDITORYNIQ™ OPERATIONS & DELIVERY READINESS TYPES (PROM 9)
 * Canonical status definitions, audit matrices, deliverable contracts,
 * backup manifest schemas, and restore collision verification types.
 */

export type OperationalReadinessStatus =
  | 'READY'
  | 'IN_PROGRESS'
  | 'NEEDS_ATTENTION'
  | 'BLOCKED_DEPENDENCY'
  | 'NOT_STARTED'
  | 'NOT_TESTED';

export type EngineIdentifier = 'E1' | 'E2' | 'E3' | 'E4' | 'E5' | 'E6';

export interface EngineAuditRecord {
  engineId: EngineIdentifier;
  engineName: string;
  subTitle: string;
  status: OperationalReadinessStatus;
  statusReason: string;
  metrics: {
    label: string;
    value: string | number;
    unit?: string;
  }[];
  blockers: string[];
  evidence: {
    identifier?: string;
    identifierLabel?: string;
    sha256?: string;
    recordCount?: number;
    timestamp?: string;
  };
  actionRoute: string;
  actionLabel: string;
}

export interface OperationsSummary {
  bookId: string;
  bookTitle: string;
  overallStatus: OperationalReadinessStatus;
  overallScore: number; // 0 - 100
  engines: Record<EngineIdentifier, EngineAuditRecord>;
  readyCount: number;
  totalEngines: number;
  verifiedDeliverablesCount: number;
  lastAuditTimestamp: string;
  blockersCount: number;
}

export type DeliverableType =
  | 'PDF_MASTER'
  | 'EPUB_MASTER'
  | 'DOCX_MANUSCRIPT'
  | 'QUALITY_PASSPORT'
  | 'PUBLISHING_PACKAGE_ZIP'
  | 'ONIX_METADATA'
  | 'PROJECT_BACKUP';

export type DeliveryArtifactStatus =
  | 'VERIFIED_READY'
  | 'ARTIFACT_NOT_READY'
  | 'INTEGRITY_FAILED';

export interface DeliverableItem {
  id: string;
  type: DeliverableType;
  title: string;
  formatBadge: string;
  fileName: string;
  sourceEngine: 'E1_INTELLIGENCE' | 'E2_MANUSCRIPT' | 'E3_VISUAL' | 'E4_EDITORIAL' | 'E5_PUBLISHING' | 'OPERATIONS';
  status: DeliveryArtifactStatus;
  fileSizeBytes: number;
  sha256: string;
  lastVerifiedAt: string;
  errorDetails?: string;
  actionRoute?: string;
  actionLabel?: string;
  rawContent?: string;
  mimeType: string;
  isAvailable: boolean;
}

export interface BackupSectionHashes {
  projectMetadataSha256: string;
  e1IntelligenceSha256: string;
  e2ManuscriptSha256: string;
  e3VisualsSha256: string;
  e4EditorialSha256: string;
  e5PublishingSha256: string;
  e6MarketplaceSha256: string;
}

export interface BackupManifest {
  formatVersion: 'editoryniq_backup_v1';
  exportedAt: string;
  bookId: string;
  bookTitle: string;
  totalSizeEstimateBytes: number;
  bundleSha256: string;
  sectionHashes: BackupSectionHashes;
  isComplete: boolean;
  missingSections: string[];
  recordsSummary: {
    chaptersCount: number;
    visualAssetsCount: number;
    editorialEditionsCount: number;
    publishingEditionsCount: number;
    packagesCount: number;
    listingsCount: number;
    ledgerEventsCount: number;
  };
}

export interface ProjectBackupBundle {
  manifest: BackupManifest;
  data: {
    project: any;
    e1Package: any;
    e2ManuscriptProject: any;
    e3VisualAssets: any[];
    e4Editions: any[];
    e4Passports: any[];
    e4ExportHistory: any[];
    e5Editions: any[];
    e5Metadata: any[];
    e5Packages: any[];
    e5Ledger: any[];
    e6Listings: any[];
  };
}

export interface RestoreCollisionReport {
  compatible: boolean;
  backupVersion: string;
  sourceBookId: string;
  sourceBookTitle: string;
  exportedAt: string;
  bundleIntegrityValid: boolean;
  calculatedSha256: string;
  expectedSha256: string;
  collisions: {
    bookProjectExists: boolean;
    existingEditionsCount: number;
    existingManuscriptChaptersCount: number;
    existingVisualsCount: number;
    existingPublishingCount: number;
    existingMarketplaceCount: number;
  };
  conflictsSummary: string[];
  canOverwrite: boolean;
  canCloneAsNew: boolean;
  newClonedBookId?: string;
}

export interface RestoreExecutionResult {
  success: boolean;
  message: string;
  restoredBookId: string;
  mode: 'OVERWRITE' | 'CLONE_AS_NEW';
  recordsRestored: {
    chapters: number;
    visuals: number;
    editorialEditions: number;
    publishingEditions: number;
    packages: number;
    listings: number;
    ledgerEvents: number;
  };
  error?: string;
}
