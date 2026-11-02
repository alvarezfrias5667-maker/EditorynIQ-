import { VisualAsset, VisualIdentityProfile } from './visualTypes';

export interface VisualConsistencyReport {
  bookId: string;
  checkedAssetsCount: number;
  passedCount: number;
  warningCount: number;
  issues: Array<{
    assetId: string;
    assetTitle: string;
    level: 'WARNING' | 'CRITICAL';
    message: string;
  }>;
}

export function auditVisualConsistency(
  identity: VisualIdentityProfile,
  assets: VisualAsset[]
): VisualConsistencyReport {
  const issues: VisualConsistencyReport['issues'] = [];
  let passedCount = 0;
  let warningCount = 0;

  for (const asset of assets) {
    let assetHasIssue = false;

    // Check 1: Chapter association for non-cover assets
    if (asset.assetType !== 'cover' && !asset.chapterId) {
      issues.push({
        assetId: asset.id,
        assetTitle: asset.title,
        level: 'WARNING',
        message: 'Visual asset is not associated with any specific book chapter.',
      });
      assetHasIssue = true;
    }

    // Check 2: Rights verification status
    if (asset.rightsStatus === 'RIGHTS_UNVERIFIED') {
      issues.push({
        assetId: asset.id,
        assetTitle: asset.title,
        level: 'CRITICAL',
        message: 'Rights status is unverified. Copyright provenance must be declared before press release.',
      });
      assetHasIssue = true;
    }

    // Check 3: SVG markup integrity if applicable
    if (asset.svgContent) {
      if (asset.svgContent.includes('<script') || asset.svgContent.includes('javascript:')) {
        issues.push({
          assetId: asset.id,
          assetTitle: asset.title,
          level: 'CRITICAL',
          message: 'SVG markup contains forbidden executable scripts or unsafe links.',
        });
        assetHasIssue = true;
      }
    }

    if (assetHasIssue) {
      warningCount++;
    } else {
      passedCount++;
    }
  }

  return {
    bookId: identity.bookId,
    checkedAssetsCount: assets.length,
    passedCount,
    warningCount,
    issues,
  };
}
