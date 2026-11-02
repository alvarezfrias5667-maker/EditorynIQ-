import React, { useState, useEffect } from 'react';
import { localBookRepository } from '../services/localBookRepository';
import { localManuscriptRepository } from '../services/localManuscriptRepository';
import { BookProject } from '../domain/bookProjectTypes';
import { ManuscriptProject, ManuscriptChapter, ChapterVersion } from '../domain/manuscript/manuscriptTypes';
import { ChapterNavigator } from '../components/manuscript/ChapterNavigator';
import { WritingControls } from '../components/manuscript/WritingControls';
import { ManuscriptEditor } from '../components/manuscript/ManuscriptEditor';
import { RevisionHistoryPanel } from '../components/manuscript/RevisionHistoryPanel';
import { ArrowLeft, CheckCircle2, History, AlertCircle } from 'lucide-react';
import { useI18n } from '../i18n';

export interface ManuscriptChapterPageProps {
  projectId: string;
  chapterId: string;
  onNavigate: (path: string) => void;
}

export const ManuscriptChapterPage: React.FC<ManuscriptChapterPageProps> = ({ projectId, chapterId, onNavigate }) => {
  const { lang } = useI18n();

  const [project, setProject] = useState<BookProject | null>(null);
  const [manuscript, setManuscript] = useState<ManuscriptProject | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

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
      }
    } catch (err) {
      console.error('Failed to load manuscript chapter data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500 text-sm">
        {lang === 'es' ? 'Cargando editor de capítulo...' : 'Loading chapter editor workspace...'}
      </div>
    );
  }

  if (!project || !manuscript) {
    return (
      <div className="max-w-3xl mx-auto py-20 px-4 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-bold text-[#101828]">Manuscrito no encontrado</h2>
        <button onClick={() => onNavigate(`/studio/${projectId}`)} className="text-[#345CFF] underline text-sm font-semibold">
          Volver al Proyecto
        </button>
      </div>
    );
  }

  const currentChapter = manuscript.chapters.find((c) => c.id === chapterId) || manuscript.chapters[0];

  const handleSaveChapterContent = async (newContent: string, authorNote?: string): Promise<boolean> => {
    if (!currentChapter || !project) return false;

    const res = await localManuscriptRepository.updateChapterText(
      project,
      manuscript,
      currentChapter.id,
      newContent,
      authorNote,
      'author'
    );

    setManuscript(res.updatedProject);
    setSaveStatus(lang === 'es' ? 'Guardado' : 'Saved');
    setTimeout(() => setSaveStatus(null), 2500);
    return res.savedSuccessfully;
  };

  const handleAppendTextFromAI = (generated: string) => {
    if (!currentChapter) return;
    const combined = (currentChapter.currentContent || '') + generated;
    handleSaveChapterContent(combined, 'AI Prose Continuation');
  };

  const handleReplaceTextFromAI = (generated: string) => {
    handleSaveChapterContent(generated, 'AI Prose Rewrite');
  };

  const handleRestoreVersion = (version: ChapterVersion) => {
    if (!currentChapter) return;
    handleSaveChapterContent(version.content, `Restored to version ${version.versionNumber}`);
  };

  const handleCreateSnapshot = (summary: string) => {
    if (!currentChapter) return;
    handleSaveChapterContent(currentChapter.currentContent, summary);
  };

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
              <span className="text-[10px] uppercase font-mono font-bold text-amber-300 px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 rounded-full">
                {project.title}
              </span>
              {saveStatus && (
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-3 h-3" /> {saveStatus}
                </span>
              )}
            </div>
            <h1 className="text-base font-bold text-white truncate mt-0.5">
              Cap. {currentChapter?.order}: {currentChapter?.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
              showHistory
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <History className="w-4 h-4 text-amber-400" />
            <span>{lang === 'es' ? 'Historial de Revisiones' : 'Revision History'}</span>
          </button>
        </div>
      </div>

      {/* Main Workspace split */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar: Chapter Navigator */}
        <div className="lg:col-span-1">
          <ChapterNavigator
            chapters={manuscript.chapters}
            selectedChapterId={currentChapter?.id || ''}
            onSelectChapter={(chapId) => onNavigate(`/books/${project.id}/manuscript/${chapId}`)}
          />
        </div>

        {/* Center / Right: Editor & Controls */}
        <div className="lg:col-span-3 space-y-6">
          {showHistory ? (
            <RevisionHistoryPanel
              versions={currentChapter?.versions || []}
              onRestoreVersion={handleRestoreVersion}
              onCreateSnapshot={handleCreateSnapshot}
            />
          ) : (
            <>
              {/* AI Writing Controls */}
              <WritingControls
                chapterTitle={currentChapter?.title || ''}
                currentText={currentChapter?.currentContent || ''}
                language={project.productionLanguage}
                onAppendText={handleAppendTextFromAI}
                onReplaceText={handleReplaceTextFromAI}
              />

              {/* Manuscript Editor */}
              <ManuscriptEditor
                chapter={currentChapter}
                onSaveContent={handleSaveChapterContent}
                onOpenHistory={() => setShowHistory(true)}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
