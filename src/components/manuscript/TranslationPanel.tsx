import React, { useState } from 'react';
import { ManuscriptChapter, TranslationDraft } from '../../domain/manuscript/manuscriptTypes';
import { manuscriptAIAdapter } from '../../services/manuscriptAIAdapter';
import { Languages, Sparkles, AlertCircle, Save, CheckCircle2, Copy } from 'lucide-react';
import { useI18n } from '../../i18n';

interface TranslationPanelProps {
  chapters: ManuscriptChapter[];
  translations?: TranslationDraft[];
  selectedChapterId: string | null;
  onSelectChapter: (id: string) => void;
  onSaveTranslation: (chapterId: string, translatedText: string, language: 'es' | 'en') => void;
}

export const TranslationPanel: React.FC<TranslationPanelProps> = ({
  chapters,
  translations = [],
  selectedChapterId,
  onSelectChapter,
  onSaveTranslation,
}) => {
  const { lang } = useI18n();
  const currentChapter = chapters.find((c) => c.id === selectedChapterId) || chapters[0];

  const [sourceLang, setSourceLang] = useState<'en' | 'es'>('es');
  const [targetLang, setTargetLang] = useState<'en' | 'es'>('en');

  const existingTranslation = translations.find(
    (t) => t.chapterId === currentChapter?.id && t.targetLang === targetLang
  );

  const [translatedContent, setTranslatedContent] = useState<string>(
    existingTranslation?.translatedText || ''
  );
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [notice, setNotice] = useState<{ type: 'info' | 'error' | 'success'; message: string } | null>(null);

  const handleChapterChange = (chapterId: string) => {
    onSelectChapter(chapterId);
    const chapter = chapters.find((c) => c.id === chapterId);
    if (chapter) {
      const match = translations.find((t) => t.chapterId === chapter.id && t.targetLang === targetLang);
      setTranslatedContent(match?.translatedText || '');
    }
  };

  const handleSwapLanguages = () => {
    const prevSource = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(prevSource);
    if (currentChapter) {
      const match = translations.find((t) => t.chapterId === currentChapter.id && t.targetLang === prevSource);
      setTranslatedContent(match?.translatedText || '');
    }
  };

  const handleTriggerAITranslation = async () => {
    if (!currentChapter || !currentChapter.currentContent.trim()) {
      setNotice({
        type: 'error',
        message: lang === 'es' ? 'El capítulo no contiene texto para traducir.' : 'The chapter contains no text to translate.',
      });
      return;
    }

    setIsTranslating(true);
    setNotice(null);

    try {
      const result = await manuscriptAIAdapter.translateProse({
        text: currentChapter.currentContent,
        sourceLang,
        targetLang,
      });

      if (result.status === 'SUCCESS' && result.translatedText) {
        setTranslatedContent(result.translatedText);
        setNotice({
          type: 'success',
          message:
            lang === 'es'
              ? 'Borrador de traducción generado con éxito por Gemini.'
              : 'Translation draft generated successfully by Gemini.',
        });
      } else if (result.status === 'AI_PROVIDER_NOT_CONFIGURED') {
        setNotice({
          type: 'info',
          message:
            lang === 'es'
              ? 'GEMINI_API_KEY no configurada. Puedes escribir o pegar la traducción manualmente.'
              : 'GEMINI_API_KEY not configured. You can edit or paste translation manually.',
        });
      } else {
        setNotice({
          type: 'error',
          message: result.message || (lang === 'es' ? 'Error al solicitar la traducción.' : 'Failed to request translation.'),
        });
      }
    } catch (err: any) {
      setNotice({
        type: 'error',
        message: err.message || 'Error de conexión con el motor de traducción.',
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSave = () => {
    if (!currentChapter) return;
    onSaveTranslation(currentChapter.id, translatedContent, targetLang);
    setNotice({
      type: 'success',
      message: lang === 'es' ? 'Traducción guardada en el proyecto.' : 'Translation saved to project.',
    });
    setTimeout(() => setNotice(null), 3000);
  };

  const handleCopyTranslated = () => {
    navigator.clipboard.writeText(translatedContent);
    setNotice({
      type: 'success',
      message: lang === 'es' ? 'Texto traducido copiado al portapapeles.' : 'Translated text copied to clipboard.',
    });
    setTimeout(() => setNotice(null), 3000);
  };

  return (
    <div className="space-y-6">
      {notice && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
            notice.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
              : notice.type === 'info'
              ? 'bg-blue-950/60 border-blue-500/40 text-blue-300'
              : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {notice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-blue-400 shrink-0" />
            )}
            <span>{notice.message}</span>
          </div>
        </div>
      )}

      {/* Control Bar */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-4 text-white">
        {/* Chapter Select */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-300">
            {lang === 'es' ? 'Capítulo a Traducir:' : 'Chapter to Translate:'}
          </label>
          <select
            value={currentChapter?.id || ''}
            onChange={(e) => handleChapterChange(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-[#345CFF]"
          >
            {chapters.map((ch) => (
              <option key={ch.id} value={ch.id}>
                Cap. {ch.order}: {ch.title} ({ch.wordCount} {lang === 'es' ? 'palabras' : 'words'})
              </option>
            ))}
          </select>
        </div>

        {/* Language Pair Control */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono uppercase font-bold text-slate-300 px-2.5 py-1 bg-slate-950 border border-slate-700 rounded-lg">
            {sourceLang}
          </span>
          <button
            onClick={handleSwapLanguages}
            className="p-1.5 bg-slate-950 border border-slate-700 rounded-lg hover:border-[#345CFF] text-slate-300 transition-colors"
            title={lang === 'es' ? 'Invertir idiomas' : 'Swap languages'}
          >
            <Languages className="w-4 h-4 text-[#345CFF]" />
          </button>
          <span className="text-xs font-mono uppercase font-bold text-slate-300 px-2.5 py-1 bg-slate-950 border border-slate-700 rounded-lg">
            {targetLang}
          </span>

          <button
            onClick={handleTriggerAITranslation}
            disabled={isTranslating}
            className="ml-2 px-4 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-md"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>
              {isTranslating
                ? lang === 'es'
                  ? 'Traduciendo...'
                  : 'Translating...'
                : lang === 'es'
                ? 'Traducir con Gemini'
                : 'Translate with Gemini'}
            </span>
          </button>
        </div>
      </div>

      {/* Side by side editor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Text Side */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 flex flex-col h-[550px] text-white">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              {lang === 'es' ? 'Texto Original' : 'Original Text'} ({sourceLang.toUpperCase()})
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">
              {currentChapter?.wordCount || 0} {lang === 'es' ? 'palabras' : 'words'}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 text-xs text-slate-300 font-serif leading-relaxed whitespace-pre-wrap">
            {currentChapter?.currentContent || (
              <span className="text-slate-500 italic">
                {lang === 'es' ? 'No hay texto redactado en este capítulo.' : 'No text written in this chapter yet.'}
              </span>
            )}
          </div>
        </div>

        {/* Target Translation Side */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 flex flex-col h-[550px] text-white">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400"></span>
              {lang === 'es' ? 'Traducción Editorial' : 'Editorial Translation'} ({targetLang.toUpperCase()})
            </h4>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyTranslated}
                disabled={!translatedContent}
                className="p-1 text-slate-400 hover:text-slate-200 disabled:opacity-30 transition-colors"
                title={lang === 'es' ? 'Copiar traducción' : 'Copy translation'}
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleSave}
                disabled={!translatedContent}
                className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1 disabled:opacity-40"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{lang === 'es' ? 'Guardar' : 'Save'}</span>
              </button>
            </div>
          </div>

          <textarea
            value={translatedContent}
            onChange={(e) => setTranslatedContent(e.target.value)}
            placeholder={
              lang === 'es'
                ? 'Escribe o ajusta la traducción editorial aquí...'
                : 'Write or adjust the editorial translation here...'
            }
            className="flex-1 w-full bg-slate-950 border border-slate-800 focus:border-[#345CFF] rounded-xl p-4 text-xs text-slate-200 font-serif leading-relaxed focus:outline-none resize-none"
          />
        </div>
      </div>
    </div>
  );
};
