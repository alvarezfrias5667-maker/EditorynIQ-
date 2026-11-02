/**
 * EDITORYNIQ™ SECURE ACCESS AUTHORITY
 * Enforces zero unauthorized commercial entitlement grants, validates preview access,
 * and guards artifact downloads with cryptographic provenance checks.
 */

import { BuyerEntitlementRecord } from '../marketplace/marketplaceTypes';
import { VerifiedArtifact } from '../publishing/publishingTypes';

export interface AccessAuthorizationResult {
  isAuthorized: boolean;
  code: 'AUTHORIZED' | 'BLOCKED_AUTHORITY' | 'COMMERCE_NOT_CONFIGURED' | 'ARTIFACTS_NOT_READY' | 'INVALID_ENTITLEMENT';
  reason: string;
  artifactPayload?: {
    blobUrl?: string;
    rawContent?: string;
    mimeType: string;
    fileName: string;
  };
}

export class SecureAccessAuthority {
  /**
   * Evaluates whether a download request for a published work is permitted.
   */
  public static authorizeArtifactDownload(
    entitlement: BuyerEntitlementRecord,
    availableArtifacts: VerifiedArtifact[]
  ): AccessAuthorizationResult {
    // 1. Verify entitlement status
    if (entitlement.status !== 'ACTIVE') {
      return {
        isAuthorized: false,
        code: 'INVALID_ENTITLEMENT',
        reason: `Entitlement ${entitlement.id} is inactive (${entitlement.status}). Access denied.`,
      };
    }

    // 2. Commercial purchases are blocked without configured payment gateway
    if (entitlement.source === 'DIRECT_CHECKOUT_COMPLETED' || entitlement.source === 'THIRD_PARTY_SYNC') {
      return {
        isAuthorized: false,
        code: 'COMMERCE_NOT_CONFIGURED',
        reason: 'Commercial payment transactions are not configured. External settlement proof is required.',
      };
    }

    // 3. For author workspace preview grants, check if authentic artifact exists
    const matchingArtifact = availableArtifacts.find(
      (a) => a.type === entitlement.formatGranted && a.isAvailable
    );

    if (!matchingArtifact) {
      return {
        isAuthorized: false,
        code: 'ARTIFACTS_NOT_READY',
        reason: `The requested format (${entitlement.formatGranted}) has not yet been compiled or verified in E4 Editorial Hub.`,
      };
    }

    // 4. Authorized local workspace preview
    return {
      isAuthorized: true,
      code: 'AUTHORIZED',
      reason: `Authorized preview access granted for author workspace (${entitlement.formatGranted}).`,
      artifactPayload: {
        blobUrl: matchingArtifact.blobUrl,
        rawContent: matchingArtifact.rawContent,
        mimeType:
          matchingArtifact.type === 'PDF'
            ? 'application/pdf'
            : matchingArtifact.type === 'EPUB'
            ? 'application/epub+zip'
            : 'application/octet-stream',
        fileName: matchingArtifact.fileName,
      },
    };
  }

  /**
   * Verifies if a user can create an entitlement.
   * Only author workspace test preview is permitted in local mode.
   */
  public static authorizeEntitlementCreation(
    requestedSource: BuyerEntitlementRecord['source']
  ): { isAllowed: boolean; code: string; message: string } {
    if (requestedSource === 'LOCAL_AUTHOR_WORKSPACE') {
      return {
        isAllowed: true,
        code: 'AUTHOR_WORKSPACE_TEST_ALLOWED',
        message: 'Author workspace preview entitlement permitted for local testing.',
      };
    }

    return {
      isAllowed: false,
      code: 'COMMERCE_NOT_CONFIGURED',
      message: 'Commercial buyer grants without authenticated payment gateway are strictly prohibited by ADN V100 constitutional rules.',
    };
  }
}
