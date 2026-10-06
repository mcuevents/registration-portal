import React from 'react';
import { QrCode, ShieldCheck, MapPin, Calendar } from 'lucide-react';
import { QRScannerView } from '../../components/admin/QRScannerView';
import { EVENT_DETAILS } from '../../lib/constants';

export function AdminQRScanner() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Top Terminal Info Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-brand-500 text-white flex items-center justify-center shadow-lg shadow-brand-500/30">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-black text-xl sm:text-2xl text-white">
                CODISSIA Hall B Check-In Terminal
              </h1>
              <span className="bg-emerald-500 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                Active Gate
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Instant verification for ONEZONE 2K26 Exhibition Attendees
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-3 text-xs text-slate-300">
            <span className="flex items-center gap-1.5 font-semibold">
              <Calendar className="w-3.5 h-3.5 text-brand-400" />
              {EVENT_DETAILS.dateFormatted}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 font-semibold">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              Hall B
            </span>
          </div>

          <a
            href="/checkin"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-white text-xs font-bold transition-all shadow-md"
          >
            <span>Dedicated Mobile Terminal</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded">Kiosk</span>
          </a>
        </div>
      </div>

      {/* Embedded Scanner View */}
      <QRScannerView />

    </div>
  );
}
