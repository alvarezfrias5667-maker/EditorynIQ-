import React, { useState, useEffect } from 'react';
import { useI18n } from '../../i18n';
import { BookProject } from '../../domain/bookProjectTypes';
import { E1BookPackage } from '../../domain/intelligence/bookIntelligenceTypes';
import { EditorialEdition } from '../../domain/editorial/editorialTypes';
import {
  EditionRecord,
  PublicationMetadataRecord,
  PublicationPackage,
  VerifiedArtifact,
  ReadinessEvaluation,
  LedgerEvent,
} from '../../domain/publishing/publishingTypes';
import { localBookRepository } from '../../services/localBookRepository';
import { localBookIntelligenceRepository } from '../../services/localBookIntelligenceRepository';
import { localEditorialRepository } from '../../services/localEditorialRepository';
import { localPublishingRepository } from '../../services/localPublishingRepository';
import { publishingPackageService } from '../../services/publishingPackageService';
import { createDefaultEditionRecord } from '../../domain/publishing/editionEngine';
import { buildPublicationMetadata } from '../../domain/publishing/metadataEngine';
import { evaluateChannelReadiness } from '../../domain/publishing/channelReadinessEngine';
import { PublishingNavTabs } from '../../components/publishing/PublishingNavTabs';
import { InfinityCard } from '../../components/ui/InfinityCard';
import { PremiumButton } from '../../components/ui/PremiumButton';

export interface PublishingHubPageProps {
  projectId: string;
  onNavigate: (path: string) => void;
}

export const PublishingHubPage: React.FC<PublishingHubPageProps> = ({ projectId, onNavigate }) => {
  const { t } = useI18n();

  const [project, setProject] = useState<BookProject | null>(null);
  const [e1Package, setE1Package] = useState<E1BookPackage | null>(null);
  const [e4Edition, setE4Edition] = useState<EditorialEdition | null>(null);
  const [editions, setEditions] = useState<EditionRecord[]>([]);
  const [activeEdition, setActiveEdition] = useState<EditionRecord | null>(null);
  const [metadata, setMetadata] = useState<PublicationMetadataRecord | null>(null);
  const [artifacts, setArtifacts] = useState<VerifiedArtifact[]>([]);
  const [packages, setPackages] = useState<PublicationPackage[]>([]);
  const [readiness, setReadiness] = useState<ReadinessEvaluation | null>(null);
  const [ledgerEvents, setLedgerEvents] = useState<LedgerEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;

    const loadData = async () => {
      setLoading(true);

      const proj = await localBookRepository.getProjectById(projectId);
      const [intelPkg, e4Eds, existingEditions, existingPkgs, events] = await Promise.all([
        proj ? localBookIntelligenceRepository.getE1Package(proj) : Promise.resolve(null),
        localEditorialRepository.getEditionsByBookId(projectId),
        localPublishingRepository.getEditionsByBookId(projectId),
        localPublishingRepository.getPackagesByBookId(projectId),
        localPublishingRepository.getLedgerEventsByBookId(projectId),
      ]);

      setProject(proj);
      setE1Package(intelPkg);
      const primaryE4 = e4Eds.length > 0 ? e4Eds[0] : null;
      setE4Edition(primaryE4);
      setPackages(existingPkgs);
      setLedgerEvents(events);

      // Verify authentic artifacts
      const verifiedArts = await publishingPackageService.verifyAvailableArtifacts(projectId, primaryE4?.id);
      setArtifacts(verifiedArts);

      // Initialize or load editions
      let currentEd: EditionRecord | null = null;
      if (existingEditions.length > 0) {
        currentEd = existingEditions[0];
        setEditions(existingEditions);
      } else if (proj) {
        // Auto-seed initial edition from project
        const defaultEd = createDefaultEditionRecord(proj, primaryE4 || undefined);
        await localPublishingRepository.saveEdition(defaultEd);
        currentEd = defaultEd;
        setEditions([defaultEd]);
      }
      setActiveEdition(currentEd);

      // Load or build metadata
      if (currentEd && proj) {
        let metaRecord = await localPublishingRepository.getMetadataByEditionId(currentEd.id);
        if (!metaRecord) {
          metaRecord = buildPublicationMetadata(proj, currentEd, intelPkg, primaryE4);
          await localPublishingRepository.saveMetadata(metaRecord);
        }
        setMetadata(metaRecord);

        // Evaluate readiness
        const ev = evaluateChannelReadiness('universal', currentEd, metaRecord, verifiedArts);
        setReadiness(ev);
      }

      setLoading(false);
    };

    loadData();
  }, [projectId]);

  if (loading) {
    return (
      <div className="py-12 max-w-5xl mx-auto px-4 text-center">
        <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-2xs font-mono text-xs text-slate-500">
          Loading Publishing Hub...
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="py-12 max-w-5xl mx-auto px-4 text-center space-y-4">
        <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-2xs text-sm text-slate-700">
          Book project not found.
        </div>
        <button
          onClick={() => onNavigate('/studio')}
          className="text-xs font-semibold text-[#345CFF] hover:underline"
        >
          {t.publishing.backToProject}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <PublishingNavTabs
        projectId={projectId}
        activeTab="overview"
        onNavigate={onNavigate}
        overallScore={readiness?.overallScore}
      />

      {/* Main Publishing Overview & Quick Actions */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-[#081629]">{project.title}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeEdition?.editionName} · {activeEdition?.editionType} · {activeEdition?.productionLanguage.toUpperCase()}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <PremiumButton
              variant="outline"
              size="sm"
              onClick={() => onNavigate(`/books/${projectId}/publishing/editions`)}
            >
              {t.publishing.btnNewEdition}
            </PremiumButton>

            <PremiumButton
              variant="primary"
              size="sm"
              onClick={() => onNavigate(`/books/${projectId}/publishing/packages`)}
            >
              {t.publishing.btnCompilePackage}
            </PremiumButton>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          {t.publishing.hubDesc}
        </p>

        {/* 5 Dimensional Readiness Cards */}
        {readiness && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-bold uppercase tracking-wider text-[#081629]">
                5-Dimensional Publishing Readiness Audit™
              </span>
              <span
                className={`text-2xs font-mono font-bold px-2 py-0.5 rounded border ${
                  readiness.overallStatus === 'READY'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : readiness.overallStatus === 'NEEDS_ATTENTION'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-red-50 text-red-800 border-red-200'
                }`}
              >
                STATUS: {readiness.overallStatus} ({readiness.overallScore}/100)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {Object.entries(readiness.dimensions).map(([dim, data]) => {
                const passedCount = data.checks.filter((c) => c.passed).length;
                return (
                  <div
                    key={dim}
                    className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/90 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-3xs font-mono font-bold uppercase text-slate-500">{dim}</span>
                      <span className="text-xs font-bold text-[#081629]">{data.score}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          data.score >= 80 ? 'bg-emerald-500' : data.score >= 50 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${data.score}%` }}
                      />
                    </div>
                    <span className="text-3xs text-slate-400 block font-mono">
                      {passedCount}/{data.checks.length} criteria verified
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 5 E5 Modules Navigation Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#081629]">
          E5 Publishing Modules™
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <InfinityCard
            title={t.publishing.navEditions}
            subtitle="Module 1"
            description={`${editions.length} edition(s) registered. Configure copyright terms, authorized territories, and validate ISBN-13 checksums.`}
            accentColor="royal"
            onClick={() => onNavigate(`/books/${projectId}/publishing/editions`)}
          />

          <InfinityCard
            title={t.publishing.navMetadata}
            subtitle="Module 2"
            description="Manage Canonical, Edition, and Channel metadata tiers. Compile standardized ONIX 3.0 reference records."
            accentColor="turquoise"
            onClick={() => onNavigate(`/books/${projectId}/publishing/metadata`)}
          />

          <InfinityCard
            title={t.publishing.navChannels}
            subtitle="Module 3"
            description="Documented profiles for Amazon KDP, Draft2Digital, IngramSpark, Lulu, PublishDrive, and Direct Author Distribution."
            accentColor="gold"
            onClick={() => onNavigate(`/books/${projectId}/publishing/channels`)}
          />

          <InfinityCard
            title={t.publishing.navPackages}
            subtitle="Module 4"
            description={`${packages.length} package(s) generated. Assemble authentic E4 artifacts into ZIP archives with SHA-256 manifests.`}
            accentColor="royal"
            onClick={() => onNavigate(`/books/${projectId}/publishing/packages`)}
          />

          <InfinityCard
            title={t.publishing.navHistory}
            subtitle="Module 5"
            description={`${ledgerEvents.length} ledger event(s). Permanent audit trail distinguishing system evidence, user reports, and provider receipts.`}
            accentColor="turquoise"
            onClick={() => onNavigate(`/books/${projectId}/publishing/history`)}
          />

          <InfinityCard
            title="E4 Editorial & Quality Hub"
            subtitle="Prerequisite Engine"
            description="Inspect or recompile master PDF, EPUB 3.3, DOCX files and Book Quality Passports in E4."
            accentColor="gold"
            onClick={() => onNavigate(`/books/${projectId}/editorial`)}
          />
        </div>
      </div>

      {/* Verified Artifacts Status Box */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h4 className="text-sm font-bold uppercase tracking-wider text-[#081629]">
            {t.publishing.artifactsCheckTitle}
          </h4>
          <span className="text-2xs font-mono text-slate-500">
            {artifacts.filter((a) => a.isAvailable).length} of {artifacts.length} available
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {artifacts.map((art) => (
            <div
              key={art.type}
              className={`p-3.5 rounded-xl border flex items-center justify-between ${
                art.isAvailable ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div>
                <span className="text-xs font-bold text-[#081629] block">{art.type}</span>
                <span className="text-3xs font-mono text-slate-500">
                  {art.isAvailable ? `${(art.fileSizeBytes / 1024).toFixed(1)} KB` : 'Not compiled in E4'}
                </span>
              </div>
              <span
                className={`text-2xs font-bold font-mono px-2 py-0.5 rounded ${
                  art.isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {art.isAvailable ? '✓ VERIFIED' : 'PENDING'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
