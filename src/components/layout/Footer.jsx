import React from 'react';
import { Calendar, MapPin, Mail, Phone, ExternalLink, ArrowUpRight } from 'lucide-react';
import { EVENT_DETAILS, BUSINESS_CATEGORIES } from '../../lib/constants';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 pb-12 border-b border-slate-800">
          
          {/* Brand & Event summary */}
          <div className="space-y-4 lg:pr-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-amber-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
                <span className="font-display font-black text-xl text-white">1Z</span>
              </div>
              <span className="font-display font-extrabold text-2xl text-white tracking-tight">
                ONE<span className="text-brand-400">ZONE</span> 2K26
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Coimbatore's premier exhibition uniting leading builders, interior designers, materials, automobiles, and business innovators under one mega roof.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Official Visitor Registration Open
              </span>
            </div>
          </div>

          {/* Key Dates & Venue */}
          <div className="space-y-4">
            <h3 className="text-white font-display font-bold text-base tracking-wide uppercase">
              Dates & Location
            </h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-white font-semibold block">{EVENT_DETAILS.dates}</span>
                  <span className="text-xs text-slate-500">{EVENT_DETAILS.timing}</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-white font-semibold block">{EVENT_DETAILS.venue}</span>
                  <span className="text-xs text-slate-500 block leading-tight mt-0.5">{EVENT_DETAILS.venueAddress}</span>
                  <a
                    href={EVENT_DETAILS.mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 font-medium mt-1 transition-colors"
                  >
                    <span>Open in Google Maps</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>
              </li>
            </ul>
          </div>

          {/* Business Categories */}
          <div className="space-y-4">
            <h3 className="text-white font-display font-bold text-base tracking-wide uppercase">
              Focus Sectors
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
              {BUSINESS_CATEGORIES.slice(0, 8).map((cat) => (
                <div key={cat.id} className="flex items-center gap-1.5 hover:text-white transition-colors">
                  <span className="w-1 h-1 rounded-full bg-brand-500"></span>
                  <span className="truncate">{cat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Registration & Helpdesk */}
          <div className="space-y-4">
            <h3 className="text-white font-display font-bold text-base tracking-wide uppercase">
              Free Pass Registration
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pre-register online for seamless entry at Hall B gates. No account or password required.
            </p>
            <div className="pt-2 text-xs text-slate-400 space-y-1.5">
              <p>Email: <a href={`mailto:${EVENT_DETAILS.organizerEmail}`} className="text-slate-300 hover:underline">{EVENT_DETAILS.organizerEmail}</a></p>
              <p>Helpdesk: <a href={`tel:${EVENT_DETAILS.organizerPhone}`} className="text-slate-300 hover:underline">{EVENT_DETAILS.organizerPhone}</a></p>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 text-center sm:text-left">
          <p>© {new Date().getFullYear()} ONEZONE 2K26. All rights reserved. CODISSIA Hall B, Coimbatore.</p>
          <div className="flex items-center gap-4">
            <a href="#register" className="hover:text-slate-300 transition-colors">Visitor Registration</a>
            <span>•</span>
            <a href="#sectors" className="hover:text-slate-300 transition-colors">Focus Sectors</a>
            <span>•</span>
            <a href="#venue" className="hover:text-slate-300 transition-colors">Venue & Timing</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
