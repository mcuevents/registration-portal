import { supabase, isSupabaseConfigured } from './supabase';
import { generateRegistrationId, sanitizePhoneNumber, isValidEmail, isValidMobile } from './utils';
import { BUSINESS_CATEGORIES } from './constants';

const LOCAL_STORAGE_KEY = 'onezone_2k26_registrations_v2';

// Valid category set
const VALID_CATEGORIES = new Set(BUSINESS_CATEGORIES.map(c => c.label));

// Helper to normalize record format
function normalizeRecord(item) {
  if (!item) return null;
  return {
    id: item.id || `local-${item.registration_id}`,
    registration_id: (item.registration_id || '').toUpperCase().trim(),
    name: (item.name || item.full_name || '').trim(),
    full_name: (item.name || item.full_name || '').trim(),
    mobile: sanitizePhoneNumber(item.mobile || item.mobile_number),
    mobile_number: sanitizePhoneNumber(item.mobile || item.mobile_number),
    email: (item.email || '').toLowerCase().trim(),
    city: (item.city || 'Coimbatore').trim(),
    company: (item.company || item.company_name || '').trim(),
    company_name: (item.company || item.company_name || '').trim(),
    designation: (item.designation || '').trim(),
    category: item.category || item.business_category || 'Real Estate',
    business_category: item.category || item.business_category || 'Real Estate',
    visitor_count: Math.min(20, Math.max(1, parseInt(item.visitor_count || item.number_of_visitors, 10) || 1)),
    number_of_visitors: Math.min(20, Math.max(1, parseInt(item.visitor_count || item.number_of_visitors, 10) || 1)),
    source: (item.source || 'direct').toLowerCase().trim().slice(0, 50),
    campaign: (item.campaign || '').trim().slice(0, 100),
    creative: (item.creative || '').trim().slice(0, 100),
    check_in_status: Boolean(item.check_in_status !== undefined ? item.check_in_status : item.checked_in),
    checked_in: Boolean(item.check_in_status !== undefined ? item.check_in_status : item.checked_in),
    checked_in_at: item.checked_in_at || ((item.check_in_status || item.checked_in) ? (item.updated_at || item.created_at) : null),
    checked_in_by: item.checked_in_by || 'Gate Staff',
    created_at: item.created_at || new Date().toISOString(),
    updated_at: item.updated_at || item.created_at || new Date().toISOString()
  };
}

// Development seed registrations (active ONLY in unconfigured local demo mode)
const DEV_SEED_REGISTRATIONS = [
  {
    id: 'seed-1',
    registration_id: 'OZ26-48921A',
    name: 'Arunachalam Sundaram',
    mobile: '9876543210',
    email: 'arun.sundaram@apexinfra.com',
    city: 'Coimbatore',
    company: 'Apex Infra Solutions',
    designation: 'Managing Director',
    category: 'Real Estate',
    visitor_count: 2,
    source: 'instagram',
    campaign: 'realestate_reels',
    creative: 'reel01',
    check_in_status: false,
    created_at: new Date(Date.now() - 36 * 3600 * 1000).toISOString()
  },
  {
    id: 'seed-2',
    registration_id: 'OZ26-92147B',
    name: 'Priya Dharshini R',
    mobile: '9841234567',
    email: 'priya.vibe@studiovibe.in',
    city: 'Tirupur',
    company: 'Studio Vibe Designs',
    designation: 'Principal Architect',
    category: 'Interior Designing',
    visitor_count: 1,
    source: 'linkedin',
    campaign: 'b2b_networking',
    creative: 'expo_banner',
    check_in_status: true,
    checked_in_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'seed-3',
    registration_id: 'OZ26-31054C',
    name: 'Karthik Raja M',
    mobile: '9789012345',
    email: 'karthik.build@karthikbuilders.co.in',
    city: 'Salem',
    company: 'Karthik Builders & Developers',
    designation: 'Project Head',
    category: 'Construction',
    visitor_count: 3,
    source: 'google',
    campaign: 'search_coimbatore',
    creative: 'ad_text1',
    check_in_status: false,
    created_at: new Date(Date.now() - 14 * 3600 * 1000).toISOString()
  },
  {
    id: 'seed-4',
    registration_id: 'OZ26-55291D',
    name: 'Deepak Varma',
    mobile: '9443219870',
    email: 'deepak.v@ceramicarts.in',
    city: 'Coimbatore',
    company: 'Apex Ceramic & Building Materials',
    designation: 'Director of Procurement',
    category: 'Building Materials',
    visitor_count: 2,
    source: 'whatsapp',
    campaign: 'trade_invite_2026',
    creative: 'flyer_v1',
    check_in_status: true,
    checked_in_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  }
].map(normalizeRecord);

function getLocalRegistrations() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      // In production or when Supabase is configured, start empty to avoid fake data
      if (isSupabaseConfigured) {
        return [];
      }
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEV_SEED_REGISTRATIONS));
      return DEV_SEED_REGISTRATIONS;
    }
    return JSON.parse(raw).map(normalizeRecord);
  } catch (err) {
    console.error('Error reading localStorage registrations:', err);
    return isSupabaseConfigured ? [] : DEV_SEED_REGISTRATIONS;
  }
}

function saveLocalRegistrations(list) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Error writing to localStorage:', err);
  }
}

/**
 * Register a new visitor & securely persist into Supabase (or local dev store)
 */
export async function createRegistration(payload) {
  // 1. Strict input validation & sanitization
  const cleanName = (payload.name || payload.full_name || '').trim().slice(0, 100);
  const cleanMobile = sanitizePhoneNumber(payload.mobile || payload.mobile_number);
  const cleanEmail = (payload.email || '').toLowerCase().trim().slice(0, 150);
  const cleanCity = (payload.city || 'Coimbatore').trim().slice(0, 100);
  const cleanCompany = (payload.company || payload.company_name || '').trim().slice(0, 150);
  const cleanDesignation = (payload.designation || '').trim().slice(0, 100);
  
  let cleanCategory = payload.category || payload.business_category || 'Real Estate';
  if (!VALID_CATEGORIES.has(cleanCategory)) {
    cleanCategory = 'Real Estate';
  }

  const cleanVisitors = Math.min(20, Math.max(1, parseInt(payload.visitor_count || payload.number_of_visitors, 10) || 1));
  const cleanSource = (payload.source || 'direct').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 50) || 'direct';
  const cleanCampaign = (payload.campaign || '').replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().slice(0, 100);
  const cleanCreative = (payload.creative || '').replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().slice(0, 100);

  if (cleanName.length < 2) {
    return { success: false, error: 'Full name must be at least 2 characters.' };
  }
  if (!isValidMobile(cleanMobile)) {
    return { success: false, error: 'Please enter a valid 10-digit mobile number.' };
  }
  if (!isValidEmail(cleanEmail)) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  const regId = payload.registration_id || generateRegistrationId();
  const nowIso = new Date().toISOString();

  const dbRecord = {
    registration_id: regId,
    name: cleanName,
    mobile: cleanMobile,
    email: cleanEmail,
    city: cleanCity,
    company: cleanCompany,
    designation: cleanDesignation,
    category: cleanCategory,
    visitor_count: cleanVisitors,
    source: cleanSource,
    campaign: cleanCampaign,
    creative: cleanCreative,
    check_in_status: false,
    created_at: nowIso,
    updated_at: nowIso
  };

  // 2. Persist to Supabase when configured
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .insert([dbRecord])
        .select()
        .single();

      if (error) {
        console.error('Supabase registration insert error:', error.message);
        // Do NOT silently fake success in localStorage if Supabase is configured
        return { 
          success: false, 
          error: error.message?.includes('duplicate') 
            ? 'A registration with this pass ID already exists. Please try again.' 
            : 'Unable to save registration to server. Please check your internet connection and try again.' 
        };
      }

      if (data) {
        const normalized = normalizeRecord(data);
        // Keep local cache in sync for instant offline recovery
        const locals = getLocalRegistrations();
        saveLocalRegistrations([normalized, ...locals.filter(r => r.registration_id !== normalized.registration_id)]);
        return { success: true, data: normalized, source: 'supabase' };
      }
    } catch (e) {
      console.error('Supabase registration exception:', e);
      return { 
        success: false, 
        error: 'Network connection failed. Please check your connection and try again.' 
      };
    }
  }

  // 3. Fallback to Local Storage ONLY in unconfigured local development mode
  const locals = getLocalRegistrations();
  const localRecord = normalizeRecord({
    id: `local-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    ...dbRecord
  });
  locals.unshift(localRecord);
  saveLocalRegistrations(locals);

  return { success: true, data: localRecord, source: 'local' };
}

/**
 * Fetch registration by registration_id or UUID
 */
export async function getRegistrationByCode(code) {
  if (!code) return null;
  const cleanCode = code.trim().toUpperCase();

  if (isSupabaseConfigured && supabase) {
    try {
      // First try secure RPC if available
      const { data: rpcData, error: rpcError } = await supabase.rpc('lookup_pass_secure', { p_query: cleanCode });
      if (!rpcError && rpcData && rpcData.length > 0) {
        return normalizeRecord(rpcData[0]);
      }

      // Fallback query
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('registration_id', cleanCode)
        .maybeSingle();

      if (!error && data) return normalizeRecord(data);
    } catch (e) {
      console.warn('Supabase pass lookup error:', e);
    }
  }

  const locals = getLocalRegistrations();
  const match = locals.find(
    r => r.registration_id?.toUpperCase() === cleanCode || r.id === code
  );
  return match ? normalizeRecord(match) : null;
}

/**
 * Search registrations by contact (exact match to prevent broad data enumeration)
 */
export async function searchRegistrationsByContact(contactQuery) {
  if (!contactQuery) return [];
  const clean = contactQuery.trim();
  const cleanLower = clean.toLowerCase();
  const cleanPhone = sanitizePhoneNumber(contactQuery);

  if (clean.length < 5) return [];

  if (isSupabaseConfigured && supabase) {
    try {
      // 1. Try secure stored procedure first
      const { data: rpcData, error: rpcError } = await supabase.rpc('lookup_pass_secure', { p_query: clean });
      if (!rpcError && Array.isArray(rpcData) && rpcData.length > 0) {
        return rpcData.map(normalizeRecord);
      }

      // 2. Strict exact match queries (NO broad %wildcard% enumeration)
      let query = supabase.from('registrations').select('*');
      if (cleanPhone.length >= 10) {
        query = query.eq('mobile', cleanPhone);
      } else if (isValidEmail(cleanLower)) {
        query = query.eq('email', cleanLower);
      } else {
        query = query.eq('registration_id', clean.toUpperCase());
      }
      
      const { data, error } = await query.order('created_at', { ascending: false }).limit(5);
      if (!error && data) return data.map(normalizeRecord);
    } catch (e) {
      console.warn('Supabase search error:', e);
    }
  }

  const locals = getLocalRegistrations();
  return locals.filter(r => {
    const phoneMatch = cleanPhone.length >= 10 && r.mobile === cleanPhone;
    const emailMatch = cleanLower.length >= 5 && r.email?.toLowerCase() === cleanLower;
    const idMatch = r.registration_id?.toUpperCase() === clean.toUpperCase();
    return phoneMatch || emailMatch || idMatch;
  });
}

/**
 * Fetch all registrations (Admin Only)
 */
export async function getAllRegistrations() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const normalizedList = data.map(normalizeRecord);
        saveLocalRegistrations(normalizedList);
        return normalizedList;
      }
      console.error('Supabase getAllRegistrations error:', error?.message);
    } catch (e) {
      console.warn('Supabase getAllRegistrations exception:', e);
    }
  }

  return getLocalRegistrations();
}

/**
 * Gate Check-in verification logic
 */
export async function performCheckIn(rawScanText, staffName = 'Gate Staff') {
  if (!rawScanText) {
    return { status: 'INVALID', message: 'No registration pass code provided.' };
  }

  let targetCode = rawScanText.trim();
  if (targetCode.includes('/pass/')) {
    const parts = targetCode.split('/pass/');
    targetCode = parts[parts.length - 1].split('?')[0].split('/')[0];
  } else if (targetCode.startsWith('{') && targetCode.endsWith('}')) {
    try {
      const parsed = JSON.parse(targetCode);
      if (parsed.regId || parsed.registration_id) {
        targetCode = parsed.regId || parsed.registration_id;
      }
    } catch (e) {}
  }

  targetCode = targetCode.toUpperCase();

  // Try atomic Supabase RPC if configured
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: rpcRes, error: rpcErr } = await supabase.rpc('verify_gate_check_in', {
        p_code: targetCode,
        p_staff_name: staffName
      });

      if (!rpcErr && rpcRes && rpcRes.status) {
        if (rpcRes.record) {
          rpcRes.record = normalizeRecord(rpcRes.record);
          // Sync local storage cache
          const locals = getLocalRegistrations();
          saveLocalRegistrations([rpcRes.record, ...locals.filter(r => r.registration_id !== rpcRes.record.registration_id)]);
        }
        return rpcRes;
      }
    } catch (e) {
      console.warn('Supabase checkin RPC failed, falling back to query:', e);
    }
  }

  // Fallback verification
  const record = await getRegistrationByCode(targetCode);
  if (!record) {
    return {
      status: 'INVALID',
      targetCode,
      message: `Invalid Pass. Registration ID "${targetCode}" was not found in the database. Please guide visitor to the Help Desk.`
    };
  }

  if (record.check_in_status || record.checked_in) {
    const prevTime = record.checked_in_at || record.updated_at || record.created_at;
    return {
      status: 'ALREADY_CHECKED_IN',
      record,
      previousCheckInTime: prevTime,
      message: `Pass already checked in on ${new Date(prevTime).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} at ${new Date(prevTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}.`
    };
  }

  const checkInTimestamp = new Date().toISOString();
  const updates = {
    check_in_status: true,
    checked_in: true,
    checked_in_at: checkInTimestamp,
    checked_in_by: staffName,
    updated_at: checkInTimestamp
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .update(updates)
        .eq('registration_id', record.registration_id)
        .select()
        .single();

      if (!error && data) {
        const normalized = normalizeRecord(data);
        const locals = getLocalRegistrations();
        saveLocalRegistrations(locals.map(r => r.registration_id === normalized.registration_id ? normalized : r));
        return {
          status: 'SUCCESS',
          record: normalized,
          message: `Check-in Verified! Welcome ${normalized.name || normalized.full_name}.`
        };
      }
    } catch (e) {
      console.warn('Supabase checkin fallback error:', e);
    }
  }

  const locals = getLocalRegistrations();
  const updatedRecord = normalizeRecord({ ...record, ...updates });
  saveLocalRegistrations(locals.map(r => r.registration_id === record.registration_id ? updatedRecord : r));

  return {
    status: 'SUCCESS',
    record: updatedRecord,
    message: `Check-in Verified! Welcome ${updatedRecord.name || updatedRecord.full_name}.`
  };
}

export async function toggleCheckInStatus(registrationId, currentStatus) {
  const newStatus = !currentStatus;
  const now = new Date().toISOString();
  const updates = {
    check_in_status: newStatus,
    checked_in: newStatus,
    checked_in_at: newStatus ? now : null,
    updated_at: now
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .update(updates)
        .eq('registration_id', registrationId)
        .select()
        .single();

      if (!error && data) {
        const normalized = normalizeRecord(data);
        const locals = getLocalRegistrations();
        saveLocalRegistrations(locals.map(r => r.registration_id === registrationId ? normalized : r));
        return { success: true, data: normalized };
      }
    } catch (e) {
      console.error('Supabase toggle checkin error:', e);
    }
  }

  const locals = getLocalRegistrations();
  const updatedLocals = locals.map(r => {
    if (r.registration_id === registrationId) {
      return normalizeRecord({ ...r, ...updates });
    }
    return r;
  });
  saveLocalRegistrations(updatedLocals);
  const found = updatedLocals.find(r => r.registration_id === registrationId);
  return { success: true, data: found };
}

export async function deleteRegistration(registrationId) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('registrations').delete().eq('registration_id', registrationId);
      if (error) {
        console.error('Supabase delete error:', error.message);
      }
    } catch (e) {
      console.error('Supabase delete exception:', e);
    }
  }

  const locals = getLocalRegistrations();
  saveLocalRegistrations(locals.filter(r => r.registration_id !== registrationId));
  return { success: true };
}

export function calculateMetrics(registrations = []) {
  const totalRegistrations = registrations.length;
  
  // Timezone-safe local calendar today matching
  const now = new Date();
  const todayYear = now.getFullYear();
  const todayMonth = now.getMonth();
  const todayDate = now.getDate();

  const todayRegistrations = registrations.filter(r => {
    if (!r.created_at) return false;
    const d = new Date(r.created_at);
    return !isNaN(d.getTime()) &&
      d.getFullYear() === todayYear &&
      d.getMonth() === todayMonth &&
      d.getDate() === todayDate;
  }).length;

  const totalVisitorsExpected = registrations.reduce((sum, r) => 
    sum + (parseInt(r.visitor_count, 10) || 1), 0
  );

  const checkedInList = registrations.filter(r => r.check_in_status || r.checked_in);
  const checkedInCount = checkedInList.length;
  const checkedInVisitorsCount = checkedInList.reduce((sum, r) => 
    sum + (parseInt(r.visitor_count, 10) || 1), 0
  );
  
  const checkInRatePercent = totalRegistrations > 0 
    ? Math.round((checkedInCount / totalRegistrations) * 100) 
    : 0;

  // Initialize all standard business categories so they are represented
  const categoryCounts = {};
  BUSINESS_CATEGORIES.forEach(c => {
    categoryCounts[c.label] = 0;
  });

  registrations.forEach(r => {
    const cat = r.category || r.business_category || 'Other';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const sourceCounts = {};
  registrations.forEach(r => {
    const src = (r.source || 'direct').toLowerCase();
    sourceCounts[src] = (sourceCounts[src] || 0) + 1;
  });

  const campaignCounts = {};
  registrations.forEach(r => {
    if (r.campaign) {
      campaignCounts[r.campaign] = (campaignCounts[r.campaign] || 0) + 1;
    }
  });

  return {
    totalRegistrations,
    todayRegistrations,
    totalVisitorsExpected,
    checkedInCount,
    checkedInVisitorsCount,
    checkInRatePercent,
    categoryCounts,
    sourceCounts,
    campaignCounts
  };
}
