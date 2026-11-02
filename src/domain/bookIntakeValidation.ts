import { BookProjectInput, ValidationError } from './bookProjectTypes';

export function validateBookIntake(input: Partial<BookProjectInput>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!input.title || input.title.trim().length === 0) {
    errors.push({ field: 'title', messageKey: 'validation.titleRequired' });
  } else if (input.title.trim().length > 150) {
    errors.push({ field: 'title', messageKey: 'validation.titleTooLong' });
  }

  if (!input.description || input.description.trim().length === 0) {
    errors.push({ field: 'description', messageKey: 'validation.descriptionRequired' });
  } else if (input.description.trim().length > 2000) {
    errors.push({ field: 'description', messageKey: 'validation.descriptionTooLong' });
  }

  if (!input.targetAudience || input.targetAudience.trim().length === 0) {
    errors.push({ field: 'targetAudience', messageKey: 'validation.audienceRequired' });
  }

  if (!input.category) {
    errors.push({ field: 'category', messageKey: 'validation.categoryRequired' });
  }

  if (!input.productionLanguage || !['en', 'es'].includes(input.productionLanguage)) {
    errors.push({ field: 'productionLanguage', messageKey: 'validation.languageRequired' });
  }

  if (!input.profile || !['text-first', 'visual-first', 'technical-first'].includes(input.profile)) {
    errors.push({ field: 'profile', messageKey: 'validation.profileRequired' });
  }

  const pageCount = Number(input.targetPageCount);
  if (isNaN(pageCount) || pageCount < 20 || pageCount > 600) {
    errors.push({ field: 'targetPageCount', messageKey: 'validation.pageCountRange' });
  }

  if (input.mode === 'manuscript' && (!input.sourceText || input.sourceText.trim().length === 0)) {
    errors.push({ field: 'sourceText', messageKey: 'validation.sourceTextRequired' });
  }

  return errors;
}

export function getLengthClass(pageCount: number): 'standard' | 'extended' {
  return pageCount <= 300 ? 'standard' : 'extended';
}
