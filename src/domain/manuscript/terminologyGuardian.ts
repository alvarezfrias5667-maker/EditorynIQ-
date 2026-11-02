import { TerminologyEntry } from './manuscriptTypes';

export function createDefaultTerminology(): TerminologyEntry[] {
  return [
    {
      id: 'term_1',
      termEn: 'Quantum Supremacy',
      termEs: 'Supremacía Cuántica',
      definition: 'Experimental proof of quantum device outperforming classical supercomputers.',
      isProtectedCodeOrFormula: false,
      category: 'technical',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'term_2',
      termEn: 'const calculateEntropy = () => {}',
      termEs: 'const calculateEntropy = () => {}',
      definition: 'Protected software code snippet - must not be translated.',
      isProtectedCodeOrFormula: true,
      category: 'technical',
      createdAt: new Date().toISOString(),
    },
  ];
}

export function addTerminologyEntry(entries: TerminologyEntry[], newEntry: TerminologyEntry): TerminologyEntry[] {
  return [...entries, newEntry];
}

export function addProtectedPattern(patterns: string[], newPattern: string): string[] {
  if (patterns.includes(newPattern)) return patterns;
  return [...patterns, newPattern];
}

export function validateProtectedTerminology(text: string, terminology: TerminologyEntry[]): string[] {
  const warnings: string[] = [];
  terminology.forEach((t) => {
    if (t.isProtectedCodeOrFormula) {
      if (!text.includes(t.termEn)) {
        warnings.push(`Protected code snippet or formula "${t.termEn}" is missing in the current text.`);
      }
    }
  });
  return warnings;
}
