import React from 'react';

export function StatCard({
  title,
  value,
  subvalue,
  icon: Icon,
  trend,
  trendLabel,
  color = 'brand',
}) {
  const colorMap = {
    brand: {
      bg: 'bg-brand-50/70',
      text: 'text-brand-600',
      border: 'border-brand-200/80',
      glow: 'shadow-brand-500/10'
    },
    amber: {
      bg: 'bg-amber-50/70',
      text: 'text-amber-600',
      border: 'border-amber-200/80',
      glow: 'shadow-amber-500/10'
    },
    emerald: {
      bg: 'bg-emerald-50/70',
      text: 'text-emerald-600',
      border: 'border-emerald-200/80',
      glow: 'shadow-emerald-500/10'
    },
    blue: {
      bg: 'bg-blue-50/70',
      text: 'text-blue-600',
      border: 'border-blue-200/80',
      glow: 'shadow-blue-500/10'
    },
    purple: {
      bg: 'bg-purple-50/70',
      text: 'text-purple-600',
      border: 'border-purple-200/80',
      glow: 'shadow-purple-500/10'
    },
    dark: {
      bg: 'bg-slate-900',
      text: 'text-white',
      border: 'border-slate-800',
      glow: 'shadow-slate-900/10'
    }
  };

  const scheme = colorMap[color] || colorMap.brand;

  return (
    <div className={`p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all duration-300 relative overflow-hidden group`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl border ${scheme.bg} ${scheme.text} ${scheme.border} group-hover:scale-110 transition-transform duration-200`}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <h3 className="font-display font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
          {value}
        </h3>
        {subvalue && (
          <span className="text-xs font-semibold text-slate-500">
            {subvalue}
          </span>
        )}
      </div>

      {trendLabel && (
        <div className="mt-2.5 flex items-center gap-1.5 text-xs">
          {trend && (
            <span className={`font-bold ${trend > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {trend > 0 ? `+${trend}` : trend}
            </span>
          )}
          <span className="text-slate-400 font-medium">{trendLabel}</span>
        </div>
      )}
    </div>
  );
}
