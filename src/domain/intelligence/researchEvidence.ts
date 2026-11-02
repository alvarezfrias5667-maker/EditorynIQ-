import { ResearchSource } from './bookIntelligenceTypes';

export function validateResearchSource(source: Partial<ResearchSource>): string[] {
  const errors: string[] = [];

  if (!source.title || source.title.trim().length === 0) {
    errors.push('Source title is required.');
  }

  if (!source.author || source.author.trim().length === 0) {
    errors.push('Author or organization is required.');
  }

  if (source.url && source.url.trim().length > 0) {
    try {
      new URL(source.url.trim());
    } catch {
      errors.push('Invalid URL format.');
    }
  }

  if (source.status === 'CONFIRMED') {
    if (!source.verifiedBy || source.verifiedBy.trim().length === 0) {
      errors.push('Confirmed sources require validator name or editorial role.');
    }
    if (!source.verifiedAt || source.verifiedAt.trim().length === 0) {
      errors.push('Confirmed sources require a verification date.');
    }
    if (!source.verificationMethod || source.verificationMethod.trim().length === 0) {
      errors.push('Confirmed sources require a documented verification method or evidence link.');
    }
  }

  return errors;
}

export function detectDuplicateSources(sources: ResearchSource[], newSource: Partial<ResearchSource>): boolean {
  return sources.some(
    (s) =>
      s.id !== newSource.id &&
      ((newSource.url && s.url && s.url.trim().toLowerCase() === newSource.url.trim().toLowerCase()) ||
        (s.title.trim().toLowerCase() === (newSource.title || '').trim().toLowerCase() &&
          s.author.trim().toLowerCase() === (newSource.author || '').trim().toLowerCase()))
  );
}

export function createDefaultSource(): ResearchSource {
  const now = new Date().toISOString();
  return {
    id: `src_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: '',
    author: '',
    url: '',
    publishedDate: '',
    notes: '',
    claimsLinked: [],
    status: 'UNVERIFIED',
    createdAt: now,
    updatedAt: now,
  };
}
