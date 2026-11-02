import React, { useState, useEffect } from 'react';
import { localBookRepository } from '../services/localBookRepository';
import { localManuscriptRepository } from '../services/localManuscriptRepository';
import { BookProject } from '../domain/bookProjectTypes';
import { ManuscriptProject, TranslationDraft } from '../domain/manuscript/manuscriptTypes';
import { TranslationPanel } from '../components/manuscript/TranslationPanel';
import { ArrowLeft, Globe, AlertCircle } from 'lucide-react';
import { useI18n } from '../i18n';

export interface BookTranslationPageProps {
  projectId: string;
  onNavigate: (path: string) => void;
}

export const BookTranslationPage: React.FC<BookTranslationPageProps> = ({ projectId, onNavigate }) => {
  const { lang } = useI18n();

  const [project, setProject] = useState<BookProject | null>(null);
  const [manuscript, setManuscript] = useState<ManuscriptProject | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!projectId) return;
    loadData(projectId);
  }, [projectId]);

  const loadData = async (pId: string) => {
    setLoading(true);
    try {
      const proj = await localBookRepository.getProjectById(pId);
      if (proj) setProject(proj);

      if (proj) {
        const manu = await localManuscriptRepository.getManuscriptProject(proj);
        setManuscript(manu);
        if (manu.chapters.length > 0) {
          setSelectedChapterId(manu.chapters[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load translation data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTranslation = async (chapterId: string, translatedText: string, targetLang: 'es' | 'en') => {
    if (!manuscript) return;

    const draft: TranslationDraft = {
      id: `trans_${chapterId}_${targetLang}`,
      chapterId,
      sourceLang: targetLang === 'es' ? 'en' : 'es',
      targetLang,
      originalText: manuscript.chapters.find((c) => c.id === chapterId)?.currentContent || '',
      translatedText,
      status: 'APPROVED',
      updatedAt: new Date().toISOString(),
    };

    await localManuscriptRepository.saveTranslationDraft(manuscript, draft);

    const updatedManu = await localManuscriptRepository.getManuscriptProject(project!);
    setManuscript(updatedManu);
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500 text-sm">
        {lang === 'es' ? 'Cargando estudio de traducción...' : 'Loading translation studio workspace...'}
      </div>
    );
  }

  if (!project || !manuscript) {
    return (
      <div className="max-w-3xl mx-auto py-20 px-4 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-bold text-[#101828]">Proyecto no encontrado</h2>
        <button onClick={() => onNavigate(`/studio/${projectId}`)} className="text-[#345CFF] underline text-sm font-semibold">
          Volver al Proyecto
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-6 flex items-center justify-between border border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate(`/books/${project.id}/manuscript`)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            title={lang === 'es' ? 'Volver al Estudio de Manuscrito' : 'Back to Manuscript Studio'}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono font-bold text-purple-400 px-2.5 py-0.5 bg-purple-500/10 border border-purple-500/30 rounded-full flex items-center gap-1">
                <Globe className="w-3 h-3" /> BILINGUAL TRANSLATION STUDIO
              </span>
            </div>
            <h1 className="text-lg font-bold text-white mt-0.5">{project.title}</h1>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto">
        <TranslationPanel
          chapters={manuscript.chapters}
          translations={manuscript.translations}
          selectedChapterId={selectedChapterId}
          onSelectChapter={setSelectedChapterId}
          onSaveTranslation={handleSaveTranslation}
        />
      </main>
    </div>
  );
};
