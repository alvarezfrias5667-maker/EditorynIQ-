import React, { useState, useEffect } from 'react';
import { useI18n } from '../i18n';
import { PageHero } from '../components/ui/PageHero';
import { PremiumButton } from '../components/ui/PremiumButton';
import { BookProject } from '../domain/bookProjectTypes';
import { VisualAsset, VisualIdentityProfile } from '../domain/visual/visualTypes';
import { localBookRepository } from '../services/localBookRepository';
import { localVisualRepository } from '../services/localVisualRepository';
import { CoverEditor } from '../components/visual/CoverEditor';

export interface BookCoverStudioPageProps {
  projectId: string;
  onNavigate: (path: string) => void;
}

export const BookCoverStudioPage: React.FC<BookCoverStudioPageProps> = ({ projectId, onNavigate }) => {
  const { t } = useI18n();
  const [project, setProject] = useState<BookProject | null>(null);
  const [identity, setIdentity] = useState<VisualIdentityProfile | null>(null);
  const [coverAsset, setCoverAsset] = useState<VisualAsset | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const proj = await localBookRepository.getProjectById(projectId);
      if (proj) {
        setProject(proj);
        const ident = await localVisualRepository.getVisualIdentity(proj.id, proj.title, proj.category);
        setIdentity(ident);
        const assets = await localVisualRepository.getAssetsByBookId(proj.id);
        const existingCover = assets.find((a) => a.assetType === 'cover');
        setCoverAsset(existingCover);
      }
      setLoading(false);
    };
    loadData();
  }, [projectId]);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500 text-sm">
        Loading Book Cover Studio...
      </div>
    );
  }

  if (!project || !identity) {
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
    if (res.success) {
      setCoverAsset(asset);
      return true;
    }
    return false;
  };

  return (
    <div className="space-y-10 pb-20">
      <PageHero
        title={`Book Cover Factory™ · ${project.title}`}
        subtitle="Design vector & typographic front covers, back covers, and spines"
        badge="STUDIO 1"
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

        <CoverEditor
          bookId={project.id}
          bookTitle={project.title}
          authorName={project.targetAudience ? 'Author' : 'Author'}
          pageCount={project.targetPageCount}
          identity={identity}
          initialAsset={coverAsset}
          onSaveAsset={handleSaveAsset}
        />
      </div>
    </div>
  );
};
