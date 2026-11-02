import React, { useState, useEffect } from 'react';
import { localBookRepository } from '../services/localBookRepository';
import { localManuscriptRepository } from '../services/localManuscriptRepository';
import { BookProject } from '../domain/bookProjectTypes';
import { ManuscriptProject, ManuscriptChapter, EditorialReviewReport } from '../domain/manuscript/manuscriptTypes';
import { runContinuityAudit } from '../domain/manuscript/continuityEngine';
import { evaluateE2Readiness } from '../domain/manuscript/e2Readiness';
import { TerminologyPanel } from '../components/manuscript/TerminologyPanel';
import { ContinuityPanel } from '../components/manuscript/ContinuityPanel';
import { E2ReadinessPanel } from '../components/manuscript/E2ReadinessPanel';
import {
  FileText,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Download,
  Plus,
  ArrowLeft,
  Shield,
  Layers,
  Sparkles,
  Edit3,
  Globe,
  Award,
} from 'lucide-react';
import { useI18n } from '../i18n';

export interface ManuscriptStudioPageProps {
  projectId: string;
  onNavigate: (path: string) => void;
}

export const ManuscriptStudioPage: React.FC<ManuscriptStudioPageProps> = ({ projectId, onNavigate }) => {
  const { lang, t } = useI18n();

  const [project, setProject] = useState<BookProject | null>(null);
  const [manuscript, setManuscript] = useState<ManuscriptProject | null>(null);
  const [activeTab, setActiveTab] = useState<'chapters' | 'continuity' | 'terminology' | 'readiness'>('chapters');
  const [loading, setLoading] = useState<boolean>(true);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    loadData(projectId);
  }, [projectId]);

  const loadData = async (pId: string) => {
    setLoading(true);
    try {
      const proj = await localBookRepository.getProjectById(pId);
      if (!proj) {
        setLoading(false);
        return;
      }
      setProject(proj);

      const manu = await localManuscriptRepository.getManuscriptProject(proj);
      setManuscript(manu);
    } catch (err) {
      console.error('Failed to load manuscript project:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveManuscript = async (updated: ManuscriptProject) => {
    setManuscript(updated);
    await localManuscriptRepository.saveManuscriptProject(updated);
    setSaveNotice(lang === 'es' ? 'Manuscrito guardado localmente' : 'Manuscript saved locally');
    setTimeout(() => setSaveNotice(null), 3000);
  };

  const handleAddChapter = () => {
    if (!manuscript) return;
    const newOrder = manuscript.chapters.length + 1;
    const newChapter: ManuscriptChapter = {
      id: `ch_${Date.now()}`,
      blueprintChapterId: `bp_${newOrder}`,
      order: newOrder,
      title: `${lang === 'es' ? 'Capítulo' : 'Chapter'} ${newOrder}`,
      objective: 'Define chapter objectives and core thesis.',
      plannedPages: Math.max(2, Math.round(manuscript.targetPageCount / (newOrder || 10))),
      currentContent: '',
      wordCount: 0,
      charCount: 0,
      estimatedPages: 0,
      status: 'NOT_STARTED',
      versions: [],
      lastEditedBy: 'Author',
      updatedAt: new Date().toISOString(),
    };

    const updatedChapters = [...manuscript.chapters, newChapter];
    const updatedManu: ManuscriptProject = {
      ...manuscript,
      chapters: updatedChapters,
      updatedAt: new Date().toISOString(),
    };

    handleSaveManuscript(updatedManu);
  };

  const handleExportFullManuscriptText = () => {
    if (!manuscript || !project) return;
    const fullText = manuscript.chapters
      .map(
        (ch: ManuscriptChapter) =>
          `========================================\n` +
          `CHAPTER ${ch.order}: ${ch.title.toUpperCase()}\n` +
          `========================================\n\n` +
          `${ch.currentContent || '[Text pending]'}\n\n`
      )
      .join('\n');

    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.title.replace(/\s+/g, '_')}_MANUSCRIPT.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500 text-sm">
        {lang === 'es' ? 'Cargando estudio de manuscrito...' : 'Loading manuscript studio workspace...'}
      </div>
    );
  }

  if (!project || !manuscript) {
    return (
      <div className="max-w-3xl mx-auto py-20 px-4 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-bold text-[#101828]">Proyecto no encontrado</h2>
        <button onClick={() => onNavigate('/studio')} className="text-[#345CFF] underline text-sm font-semibold">
          {t.studio.backToStudio}
        </button>
      </div>
    );
  }

  const reviewReport: EditorialReviewReport = runContinuityAudit(manuscript.chapters, manuscript.targetPageCount);
  const readinessReport = evaluateE2Readiness(manuscript);

  const totalWords = manuscript.chapters.reduce((sum: number, c: ManuscriptChapter) => sum + c.wordCount, 0);

  return (
    <div className="space-y-8 pb-20">
      {/* Top Header Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-4 border border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate(`/studio/${project.id}`)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              title={lang === 'es' ? 'Volver al Proyecto' : 'Back to Project'}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider font-bold text-amber-300 px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/30 rounded-full font-mono">
                  E2 MANUSCRIPT FACTORY™
                </span>
                {saveNotice && (
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                    <CheckCircle2 className="w-3 h-3" /> {saveNotice}
                  </span>
                )}
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight mt-1">{project.title}</h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => onNavigate(`/books/${project.id}/workspace`)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs"
              title={lang === 'es' ? 'Volver al Workspace' : 'Back to Workspace'}
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
              <span>{lang === 'es' ? 'Workspace' : 'Workspace'}</span>
            </button>

            <button
              onClick={() => onNavigate(`/books/${project.id}/visual`)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs"
              title={lang === 'es' ? 'Ir a E3 Producción Visual' : 'Continue to E3 Visuals'}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#345CFF]" />
              <span>{lang === 'es' ? 'E3 Visuales' : 'E3 Visuals'}</span>
            </button>

            <button
              onClick={() => onNavigate(`/books/${project.id}/editorial`)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs"
              title={lang === 'es' ? 'Ir a E4 Maquetación y Exportación' : 'Continue to E4 Editorial'}
            >
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lang === 'es' ? 'E4 Maquetación' : 'E4 Editorial'}</span>
            </button>

            <button
              onClick={() => onNavigate(`/books/${project.id}/publishing/packages`)}
              className="px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs"
              title={lang === 'es' ? 'Abrir Centro de Descargas E5' : 'Open E5 Download Center'}
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'es' ? 'E5 Descargas' : 'E5 Downloads'}</span>
            </button>

            <button
              onClick={() => onNavigate(`/books/${project.id}/translation`)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Globe className="w-3.5 h-3.5 text-purple-400" />
              <span>{lang === 'es' ? 'Traducción' : 'Translation'}</span>
            </button>

            <button
              onClick={handleExportFullManuscriptText}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-amber-300" />
              <span>{lang === 'es' ? 'Exportar TXT' : 'Export TXT'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-t border-slate-800 pt-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('chapters')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 border ${
              activeTab === 'chapters'
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>
              {lang === 'es' ? 'Estructura de Capítulos' : 'Chapter Structure'} ({manuscript.chapters.length})
            </span>
          </button>

          <button
            onClick={() => setActiveTab('continuity')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 border ${
              activeTab === 'continuity'
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            <span>
              {lang === 'es' ? 'Continuidad & Auditoría' : 'Continuity & Audit'} ({reviewReport.issues.length})
            </span>
          </button>

          <button
            onClick={() => setActiveTab('terminology')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 border ${
              activeTab === 'terminology'
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>
              {lang === 'es' ? 'Glosario & Códigos' : 'Glossary & Codes'} ({manuscript.terminology.length})
            </span>
          </button>

          <button
            onClick={() => setActiveTab('readiness')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 border ${
              activeTab === 'readiness'
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Award className="w-4 h-4 text-emerald-400" />
            <span>
              {lang === 'es' ? 'Evaluación E2 / E3' : 'E2 / E3 Readiness'} ({readinessReport.isReadyForE3 ? 'READY' : 'PENDING'})
            </span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto space-y-8">
        {/* TAB 1: CHAPTERS OVERVIEW */}
        {activeTab === 'chapters' && (
          <div className="space-y-6">
            {/* Stats Header */}
            <div className="p-6 bg-white border border-slate-200/90 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-6 shadow-2xs">
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider block font-semibold">
                  {lang === 'es' ? 'Progreso de Redacción' : 'Writing Progress'}
                </span>
                <p className="text-xl font-extrabold text-[#081629] font-mono mt-1">
                  {totalWords.toLocaleString()} {lang === 'es' ? 'palabras' : 'words'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Target: {project.targetPageCount} pages (~{(project.targetPageCount * 250).toLocaleString()} words)
                </p>
              </div>

              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider block font-semibold">
                  {lang === 'es' ? 'Total Capítulos' : 'Total Chapters'}
                </span>
                <p className="text-xl font-extrabold text-[#081629] font-mono mt-1">{manuscript.chapters.length}</p>
                <p className="text-xs text-slate-500 mt-1 font-mono">
                  {manuscript.chapters.filter((c: ManuscriptChapter) => c.status === 'APPROVED' || c.status === 'DRAFT_COMPLETE').length} {lang === 'es' ? 'completados' : 'completed'}
                </p>
              </div>

              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider block font-semibold">
                  {lang === 'es' ? 'Modo de Inteligencia' : 'Intelligence Mode'}
                </span>
                <p className="text-sm font-bold text-[#345CFF] mt-1 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Gemini AI Manuscript Engine
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {lang === 'es' ? 'Asistencia en tiempo real activada' : 'Real-time assistant active'}
                </p>
              </div>
            </div>

            {/* Chapter List Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#081629] uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#345CFF]" />
                <span>{lang === 'es' ? 'Capítulos del Manuscrito' : 'Manuscript Chapters'}</span>
              </h3>
              <button
                onClick={handleAddChapter}
                className="px-4 py-2 bg-[#345CFF] hover:bg-[#2848D8] text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>{lang === 'es' ? 'Añadir Capítulo' : 'Add Chapter'}</span>
              </button>
            </div>

            {/* Chapter Cards */}
            <div className="space-y-4">
              {manuscript.chapters.length === 0 ? (
                <div className="p-8 bg-white border border-dashed border-slate-200 rounded-2xl text-center space-y-3">
                  <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs text-slate-500">
                    {lang === 'es' ? 'No hay capítulos inicializados en este manuscrito.' : 'No chapters initialized in this manuscript yet.'}
                  </p>
                  <button
                    onClick={handleAddChapter}
                    className="px-4 py-2 bg-[#345CFF] text-white font-bold text-xs rounded-xl"
                  >
                    {lang === 'es' ? 'Crear Primer Capítulo' : 'Create First Chapter'}
                  </button>
                </div>
              ) : (
                manuscript.chapters.map((ch: ManuscriptChapter) => (
                  <div
                    key={ch.id}
                    className="p-5 bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all shadow-2xs"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-mono font-bold text-[#345CFF]">
                          CAP. {ch.order}
                        </span>
                        <h4 className="text-sm font-bold text-[#101828]">{ch.title}</h4>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                            ch.status === 'APPROVED' || ch.status === 'DRAFT_COMPLETE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ch.status === 'IN_PROGRESS'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {ch.status}
                        </span>
                      </div>
                      {ch.objective && <p className="text-xs text-slate-500 line-clamp-1">{ch.objective}</p>}
                      <div className="flex items-center gap-4 text-[11px] text-slate-500 font-mono">
                        <span>
                          {ch.wordCount.toLocaleString()} {lang === 'es' ? 'palabras' : 'words'}
                        </span>
                        <span>{ch.estimatedPages} {lang === 'es' ? 'páginas est.' : 'est. pgs'}</span>
                        <span>{ch.versions?.length || 0} {lang === 'es' ? 'revisiones' : 'revisions'}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onNavigate(`/books/${project.id}/manuscript/${ch.id}`)}
                      className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#101828] font-bold text-xs rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-2"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#345CFF]" />
                      <span>{lang === 'es' ? 'Abrir Editor' : 'Open Editor'}</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 2: CONTINUITY AUDIT */}
        {activeTab === 'continuity' && (
          <ContinuityPanel report={reviewReport} onRunAudit={() => loadData(project.id)} />
        )}

        {/* TAB 3: TERMINOLOGY GUARDIAN */}
        {activeTab === 'terminology' && (
          <TerminologyPanel
            entries={manuscript.terminology}
            protectedPatterns={manuscript.terminology
              .filter((t) => t.isProtectedCodeOrFormula)
              .map((t) => t.termEn || t.termEs)}
            onUpdateEntries={(updatedEntries) => {
              handleSaveManuscript({ ...manuscript, terminology: updatedEntries });
            }}
            onUpdateProtectedPatterns={() => {}}
          />
        )}

        {/* TAB 4: READINESS EVALUATION */}
        {activeTab === 'readiness' && (
          <E2ReadinessPanel
            report={readinessReport}
            onProceedToE3={() => {
              handleSaveManuscript({
                ...manuscript,
                status: 'READY_FOR_E3_VISUALS',
              });
            }}
          />
        )}
      </main>
    </div>
  );
};
