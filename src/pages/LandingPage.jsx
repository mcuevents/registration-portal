import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Users, 
  Building2, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight,
  Clock,
  Briefcase,
  Layers,
  HardHat,
  Tv,
  Car,
  Store
} from 'lucide-react';
import { EVENT_DETAILS, BUSINESS_CATEGORIES } from '../lib/constants';
import { RegistrationForm } from '../components/visitor/RegistrationForm';

export function LandingPage() {
  // Live Countdown Timer to 30 October 2026
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetDate = new Date(EVENT_DETAILS.startDateISO).getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      
      {/* Hero Section */}
      <section className="relative pt-6 sm:pt-12 overflow-hidden">
        {/* Subtle Brand Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-brand-100/60 via-amber-50/40 to-transparent rounded-full blur-3xl pointer-events-none"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            
            {/* Pill Notification */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-200/80 text-brand-700 text-xs sm:text-sm font-semibold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
              <span>Official Visitor Registration</span>
              <span className="bg-brand-500 text-white text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">Free Pass</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl text-slate-900 tracking-tight leading-[1.08]">
              Experience South India's Premier Mega Expo at{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500">
                ONEZONE 2K26
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-xl text-slate-600 font-normal max-w-2xl mx-auto leading-relaxed">
              Join 200+ industry leaders across Real Estate, Interior Designing, Building Materials, Automobiles, and Franchises.
            </p>

            {/* Key Event Badges */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm text-xs sm:text-sm font-bold text-slate-800">
                <Calendar className="w-4 h-4 text-brand-500" />
                <span>{EVENT_DETAILS.dates}</span>
              </div>

              <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm text-xs sm:text-sm font-bold text-slate-800">
                <MapPin className="w-4 h-4 text-amber-500" />
                <span>{EVENT_DETAILS.venue}</span>
              </div>
            </div>

            {/* Live Event Countdown */}
            <div className="pt-4 max-w-lg mx-auto">
              <span className="text-[11px] uppercase font-extrabold tracking-widest text-slate-400 block mb-2">
                Event Starts In
              </span>
              <div className="grid grid-cols-4 gap-2 sm:gap-3">
                {[
                  { label: 'Days', value: timeLeft.days },
                  { label: 'Hours', value: timeLeft.hours },
                  { label: 'Minutes', value: timeLeft.minutes },
                  { label: 'Seconds', value: timeLeft.seconds },
                ].map((item) => (
                  <div key={item.label} className="bg-slate-900 text-white p-3 rounded-2xl border border-slate-800 shadow-md">
                    <span className="font-display font-black text-xl sm:text-2xl block text-brand-400">
                      {String(item.value).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Dedicated Registration Form Container */}
          <div id="register" className="mt-12 max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200/90 shadow-2xl shadow-brand-500/5 p-6 sm:p-10 relative scroll-mt-24">
            
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 mb-3 shadow-inner">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
                Visitor Registration
              </h2>
              <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                Fill in your details below to generate your free entry pass. No password or account creation required.
              </p>
            </div>

            <RegistrationForm />

          </div>

        </div>
      </section>

      {/* 8 Business Sectors Section */}
      <section id="sectors" className="container mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-12">
          <span className="text-xs font-extrabold uppercase tracking-widest text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            Exhibition Categories
          </span>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-slate-900 tracking-tight">
            Explore 8 Dynamic Business Sectors
          </h2>
          <p className="text-sm sm:text-base text-slate-500">
            Meet leading manufacturers, distributors, consultants, and developers under one mega roof.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {BUSINESS_CATEGORIES.map((category) => (
            <div
              key={category.id}
              className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-card hover:shadow-card-hover hover:border-brand-300 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4 group-hover:bg-brand-500 group-hover:text-white transition-colors duration-200">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900 mb-1">
                {category.label}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {category.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Venue & Event Highlights */}
      <section id="venue" className="bg-slate-900 text-white py-16 sm:py-20 rounded-3xl mx-4 sm:mx-6 lg:mx-8 relative overflow-hidden scroll-mt-24">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="container mx-auto px-4 sm:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-extrabold uppercase tracking-widest text-brand-400 bg-brand-500/10 px-3 py-1 rounded-full border border-brand-500/30">
                Visitor Experience
              </span>
              <h2 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight leading-tight">
                Why Attend <span className="text-brand-400">ONEZONE 2K26</span>
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Whether you are building your dream home, exploring new franchise business partnerships, or sourcing industrial materials, ONEZONE 2K26 offers the largest trade platform in Coimbatore.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {[
                  '200+ Verified Exhibitors',
                  'Exclusive Expo-Only Deals',
                  'Direct B2B Manufacturer Connect',
                  'Live Product Demonstrations',
                  'Free Entry Pass Registration',
                  'B2B Networking Opportunities'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-sm text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-brand-400 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <a
                  href="#register"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-brand-500 to-amber-500 text-white font-bold text-sm shadow-lg shadow-brand-500/30 hover:from-brand-600 hover:to-amber-600 transition-all"
                >
                  <span>Register for Free Entry Pass</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Venue Card Box */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                <div>
                  <h3 className="font-display font-bold text-xl text-white">Event Venue</h3>
                  <p className="text-xs text-brand-400">{EVENT_DETAILS.venue}</p>
                </div>
                <span className="text-xs font-mono bg-slate-900 text-slate-300 px-3 py-1 rounded-lg border border-slate-700">
                  Hall B
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {EVENT_DETAILS.venueAddress}
              </p>

              <div className="space-y-2 text-xs text-slate-400">
                <div className="flex justify-between py-1 border-b border-slate-700/50">
                  <span>Exhibition Dates:</span>
                  <span className="text-white font-semibold">{EVENT_DETAILS.dates}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-700/50">
                  <span>Visiting Hours:</span>
                  <span className="text-white font-semibold">{EVENT_DETAILS.timing}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-700/50">
                  <span>Parking:</span>
                  <span className="text-emerald-400 font-semibold">Ample Parking Available</span>
                </div>
              </div>

              <a
                href={EVENT_DETAILS.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-slate-700/80 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors border border-slate-600"
              >
                <span>View on Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
