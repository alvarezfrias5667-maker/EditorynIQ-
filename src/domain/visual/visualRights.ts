import { RightsStatus, SourceType, LicenseInfo, VisualAsset } from './visualTypes';

export function computeSHA256Hash(content: string): string {
  // Simple deterministic string hash for local client sha256 simulation
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `sha256_${hex}_${content.length}b`;
}

export function createRightsRecord(
  sourceType: SourceType,
  licenseName: string,
  creatorName?: string,
  sourceUrl?: string
): { rightsStatus: RightsStatus; licenseInfo: LicenseInfo } {
  let rightsStatus: RightsStatus = 'RIGHTS_DECLARED';

  if (sourceType === 'USER_UPLOAD' && !sourceUrl && !creatorName) {
    rightsStatus = 'RIGHTS_REVIEW_REQUIRED';
  } else if (sourceType === 'VECTOR_EDITOR' || sourceType === 'DATA_RENDER') {
    rightsStatus = 'RIGHTS_APPROVED';
  }

  return {
    rightsStatus,
    licenseInfo: {
      licenseName: licenseName || 'Author Proprietary License',
      creatorName: creatorName || 'Book Author',
      sourceUrl,
      usageNotes: 'Recorded under EditorynIQ™ Rights & Provenance Protocol.',
    },
  };
}

export function updateAssetRightsStatus(
  asset: VisualAsset,
  newStatus: RightsStatus,
  notes?: string
): VisualAsset {
  return {
    ...asset,
    rightsStatus: newStatus,
    updatedAt: new Date().toISOString(),
    version: asset.version + 1,
    licenseInfo: {
      ...asset.licenseInfo,
      usageNotes: notes ? `${asset.licenseInfo.usageNotes || ''} | Audit note: ${notes}` : asset.licenseInfo.usageNotes,
    },
  };
}
