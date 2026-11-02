import React, { useState, useEffect } from 'react';
import { useI18n } from '../i18n';
import { PageHero } from '../components/ui/PageHero';
import { PremiumButton } from '../components/ui/PremiumButton';
import { BookProject } from '../domain/bookProjectTypes';
import { localBookRepository } from '../services/localBookRepository';

export interface StudioPageProps {
  onNavigate: (path: string) => void;
}

export const StudioPage: React.FC<StudioPageProps> = ({ onNavigate }) => {
  const { t } = useI18n();
  const [projects, setProjects] = useState<BookProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const data = await localBookRepository.getAllProjects();
      setProjects(data);
    } catch (err) {
      console.error('Error loading local projects:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    await localBookRepository.deleteProject(deleteTargetId);
    setDeleteTargetId(null);
    await loadProjects();
  };

  const handleExportJson = (project: BookProject) => {
    localBookRepository.exportProjectJson(project);
  };

  return (
    <div className="space-y-12 pb-20">
      <PageHero
        title={t.studio.title}
        subtitle={t.studio.subtitle}
        badge={t.hero.badgeLocal}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <div>
            <h2 className="text-xl font-bold text-[#101828]">{t.studio.projectListTitle}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {projects.length} project(s) stored locally in browser IndexedDB
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('/marketplace')}
              className="text-xs font-semibold px-3.5 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Marketplace & Commerce™
            </button>

            <PremiumButton
              variant="primary"
              size="md"
              onClick={() => onNavigate('/start')}
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              {t.studio.createNew}
            </PremiumButton>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500 text-sm">
            Loading local book projects...
          </div>
        )}

        {/* Empty State */}
        {!isLoading && projects.length === 0 && (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-[#101828]">{t.studio.noProjectsTitle}</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">{t.studio.noProjectsDesc}</p>
            <div>
              <PremiumButton variant="primary" size="md" onClick={() => onNavigate('/start')}>
                {t.studio.createNew}
              </PremiumButton>
            </div>
          </div>
        )}

        {/* Project List */}
        {!isLoading && projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {proj.id}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded ${
                        proj.status === 'READY_FOR_BLUEPRINT'
                          ? 'bg-[#16836D]/15 text-[#16836D]'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {proj.status === 'READY_FOR_BLUEPRINT' ? t.studio.statusReady : t.studio.statusDraft}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#101828] line-clamp-1">{proj.title}</h3>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {proj.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-slate-400 block">Mode:</span>
                      <span className="font-semibold">
                        {proj.mode === 'idea' ? t.studio.modeIdea : t.studio.modeManuscript}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block">Target Pages:</span>
                      <span className="font-semibold">
                        {proj.targetPageCount} {t.studio.pagesCount} ({proj.lengthClass})
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block">Language:</span>
                      <span className="font-semibold">
                        {proj.productionLanguage === 'en' ? 'English' : 'Español'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block">Profile:</span>
                      <span className="font-semibold capitalize">{proj.profile.replace('-', ' ')}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleExportJson(proj)}
                      className="p-2 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-colors"
                      title={t.studio.exportJson}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>

                    <button
                      onClick={() => setDeleteTargetId(proj.id)}
                      className="p-2 text-slate-400 hover:text-[#D14343] rounded-md hover:bg-red-50 transition-colors"
                      title={t.studio.deleteProject}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  <PremiumButton
                    variant="primary"
                    size="sm"
                    onClick={() => onNavigate(`/studio/${proj.id}`)}
                  >
                    {t.studio.openProject}
                  </PremiumButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold text-[#101828]">{t.studio.deleteConfirmTitle}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t.studio.deleteConfirmText}
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTargetId(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                {t.studio.cancelDeleteBtn}
              </button>
              <PremiumButton variant="danger" size="sm" onClick={handleDeleteConfirm}>
                {t.studio.confirmDeleteBtn}
              </PremiumButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
