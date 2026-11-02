import React, { useState } from 'react';
import { BookBlueprint, BlueprintChapter, BlueprintSection } from '../../domain/intelligence/bookIntelligenceTypes';
import { reorderChapters } from '../../domain/intelligence/blueprintEngine';
import { PremiumButton } from '../ui/PremiumButton';

export interface ChapterStructurePanelProps {
  blueprint: BookBlueprint;
  onUpdateBlueprint: (blueprint: BookBlueprint) => void;
}

export const ChapterStructurePanel: React.FC<ChapterStructurePanelProps> = ({ blueprint, onUpdateBlueprint }) => {
  const [editingChapter, setEditingChapter] = useState<BlueprintChapter | null>(null);
  const [addingSectionChapterId, setAddingSectionChapterId] = useState<string | null>(null);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionPages, setNewSectionPages] = useState(10);

  const handleAddChapter = () => {
    const newOrder = blueprint.chapters.length + 1;
    const newChap: BlueprintChapter = {
      id: `chap_${Date.now()}`,
      order: newOrder,
      title: `Chapter ${newOrder}: New Chapter`,
      objective: 'Define main objective for this chapter.',
      estimatedPages: 25,
      sections: [],
      linkedSourceIds: [],
      dependencies: [],
    };
    const updatedChapters = [...blueprint.chapters, newChap];
    onUpdateBlueprint({
      ...blueprint,
      chapters: updatedChapters,
      totalChapters: updatedChapters.length,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleSaveChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChapter) return;

    const updated = blueprint.chapters.map((ch) => (ch.id === editingChapter.id ? editingChapter : ch));
    onUpdateBlueprint({
      ...blueprint,
      chapters: updated,
      updatedAt: new Date().toISOString(),
    });
    setEditingChapter(null);
  };

  const handleDeleteChapter = (id: string) => {
    if (window.confirm('Are you sure you want to delete this chapter?')) {
      const updated = blueprint.chapters.filter((ch) => ch.id !== id).map((ch, idx) => ({ ...ch, order: idx + 1 }));
      onUpdateBlueprint({
        ...blueprint,
        chapters: updated,
        totalChapters: updated.length,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  const handleMoveChapter = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blueprint.chapters.length) return;
    const reordered = reorderChapters(blueprint.chapters, index, targetIndex);
    onUpdateBlueprint({
      ...blueprint,
      chapters: reordered,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleAddSection = (chapterId: string) => {
    if (!newSectionTitle.trim()) return;
    const newSec: BlueprintSection = {
      id: `sec_${Date.now()}`,
      title: newSectionTitle.trim(),
      objective: 'Section objective.',
      estimatedPages: Number(newSectionPages) || 5,
      linkedSourceIds: [],
    };

    const updated = blueprint.chapters.map((ch) => {
      if (ch.id === chapterId) {
        return { ...ch, sections: [...ch.sections, newSec] };
      }
      return ch;
    });

    onUpdateBlueprint({
      ...blueprint,
      chapters: updated,
      updatedAt: new Date().toISOString(),
    });

    setAddingSectionChapterId(null);
    setNewSectionTitle('');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-2xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-bold text-[#101828]">Book Blueprint Builder™</h3>
          <p className="text-xs text-slate-500 mt-1">
            Construct structural chapters, sub-sections, page allocations, and editorial dependencies.
          </p>
        </div>

        <PremiumButton variant="primary" size="sm" onClick={handleAddChapter}>
          + Add Chapter
        </PremiumButton>
      </div>

      {/* Chapter List */}
      <div className="space-y-4">
        {blueprint.chapters.map((chap, idx) => (
          <div key={chap.id} className="p-5 rounded-xl border border-slate-200 bg-slate-50/40 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#081629] text-white flex items-center justify-center font-bold text-xs">
                  {chap.order}
                </span>
                <h4 className="font-bold text-sm text-[#101828]">{chap.title}</h4>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#345CFF]/10 text-[#345CFF]">
                  {chap.estimatedPages} Pages
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => handleMoveChapter(idx, 'up')}
                  className="p-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded disabled:opacity-30"
                  title="Move Up"
                >
                  ▲
                </button>
                <button
                  type="button"
                  disabled={idx === blueprint.chapters.length - 1}
                  onClick={() => handleMoveChapter(idx, 'down')}
                  className="p-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded disabled:opacity-30"
                  title="Move Down"
                >
                  ▼
                </button>
                <button
                  type="button"
                  onClick={() => setEditingChapter(chap)}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-100"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteChapter(chap.id)}
                  className="px-2.5 py-1 text-xs font-semibold text-[#D14343] bg-red-50 border border-red-200 rounded hover:bg-red-100"
                >
                  Delete
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{chap.objective}</p>

            {/* Sections */}
            {chap.sections.length > 0 && (
              <div className="pl-4 border-l-2 border-[#345CFF]/30 space-y-2 pt-2">
                {chap.sections.map((sec) => (
                  <div key={sec.id} className="flex items-center justify-between text-xs text-slate-700 bg-white p-2 rounded border border-slate-200/80">
                    <span className="font-semibold">{sec.title}</span>
                    <span className="text-slate-500 font-mono">{sec.estimatedPages} pgs</span>
                  </div>
                ))}
              </div>
            )}

            {/* Add Section Form */}
            {addingSectionChapterId === chap.id ? (
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Section title..."
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  className="px-2 py-1 text-xs rounded border border-slate-300 flex-1"
                />
                <input
                  type="number"
                  min={1}
                  value={newSectionPages}
                  onChange={(e) => setNewSectionPages(Number(e.target.value))}
                  className="w-16 px-2 py-1 text-xs rounded border border-slate-300 font-mono"
                />
                <button
                  type="button"
                  onClick={() => handleAddSection(chap.id)}
                  className="px-2.5 py-1 text-xs font-bold bg-[#345CFF] text-white rounded"
                >
                  Save Section
                </button>
                <button
                  type="button"
                  onClick={() => setAddingSectionChapterId(null)}
                  className="px-2 py-1 text-xs text-slate-500"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAddingSectionChapterId(chap.id)}
                className="text-xs font-semibold text-[#345CFF] hover:underline pt-1 inline-block"
              >
                + Add Sub-Section
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Edit Chapter Modal */}
      {editingChapter && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <form onSubmit={handleSaveChapter} className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <h4 className="text-base font-bold text-[#101828]">Edit Chapter Parameters</h4>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Chapter Title *</label>
              <input
                type="text"
                value={editingChapter.title}
                onChange={(e) => setEditingChapter({ ...editingChapter, title: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded border border-slate-300"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Estimated Pages *</label>
              <input
                type="number"
                min={1}
                max={300}
                value={editingChapter.estimatedPages}
                onChange={(e) => setEditingChapter({ ...editingChapter, estimatedPages: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded border border-slate-300 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Chapter Objective / Scope *</label>
              <textarea
                rows={3}
                value={editingChapter.objective}
                onChange={(e) => setEditingChapter({ ...editingChapter, objective: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded border border-slate-300"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingChapter(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <PremiumButton type="submit" variant="primary" size="sm">
                Save Chapter
              </PremiumButton>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
