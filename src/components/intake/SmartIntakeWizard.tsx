import React, { useState, useEffect } from 'react';
import { useI18n } from '../../i18n';
import {
  SmartIntakeState,
  getDefaultIntakeState,
  BookOriginType,
} from '../../domain/intake/smartIntakeTypes';
import { validateStep } from '../../domain/intake/conditionalQuestionEngine';
import { compilePackageFromIntake } from '../../domain/intake/intakeToBlueprintEngine';
import { localBookRepository } from '../../services/localBookRepository';
import { localBookIntelligenceRepository } from '../../services/localBookIntelligenceRepository';

import { BookOriginStep } from './BookOriginStep';
import { BookIdentityStep } from './BookIdentityStep';
import { ContentArchitectureStep } from './ContentArchitectureStep';
import { WritingVisualStep } from './WritingVisualStep';
import { ResearchRightsStep } from './ResearchRightsStep';
import { BlueprintPreviewStep } from './BlueprintPreviewStep';
import { PremiumButton } from '../ui/PremiumButton';

const DRAFT_STORAGE_KEY = 'editoryniq_intake_wizard_draft';

export interface SmartIntakeWizardProps {
  initialOrigin?: BookOriginType;
  onNavigate: (path: string) => void;
}

export const SmartIntakeWizard: React.FC<SmartIntakeWizardProps> = ({ initialOrigin = 'idea', onNavigate }) => {
  const { t } = useI18n();

  const [state, setState] = useState<SmartIntakeState>(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.identity) return parsed;
      }
    } catch {
      // Ignore
    }
    return getDefaultIntakeState(initialOrigin);
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftSavedNotice, setDraftSavedNotice] = useState('');

  // Auto save draft to local storage on state change
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage error
    }
  }, [state]);

  const updateState = (updated: Partial<SmartIntakeState>) => {
    setState((prev) => ({
      ...prev,
      ...updated,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleNextStep = () => {
    const { isValid, errors } = validateStep(state.currentStep, state);
    if (!isValid) {
      setValidationErrors(errors);
      window.scrollTo({ top: 250, behavior: 'smooth' });
      return;
    }
    setValidationErrors({});
    if (state.currentStep < 6) {
      updateState({ currentStep: state.currentStep + 1 });
      window.scrollTo({ top: 250, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setValidationErrors({});
    if (state.currentStep > 1) {
      updateState({ currentStep: state.currentStep - 1 });
      window.scrollTo({ top: 250, behavior: 'smooth' });
    }
  };

  const handleSaveDraft = () => {
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(state));
      setDraftSavedNotice('Intake draft saved locally to IndexedDB/LocalStorage.');
      setTimeout(() => setDraftSavedNotice(''), 3000);
    } catch {
      setDraftSavedNotice('Draft save error.');
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setValidationErrors({});

    try {
      // Generate unique book ID
      const projectId = `book_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

      // Compile package and project input
      const { projectInput, e1Package } = compilePackageFromIntake(state, projectId);

      // Save Project
      const savedProject = await localBookRepository.saveProject(projectInput, projectId);

      // Save E1 Book Intelligence Package
      await localBookIntelligenceRepository.saveE1Package(e1Package);

      // Clear draft storage
      localStorage.removeItem(DRAFT_STORAGE_KEY);

      // Navigate to Studio Workspace for project
      setTimeout(() => {
        onNavigate(`/studio/${savedProject.id}`);
      }, 500);
    } catch (err: any) {
      console.error('Error in final intake submission:', err);
      setValidationErrors({ general: err?.message || 'Failed to save project package to local browser repository.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsList = [
    { num: 1, name: '1. Origin' },
    { num: 2, name: '2. Identity' },
    { num: 3, name: '3. Architecture' },
    { num: 4, name: '4. Directives' },
    { num: 5, name: '5. Rights' },
    { num: 6, name: '6. Blueprint' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
      {/* Step Progress Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-2xs font-mono font-bold uppercase text-[#345CFF]">
            Smart Intake V2 · Step {state.currentStep} of 6
          </span>
          <button
            type="button"
            onClick={handleSaveDraft}
            className="text-2xs font-semibold text-slate-500 hover:text-slate-900"
          >
            💾 Save Draft
          </button>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-[#345CFF] h-2 transition-all duration-300 rounded-full"
            style={{ width: `${(state.currentStep / 6) * 100}%` }}
          />
        </div>

        {/* Step Badges Grid (Desktop / Tablet) */}
        <div className="hidden sm:grid grid-cols-6 gap-2">
          {stepsList.map((st) => {
            const isCurrent = state.currentStep === st.num;
            const isCompleted = state.currentStep > st.num;
            return (
              <button
                key={st.num}
                type="button"
                onClick={() => {
                  if (st.num < state.currentStep) updateState({ currentStep: st.num });
                }}
                className={`py-1.5 px-2 text-3xs font-mono font-bold rounded-lg transition-all text-center border ${
                  isCurrent
                    ? 'bg-[#345CFF] text-white border-[#345CFF] shadow-2xs'
                    : isCompleted
                    ? 'bg-blue-50 text-[#345CFF] border-blue-200'
                    : 'bg-slate-50 text-slate-400 border-slate-200'
                }`}
              >
                {st.name}
              </button>
            );
          })}
        </div>
      </div>

      {draftSavedNotice && (
        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-2xs font-semibold text-center">
          ✓ {draftSavedNotice}
        </div>
      )}

      {validationErrors.general && (
        <div className="p-4 rounded-xl bg-red-50 text-[#D14343] border border-red-200 text-xs font-semibold">
          ⚠ {validationErrors.general}
        </div>
      )}

      {/* Wizard Form Stage Body */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 sm:p-10 space-y-8">
        {state.currentStep === 1 && <BookOriginStep state={state} onChange={updateState} />}
        {state.currentStep === 2 && <BookIdentityStep state={state} onChange={updateState} errors={validationErrors} />}
        {state.currentStep === 3 && <ContentArchitectureStep state={state} onChange={updateState} errors={validationErrors} />}
        {state.currentStep === 4 && <WritingVisualStep state={state} onChange={updateState} errors={validationErrors} />}
        {state.currentStep === 5 && <ResearchRightsStep state={state} onChange={updateState} errors={validationErrors} />}
        {state.currentStep === 6 && <BlueprintPreviewStep state={state} onEditStep={(s) => updateState({ currentStep: s })} />}

        {/* Wizard Controls */}
        <div className="pt-6 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {state.currentStep > 1 ? (
            <PremiumButton variant="outline" size="sm" onClick={handlePrevStep} className="w-full sm:w-auto">
              {t.intake.prevStep || '← Previous Step'}
            </PremiumButton>
          ) : (
            <button
              type="button"
              onClick={() => onNavigate('/studio')}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 py-2 text-center"
            >
              {t.intake.cancelIntake || 'Cancel Intake'}
            </button>
          )}

          {state.currentStep < 6 ? (
            <PremiumButton variant="primary" size="md" onClick={handleNextStep} className="w-full sm:w-auto">
              {t.intake.nextStep || 'Next Step →'}
            </PremiumButton>
          ) : (
            <PremiumButton
              variant="gold"
              size="lg"
              disabled={isSubmitting}
              onClick={handleFinalSubmit}
              className="w-full sm:w-auto"
              icon={
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              }
            >
              {isSubmitting ? (t.intake.initializing || 'Creating Project & Blueprint...') : (t.intake.initializeBtn || 'Initialize Project & Prepare Blueprint')}
            </PremiumButton>
          )}
        </div>
      </div>
    </div>
  );
};
