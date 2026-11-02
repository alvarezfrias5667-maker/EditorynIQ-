import { BookMarketProfile } from './bookIntelligenceTypes';

export function createDefaultMarketProfile(): BookMarketProfile {
  return {
    targetAudience: '',
    readerNeed: '',
    valueProposition: '',
    genre: '',
    category: 'non-fiction',
    comparableWorks: [],
    commercialNotes: '',
  };
}

export function validateMarketProfile(profile: BookMarketProfile): string[] {
  const errors: string[] = [];
  if (!profile.targetAudience || profile.targetAudience.trim().length === 0) {
    errors.push('Target audience definition is required.');
  }
  if (!profile.readerNeed || profile.readerNeed.trim().length === 0) {
    errors.push('Core reader need or problem statement is required.');
  }
  if (!profile.valueProposition || profile.valueProposition.trim().length === 0) {
    errors.push('Book value proposition is required.');
  }
  return errors;
}
