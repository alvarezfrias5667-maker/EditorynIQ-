import React, { useState, useEffect } from 'react';
import { useI18n } from '../../i18n';
import { BookProject } from '../../domain/bookProjectTypes';
import { EditorialEdition } from '../../domain/editorial/editorialTypes';
import {
  EditionRecord,
  EditionType,
  EditionFormat,
  RightsDeclaration,
  TerritoryScope,
} from '../../domain/publishing/publishingTypes';
import { localBookRepository } from '../../services/localBookRepository';
import { localEditorialRepository } from '../../services/localEditorialRepository';
import { localPublishingRepository } from '../../services/localPublishingRepository';
import {
  createDefaultEditionRecord,
  validateIsbn13,
  getEditionTypeLabel,
  getRightsDeclarationLabel,
} from '../../domain/publishing/editionEngine';
import { PublishingNavTabs } from '../../components/publishing/PublishingNavTabs';
import { PremiumButton } from '../../components/ui/PremiumButton';

export interface EditionsPageProps {
  projectId: string;
  onNavigate: (path: string) => void;
}

export const EditionsPage: React.FC<EditionsPageProps> = ({ projectId, onNavigate }) => {
  const { t, lang } = useI18n();

  const [project, setProject] = useState<BookProject | null>(null);
  const [e4Edition, setE4Edition] = useState<EditorialEdition | null>(null);
  const [editions, setEditions] = useState<EditionRecord[]>([]);
  const [selectedEditionId, setSelectedEditionId] = useState<string>('');
  const [formEdition, setFormEdition] = useState<EditionRecord | null>(null);
  const [isbnFeedback, setIsbnFeedback] = useState<{ isValid: boolean; message: string }>({
    isValid: true,
    message: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;

    const loadData = async () => {
      setLoading(true);
      const [proj, e4Eds, existingEditions] = await Promise.all([
        localBookRepository.getProjectById(projectId),
        localEditorialRepository.getEditionsByBookId(projectId),
        localPublishingRepository.getEditionsByBookId(projectId),
      ]);

      setProject(proj);
      const primaryE4 = e4Eds.length > 0 ? e4Eds[0] : null;
      setE4Edition(primaryE4);

      if (existingEditions.length > 0) {
        setEditions(existingEditions);
        setSelectedEditionId(existingEditions[0].id);
        setFormEdition({ ...existingEditions[0] });
        validateIsbn(existingEditions[0].isbn13);
      } else if (proj) {
        const defaultEd = createDefaultEditionRecord(proj, primaryE4 || undefined);
        await localPublishingRepository.saveEdition(defaultEd);
        setEditions([defaultEd]);
        setSelectedEditionId(defaultEd.id);
        setFormEdition({ ...defaultEd });
        validateIsbn(defaultEd.isbn13);
      }

      setLoading(false);
    };

    loadData();
  }, [projectId]);

  const validateIsbn = (val: string) => {
    const res = validateIsbn13(val);
    setIsbnFeedback({
      isValid: res.status !== 'INVALID_ISBN13',
      message: res.message,
    });
    return res;
  };

  const handleSelectEdition = (editionId: string) => {
    const found = editions.find((e) => e.id === editionId);
    if (found) {
      setSelectedEditionId(editionId);
      setFormEdition({ ...found });
      validateIsbn(found.isbn13);
      setSaveSuccessMsg('');
    }
  };

  const handleCreateNewEdition = () => {
    if (!project) return;
    const newEd = createDefaultEditionRecord(project, e4Edition || undefined, {
      editionName: `${project.title} — New Edition`,
      version: '1.1.0',
      editionType: 'REVISED_EDITION',
    });
    setFormEdition(newEd);
    setSelectedEditionId(newEd.id);
    validateIsbn(newEd.isbn13);
    setSaveSuccessMsg('');
  };

  const handleSaveEdition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEdition) return;

    setIsSaving(true);
    const isbnRes = validateIsbn(formEdition.isbn13);

    const updated: EditionRecord = {
      ...formEdition,
      isbn13: isbnRes.formatted || formEdition.isbn13,
      isbnStatus: isbnRes.status,
      updatedAt: new Date().toISOString(),
    };

    const ok = await localPublishingRepository.saveEdition(updated);
    if (ok) {
      const refreshed = await localPublishingRepository.getEditionsByBookId(projectId);
      setEditions(refreshed);
      setFormEdition(updated);
      setSaveSuccessMsg('Edition record successfully saved to local IndexedDB.');
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    }
    setIsSaving(false);
  };

  const handleDeleteEdition = async () => {
    if (!formEdition || editions.length <= 1) return;
    const confirm = window.confirm('Delete this edition record? This action cannot be undone.');
    if (!confirm) return;

    await localPublishingRepository.deleteEdition(formEdition.id);
    const refreshed = await localPublishingRepository.getEditionsByBookId(projectId);
    setEditions(refreshed);
    if (refreshed.length > 0) {
      setSelectedEditionId(refreshed[0].id);
      setFormEdition({ ...refreshed[0] });
    }
  };

  const handleToggleFormat = (fmt: EditionFormat) => {
    if (!formEdition) return;
    const current = formEdition.formats;
    const exists = current.includes(fmt);
    let next: EditionFormat[];
    if (exists) {
      if (current.length === 1) return; // Keep at least one
      next = current.filter((f) => f !== fmt);
    } else {
      next = [...current, fmt];
    }
    setFormEdition({ ...formEdition, formats: next });
  };

  const editionTypes: EditionType[] = [
    'FIRST_EDITION',
    'REVISED_EDITION',
    'SPECIAL_EDITION',
    'TRANSLATION_EDITION',
    'PAPERBACK_STANDARD',
    'HARDCOVER_COLLECTOR',
    'DIGITAL_EBOOK',
  ];

  const rightsOptions: RightsDeclaration[] = [
    'ALL_OWNED',
    'LICENSED_CREATIVE_COMMONS',
    'PUBLIC_DOMAIN',
    'REQUIRES_PERMIT',
    'UNVERIFIED',
  ];

  const territoryOptions: TerritoryScope[] = [
    'WORLDWIDE',
    'NORTH_AMERICA',
    'LATIN_AMERICA',
    'EUROPE',
    'ASIA_PACIFIC',
    'SPECIFIC_TERRITORIES',
  ];

  if (loading) {
    return (
      <div className="py-12 max-w-5xl mx-auto px-4 text-center">
        <div className="p-8 bg-white rounded-2xl border font-mono text-xs text-slate-500">Loading Edition Center...</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <PublishingNavTabs projectId={projectId} activeTab="editions" onNavigate={onNavigate} />

      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-[#081629]">{t.publishing.editionsTitle}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{t.publishing.editionsSubtitle}</p>
          </div>

          <PremiumButton variant="primary" size="sm" onClick={handleCreateNewEdition}>
            + {t.publishing.btnNewEdition}
          </PremiumButton>
        </div>

        {/* Editions Selector List */}
        <div className="space-y-2">
          <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500">
            Registered Editions ({editions.length})
          </label>
          <div className="flex flex-wrap gap-2">
            {editions.map((ed) => (
              <button
                key={ed.id}
                type="button"
                onClick={() => handleSelectEdition(ed.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                  selectedEditionId === ed.id
                    ? 'bg-[#345CFF] text-white border-[#345CFF] font-bold shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {ed.editionName} (v{ed.version})
              </button>
            ))}
          </div>
        </div>

        {saveSuccessMsg && (
          <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 font-semibold">
            ✓ {saveSuccessMsg}
          </div>
        )}

        {/* Edition Edit Form */}
        {formEdition && (
          <form onSubmit={handleSaveEdition} className="space-y-6 pt-4 border-t border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Edition Name */}
              <div className="space-y-1">
                <label className="block text-2xs font-bold uppercase tracking-wider text-[#081629]">
                  {t.publishing.editionNameLabel}
                </label>
                <input
                  type="text"
                  required
                  value={formEdition.editionName}
                  onChange={(e) => setFormEdition({ ...formEdition, editionName: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-[#345CFF] focus:outline-none"
                />
              </div>

              {/* Edition Type */}
              <div className="space-y-1">
                <label className="block text-2xs font-bold uppercase tracking-wider text-[#081629]">
                  {t.publishing.editionTypeLabel}
                </label>
                <select
                  value={formEdition.editionType}
                  onChange={(e) => setFormEdition({ ...formEdition, editionType: e.target.value as EditionType })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-[#345CFF] focus:outline-none"
                >
                  {editionTypes.map((type) => (
                    <option key={type} value={type}>
                      {getEditionTypeLabel(type, lang)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Version */}
              <div className="space-y-1">
                <label className="block text-2xs font-bold uppercase tracking-wider text-[#081629]">
                  {t.publishing.versionLabel}
                </label>
                <input
                  type="text"
                  required
                  value={formEdition.version}
                  onChange={(e) => setFormEdition({ ...formEdition, version: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-mono focus:ring-2 focus:ring-[#345CFF] focus:outline-none"
                />
              </div>

              {/* Production Language */}
              <div className="space-y-1">
                <label className="block text-2xs font-bold uppercase tracking-wider text-[#081629]">
                  Book Language
                </label>
                <select
                  value={formEdition.productionLanguage}
                  onChange={(e) => setFormEdition({ ...formEdition, productionLanguage: e.target.value as 'en' | 'es' })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-[#345CFF] focus:outline-none"
                >
                  <option value="en">English (EN)</option>
                  <option value="es">Español (ES)</option>
                </select>
              </div>

              {/* Author / Copyright Holder */}
              <div className="space-y-1">
                <label className="block text-2xs font-bold uppercase tracking-wider text-[#081629]">
                  {t.publishing.authorNameLabel}
                </label>
                <input
                  type="text"
                  required
                  value={formEdition.authorName}
                  onChange={(e) => setFormEdition({ ...formEdition, authorName: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-[#345CFF] focus:outline-none"
                />
              </div>

              {/* Publisher Imprint */}
              <div className="space-y-1">
                <label className="block text-2xs font-bold uppercase tracking-wider text-[#081629]">
                  {t.publishing.imprintLabel}
                </label>
                <input
                  type="text"
                  required
                  value={formEdition.publisherImprint}
                  onChange={(e) => setFormEdition({ ...formEdition, publisherImprint: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-[#345CFF] focus:outline-none"
                />
              </div>
            </div>

            {/* Formats Checkboxes */}
            <div className="space-y-2">
              <label className="block text-2xs font-bold uppercase tracking-wider text-[#081629]">
                {t.publishing.formatsLabel}
              </label>
              <div className="flex gap-4">
                {(['PDF', 'EPUB', 'DOCX'] as EditionFormat[]).map((fmt) => {
                  const checked = formEdition.formats.includes(fmt);
                  return (
                    <label key={fmt} className="flex items-center gap-2 text-xs cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleToggleFormat(fmt)}
                        className="rounded border-slate-300 text-[#345CFF] focus:ring-[#345CFF]"
                      />
                      <span className="font-bold text-[#081629]">{fmt}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Rights Declaration & Evidence */}
            <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-2xs font-bold uppercase tracking-wider text-[#081629]">
                    {t.publishing.rightsStatusLabel}
                  </label>
                  <select
                    value={formEdition.rightsStatus}
                    onChange={(e) => setFormEdition({ ...formEdition, rightsStatus: e.target.value as RightsDeclaration })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-[#345CFF] focus:outline-none"
                  >
                    {rightsOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {getRightsDeclarationLabel(opt, lang)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-2xs font-bold uppercase tracking-wider text-[#081629]">
                    {t.publishing.territoryScopeLabel}
                  </label>
                  <select
                    value={formEdition.territoryScope}
                    onChange={(e) => setFormEdition({ ...formEdition, territoryScope: e.target.value as TerritoryScope })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-[#345CFF] focus:outline-none"
                  >
                    {territoryOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-2xs font-bold uppercase tracking-wider text-[#081629]">
                  {t.publishing.rightsEvidenceLabel}
                </label>
                <textarea
                  rows={2}
                  required
                  value={formEdition.rightsEvidence}
                  onChange={(e) => setFormEdition({ ...formEdition, rightsEvidence: e.target.value })}
                  placeholder="State evidence of original authorship, licenses, copyright registrations, or public domain sources..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-[#345CFF] focus:outline-none"
                />
                <span className="text-3xs text-slate-500 block">
                  * Note: Self-declaration of rights is documented for provenance tracking; it does not constitute an external legal verification.
                </span>
              </div>
            </div>

            {/* Real ISBN-13 Validator */}
            <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <label className="block text-2xs font-bold uppercase tracking-wider text-[#081629]">
                {t.publishing.isbn13Label}
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="e.g. 978-0-123456-47-2 (Leave blank if unassigned)"
                  value={formEdition.isbn13}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormEdition({ ...formEdition, isbn13: val });
                    validateIsbn(val);
                  }}
                  className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-mono focus:ring-2 focus:ring-[#345CFF] focus:outline-none"
                />
                <span
                  className={`text-2xs font-mono font-bold px-3 py-2 rounded-lg border flex items-center justify-center shrink-0 ${
                    formEdition.isbnStatus === 'VALID_ISBN13'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : formEdition.isbnStatus === 'INVALID_ISBN13'
                      ? 'bg-red-50 text-red-800 border-red-300'
                      : 'bg-slate-100 text-slate-600 border-slate-300'
                  }`}
                >
                  {formEdition.isbnStatus || 'UNASSIGNED'}
                </span>
              </div>
              <p
                className={`text-2xs ${
                  isbnFeedback.isValid ? 'text-slate-600' : 'text-red-600 font-semibold'
                }`}
              >
                {isbnFeedback.message || t.publishing.isbnNotice}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              {editions.length > 1 ? (
                <button
                  type="button"
                  onClick={handleDeleteEdition}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-800"
                >
                  {t.publishing.deleteEditionBtn}
                </button>
              ) : (
                <div />
              )}

              <PremiumButton variant="gold" size="md" disabled={isSaving}>
                {isSaving ? 'Saving Edition...' : t.publishing.saveEditionBtn}
              </PremiumButton>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
