import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Calendar, MapPin, ArrowRight, Menu, X } from 'lucide-react';
import { EVENT_DETAILS } from '../../lib/constants';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all">
      {/* Top Notification Banner */}
      <div className="bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500 text-white text-xs py-1.5 px-4 font-medium flex items-center justify-between text-center overflow-hidden">
        <div className="container mx-auto flex items-center justify-center gap-3 sm:gap-6">
          <span className="flex items-center gap-1.5 font-semibold tracking-wide">
            <Calendar className="w-3.5 h-3.5 opacity-90" />
            <span>{EVENT_DETAILS.dates}</span>
          </span>
          <span className="hidden sm:inline-block opacity-50">•</span>
          <span className="flex items-center gap-1.5 font-semibold tracking-wide">
            <MapPin className="w-3.5 h-3.5 opacity-90" />
            <span>{EVENT_DETAILS.venue}</span>
          </span>
          <span className="hidden md:inline-block opacity-50">•</span>
          <span className="hidden md:inline-flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider">
            Free Visitor Pass
          </span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center shadow-md shadow-brand-500/10 border border-slate-700/50 group-hover:scale-105 transition-transform duration-200">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-amber-300 font-display font-black text-xl tracking-tight">1Z</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-extrabold text-xl sm:text-2xl tracking-tight text-slate-900">
                  ONE<span className="text-brand-500">ZONE</span>
                </span>
                <span className="bg-brand-50 text-brand-600 text-[11px] font-extrabold px-1.5 py-0.5 rounded border border-brand-200/60 uppercase tracking-wider">
                  2K26
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-widest leading-none">
                Coimbatore Expo
              </p>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-2">
            <Link
              to="/"
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive('/') ? 'text-brand-600 bg-brand-50/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Event Overview
            </Link>

            <a
              href="#sectors"
              className="px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            >
              Business Sectors
            </a>

            <a
              href="#venue"
              className="px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            >
              Venue & Directions
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href="#register"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 shadow-md shadow-brand-500/25 hover:shadow-brand-500/40 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>Register Now (Free)</span>
              <ArrowRight className="w-4 h-4 opacity-80" />
            </a>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-2 shadow-xl animate-fadeIn">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2.5 rounded-lg text-base font-semibold text-slate-800 hover:bg-slate-50"
          >
            Event Overview
          </Link>
          <a
            href="#sectors"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2.5 rounded-lg text-base font-semibold text-slate-700 hover:bg-slate-50"
          >
            Business Sectors
          </a>
          <a
            href="#venue"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2.5 rounded-lg text-base font-semibold text-slate-700 hover:bg-slate-50"
          >
            Venue & Directions
          </a>
          <a
            href="#register"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg text-base font-bold text-white bg-gradient-to-r from-brand-500 to-amber-500"
          >
            <span>Register for Free Pass</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      )}
    </header>
  );
}
