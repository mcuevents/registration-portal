import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  QrCode, 
  LogOut, 
  Sparkles, 
  ShieldCheck, 
  Database, 
  ExternalLink,
  Menu,
  X,
  Calendar,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabase';
import { EVENT_DETAILS } from '../../lib/constants';

export function AdminLayout({ children }) {
  const { adminUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navItems = [
    {
      label: 'Dashboard Overview',
      path: '/admin',
      icon: LayoutDashboard,
    },
    {
      label: 'Visitor Registrations',
      path: '/admin/registrations',
      icon: Users,
    },
    {
      label: 'Gate Terminal',
      path: '/admin/scan',
      icon: QrCode,
    },
    {
      label: 'Dedicated Check-In Kiosk',
      path: '/checkin',
      icon: Sparkles,
    },
  ];

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col">
      
      {/* Admin Topbar */}
      <header className="sticky top-0 z-30 bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand / Title */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <Link to="/admin" className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-amber-500 flex items-center justify-center shadow-md shadow-brand-500/20">
                  <span className="font-display font-black text-white text-base">1Z</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-extrabold text-base tracking-tight text-white">
                      ONEZONE <span className="text-brand-400">ADMIN</span>
                    </span>
                    <span className="text-[10px] bg-brand-500/20 text-brand-300 font-mono px-2 py-0.5 rounded border border-brand-500/30">
                      2K26
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium block">
                    CODISSIA Hall B Event Portal
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      active
                        ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right: Database Indicator & Profile */}
            <div className="flex items-center gap-3">
              
              {/* Supabase Status Indicator */}
              <div 
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border"
                title={isSupabaseConfigured ? 'Connected to Supabase PostgreSQL Cloud DB' : 'Using Local/Hybrid Storage with seamless Sync'}
              >
                {isSupabaseConfigured ? (
                  <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/60 border-emerald-800/80 px-2 py-0.5 rounded-full border">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Supabase Live</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-amber-300 bg-amber-950/60 border-amber-800/80 px-2 py-0.5 rounded-full border">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    <span>Local/Hybrid DB</span>
                  </span>
                )}
              </div>

              {/* Public Portal Link */}
              <Link
                to="/"
                target="_blank"
                className="hidden md:flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
              >
                <span>Visitor Site</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </Link>

              {/* Admin User info & Logout */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <div className="hidden sm:block text-right">
                  <span className="text-xs font-bold text-white block leading-tight">
                    {adminUser?.name || 'Admin'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold block">
                    {adminUser?.role || 'Staff Operator'}
                  </span>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors"
                  title="Log Out of Admin"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="lg:hidden bg-slate-900 border-t border-slate-800 p-4 space-y-2 animate-fadeIn">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    active
                      ? 'bg-brand-500 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <Link to="/" target="_blank" className="text-brand-400 hover:underline">Open Visitor Portal</Link>
              <button onClick={handleLogout} className="text-rose-400 font-bold">Logout</button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>

    </div>
  );
}
