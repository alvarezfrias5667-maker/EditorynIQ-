import React from 'react';
import { useI18n } from '../../i18n';
import { BookCategory } from '../../domain/bookProjectTypes';
import { SmartIntakeState, ReaderLevel } from '../../domain/intake/smartIntakeTypes';

export interface BookIdentityStepProps {
  state: SmartIntakeState;
  onChange: (updated: Partial<SmartIntakeState>) => void;
  errors?: Record<string, string>;
}

export const BookIdentityStep: React.FC<BookIdentityStepProps> = ({ state, onChange, errors = {} }) => {
  const { t } = useI18n();
  const { identity } = state;

  const categories: Array<{ id: BookCategory; label: string }> = [
    { id: 'non-fiction', label: t.categories['non-fiction'] },
    { id: 'fiction', label: t.categories['fiction'] },
    { id: 'business', label: t.categories['business'] },
    { id: 'technical', label: t.categories['technical'] },
    { id: 'academic', label: t.categories['academic'] },
    { id: 'self-help', label: t.categories['self-help'] },
    { id: 'children', label: t.categories['children'] },
    { id: 'biography', label: t.categories['biography'] },
    { id: 'poetry', label: t.categories['poetry'] },
    { id: 'art-design', label: t.categories['art-design'] },
    { id: 'mind-philosophy', label: t.categories['mind-philosophy'] },
  ];

  const audienceOptions = [
    'General Professional',
    'Software Engineers & Architects',
    'Founders & Executives',
    'Graduate Students & Researchers',
    'Creative Designers & Artists',
    'Beginner Enthusiasts',
    'Academic Instructors',
  ];

  const readerLevels: Array<{ id: ReaderLevel; label: string; desc: string }> = [
    { id: 'beginner', label: 'Beginner / Introductory', desc: 'No prior background required; plain language and explicit foundations.' },
    { id: 'intermediate', label: 'Intermediate Practitioner', desc: 'Familiar with core domain concepts; looking for systemic depth.' },
    { id: 'advanced', label: 'Advanced Specialist', desc: 'Requires rigorous technical analysis, edge cases, and expert insights.' },
    { id: 'executive', label: 'Executive Decision-Maker', desc: 'High-level strategic focus, ROI frameworks, and actionable summaries.' },
  ];

  const goalOptions = [
    'Knowledge Sharing & Authority',
    'Practical Step-by-Step System',
    'Academic Textbook / Coursework',
    'Creative Expression & Fiction',
    'Corporate Thought Leadership',
    'Product & API Specification',
  ];

  const handleToggleAudience = (aud: string) => {
    const current = identity.targetAudiences || [];
    const updated = current.includes(aud) ? current.filter((a) => a !== aud) : [...current, aud];
    onChange({ identity: { ...identity, targetAudiences: updated } });
  };

  const handleToggleGoal = (goal: string) => {
    const current = identity.goals || [];
    const updated = current.includes(goal) ? current.filter((g) => g !== goal) : [...current, goal];
    onChange({ identity: { ...identity, goals: updated } });
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <span className="text-2xs font-mono font-bold uppercase text-[#345CFF] tracking-wider">Etapa 2 de 6</span>
        <h3 className="text-xl font-bold text-[#081629] mt-0.5">Identity, Category & Audience</h3>
        <p className="text-xs text-slate-500 mt-1">
          Define working title, central thesis, category, and target audience profile.
        </p>
      </div>

      {/* Title */}
      <div className="space-y-1.5">
        <label htmlFor="intakeTitle" className="block text-2xs font-bold uppercase tracking-wider text-[#081629]">
          Book Working Title *
        </label>
        <input
          id="intakeTitle"
          type="text"
          value={identity.title}
          onChange={(e) => onChange({ identity: { ...identity, title: e.target.value } })}
          placeholder="e.g. From Idea to SaaS: The Engineering & Business Blueprint"
          className={`w-full px-4 py-2.5 text-sm rounded-lg border focus:ring-2 focus:ring-[#345CFF] focus:outline-none transition-colors ${
            errors.title ? 'border-[#D14343] bg-red-50/20' : 'border-slate-300'
          }`}
        />
        {errors.title && <p className="text-2xs text-[#D14343] font-semibold">{errors.title}</p>}
      </div>

      {/* Core Concept / Brief */}
      <div className="space-y-1.5">
        <label htmlFor="coreConcept" className="block text-2xs font-bold uppercase tracking-wider text-[#081629]">
          Central Thesis / Summary Brief *
        </label>
        <textarea
          id="coreConcept"
          rows={3}
          value={identity.coreConcept}
          onChange={(e) => onChange({ identity: { ...identity, coreConcept: e.target.value } })}
          placeholder="Provide a concise summary of the core thesis, key arguments, or storyline of the publication..."
          className={`w-full px-4 py-2.5 text-sm rounded-lg border focus:ring-2 focus:ring-[#345CFF] focus:outline-none transition-colors ${
            errors.coreConcept ? 'border-[#D14343] bg-red-50/20' : 'border-slate-300'
          }`}
        />
        {errors.coreConcept && <p className="text-2xs text-[#D14343] font-semibold">{errors.coreConcept}</p>}
      </div>

      {/* Category & Author Name */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="intakeCategory" className="block text-2xs font-bold uppercase tracking-wider text-[#081629]">
            Book Category / Genre *
          </label>
          <select
            id="intakeCategory"
            value={identity.category}
            onChange={(e) => onChange({ identity: { ...identity, category: e.target.value as BookCategory } })}
            className="w-full px-4 py-2.5 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-[#345CFF] focus:outline-none"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="authorName" className="block text-2xs font-bold uppercase tracking-wider text-[#081629]">
            Author / Organization Name (Optional)
          </label>
          <input
            id="authorName"
            type="text"
            value={identity.authorName || ''}
            onChange={(e) => onChange({ identity: { ...identity, authorName: e.target.value } })}
            placeholder="e.g. Dr. Helena Vance / Enterprise Engineering Group"
            className="w-full px-4 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#345CFF] focus:outline-none"
          />
        </div>
      </div>

      {/* Target Audiences (Multiple Choice) */}
      <div className="space-y-2">
        <label className="block text-2xs font-bold uppercase tracking-wider text-[#081629]">
          Target Audience Segments (Multiple Choice) *
        </label>
        <div className="flex flex-wrap gap-2">
          {audienceOptions.map((aud) => {
            const isSelected = (identity.targetAudiences || []).includes(aud);
            return (
              <button
                type="button"
                key={aud}
                onClick={() => handleToggleAudience(aud)}
                className={`px-3 py-1.5 rounded-lg text-2xs font-semibold transition-all border ${
                  isSelected
                    ? 'bg-[#345CFF] text-white border-[#345CFF] shadow-2xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                {isSelected ? '✓ ' : '+ '}
                {aud}
              </button>
            );
          })}
        </div>
        {errors.targetAudiences && <p className="text-2xs text-[#D14343] font-semibold">{errors.targetAudiences}</p>}
      </div>

      {/* Reader Level */}
      <div className="space-y-2">
        <label className="block text-2xs font-bold uppercase tracking-wider text-[#081629]">
          Target Reader Proficiency Level
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {readerLevels.map((lvl) => {
            const isSelected = identity.readerLevel === lvl.id;
            return (
              <div
                key={lvl.id}
                onClick={() => onChange({ identity: { ...identity, readerLevel: lvl.id } })}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-[#345CFF] bg-blue-50/50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-bold text-[#081629]">{lvl.label}</span>
                  {isSelected && <span className="text-2xs text-[#345CFF] font-bold">✓</span>}
                </div>
                <p className="text-3xs text-slate-500">{lvl.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Primary Goals */}
      <div className="space-y-2">
        <label className="block text-2xs font-bold uppercase tracking-wider text-[#081629]">
          Primary Publication Objectives
        </label>
        <div className="flex flex-wrap gap-2">
          {goalOptions.map((goal) => {
            const isSelected = (identity.goals || []).includes(goal);
            return (
              <button
                type="button"
                key={goal}
                onClick={() => handleToggleGoal(goal)}
                className={`px-3 py-1.5 rounded-lg text-2xs font-semibold transition-all border ${
                  isSelected
                    ? 'bg-[#16836D] text-white border-[#16836D]'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                {isSelected ? '✓ ' : '+ '}
                {goal}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
