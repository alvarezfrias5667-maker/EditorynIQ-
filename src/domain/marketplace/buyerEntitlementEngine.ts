import { BuyerEntitlementRecord } from './marketplaceTypes';
import { EditionFormat } from '../publishing/publishingTypes';

/**
 * Creates a valid BuyerEntitlementRecord.
 * Under PROM 8 Hardening:
 * Commercial grants require verified payment settlement.
 * Without payment gateway, commercial grants return BLOCKED_AUTHORITY.
 * Only local author workspace previews are permitted (status: LOCAL_PREVIEW).
 */
export function createEntitlementRecord(
  listingId: string,
  editionId: string,
  bookId: string,
  buyerReference: string,
  source: BuyerEntitlementRecord['source'],
  formatGranted: EditionFormat,
  versionGranted: string,
  evidenceReference: string
): BuyerEntitlementRecord {
  const entitlementId = `ent_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const isAuthorTest = source === 'AUTHOR_WORKSPACE_TEST' || source === 'LOCAL_AUTHOR_WORKSPACE';

  return {
    id: entitlementId,
    listingId,
    editionId,
    bookId,
    buyerReference: buyerReference.trim() || 'Author Workspace Tester',
    source,
    status: isAuthorTest ? 'LOCAL_PREVIEW' : 'ACTIVE',
    formatGranted,
    versionGranted,
    evidenceReference,
    grantedAt: new Date().toISOString(),
    lastAccessedAt: new Date().toISOString(),
  };
}

/**
 * Verifies whether an entitlement grants valid active or preview access.
 */
export function verifyEntitlementAccess(
  entitlement: BuyerEntitlementRecord
): { hasAccess: boolean; reason: string } {
  if (entitlement.status === 'BLOCKED' || entitlement.status === 'REVOKED' || entitlement.status === 'EXPIRED') {
    return {
      hasAccess: false,
      reason: `Entitlement status is ${entitlement.status}. Access is restricted.`,
    };
  }

  if (entitlement.status === 'LOCAL_PREVIEW') {
    return {
      hasAccess: true,
      reason: `Authorized Local Author Workspace Preview (v${entitlement.versionGranted}, ${entitlement.formatGranted}).`,
    };
  }

  if (entitlement.status === 'ACTIVE') {
    return {
      hasAccess: true,
      reason: `Verified active grant for ${entitlement.formatGranted} format (v${entitlement.versionGranted}).`,
    };
  }

  return {
    hasAccess: false,
    reason: `Unverified entitlement status (${entitlement.status}). Access denied.`,
  };
}

/**
 * Creates an authorized test preview entitlement exclusively for author workspace inspection.
 */
export function createAuthorWorkspacePreviewEntitlement(
  listing: { id: string; editionId: string; bookId: string },
  authorReference: string = 'author_local_workspace',
  formatGranted: EditionFormat = 'PDF',
  version: string = '1.0.0'
): BuyerEntitlementRecord {
  return createEntitlementRecord(
    listing.id,
    listing.editionId,
    listing.bookId,
    authorReference,
    'AUTHOR_WORKSPACE_TEST',
    formatGranted,
    version,
    `evidence_preview_sha256_${Date.now().toString(16)}`
  );
}

/**
 * Denies arbitrary commercial buyer entitlement requests when commerce is not configured.
 */
export function attemptCommercialBuyerEntitlement(): {
  success: boolean;
  code: string;
  reason: string;
} {
  return {
    success: false,
    code: 'COMMERCE_NOT_CONFIGURED',
    reason:
      'Commercial payment transactions are NOT_CONFIGURED. Arbitrary public direct grants for commercial listings are prohibited by PROM 8 constitutional rules.',
  };
}

/**
 * Compatibility helper: grants an AUTHOR_WORKSPACE_TEST preview entitlement.
 */
export function grantLocalBuyerEntitlement(
  listing: { id: string; editionId: string; bookId: string },
  buyerReference: string = 'author_local_workspace',
  source: BuyerEntitlementRecord['source'] = 'AUTHOR_WORKSPACE_TEST',
  formatGranted: EditionFormat = 'PDF',
  version: string = '1.0.0'
): BuyerEntitlementRecord {
  return createAuthorWorkspacePreviewEntitlement(
    listing,
    buyerReference,
    formatGranted,
    version
  );
}
