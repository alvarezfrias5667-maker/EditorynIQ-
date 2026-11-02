import React, { useState, useEffect } from 'react';
import { useI18n } from '../i18n';
import { PageHero } from '../components/ui/PageHero';
import { PremiumButton } from '../components/ui/PremiumButton';
import { BookProject } from '../domain/bookProjectTypes';
import { VisualAsset } from '../domain/visual/visualTypes';
import { localBookRepository } from '../services/localBookRepository';
import { localVisualRepository } from '../services/localVisualRepository';
import { VisualLibraryPanel } from '../components/visual/VisualLibraryPanel';

export interface VisualAssetLibraryPageProps {
  projectId: string;
  onNavigate: (path: string) => void;
}

export const VisualAssetLibraryPage: React.FC<VisualAssetLibraryPageProps> = ({ projectId, onNavigate }) => {
  const { t } = useI18n();
  const [project, setProject] = useState<BookProject | null>(null);
  const [assets, setAssets] = useState<VisualAsset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const proj = await localBookRepository.getProjectById(projectId);
      if (proj) {
        setProject(proj);
        const list = await localVisualRepository.getAssetsByBookId(proj.id);
        setAssets(list);
      }
      setLoading(false);
    };
    loadData();
  }, [projectId]);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500 text-sm">
        Loading Visual Asset Library...
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

  const handleDeleteAsset = async (assetId: string) => {
    await localVisualRepository.deleteAsset(assetId);
    const reloaded = await localVisualRepository.getAssetsByBookId(project.id);
    setAssets(reloaded);
  };

  return (
    <div className="space-y-10 pb-20">
      <PageHero
        title={`Visual Asset Library™ · ${project.title}`}
        subtitle="Manage, inspect, filter, version, and export all saved visual resources"
        badge={`STUDIO 6 · ${assets.length} ASSETS`}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <button
            onClick={() => onNavigate(`/books/${project.id}/visual`)}
            className="text-xs font-semibold text-[#345CFF] hover:underline flex items-center gap-1"
          >
            ← Back to Visual Production Hub
          </button>

          <PremiumButton
            variant="outline"
            size="sm"
            onClick={() => onNavigate(`/books/${project.id}/visual/covers`)}
          >
            + Create New Cover
          </PremiumButton>
        </div>

        <VisualLibraryPanel assets={assets} onDeleteAsset={handleDeleteAsset} />
      </div>
    </div>
  );
};
