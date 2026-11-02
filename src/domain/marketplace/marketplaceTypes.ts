import { EditionFormat, RightsDeclaration } from '../publishing/publishingTypes';

export type ListingStatus =
  | 'LOCAL_DRAFT'
  | 'NEEDS_ATTENTION'
  | 'READY_FOR_REVIEW'
  | 'LOCAL_APPROVED'
  | 'PUBLICATION_NOT_CONFIGURED'
  | 'PUBLICATION_CONFIRMED';

export type AuthorIdentityStatus = 'LOCAL_PROFILE' | 'IDENTITY_UNVERIFIED' | 'VERIFIED';

export type ProductAvailabilityStatus =
  | 'EDITION_READY'
  | 'LISTING_READY'
  | 'PUBLICLY_PUBLISHED'
  | 'PURCHASE_AVAILABLE';

export interface AuthorRecord {
  id: string; // AUTHOR_ID (e.g. auth_...)
  declaredName: string;
  biography: string;
  countryOrTerritory?: string;
  languages: ('en' | 'es')[];
  linkedBookIds: string[];
  identityStatus: AuthorIdentityStatus;
  identityEvidenceNotes?: string;
  rightsDeclarations: string[];
  websiteUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListingRecord {
  id: string; // LISTING_ID (e.g. list_...)
  bookId: string; // BOOK_ID
  editionId: string; // EDITION_ID
  authorId: string; // AUTHOR_ID
  title: string;
  subtitle?: string;
  description: string;
  category: string;
  language: 'en' | 'es';
  formats: EditionFormat[];
  rightsStatus: RightsDeclaration;
  qualityStatus: 'PASSED' | 'PENDING' | 'NOT_AUDITED';
  qualityScore?: number;
  listingStatus: ListingStatus;
  scope: 'LOCAL_ONLY';
  coverAssetId?: string;
  coverDataUrl?: string;
  isbn13?: string;
  packageId?: string;
  priceReference?: string;
  sampleChapterText?: string;
  tocSummary?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BuyerEntitlementRecord {
  id: string; // ENTITLEMENT_ID (e.g. ent_...)
  listingId: string;
  editionId: string;
  bookId: string;
  buyerReference: string;
  source: 'LOCAL_AUTHOR_WORKSPACE' | 'AUTHOR_WORKSPACE_TEST' | 'DIRECT_GRANT' | 'EXTERNAL_IMPORT' | 'DIRECT_CHECKOUT_COMPLETED' | 'THIRD_PARTY_SYNC' | 'BLOCKED_AUTHORITY';
  status: 'ACTIVE' | 'LOCAL_PREVIEW' | 'REVOKED' | 'EXPIRED' | 'BLOCKED' | 'UNVERIFIED';
  formatGranted: EditionFormat;
  versionGranted: string;
  evidenceReference: string;
  grantedAt: string;
  lastAccessedAt?: string;
}

export type OperationStatus =
  | 'NOT_CONFIGURED'
  | 'PENDING_VERIFICATION'
  | 'VERIFIED'
  | 'DELIVERED'
  | 'FAILED';

export interface OrderRecord {
  id: string; // ORD_...
  listingId: string;
  buyerReference: string;
  sellerReference: string;
  currency: 'USD';
  grossAmountCents: number;
  status: OperationStatus;
  statusReason: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryRecord {
  id: string; // DEL_...
  orderId?: string;
  listingId: string;
  editionId: string;
  format: EditionFormat;
  recipientReference: string;
  status: OperationStatus;
  deliveryMethod: 'DIRECT_DOWNLOAD' | 'SECURE_STORAGE_LINK' | 'EXTERNAL_FULFILLMENT';
  sha256Verification?: string;
  dispatchedAt?: string;
  completedAt?: string;
}

export interface RoyaltyRecord {
  id: string; // ROY_...
  listingId: string;
  authorId: string;
  orderId?: string;
  status: OperationStatus;
  calculationBasis: string;
  amountCents: number;
  accruedAt: string;
}

export interface SellerSettlementRecord {
  id: string; // SET_...
  authorId: string;
  periodStart: string;
  periodEnd: string;
  status: OperationStatus;
  totalSettlementCents: number;
  currency: 'USD';
  payoutMethodReference?: string;
  notes: string;
}

export interface MarketplaceAuditFinding {
  id: string;
  dimension: 'EDITION' | 'METADATA' | 'AUTHOR' | 'RIGHTS' | 'ARTIFACTS' | 'COMMERCE';
  label: string;
  passed: boolean;
  severity: 'BLOCKING' | 'WARNING' | 'INFO';
  details: string;
}

export interface ListingReadinessReport {
  listingId: string;
  overallStatus: 'READY_FOR_LOCAL_APPROVAL' | 'NEEDS_ATTENTION' | 'BLOCKED';
  score: number;
  findings: MarketplaceAuditFinding[];
  evaluatedAt: string;
}
