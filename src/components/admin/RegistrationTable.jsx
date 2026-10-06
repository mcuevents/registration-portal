import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Users, 
  Calendar,
  Plus,
  RefreshCw,
  X,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  SlidersHorizontal
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { BUSINESS_CATEGORIES } from '../../lib/constants';
import { formatDateTime, exportToCsv } from '../../lib/utils';
import { RegistrationModal } from './RegistrationModal';

export function RegistrationTable({
  registrations = [],
  loading = false,
  onRefresh,
  onToggleCheckIn,
  onDelete,
  onAddOnSpot,
  categoryFilter: externalCategoryFilter,
  onCategoryFilterChange
}) {
  const [internalCategoryFilter, setInternalCategoryFilter] = useState('ALL');
  const categoryFilter = externalCategoryFilter !== undefined ? externalCategoryFilter : internalCategoryFilter;
  const setCategoryFilter = onCategoryFilterChange || setInternalCategoryFilter;

  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('ALL'); // ALL, TODAY, YESTERDAY, LAST_7_DAYS, LAST_30_DAYS, CUSTOM_SINGLE, CUSTOM_RANGE
  const [customDate, setCustomDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, CHECKED_IN, PENDING
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('DATE_DESC'); // DATE_DESC, DATE_ASC, NAME_ASC, NAME_DESC, VISITORS_DESC
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [copiedId, setCopiedId] = useState(null);
  const [selectedReg, setSelectedReg] = useState(null);

  // Available sources from registrations
  const availableSources = useMemo(() => {
    const set = new Set();
    registrations.forEach(r => {
      if (r.source) set.add(r.source.toLowerCase());
    });
    return Array.from(set);
  }, [registrations]);

  // Copy Pass ID helper
  const handleCopyPassId = (passId, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(passId);
    setCopiedId(passId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered & Searched Registrations
  const filteredRegistrations = useMemo(() => {
    const now = new Date();
    const todayYear = now.getFullYear();
    const todayMonth = now.getMonth();
    const todayDate = now.getDate();

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayYear = yesterday.getFullYear();
    const yesterdayMonth = yesterday.getMonth();
    const yesterdayDate = yesterday.getDate();

    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 3600 * 1000);

    return registrations.filter(r => {
      const regName = r.name || r.full_name || '';
      const regMobile = r.mobile || r.mobile_number || '';
      const regEmail = r.email || '';
      const regId = r.registration_id || '';
      const regCompany = r.company || r.company_name || '';
      const regCity = r.city || '';
      const regDesignation = r.designation || '';
      const regCategory = r.category || r.business_category || '';
      const regSource = (r.source || 'direct').toLowerCase();
      const isCheckedIn = Boolean(r.check_in_status !== undefined ? r.check_in_status : r.checked_in);
      
      const regCreatedAt = r.created_at ? new Date(r.created_at) : null;
      const isValidDate = regCreatedAt && !isNaN(regCreatedAt.getTime());

      // 1. Search Query (Name, Mobile, Email, Pass ID, Company, City, Designation)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const cleanMobile = regMobile.replace(/[^\d]/g, '');
        const cleanQuery = q.replace(/[^\d]/g, '');

        const matchName = regName.toLowerCase().includes(q);
        const matchMobile = cleanQuery.length >= 3 && cleanMobile.includes(cleanQuery);
        const matchEmail = regEmail.toLowerCase().includes(q);
        const matchId = regId.toLowerCase().includes(q);
        const matchCompany = regCompany.toLowerCase().includes(q);
        const matchCity = regCity.toLowerCase().includes(q);
        const matchDesignation = regDesignation.toLowerCase().includes(q);
        const matchCategory = regCategory.toLowerCase().includes(q);

        if (!matchName && !matchMobile && !matchEmail && !matchId && !matchCompany && !matchCity && !matchDesignation && !matchCategory) {
          return false;
        }
      }

      // 2. Category Filter
      if (categoryFilter !== 'ALL' && regCategory !== categoryFilter) {
        return false;
      }

      // 3. Date Filter
      if (dateFilter === 'TODAY') {
        if (!isValidDate) return false;
        if (regCreatedAt.getFullYear() !== todayYear || 
            regCreatedAt.getMonth() !== todayMonth || 
            regCreatedAt.getDate() !== todayDate) {
          return false;
        }
      } else if (dateFilter === 'YESTERDAY') {
        if (!isValidDate) return false;
        if (regCreatedAt.getFullYear() !== yesterdayYear || 
            regCreatedAt.getMonth() !== yesterdayMonth || 
            regCreatedAt.getDate() !== yesterdayDate) {
          return false;
        }
      } else if (dateFilter === 'LAST_7_DAYS') {
        if (!isValidDate || regCreatedAt < sevenDaysAgo) return false;
      } else if (dateFilter === 'LAST_30_DAYS') {
        if (!isValidDate || regCreatedAt < thirtyDaysAgo) return false;
      } else if (dateFilter === 'CUSTOM_SINGLE' && customDate) {
        if (!isValidDate) return false;
        const [cYear, cMonth, cDay] = customDate.split('-').map(Number);
        if (regCreatedAt.getFullYear() !== cYear || 
            regCreatedAt.getMonth() !== (cMonth - 1) || 
            regCreatedAt.getDate() !== cDay) {
          return false;
        }
      } else if (dateFilter === 'CUSTOM_RANGE') {
        if (!isValidDate) return false;
        if (startDate) {
          const start = new Date(startDate + 'T00:00:00');
          if (regCreatedAt < start) return false;
        }
        if (endDate) {
          const end = new Date(endDate + 'T23:59:59');
          if (regCreatedAt > end) return false;
        }
      }

      // 4. Status Filter
      if (statusFilter === 'CHECKED_IN' && !isCheckedIn) return false;
      if (statusFilter === 'PENDING' && isCheckedIn) return false;

      // 5. Source Filter
      if (sourceFilter !== 'ALL' && regSource !== sourceFilter) {
        return false;
      }

      return true;
    });
  }, [registrations, searchQuery, categoryFilter, dateFilter, customDate, startDate, endDate, statusFilter, sourceFilter]);

  // Sorted Registrations
  const sortedRegistrations = useMemo(() => {
    const list = [...filteredRegistrations];
    list.sort((a, b) => {
      if (sortBy === 'DATE_DESC') {
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      }
      if (sortBy === 'DATE_ASC') {
        return new Date(a.created_at || 0) - new Date(b.created_at || 0);
      }
      if (sortBy === 'NAME_ASC') {
        const nameA = a.name || a.full_name || '';
        const nameB = b.name || b.full_name || '';
        return nameA.localeCompare(nameB);
      }
      if (sortBy === 'NAME_DESC') {
        const nameA = a.name || a.full_name || '';
        const nameB = b.name || b.full_name || '';
        return nameB.localeCompare(nameA);
      }
      if (sortBy === 'VISITORS_DESC') {
        const vA = a.visitor_count || a.number_of_visitors || 1;
        const vB = b.visitor_count || b.number_of_visitors || 1;
        return vB - vA;
      }
      return 0;
    });
    return list;
  }, [filteredRegistrations, sortBy]);

  // Paginated records
  const totalPages = Math.max(1, Math.ceil(sortedRegistrations.length / pageSize));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const paginatedRegistrations = useMemo(() => {
    if (pageSize >= 9999) return sortedRegistrations;
    const startIdx = (currentPageSafe - 1) * pageSize;
    return sortedRegistrations.slice(startIdx, startIdx + pageSize);
  }, [sortedRegistrations, currentPageSafe, pageSize]);

  // Export to CSV
  const handleExport = () => {
    const exportData = sortedRegistrations.map(r => ({
      'Registration ID': r.registration_id,
      'Full Name': r.name || r.full_name,
      'Mobile Number': r.mobile || r.mobile_number,
      'Email': r.email,
      'City': r.city || 'Coimbatore',
      'Company Name': r.company || r.company_name || '',
      'Designation': r.designation || '',
      'Business Category': r.category || r.business_category,
      'Number of Visitors': r.visitor_count || r.number_of_visitors || 1,
      'Check-in Status': (r.check_in_status || r.checked_in) ? 'Checked In' : 'Pending',
      'Source Channel': r.source || 'direct',
      'Campaign': r.campaign || '',
      'Creative': r.creative || '',
      'Registration Date': formatDateTime(r.created_at)
    }));
    exportToCsv('ONEZONE_2K26_Registrations', exportData);
  };

  const hasActiveFilters = Boolean(
    searchQuery || 
    categoryFilter !== 'ALL' || 
    dateFilter !== 'ALL' || 
    statusFilter !== 'ALL' || 
    sourceFilter !== 'ALL'
  );

  const handleClearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('ALL');
    setDateFilter('ALL');
    setCustomDate('');
    setStartDate('');
    setEndDate('');
    setStatusFilter('ALL');
    setSourceFilter('ALL');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      
      {/* Search, Filter & Action Bar Card */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        
        {/* Row 1: Search & Action Buttons */}
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          
          {/* Real-time Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Name, Mobile, Email, Pass ID, Company, City, Sector..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-9 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <Button
              size="sm"
              variant="secondary"
              onClick={onRefresh}
              loading={loading}
              icon={RefreshCw}
              className="text-xs"
            >
              Refresh
            </Button>

            <Button
              size="sm"
              variant="primary"
              onClick={handleExport}
              disabled={sortedRegistrations.length === 0}
              icon={Download}
              className="text-xs font-bold shadow-md shadow-brand-500/20"
              title="Download filtered registrations as CSV spreadsheet"
            >
              Export CSV ({sortedRegistrations.length})
            </Button>

            {onAddOnSpot && (
              <Button
                size="sm"
                variant="dark"
                onClick={onAddOnSpot}
                icon={Plus}
                className="text-xs font-bold"
              >
                Walk-in Entry
              </Button>
            )}
          </div>
        </div>

        {/* Row 2: Category, Date, Status, Source Filters & Sorting */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-3 border-t border-slate-100">
          
          {/* Category Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <span>Sector Category</span>
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className={`w-full text-xs font-medium border rounded-xl px-3 py-2 focus:outline-none transition-colors ${
                categoryFilter !== 'ALL' 
                  ? 'bg-brand-50 border-brand-300 text-brand-900 font-bold' 
                  : 'bg-slate-50 border-slate-200 text-slate-700 focus:border-brand-500'
              }`}
            >
              <option value="ALL">All Categories ({registrations.length})</option>
              {BUSINESS_CATEGORIES.map(c => {
                const count = registrations.filter(r => (r.category || r.business_category) === c.label).length;
                return (
                  <option key={c.id} value={c.label}>
                    {c.label} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Registration Date</label>
            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className={`w-full text-xs font-medium border rounded-xl px-3 py-2 focus:outline-none transition-colors ${
                dateFilter !== 'ALL' 
                  ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold' 
                  : 'bg-slate-50 border-slate-200 text-slate-700 focus:border-brand-500'
              }`}
            >
              <option value="ALL">All Dates</option>
              <option value="TODAY">Today's Signups</option>
              <option value="YESTERDAY">Yesterday</option>
              <option value="LAST_7_DAYS">Last 7 Days</option>
              <option value="LAST_30_DAYS">Last 30 Days</option>
              <option value="CUSTOM_SINGLE">Specific Single Date</option>
              <option value="CUSTOM_RANGE">Date Range (From - To)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Gate Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className={`w-full text-xs font-medium border rounded-xl px-3 py-2 focus:outline-none transition-colors ${
                statusFilter !== 'ALL' 
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold' 
                  : 'bg-slate-50 border-slate-200 text-slate-700 focus:border-brand-500'
              }`}
            >
              <option value="ALL">All Status</option>
              <option value="CHECKED_IN">Checked In Only</option>
              <option value="PENDING">Pending Check-in</option>
            </select>
          </div>

          {/* Source Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Marketing Channel</label>
            <select
              value={sourceFilter}
              onChange={(e) => {
                setSourceFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-brand-500 text-slate-700"
            >
              <option value="ALL">All Channels</option>
              {availableSources.map(s => (
                <option key={s} value={s}>{s.toUpperCase()}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Sort Order</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-brand-500 text-slate-700"
            >
              <option value="DATE_DESC">Newest First</option>
              <option value="DATE_ASC">Oldest First</option>
              <option value="NAME_ASC">Name (A → Z)</option>
              <option value="NAME_DESC">Name (Z → A)</option>
              <option value="VISITORS_DESC">Visitors Count (High → Low)</option>
            </select>
          </div>

        </div>

        {/* Custom Date Pickers if active */}
        {dateFilter === 'CUSTOM_SINGLE' && (
          <div className="pt-2 flex items-center gap-2 animate-fadeIn text-xs">
            <span className="text-slate-500 font-medium">Select Date:</span>
            <input
              type="date"
              value={customDate}
              onChange={(e) => { setCustomDate(e.target.value); setCurrentPage(1); }}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-brand-500"
            />
          </div>
        )}

        {dateFilter === 'CUSTOM_RANGE' && (
          <div className="pt-2 flex flex-wrap items-center gap-2 animate-fadeIn text-xs">
            <span className="text-slate-500 font-medium">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-brand-500"
            />
            <span className="text-slate-500 font-medium">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-brand-500"
            />
          </div>
        )}

      </div>

      {/* Results Count & Reset Controls */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong>{sortedRegistrations.length}</strong> of {registrations.length} registrations
          {hasActiveFilters && <span className="text-brand-600 font-semibold ml-1">(Filtered)</span>}
        </span>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 font-bold transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        )}
      </div>

      {/* Main Registrations Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/90 text-[11px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="py-3.5 px-4">Pass ID</th>
                <th className="py-3.5 px-4">Attendee & Company</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Sector Category</th>
                <th className="py-3.5 px-4 text-center">Visitors</th>
                <th className="py-3.5 px-4">Registered On</th>
                <th className="py-3.5 px-4">Gate Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedRegistrations.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-16 text-center text-slate-400">
                    <div className="max-w-xs mx-auto space-y-2">
                      <p className="text-sm font-semibold text-slate-600">No matching registrations found</p>
                      <p className="text-xs text-slate-400">Try adjusting your search keywords, category, or date range.</p>
                      {hasActiveFilters && (
                        <button
                          onClick={handleClearFilters}
                          className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Clear Active Filters</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRegistrations.map((reg) => {
                  const regName = reg.name || reg.full_name;
                  const regMobile = reg.mobile || reg.mobile_number;
                  const regCompany = reg.company || reg.company_name;
                  const regCategory = reg.category || reg.business_category;
                  const regVisitors = reg.visitor_count || reg.number_of_visitors || 1;
                  const isCheckedIn = Boolean(reg.check_in_status !== undefined ? reg.check_in_status : reg.checked_in);
                  const isCopied = copiedId === reg.registration_id;

                  return (
                    <tr 
                      key={reg.id || reg.registration_id} 
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => setSelectedReg(reg)}
                    >
                      
                      {/* Pass ID with copy button */}
                      <td className="py-3.5 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex items-center gap-1 bg-slate-100/90 text-slate-900 px-2.5 py-1 rounded-md border border-slate-200">
                          <span className="font-mono font-bold text-xs">
                            {reg.registration_id}
                          </span>
                          <button
                            onClick={(e) => handleCopyPassId(reg.registration_id, e)}
                            className="text-slate-400 hover:text-slate-700 transition-colors ml-0.5"
                            title="Copy Pass ID"
                          >
                            {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </td>

                      {/* Visitor Name & Company */}
                      <td className="py-3.5 px-4">
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                            {regName}
                          </div>
                          {(regCompany || reg.designation) && (
                            <div className="text-xs text-slate-500 line-clamp-1">
                              {reg.designation && <span className="font-medium">{reg.designation}, </span>}
                              <span>{regCompany}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-3.5 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="text-xs space-y-0.5">
                          <div>
                            <a href={`tel:${regMobile}`} className="font-semibold text-slate-800 hover:text-brand-600">
                              {regMobile}
                            </a>
                          </div>
                          <div className="text-slate-400 truncate max-w-[150px]">
                            <a href={`mailto:${reg.email}`} className="hover:text-slate-700">
                              {reg.email}
                            </a>
                          </div>
                        </div>
                      </td>

                      {/* Sector Category */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <Badge variant="brand" className="text-[11px] font-semibold">
                          {regCategory}
                        </Badge>
                      </td>

                      {/* Visitors Count */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 font-bold text-xs bg-slate-100 px-2.5 py-1 rounded-full text-slate-700">
                          <Users className="w-3 h-3 opacity-60" />
                          {regVisitors}
                        </span>
                      </td>

                      {/* Registered Date & Time */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-500">
                        {formatDateTime(reg.created_at)}
                      </td>

                      {/* Check-In Status Toggle */}
                      <td className="py-3.5 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onToggleCheckIn(reg.registration_id, isCheckedIn)}
                          className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border transition-all ${
                            isCheckedIn
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 shadow-sm'
                              : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200'
                          }`}
                          title="Click to toggle check-in status"
                        >
                          {isCheckedIn ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Checked In</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>Pending</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedReg(reg)}
                            className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                            title="View Full Registration Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete registration for ${regName} (${reg.registration_id})?`)) {
                                onDelete(reg.registration_id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Registration"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Rows-Per-Page Footer */}
        {sortedRegistrations.length > 0 && (
          <div className="bg-slate-50/80 px-4 py-3 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none focus:border-brand-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={9999}>All ({sortedRegistrations.length})</option>
              </select>

              <span className="text-slate-400 pl-2">
                Page {currentPageSafe} of {totalPages}
              </span>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPageSafe <= 1}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Page Number Pills (up to 5 pages) */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pNum = i + 1;
                if (totalPages > 5 && currentPageSafe > 3) {
                  pNum = currentPageSafe - 2 + i;
                  if (pNum > totalPages) pNum = totalPages - (4 - i);
                }
                return (
                  <button
                    key={pNum}
                    onClick={() => setCurrentPage(pNum)}
                    className={`min-w-[28px] h-7 px-2 text-xs font-bold rounded-lg transition-all ${
                      currentPageSafe === pNum
                        ? 'bg-brand-500 text-white shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {pNum}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPageSafe >= totalPages}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Attendee Details Modal */}
      <RegistrationModal
        registration={selectedReg}
        isOpen={Boolean(selectedReg)}
        onClose={() => setSelectedReg(null)}
        onToggleCheckIn={async (id, currentStatus) => {
          await onToggleCheckIn(id, currentStatus);
          setSelectedReg(prev => prev ? { ...prev, check_in_status: !currentStatus, checked_in: !currentStatus } : null);
        }}
        onDelete={onDelete}
      />

    </div>
  );
}
