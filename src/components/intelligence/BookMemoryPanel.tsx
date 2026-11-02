import React, { useState } from 'react';
import { BookMemoryEntry, MemoryEntryType } from '../../domain/intelligence/bookIntelligenceTypes';
import { createMemoryEntry, filterMemoryEntries } from '../../domain/intelligence/bookMemoryEngine';
import { PremiumButton } from '../ui/PremiumButton';

export interface BookMemoryPanelProps {
  entries: BookMemoryEntry[];
  onUpdateEntries: (entries: BookMemoryEntry[]) => void;
}

export const BookMemoryPanel: React.FC<BookMemoryPanelProps> = ({ entries, onUpdateEntries }) => {
  const [term, setTerm] = useState('');
  const [value, setValue] = useState('');
  const [type, setType] = useState<MemoryEntryType>('concept');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!term.trim() || !value.trim()) return;

    const newEntry = createMemoryEntry(type, term, value);
    onUpdateEntries([newEntry, ...entries]);
    setTerm('');
    setValue('');
  };

  const handleDelete = (id: string) => {
    onUpdateEntries(entries.filter((e) => e.id !== id));
  };

  const filtered = filterMemoryEntries(
    entries,
    typeFilter === 'all' ? undefined : (typeFilter as MemoryEntryType),
    search
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-2xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-bold text-[#101828]">Book Master Brain™</h3>
          <p className="text-xs text-slate-500 mt-1">
            Persistent editorial memory store for concepts, glossary terms, constraints, and style decisions.
          </p>
        </div>
        <span className="text-xs font-mono text-slate-500 px-2.5 py-1 rounded bg-slate-100">
          {entries.length} Entries Logged
        </span>
      </div>

      {/* Add Memory Form */}
      <form onSubmit={handleAdd} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#081629]">
          Log Editorial Memory Entry
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Entry Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as MemoryEntryType)}
              className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 bg-white"
            >
              <option value="concept">Concept</option>
              <option value="glossary">Glossary Term</option>
              <option value="terminology">Terminology</option>
              <option value="style">Style Guideline</option>
              <option value="tone">Tone Constraint</option>
              <option value="constraint">Editorial Constraint</option>
              <option value="decision">Architectural Decision</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Term / Key *</label>
            <input
              type="text"
              placeholder="e.g. Quantum Entropy"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 bg-white"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Definition / Rule *</label>
            <input
              type="text"
              placeholder="e.g. Measure of information degradation in closed systems."
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 bg-white"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <PremiumButton type="submit" variant="primary" size="sm">
            Save Entry
          </PremiumButton>
        </div>
      </form>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <input
          type="text"
          placeholder="Search memory entries..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-64 px-3 py-1.5 text-xs rounded border border-slate-300"
        />

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-1.5 text-xs rounded border border-slate-300 bg-white"
        >
          <option value="all">All Types</option>
          <option value="concept">Concept</option>
          <option value="glossary">Glossary</option>
          <option value="terminology">Terminology</option>
          <option value="style">Style</option>
          <option value="constraint">Constraint</option>
        </select>
      </div>

      {/* Entries List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-6">No matching memory entries found.</p>
        ) : (
          filtered.map((entry) => (
            <div key={entry.id} className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between gap-4 text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#101828]">{entry.termOrKey}</span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {entry.type}
                  </span>
                </div>
                <p className="text-slate-600">{entry.definitionOrValue}</p>
              </div>

              <button
                type="button"
                onClick={() => handleDelete(entry.id)}
                className="text-[#D14343] text-xs font-semibold hover:underline"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
