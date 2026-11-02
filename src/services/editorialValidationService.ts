import { EditorialEdition, QualityAuditReport, AccessibilityAuditReport, BookQualityPassport, FormatExportResult } from '../domain/editorial/editorialTypes';
import { auditEditorialQuality } from '../domain/editorial/editorialQualityEngine';
import { auditAccessibility } from '../domain/editorial/accessibilityEngine';
import { generateBookQualityPassport } from '../domain/editorial/bookQualityPassport';
import { VisualAsset } from '../domain/visual/visualTypes';
import { localEditorialRepository } from './localEditorialRepository';

export const editorialValidationService = {
  runQualityAudit(edition: EditorialEdition): QualityAuditReport {
    return auditEditorialQuality(edition);
  },

  runAccessibilityAudit(edition: EditorialEdition, visualAssets: VisualAsset[] = []): AccessibilityAuditReport {
    return auditAccessibility(edition, visualAssets);
  },

  async compileQualityPassport(
    edition: EditorialEdition,
    exports: FormatExportResult[] = [],
    visualAssets: VisualAsset[] = []
  ): Promise<BookQualityPassport> {
    const qualityReport = this.runQualityAudit(edition);
    const accessibilityReport = this.runAccessibilityAudit(edition, visualAssets);

    const unverifiedRightsAssets = visualAssets.filter((a) => a.rightsStatus !== 'RIGHTS_APPROVED');

    const passport = await generateBookQualityPassport(
      edition,
      qualityReport,
      accessibilityReport,
      exports,
      unverifiedRightsAssets.length
    );

    await localEditorialRepository.savePassport(passport);
    return passport;
  },
};
