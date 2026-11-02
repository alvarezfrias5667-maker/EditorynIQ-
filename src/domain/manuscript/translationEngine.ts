import { TranslationDraft, ManuscriptChapter } from './manuscriptTypes';
import { ProductionLanguage } from '../bookProjectTypes';

export function createTranslationDraft(
  chapter: ManuscriptChapter,
  sourceLang: ProductionLanguage,
  targetLang: ProductionLanguage
): TranslationDraft {
  if (sourceLang === targetLang) {
    throw new Error('Source and target languages must be different.');
  }

  return {
    id: `trans_${chapter.id}_${sourceLang}_${targetLang}`,
    chapterId: chapter.id,
    sourceLang,
    targetLang,
    originalText: chapter.currentContent,
    translatedText: '',
    status: 'DRAFT',
    updatedAt: new Date().toISOString(),
  };
}
