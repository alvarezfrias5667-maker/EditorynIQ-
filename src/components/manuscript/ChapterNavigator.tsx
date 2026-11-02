import React from 'react';
import { ManuscriptChapter } from '../../domain/manuscript/manuscriptTypes';

export interface ChapterNavigatorProps {
  chapters: ManuscriptChapter[];
  selectedChapterId: string;
  onSelectChapter: (chapterId: string) => void;
}

export const ChapterNavigator: React.FC<ChapterNavigatorProps> = ({ chapters, selectedChapterId, onSelectChapter }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 space-y-3 shadow-2xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#081629]">
          Book Chapters Navigator
        </h4>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
          {chapters.length} Chaps
        </span>
      </div>

      <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
        {chapters.map((ch) => {
          const isSelected = ch.id === selectedChapterId;
          return (
            <button
              key={ch.id}
              type="button"
              onClick={() => onSelectChapter(ch.id)}
              className={`w-full text-left p-3 rounded-xl border transition-all ${
                isSelected
                  ? 'bg-[#345CFF]/10 border-[#345CFF] shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className={`text-xs font-bold line-clamp-1 ${isSelected ? 'text-[#345CFF]' : 'text-[#101828]'}`}>
                  {ch.title}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono shrink-0">
                  {ch.wordCount} w
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>Est. {ch.estimatedPages} pgs</span>
                <span className="capitalize text-[10px] text-slate-400">{ch.status.replace('_', ' ')}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
