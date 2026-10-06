-- ==============================================================================
-- ONEZONE 2K26 - Production PostgreSQL Database Schema & Security Policies
-- Event: ONEZONE 2K26 | CODISSIA Hall B, Coimbatore
-- ==============================================================================

-- 1. Create registrations table with robust data integrity constraints
CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id VARCHAR(32) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL CHECK (length(trim(name)) >= 2),
    mobile VARCHAR(20) NOT NULL CHECK (length(regexp_replace(mobile, '[^0-9]', '', 'g')) >= 10),
    email VARCHAR(150) NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    city VARCHAR(100) NOT NULL CHECK (length(trim(city)) >= 2),
    company VARCHAR(150) DEFAULT '',
    designation VARCHAR(100) DEFAULT '',
    category VARCHAR(100) NOT NULL,
    visitor_count INT DEFAULT 1 CHECK (visitor_count >= 1 AND visitor_count <= 20),
    
    -- Marketing Attribution
    source VARCHAR(50) DEFAULT 'direct',
    campaign VARCHAR(100) DEFAULT '',
    creative VARCHAR(100) DEFAULT '',
    
    -- Gate Check-in tracking
    check_in_status BOOLEAN DEFAULT FALSE,
    checked_in_at TIMESTAMPTZ,
    checked_in_by VARCHAR(100) DEFAULT 'Gate Staff',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Fast lookup indexes
CREATE INDEX IF NOT EXISTS idx_reg_registration_id ON public.registrations (registration_id);
CREATE INDEX IF NOT EXISTS idx_reg_mobile ON public.registrations (mobile);
CREATE INDEX IF NOT EXISTS idx_reg_email ON public.registrations (email);
CREATE INDEX IF NOT EXISTS idx_reg_category ON public.registrations (category);
CREATE INDEX IF NOT EXISTS idx_reg_source ON public.registrations (source);
CREATE INDEX IF NOT EXISTS idx_reg_created_at ON public.registrations (created_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Drop old unconstrained policies if they exist
DROP POLICY IF EXISTS "Allow public registration insert" ON public.registrations;
DROP POLICY IF EXISTS "Allow public lookup of pass" ON public.registrations;
DROP POLICY IF EXISTS "Allow check-in updates" ON public.registrations;
DROP POLICY IF EXISTS "Allow authenticated admin full select" ON public.registrations;
DROP POLICY IF EXISTS "Allow authenticated admin update" ON public.registrations;
DROP POLICY IF EXISTS "Allow authenticated admin delete" ON public.registrations;

-- 4. Secure RLS Policies

-- A. Public Insert: Allow any visitor or attendee to pre-register
CREATE POLICY "Allow public registration insert" 
ON public.registrations 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (
    length(trim(name)) >= 2 AND
    length(regexp_replace(mobile, '[^0-9]', '', 'g')) >= 10 AND
    length(trim(email)) >= 5 AND
    visitor_count >= 1 AND visitor_count <= 20
);

-- B. Authenticated Admin Full Select (Super Admins / Logged in Gate Staff)
CREATE POLICY "Allow authenticated admin full select" 
ON public.registrations 
FOR SELECT 
TO authenticated 
USING (true);

-- C. Authenticated Admin Updates (Updating check-in, modifying records)
CREATE POLICY "Allow authenticated admin update" 
ON public.registrations 
FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);

-- D. Authenticated Admin Deletes
CREATE POLICY "Allow authenticated admin delete" 
ON public.registrations 
FOR DELETE 
TO authenticated 
USING (true);

-- 5. Secure Stored Procedures (RPCs) for Public / Anon Access without opening full table access

-- RPC 1: Exact Pass Lookup (Prevents broad database enumeration)
CREATE OR REPLACE FUNCTION public.lookup_pass_secure(p_query TEXT)
RETURNS SETOF public.registrations
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_clean_query TEXT := trim(p_query);
    v_clean_phone TEXT := regexp_replace(p_query, '[^0-9]', '', 'g');
BEGIN
    IF length(v_clean_query) < 5 THEN
        RETURN;
    END IF;

    -- Match by exact Registration ID, exact Email, or exact Mobile number
    RETURN QUERY
    SELECT *
    FROM public.registrations
    WHERE 
        upper(registration_id) = upper(v_clean_query)
        OR (length(v_clean_phone) >= 10 AND mobile = v_clean_phone)
        OR lower(email) = lower(v_clean_query)
    LIMIT 5;
END;
$$;

-- RPC 2: Atomic Gate QR Check-in Verification
CREATE OR REPLACE FUNCTION public.verify_gate_check_in(
    p_code TEXT,
    p_staff_name TEXT DEFAULT 'Gate Staff'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_record public.registrations%ROWTYPE;
    v_clean_code TEXT := upper(trim(p_code));
    v_now TIMESTAMPTZ := NOW();
BEGIN
    -- Extract code from pass URL if full URL is scanned
    IF v_clean_code LIKE '%/PASS/%' THEN
        v_clean_code := split_part(split_part(v_clean_code, '/PASS/', 2), '?', 1);
    END IF;

    -- Look up registration
    SELECT * INTO v_record
    FROM public.registrations
    WHERE upper(registration_id) = v_clean_code
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'status', 'INVALID',
            'message', 'Registration pass "' || v_clean_code || '" was not found in the database.'
        );
    END IF;

    -- If already checked in, return warning with previous timestamp
    IF v_record.check_in_status THEN
        RETURN jsonb_build_object(
            'status', 'ALREADY_CHECKED_IN',
            'record', to_jsonb(v_record),
            'previousCheckInTime', v_record.checked_in_at,
            'message', 'Pass already checked in on ' || to_char(v_record.checked_in_at, 'DD Mon YYYY at HH12:MI AM')
        );
    END IF;

    -- Mark as checked in atomically
    UPDATE public.registrations
    SET 
        check_in_status = TRUE,
        checked_in_at = v_now,
        checked_in_by = coalesce(p_staff_name, 'Gate Staff'),
        updated_at = v_now
    WHERE id = v_record.id
    RETURNING * INTO v_record;

    RETURN jsonb_build_object(
        'status', 'SUCCESS',
        'record', to_jsonb(v_record),
        'message', 'Check-in Verified! Welcome ' || v_record.name || '.'
    );
END;
$$;

-- Grant execution permissions on RPC functions to public/anon
GRANT EXECUTE ON FUNCTION public.lookup_pass_secure(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_gate_check_in(TEXT, TEXT) TO anon, authenticated;
