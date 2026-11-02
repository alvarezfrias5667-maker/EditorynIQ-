import React, { useState } from 'react';
import { PageBudget, PageBudgetItem } from '../../domain/intelligence/bookIntelligenceTypes';
import { calculatePageBudget } from '../../domain/intelligence/pageBudgetEngine';
import { PremiumButton } from '../ui/PremiumButton';

export interface PageBudgetPanelProps {
  pageBudget: PageBudget;
  onUpdateBudget: (budget: PageBudget) => void;
}

export const PageBudgetPanel: React.FC<PageBudgetPanelProps> = ({ pageBudget, onUpdateBudget }) => {
  const [items, setItems] = useState<PageBudgetItem[]>(pageBudget.items);

  const handlePageChange = (id: string, newPages: number) => {
    const updated = items.map((item) => (item.id === id ? { ...item, allocatedPages: Math.max(0, newPages) } : item));
    setItems(updated);
    const calculated = calculatePageBudget(pageBudget.targetPages, updated);
    onUpdateBudget(calculated);
  };

  const handleAddItem = () => {
    const newItem: PageBudgetItem = {
      id: `pb_${Date.now()}`,
      category: 'illustration',
      title: 'New Section / Illustration Pages',
      allocatedPages: 10,
    };
    const updated = [...items, newItem];
    setItems(updated);
    onUpdateBudget(calculatePageBudget(pageBudget.targetPages, updated));
  };

  const handleDeleteItem = (id: string) => {
    const updated = items.filter((it) => it.id !== id);
    setItems(updated);
    onUpdateBudget(calculatePageBudget(pageBudget.targetPages, updated));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-2xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-bold text-[#101828]">Page Budget Intelligence™</h3>
          <p className="text-xs text-slate-500 mt-1">
            Dynamic allocation math for 20 to 600 target page counts.
          </p>
        </div>

        <PremiumButton variant="outline" size="sm" onClick={handleAddItem}>
          + Add Budget Section
        </PremiumButton>
      </div>

      {/* Target & Balance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
          <span className="text-xs text-slate-500 block">Target Pages</span>
          <span className="text-2xl font-extrabold font-mono text-[#081629]">{pageBudget.targetPages}</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
          <span className="text-xs text-slate-500 block">Allocated Pages</span>
          <span className="text-2xl font-extrabold font-mono text-[#345CFF]">{pageBudget.allocatedPages}</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
          <span className="text-xs text-slate-500 block">Remaining</span>
          <span className="text-2xl font-extrabold font-mono text-[#16836D]">{pageBudget.remainingPages}</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
          <span className="text-xs text-slate-500 block">Budget Balance</span>
          <span className={`text-xs font-extrabold px-2.5 py-1 rounded inline-block mt-1 ${pageBudget.isBalanced ? 'bg-[#16836D]/15 text-[#16836D]' : 'bg-[#D14343]/15 text-[#D14343]'}`}>
            {pageBudget.isBalanced ? '✓ PERFECTLY BALANCED' : `⚠ UNBALANCED (${pageBudget.excessPages > 0 ? `Excess ${pageBudget.excessPages} pgs` : `Short ${pageBudget.remainingPages} pgs`})`}
          </span>
        </div>
      </div>

      {/* Allocation Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-600 uppercase font-bold">
              <th className="p-3">Category</th>
              <th className="p-3">Section Description</th>
              <th className="p-3 w-32">Allocated Pages</th>
              <th className="p-3 w-20">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/50">
                <td className="p-3 font-semibold text-slate-700 capitalize">
                  {item.category.replace('_', ' ')}
                </td>
                <td className="p-3 text-slate-800">{item.title}</td>
                <td className="p-3">
                  <input
                    type="number"
                    min={0}
                    value={item.allocatedPages}
                    onChange={(e) => handlePageChange(item.id, Number(e.target.value))}
                    className="w-24 px-2 py-1 text-xs rounded border border-slate-300 font-mono focus:ring-2 focus:ring-[#345CFF]"
                  />
                </td>
                <td className="p-3">
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item.id)}
                    className="text-[#D14343] font-semibold hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] text-slate-400 italic">
        Note: PLANNED_PAGES is a structural layout allocation target and does not represent rendered PDF page counts.
      </p>
    </div>
  );
};
