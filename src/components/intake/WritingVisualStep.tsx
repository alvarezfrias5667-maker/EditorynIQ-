import React from 'react';
import { useI18n } from '../../i18n';
import { EditorialProfile, ProductionLanguage } from '../../domain/bookProjectTypes';
import { SmartIntakeState } from '../../domain/intake/smartIntakeTypes';

export interface WritingVisualStepProps {
  state: SmartIntakeState;
  onChange: (updated: Partial<SmartIntakeState>) => void;
  errors?: Record<string, string>;
}

export const WritingVisualStep: React.FC<WritingVisualStepProps> = ({ state, onChange, errors = {} }) => {
  const { t } = useI18n();
  const { writingVisual } = state;

  const toneOptions = ['Authoritative', 'Clarity-Focused', 'Conversational', 'Academic', 'Narrative', 'Visionary'];
  const visualOptions = ['Covers', 'Technical Diagrams', 'Data Charts', 'Editorial Infographics', 'Illustrations'];
  const formatOptions = ['PDF', 'EPUB', 'DOCX'];

  const handleToggleTone = (tone: string) => {
    const current = writingVisual.tones || [];
    const updated = current.includes(tone) ? current.filter((t) => t !== tone) : [...current, tone];
    onChange({ writingVisual: { ...writingVisual, tones: updated } });
  };

  const handleToggleVisual = (vis: string) => {
    const current = writingVisual.requestedVisuals || [];
    const updated = current.includes(vis) ? current.filter((v) => v !== vis) : [...current, vis];
    onChange({ writingVisual: { ...writingVisual, requestedVisuals: updated } });
  };

  const handleToggleFormat = (fmt: string) => {
    const current = writingVisual.exportFormats || [];
    const updated = current.includes(fmt) ? current.filter((f) => f !== fmt) : [...current, fmt];
    onChange({ writingVisual: { ...writingVisual, exportFormats: updated } });
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <span className="text-2xs font-mono font-bold uppercase text-[#345CFF] tracking-wider">Etapa 4 de 6</span>
        <h3 className="text-xl font-bold text-[#081629] mt-0.5">Writing Directives, Page Budget & Visual Profile</h3>
        <p className="text-xs text-slate-500 mt-1">
          Configure production language, page count (20–600), editorial profile, tone, and visual assets.
        </p>
      </div>

      {/* Language & Page Budget */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="intakeLang" className="block text-2xs font-bold uppercase tracking-wider text-[#081629]">
            Book Production Language *
          </label>
          <select
            id="intakeLang"
            value={writingVisual.productionLanguage}
            onChange={(e) => onChange({ writingVisual: { ...writingVisual, productionLanguage: e.target.value as ProductionLanguage } })}
            className="w-full px-4 py-2.5 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-[#345CFF] focus:outline-none"
          >
            <option value="en">English (US/UK Trade)</option>
            <option value="es">Español (Spanish Trade)</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="intakeProfile" className="block text-2xs font-bold uppercase tracking-wider text-[#081629]">
            Editorial Typesetting Profile *
          </label>
          <select
            id="intakeProfile"
            value={writingVisual.editorialProfile}
            onChange={(e) => onChange({ writingVisual: { ...writingVisual, editorialProfile: e.target.value as EditorialProfile } })}
            className="w-full px-4 py-2.5 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-[#345CFF] focus:outline-none"
          >
            <option value="text-first">Text-First™ (Novels, Essays, Non-Fiction)</option>
            <option value="visual-first">Visual-First™ (Art, Catalogs, Illustrated)</option>
            <option value="technical-first">Technical-First™ (Textbooks, Code, Business)</option>
          </select>
        </div>
      </div>

      {/* Target Page Budget (20-600) */}
      <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-200/90">
        <div className="flex items-center justify-between">
          <label htmlFor="intakePages" className="block text-2xs font-bold uppercase tracking-wider text-[#081629]">
            Target Page Budget (20–600 Pages) *
          </label>
          <span className="text-2xs font-mono font-bold px-2.5 py-0.5 rounded bg-blue-100 text-[#345CFF]">
            {writingVisual.targetPages <= 300 ? 'Standard Production (20–300 pgs)' : 'Extended Production (301–600 pgs)'}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <input
            id="intakePages"
            type="number"
            min={20}
            max={600}
            value={writingVisual.targetPages}
            onChange={(e) => onChange({ writingVisual: { ...writingVisual, targetPages: Number(e.target.value) } })}
            className="w-28 px-3 py-1.5 text-sm rounded-lg border border-slate-300 font-mono font-bold focus:ring-2 focus:ring-[#345CFF]"
          />
          <input
            type="range"
            min={20}
            max={600}
            step={10}
            value={writingVisual.targetPages}
            onChange={(e) => onChange({ writingVisual: { ...writingVisual, targetPages: Number(e.target.value) } })}
            className="flex-1 accent-[#345CFF]"
          />
        </div>
        {errors.targetPages && <p className="text-2xs text-[#D14343] font-semibold">{errors.targetPages}</p>}
      </div>

      {/* Tone Directives */}
      <div className="space-y-2">
        <label className="block text-2xs font-bold uppercase tracking-wider text-[#081629]">
          Editorial Tones & Prose Directives
        </label>
        <div className="flex flex-wrap gap-2">
          {toneOptions.map((tone) => {
            const isSelected = (writingVisual.tones || []).includes(tone);
            return (
              <button
                type="button"
                key={tone}
                onClick={() => handleToggleTone(tone)}
                className={`px-3 py-1.5 rounded-lg text-2xs font-semibold transition-all border ${
                  isSelected ? 'bg-[#345CFF] text-white border-[#345CFF]' : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                {isSelected ? '✓ ' : '+ '}
                {tone}
              </button>
            );
          })}
        </div>
      </div>

      {/* Visual Assets Requested */}
      <div className="space-y-2">
        <label className="block text-2xs font-bold uppercase tracking-wider text-[#081629]">
          Requested E3 Visual Production Assets
        </label>
        <div className="flex flex-wrap gap-2">
          {visualOptions.map((vis) => {
            const isSelected = (writingVisual.requestedVisuals || []).includes(vis);
            return (
              <button
                type="button"
                key={vis}
                onClick={() => handleToggleVisual(vis)}
                className={`px-3 py-1.5 rounded-lg text-2xs font-semibold transition-all border ${
                  isSelected ? 'bg-[#16836D] text-white border-[#16836D]' : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                {isSelected ? '✓ ' : '+ '}
                {vis}
              </button>
            );
          })}
        </div>
      </div>

      {/* Export Formats */}
      <div className="space-y-2">
        <label className="block text-2xs font-bold uppercase tracking-wider text-[#081629]">
          Target Master Export Formats
        </label>
        <div className="flex flex-wrap gap-2">
          {formatOptions.map((fmt) => {
            const isSelected = (writingVisual.exportFormats || []).includes(fmt);
            return (
              <button
                type="button"
                key={fmt}
                onClick={() => handleToggleFormat(fmt)}
                className={`px-3 py-1.5 rounded-lg text-2xs font-semibold transition-all border ${
                  isSelected ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                {isSelected ? '✓ ' : '+ '}
                {fmt}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
