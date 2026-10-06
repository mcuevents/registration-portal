import React from 'react';
import { Layers, Globe, TrendingUp, Users, Check, Filter } from 'lucide-react';
import { BUSINESS_CATEGORIES } from '../../lib/constants';

export function AnalyticsChart({ 
  categoryCounts = {}, 
  sourceCounts = {}, 
  campaignCounts = {}, 
  total = 0,
  selectedCategory = 'ALL',
  onSelectCategory
}) {
  // Build a sorted category list ensuring all BUSINESS_CATEGORIES are present
  const allCategories = BUSINESS_CATEGORIES.map(b => ({
    label: b.label,
    count: categoryCounts[b.label] || 0
  })).sort((a, b) => b.count - a.count);

  const sources = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1]);
  const campaigns = Object.entries(campaignCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Category-wise Registrations Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-50 text-brand-600 border border-brand-100">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-display font-bold text-base text-slate-900">Category Breakdown</h4>
              <p className="text-xs text-slate-400">Sector interest distribution across 8 industry verticals</p>
            </div>
          </div>
          <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200/60">
            {allCategories.length} Sectors
          </span>
        </div>

        <div className="space-y-3">
          {allCategories.map(({ label: category, count }) => {
            const percent = total > 0 ? Math.round((count / total) * 100) : 0;
            const isSelected = selectedCategory === category;

            return (
              <div 
                key={category} 
                onClick={() => onSelectCategory && onSelectCategory(isSelected ? 'ALL' : category)}
                className={`p-2 rounded-xl transition-all cursor-pointer border ${
                  isSelected 
                    ? 'bg-brand-50/70 border-brand-300 ring-2 ring-brand-500/20' 
                    : 'hover:bg-slate-50 border-transparent hover:border-slate-200'
                }`}
                title={`Click to filter table by ${category}`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <span>{category}</span>
                    {isSelected && (
                      <span className="text-[10px] font-bold bg-brand-600 text-white px-1.5 py-0.2 rounded-full">
                        Active Filter
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-slate-900 font-bold">{count}</span>
                    <span className="text-slate-400 text-[11px]">({percent}%)</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isSelected 
                        ? 'bg-brand-600' 
                        : count > 0 
                          ? 'bg-gradient-to-r from-brand-500 to-amber-500' 
                          : 'bg-slate-200'
                    }`}
                    style={{ width: `${count > 0 ? Math.max(percent, 4) : 0}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>

        {selectedCategory !== 'ALL' && onSelectCategory && (
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Filtered by: <strong className="text-brand-600">{selectedCategory}</strong></span>
            <button 
              onClick={() => onSelectCategory('ALL')} 
              className="font-bold text-brand-600 hover:text-brand-700 underline"
            >
              Clear Category Filter
            </button>
          </div>
        )}
      </div>

      {/* Source & Marketing Attribution */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-display font-bold text-base text-slate-900">Marketing Attribution</h4>
              <p className="text-xs text-slate-400">Visitor acquisition channels & campaigns</p>
            </div>
          </div>
          <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/60">
            {sources.length} Channels
          </span>
        </div>

        <div className="space-y-5">
          {/* Channel breakdown */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Channels (UTM / Source)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {sources.map(([src, count]) => {
                const percent = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={src} className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/60">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold capitalize text-slate-800 truncate">{src}</span>
                      <span className="text-xs font-extrabold text-brand-600 font-mono">{count}</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2.5 overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${percent}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Campaigns */}
          {campaigns.length > 0 && (
            <div className="pt-3 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Active Campaigns ({campaigns.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {campaigns.map(([camp, count]) => (
                  <span key={camp} className="inline-flex items-center gap-1.5 text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 font-medium">
                    <span className="font-semibold text-slate-900 truncate max-w-[150px]">{camp}</span>
                    <span className="bg-white text-brand-600 px-1.5 py-0.2 rounded text-[10px] font-bold border border-slate-200">
                      {count}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
