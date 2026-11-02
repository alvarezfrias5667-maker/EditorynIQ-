import React, { useState } from 'react';
import { useI18n } from '../../i18n';
import { EditorialEdition } from '../../domain/editorial/editorialTypes';
import { PremiumButton } from '../ui/PremiumButton';

export interface BookPreviewPanelProps {
  edition: EditorialEdition;
}

export const BookPreviewPanel: React.FC<BookPreviewPanelProps> = ({ edition }) => {
  const { t } = useI18n();
  const { chapters, typesetting } = edition;

  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [spreadMode, setSpreadMode] = useState<'spread' | 'single'>('spread');
  const [showGrid, setShowGrid] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  const activeChapter = chapters[currentChapterIndex] || chapters[0] || { title: 'Chapter 1', currentContent: 'No chapter content available.' };

  const rawText = activeChapter.currentContent || (activeChapter as any).content || 'No chapter content available.';
  const paragraphs = rawText.split('\n').filter((p: string) => Boolean(p.trim()));

  return (
    <div className="space-y-6">
      {/* Reader Controls Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        {/* Chapter Selection */}
        <div className="flex items-center gap-3">
          <label className="text-2xs font-bold text-slate-500 uppercase whitespace-nowrap">{t.editorial.jumpChapterLabel}:</label>
          <select
            value={currentChapterIndex}
            onChange={(e) => setCurrentChapterIndex(Number(e.target.value))}
            className="text-xs p-2 rounded-lg border border-slate-300 bg-white font-medium max-w-[220px] truncate"
          >
            {chapters.map((ch, idx) => (
              <option key={ch.id} value={idx}>
                Ch {idx + 1}: {ch.title}
              </option>
            ))}
          </select>
        </div>

        {/* View Toggles & Zoom */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSpreadMode(spreadMode === 'spread' ? 'single' : 'spread')}
            className={`px-3 py-1.5 text-2xs font-semibold rounded-lg border transition-colors ${
              spreadMode === 'spread' ? 'bg-[#081629] text-white border-[#081629]' : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            {spreadMode === 'spread' ? t.editorial.spreadMode : t.editorial.singlePageMode}
          </button>

          <button
            type="button"
            onClick={() => setShowGrid(!showGrid)}
            className={`px-3 py-1.5 text-2xs font-semibold rounded-lg border transition-colors ${
              showGrid ? 'bg-blue-50 text-[#345CFF] border-blue-200 font-bold' : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            {t.editorial.toggleGridOverlay}
          </button>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setZoomLevel(Math.max(75, zoomLevel - 15))}
              className="px-2 py-0.5 text-2xs font-bold text-slate-600 hover:text-slate-900"
            >
              -
            </button>
            <span className="text-2xs font-mono font-bold text-slate-700 px-1">{zoomLevel}%</span>
            <button
              type="button"
              onClick={() => setZoomLevel(Math.min(150, zoomLevel + 15))}
              className="px-2 py-0.5 text-2xs font-bold text-slate-600 hover:text-slate-900"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Realistic Book Reader Workspace */}
      <div className="bg-slate-900 rounded-2xl p-6 sm:p-10 flex items-center justify-center min-h-[500px] overflow-x-auto shadow-inner">
        <div
          className={`transition-all duration-200 flex gap-1 items-stretch ${
            spreadMode === 'spread' ? 'max-w-[900px] w-full' : 'max-w-[480px] w-full'
          }`}
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center top' }}
        >
          {/* Left Verso Page */}
          {spreadMode === 'spread' && (
            <div
              className={`bg-[#FAFAF8] text-[#111111] p-8 rounded-l-md shadow-2xl flex-1 min-h-[540px] flex flex-col justify-between relative border-r border-slate-300/60 ${
                showGrid ? 'bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:16px_16px]' : ''
              }`}
            >
              <div>
                {/* Running Header */}
                <div className="flex justify-between text-3xs font-serif text-slate-400 border-b border-slate-200 pb-2 mb-6">
                  <span>{typesetting.runningHeader.leftText || 'EDITORYNIQ'}</span>
                  <span>VERSO</span>
                </div>

                <div className="space-y-3 font-serif leading-relaxed text-xs text-justify">
                  <h3 className="text-sm font-bold text-[#081629] mb-4 text-center border-b pb-2">
                    {activeChapter.title}
                  </h3>
                  {paragraphs.slice(0, 3).map((p: string, i: number) => (
                    <p key={i} className={i === 0 && typesetting.typography.dropCaps ? 'first-letter:text-2xl first-letter:font-bold first-letter:text-[#345CFF] first-letter:mr-1' : ''}>
                      {p}
                    </p>
                  ))}
                </div>
              </div>

              {/* Running Footer */}
              <div className="text-center text-3xs font-mono text-slate-400 pt-4 border-t border-slate-200">
                - {currentChapterIndex * 2 + 1} -
              </div>
            </div>
          )}

          {/* Right Recto Page */}
          <div
            className={`bg-[#FAFAF8] text-[#111111] p-8 rounded-r-md shadow-2xl flex-1 min-h-[540px] flex flex-col justify-between relative ${
              showGrid ? 'bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:16px_16px]' : ''
            }`}
          >
            <div>
              {/* Running Header */}
              <div className="flex justify-between text-3xs font-serif text-slate-400 border-b border-slate-200 pb-2 mb-6">
                <span>RECTO</span>
                <span>{activeChapter.title}</span>
              </div>

              <div className="space-y-3 font-serif leading-relaxed text-xs text-justify">
                {paragraphs.slice(3, 7).map((p: string, i: number) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>

            {/* Running Footer */}
            <div className="text-center text-3xs font-mono text-slate-400 pt-4 border-t border-slate-200">
              - {currentChapterIndex * 2 + 2} -
            </div>
          </div>
        </div>
      </div>

      {/* Reader Navigation Footer */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 text-xs">
        <PremiumButton
          variant="outline"
          size="sm"
          disabled={currentChapterIndex === 0}
          onClick={() => setCurrentChapterIndex(Math.max(0, currentChapterIndex - 1))}
        >
          ← Previous Chapter
        </PremiumButton>

        <span className="text-2xs font-mono font-bold text-slate-500">
          Chapter {currentChapterIndex + 1} of {chapters.length}
        </span>

        <PremiumButton
          variant="outline"
          size="sm"
          disabled={currentChapterIndex === chapters.length - 1}
          onClick={() => setCurrentChapterIndex(Math.min(chapters.length - 1, currentChapterIndex + 1))}
        >
          Next Chapter →
        </PremiumButton>
      </div>
    </div>
  );
};
