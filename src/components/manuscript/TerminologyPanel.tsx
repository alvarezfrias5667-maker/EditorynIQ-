import React, { useState } from 'react';
import { TerminologyEntry } from '../../domain/manuscript/manuscriptTypes';
import { addTerminologyEntry, addProtectedPattern } from '../../domain/manuscript/terminologyGuardian';
import { BookOpen, Plus, Shield, Code, Tag, Trash2, CheckCircle } from 'lucide-react';
import { useI18n } from '../../i18n';

interface TerminologyPanelProps {
  entries: TerminologyEntry[];
  protectedPatterns: string[];
  onUpdateEntries: (entries: TerminologyEntry[]) => void;
  onUpdateProtectedPatterns: (patterns: string[]) => void;
}

export const TerminologyPanel: React.FC<TerminologyPanelProps> = ({
  entries,
  protectedPatterns,
  onUpdateEntries,
  onUpdateProtectedPatterns,
}) => {
  const { lang } = useI18n();
  const [termEn, setTermEn] = useState('');
  const [termEs, setTermEs] = useState('');
  const [definition, setDefinition] = useState('');
  const [category, setCategory] = useState<TerminologyEntry['category']>('general');
  const [newPattern, setNewPattern] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleAddTerm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!termEn.trim() || !definition.trim()) return;

    const newEntry: TerminologyEntry = {
      id: `term_${Date.now()}`,
      termEn: termEn.trim(),
      termEs: termEs.trim() || termEn.trim(),
      definition: definition.trim(),
      isProtectedCodeOrFormula: category === 'formula',
      category,
      createdAt: new Date().toISOString(),
    };

    const updated = addTerminologyEntry(entries, newEntry);
    onUpdateEntries(updated);
    setTermEn('');
    setTermEs('');
    setDefinition('');
    setCategory('general');
    setFeedback(
      lang === 'es'
        ? 'Término añadido al Glosario del Libro'
        : 'Term added to Book Glossary'
    );
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleRemoveTerm = (idToRemove: string) => {
    const updated = entries.filter((e) => e.id !== idToRemove);
    onUpdateEntries(updated);
  };

  const handleAddPattern = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPattern.trim()) return;

    const updated = addProtectedPattern(protectedPatterns, newPattern);
    onUpdateProtectedPatterns(updated);
    setNewPattern('');
    setFeedback(
      lang === 'es'
        ? 'Patrón de código/fórmula protegido'
        : 'Code/formula pattern protected'
    );
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleRemovePattern = (patternToRemove: string) => {
    const updated = protectedPatterns.filter((p) => p !== patternToRemove);
    onUpdateProtectedPatterns(updated);
  };

  return (
    <div className="space-y-8">
      {/* Feedback banner */}
      {feedback && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-sm flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Header Info */}
      <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#345CFF]/10 rounded-xl border border-[#345CFF]/30">
            <Shield className="w-5 h-5 text-[#345CFF]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#101828]">
              {lang === 'es'
                ? 'Guardian de Terminología y Códigos Protegidos'
                : 'Terminology Guardian & Code Protection'}
            </h3>
            <p className="text-xs text-slate-500">
              {lang === 'es'
                ? 'Garantiza consistencia conceptual, nombres propios, términos técnicos y fragmentos de código inmutables en todo el manuscrito.'
                : 'Ensures conceptual consistency, canonical terms, and immutable code snippets across the entire manuscript.'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Terminology / Glossary Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-[#081629] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#345CFF]" />
              <span>
                {lang === 'es' ? 'Glosario Canónico del Proyecto' : 'Canonical Project Glossary'}
              </span>
              <span className="ml-2 text-xs px-2 py-0.5 bg-[#345CFF]/10 border border-[#345CFF]/30 text-[#345CFF] rounded-full font-mono font-bold">
                {entries.length}
              </span>
            </h4>
          </div>

          {/* Add Term Form */}
          <form onSubmit={handleAddTerm} className="p-4 bg-white border border-slate-200/90 rounded-xl space-y-3 shadow-2xs">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {lang === 'es' ? 'Término en Inglés *' : 'Canonical Term (English) *'}
              </label>
              <input
                type="text"
                value={termEn}
                onChange={(e) => setTermEn(e.target.value)}
                placeholder="e.g. Quantum Kernel"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#345CFF]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {lang === 'es' ? 'Traducción en Español' : 'Spanish Translation'}
              </label>
              <input
                type="text"
                value={termEs}
                onChange={(e) => setTermEs(e.target.value)}
                placeholder="ej. Núcleo Cuántico"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#345CFF]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {lang === 'es' ? 'Definición Canónica *' : 'Canonical Definition *'}
              </label>
              <textarea
                value={definition}
                onChange={(e) => setDefinition(e.target.value)}
                rows={2}
                placeholder={lang === 'es' ? 'Definición o significado específico en la obra...' : 'Specific definition in the work...'}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#345CFF] resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {lang === 'es' ? 'Categoría' : 'Category'}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TerminologyEntry['category'])}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#345CFF]"
              >
                <option value="general">General</option>
                <option value="technical">Technical</option>
                <option value="proper_noun">Proper Noun</option>
                <option value="formula">Formula / Code</option>
                <option value="legal">Legal</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-[#345CFF] hover:bg-[#2848D8] text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-md"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{lang === 'es' ? 'Guardar Término Protegido' : 'Save Protected Term'}</span>
            </button>
          </form>

          {/* List of Terms */}
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {entries.length === 0 ? (
              <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-500">
                {lang === 'es'
                  ? 'No hay términos registrados aún.'
                  : 'No terms registered yet.'}
              </div>
            ) : (
              entries.map((entry) => (
                <div
                  key={entry.id}
                  className="p-3 bg-white border border-slate-200 hover:border-slate-300 rounded-xl flex items-start justify-between gap-3 transition-colors shadow-2xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-[#345CFF]" />
                      <span className="text-xs font-bold text-slate-800">{entry.termEn}</span>
                      {entry.termEs && entry.termEs !== entry.termEn && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 border border-blue-200 text-blue-800 rounded font-mono">
                          ⇄ {entry.termEs}
                        </span>
                      )}
                      <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-mono uppercase">
                        {entry.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{entry.definition}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveTerm(entry.id)}
                    className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                    title={lang === 'es' ? 'Eliminar término' : 'Remove term'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Protected Patterns / Code Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-[#081629] flex items-center gap-2">
              <Code className="w-4 h-4 text-cyan-600" />
              <span>
                {lang === 'es' ? 'Protección de Código y Fórmulas' : 'Code & Formula Shield'}
              </span>
              <span className="ml-2 text-xs px-2 py-0.5 bg-cyan-100 border border-cyan-300 text-cyan-800 rounded-full font-mono font-bold">
                {protectedPatterns.length}
              </span>
            </h4>
          </div>

          {/* Add Pattern Form */}
          <form onSubmit={handleAddPattern} className="p-4 bg-white border border-slate-200/90 rounded-xl space-y-3 shadow-2xs">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {lang === 'es'
                  ? 'Patrón de Código, Ecuación o Regex Protegido *'
                  : 'Protected Code, Equation or Regex Pattern *'}
              </label>
              <input
                type="text"
                value={newPattern}
                onChange={(e) => setNewPattern(e.target.value)}
                placeholder={lang === 'es' ? 'Ej: ```typescript, E=mc^2, [a-z0-9]+' : 'E.g., ```typescript, E=mc^2, [a-z0-9]+'}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-cyan-800 focus:outline-none focus:border-cyan-500"
                required
              />
              <p className="text-[10px] text-slate-500 mt-1">
                {lang === 'es'
                  ? 'Cualquier fragmento coincidente será protegido contra modificaciones o traducciones automáticas.'
                  : 'Any matching snippet will be immune to automatic edits or translation changes.'}
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-md"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{lang === 'es' ? 'Proteger Patrón de Texto' : 'Protect Pattern'}</span>
            </button>
          </form>

          {/* List of Patterns */}
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {protectedPatterns.length === 0 ? (
              <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-500">
                {lang === 'es'
                  ? 'No hay patrones de código o ecuaciones registrados.'
                  : 'No protected code or formula patterns registered yet.'}
              </div>
            ) : (
              protectedPatterns.map((pattern, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white border border-slate-200 hover:border-slate-300 rounded-xl flex items-center justify-between gap-3 font-mono text-xs text-cyan-800 transition-colors shadow-2xs"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Shield className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                    <span className="truncate">{pattern}</span>
                  </div>
                  <button
                    onClick={() => handleRemovePattern(pattern)}
                    className="p-1 text-slate-400 hover:text-rose-500 transition-colors shrink-0"
                    title={lang === 'es' ? 'Eliminar patrón' : 'Remove pattern'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
