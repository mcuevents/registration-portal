import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Phone, 
  Mail, 
  ArrowRight, 
  QrCode, 
  CheckCircle2, 
  User, 
  Building, 
  Users, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { searchRegistrationsByContact } from '../lib/storage';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EVENT_DETAILS } from '../lib/constants';

export function LookupPage() {
  const [validationError, setValidationError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setValidationError('');
    const cleanQuery = query.trim();

    if (!cleanQuery) return;
    if (cleanQuery.length < 5) {
      setValidationError('Please enter at least 5 characters (e.g. 10-digit mobile number, full email, or Pass ID).');
      return;
    }

    setLoading(true);
    try {
      const data = await searchRegistrationsByContact(cleanQuery);
      setResults(data);
    } catch (err) {
      console.error('Search error:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-8 sm:py-12 max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 mb-1 shadow-inner">
          <Search className="w-6 h-6" />
        </div>
        <h1 className="font-display font-black text-3xl sm:text-4xl text-slate-900 tracking-tight">
          Find Your ONEZONE 2K26 Pass
        </h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Enter the mobile number, email address, or Registration ID you used during registration.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-card">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Enter Mobile Number, Email, or Pass ID (e.g. 9876543210 / OZ26-XXXXX)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 text-sm rounded-2xl border border-slate-200 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 font-medium"
              required
            />
          </div>
          <Button
            type="submit"
            size="lg"
            variant="primary"
            loading={loading}
            icon={Search}
            className="font-bold sm:px-8"
          >
            Find Pass
          </Button>
        </form>

        {validationError && (
          <p className="mt-3 text-xs text-rose-500 font-semibold flex items-center gap-1.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{validationError}</span>
          </p>
        )}
      </div>

      {/* Results Container */}
      {results !== null && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Found <strong>{results.length}</strong> matching registration(s)</span>
          </div>

          {results.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">No Passes Found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  We couldn't find any registered passes matching "{query}". Please check your details or create a new free pass.
                </p>
              </div>
              <Button
                variant="primary"
                onClick={() => navigate('/register')}
                className="text-xs font-bold"
              >
                Register for Free Pass Now
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {results.map((reg) => (
                <div
                  key={reg.id || reg.registration_id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm hover:shadow-card hover:border-brand-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-xs bg-slate-100 text-slate-900 px-2.5 py-1 rounded-lg border border-slate-200">
                        {reg.registration_id}
                      </span>
                      <Badge variant="brand">{reg.business_category}</Badge>
                      {reg.checked_in && (
                        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Checked In
                        </span>
                      )}
                    </div>

                    <h3 className="font-display font-bold text-lg text-slate-900">
                      {reg.full_name}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {reg.mobile_number}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {reg.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        {reg.number_of_visitors || 1} Visitor(s)
                      </span>
                    </div>
                  </div>

                  <Link
                    to={`/pass/${reg.registration_id}`}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>View & Download Pass</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
