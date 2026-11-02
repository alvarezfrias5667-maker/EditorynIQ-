import {
  PublicationPackage,
  PublicationMetadataRecord,
  EditionRecord,
  VerifiedArtifact,
  ChannelId,
  ReadinessEvaluation,
} from './publishingTypes';
import { generateOnixJsonMetadata } from './metadataEngine';
import { computeSHA256 } from '../../services/localVisualRepository';

/**
 * Builds the official Publication Manifest JSON object.
 */
export async function buildPublicationManifest(
  packageId: string,
  edition: EditionRecord,
  metadata: PublicationMetadataRecord,
  artifacts: VerifiedArtifact[],
  targetChannelId: ChannelId | 'universal',
  readiness: ReadinessEvaluation
): Promise<{ manifest: any; manifestSha256: string }> {
  const onix = generateOnixJsonMetadata(metadata);

  const manifest = {
    $schema: 'https://editoryniq.com/schemas/publication-manifest-v1.json',
    system: 'EditorynIQ™ E5 Publishing & Distribution',
    packageId,
    generatedAt: new Date().toISOString(),
    specificationVersion: '1.0.0-enterprise',
    provenance: {
      bookId: edition.bookId,
      editionId: edition.id,
      editionName: edition.editionName,
      editionType: edition.editionType,
      version: edition.version,
      productionLanguage: edition.productionLanguage,
      authorName: edition.authorName,
      publisherImprint: edition.publisherImprint,
      isbn13: edition.isbn13 || 'UNASSIGNED',
      isbnStatus: edition.isbnStatus,
      rightsDeclaration: edition.rightsStatus,
      rightsEvidence: edition.rightsEvidence,
      territoryScope: edition.territoryScope,
    },
    targetDistributionChannel: targetChannelId,
    readinessAudit: {
      overallStatus: readiness.overallStatus,
      overallScore: readiness.overallScore,
      summary: `${readiness.overallStatus} (${readiness.overallScore}/100) across 5 editorial dimensions.`,
    },
    artifacts: artifacts.map((art) => ({
      type: art.type,
      fileName: art.fileName,
      fileSizeBytes: art.fileSizeBytes,
      sha256: art.sha256,
      sourceEngine: art.sourceEngine,
      provenanceId: art.provenanceId,
      verifiedAt: art.verifiedAt,
      isAvailable: art.isAvailable,
    })),
    metadataRecord: {
      canonical: metadata.canonical,
      edition: metadata.edition,
      onixReference: onix.product.recordReference,
    },
    complianceNotice:
      'All master artifacts in this package are generated directly from verified E4 editorial builds and E3 visual repositories. Integrity is mathematically enforced via SHA-256 cryptographic hashes. Physical press production requires separate proof validation.',
  };

  const manifestJsonString = JSON.stringify(manifest, null, 2);
  const manifestSha256 = await computeSHA256(manifestJsonString);

  return { manifest, manifestSha256 };
}
