import { E3ReadinessReport, E3ReadinessCheck, VisualAsset } from './visualTypes';

export function evaluateE3Readiness(bookId: string, assets: VisualAsset[]): E3ReadinessReport {
  const checks: E3ReadinessCheck[] = [];

  const covers = assets.filter((a) => a.assetType === 'cover');
  const illustrations = assets.filter((a) => a.assetType === 'illustration');
  const diagrams = assets.filter((a) => a.assetType === 'diagram');
  const charts = assets.filter((a) => a.assetType === 'chart');
  const infographics = assets.filter((a) => a.assetType === 'infographic');

  const unverifiedRights = assets.filter(
    (a) => a.rightsStatus === 'RIGHTS_UNVERIFIED' || a.rightsStatus === 'RIGHTS_REVIEW_REQUIRED'
  );

  // Check 1: Book Cover
  if (covers.length > 0) {
    checks.push({
      id: 'c_cover',
      category: 'COVERS',
      title: 'Book Cover Design Spec',
      status: 'PASS',
      details: `${covers.length} cover design(s) configured with front, back, and preliminary spine specifications.`,
    });
  } else {
    checks.push({
      id: 'c_cover',
      category: 'COVERS',
      title: 'Book Cover Design Spec',
      status: 'WARNING',
      details: 'No book cover asset saved. Generate or design a vector cover in Book Cover Studio™.',
    });
  }

  // Check 2: Technical Diagrams & Charts
  const totalVisualMedia = illustrations.length + diagrams.length + charts.length + infographics.length;
  if (totalVisualMedia > 0) {
    checks.push({
      id: 'c_media',
      category: 'ILLUSTRATIONS',
      title: 'Interior Visual Media Portfolio',
      status: 'PASS',
      details: `${totalVisualMedia} visual asset(s) ready (${illustrations.length} illustrations, ${diagrams.length} diagrams, ${charts.length} charts, ${infographics.length} infographics).`,
    });
  } else {
    checks.push({
      id: 'c_media',
      category: 'ILLUSTRATIONS',
      title: 'Interior Visual Media Portfolio',
      status: 'WARNING',
      details: 'No interior illustrations, diagrams, or charts created yet.',
    });
  }

  // Check 3: Rights & Provenance Compliance
  if (unverifiedRights.length === 0) {
    checks.push({
      id: 'c_rights',
      category: 'RIGHTS',
      title: 'Copyright Rights & Provenance Audit',
      status: 'PASS',
      details: 'All visual assets have declared or approved copyright provenance records.',
    });
  } else {
    checks.push({
      id: 'c_rights',
      category: 'RIGHTS',
      title: 'Copyright Rights & Provenance Audit',
      status: 'FAIL',
      details: `${unverifiedRights.length} asset(s) require rights review or author declaration before publication.`,
    });
  }

  const passCount = checks.filter((c) => c.status === 'PASS').length;
  const score = Math.round((passCount / checks.length) * 100);

  let overallStatus: E3ReadinessReport['overallStatus'] = 'INCOMPLETE';
  if (score === 100) overallStatus = 'READY';
  else if (score >= 50) overallStatus = 'NEEDS_ATTENTION';

  return {
    bookId,
    evaluatedAt: new Date().toISOString(),
    score,
    overallStatus,
    checks,
    totalAssetsCount: assets.length,
    unverifiedRightsCount: unverifiedRights.length,
  };
}
