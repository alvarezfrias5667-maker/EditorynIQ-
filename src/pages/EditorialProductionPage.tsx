import React, { useState, useEffect } from 'react';
import { useI18n } from '../i18n';
import { EditorialEdition, E4ReadinessReport } from '../domain/editorial/editorialTypes';
import { localEditorialRepository } from '../services/localEditorialRepository';
import { localBookRepository } from '../services/localBookRepository';
import { compileDerivedEdition } from '../domain/editorial/editorialDocumentBuilder';
import { evaluateE4Readiness } from '../domain/editorial/e4Readiness';
import { EditorialSettingsPanel } from '../components/editorial/EditorialSettingsPanel';

export interface EditorialProductionPageProps {
  projectId: string;
  onNavigate: (path: string) => void;
}

export const EditorialProductionPage: React.FC<EditorialProductionPageProps> = ({ projectId, onNavigate }) => {
  const { t } = useI18n();

  const [edition, setEdition] = useState<EditorialEdition | null>(null);
  const [readiness, setReadiness] = useState<E4ReadinessReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;

    const loadData = async () => {
      setLoading(true);
      const existingEditions = await localEditorialRepository.getEditionsByBookId(projectId);

      if (existingEditions.length > 0) {
        setEdition(existingEditions[0]);
        setReadiness(evaluateE4Readiness(existingEditions[0]));
      } else {
        const bookProject = await localBookRepository.getProjectById(projectId);
        if (bookProject) {
          const newEdition = compileDerivedEdition(
            bookProject.id,
            bookProject.title,
            bookProject.productionLanguage || 'en',
            bookProject.profile === 'visual-first' ? 'visual-first' : bookProject.profile === 'technical-first' ? 'technical-first' : 'text-first',
            bookProject.targetPageCount || 100,
            [
              {
                id: 'ch1',
                blueprintChapterId: 'bp_ch1',
                order: 1,
                title: 'Chapter 1: The First Principle',
                objective: 'Establish core editorial foundation',
                plannedPages: 10,
                currentContent: 'In the beginning of book production, structure precedes prose. Every chapter establishes a thematic anchor for the publication.',
                wordCount: 320,
                charCount: 1800,
                estimatedPages: 2,
                status: 'APPROVED',
                versions: [],
                lastEditedBy: 'author',
                updatedAt: new Date().toISOString(),
              },
              {
                id: 'ch2',
                blueprintChapterId: 'bp_ch2',
                order: 2,
                title: 'Chapter 2: Typographic Mathematics',
                objective: 'Explain layout geometry and font scaling',
                plannedPages: 12,
                currentContent: 'Typography is the physical manifestation of thought on paper. Margins, line lengths, and font pairings dictate legibility.',
                wordCount: 410,
                charCount: 2200,
                estimatedPages: 3,
                status: 'APPROVED',
                versions: [],
                lastEditedBy: 'author',
                updatedAt: new Date().toISOString(),
              },
            ]
          );

          await localEditorialRepository.saveEdition(newEdition);
          setEdition(newEdition);
          setReadiness(evaluateE4Readiness(newEdition));
        }
      }
      setLoading(false);
    };

    loadData();
  }, [projectId]);

  const handleSaveEdition = async (updated: EditorialEdition): Promise<boolean> => {
    const res = await localEditorialRepository.saveEdition(updated);
    if (res.success) {
      setEdition(updated);
      setReadiness(evaluateE4Readiness(updated));
      return true;
    }
    return false;
  };

  return (
    <div className="py-8 space-y-8">
      {/* Header Breadcrumb & Hub Title */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-2xs font-mono text-slate-500">
          <button onClick={() => onNavigate('/studio')} className="hover:underline">Studio Workspace</button>
          <span>/</span>
          <button onClick={() => onNavigate(`/studio/${projectId}`)} className="hover:underline">Book Project</button>
          <span>/</span>
          <span className="text-[#345CFF] font-bold">E4 Editorial & Quality</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div>
            <span className="text-2xs font-bold uppercase tracking-wider text-[#345CFF] bg-blue-50 px-2.5 py-1 rounded-md">
              E4 EDITORIAL ENGINE
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#081629] mt-2">{t.editorial.hubTitle}</h1>
            <p className="text-xs text-slate-500 max-w-2xl mt-1">{t.editorial.hubSubtitle}</p>
          </div>

          {readiness && (
            <div className="bg-slate-900 text-white p-4 rounded-xl text-center font-mono shrink-0">
              <span className="text-3xs uppercase text-slate-400 font-bold block">E4 Readiness Score</span>
              <div className="text-2xl font-bold text-[#16C8BA] mt-0.5">{readiness.overallScore} / 100</div>
            </div>
          )}
        </div>
      </div>

      {/* E4 Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => onNavigate(`/books/${projectId}/editorial`)}
          className="px-4 py-2 text-xs font-bold rounded-lg bg-white text-[#081629] border border-slate-200 shadow-2xs whitespace-nowrap"
        >
          Overview & Builder
        </button>
        <button
          onClick={() => onNavigate(`/books/${projectId}/editorial/layout`)}
          className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg whitespace-nowrap"
        >
          {t.editorial.navLayout}
        </button>
        <button
          onClick={() => onNavigate(`/books/${projectId}/editorial/preview`)}
          className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg whitespace-nowrap"
        >
          {t.editorial.navPreview}
        </button>
        <button
          onClick={() => onNavigate(`/books/${projectId}/editorial/exports`)}
          className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg whitespace-nowrap"
        >
          {t.editorial.navExports}
        </button>
        <button
          onClick={() => onNavigate(`/books/${projectId}/editorial/quality`)}
          className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg whitespace-nowrap"
        >
          {t.editorial.navQuality}
        </button>
        <button
          onClick={() => onNavigate(`/books/${projectId}/editorial/accessibility`)}
          className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg whitespace-nowrap"
        >
          {t.editorial.navAccessibility}
        </button>
      </div>

      {/* Loading or Main Builder Panel */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-2xl border">Loading E4 Editorial Engine...</div>
      ) : edition ? (
        <EditorialSettingsPanel edition={edition} onSaveEdition={handleSaveEdition} />
      ) : (
        <div className="p-12 text-center text-xs text-rose-600 bg-rose-50 rounded-2xl border border-rose-200">
          Book project not found. Initialize project from Studio first.
        </div>
      )}
    </div>
  );
};
