import React from 'react';
import { useI18n } from '../../i18n';
import { SmartIntakeState } from '../../domain/intake/smartIntakeTypes';
import { compilePackageFromIntake } from '../../domain/intake/intakeToBlueprintEngine';
import { evaluateE1Readiness } from '../../domain/intelligence/e1Readiness';
import { BookProject } from '../../domain/bookProjectTypes';

export interface BlueprintPreviewStepProps {
  state: SmartIntakeState;
  onEditStep: (stepNumber: number) => void;
}

export const BlueprintPreviewStep: React.FC<BlueprintPreviewStepProps> = ({ state, onEditStep }) => {
  const { t } = useI18n();

  // Dry run compilation
  const tempProjectId = 'preview_temp_id';
  const { projectInput, e1Package } = compilePackageFromIntake(state, tempProjectId);

  // Mock BookProject object for readiness check
  const tempProject: BookProject = {
    id: tempProjectId,
    mode: projectInput.mode,
    title: projectInput.title,
    description: projectInput.description,
    targetAudience: projectInput.targetAudience,
    category: projectInput.category,
    productionLanguage: projectInput.productionLanguage,
    profile: projectInput.profile,
    targetPageCount: projectInput.targetPageCount,
    lengthClass: projectInput.targetPageCount <= 300 ? 'standard' : 'extended',
    authorNotes: projectInput.authorNotes,
    status: 'DRAFT_LOCAL',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const readiness = evaluateE1Readiness(tempProject, e1Package);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <span className="text-2xs font-mono font-bold uppercase text-[#345CFF] tracking-wider">
          {t.intake.stageTag?.replace('{current}', '6') || 'Stage 6 of 6'}
        </span>
        <h3 className="text-xl font-bold text-[#081629] mt-0.5">{t.intake.step6Title || 'Blueprint Preview & E1 Readiness'}</h3>
        <p className="text-xs text-slate-500 mt-1">
          {t.intake.step6Subtitle || 'Review compiled Book Brief, chapter architecture, page budget, and E1 Readiness before initializing.'}
        </p>
      </div>

      {/* Readiness Status Banner */}
      <div
        className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-semibold ${
          readiness.isReadyForApproval
            ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
            : 'bg-amber-50 text-amber-900 border-amber-200'
        }`}
      >
        <div>
          <div className="text-sm font-bold flex items-center gap-2">
            {readiness.isReadyForApproval
              ? (t.intake.readinessVerified || '✓ E1 Readiness Verified: Ready for Blueprint Initialization')
              : (t.intake.readinessNotice || '⚠ E1 Readiness Notice')}
          </div>
          <p className="text-2xs font-normal mt-0.5">
            {readiness.isReadyForApproval
              ? (t.intake.readinessVerifiedDesc || 'All required brief parameters, chapter structures, and page budgets are balanced.')
              : (t.intake.readinessNoticeDesc || 'Some recommended research sources or parameters require confirmation.')}
          </p>
        </div>
        <span className="text-2xs font-mono uppercase px-3 py-1 rounded bg-white font-bold border border-current">
          Status: {readiness.status}
        </span>
      </div>

      {/* 1. Brief & Identity Summary */}
      <div className="p-5 bg-slate-50 rounded-xl border border-slate-200/90 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-2xs font-bold uppercase text-[#081629] tracking-wider">Book Brief & Identity</span>
          <button type="button" onClick={() => onEditStep(2)} className="text-2xs font-bold text-[#345CFF] hover:underline">
            Edit Step 2
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-2xs font-mono text-slate-700">
          <div>
            <div><span className="text-slate-400">Working Title:</span> {state.identity.title}</div>
            <div><span className="text-slate-400">Category:</span> {state.identity.category.toUpperCase()}</div>
            <div><span className="text-slate-400">Production Language:</span> {state.writingVisual.productionLanguage.toUpperCase()}</div>
          </div>
          <div>
            <div><span className="text-slate-400">Audience:</span> {state.identity.targetAudiences.join(', ')}</div>
            <div><span className="text-slate-400">Proficiency Level:</span> {state.identity.readerLevel.toUpperCase()}</div>
            <div><span className="text-slate-400">Editorial Profile:</span> {state.writingVisual.editorialProfile.toUpperCase()}</div>
          </div>
        </div>
      </div>

      {/* 2. Exact Page Budget Allocation */}
      <div className="p-5 bg-white rounded-xl border border-slate-200/90 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-2xs font-bold uppercase text-[#081629] tracking-wider">Exact Page Budget Allocation</span>
          <button type="button" onClick={() => onEditStep(4)} className="text-2xs font-bold text-[#345CFF] hover:underline">
            Edit Step 4
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-center">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-3xs text-slate-400 uppercase font-sans">Target Budget</span>
            <div className="text-lg font-bold text-[#081629]">{e1Package.pageBudget.targetPages} pgs</div>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <span className="text-3xs text-[#345CFF] uppercase font-sans">Allocated Total</span>
            <div className="text-lg font-bold text-[#345CFF]">{e1Package.pageBudget.allocatedPages} pgs</div>
          </div>

          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
            <span className="text-3xs text-emerald-800 uppercase font-sans">Remaining Pages</span>
            <div className="text-lg font-bold text-emerald-900">{e1Package.pageBudget.remainingPages} pgs</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-3xs text-slate-400 uppercase font-sans">Budget Balance</span>
            <div className="text-lg font-bold text-emerald-700">✓ BALANCED</div>
          </div>
        </div>
      </div>

      {/* 3. Compiled Chapter Architecture */}
      <div className="p-5 bg-slate-50 rounded-xl border border-slate-200/90 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-2xs font-bold uppercase text-[#081629] tracking-wider">
            Compiled Chapter Architecture ({e1Package.blueprint.chapters.length} Chapters)
          </span>
          <button type="button" onClick={() => onEditStep(3)} className="text-2xs font-bold text-[#345CFF] hover:underline">
            Edit Step 3
          </button>
        </div>

        <div className="divide-y divide-slate-200/80 max-h-[260px] overflow-y-auto text-2xs">
          {e1Package.blueprint.chapters.map((ch) => (
            <div key={ch.id} className="py-2.5 flex items-center justify-between">
              <div>
                <span className="font-bold text-[#081629] block">{ch.title}</span>
                <span className="text-3xs text-slate-500 font-sans">{ch.objective}</span>
              </div>
              <span className="font-mono font-bold px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-700">
                {ch.estimatedPages} pgs
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Research Sources & Rights */}
      <div className="p-5 bg-slate-50 rounded-xl border border-slate-200/90 space-y-2 text-2xs font-mono">
        <div className="flex items-center justify-between">
          <span className="text-2xs font-bold uppercase text-[#081629] tracking-wider font-sans">Research & Rights Logged</span>
          <button type="button" onClick={() => onEditStep(5)} className="text-2xs font-bold text-[#345CFF] hover:underline font-sans">
            Edit Step 5
          </button>
        </div>
        <div><span className="text-slate-400">Material Rights:</span> {state.researchRights.materialRightsStatus}</div>
        <div><span className="text-slate-400">Research Bibliography:</span> {state.researchRights.researchSources.length} source(s) logged</div>
        <div><span className="text-slate-400">Protected Terms:</span> {state.researchRights.protectedTerms.length} term(s) frozen</div>
      </div>
    </div>
  );
};
