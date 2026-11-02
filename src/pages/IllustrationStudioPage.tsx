import React, { useState, useEffect } from 'react';
import { useI18n } from '../i18n';
import { PageHero } from '../components/ui/PageHero';
import { PremiumButton } from '../components/ui/PremiumButton';
import { BookProject } from '../domain/bookProjectTypes';
import { VisualAsset } from '../domain/visual/visualTypes';
import { localBookRepository } from '../services/localBookRepository';
import { localBookIntelligenceRepository } from '../services/localBookIntelligenceRepository';
import { localVisualRepository } from '../services/localVisualRepository';
import { IllustrationPanel } from '../components/visual/IllustrationPanel';

export interface IllustrationStudioPageProps {
  projectId: string;
  onNavigate: (path: string) => void;
}

export const IllustrationStudioPage: React.FC<IllustrationStudioPageProps> = ({ projectId, onNavigate }) => {
  const { t } = useI18n();
  const [project, setProject] = useState<BookProject | null>(null);
  const [chapters, setChapters] = useState<Array<{ id: string; title: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const proj = await localBookRepository.getProjectById(projectId);
      if (proj) {
        setProject(proj);
        const pkg = await localBookIntelligenceRepository.getE1Package(proj);
        const chList = pkg.blueprint.chapters.map((c) => ({ id: c.id, title: c.title }));
        setChapters(chList);
      }
      setLoading(false);
    };
    loadData();
  }, [projectId]);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500 text-sm">
        Loading Illustration Studio...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-3xl mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="text-2xl font-bold text-[#101828]">Project Not Found</h2>
        <div>
          <PremiumButton variant="outline" size="md" onClick={() => onNavigate('/studio')}>
            {t.studio.backToStudio}
          </PremiumButton>
        </div>
      </div>
    );
  }

  const handleSaveAsset = async (asset: VisualAsset) => {
    const res = await localVisualRepository.saveAsset(asset);
    return res.success;
  };

  return (
    <div className="space-y-10 pb-20">
      <PageHero
        title={`Illustration Factory™ · ${project.title}`}
        subtitle="Upload authentic author artwork, visual briefs, and associate chapter illustrations"
        badge="STUDIO 2"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <button
            onClick={() => onNavigate(`/books/${project.id}/visual`)}
            className="text-xs font-semibold text-[#345CFF] hover:underline flex items-center gap-1"
          >
            ← Back to Visual Production Hub
          </button>

          <button
            onClick={() => onNavigate(`/books/${project.id}/visual/library`)}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            View Visual Asset Library →
          </button>
        </div>

        <IllustrationPanel bookId={project.id} chapters={chapters} onSaveAsset={handleSaveAsset} />
      </div>
    </div>
  );
};
