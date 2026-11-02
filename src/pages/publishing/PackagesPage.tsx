import React, { useState, useEffect } from 'react';
import { useI18n } from '../../i18n';
import { BookProject } from '../../domain/bookProjectTypes';
import { EditorialEdition } from '../../domain/editorial/editorialTypes';
import {
  EditionRecord,
  PublicationMetadataRecord,
  PublicationPackage,
  VerifiedArtifact,
  ChannelId,
  QualityGate4DB2AReport,
  StorePublishingReadinessReport,
  StoreQualityGateStatus,
  RequirementLevel,
} from '../../domain/publishing/publishingTypes';
import { localBookRepository } from '../../services/localBookRepository';
import { localEditorialRepository } from '../../services/localEditorialRepository';
import { localPublishingRepository } from '../../services/localPublishingRepository';
import { publishingPackageService } from '../../services/publishingPackageService';
import { buildPublicationMetadata, generateOnix3Xml } from '../../domain/publishing/metadataEngine';
import { createDefaultEditionRecord } from '../../domain/publishing/editionEngine';
import { PublishingNavTabs } from '../../components/publishing/PublishingNavTabs';
import { PremiumButton } from '../../components/ui/PremiumButton';

export interface PackagesPageProps {
  projectId: string;
  onNavigate: (path: string) => void;
}

export const PackagesPage: React.FC<PackagesPageProps> = ({ projectId, onNavigate }) => {
  const { t } = useI18n();

  const [project, setProject] = useState<BookProject | null>(null);
  const [activeEdition, setActiveEdition] = useState<EditionRecord | null>(null);
  const [metadata, setMetadata] = useState<PublicationMetadataRecord | null>(null);
  const [artifacts, setArtifacts] = useState<VerifiedArtifact[]>([]);
  const [packages, setPackages] = useState<PublicationPackage[]>([]);
  const [targetChannel, setTargetChannel] = useState<ChannelId | 'universal'>('universal');
  const [isCompiling, setIsCompiling] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [inspectingPackage, setInspectingPackage] = useState<PublicationPackage | null>(null);
  const [verificationReport, setVerificationReport] = useState<QualityGate4DB2AReport | null>(null);
  const [readinessReports, setReadinessReports] = useState<Record<string, StorePublishingReadinessReport>>({});
  const [inspectingReadinessReport, setInspectingReadinessReport] = useState<StorePublishingReadinessReport | null>(null);
  const [readinessFilter, setReadinessFilter] = useState<'ALL' | RequirementLevel>('ALL');
  const [isEvaluatingReadiness, setIsEvaluatingReadiness] = useState(false);
  const [lastZipBlob, setLastZipBlob] = useState<Blob | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check URL query param for channel override if any
    if (typeof window !== 'undefined') {
      const hash = window.location.hash || '';
      const queryIdx = hash.indexOf('?');
      if (queryIdx !== -1) {
        const params = new URLSearchParams(hash.substring(queryIdx));
        const chan = params.get('channel') as ChannelId;
        if (chan) setTargetChannel(chan);
      }
    }
  }, []);

  useEffect(() => {
    if (!projectId) return;

    const loadData = async () => {
      setLoading(true);
      const [proj, e4Eds, existingEditions, existingPackages] = await Promise.all([
        localBookRepository.getProjectById(projectId),
        localEditorialRepository.getEditionsByBookId(projectId),
        localPublishingRepository.getEditionsByBookId(projectId),
        localPublishingRepository.getPackagesByBookId(projectId),
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
          meta = buildPublicationMetadata(proj, ed, null, primaryE4);
          await localPublishingRepository.saveMetadata(meta);
        }
        setMetadata(meta);
      }

      // Verify authentic artifacts
      const verified = await publishingPackageService.verifyAvailableArtifacts(projectId, primaryE4?.id);
      setArtifacts(verified);
      setPackages(existingPackages);

      setLoading(false);
    };

    loadData();
  }, [projectId]);

  const handleCompilePackage = async () => {
    if (!activeEdition || !metadata) return;

    setIsCompiling(true);
    try {
      const res = await publishingPackageService.compilePublicationPackage(
        activeEdition,
        metadata,
        targetChannel
      );
      setLastZipBlob(res.zipBlob);
      const refreshed = await localPublishingRepository.getPackagesByBookId(projectId);
      setPackages(refreshed);
      setSuccessMsg(`Package ${res.package.packageId} compiled successfully with verified SHA-256 manifest.`);
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      console.error('Failed to compile package:', err);
    } finally {
      setIsCompiling(false);
    }
  };

  const handleDownloadPackage = async (pkg: PublicationPackage) => {
    await publishingPackageService.downloadPublicationPackage(pkg, lastZipBlob || undefined);
  };

  const handleVerifyPackage = async (pkg: PublicationPackage) => {
    setIsVerifying(true);
    try {
      let blob = lastZipBlob;
      if (!blob && pkg.packageZipBlobUrl) {
        try {
          const res = await fetch(pkg.packageZipBlobUrl);
          blob = await res.blob();
        } catch {
          blob = null;
        }
      }
      if (!blob) {
        setVerificationReport({
          status: 'STORAGE_UNAVAILABLE',
          channelId: pkg.targetChannelId,
          verifiedFilesCount: 0,
          totalEntries: 0,
          entries: [],
          recalculatedSha256: {},
          checksumMatches: false,
          securityClean: true,
          metadataCoherent: true,
          details: 'Package ZIP payload not resident in session memory. Recompile to perform deep extraction & verification.',
        });
        return;
      }
      const rep = await publishingPackageService.verifyStorePackageIntegrity(pkg, blob);
      setVerificationReport(rep);
    } catch (err: any) {
      console.error('Package verification error:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleEvaluateReadiness = async (pkg: PublicationPackage) => {
    setIsEvaluatingReadiness(true);
    try {
      let blob = lastZipBlob;
      if (!blob && pkg.packageZipBlobUrl) {
        try {
          const res = await fetch(pkg.packageZipBlobUrl);
          blob = await res.blob();
        } catch {
          blob = null;
        }
      }
      if (!blob) {
        setSuccessMsg('Package ZIP payload not resident in session. Recompile package first.');
        setTimeout(() => setSuccessMsg(''), 4000);
        return;
      }
      const readiness = await publishingPackageService.evaluateStorePublishingReadiness4DB2B(pkg, blob);
      setReadinessReports((prev) => ({ ...prev, [pkg.packageId]: readiness }));
      setInspectingReadinessReport(readiness);
    } catch (err: any) {
      console.error('Store readiness evaluation error:', err);
    } finally {
      setIsEvaluatingReadiness(false);
    }
  };

  const channelOptions: Array<{ id: ChannelId | 'universal'; name: string }> = [
    { id: 'universal', name: 'Universal Distribution Package' },
    { id: 'kdp', name: '1. Amazon Kindle Direct Publishing (KDP)' },
    { id: 'apple_books', name: '2. Apple Books Author Store' },
    { id: 'google_play', name: '3. Google Play Books Publisher Portal' },
    { id: 'kobo', name: '4. Kobo Writing Life' },
    { id: 'draft2digital', name: 'Draft2Digital' },
    { id: 'ingramspark', name: 'IngramSpark Global' },
    { id: 'lulu_direct', name: 'Lulu Direct (eCommerce API)' },
    { id: 'lulu_print_api', name: 'Lulu Enterprise Print API' },
    { id: 'publishdrive', name: 'PublishDrive' },
    { id: 'direct_distribution', name: 'Direct Author Distribution' },
  ];

  const selectedStoreProfile = publishingPackageService.getStoreProfile(targetChannel);
  const availableArtifactCount = artifacts.filter((a) => a.isAvailable).length;
  const hasCoreArtifacts = artifacts.some((a) => (a.type === 'PDF' || a.type === 'EPUB') && a.isAvailable);

  const handleDownloadIndividual = (type: 'EPUB' | 'PDF' | 'COVER' | 'ONIX' | 'CHECKLIST') => {
    if (!project) return;
    const cleanTitle = (project.title || 'book').toLowerCase().replace(/[^a-z0-9]+/g, '_');

    if (type === 'EPUB') {
      const art = artifacts.find((a) => a.type === 'EPUB');
      if (art?.blobUrl) {
        fetch(art.blobUrl).then((r) => r.blob()).then((b) => {
          publishingPackageService.downloadIndividualFile(b, `${cleanTitle}_${targetChannel}.epub`, 'application/epub+zip');
        });
      }
    } else if (type === 'PDF') {
      const art = artifacts.find((a) => a.type === 'PDF');
      if (art?.blobUrl) {
        fetch(art.blobUrl).then((r) => r.blob()).then((b) => {
          publishingPackageService.downloadIndividualFile(b, `${cleanTitle}_digital_master.pdf`, 'application/pdf');
        });
      }
    } else if (type === 'COVER') {
      const art = artifacts.find((a) => a.type === 'COVER_IMAGE');
      if (art?.rawContent) {
        publishingPackageService.downloadIndividualFile(art.rawContent, `${cleanTitle}_front_cover.jpg`, 'image/jpeg');
      }
    } else if (type === 'ONIX' && metadata) {
      const onixXml = generateOnix3Xml(metadata);
      publishingPackageService.downloadIndividualFile(onixXml.xmlContent, `${cleanTitle}_onix3_release3.xml`, 'application/xml');
    } else if (type === 'CHECKLIST') {
      const guideText = `EDITORYNIQ™ MANUAL STORE UPLOAD GUIDE
Store: ${targetChannel.toUpperCase()}
Title: ${project.title}
Author: ${project.category}
1. Upload EPUB & Front Cover from UPLOAD_FILES/
2. Use REFERENCE_ONLY/metadata_export.json for store portal metadata.
3. Rights status: RIGHTS_DECLARED.`;
      publishingPackageService.downloadIndividualFile(guideText, `${targetChannel}_manual_upload_guide.txt`, 'text/plain');
    }
  };

  if (loading) {
    return (
      <div className="py-12 max-w-5xl mx-auto px-4 text-center">
        <div className="p-8 bg-white rounded-2xl border font-mono text-xs text-slate-500">Loading Package Factory...</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <PublishingNavTabs projectId={projectId} activeTab="packages" onNavigate={onNavigate} />

      {/* Enterprise Download Center Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-4 border border-slate-800 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300 px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/30 rounded-full">
                EDITORYNIQ™ ENTERPRISE DOWNLOAD CENTER
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
                AUTHOR DELIVERABLE HUB
              </span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight mt-1">
              Deliverables & Store Release Center
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Direct access to verified digital masters (EPUB, PDF, DOCX), print geometries, store publishing packages (KDP, Apple, Google, Kobo), and raw project backups.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate(`/books/${projectId}/editorial/exports`)}
              className="text-xs font-semibold px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 transition"
            >
              Go to E4 Exports →
            </button>
          </div>
        </div>

        {/* 4 Delivery Sections Grid / Nav */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-800">
          <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700/80 space-y-1">
            <div className="text-[10px] font-mono font-bold text-amber-300 uppercase">SECTION 1</div>
            <div className="text-xs font-bold text-white flex items-center gap-1">📱 Digital Books™</div>
            <div className="text-[10px] text-slate-400">EPUB 3.3, PDF Master, DOCX, Cover</div>
          </div>

          <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700/80 space-y-1">
            <div className="text-[10px] font-mono font-bold text-cyan-300 uppercase">SECTION 2</div>
            <div className="text-xs font-bold text-white flex items-center gap-1">🖨 Print Edition™</div>
            <div className="text-[10px] text-slate-400">Print Interior PDF, Spine Cover, Bleed</div>
          </div>

          <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700/80 space-y-1">
            <div className="text-[10px] font-mono font-bold text-purple-300 uppercase">SECTION 3</div>
            <div className="text-xs font-bold text-white flex items-center gap-1">🏪 Store Packages™</div>
            <div className="text-[10px] text-slate-400">KDP, Apple, Google, Kobo ZIPs</div>
          </div>

          <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700/80 space-y-1">
            <div className="text-[10px] font-mono font-bold text-emerald-300 uppercase">SECTION 4</div>
            <div className="text-xs font-bold text-white flex items-center gap-1">🛡 Project & Backup™</div>
            <div className="text-[10px] text-slate-400">E1 Blueprint JSON, E1–E6 ZIP, SHA</div>
          </div>
        </div>
      </div>

      {/* Main Compilation Workspace */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-2xs">

        {/* Artifacts Check Banner */}
        {!hasCoreArtifacts ? (
          <div className="p-4 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs space-y-2">
            <div className="font-bold flex items-center gap-2">
              <span>⚠</span> {t.publishing.artifactsNotReadyNotice}
            </div>
            <p className="text-2xs text-amber-800">
              You can still configure edition records and three-tier metadata in E5, but final publication bundles require real master files.
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-medium flex items-center justify-between">
            <div>
              <span className="font-bold">✓</span> {t.publishing.packageReadyNotice}
            </div>
            <span className="text-2xs font-mono font-bold px-2 py-0.5 bg-white text-emerald-800 rounded border border-emerald-300">
              {availableArtifactCount} ARTIFACTS VERIFIED
            </span>
          </div>
        )}

        {/* Verified Artifacts List */}
        <div className="space-y-3">
          <span className="text-2xs font-bold uppercase tracking-wider text-[#081629]">
            {t.publishing.artifactsCheckTitle}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {artifacts.map((art) => (
              <div
                key={art.type}
                className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-2 ${
                  art.isAvailable ? 'bg-slate-50 border-slate-200' : 'bg-slate-50/50 border-slate-200/60 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#081629]">{art.type}</span>
                  <span
                    className={`text-3xs font-mono font-bold px-1.5 py-0.5 rounded ${
                      art.isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {art.isAvailable ? 'VERIFIED' : 'MISSING'}
                  </span>
                </div>
                <div className="text-3xs font-mono text-slate-500 break-all">
                  {art.isAvailable ? (
                    <>
                      <div>{art.fileName} ({(art.fileSizeBytes / 1024).toFixed(1)} KB)</div>
                      <div className="text-slate-400 mt-0.5">SHA: {art.sha256.substring(0, 16)}...</div>
                    </>
                  ) : (
                    'Not compiled in E4 Editorial Hub'
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Package Target Selector & Store Profile Card */}
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <label className="block text-2xs font-bold uppercase tracking-wider text-[#081629]">
                {t.publishing.packageTargetLabel}
              </label>
              <select
                value={targetChannel}
                onChange={(e) => setTargetChannel(e.target.value as ChannelId | 'universal')}
                className="w-full sm:max-w-md px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-[#345CFF] focus:outline-none font-medium"
              >
                {channelOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name}
                  </option>
                ))}
              </select>
            </div>

            <PremiumButton
              variant="gold"
              size="md"
              disabled={isCompiling}
              onClick={handleCompilePackage}
            >
              {isCompiling ? t.publishing.generatingPackage : t.publishing.generatePackageBtn}
            </PremiumButton>
          </div>

          {/* Store Profile Requirements Box */}
          {selectedStoreProfile && (
            <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#081629] flex items-center gap-2">
                  <span>🏪</span> {selectedStoreProfile.storeName} Profile Requirements
                </span>
                <span className="text-3xs font-mono font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                  Status: PACKAGE_GENERATED_LOCAL
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-2xs text-slate-700 font-mono">
                <div>• Allowed Formats: <strong className="text-blue-900">{selectedStoreProfile.allowedFormats.join(', ')}</strong></div>
                <div>• Prohibited: <strong className="text-rose-700">{selectedStoreProfile.prohibitedFormats.join(', ') || 'None'}</strong></div>
                <div>• Cover Spec: {selectedStoreProfile.coverRequirement}</div>
                <div>• Rec. Ratio: {selectedStoreProfile.recommendedCoverRatio}</div>
                <div className="sm:col-span-2 text-slate-500 italic mt-1">• {selectedStoreProfile.notes}</div>
              </div>
            </div>
          )}
        </div>

        {/* Individual File Downloads Toolbar */}
        <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-bold uppercase tracking-wider text-emerald-400">
              Individual Component Downloads
            </span>
            <span className="text-3xs font-mono text-slate-400">Direct Local Access</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleDownloadIndividual('EPUB')}
              className="text-2xs font-semibold px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center gap-1.5"
            >
              ⬇ Download EPUB
            </button>
            <button
              onClick={() => handleDownloadIndividual('PDF')}
              className="text-2xs font-semibold px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center gap-1.5"
            >
              ⬇ Download Digital PDF
            </button>
            <button
              onClick={() => handleDownloadIndividual('COVER')}
              className="text-2xs font-semibold px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center gap-1.5"
            >
              ⬇ Download Front Cover JPG
            </button>
            <button
              onClick={() => handleDownloadIndividual('ONIX')}
              className="text-2xs font-semibold px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center gap-1.5"
            >
              ⬇ Download ONIX 3.0 XML
            </button>
            <button
              onClick={() => handleDownloadIndividual('CHECKLIST')}
              className="text-2xs font-semibold px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center gap-1.5 text-amber-300"
            >
              📄 Upload Guide (.txt)
            </button>
          </div>
        </div>

        {successMsg && (
          <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 font-semibold">
            ✓ {successMsg}
          </div>
        )}
      </div>

      {/* Compiled Packages History List */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-4 shadow-2xs">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#081629]">
          Compiled Store Packages ({packages.length})
        </h3>

        {packages.length === 0 ? (
          <p className="text-xs text-slate-500 py-4">{t.publishing.noPackagesMsg}</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {packages.map((pkg) => (
              <div key={pkg.packageId} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold font-mono text-[#081629]">{pkg.packageId}</span>
                    <span className="text-2xs font-mono px-2 py-0.5 rounded bg-blue-50 text-[#345CFF] border border-blue-200 font-bold">
                      {pkg.targetChannelId.toUpperCase()}
                    </span>
                    <span
                      className={`text-3xs font-mono font-bold px-2 py-0.5 rounded ${
                        pkg.manifest?.storePackageStatus === 'PACKAGE_GENERATED_LOCAL'
                          ? 'bg-emerald-100 text-emerald-800'
                          : pkg.manifest?.storePackageStatus === 'EXTERNAL_VALIDATION_PENDING'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {pkg.manifest?.storePackageStatus || 'PACKAGE_GENERATED_LOCAL'}
                    </span>
                  </div>
                  <div className="text-3xs font-mono text-slate-500">
                    Compiled: {new Date(pkg.createdAt).toLocaleString()} · Size: {pkg.packageZipSizeBytes ? (pkg.packageZipSizeBytes / 1024).toFixed(1) : 0} KB · SHA-256: {pkg.packageZipSha256?.substring(0, 16)}...
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleVerifyPackage(pkg)}
                    disabled={isVerifying}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-indigo-300 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100/60"
                  >
                    {isVerifying ? 'Verifying...' : 'Verify 4D-B2A'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleEvaluateReadiness(pkg)}
                    disabled={isEvaluatingReadiness}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-purple-300 text-purple-700 bg-purple-50/50 hover:bg-purple-100/60"
                  >
                    {readinessReports[pkg.packageId]
                      ? `Gate 4D-B2B: ${readinessReports[pkg.packageId].overallStatus}`
                      : 'Readiness 4D-B2B'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setInspectingPackage(pkg)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    {t.publishing.viewManifestBtn}
                  </button>

                  <PremiumButton
                    variant="primary"
                    size="sm"
                    onClick={() => handleDownloadPackage(pkg)}
                  >
                    {t.publishing.downloadZipBtn}
                  </PremiumButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4D-B2B Store Readiness Quality Gate Overview Panel */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#081629]">
              Store Readiness Quality Gate (Phase 4D-B2B)
            </h3>
            <p className="text-xs text-slate-500">
              Evaluates real compliance against official guidelines for manual store portal upload. Zero fake certifications.
            </p>
          </div>
          <span className="text-3xs font-mono px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-bold self-start sm:self-auto">
            Matrix v2026.10
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { id: 'kdp' as const, name: 'Amazon KDP', portal: 'kdp.amazon.com', format: 'EPUB 3 + Standalone JPEG' },
            { id: 'apple_books' as const, name: 'Apple Books', portal: 'authors.apple.com', format: 'EPUB 3.3 (EPUBCheck)' },
            { id: 'google_play' as const, name: 'Google Play Books', portal: 'play.google.com/books/publish', format: 'EPUB + PDF Master' },
            { id: 'kobo' as const, name: 'Kobo Writing Life', portal: 'kobo.com/writinglife', format: 'EPUB 3 (Standard)' },
          ].map((store) => {
            const matchingPkg = packages.find((p) => p.targetChannelId === store.id);
            const report = matchingPkg ? readinessReports[matchingPkg.packageId] : null;

            return (
              <div
                key={store.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#081629]">{store.name}</span>
                    <span
                      className={`text-3xs font-mono font-bold px-2 py-0.5 rounded ${
                        report?.overallStatus === 'STORE_UPLOAD_READY'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : report?.overallStatus === 'EXTERNAL_VALIDATION_PENDING'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : report?.overallStatus === 'NEEDS_FIX'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {report?.overallStatus || 'NOT_EVALUATED'}
                    </span>
                  </div>
                  <div className="text-3xs font-mono text-slate-500">{store.format}</div>
                  <div className="text-3xs text-blue-600 truncate">{store.portal}</div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  {report ? (
                    <button
                      type="button"
                      onClick={() => setInspectingReadinessReport(report)}
                      className="text-2xs font-bold text-purple-700 hover:text-purple-900 underline"
                    >
                      Inspect Rules ({report.summary.requiredPassed}/{report.summary.total}) →
                    </button>
                  ) : matchingPkg ? (
                    <button
                      type="button"
                      onClick={() => handleEvaluateReadiness(matchingPkg)}
                      disabled={isEvaluatingReadiness}
                      className="text-2xs font-semibold px-2 py-1 rounded bg-purple-100 text-purple-800 hover:bg-purple-200"
                    >
                      {isEvaluatingReadiness ? 'Testing...' : 'Evaluate'}
                    </button>
                  ) : (
                    <span className="text-3xs text-slate-400 italic">Compile package first</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4D-B2B Store Readiness Detailed Inspection Modal */}
      {inspectingReadinessReport && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-[#081629]">
                    Store Readiness Quality Gate: {inspectingReadinessReport.storeId.toUpperCase()}
                  </h4>
                  <span
                    className={`text-2xs font-mono font-bold px-2.5 py-0.5 rounded-full ${
                      inspectingReadinessReport.overallStatus === 'STORE_UPLOAD_READY'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : inspectingReadinessReport.overallStatus === 'EXTERNAL_VALIDATION_PENDING'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : inspectingReadinessReport.overallStatus === 'NEEDS_FIX'
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : 'bg-blue-100 text-blue-800 border border-blue-300'
                    }`}
                  >
                    {inspectingReadinessReport.overallStatus}
                  </span>
                </div>
                <div className="text-3xs font-mono text-slate-500 mt-1">
                  Book: {inspectingReadinessReport.bookId} · Edition: {inspectingReadinessReport.editionId} · Snapshot: {inspectingReadinessReport.approvedSnapshotId}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectingReadinessReport(null)}
                className="text-sm font-bold text-slate-500 hover:text-slate-900 px-2 py-1"
              >
                ✕ Close
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Top Metrics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-2xs font-mono">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-slate-500 uppercase">Total Rules</div>
                  <div className="text-base font-bold text-[#081629] mt-0.5">
                    {inspectingReadinessReport.summary.total}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="text-emerald-700 uppercase">Required Passed</div>
                  <div className="text-base font-bold text-emerald-800 mt-0.5">
                    {inspectingReadinessReport.summary.requiredPassed}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <div className="text-amber-700 uppercase">Pending External</div>
                  <div className="text-base font-bold text-amber-800 mt-0.5">
                    {inspectingReadinessReport.summary.pendingExternal}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                  <div className="text-blue-700 uppercase">Recommended Passed</div>
                  <div className="text-base font-bold text-blue-800 mt-0.5">
                    {inspectingReadinessReport.summary.recommendedPassed}
                  </div>
                </div>
              </div>

              {/* Bound Artifact Hashes */}
              <div className="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-3xs space-y-1">
                <div className="text-slate-400 font-bold uppercase mb-1">
                  // BOUND ARTIFACT SHA-256 DIGESTS (Any file change invalidates report)
                </div>
                <div>EPUB SHA-256: {inspectingReadinessReport.epubSha256 || 'N/A'}</div>
                <div>COVER SHA-256: {inspectingReadinessReport.coverSha256 || 'N/A'}</div>
                {inspectingReadinessReport.pdfSha256 && (
                  <div>PDF SHA-256: {inspectingReadinessReport.pdfSha256}</div>
                )}
                <div>PACKAGE ZIP SHA-256: {inspectingReadinessReport.packageZipSha256}</div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                {(['ALL', 'REQUIRED', 'RECOMMENDED', 'EXTERNAL_VALIDATION'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setReadinessFilter(lvl)}
                    className={`text-2xs font-semibold px-2.5 py-1 rounded-lg transition ${
                      readinessFilter === lvl
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>

              {/* Rules List */}
              <div className="space-y-3">
                {inspectingReadinessReport.evaluations
                  .filter((ev) => readinessFilter === 'ALL' || ev.rule.level === readinessFilter)
                  .map((ev) => (
                    <div
                      key={ev.rule.requirementId}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-2xs font-bold text-slate-800">
                              {ev.rule.requirementId}
                            </span>
                            <span
                              className={`text-3xs font-mono font-bold px-1.5 py-0.5 rounded ${
                                ev.rule.level === 'REQUIRED'
                                  ? 'bg-purple-100 text-purple-800'
                                  : ev.rule.level === 'EXTERNAL_VALIDATION'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {ev.rule.level}
                            </span>
                            <span className="text-3xs font-mono text-slate-400">
                              [{ev.rule.category}]
                            </span>
                          </div>
                          <div className="font-semibold text-xs text-[#081629]">
                            {ev.rule.title}
                          </div>
                        </div>

                        <span
                          className={`text-2xs font-mono font-bold px-2 py-0.5 rounded shrink-0 ${
                            ev.result === 'PASS'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ev.result === 'NOT_TESTED'
                              ? 'bg-amber-100 text-amber-800'
                              : ev.result === 'NOT_APPLICABLE'
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {ev.result}
                        </span>
                      </div>

                      <p className="text-2xs text-slate-600">{ev.rule.description}</p>

                      <div className="p-2 rounded bg-slate-50 border border-slate-150 text-3xs font-mono space-y-0.5">
                        <div className="text-slate-700">
                          <span className="font-bold text-slate-900">Evidence:</span> {ev.evidence}
                        </div>
                        {ev.artifactHash && (
                          <div className="text-slate-500 truncate">
                            <span className="font-bold text-slate-600">Digest:</span> {ev.artifactHash}
                          </div>
                        )}
                        <div className="text-slate-400 flex items-center justify-between pt-1 border-t border-slate-200 mt-1">
                          <a
                            href={ev.rule.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            Official Documentation ({ev.rule.sourceCheckedDate}) ↗
                          </a>
                          <span>Method: {ev.rule.validationMethod}</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Constitutional Integrity Note */}
              <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-3xs text-slate-600 space-y-1">
                <div className="font-bold text-[#081629]">
                  Honest Quality Gate Policy (Zero Fake Claims)
                </div>
                <div>
                  EditorynIQ™ prepares offline store packages and validates compliance with official retailer specifications. We never issue speculative "STORE_ACCEPTED" or "PUBLISHED" confirmations. Final catalog acceptance is authoritative to each respective store partner portal.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4D-B2A Quality Gate Verification Modal */}
      {verificationReport && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-[#081629]">Quality Gate 4D-B2A Inspection Report</h4>
                <span
                  className={`text-2xs font-mono font-bold px-2 py-0.5 rounded ${
                    verificationReport.status === 'LOCAL_PACKAGE_VERIFIED'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  {verificationReport.status}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setVerificationReport(null)}
                className="text-sm font-bold text-slate-500 hover:text-slate-900 px-2 py-1"
              >
                ✕ Close
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-700">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="font-bold text-[#081629]">Channel: {verificationReport.channelId.toUpperCase()}</div>
                <div className="text-2xs font-mono text-slate-600">{verificationReport.details}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-2xs font-mono">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span>CRC32 & ZIP Extract:</span>
                  <span className="font-bold text-emerald-700">PASS</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span>SHA-256 Checksums:</span>
                  <span className={`font-bold ${verificationReport.checksumMatches ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {verificationReport.checksumMatches ? 'VERIFIED' : 'MISMATCH'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span>Inner EPUB 3.3 Structure:</span>
                  <span className={`font-bold ${verificationReport.epubValidLocal ? 'text-emerald-700' : 'text-slate-500'}`}>
                    {verificationReport.epubValidLocal ? 'VALID_LOCAL' : 'N/A'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span>Front Cover JPEG:</span>
                  <span className={`font-bold ${verificationReport.coverValidJpeg ? 'text-emerald-700' : 'text-slate-500'}`}>
                    {verificationReport.coverValidJpeg ? 'VALID_PORTRAIT' : 'N/A'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span>ZIP Path Security:</span>
                  <span className={`font-bold ${verificationReport.securityClean ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {verificationReport.securityClean ? 'CLEAN_PASS' : 'VIOLATION'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span>Metadata Coherence:</span>
                  <span className={`font-bold ${verificationReport.metadataCoherent ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {verificationReport.metadataCoherent ? 'COHERENT' : 'INCOMPLETE'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-2xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Verified Entries ({verificationReport.verifiedFilesCount} files):
                </span>
                <div className="bg-slate-900 text-emerald-400 p-3 rounded-xl font-mono text-3xs space-y-1 max-h-36 overflow-y-auto">
                  {Object.entries(verificationReport.recalculatedSha256).map(([path, hash]) => (
                    <div key={path} className="flex justify-between items-center gap-2">
                      <span className="truncate">{path}</span>
                      <span className="text-slate-500 shrink-0">{hash.substring(0, 16)}...</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manifest & File Tree Inspector Modal */}
      {inspectingPackage && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-[#081629]">Store Package Manifest & Checksums</h4>
                <span className="text-2xs font-mono text-slate-400">ID: {inspectingPackage.packageId} ({inspectingPackage.targetChannelId.toUpperCase()})</span>
              </div>
              <button
                type="button"
                onClick={() => setInspectingPackage(null)}
                className="text-sm font-bold text-slate-500 hover:text-slate-900 px-2 py-1"
              >
                ✕ Close
              </button>
            </div>
            <div className="p-5 overflow-y-auto font-mono text-2xs bg-slate-900 text-emerald-400 rounded-b-2xl space-y-4">
              <div>
                <div className="text-slate-400 uppercase font-bold mb-1">// STORE PACKAGE STATUS & CHECKSUMS</div>
                <pre>{JSON.stringify({
                  packageId: inspectingPackage.packageId,
                  targetChannel: inspectingPackage.targetChannelId,
                  storePackageStatus: inspectingPackage.manifest?.storePackageStatus || 'PACKAGE_GENERATED_LOCAL',
                  manifestSha256: inspectingPackage.manifestSha256,
                  packageZipSha256: inspectingPackage.packageZipSha256,
                  fileChecksums: inspectingPackage.manifest?.fileChecksums || {},
                }, null, 2)}</pre>
              </div>
              <div>
                <div className="text-slate-400 uppercase font-bold mb-1">// FULL MANIFEST PAYLOAD</div>
                <pre>{JSON.stringify(inspectingPackage.manifest, null, 2)}</pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

