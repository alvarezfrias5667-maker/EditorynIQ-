import React, { useState } from 'react';
import { useI18n } from '../../i18n';
import { SmartIntakeState, DepthLevel, OrganizationStyle } from '../../domain/intake/smartIntakeTypes';
import {
  getRecommendedTopicsForCategory,
  isFictionCategory,
  isTechnicalCategory,
  isBusinessCategory,
} from '../../domain/intake/conditionalQuestionEngine';

export interface ContentArchitectureStepProps {
  state: SmartIntakeState;
  onChange: (updated: Partial<SmartIntakeState>) => void;
  errors?: Record<string, string>;
}

export const ContentArchitectureStep: React.FC<ContentArchitectureStepProps> = ({ state, onChange, errors = {} }) => {
  const { t } = useI18n();
  const { architecture, identity } = state;

  const [useProvidedTOC, setUseProvidedTOC] = useState<boolean>(
    Boolean(architecture.providedTableOfContents && architecture.providedTableOfContents.length > 10)
  );

  const recommendedTopics = getRecommendedTopicsForCategory(identity.category);

  const organizationStyles: Array<{ id: OrganizationStyle; label: string; desc: string }> = [
    { id: 'thematic', label: 'Thematic Blocks', desc: 'Group concepts logically by subject domain and core principles.' },
    { id: 'problem_solution', label: 'Problem-Solution Pattern', desc: 'Define key industry friction points followed by systematic solutions.' },
    { id: 'modular_framework', label: 'Modular Architectural Framework', desc: 'Build incremental layers from fundamental building blocks.' },
    { id: 'case_study_based', label: 'Case Study & Empirical Analysis', desc: 'Anchor chapters around real-world market or research case studies.' },
    { id: 'chronological', label: 'Chronological Timeline', desc: 'Follow sequential historical or narrative progression.' },
  ];

  const handleToggleTopic = (topic: string) => {
    const current = architecture.topics || [];
    const updated = current.includes(topic) ? current.filter((t) => t !== topic) : [...current, topic];
    onChange({ architecture: { ...architecture, topics: updated } });
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <span className="text-2xs font-mono font-bold uppercase text-[#345CFF] tracking-wider">Etapa 3 de 6</span>
        <h3 className="text-xl font-bold text-[#081629] mt-0.5">Content Architecture & Table of Contents</h3>
        <p className="text-xs text-slate-500 mt-1">
          Define chapter organization, depth, and supply your own Table of Contents or select key structural topics.
        </p>
      </div>

      {/* TOC Origin Toggle */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/90 space-y-3">
        <span className="text-2xs font-bold uppercase text-[#081629] tracking-wider">Table of Contents Authority</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setUseProvidedTOC(false)}
            className={`p-3 rounded-lg text-xs font-bold border transition-all text-left ${
              !useProvidedTOC
                ? 'bg-white border-[#345CFF] text-[#345CFF] shadow-2xs'
                : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}
          >
            1. Derive Structure from Topics & Subtopics
          </button>

          <button
            type="button"
            onClick={() => setUseProvidedTOC(true)}
            className={`p-3 rounded-lg text-xs font-bold border transition-all text-left ${
              useProvidedTOC
                ? 'bg-white border-[#345CFF] text-[#345CFF] shadow-2xs'
                : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}
          >
            2. Provide My Own Table of Contents
          </button>
        </div>
      </div>

      {/* Mode A: Provided TOC Text Area */}
      {useProvidedTOC ? (
        <div className="space-y-2">
          <label htmlFor="providedTOC" className="block text-2xs font-bold uppercase tracking-wider text-[#081629]">
            Author's Table of Contents (Paste Chapter Titles line by line) *
          </label>
          <textarea
            id="providedTOC"
            rows={8}
            value={architecture.providedTableOfContents || ''}
            onChange={(e) => onChange({ architecture: { ...architecture, providedTableOfContents: e.target.value } })}
            placeholder={`Chapter 1: Foundational Architecture & Paradigm Shifts\n  - 1.1 Core Principles\n  - 1.2 Historical Context\nChapter 2: Building High-Performance Distributed Engines\nChapter 3: Security & Operational Governance`}
            className="w-full px-4 py-2.5 text-xs font-mono rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#345CFF] focus:outline-none"
          />
          <p className="text-3xs text-slate-400 font-mono">
            * The engine will parse chapter titles and sections line by line to preserve your exact structural intent.
          </p>
        </div>
      ) : (
        /* Mode B: Topic Selection */
        <div className="space-y-3">
          <label className="block text-2xs font-bold uppercase tracking-wider text-[#081629]">
            Recommended Topics for {identity.category.toUpperCase()} (Select Key Themes) *
          </label>
          <div className="flex flex-wrap gap-2">
            {recommendedTopics.map((topic) => {
              const isSelected = (architecture.topics || []).includes(topic);
              return (
                <button
                  type="button"
                  key={topic}
                  onClick={() => handleToggleTopic(topic)}
                  className={`px-3 py-1.5 rounded-lg text-2xs font-semibold transition-all border ${
                    isSelected
                      ? 'bg-[#345CFF] text-white border-[#345CFF]'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {isSelected ? '✓ ' : '+ '}
                  {topic}
                </button>
              );
            })}
          </div>
          {errors.topics && <p className="text-2xs text-[#D14343] font-semibold">{errors.topics}</p>}
        </div>
      )}

      {/* Organization Style */}
      <div className="space-y-2">
        <label className="block text-2xs font-bold uppercase tracking-wider text-[#081629]">
          Structural Organization Pattern
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {organizationStyles.map((style) => {
            const isSelected = architecture.organizationStyle === style.id;
            return (
              <div
                key={style.id}
                onClick={() => onChange({ architecture: { ...architecture, organizationStyle: style.id } })}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  isSelected ? 'border-[#345CFF] bg-blue-50/50' : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <span className="text-xs font-bold text-[#081629] block mb-0.5">{style.label}</span>
                <p className="text-3xs text-slate-500">{style.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Depth & Suggested Chapter Count */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="depthLevel" className="block text-2xs font-bold uppercase tracking-wider text-[#081629]">
            Coverage Depth Level
          </label>
          <select
            id="depthLevel"
            value={architecture.depth}
            onChange={(e) => onChange({ architecture: { ...architecture, depth: e.target.value as DepthLevel } })}
            className="w-full px-4 py-2.5 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-[#345CFF] focus:outline-none"
          >
            <option value="introductory">Introductory / Overview</option>
            <option value="comprehensive">Comprehensive / In-Depth</option>
            <option value="mastery_specialized">Mastery / Advanced Specialist</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="chapterCount" className="block text-2xs font-bold uppercase tracking-wider text-[#081629]">
            Suggested Chapter Count
          </label>
          <input
            id="chapterCount"
            type="number"
            min={3}
            max={30}
            value={architecture.suggestedChapterCount}
            onChange={(e) => onChange({ architecture: { ...architecture, suggestedChapterCount: Number(e.target.value) } })}
            className="w-full px-4 py-2.5 text-sm font-mono rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#345CFF] focus:outline-none"
          />
        </div>
      </div>

      {/* Conditional Questions per Genre */}
      {isFictionCategory(identity.category) && (
        <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200 space-y-3">
          <span className="text-2xs font-bold uppercase text-purple-900 tracking-wider">Fiction Narrative Directives</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-3xs font-semibold text-purple-800 mb-1">Narrative Point of View</label>
              <select
                value={architecture.genreSpecifics?.fiction?.narrativePOV || 'third_limited'}
                onChange={(e) =>
                  onChange({
                    architecture: {
                      ...architecture,
                      genreSpecifics: {
                        ...architecture.genreSpecifics,
                        fiction: { ...architecture.genreSpecifics?.fiction, narrativePOV: e.target.value as any },
                      },
                    },
                  })
                }
                className="w-full px-3 py-1.5 rounded border border-purple-200 bg-white text-xs"
              >
                <option value="first_person">First Person ("I")</option>
                <option value="third_limited">Third Person Limited</option>
                <option value="third_omniscient">Third Person Omniscient</option>
              </select>
            </div>
            <div>
              <label className="block text-3xs font-semibold text-purple-800 mb-1">Central Conflict / Premise</label>
              <input
                type="text"
                placeholder="e.g. Rival tech factions competing for Quantum Core"
                value={architecture.genreSpecifics?.fiction?.premise || ''}
                onChange={(e) =>
                  onChange({
                    architecture: {
                      ...architecture,
                      genreSpecifics: {
                        ...architecture.genreSpecifics,
                        fiction: { ...architecture.genreSpecifics?.fiction, premise: e.target.value },
                      },
                    },
                  })
                }
                className="w-full px-3 py-1.5 rounded border border-purple-200 bg-white text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {isBusinessCategory(identity.category) && (
        <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2">
          <span className="text-2xs font-bold uppercase text-emerald-900 tracking-wider">Business & Case Study Frameworks</span>
          <div className="flex items-center gap-3 text-xs text-emerald-900 font-medium">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={architecture.genreSpecifics?.business?.actionFrameworks ?? true}
                onChange={(e) =>
                  onChange({
                    architecture: {
                      ...architecture,
                      genreSpecifics: {
                        ...architecture.genreSpecifics,
                        business: { ...architecture.genreSpecifics?.business, actionFrameworks: e.target.checked },
                      },
                    },
                  })
                }
                className="rounded text-[#16836D]"
              />
              <span>Include Actionable Executive Summary Callouts & Key KPI Diagrams</span>
            </label>
          </div>
        </div>
      )}

      {isTechnicalCategory(identity.category) && (
        <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-2">
          <span className="text-2xs font-bold uppercase text-blue-900 tracking-wider">Technical & Code Directives</span>
          <div className="flex items-center gap-3 text-xs text-blue-900 font-medium">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={architecture.genreSpecifics?.technical?.systemDiagrams ?? true}
                onChange={(e) =>
                  onChange({
                    architecture: {
                      ...architecture,
                      genreSpecifics: {
                        ...architecture.genreSpecifics,
                        technical: { ...architecture.genreSpecifics?.technical, systemDiagrams: e.target.checked },
                      },
                    },
                  })
                }
                className="rounded text-[#345CFF]"
              />
              <span>Include Vector System Architecture & Flowchart Diagrams in E3</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
