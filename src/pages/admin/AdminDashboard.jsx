import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  TrendingUp, 
  QrCode, 
  Download, 
  Plus, 
  RefreshCw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Building
} from 'lucide-react';
import { getAllRegistrations, calculateMetrics, toggleCheckInStatus, deleteRegistration } from '../../lib/storage';
import { StatCard } from '../../components/admin/StatCard';
import { AnalyticsChart } from '../../components/admin/AnalyticsChart';
import { RegistrationTable } from '../../components/admin/RegistrationTable';
import { OnSpotRegistrationModal } from '../../components/admin/OnSpotRegistrationModal';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { EVENT_DETAILS } from '../../lib/constants';

export function AdminDashboard() {
  const navigate = useNavigate();
  const { success: toastSuccess } = useToast();

  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onSpotOpen, setOnSpotOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const loadData = async () => {
    setLoading(true);
    const data = await getAllRegistrations();
    setRegistrations(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const metrics = calculateMetrics(registrations);

  const handleToggleCheckIn = async (regId, currentStatus) => {
    const res = await toggleCheckInStatus(regId, currentStatus);
    if (res.success) {
      setRegistrations(prev => prev.map(r => r.registration_id === regId ? res.data : r));
      toastSuccess(`Updated status for ${res.data.name || res.data.full_name}`);
    }
  };

  const handleDelete = async (regId) => {
    await deleteRegistration(regId);
    setRegistrations(prev => prev.filter(r => r.registration_id !== regId));
    toastSuccess(`Deleted registration ${regId}`);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Welcome & Fast CTAs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
              Executive Event Dashboard
            </h1>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-brand-50 text-brand-600 border border-brand-200">
              ONEZONE 2K26
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time registrations, gate footfall analytics & marketing attribution for CODISSIA Hall B
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            size="sm"
            variant="secondary"
            onClick={loadData}
            loading={loading}
            icon={RefreshCw}
            className="text-xs"
          >
            Refresh Data
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={() => setOnSpotOpen(true)}
            icon={Plus}
            className="text-xs font-bold shadow-md shadow-brand-500/20"
          >
            On-Spot Walk-In
          </Button>

          <Link
            to="/admin/scan"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-md transition-all"
          >
            <QrCode className="w-4 h-4 text-brand-400" />
            <span>Open Gate Scanner</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <StatCard
          title="Total Registrations"
          value={metrics.totalRegistrations}
          subvalue={`across ${Object.values(metrics.categoryCounts).filter(c => c > 0).length} sectors`}
          icon={Users}
          color="brand"
          trendLabel="All-time registered attendees"
        />

        <StatCard
          title="Today's Registrations"
          value={metrics.todayRegistrations}
          icon={Calendar}
          color="amber"
          trendLabel="New signups recorded today"
        />

        <StatCard
          title="Total Visitors Expected"
          value={metrics.totalVisitorsExpected}
          subvalue="including guest passes"
          icon={Building}
          color="blue"
          trendLabel="Projected total footfall"
        />

        <StatCard
          title="Gate Check-in Rate"
          value={`${metrics.checkedInCount} (${metrics.checkInRatePercent}%)`}
          subvalue={`${metrics.checkedInVisitorsCount} admitted`}
          icon={UserCheck}
          color="emerald"
          trendLabel="Verified at Hall B gates"
        />

      </div>

      {/* Analytics Charts: Category Breakdown & Marketing Attribution */}
      <AnalyticsChart
        categoryCounts={metrics.categoryCounts}
        sourceCounts={metrics.sourceCounts}
        campaignCounts={metrics.campaignCounts}
        total={metrics.totalRegistrations}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
      />

      {/* Registrations Management Table Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-xl text-slate-900">
              Visitor Registrations Directory
            </h3>
            <p className="text-xs text-slate-400">Search, filter by sector & date, view attendee details, or export to CSV</p>
          </div>

          <Link
            to="/admin/registrations"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 hover:underline"
          >
            <span>Full-Screen Directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <RegistrationTable
          registrations={registrations}
          loading={loading}
          onRefresh={loadData}
          onToggleCheckIn={handleToggleCheckIn}
          onDelete={handleDelete}
          onAddOnSpot={() => setOnSpotOpen(true)}
          categoryFilter={selectedCategory}
          onCategoryFilterChange={(cat) => setSelectedCategory(cat)}
        />
      </div>

      {/* On Spot Registration Modal */}
      <OnSpotRegistrationModal
        isOpen={onSpotOpen}
        onClose={() => setOnSpotOpen(false)}
        onSuccess={(newRecord) => {
          loadData();
          toastSuccess(`Registered ${newRecord.full_name || newRecord.name} (${newRecord.registration_id}) successfully!`);
        }}
      />

    </div>
  );
}
