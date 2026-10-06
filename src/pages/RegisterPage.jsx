import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Sparkles, Calendar, MapPin, ArrowLeft, ShieldCheck } from 'lucide-react';
import { RegistrationForm } from '../components/visitor/RegistrationForm';
import { EVENT_DETAILS } from '../lib/constants';

export function RegisterPage() {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || '';

  return (
    <div className="py-8 sm:py-12 max-w-3xl mx-auto px-4 sm:px-6">
      
      {/* Back button */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Event Overview</span>
        </Link>
      </div>

      {/* Main Registration Card Container */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl shadow-brand-500/5 p-6 sm:p-10 relative">
        
        {/* Header */}
        <div className="text-center mb-8 pb-6 border-b border-slate-100">
          <div className="inline-flex items-center gap-1.5 bg-brand-50 text-brand-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            <span>Official Free Pre-Registration</span>
          </div>

          <h1 className="font-display font-black text-3xl sm:text-4xl text-slate-900 tracking-tight">
            ONEZONE 2K26 Visitor Pass
          </h1>

          <p className="text-sm text-slate-500 mt-2 max-w-lg mx-auto">
            Get instant free access to CODISSIA Hall B, Coimbatore on 30, 31 October & 1 November 2026.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-brand-500" />
              {EVENT_DETAILS.dates}
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-500" />
              {EVENT_DETAILS.venue}
            </span>
          </div>
        </div>

        {/* The Form */}
        <RegistrationForm initialCategory={categoryParam} />

      </div>

    </div>
  );
}
