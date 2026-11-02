import React, { useState } from 'react';
import { manuscriptAIAdapter, AIGenerationRequest } from '../../services/manuscriptAIAdapter';
import { PremiumButton } from '../ui/PremiumButton';
import { useI18n } from '../../i18n';
import { Sparkles, Check, X, Edit3, AlertTriangle } from 'lucide-react';

export interface WritingControlsProps {
  chapterTitle: string;
  currentText: string;
  language: 'en' | 'es';
  onAppendText: (generated: string) => void;
  onReplaceText: (generated: string) => void;
}

interface PendingDraft {
  action: AIGenerationRequest['action'];
  text: string;
}

export const WritingControls: React.FC<WritingControlsProps> = ({
  chapterTitle,
  currentText,
  language,
  onAppendText,
  onReplaceText,
}) => {
  const { lang } = useI18n();
  const [instructions, setInstructions] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [providerNotice, setProviderNotice] = useState<string | null>(null);
  const [pendingDraft, setPendingDraft] = useState<PendingDraft | null>(null);

  const handleAction = async (action: AIGenerationRequest['action']) => {
    setIsGenerating(true);
    setProviderNotice(null);
    setPendingDraft(null);

    const req: AIGenerationRequest = {
      action,
      chapterTitle,
      currentText,
      instructions,
      language,
    };

    const res = await manuscriptAIAdapter.generateManuscriptProse(req);
    setIsGenerating(false);

    if (!res.configured || res.status === 'AI_PROVIDER_NOT_CONFIGURED') {
      setProviderNotice(
        lang === 'es'
          ? 'AI_PROVIDER_NOT_CONFIGURED: La clave GEMINI_API_KEY no está configurada en los secretos del servidor. Modo de escritura manual activo.'
          : lang === 'fr'
          ? 'AI_PROVIDER_NOT_CONFIGURED: Clé GEMINI_API_KEY non configurée dans les secrets du serveur. Mode écriture manuelle actif.'
          : 'AI_PROVIDER_NOT_CONFIGURED: Server GEMINI_API_KEY is not configured in secrets. Manual author writing mode active.'
      );
      return;
    }

    if (res.status === 'AI_ACCESS_DISABLED') {
      setProviderNotice(
        lang === 'es'
          ? 'AI_ACCESS_DISABLED: La ejecución de IA está deshabilitada por políticas del servidor. Modo de escritura manual activo.'
          : lang === 'fr'
          ? 'AI_ACCESS_DISABLED: L\'exécution IA est désactivée par la politique du serveur. Mode écriture manuelle actif.'
          : 'AI_ACCESS_DISABLED: AI execution is disabled by server security policy. Manual author writing mode active.'
      );
      return;
    }

    if (res.success && res.generatedText) {
      setPendingDraft({
        action,
        text: res.generatedText,
      });
      setInstructions('');
    } else {
      setProviderNotice(res.message || (lang === 'es' ? 'Fallo en la generación por IA.' : 'AI generation failed.'));
    }
  };

  const handleAcceptDraft = () => {
    if (!pendingDraft) return;
    if (pendingDraft.action === 'continue' || pendingDraft.action === 'expand') {
      onAppendText('\n\n' + pendingDraft.text);
    } else {
      onReplaceText(pendingDraft.text);
    }
    setPendingDraft(null);
  };

  const handleDiscardDraft = () => {
    setPendingDraft(null);
  };

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-4 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#345CFF]" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#345CFF]" />
            AI Manuscript Writer™
          </h4>
        </div>
        <span className="text-[11px] font-mono text-slate-400">Model: Gemini 3.8 Flash (Server Proxy)</span>
      </div>

      {providerNotice && (
        <div className="p-3 rounded-xl bg-amber-500/10 text-amber-200 border border-amber-500/30 text-xs flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">{providerNotice}</div>
        </div>
      )}

      <div className="space-y-2">
        <input
          type="text"
          placeholder={
            lang === 'es'
              ? 'Instrucciones o guías conceptuales para el asistente IA (ej. Expandir argumento sobre entropía cuántica)...'
              : lang === 'fr'
              ? 'Instructions ou directives pour l\'assistant IA (ex. Développer l\'argument sur l\'entropie quantique)...'
              : 'Instructions or topic guidelines for AI assistant (e.g. Expand argument on quantum entropy)...'
          }
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-800/90 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#345CFF]"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <PremiumButton
          variant="primary"
          size="sm"
          disabled={isGenerating}
          onClick={() => handleAction('continue')}
        >
          {isGenerating
            ? lang === 'es'
              ? 'Redactando...'
              : lang === 'fr'
              ? 'Rédaction...'
              : 'Writing...'
            : lang === 'es'
            ? '✍ Continuar Prosa'
            : lang === 'fr'
            ? '✍ Continuer le Texte'
            : '✍ Continue Prose'}
        </PremiumButton>

        <PremiumButton
          variant="secondary"
          size="sm"
          disabled={isGenerating || !currentText.trim()}
          onClick={() => handleAction('rewrite')}
        >
          {lang === 'es' ? '✨ Reescribir y Pulir' : lang === 'fr' ? '✨ Réécrire et Polir' : '✨ Rewrite & Refine'}
        </PremiumButton>

        <PremiumButton
          variant="outline"
          size="sm"
          disabled={isGenerating || !currentText.trim()}
          onClick={() => handleAction('expand')}
        >
          {lang === 'es' ? '🔍 Profundizar' : lang === 'fr' ? '🔍 Approfondir' : '🔍 Expand Depth'}
        </PremiumButton>

        <PremiumButton
          variant="gold"
          size="sm"
          disabled={isGenerating || !currentText.trim()}
          onClick={() => handleAction('summarize')}
        >
          {lang === 'es' ? '📝 Resumir Contexto' : lang === 'fr' ? '📝 Résumer' : '📝 Summarize Context'}
        </PremiumButton>
      </div>

      {/* Reviewable Draft Box (Requires Express Author Acceptance Before Saving) */}
      {pendingDraft && (
        <div className="mt-4 p-4 rounded-2xl bg-slate-800/90 border border-blue-500/40 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-700 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5" />
              {lang === 'es'
                ? 'Borrador Generado por IA — Revisión del Autor'
                : lang === 'fr'
                ? 'Brouillon Généré par l\'IA — Examen de l\'Auteur'
                : 'AI Generated Draft — Author Review'}
            </span>
            <span className="text-[10px] font-mono text-slate-400 uppercase">
              Action: {pendingDraft.action}
            </span>
          </div>

          <textarea
            value={pendingDraft.text}
            onChange={(e) => setPendingDraft({ ...pendingDraft, text: e.target.value })}
            rows={6}
            className="w-full p-3 text-xs font-sans rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed resize-y"
          />

          <div className="flex items-center justify-between gap-3 pt-1">
            <p className="text-[11px] text-slate-400 italic">
              {lang === 'es'
                ? '* El borrador no se guardará en el capítulo hasta que hagas clic en Aceptar.'
                : lang === 'fr'
                ? '* Le brouillon ne sera pas enregistré dans le chapitre tant que vous ne cliquez pas sur Accepter.'
                : '* Draft will not be saved to chapter until you explicitly click Accept.'}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDiscardDraft}
                className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                {lang === 'es' ? 'Descartar' : lang === 'fr' ? 'Ignorer' : 'Discard'}
              </button>

              <button
                type="button"
                onClick={handleAcceptDraft}
                className="px-4 py-1.5 text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 rounded-lg shadow-xs transition-colors flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                {lang === 'es' ? 'Aceptar y Guardar en Capítulo' : lang === 'fr' ? 'Accepter et Enregistrer' : 'Accept & Apply Draft'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
