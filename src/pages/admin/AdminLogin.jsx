import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ShieldCheck, Lock, User, KeyRound, Sparkles, ArrowRight, ArrowLeft, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { isSupabaseConfigured } from '../../lib/supabase';
import { DEFAULT_ADMIN_PASSCODE, EVENT_DETAILS } from '../../lib/constants';

export function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithPasscode, loginWithSupabase } = useAuth();
  
  const fromPath = location.state?.from?.pathname || '/admin';

  const [mode, setMode] = useState(isSupabaseConfigured ? 'supabase' : 'passcode'); // 'passcode' | 'supabase'
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [staffName, setStaffName] = useState('Gate Staff 1');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasscodeLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await loginWithPasscode(passcode, staffName);
      if (res.success) {
        navigate(fromPath, { replace: true });
      } else {
        setError(res.error || 'Invalid admin passcode. Please verify and try again.');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSupabaseLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await loginWithSupabase(email, password);
      if (res.success) {
        navigate(fromPath, { replace: true });
      } else {
        setError(res.error || 'Supabase authentication failed');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setPasscode(DEFAULT_ADMIN_PASSCODE);
    setStaffName('Gate Staff Terminal 1');
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-brand-500 selection:text-white">
      {/* Background glowing gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-brand-500/15 via-amber-500/5 to-transparent blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 relative z-10">
        
        {/* Back Link */}
        <div className="mb-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors py-1.5 px-3 rounded-full hover:bg-slate-900 border border-transparent hover:border-slate-800"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Visitor Portal</span>
          </Link>
        </div>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-amber-500 mx-auto flex items-center justify-center shadow-xl shadow-brand-500/25 border border-brand-400/30">
            <span className="font-display font-black text-white text-2xl tracking-tight">
              1Z
            </span>
          </div>

          <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight pt-1">
            Staff & Admin Control
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            {EVENT_DETAILS.fullTitle} • {EVENT_DETAILS.venue}
          </p>
        </div>

        {/* Login Card */}
        <div className="mt-7 bg-slate-900/90 backdrop-blur-xl py-8 px-6 sm:px-10 rounded-3xl border border-slate-800 shadow-2xl shadow-black/50 space-y-6 text-left">
          
          {/* Mode Switcher if Supabase is available */}
          {isSupabaseConfigured && (
            <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => { setMode('passcode'); setError(''); }}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  mode === 'passcode' ? 'bg-brand-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Staff Passcode
              </button>
              <button
                type="button"
                onClick={() => { setMode('supabase'); setError(''); }}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  mode === 'supabase' ? 'bg-brand-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Supabase Auth
              </button>
            </div>
          )}

          {error && (
            <div className="p-3.5 bg-rose-950/80 border border-rose-800/80 rounded-xl text-xs font-semibold text-rose-300 animate-fadeIn flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 flex-shrink-0"></span>
              <span>{error}</span>
            </div>
          )}

          {mode === 'passcode' ? (
            <form onSubmit={handlePasscodeLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Staff Operator / Terminal Name <span className="text-brand-400">*</span>
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gate Staff 1 / Desk A"
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                    className="block w-full rounded-xl border border-slate-700 bg-slate-950 text-white placeholder-slate-500 text-sm font-medium pl-10 pr-3.5 py-2.5 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Admin Passcode <span className="text-brand-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={fillDemoCredentials}
                    className="text-[11px] font-bold text-brand-400 hover:text-brand-300 transition-colors"
                  >
                    Use Demo Passcode
                  </button>
                </div>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <input
                    type={showPasscode ? 'text' : 'password'}
                    required
                    placeholder="Enter security passcode"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    className="block w-full rounded-xl border border-slate-700 bg-slate-950 text-white placeholder-slate-500 text-sm font-medium pl-10 pr-10 py-2.5 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasscode(!showPasscode)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                    title={showPasscode ? 'Hide Passcode' : 'Show Passcode'}
                  >
                    {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="mt-1.5 text-[11px] text-slate-400">
                  Demo Passcode: <code className="bg-slate-950 px-1.5 py-0.5 rounded text-brand-400 font-mono border border-slate-800">{DEFAULT_ADMIN_PASSCODE}</code>
                </p>
              </div>

              <Button
                type="submit"
                size="lg"
                variant="primary"
                loading={loading}
                icon={ShieldCheck}
                className="w-full font-bold shadow-lg shadow-brand-500/25 mt-2"
              >
                Access Admin Dashboard
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSupabaseLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Admin Email <span className="text-brand-400">*</span>
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="admin@onezoneexpo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-xl border border-slate-700 bg-slate-950 text-white placeholder-slate-500 text-sm font-medium pl-10 pr-3.5 py-2.5 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Password <span className="text-brand-400">*</span>
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-xl border border-slate-700 bg-slate-950 text-white placeholder-slate-500 text-sm font-medium pl-10 pr-10 py-2.5 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                    title={showPassword ? 'Hide Password' : 'Show Password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                variant="primary"
                loading={loading}
                icon={ShieldCheck}
                className="w-full font-bold shadow-lg shadow-brand-500/25 mt-2"
              >
                Log In with Supabase
              </Button>
            </form>
          )}

          {/* Quick Security Badge */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>End-to-End Encrypted Session • Gate Authorization</span>
          </div>

        </div>

      </div>

    </div>
  );
}
