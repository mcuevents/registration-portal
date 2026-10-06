import React from 'react';
import { 
  Building2, 
  Sparkles, 
  HardHat, 
  Layers, 
  Tv, 
  Car, 
  Store, 
  Briefcase,
  Check
} from 'lucide-react';
import { BUSINESS_CATEGORIES } from '../../lib/constants';

const ICON_MAP = {
  Building2,
  Sparkles,
  HardHat,
  Layers,
  Tv,
  Car,
  Store,
  Briefcase
};

export function CategorySelector({ selected, onChange, error }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Business Category <span className="text-brand-500">*</span>
        </label>
        <span className="text-xs text-slate-400 font-medium">Select your primary sector</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {BUSINESS_CATEGORIES.map((cat) => {
          const Icon = ICON_MAP[cat.icon] || Briefcase;
          const isSelected = selected === cat.label;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onChange(cat.label)}
              className={`relative flex flex-col items-start p-3 rounded-xl border text-left transition-all duration-200 group
                ${isSelected 
                  ? 'border-brand-500 bg-brand-50/70 ring-2 ring-brand-500/20 shadow-sm' 
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-brand-500 text-white flex items-center justify-center">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
              
              <div className={`p-2 rounded-lg mb-2 transition-colors ${
                isSelected 
                  ? 'bg-brand-500 text-white shadow-sm' 
                  : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200 group-hover:text-slate-900'
              }`}>
                <Icon className="w-4 h-4" />
              </div>

              <span className={`text-xs font-bold leading-tight ${isSelected ? 'text-brand-900' : 'text-slate-800'}`}>
                {cat.label}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 line-clamp-1 leading-tight">
                {cat.description}
              </span>
            </button>
          );
        })}
      </div>

      {error && (
        <p className="mt-1.5 text-xs font-medium text-rose-500">{error}</p>
      )}
    </div>
  );
}
