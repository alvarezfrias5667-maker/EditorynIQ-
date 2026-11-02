import React, { useState, useEffect } from 'react';
import { useI18n } from '../../i18n';
import { BookProject } from '../../domain/bookProjectTypes';
import { E1BookPackage } from '../../domain/intelligence/bookIntelligenceTypes';
import { EditorialEdition } from '../../domain/editorial/editorialTypes';
import {
  EditionRecord,
  PublicationMetadataRecord,
  ChannelId,
} from '../../domain/publishing/publishingTypes';
import { localBookRepository } from '../../services/localBookRepository';
import { localBookIntelligenceRepository } from '../../services/localBookIntelligenceRepository';
import { localEditorialRepository } from '../../services/localEditorialRepository';
import { localPublishingRepository } from '../../services/localPublishingRepository';
import {
  buildPublicationMetadata,
  generateOnixJsonMetadata,
  generateOnix3Xml,
  getCategoryBisacMapping,
} from '../../domain/publishing/metadataEngine';
import { createDefaultEditionRecord } from '../../domain/publishing/editionEngine';
import { PublishingNavTabs } from '../../components/publishing/PublishingNavTabs';
import { PremiumButton } from '../../components/ui/PremiumButton';

export interface MetadataPageProps {
  projectId: string;
  onNavigate: (path: string) => void;
}

export const MetadataPage: React.FC<MetadataPageProps> = ({ projectId, onNavigate }) => {
  const { t } = useI18n();

  const [project, setProject] = useState<BookProject | null>(null);
  const [activeEdition, setActiveEdition] = useState<EditionRecord | null>(null);
  const [metadata, setMetadata] = useState<PublicationMetadataRecord | null>(null);
  const [selectedChannelTab, setSelectedChannelTab] = useState<ChannelId>('kdp');
  const [keywordInput, setKeywordInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;

    const loadData = async () => {
      setLoading(true);
      const proj = await localBookRepository.getProjectById(projectId);
      const [intelPkg, e4Eds, existingEditions] = await Promise.all([
        proj ? localBookIntelligenceRepository.getE1Package(proj) : Promise.resolve(null),
        localEditorialRepository.getEditionsByBookId(projectId),
        localPublishingRepository.getEditionsByBookId(projectId),
      ]);

      setProject(proj);
      const primaryE4 = e4Eds.length > 0 ? e4Eds[0] : null;

      let ed = existingEditions.length > 0 ? existingEditions[0] : null;
      if (!ed && proj) {
        ed = createDefaultEditionRecord(proj, primaryE4 || undefined);
        await localPublishingRepository.saveEdition(ed);
      }
      setActiveEdition(ed);

      if (ed && proj) {
        let meta = await localPublishingRepository.getMetadataByEditionId(ed.id);
        if (!meta) {
          meta = buildPublicationMetadata(proj, ed, intelPkg, primaryE4);
          await localPublishingRepository.saveMetadata(meta);
        }
        setMetadata(meta);
        setKeywordInput(meta.edition.keywords.join(', '));
      }

      setLoading(false);
    };

    loadData();
  }, [projectId]);

  const handleSaveMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!metadata) return;

    setIsSaving(true);
    const keywords = keywordInput
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    const updated: PublicationMetadataRecord = {
      ...metadata,
      edition: {
        ...metadata.edition,
        keywords,
      },
      updatedAt: new Date().toISOString(),
    };

    const ok = await localPublishingRepository.saveMetadata(updated);
    if (ok) {
      setMetadata(updated);
      setSaveSuccessMsg('Publication metadata saved successfully.');
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    }
    setIsSaving(false);
  };

  const handleExportOnixJson = () => {
    if (!metadata) return;
    const onixObj = generateOnixJsonMetadata(metadata);
    const jsonString = JSON.stringify(onixObj, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `metadata_onix_${metadata.bookId}_${metadata.editionId}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleExportOnixXml = () => {
    if (!metadata) return;
    const result = generateOnix3Xml(metadata);
    const blob = new Blob([result.xmlContent], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `onix30_release3_${metadata.bookId}_${metadata.editionId}.xml`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const channelList: Array<{ id: ChannelId; name: string }> = [
    { id: 'kdp', name: 'Amazon KDP' },
    { id: 'draft2digital', name: 'Draft2Digital' },
    { id: 'ingramspark', name: 'IngramSpark' },
    { id: 'lulu', name: 'Lulu' },
    { id: 'publishdrive', name: 'PublishDrive' },
    { id: 'direct_distribution', name: 'Direct Sale' },
  ];

  if (loading) {
    return (
      <div className="py-12 max-w-5xl mx-auto px-4 text-center">
        <div className="p-8 bg-white rounded-2xl border font-mono text-xs text-slate-500">Loading Metadata Studio...</div>
      </div>
    );
  }

  if (!metadata || !project) {
    return (
      <div className="py-12 max-w-5xl mx-auto px-4 text-center">
        <div className="p-8 bg-white rounded-2xl border text-xs text-slate-500">Metadata record unavailable.</div>
      </div>
    );
  }

  const currentChannelOverride = metadata.channelOverrides[selectedChannelTab] || {
    channelId: selectedChannelTab,
    priceCents: 999,
    currency: 'USD',
    drmEnabled: false,
    adultContent: false,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <PublishingNavTabs projectId={projectId} activeTab="metadata" onNavigate={onNavigate} />

      <form onSubmit={handleSaveMetadata} className="space-y-8">
        {/* Tier 1: Canonical Metadata (Inherited from E1/E4) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#081629]">
                {t.publishing.canonicalSectionTitle}
              </h3>
              <p className="text-2xs text-slate-500 mt-0.5">
                Master identity inherited from E1 Intelligence and E4 Editorial. Immutable to prevent authority collisions.
              </p>
            </div>
            <span className="text-2xs font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-[#345CFF] border border-blue-200">
              IMMUTABLE AUTHORITY
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-3xs text-slate-400 font-sans uppercase block mb-1">Canonical Title</span>
              <span className="font-bold text-[#081629] block">{metadata.canonical.title}</span>
              {metadata.canonical.subtitle && (
                <span className="text-2xs text-slate-500 font-sans block mt-0.5">{metadata.canonical.subtitle}</span>
              )}
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-3xs text-slate-400 font-sans uppercase block mb-1">Author of Record</span>
              <span className="font-bold text-[#081629] block">{metadata.canonical.author}</span>
              <span className="text-3xs text-slate-500 font-sans block mt-0.5">Lang: {metadata.canonical.originalLanguage.toUpperCase()}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-3xs text-slate-400 font-sans uppercase block mb-1">Category & Scale</span>
              <span className="font-bold text-[#081629] block uppercase">{metadata.canonical.category}</span>
              <span className="text-3xs text-slate-500 font-sans block mt-0.5">
                {metadata.canonical.targetPages} target pgs · {metadata.canonical.totalChapters} chapters
              </span>
            </div>
          </div>
        </div>

        {/* Tier 2: Edition-Specific Metadata (Editable) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#081629]">
                {t.publishing.editionSectionTitle}
              </h3>
              <p className="text-2xs text-slate-500 mt-0.5">
                Commercial and marketing copy tailored to edition {activeEdition?.editionName}.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-3xs font-mono font-bold px-2 py-1 rounded bg-amber-50 text-amber-900 border border-amber-200" title="Valid ONIX 3.0 syntax generated. Schema validation requires external EDItEUR XSD parser.">
                STATUS: ONIX_NOT_VERIFIED (External XSD Required)
              </span>
              <button
                type="button"
                onClick={handleExportOnixXml}
                className="text-xs font-bold font-mono px-3 py-1.5 rounded-lg bg-[#081629] text-white hover:bg-slate-800 flex items-center gap-1.5 shadow-2xs"
                title="Download genuine ONIX 3.0 Release 3 XML export"
              >
                📥 ONIX 3.0 XML
              </button>
              <button
                type="button"
                onClick={handleExportOnixJson}
                className="text-xs font-bold font-mono px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
                title="Download internal metadata JSON representation"
              >
                📥 metadata_onix.json
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {/* Synopsis */}
            <div className="space-y-1">
              <label className="block text-2xs font-bold uppercase tracking-wider text-[#081629]">
                {t.publishing.synopsisLabel}
              </label>
              <textarea
                rows={4}
                required
                value={metadata.edition.synopsis}
                onChange={(e) =>
                  setMetadata({
                    ...metadata,
                    edition: { ...metadata.edition, synopsis: e.target.value },
                  })
                }
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-[#345CFF] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Keywords */}
              <div className="space-y-1">
                <label className="block text-2xs font-bold uppercase tracking-wider text-[#081629]">
                  {t.publishing.keywordsLabel}
                </label>
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  placeholder="e.g. software, distributed systems, architecture"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-[#345CFF] focus:outline-none"
                />
              </div>

              {/* BISAC Subject */}
              <div className="space-y-1">
                <label className="block text-2xs font-bold uppercase tracking-wider text-[#081629]">
                  {t.publishing.bisacLabel}
                </label>
                <input
                  type="text"
                  required
                  value={metadata.edition.bisacCategories[0] || getCategoryBisacMapping(project.category)}
                  onChange={(e) =>
                    setMetadata({
                      ...metadata,
                      edition: { ...metadata.edition, bisacCategories: [e.target.value] },
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-mono focus:ring-2 focus:ring-[#345CFF] focus:outline-none"
                />
              </div>

              {/* Series Name */}
              <div className="space-y-1">
                <label className="block text-2xs font-bold uppercase tracking-wider text-[#081629]">
                  {t.publishing.seriesNameLabel}
                </label>
                <input
                  type="text"
                  value={metadata.edition.seriesName}
                  onChange={(e) =>
                    setMetadata({
                      ...metadata,
                      edition: { ...metadata.edition, seriesName: e.target.value },
                    })
                  }
                  placeholder="e.g. Master Software Architecture Series"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-[#345CFF] focus:outline-none"
                />
              </div>

              {/* Series Number */}
              <div className="space-y-1">
                <label className="block text-2xs font-bold uppercase tracking-wider text-[#081629]">
                  {t.publishing.seriesNumberLabel}
                </label>
                <input
                  type="text"
                  value={metadata.edition.seriesNumber}
                  onChange={(e) =>
                    setMetadata({
                      ...metadata,
                      edition: { ...metadata.edition, seriesNumber: e.target.value },
                    })
                  }
                  placeholder="e.g. Book 1"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-[#345CFF] focus:outline-none"
                />
              </div>

              {/* Copyright Notice */}
              <div className="space-y-1">
                <label className="block text-2xs font-bold uppercase tracking-wider text-[#081629]">
                  {t.publishing.copyrightNoticeLabel}
                </label>
                <input
                  type="text"
                  required
                  value={metadata.edition.copyrightNotice}
                  onChange={(e) =>
                    setMetadata({
                      ...metadata,
                      edition: { ...metadata.edition, copyrightNotice: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-[#345CFF] focus:outline-none"
                />
              </div>

              {/* Target Publication Date */}
              <div className="space-y-1">
                <label className="block text-2xs font-bold uppercase tracking-wider text-[#081629]">
                  {t.publishing.publicationDateLabel}
                </label>
                <input
                  type="date"
                  value={metadata.edition.publicationDate}
                  onChange={(e) =>
                    setMetadata({
                      ...metadata,
                      edition: { ...metadata.edition, publicationDate: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-[#345CFF] focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tier 3: Channel-Specific Overrides (Optional) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-2xs">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#081629]">
              {t.publishing.channelSectionTitle}
            </h3>
            <p className="text-2xs text-slate-500 mt-0.5">
              Configure retailer-specific pricing, DRM preferences, and content ratings.
            </p>
          </div>

          {/* Channel selector sub-tabs */}
          <div className="flex flex-wrap gap-2">
            {channelList.map((chan) => (
              <button
                key={chan.id}
                type="button"
                onClick={() => setSelectedChannelTab(chan.id)}
                className={`px-3 py-1.5 text-xs rounded-lg font-mono font-medium border transition-all ${
                  selectedChannelTab === chan.id
                    ? 'bg-[#081629] text-white border-[#081629] font-bold'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {chan.name}
              </button>
            ))}
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="block text-2xs font-bold uppercase tracking-wider text-[#081629]">
                Retail Price (USD)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={((currentChannelOverride.priceCents || 999) / 100).toFixed(2)}
                onChange={(e) => {
                  const cents = Math.round(parseFloat(e.target.value || '0') * 100);
                  setMetadata({
                    ...metadata,
                    channelOverrides: {
                      ...metadata.channelOverrides,
                      [selectedChannelTab]: {
                        ...currentChannelOverride,
                        priceCents: cents,
                      },
                    },
                  });
                }}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-mono focus:ring-2 focus:ring-[#345CFF] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-2xs font-bold uppercase tracking-wider text-[#081629]">
                DRM Protection
              </label>
              <select
                value={currentChannelOverride.drmEnabled ? 'true' : 'false'}
                onChange={(e) => {
                  setMetadata({
                    ...metadata,
                    channelOverrides: {
                      ...metadata.channelOverrides,
                      [selectedChannelTab]: {
                        ...currentChannelOverride,
                        drmEnabled: e.target.value === 'true',
                      },
                    },
                  });
                }}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-[#345CFF] focus:outline-none"
              >
                <option value="false">Watermark / Social DRM (Recommended)</option>
                <option value="true">Strict Proprietary DRM</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-2xs font-bold uppercase tracking-wider text-[#081629]">
                Adult / Sensitive Content
              </label>
              <select
                value={currentChannelOverride.adultContent ? 'true' : 'false'}
                onChange={(e) => {
                  setMetadata({
                    ...metadata,
                    channelOverrides: {
                      ...metadata.channelOverrides,
                      [selectedChannelTab]: {
                        ...currentChannelOverride,
                        adultContent: e.target.value === 'true',
                      },
                    },
                  });
                }}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-[#345CFF] focus:outline-none"
              >
                <option value="false">No (General Audience)</option>
                <option value="true">Yes (Restricted 18+)</option>
              </select>
            </div>
          </div>
        </div>

        {saveSuccessMsg && (
          <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 font-semibold">
            ✓ {saveSuccessMsg}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <PremiumButton variant="gold" size="lg" disabled={isSaving}>
            {isSaving ? 'Saving Metadata...' : t.publishing.saveMetadataBtn}
          </PremiumButton>
        </div>
      </form>
    </div>
  );
};
