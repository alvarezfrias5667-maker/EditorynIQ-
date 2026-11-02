import React, { useState, useEffect } from 'react';
import { useI18n } from '../i18n';
import { PageHero } from '../components/ui/PageHero';
import { PremiumButton } from '../components/ui/PremiumButton';
import { BookProject } from '../domain/bookProjectTypes';
import { E1BookPackage, BookBlueprint, PageBudget, ResearchSource } from '../domain/intelligence/bookIntelligenceTypes';
import { syncBudgetWithBlueprint } from '../domain/intelligence/pageBudgetEngine';
import { localBookRepository } from '../services/localBookRepository';
import { localBookIntelligenceRepository } from '../services/localBookIntelligenceRepository';
import { ChapterStructurePanel } from '../components/intelligence/ChapterStructurePanel';
import { PageBudgetPanel } from '../components/intelligence/PageBudgetPanel';
import { E1ReadinessPanel } from '../components/intelligence/E1ReadinessPanel';

export interface BookBlueprintPageProps {
  projectId: string;
  onNavigate: (path: string) => void;
}

export const BookBlueprintPage: React.FC<BookBlueprintPageProps> = ({ projectId, onNavigate }) => {
  const { t } = useI18n();

  const [project, setProject] = useState<BookProject | null>(null);
  const [e1Package, setE1Package] = useState<E1BookPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const proj = await localBookRepository.getProjectById(projectId);
      if (proj) {
        setProject(proj);
        const pkg = await localBookIntelligenceRepository.getE1Package(proj);
        setE1Package(pkg);
      }
      setLoading(false);
    };
    load();
  }, [projectId]);

  if (loading) return <div className="py-20 text-center text-slate-500 text-sm">Loading Blueprint Editor...</div>;

  if (!project || !e1Package) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-[#101828]">Project Not Found</h2>
        <PremiumButton variant="outline" size="sm" onClick={() => onNavigate('/studio')}>
          Back to Studio
        </PremiumButton>
      </div>
    );
  }

  const handleUpdateBlueprint = async (blueprint: BookBlueprint) => {
    const updatedBudget = syncBudgetWithBlueprint(e1Package.pageBudget, blueprint);
    const updatedPackage = { ...e1Package, blueprint, pageBudget: updatedBudget };
    const saved = await localBookIntelligenceRepository.saveE1Package(updatedPackage);
    if (!saved) {
      setSaveError('Storage Error: Unable to persist blueprint to browser storage. Your changes remain in memory.');
    } else {
      setSaveError(null);
    }
    setE1Package(updatedPackage);
  };

  const handleUpdateBudget = async (pageBudget: PageBudget) => {
    const updatedPackage = { ...e1Package, pageBudget };
    const saved = await localBookIntelligenceRepository.saveE1Package(updatedPackage);
    if (!saved) {
      setSaveError('Storage Error: Unable to persist page budget to browser storage. Your changes remain in memory.');
    } else {
      setSaveError(null);
    }
    setE1Package(updatedPackage);
  };

  const handleApproveBlueprint = async (approverName: string) => {
    const updated = await localBookIntelligenceRepository.approveE1Blueprint(project, e1Package, approverName);
    setE1Package({ ...updated });
    setSaveError(null);
  };

  const handleRecoveryExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ project, e1Package }, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `recovery_${project.id}_blueprint.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="space-y-10 pb-20">
      <PageHero
        title={`Book Blueprint & Page Budget — ${project.title}`}
        subtitle={`Architectural structure, chapter ordering, and ${project.targetPageCount}-page budget math`}
        badge={e1Package.status}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 text-xs font-semibold">
          <button onClick={() => onNavigate(`/studio/${project.id}`)} className="text-[#345CFF] hover:underline">
            ← Back to Project Workspace
          </button>

          <div className="flex items-center gap-3">
            <button onClick={() => onNavigate(`/books/${project.id}/research`)} className="text-slate-600 hover:text-slate-900">
              Research Sources →
            </button>
            <button onClick={() => onNavigate(`/books/${project.id}/memory`)} className="text-slate-600 hover:text-slate-900">
              Master Memory →
            </button>
          </div>
        </div>

        {saveError && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex items-center justify-between gap-4 text-xs font-semibold">
            <span>⚠ {saveError}</span>
            <PremiumButton variant="outline" size="sm" onClick={handleRecoveryExport}>
              Export Recovery Data (JSON)
            </PremiumButton>
          </div>
        )}

        {/* Chapter Architecture */}
        <ChapterStructurePanel blueprint={e1Package.blueprint} onUpdateBlueprint={handleUpdateBlueprint} />

        {/* Page Budget Math */}
        <PageBudgetPanel pageBudget={e1Package.pageBudget} onUpdateBudget={handleUpdateBudget} />

        {/* E1 Readiness & Explicit Approval */}
        <E1ReadinessPanel
          readinessReport={e1Package.readinessReport}
          onApproveBlueprint={handleApproveBlueprint}
          isApproved={Boolean(e1Package.blueprint.approved)}
          approvedAt={e1Package.approvedAt}
          approvedBy={e1Package.blueprint.approvedBy}
          approvedSnapshot={e1Package.approvedBlueprintSnapshot}
        />

        {/* Handoff Banner to E2 Manuscript Factory when Blueprint is approved */}
        {e1Package.blueprint.approved && (
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
            <div className="space-y-0.5">
              <span className="text-2xs font-bold uppercase tracking-wider text-emerald-800 font-mono">
                E1 Snapshot Locked &amp; Certified
              </span>
              <h4 className="text-sm font-bold text-emerald-950">
                Blueprint Approved — Handed Off to E2 Manuscript Factory™
              </h4>
              <p className="text-xs text-emerald-800">
                {e1Package.blueprint.chapters.length} approved chapters and {project.targetPageCount}-page budget are active for drafting and editorial production.
              </p>
            </div>
            <PremiumButton
              variant="primary"
              size="md"
              onClick={() => onNavigate(`/books/${project.id}/manuscript`)}
            >
              Enter Manuscript Factory →
            </PremiumButton>
          </div>
        )}
      </div>
    </div>
  );
};
