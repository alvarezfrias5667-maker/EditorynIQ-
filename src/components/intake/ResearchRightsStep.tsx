import React, { useState } from 'react';
import { useI18n } from '../../i18n';
import { SmartIntakeState, MaterialRightsStatus } from '../../domain/intake/smartIntakeTypes';

export interface ResearchRightsStepProps {
  state: SmartIntakeState;
  onChange: (updated: Partial<SmartIntakeState>) => void;
  errors?: Record<string, string>;
}

export const ResearchRightsStep: React.FC<ResearchRightsStepProps> = ({ state, onChange, errors = {} }) => {
  const { t } = useI18n();
  const { researchRights } = state;

  const [newSrcTitle, setNewSrcTitle] = useState('');
  const [newSrcUrl, setNewSrcUrl] = useState('');
  const [newSrcPurpose, setNewSrcPurpose] = useState('');
  const [newProtectedTerm, setNewProtectedTerm] = useState('');

  const rightsOptions: Array<{ id: MaterialRightsStatus; label: string; desc: string }> = [
    { id: 'ALL_OWNED', label: t.intake.rightsAllOwned || '100% Original Author Creation', desc: 'All text, figures, and code are created directly by author or organizational team.' },
    { id: 'LICENSED_CREATIVE_COMMONS', label: t.intake.rightsLicensedCC || 'Open License / Creative Commons', desc: 'Contains licensed open source or Creative Commons material with required attribution.' },
    { id: 'PUBLIC_DOMAIN', label: t.intake.rightsPublicDomain || 'Public Domain Reference', desc: 'References public domain historical, government, or academic archives.' },
    { id: 'REQUIRES_PERMIT', label: t.intake.rightsRequiresPermit || 'Permissions Required / In Progress', desc: 'Includes third-party quotes or artwork requiring publisher clearance.' },
    { id: 'UNVERIFIED', label: t.intake.rightsUnverified || 'Unverified Third-Party Content', desc: 'Contains unverified external materials requiring audit before final sign-off.' },
  ];

  const handleAddSource = () => {
    if (!newSrcTitle.trim()) return;
    const newSrc = {
      id: `src_${Date.now()}`,
      title: newSrcTitle.trim(),
      url: newSrcUrl.trim() || undefined,
      usagePurpose: newSrcPurpose.trim() || 'General Research Reference',
    };
    onChange({
      researchRights: {
        ...researchRights,
        researchSources: [...researchRights.researchSources, newSrc],
      },
    });
    setNewSrcTitle('');
    setNewSrcUrl('');
    setNewSrcPurpose('');
  };

  const handleRemoveSource = (id: string) => {
    onChange({
      researchRights: {
        ...researchRights,
        researchSources: researchRights.researchSources.filter((s) => s.id !== id),
      },
    });
  };

  const handleAddProtectedTerm = () => {
    if (!newProtectedTerm.trim()) return;
    const term = newProtectedTerm.trim();
    if (!researchRights.protectedTerms.includes(term)) {
      onChange({
        researchRights: {
          ...researchRights,
          protectedTerms: [...researchRights.protectedTerms, term],
        },
      });
    }
    setNewProtectedTerm('');
  };

  const handleRemoveProtectedTerm = (term: string) => {
    onChange({
      researchRights: {
        ...researchRights,
        protectedTerms: researchRights.protectedTerms.filter((t) => t !== term),
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <span className="text-2xs font-mono font-bold uppercase text-[#345CFF] tracking-wider">
          {t.intake.stageTag?.replace('{current}', '5') || 'Stage 5 of 6'}
        </span>
        <h3 className="text-xl font-bold text-[#081629] mt-0.5">{t.intake.step5Title || 'Research Sources, Protected Terms & Rights'}</h3>
        <p className="text-xs text-slate-500 mt-1">
          {t.intake.step5Subtitle || 'Document research bibliography, declare material copyright rights, and freeze protected terminology.'}
        </p>
      </div>

      {/* Material Rights Status */}
      <div className="space-y-2">
        <label className="block text-2xs font-bold uppercase tracking-wider text-[#081629]">
          {t.intake.materialRightsLabel || 'Material Copyright & Provenance Declaration *'}
        </label>
        <div className="space-y-2">
          {rightsOptions.map((opt) => {
            const isSelected = researchRights.materialRightsStatus === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => onChange({ researchRights: { ...researchRights, materialRightsStatus: opt.id } })}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected ? 'border-[#345CFF] bg-blue-50/50' : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-bold text-[#081629]">{opt.label}</span>
                  {isSelected && <span className="text-2xs text-[#345CFF] font-bold">✓ Selected</span>}
                </div>
                <p className="text-3xs text-slate-500">{opt.desc}</p>
              </div>
            );
          })}
        </div>
        {errors.materialRightsStatus && <p className="text-2xs text-[#D14343] font-semibold">{errors.materialRightsStatus}</p>}
      </div>

      {/* Research Sources Logger */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/90 space-y-3">
        <span className="text-2xs font-bold uppercase text-[#081629] tracking-wider">Log Research Source / Bibliography Item</span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input
            type="text"
            placeholder="Source Title (e.g. IEEE Distributed Systems Paper)"
            value={newSrcTitle}
            onChange={(e) => setNewSrcTitle(e.target.value)}
            className="px-3 py-1.5 text-xs rounded border border-slate-300 bg-white"
          />
          <input
            type="url"
            placeholder="URL (optional)"
            value={newSrcUrl}
            onChange={(e) => setNewSrcUrl(e.target.value)}
            className="px-3 py-1.5 text-xs rounded border border-slate-300 bg-white"
          />
          <input
            type="text"
            placeholder="Purpose (e.g. Ch.2 benchmark data)"
            value={newSrcPurpose}
            onChange={(e) => setNewSrcPurpose(e.target.value)}
            className="px-3 py-1.5 text-xs rounded border border-slate-300 bg-white"
          />
        </div>
        <button
          type="button"
          onClick={handleAddSource}
          className="text-2xs font-bold px-3 py-1.5 rounded-md bg-[#345CFF] text-white hover:bg-blue-600"
        >
          + Add Research Source
        </button>

        {researchRights.researchSources.length > 0 && (
          <div className="divide-y divide-slate-200 pt-2 text-2xs font-mono">
            {researchRights.researchSources.map((s) => (
              <div key={s.id} className="py-2 flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#081629]">{s.title}</span>
                  {s.url && <span className="text-slate-400 ml-2">({s.url})</span>}
                  <p className="text-3xs text-slate-500 font-sans">{s.usagePurpose}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveSource(s.id)}
                  className="text-2xs text-[#D14343] hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Protected Terminology */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/90 space-y-3">
        <span className="text-2xs font-bold uppercase text-[#081629] tracking-wider">Protected Terms & Glossary Codes</span>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. EditorynIQ™, Enterprise-IQ, QuantumCore"
            value={newProtectedTerm}
            onChange={(e) => setNewProtectedTerm(e.target.value)}
            className="flex-1 px-3 py-1.5 text-xs rounded border border-slate-300 bg-white"
          />
          <button
            type="button"
            onClick={handleAddProtectedTerm}
            className="text-2xs font-bold px-3 py-1.5 rounded-md bg-[#16836D] text-white"
          >
            + Freeze Term
          </button>
        </div>

        {researchRights.protectedTerms.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {researchRights.protectedTerms.map((term) => (
              <span key={term} className="px-2.5 py-1 rounded-md bg-emerald-100 text-[#16836D] text-2xs font-mono font-bold flex items-center gap-1">
                🔒 {term}
                <button type="button" onClick={() => handleRemoveProtectedTerm(term)} className="hover:text-red-700 ml-1">×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Special Directives */}
      <div className="space-y-1.5">
        <label htmlFor="specialInstructions" className="block text-2xs font-bold uppercase tracking-wider text-[#081629]">
          Special Author Constraints & Editorial Directives
        </label>
        <textarea
          id="specialInstructions"
          rows={3}
          value={researchRights.specialInstructions}
          onChange={(e) => onChange({ researchRights: { ...researchRights, specialInstructions: e.target.value } })}
          placeholder="Any mandatory formatting rules, forbidden terms, or publishing guidelines..."
          className="w-full px-4 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#345CFF] focus:outline-none"
        />
      </div>
    </div>
  );
};
