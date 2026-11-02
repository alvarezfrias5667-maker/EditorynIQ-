import {
  ListingRecord,
  ListingReadinessReport,
  MarketplaceAuditFinding,
} from './marketplaceTypes';
import { EditionRecord } from '../publishing/publishingTypes';

/**
 * Audits a listing against constitutional requirements before local approval.
 */
export function evaluateListingReadiness(
  listing: ListingRecord,
  edition?: EditionRecord | null
): ListingReadinessReport {
  const findings: MarketplaceAuditFinding[] = [];

  // 1. Edition & Identity
  const hasEdition = Boolean(edition && edition.id === listing.editionId);
  findings.push({
    id: 'chk_edition',
    dimension: 'EDITION',
    label: 'Linked Book Edition Verified',
    passed: hasEdition,
    severity: 'BLOCKING',
    details: hasEdition
      ? `Linked to edition ${edition?.editionName} (ID: ${edition?.id})`
      : 'Listing must be linked to a valid EditionRecord from E5.',
  });

  // 2. Metadata completeness
  const hasTitle = Boolean(listing.title && listing.title.trim().length > 0);
  findings.push({
    id: 'chk_title',
    dimension: 'METADATA',
    label: 'Publication Title Present',
    passed: hasTitle,
    severity: 'BLOCKING',
    details: hasTitle ? `Title: "${listing.title}"` : 'Book title is missing.',
  });

  const hasDesc = Boolean(listing.description && listing.description.trim().length >= 40);
  findings.push({
    id: 'chk_desc',
    dimension: 'METADATA',
    label: 'Commercial Description (>= 40 chars)',
    passed: hasDesc,
    severity: 'WARNING',
    details: hasDesc
      ? `${listing.description.length} characters synopsis registered.`
      : 'Commercial description is too brief (at least 40 characters recommended).',
  });

  // 3. Formats Defined
  const hasFormats = listing.formats.length > 0;
  findings.push({
    id: 'chk_formats',
    dimension: 'EDITION',
    label: 'Available Formats Declared',
    passed: hasFormats,
    severity: 'BLOCKING',
    details: hasFormats
      ? `Formats: ${listing.formats.join(', ')}`
      : 'At least one format (PDF, EPUB, DOCX) must be selected.',
  });

  // 4. Rights Status
  const hasRights = listing.rightsStatus !== 'UNVERIFIED';
  findings.push({
    id: 'chk_rights',
    dimension: 'RIGHTS',
    label: 'Material Rights Declared',
    passed: hasRights,
    severity: 'BLOCKING',
    details: hasRights
      ? `Rights: ${listing.rightsStatus}`
      : 'Material copyright rights are currently unverified. Declare rights in Edition Center.',
  });

  // 5. Commerce Gateway Notice
  findings.push({
    id: 'chk_commerce_notice',
    dimension: 'COMMERCE',
    label: 'Commerce & Payment Gateway Status',
    passed: true,
    severity: 'INFO',
    details:
      'Commercial payment transactions are NOT_CONFIGURED in PROM 7. Listing will be visible in local catalog without active monetary checkout.',
  });

  const blockingIssues = findings.filter((f) => !f.passed && f.severity === 'BLOCKING');
  const warningIssues = findings.filter((f) => !f.passed && f.severity === 'WARNING');

  let overallStatus: ListingReadinessReport['overallStatus'] = 'READY_FOR_LOCAL_APPROVAL';
  if (blockingIssues.length > 0) {
    overallStatus = 'BLOCKED';
  } else if (warningIssues.length > 0) {
    overallStatus = 'NEEDS_ATTENTION';
  }

  const passedCount = findings.filter((f) => f.passed).length;
  const score = Math.round((passedCount / findings.length) * 100);

  return {
    listingId: listing.id,
    overallStatus,
    score,
    findings,
    evaluatedAt: new Date().toISOString(),
  };
}
