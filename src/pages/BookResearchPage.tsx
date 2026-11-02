import React, { useState, useEffect } from 'react';
import { useI18n } from '../i18n';
import { PageHero } from '../components/ui/PageHero';
import { PremiumButton } from '../components/ui/PremiumButton';
import { BookProject } from '../domain/bookProjectTypes';
import { E1BookPackage, ResearchSource } from '../domain/intelligence/bookIntelligenceTypes';
import { localBookRepository } from '../services/localBookRepository';
import { localBookIntelligenceRepository } from '../services/localBookIntelligenceRepository';
import { ResearchEvidencePanel } from '../components/intelligence/ResearchEvidencePanel';

export interface BookResearchPageProps {
  projectId: string;
  onNavigate: (path: string) => void;
}

export const BookResearchPage: React.FC<BookResearchPageProps> = ({ projectId, onNavigate }) => {
  const { t } = useI18n();

  const [project, setProject] = useState<BookProject | null>(null);
  const [e1Package, setE1Package] = useState<E1BookPackage | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="py-20 text-center text-slate-500 text-sm">Loading Research Workspace...</div>;

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

  const handleUpdateSources = async (sources: ResearchSource[]): Promise<boolean> => {
    const updated = { ...e1Package, researchSources: sources };
    setE1Package(updated);
    return await localBookIntelligenceRepository.saveE1Package(updated);
  };

  return (
    <div className="space-y-10 pb-20">
      <PageHero
        title={`Research & Evidence — ${project.title}`}
        subtitle={`Document sources, factual bibliography, and claim verifications for ${project.category.toUpperCase()}`}
        badge={e1Package.status}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 text-xs font-semibold">
          <button onClick={() => onNavigate(`/studio/${project.id}`)} className="text-[#345CFF] hover:underline">
            ← Back to Project Workspace
          </button>

          <div className="flex items-center gap-3">
            <button onClick={() => onNavigate(`/books/${project.id}/blueprint`)} className="text-slate-600 hover:text-slate-900">
              Blueprint Editor →
            </button>
            <button onClick={() => onNavigate(`/books/${project.id}/memory`)} className="text-slate-600 hover:text-slate-900">
              Master Memory →
            </button>
          </div>
        </div>

        <ResearchEvidencePanel sources={e1Package.researchSources} onUpdateSources={handleUpdateSources} />
      </div>
    </div>
  );
};
