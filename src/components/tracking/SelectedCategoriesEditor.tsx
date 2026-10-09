"use client";

import React, { useState } from 'react';
import { LayoutGrid, Plus, X, Check } from 'lucide-react';
import { AVAILABLE_CATEGORIES, ScrapCategoryItem } from '../../context/PickupBookingContext';

interface SelectedCategoriesEditorProps {
  categoryIds: string[];
  isLocked?: boolean;
  onUpdateCategories: (newCategoryIds: string[]) => Promise<void> | void;
}

export const SelectedCategoriesEditor: React.FC<SelectedCategoriesEditorProps> = ({
  categoryIds,
  isLocked = false,
  onUpdateCategories,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedToAdd, setSelectedToAdd] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Map category IDs to full objects safely
  const selectedCategories = AVAILABLE_CATEGORIES.filter((c) =>
    (categoryIds || []).some((cid) =>
      typeof cid === 'string' &&
      (cid === c.id ||
        cid.toLowerCase() === c.name.toLowerCase() ||
        cid.toLowerCase() === c.code.toLowerCase() ||
        c.name.toLowerCase().includes(cid.toLowerCase()) ||
        cid.toLowerCase().includes(c.name.toLowerCase()))
    )
  );

  const activeDisplayCategories =
    selectedCategories.length > 0
      ? selectedCategories
      : [AVAILABLE_CATEGORIES[0], AVAILABLE_CATEGORIES[2]];

  // Categories available to add (not yet selected)
  const unselectedCategories = AVAILABLE_CATEGORIES.filter(
    (c) => !activeDisplayCategories.some((sc) => sc.id === c.id)
  );

  const handleRemoveCategory = async (catId: string) => {
    if (isLocked || categoryIds.length <= 1) return; // Keep at least 1 category
    const updated = categoryIds.filter(
      (id) => id !== catId && !id.toLowerCase().includes(catId.toLowerCase())
    );
    await onUpdateCategories(updated);
  };

  const handleOpenAddModal = () => {
    setSelectedToAdd([]);
    setIsAddModalOpen(true);
  };

  const handleToggleAdd = (catId: string) => {
    if (selectedToAdd.includes(catId)) {
      setSelectedToAdd(selectedToAdd.filter((id) => id !== catId));
    } else {
      setSelectedToAdd([...selectedToAdd, catId]);
    }
  };

  const handleConfirmAdd = async () => {
    if (selectedToAdd.length === 0) {
      setIsAddModalOpen(false);
      return;
    }
    setIsSaving(true);
    try {
      const updated = Array.from(new Set([...categoryIds, ...selectedToAdd]));
      await onUpdateCategories(updated);
      setIsAddModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl p-4 shadow-xs border border-slate-200/90 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
            <LayoutGrid className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-black text-slate-900 tracking-tight">
            Selected Categories
          </h3>
        </div>

        {!isLocked && unselectedCategories.length > 0 && (
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-full transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add</span>
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {activeDisplayCategories.length > 0 ? (
          activeDisplayCategories.map((cat) => (
            <div
              key={cat.id}
              className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200/90 rounded-full px-3 py-1 text-xs font-semibold text-slate-800 shadow-2xs group"
            >
              <span className="text-sm">{cat.emoji}</span>
              <span>{cat.name}</span>
              {!isLocked && activeDisplayCategories.length > 1 && (
                <button
                  onClick={() => handleRemoveCategory(cat.id)}
                  className="w-4 h-4 rounded-full bg-slate-200 hover:bg-rose-100 hover:text-rose-600 text-slate-500 flex items-center justify-center ml-0.5 transition-colors cursor-pointer"
                  title={`Remove ${cat.name}`}
                  aria-label={`Remove ${cat.name}`}
                >
                  <X className="w-2.5 h-2.5 stroke-[2.5]" />
                </button>
              )}
            </div>
          ))
        ) : (
          <span className="text-xs text-slate-400 italic">No categories selected</span>
        )}
      </div>

      {/* Add Categories Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-sm font-black text-slate-900">Add Scrap Categories</h4>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-2 mb-3">
              Select additional scrap categories you would like to have picked up.
            </p>

            <div className="space-y-2 overflow-y-auto my-2 flex-1">
              {unselectedCategories.map((cat) => {
                const isSelected = selectedToAdd.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleToggleAdd(cat.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#0A3D2B] bg-emerald-50/60'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{cat.emoji}</span>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{cat.name}</p>
                        <p className="text-[11px] text-slate-400">{cat.description}</p>
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isSelected
                          ? 'bg-[#0A3D2B] border-[#0A3D2B] text-white'
                          : 'border-slate-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAdd}
                disabled={isSaving || selectedToAdd.length === 0}
                className="flex-1 py-2.5 rounded-xl bg-[#0A3D2B] hover:bg-[#06291C] disabled:opacity-50 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                {isSaving ? 'Adding...' : `Add Selected (${selectedToAdd.length})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
