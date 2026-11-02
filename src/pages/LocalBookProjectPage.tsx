import React, { useState, useEffect } from 'react';
import { useI18n } from '../i18n';
import { PageHero } from '../components/ui/PageHero';
import { PremiumButton } from '../components/ui/PremiumButton';
import { InfinityCard } from '../components/ui/InfinityCard';
import { BookProject } from '../domain/bookProjectTypes';
import { E1BookPackage } from '../domain/intelligence/bookIntelligenceTypes';
import { localBookRepository } from '../services/localBookRepository';
import { localBookIntelligenceRepository } from '../services/localBookIntelligenceRepository';

export interface LocalBookProjectPageProps {
  projectId: string;
  onNavigate: (path: string) => void;
}

export const LocalBookProjectPage: React.FC<LocalBookProjectPageProps> = ({ projectId, onNavigate }) => {
  const { t } = useI18n();
  const [project, setProject] = useState<BookProject | null>(null);
  const [e1Package, setE1Package] = useState<E1BookPackage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProj = async () => {
      setLoading(true);
      const data = await localBookRepository.getProjectById(projectId);
      if (data) {
        setProject(data);
        const pkg = await localBookIntelligenceRepository.getE1Package(data);
        setE1Package(pkg);
      }
      setLoading(false);
    };
    fetchProj();
  }, [projectId]);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500 text-sm">
        Loading project workspace...
      </div>
    );
  }

  if (!project || !e1Package) {
    return (
      <div className="max-w-3xl mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="text-2xl font-bold text-[#101828]">Project Not Found</h2>
        <p className="text-xs text-slate-500">
          The requested book project ID "{projectId}" does not exist in local IndexedDB storage.
        </p>
        <div>
          <PremiumButton variant="outline" size="md" onClick={() => onNavigate('/studio')}>
            {t.studio.backToStudio}
          </PremiumButton>
        </div>
      </div>
    );
  }

  // Manuscript / source text statistics calculation
  const sourceText = project.sourceText || '';
  const wordCount = sourceText.trim() ? sourceText.trim().split(/\s+/).length : 0;
  const charCount = sourceText.length;
  const estStandardPages = Math.round(wordCount / 250);

  const handleExportFullPackage = () => {
    const fullData = {
      project,
      e1IntelligencePackage: e1Package,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `editoryniq_${project.id}_e1_blueprint.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-10 pb-20">
      <PageHero
        title={project.title}
        subtitle={`${project.mode === 'idea' ? t.studio.modeIdea : t.studio.modeManuscript} · ${project.targetPageCount} pages (${project.lengthClass}) · ${project.productionLanguage.toUpperCase()}`}
        badge={e1Package.status}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Navigation bar & Download Center Spotlight */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <button
              onClick={() => onNavigate('/studio')}
              className="text-xs font-semibold text-[#345CFF] hover:underline flex items-center gap-1"
            >
              {t.studio.backToStudio}
            </button>

            <div className="flex items-center gap-2">
              <PremiumButton
                variant="gold"
                size="sm"
                onClick={() => onNavigate(`/books/${project.id}/publishing/packages`)}
              >
                📥 Enterprise Download Center™ (E5)
              </PremiumButton>

              <PremiumButton
                variant="outline"
                size="sm"
                onClick={handleExportFullPackage}
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                }
              >
                {t.studio.exportProjectData}
              </PremiumButton>
            </div>
          </div>

          {/* Workflow Pipeline Quick Navigation Banner */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  EditorynIQ™ Production Pipeline & Delivery Hub
                </h4>
              </div>
              <span className="text-3xs font-mono text-amber-300 font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                E1 → E2 → E3 → E4 → E5
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <button
                onClick={() => onNavigate(`/books/${project.id}/blueprint`)}
                className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-left transition border border-slate-700/60"
              >
                <div className="text-[10px] text-slate-400 font-mono font-bold">STAGE E1</div>
                <div className="text-xs font-bold text-white truncate">Book Intelligence</div>
              </button>

              <button
                onClick={() => onNavigate(`/books/${project.id}/manuscript`)}
                className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-left transition border border-slate-700/60"
              >
                <div className="text-[10px] text-amber-400 font-mono font-bold">STAGE E2</div>
                <div className="text-xs font-bold text-white truncate">Manuscript Factory</div>
              </button>

              <button
                onClick={() => onNavigate(`/books/${project.id}/visual`)}
                className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-left transition border border-slate-700/60"
              >
                <div className="text-[10px] text-cyan-400 font-mono font-bold">STAGE E3</div>
                <div className="text-xs font-bold text-white truncate">Visual Production</div>
              </button>

              <button
                onClick={() => onNavigate(`/books/${project.id}/editorial`)}
                className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-left transition border border-slate-700/60"
              >
                <div className="text-[10px] text-emerald-400 font-mono font-bold">STAGE E4</div>
                <div className="text-xs font-bold text-white truncate">Editorial & Quality</div>
              </button>

              <button
                onClick={() => onNavigate(`/books/${project.id}/publishing/packages`)}
                className="p-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-left transition border border-amber-500/40 col-span-2 sm:col-span-1"
              >
                <div className="text-[10px] text-amber-300 font-mono font-bold">STAGE E5</div>
                <div className="text-xs font-bold text-amber-200 truncate">Download Center</div>
              </button>
            </div>
          </div>
        </div>

        {/* E1 Book Intelligence Modules Navigation Cards */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#081629]">
            E1 Book Intelligence Modules™
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <InfinityCard
              title="Research & Evidence™"
              subtitle="Module 1"
              description={`${e1Package.researchSources.length} sources logged. Manage factual citations, verified URLs, and claim links.`}
              accentColor="royal"
              onClick={() => onNavigate(`/books/${project.id}/research`)}
            />

            <InfinityCard
              title="Book Blueprint Builder™"
              subtitle="Module 2"
              description={`${e1Package.blueprint.chapters.length} chapters defined. Allocate page budgets and structure section outlines.`}
              accentColor="turquoise"
              onClick={() => onNavigate(`/books/${project.id}/blueprint`)}
            />

            <InfinityCard
              title="Book Master Brain™"
              subtitle="Module 3"
              description={`${e1Package.memoryEntries.length} memory entries. Maintain concepts, glossary terms, and style rules.`}
              accentColor="gold"
              onClick={() => onNavigate(`/books/${project.id}/memory`)}
            />

            <InfinityCard
              title="Manuscript Factory™"
              subtitle="E2 Module 4"
              description="Write, edit, correct, translate and version full 20–600 page book manuscripts with Gemini AI guidance."
              accentColor="royal"
              onClick={() => onNavigate(`/books/${project.id}/manuscript`)}
            />

            <InfinityCard
              title="Visual Production™"
              subtitle="E3 Module 5"
              description="Fabricate book covers, illustrations, technical diagrams, data charts, infographics & asset library."
              accentColor="turquoise"
              onClick={() => onNavigate(`/books/${project.id}/visual`)}
            />

            <InfinityCard
              title="Editorial & Quality™"
              subtitle="E4 Module 6"
              description="Transform manuscripts & visuals into paginated books, PDF/EPUB/DOCX exports & Quality Passports."
              accentColor="gold"
              onClick={() => onNavigate(`/books/${project.id}/editorial`)}
            />

            <InfinityCard
              title="Publishing & Distribution™"
              subtitle="E5 Module 7"
              description="Prepare editions, three-tier metadata, channel profiles (KDP, IngramSpark, D2D), and verified publication packages."
              accentColor="royal"
              onClick={() => onNavigate(`/books/${project.id}/publishing`)}
            />

            <InfinityCard
              title="Marketplace & Commerce™"
              subtitle="E6 Module 8"
              description="Multi-author local catalog, product details, author profiles, seller workspace, personal library, and operations."
              accentColor="turquoise"
              onClick={() => onNavigate('/marketplace')}
            />

            <InfinityCard
              title="Production Operations™"
              subtitle="Operations & Delivery · Module 9"
              description="Consolidate E1–E6 telemetry, verified local deliverables (PDF, EPUB, DOCX, ZIP, Passports), integrity checks & full project recovery."
              accentColor="gold"
              onClick={() => onNavigate(`/books/${project.id}/operations`)}
            />
          </div>
        </div>

        {/* Project Parameters Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-2xs">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#101828]">{t.studio.projectSummary}</h3>
            <span className="text-xs font-mono text-slate-400">ID: {project.id}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs text-slate-700 border-t border-slate-100 pt-6">
            <div>
              <span className="text-slate-400 block mb-1">Production Mode:</span>
              <span className="font-bold text-sm text-[#101828]">
                {project.mode === 'idea' ? 'Book From Idea™' : 'Manuscript to Book™'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Target Page Budget:</span>
              <span className="font-bold text-sm text-[#101828]">
                {project.targetPageCount} Pages ({project.lengthClass === 'standard' ? 'Standard 20–300' : 'Extended 301–600'})
              </span>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Production Language:</span>
              <span className="font-bold text-sm text-[#101828]">
                {project.productionLanguage === 'en' ? 'English' : 'Español'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Editorial Profile:</span>
              <span className="font-bold text-sm text-[#101828] capitalize">
                {project.profile.replace('-', ' ')}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Category:</span>
              <span className="font-bold text-sm text-[#101828] capitalize">
                {project.category.replace('-', ' ')}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Created Date:</span>
              <span className="font-mono text-slate-600">
                {new Date(project.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Objective */}
          <div className="border-t border-slate-100 pt-4 space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Description / Objective</span>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              {project.description}
            </p>
          </div>

          {/* Audience & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Target Audience</span>
              <p className="text-xs text-slate-700">{project.targetAudience}</p>
            </div>
            {project.authorNotes && (
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Author Notes</span>
                <p className="text-xs text-slate-700">{project.authorNotes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Source Text & Manuscript Stats (if provided) */}
        {project.sourceText && (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-2xs">
            <h3 className="text-lg font-bold text-[#101828]">{t.studio.sourceTextStatsTitle}</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
                <span className="text-xs text-slate-500 block">{t.studio.wordCount}</span>
                <span className="text-2xl font-extrabold font-mono text-[#081629]">{wordCount.toLocaleString()}</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
                <span className="text-xs text-slate-500 block">{t.studio.charCount}</span>
                <span className="text-2xl font-extrabold font-mono text-[#081629]">{charCount.toLocaleString()}</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
                <span className="text-xs text-slate-500 block">{t.studio.estimatedPages}</span>
                <span className="text-2xl font-extrabold font-mono text-[#345CFF]">{estStandardPages}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Source Draft Preview</span>
                {project.sourceFileName && <span>Filename: {project.sourceFileName}</span>}
              </div>
              <div className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs max-h-60 overflow-y-auto leading-relaxed border border-slate-800">
                {project.sourceText}
              </div>
            </div>
          </div>
        )}

        {/* Blueprint Readiness Status */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-4 border border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${e1Package.blueprint.approved ? 'bg-[#16836D]' : 'bg-[#E9BC72]'}`} />
              <h3 className="text-lg font-bold text-white">{t.studio.blueprintStatusHeading}</h3>
            </div>
            <PremiumButton variant="gold" size="sm" onClick={() => onNavigate(`/books/${project.id}/blueprint`)}>
              Open Blueprint Editor
            </PremiumButton>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {e1Package.blueprint.approved
              ? `E1 Book Blueprint™ Approved (Version ${e1Package.blueprint.version}). Ready for E2 Manuscript Factory™ in future modules.`
              : 'E1 Book Blueprint™ in progress. Complete research, chapter outlines, and page budget to authorize readiness.'}
          </p>

          <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800">
            <span>Status: {e1Package.status}</span>
            <span>Local Device Storage: Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
