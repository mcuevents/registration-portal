import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Building, 
  Briefcase, 
  Users, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  ExternalLink,
  Tag,
  Globe,
  Copy,
  Check,
  QrCode
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { formatDateTime } from '../../lib/utils';

export function RegistrationModal({
  registration,
  isOpen,
  onClose,
  onToggleCheckIn,
  onDelete
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !registration) return null;

  const regName = registration.name || registration.full_name || 'Visitor';
  const regMobile = registration.mobile || registration.mobile_number || '';
  const regCompany = registration.company || registration.company_name || '';
  const regCategory = registration.category || registration.business_category || 'Real Estate';
  const regVisitors = registration.visitor_count || registration.number_of_visitors || 1;
  const isCheckedIn = Boolean(registration.check_in_status !== undefined ? registration.check_in_status : registration.checked_in);

  const handleCopy = () => {
    const details = `ONEZONE 2K26 Registration Details:
Pass ID: ${registration.registration_id}
Name: ${regName}
Mobile: ${regMobile}
Email: ${registration.email}
Category: ${regCategory}
Company: ${regCompany || 'N/A'}
Visitors: ${regVisitors}
Status: ${isCheckedIn ? 'Checked In' : 'Pending'}`;
    navigator.clipboard.writeText(details);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-scaleUp">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-500 to-amber-500 flex items-center justify-center text-white font-mono font-black text-sm shadow-md shadow-brand-500/20">
              1Z
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-lg text-white">Registration Details</h3>
                <span className="font-mono text-xs bg-slate-800 text-brand-300 px-2.5 py-0.5 rounded-md border border-slate-700 font-bold">
                  {registration.registration_id}
                </span>
              </div>
              <p className="text-xs text-slate-400">Registered on {formatDateTime(registration.created_at)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopy}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
              title="Copy details"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Status Banner */}
          <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            isCheckedIn
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : 'bg-amber-50 border-amber-200 text-amber-950'
          }`}>
            <div className="flex items-center gap-3">
              {isCheckedIn ? (
                <CheckCircle2 className="w-7 h-7 text-emerald-600 flex-shrink-0" />
              ) : (
                <Clock className="w-7 h-7 text-amber-600 flex-shrink-0" />
              )}
              <div>
                <span className="font-bold text-sm block">
                  {isCheckedIn ? 'Checked In at CODISSIA Hall B' : 'Pending Gate Verification'}
                </span>
                <span className="text-xs text-slate-600">
                  {isCheckedIn 
                    ? 'Attendee pass verified and admission recorded.'
                    : 'Pass valid for entry at ONEZONE 2K26 (30 Oct - 01 Nov 2026).'}
                </span>
              </div>
            </div>

            <Button
              size="sm"
              variant={isCheckedIn ? 'outline' : 'primary'}
              onClick={() => onToggleCheckIn(registration.registration_id, isCheckedIn)}
              className="text-xs font-bold whitespace-nowrap self-start sm:self-center"
            >
              {isCheckedIn ? 'Undo Check-in' : 'Mark As Checked-In'}
            </Button>
          </div>

          {/* Visitor Personal & Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Attendee Contact Info
              </span>
              
              <div className="space-y-2.5 text-sm">
                <div className="flex items-center gap-2.5">
                  <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="font-bold text-slate-900">{regName}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <a href={`tel:${regMobile}`} className="text-brand-600 font-semibold hover:underline">
                    {regMobile}
                  </a>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <a href={`mailto:${registration.email}`} className="text-slate-700 hover:underline truncate">
                    {registration.email}
                  </a>
                </div>
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="text-slate-700 font-medium">{registration.city || 'Coimbatore'}</span>
                </div>
              </div>
            </div>

            {/* Professional & Sector Info */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Professional Details
              </span>
              
              <div className="space-y-2.5 text-sm">
                <div className="flex items-center gap-2.5">
                  <Building className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="text-slate-900 font-semibold">{regCompany || 'Individual Attendee'}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Briefcase className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="text-slate-700">{registration.designation || 'Visitor'}</span>
                </div>
                <div className="flex items-center gap-2.5 pt-0.5">
                  <Tag className="w-4 h-4 text-brand-500 flex-shrink-0" />
                  <Badge variant="brand">{regCategory}</Badge>
                </div>
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="text-slate-700 font-medium">{regVisitors} Total Registered Visitor(s)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Marketing Attribution Card */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2.5">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-brand-500" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Marketing Attribution</span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">Source Channel</span>
                <span className="font-bold text-slate-800 capitalize">{registration.source || 'Direct'}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">Campaign</span>
                <span className="font-bold text-slate-800 truncate block">{registration.campaign || 'None'}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">Creative / Ad</span>
                <span className="font-bold text-slate-800 truncate block">{registration.creative || 'None'}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer actions */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 sm:px-6 flex items-center justify-between gap-3">
          <Button
            size="sm"
            variant="danger"
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete registration for ${regName} (${registration.registration_id})?`)) {
                onDelete(registration.registration_id);
                onClose();
              }
            }}
            icon={Trash2}
            className="text-xs"
          >
            Delete Record
          </Button>

          <div className="flex items-center gap-2">
            <Link
              to={`/pass/${registration.registration_id}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-100 transition-colors shadow-sm"
            >
              <QrCode className="w-3.5 h-3.5 text-brand-600" />
              <span>View Digital Pass</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </Link>

            <Button
              size="sm"
              variant="primary"
              onClick={onClose}
              className="text-xs font-bold px-5"
            >
              Close
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
