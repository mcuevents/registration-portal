import React, { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { 
  Download, 
  Printer, 
  Calendar as CalendarIcon, 
  MapPin, 
  Users, 
  CheckCircle2, 
  Sparkles,
  Building,
  RotateCcw
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { EVENT_DETAILS } from '../../lib/constants';

export function VisitorPassCard({ registration, onReset }) {
  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!registration) return null;

  const attendeeName = registration.name || registration.full_name || 'Visitor';
  const regId = registration.registration_id;
  const category = registration.category || registration.business_category || 'Real Estate';
  const company = registration.company || registration.company_name || '';
  const designation = registration.designation || '';
  const visitorCount = registration.visitor_count || registration.number_of_visitors || 1;
  const city = registration.city || 'Coimbatore';

  // Download pass as high-res PNG
  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3, // High-res for retina / crisp printing
        backgroundColor: '#FFFFFF',
        useCORS: true,
        logging: false
      });
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `ONEZONE-2K26-Pass-${regId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloading(false);
    }
  };

  // Print pass
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Success Banner */}
      <div className="no-print bg-emerald-50 border-2 border-emerald-500/80 rounded-3xl p-6 sm:p-7 text-center space-y-2">
        <div className="w-12 h-12 rounded-full bg-emerald-500 text-white mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/25">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full inline-block">
          Registration Successful
        </span>
        <h2 className="font-display font-black text-2xl sm:text-3xl text-emerald-950">
          Your Digital Visitor Pass is Ready!
        </h2>
        <p className="text-xs sm:text-sm text-emerald-800 max-w-md mx-auto">
          Please download or print your digital pass. Present this QR pass at the entrance of <strong>CODISSIA Hall B</strong> for instant entry.
        </p>
      </div>

      {/* Visual Digital Visitor Pass Badge */}
      <div 
        ref={cardRef} 
        className="visitor-badge-print-container bg-white rounded-3xl border border-slate-200 shadow-2xl shadow-slate-900/10 overflow-hidden max-w-md mx-auto relative transition-all"
      >
        {/* Pass Top Branding Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 text-center relative overflow-hidden">
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-24 bg-brand-500/20 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-400 bg-brand-500/10 px-2.5 py-0.5 rounded-full border border-brand-500/30">
              Official Entry Pass
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Coimbatore
            </span>
          </div>

          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="font-display font-black text-3xl tracking-tight text-white">
              ONE<span className="text-brand-400">ZONE</span>
            </span>
            <span className="bg-brand-500 text-white text-xs font-black px-2 py-0.5 rounded shadow-sm">
              2K26
            </span>
          </div>
          <p className="text-xs text-slate-300 font-medium">Premier Mega Trade & Consumer Exhibition</p>

          {/* Dates and Venue */}
          <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-center gap-3 text-xs text-slate-200">
            <span className="flex items-center gap-1 font-semibold">
              <CalendarIcon className="w-3.5 h-3.5 text-brand-400" />
              {EVENT_DETAILS.dates}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-amber-300 font-bold flex items-center justify-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            CODISSIA Hall B, Coimbatore
          </div>
        </div>

        {/* Badge Cutout Notches */}
        <div className="relative h-4 bg-white flex items-center justify-between px-[-10px] z-10">
          <div className="w-4 h-4 rounded-full bg-slate-100 -ml-2 border-r border-slate-200"></div>
          <div className="border-b-2 border-dashed border-slate-200 w-full mx-2"></div>
          <div className="w-4 h-4 rounded-full bg-slate-100 -mr-2 border-l border-slate-200"></div>
        </div>

        {/* Pass Body Content */}
        <div className="p-6 sm:p-8 space-y-6 text-center bg-white">
          
          {/* Visitor Name & Info */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
              Visitor Name
            </span>
            <h3 className="font-display font-black text-2xl sm:text-3xl text-slate-900 tracking-tight leading-tight">
              {attendeeName}
            </h3>
            
            {(company || designation) && (
              <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1 flex items-center justify-center gap-1.5 flex-wrap">
                {designation && <span>{designation}</span>}
                {designation && company && <span className="text-slate-300">•</span>}
                {company && <span className="text-brand-600 font-bold">{company}</span>}
              </p>
            )}

            <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
              <Badge variant="brand" className="text-xs px-3 py-1 font-bold">
                {category}
              </Badge>
              <Badge variant="dark" className="text-xs px-3 py-1 font-bold">
                <Users className="w-3 h-3 mr-1" />
                {visitorCount} {visitorCount === 1 ? 'Person' : 'Persons'}
              </Badge>
            </div>
          </div>

          {/* QR Code Container (Contains unique Registration ID) */}
          <div className="flex flex-col items-center justify-center py-1">
            <div className="p-4 bg-white rounded-2xl border-2 border-slate-900 shadow-xl inline-block">
              <QRCodeSVG
                value={regId}
                size={180}
                level="H"
                includeMargin={false}
              />
            </div>
            
            {/* Monospaced Registration ID */}
            <div className="mt-3">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-0.5">
                Registration ID
              </span>
              <span className="font-mono font-black text-xl text-slate-900 bg-slate-100 px-4 py-1.5 rounded-xl border border-slate-200 tracking-widest inline-block">
                {regId}
              </span>
            </div>
          </div>

          {/* Event Venue & Timing Confirmation Box */}
          <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1">
            <div className="flex justify-between items-center text-slate-500">
              <span>Event Dates:</span>
              <strong className="text-slate-800">{EVENT_DETAILS.dates}</strong>
            </div>
            <div className="flex justify-between items-center text-slate-500">
              <span>Venue:</span>
              <strong className="text-slate-800">CODISSIA Hall B, Coimbatore</strong>
            </div>
            <div className="flex justify-between items-center text-slate-500">
              <span>City:</span>
              <strong className="text-slate-800">{city}</strong>
            </div>
          </div>

        </div>

        {/* Badge Footer Note */}
        <div className="bg-slate-50 border-t border-slate-200 p-3 text-center text-[11px] text-slate-500">
          Show this QR code at CODISSIA Hall B entry gate for fast check-in.
        </div>
      </div>

      {/* Action Buttons: Download & Print (Excluded from printing) */}
      <div className="no-print max-w-md mx-auto space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={handleDownloadImage}
            loading={downloading}
            icon={Download}
            className="w-full text-xs sm:text-sm font-bold shadow-lg shadow-brand-500/25"
          >
            {downloadSuccess ? 'Downloaded!' : 'Download Pass (PNG)'}
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={handlePrint}
            icon={Printer}
            className="w-full text-xs sm:text-sm font-bold border-slate-300"
          >
            Print Pass
          </Button>
        </div>

        {onReset && (
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Register Another Visitor</span>
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
