import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="py-24 max-w-md mx-auto px-4 text-center space-y-6">
      <div className="w-20 h-20 rounded-3xl bg-brand-50 border border-brand-200 text-brand-600 mx-auto flex items-center justify-center font-display font-black text-3xl shadow-lg shadow-brand-500/10">
        404
      </div>
      <div>
        <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
          Page Not Found
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          The page you are looking for might have been moved or does not exist.
        </p>
      </div>
      <div className="pt-2">
        <Link to="/">
          <Button variant="primary" icon={Home} className="font-bold">
            Return to Event Homepage
          </Button>
        </Link>
      </div>
    </div>
  );
}
