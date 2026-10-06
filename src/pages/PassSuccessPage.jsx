import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  ArrowLeft, 
  Search, 
  Share2, 
  UserPlus, 
  Sparkles, 
  MapPin, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { getRegistrationByCode } from '../lib/storage';
import { VisitorPassCard } from '../components/visitor/VisitorPassCard';
import { Button } from '../components/ui/Button';
import { EVENT_DETAILS } from '../lib/constants';

export function PassSuccessPage() {
  const { registrationId } = useParams();
  const navigate = useNavigate();
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRegistration() {
      if (!registrationId) return;
      setLoading(true);
      const data = await getRegistrationByCode(registrationId);
      setRegistration(data);
      setLoading(false);
    }
    loadRegistration();
  }, [registrationId]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-600">Generating your Visitor Badge...</p>
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="py-16 max-w-lg mx-auto px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-200 text-rose-500 mx-auto flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div>
          <h2 className="font-display font-black text-2xl text-slate-900">Visitor Pass Not Found</h2>
          <p className="text-sm text-slate-500 mt-1">
            We could not find an active registration pass for code "{registrationId}".
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Button variant="secondary" onClick={() => navigate('/lookup')} icon={Search}>
            Search My Pass
          </Button>
          <Button variant="primary" onClick={() => navigate('/register')} icon={UserPlus}>
            New Registration
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12 max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
      
      {/* Top Success Banner (No-print) */}
      <div className="no-print bg-emerald-500/10 border border-emerald-500/30 rounded-3xl p-6 text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500 text-white mb-1 shadow-md shadow-emerald-500/30">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <h1 className="font-display font-black text-2xl sm:text-3xl text-emerald-950 tracking-tight">
          Registration Confirmed!
        </h1>
        <p className="text-sm text-emerald-900 max-w-md mx-auto">
          Your official QR pass for <strong>ONEZONE 2K26</strong> has been generated. Please save or screenshot this badge for fast gate entry at CODISSIA Hall B.
        </p>
      </div>

      {/* Visitor Pass Card Component */}
      <VisitorPassCard registration={registration} />

      {/* Important Gate Instructions */}
      <div className="no-print bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-card space-y-4 max-w-md mx-auto">
        <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-500" />
          <span>Gate Entry Guidelines</span>
        </h3>
        <ul className="text-xs text-slate-600 space-y-2.5">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 flex-shrink-0"></span>
            <span>Show this QR code at <strong>CODISSIA Hall B Gate Scanner</strong> on your smartphone.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 flex-shrink-0"></span>
            <span>If accompanying guests (Total: <strong>{registration.number_of_visitors || 1}</strong>), your group enters together under this single pass.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 flex-shrink-0"></span>
            <span>Dates: <strong>{EVENT_DETAILS.dates}</strong> | 10:00 AM to 7:00 PM.</span>
          </li>
        </ul>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <Link
            to="/register"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register Another Person</span>
          </Link>
          <Link
            to="/"
            className="text-xs font-semibold text-slate-500 hover:text-slate-900"
          >
            Back to Home
          </Link>
        </div>
      </div>

    </div>
  );
}
