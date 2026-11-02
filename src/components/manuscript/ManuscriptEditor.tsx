import React, { useState, useEffect } from 'react';
import { ManuscriptChapter } from '../../domain/manuscript/manuscriptTypes';
import { calculateTextStats } from '../../domain/manuscript/manuscriptEngine';
import { PremiumButton } from '../ui/PremiumButton';

export interface ManuscriptEditorProps {
  chapter: ManuscriptChapter;
  onSaveContent: (newContent: string, authorNote?: string) => Promise<boolean>;
  onOpenHistory: () => void;
}

export const ManuscriptEditor: React.FC<ManuscriptEditorProps> = ({ chapter, onSaveContent, onOpenHistory }) => {
  const [content, setContent] = useState(chapter.currentContent || '');
  const [authorNote, setAuthorNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatusMsg, setSaveStatusMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setContent(chapter.currentContent || '');
  }, [chapter.id, chapter.currentContent]);

  const stats = calculateTextStats(content);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatusMsg('');
    const success = await onSaveContent(content, authorNote);
    setIsSaving(false);

    if (success) {
      setSaveStatusMsg('✓ Manuscript chapter saved to IndexedDB.');
      setAuthorNote('');
      setTimeout(() => setSaveStatusMsg(''), 3000);
    } else {
      setSaveStatusMsg('⚠ Storage Error: Failed to save to local storage.');
    }
  };

  const matches = searchQuery.trim() ? (content.toLowerCase().match(new RegExp(searchQuery.toLowerCase(), 'g')) || []).length : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-2xs">
      {/* Chapter Title & Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#345CFF]">
            Chapter {chapter.order}
          </span>
          <h3 className="text-xl font-bold text-[#101828]">{chapter.title}</h3>
          <p className="text-xs text-slate-500 mt-1">{chapter.objective}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenHistory}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200"
          >
            🕒 History ({chapter.versions?.length || 0} ver)
          </button>

          <PremiumButton variant="primary" size="md" disabled={isSaving} onClick={handleSave}>
            {isSaving ? 'Saving...' : 'Save Draft'}
          </PremiumButton>
        </div>
      </div>

      {saveStatusMsg && (
        <div className={`p-3 rounded-xl text-xs font-semibold ${saveStatusMsg.startsWith('✓') ? 'bg-[#16836D]/10 text-[#16836D]' : 'bg-[#D14343]/10 text-[#D14343]'}`}>
          {saveStatusMsg}
        </div>
      )}

      {/* Realtime Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
        <div>
          <span className="text-slate-400 block">Words:</span>
          <span className="font-extrabold font-mono text-sm text-[#081629]">{stats.wordCount.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-slate-400 block">Characters:</span>
          <span className="font-extrabold font-mono text-sm text-[#081629]">{stats.charCount.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-slate-400 block">Est. Pages:</span>
          <span className="font-extrabold font-mono text-sm text-[#345CFF]">{stats.estimatedPages} pgs</span>
        </div>
        <div>
          <span className="text-slate-400 block">Planned Target:</span>
          <span className="font-extrabold font-mono text-sm text-slate-700">{chapter.plannedPages} pgs</span>
        </div>
      </div>

      {/* Text Search in Chapter */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Search text in chapter..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-3 py-1.5 text-xs rounded border border-slate-300 w-full sm:w-64"
        />
        {searchQuery.trim() && (
          <span className="text-xs font-bold text-[#345CFF]">
            {matches} match(es) found
          </span>
        )}
      </div>

      {/* Main Prose Editor Area */}
      <div className="space-y-2">
        <textarea
          rows={16}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type or paste your chapter manuscript prose here..."
          className="w-full p-5 text-sm sm:text-base font-serif leading-relaxed text-[#101828] bg-slate-50/40 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#345CFF] focus:outline-none"
        />
      </div>

      {/* Revision Note */}
      <div className="space-y-1 pt-2">
        <label className="text-xs font-bold text-slate-600 block">Author Revision Note (Optional)</label>
        <input
          type="text"
          placeholder="e.g. Added section on quantum cryptography..."
          value={authorNote}
          onChange={(e) => setAuthorNote(e.target.value)}
          className="w-full px-3 py-1.5 text-xs rounded border border-slate-300"
        />
      </div>
    </div>
  );
};
