import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  RefreshCw, 
  Download 
} from 'lucide-react';
import { getAllRegistrations, toggleCheckInStatus, deleteRegistration } from '../../lib/storage';
import { RegistrationTable } from '../../components/admin/RegistrationTable';
import { OnSpotRegistrationModal } from '../../components/admin/OnSpotRegistrationModal';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';

export function AdminRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onSpotOpen, setOnSpotOpen] = useState(false);
  const { success: toastSuccess } = useToast();

  const loadData = async () => {
    setLoading(true);
    const data = await getAllRegistrations();
    setRegistrations(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleCheckIn = async (regId, currentStatus) => {
    const res = await toggleCheckInStatus(regId, currentStatus);
    if (res.success) {
      setRegistrations(prev => prev.map(r => r.registration_id === regId ? res.data : r));
      toastSuccess(`Updated check-in status for ${res.data.name || res.data.full_name}`);
    }
  };

  const handleDelete = async (regId) => {
    await deleteRegistration(regId);
    setRegistrations(prev => prev.filter(r => r.registration_id !== regId));
    toastSuccess(`Deleted registration ${regId}`);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
            Visitor Registrations Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Full database of registered attendees, marketing channels, and check-in statuses
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="primary"
            onClick={() => setOnSpotOpen(true)}
            icon={Plus}
            className="text-xs font-bold"
          >
            New Registration
          </Button>
        </div>
      </div>

      {/* Main Table */}
      <RegistrationTable
        registrations={registrations}
        loading={loading}
        onRefresh={loadData}
        onToggleCheckIn={handleToggleCheckIn}
        onDelete={handleDelete}
        onAddOnSpot={() => setOnSpotOpen(true)}
      />

      {/* On-Spot Registration Modal */}
      <OnSpotRegistrationModal
        isOpen={onSpotOpen}
        onClose={() => setOnSpotOpen(false)}
        onSuccess={(data) => {
          loadData();
          toastSuccess(`Registered ${data.full_name} (${data.registration_id}) successfully!`);
        }}
      />

    </div>
  );
}
