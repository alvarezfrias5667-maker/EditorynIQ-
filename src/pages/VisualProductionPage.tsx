import React, { useState, useEffect } from 'react';
import { useI18n } from '../i18n';
import { PageHero } from '../components/ui/PageHero';
import { PremiumButton } from '../components/ui/PremiumButton';
import { InfinityCard } from '../components/ui/InfinityCard';
import { BookProject } from '../domain/bookProjectTypes';
import { VisualAsset, VisualIdentityProfile } from '../domain/visual/visualTypes';
import { localBookRepository } from '../services/localBookRepository';
import { localVisualRepository } from '../services/localVisualRepository';
import { evaluateE3Readiness } from '../domain/visual/e3Readiness';
import { VisualIdentityPanel } from '../components/visual/VisualIdentityPanel';
import { VisualRightsPanel } from '../components/visual/VisualRightsPanel';
import { E3ReadinessPanel } from '../components/visual/E3ReadinessPanel';

export interface VisualProductionPageProps {
  projectId: string;
  onNavigate: (path: string) => void;
}

export const VisualProductionPage: React.FC<VisualProductionPageProps> = ({ projectId, onNavigate }) => {
  const { t } = useI18n();
  const [project, setProject] = useState<BookProject | null>(null);
  const [identity, setIdentity] = useState<VisualIdentityProfile | null>(null);
  const [assets, setAssets] = useState<VisualAsset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const proj = await localBookRepository.getProjectById(projectId);
      if (proj) {
        setProject(proj);
        const ident = await localVisualRepository.getVisualIdentity(proj.id, proj.title, proj.category);
        setIdentity(ident);
        const assetList = await localVisualRepository.getAssetsByBookId(proj.id);
        setAssets(assetList);
      }
      setLoading(false);
    };
    loadData();
  }, [projectId]);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500 text-sm">
        Loading E3 Visual Production Hub...
      </div>
    );
  }

  if (!project || !identity) {
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

  const readinessReport = evaluateE3Readiness(project.id, assets);

  const handleSaveIdentity = async (updated: VisualIdentityProfile) => {
    await localVisualRepository.saveVisualIdentity(updated);
    setIdentity(updated);
  };

  const handleSaveAsset = async (asset: VisualAsset) => {
    const res = await localVisualRepository.saveAsset(asset);
    if (res.success) {
      const reloaded = await localVisualRepository.getAssetsByBookId(project.id);
      setAssets(reloaded);
      return true;
    }
    return false;
  };

  return (
    <div className="space-y-10 pb-20">
      <PageHero
        title={`E3 Visual Production™ · ${project.title}`}
        subtitle="Book Covers, Illustrations, Diagrams, Data Charts, Infographics & Asset Library"
        badge={`Readiness ${readinessReport.score}%`}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Navigation bar */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <button
            onClick={() => onNavigate(`/studio/${project.id}`)}
            className="text-xs font-semibold text-[#345CFF] hover:underline flex items-center gap-1"
          >
            ← Back to Project Workspace
          </button>

          <PremiumButton
            variant="outline"
            size="sm"
            onClick={() => onNavigate(`/books/${project.id}/visual/library`)}
          >
            View Visual Asset Library ({assets.length})
          </PremiumButton>
        </div>

        {/* 6 Visual Production Studios Cards Grid */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#081629]">
            Visual Production Studios™
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <InfinityCard
              title="Book Cover Factory™"
              subtitle="Studio 1"
              description="Design front cover, back cover, and preliminary spine with editable vector typography and layers."
              accentColor="royal"
              onClick={() => onNavigate(`/books/${project.id}/visual/covers`)}
            />

            <InfinityCard
              title="Illustration Factory™"
              subtitle="Studio 2"
              description="Upload authentic author artwork, manage visual briefs, associate chapters, and track versions."
              accentColor="turquoise"
              onClick={() => onNavigate(`/books/${project.id}/visual/illustrations`)}
            />

            <InfinityCard
              title="Technical Diagram Factory™"
              subtitle="Studio 3"
              description="Create flowcharts, system architectures, process logic, and hierarchies in vector SVG."
              accentColor="gold"
              onClick={() => onNavigate(`/books/${project.id}/visual/diagrams`)}
            />

            <InfinityCard
              title="Data Chart Factory™"
              subtitle="Studio 4"
              description="Render bar, line, pie, and comparative charts with real data, unit labels, and source citations."
              accentColor="turquoise"
              onClick={() => onNavigate(`/books/${project.id}/visual/charts`)}
            />

            <InfinityCard
              title="Editorial Infographic Factory™"
              subtitle="Studio 5"
              description="Compose multi-block infographics with key metric callouts, step workflows, and vector badges."
              accentColor="royal"
              onClick={() => onNavigate(`/books/${project.id}/visual/infographics`)}
            />

            <InfinityCard
              title="Visual Asset Library™"
              subtitle="Studio 6"
              description="Inspect, filter, version, and export all visual assets stored in IndexedDB with SHA256 hashes."
              accentColor="gold"
              onClick={() => onNavigate(`/books/${project.id}/visual/library`)}
            />
          </div>
        </div>

        {/* Visual Identity Engine Panel */}
        <VisualIdentityPanel identity={identity} onSave={handleSaveIdentity} />

        {/* Rights & Provenance Audit Panel */}
        <VisualRightsPanel assets={assets} onSaveAsset={handleSaveAsset} />

        {/* E3 Readiness Audit Report */}
        <E3ReadinessPanel report={readinessReport} />
      </div>
    </div>
  );
};
