# ONEZONE 2K26 Registration Portal — Security & Reliability Audit Report

## 1. Executive Summary
A comprehensive security, privacy, and reliability audit of the **ONEZONE 2K26 Registration Portal** was conducted. Critical vulnerabilities regarding database access control, pass lookup privacy, client-side secret exposure, and silent fallback failures were identified and remediated.

All changes maintain full compatibility with the existing user interface, visitor registration workflow, and event-day gate check-in systems.

---

## 2. Security Issues Found & Fixes Applied

### Issue 1: Overly Permissive Supabase RLS Policies
- **Severity**: **Critical**
- **Location**: `supabase/schema.sql`
- **Vulnerability**: 
  - `CREATE POLICY "Allow public lookup of pass" ON public.registrations FOR SELECT USING (true);` allowed any anonymous client with the public anon key to run `SELECT * FROM registrations` and dump all attendee personal records (full names, mobile numbers, email addresses, companies).
  - `CREATE POLICY "Allow check-in updates" ON public.registrations FOR UPDATE USING (true);` allowed unauthorized anonymous modification of check-in status and visitor data.
- **Remediation**:
  - Replaced open table access policies with strict role-based RLS:
    - **`INSERT`**: Publicly allowed for `anon` and `authenticated` with strict field constraints (`length(name) >= 2`, valid phone length, email syntax, clamped visitor count).
    - **`SELECT`**, **`UPDATE`**, **`DELETE`**: Restricted exclusively to `authenticated` Supabase admin roles.
  - Implemented secure PostgreSQL `SECURITY DEFINER` stored procedures (`public.lookup_pass_secure` and `public.verify_gate_check_in`) to allow controlled visitor lookups and gate check-in verifications without exposing raw table access.

---

### Issue 2: Broad Data Enumeration via Lookup Search
- **Severity**: **High**
- **Location**: `src/lib/storage.js` (`searchRegistrationsByContact`), `src/pages/LookupPage.jsx`
- **Vulnerability**: 
  - Lookup queries previously used substring wildcards (`ilike.%<query>%`), enabling attackers to enter single characters (e.g. `a` or `9`) to enumerate all attendees.
- **Remediation**:
  - Implemented exact-match lookups:
    - Queries under 5 characters are rejected with a clear validation prompt.
    - Matches require exact Registration ID (e.g., `OZ26-XXXXXX`), exact 10-digit mobile number, or exact email address.
    - Substring wildcard enumeration is completely disabled.

---

### Issue 3: Silent Fallback to LocalStorage on Database Failure
- **Severity**: **High**
- **Location**: `src/lib/storage.js` (`createRegistration`)
- **Vulnerability**: 
  - When Supabase was configured and a database insert failed due to network outages or errors, the application silently fell back to browser `localStorage` and displayed "Registration Successful". The visitor received a pass that did not exist on the server, causing unexpected entry rejection at the venue gate scanner.
- **Remediation**:
  - When Supabase is configured (`isSupabaseConfigured === true`), a failed database insert now explicitly halts and returns a clear, actionable error: `"Unable to save registration to server. Please check your connection and try again."`
  - Browser `localStorage` is used strictly in unconfigured local offline development environments.

---

### Issue 4: Client-Side Admin Secret Exposure & Weak Passcodes
- **Severity**: **High**
- **Location**: `src/context/AuthContext.jsx`, `src/pages/admin/AdminLogin.jsx`
- **Vulnerability**: 
  - Hardcoded weak passcodes (`'admin'`, `'onezone2026'`) were present as fallbacks.
  - In a Single Page Application (SPA), any environment variable prefixed with `VITE_` is bundled into client JavaScript.
- **Remediation**:
  - Removed all hardcoded weak fallback passwords.
  - Configured Supabase Auth (`supabase.auth.signInWithPassword`) with persistent JWT sessions as the primary production authentication standard.
  - Initialized auth session listeners (`supabase.auth.getSession` & `onAuthStateChange`) to maintain cryptographic session state.
  - Documented that client-side passcodes are intended solely for kiosk convenience in trusted gate environments, while production administration requires Supabase Auth.

---

### Issue 5: Missing `.gitignore` & Risk of Credential Leakage
- **Severity**: **High**
- **Location**: Project Root
- **Vulnerability**: 
  - Repository lacked a `.gitignore` file, creating a high risk of accidentally committing `.env` with API keys, `node_modules/`, and production build artifacts.
- **Remediation**:
  - Created a robust `.gitignore` ignoring `.env`, `.env.*` (preserving `.env.example`), `node_modules/`, `dist/`, and OS temp files.

---

### Issue 6: Demo Seed Data Leakage into Production
- **Severity**: **Medium**
- **Location**: `src/lib/storage.js`
- **Vulnerability**: 
  - Realistic mock registrations (`Arunachalam Sundaram`, `Priya Dharshini`, etc.) were automatically loaded into `localStorage` whenever the cache was empty, potentially polluting admin views in production.
- **Remediation**:
  - Disabled automatic seed data injection when Supabase is configured or in production mode.
  - Seed records are only accessible during offline standalone demo mode.

---

### Issue 7: Client-Side Input Sanitization & Payload Clamping
- **Severity**: **Medium**
- **Location**: `src/lib/storage.js`, `src/lib/utils.js`
- **Vulnerability**: 
  - Excessive input lengths or invalid business categories could bypass client form UI and reach database layers.
- **Remediation**:
  - Added strict sanitization in `createRegistration()`:
    - Name: Trimmed and clamped to max 100 characters (min 2 characters required).
    - Mobile: Non-digits stripped, validated for 10-15 digits.
    - Email: Trimmed, lowercased, validated via regex, max 150 characters.
    - Category: Validated against `BUSINESS_CATEGORIES` whitelist.
    - Visitor Count: Clamped to integer between 1 and 20.
    - Marketing tags: Sanitized of HTML/script characters and truncated.

---

## 3. Files Modified

| File Path | Description of Changes |
|---|---|
| [supabase/schema.sql](file:///d:/Registration%20Portel/supabase/schema.sql) | Hardened RLS policies, added PostgreSQL `CHECK` constraints, created `lookup_pass_secure` and `verify_gate_check_in` RPCs. |
| [src/lib/storage.js](file:///d:/Registration%20Portel/src/lib/storage.js) | Implemented server validation, exact lookup queries, fail-safe error handling for Supabase, and isolated demo seed data. |
| [src/context/AuthContext.jsx](file:///d:/Registration%20Portel/src/context/AuthContext.jsx) | Integrated Supabase Auth session checks/listeners and eliminated weak fallback passcodes. |
| [src/pages/LookupPage.jsx](file:///d:/Registration%20Portel/src/pages/LookupPage.jsx) | Added minimum query length validation to prevent broad attendee enumeration. |
| [src/pages/admin/AdminLogin.jsx](file:///d:/Registration%20Portel/src/pages/admin/AdminLogin.jsx) | Defaulted to Supabase Auth when configured; enhanced login security handling. |
| [src/components/visitor/RegistrationForm.jsx](file:///d:/Registration%20Portel/src/components/visitor/RegistrationForm.jsx) | Handled server error messages accurately upon registration failure. |
| [src/components/admin/QRScannerView.jsx](file:///d:/Registration%20Portel/src/components/admin/QRScannerView.jsx) | Ensured accurate previous check-in timestamp rendering for duplicate scans. |
| [.gitignore](file:///d:/Registration%20Portel/.gitignore) | Created gitignore ignoring `.env`, `node_modules`, `dist/`. |
| [.env.example](file:///d:/Registration%20Portel/.env.example) | Verified placeholders contain no sensitive or real credentials. |

---

## 4. Supabase Schema & RLS Policy Summary

```sql
-- RLS Policy Structure
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- 1. Anonymous & Authenticated Visitors can INSERT with validation
CREATE POLICY "Allow public registration insert" 
ON public.registrations FOR INSERT TO anon, authenticated 
WITH CHECK (
    length(trim(name)) >= 2 AND
    length(regexp_replace(mobile, '[^0-9]', '', 'g')) >= 10 AND
    length(trim(email)) >= 5 AND
    visitor_count >= 1 AND visitor_count <= 20
);

-- 2. Authenticated Admin only can SELECT all rows
CREATE POLICY "Allow authenticated admin full select" 
ON public.registrations FOR SELECT TO authenticated USING (true);

-- 3. Authenticated Admin only can UPDATE rows
CREATE POLICY "Allow authenticated admin update" 
ON public.registrations FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- 4. Authenticated Admin only can DELETE rows
CREATE POLICY "Allow authenticated admin delete" 
ON public.registrations FOR DELETE TO authenticated USING (true);
```

---

## 5. Environment Variable Requirements

| Variable | Required In | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Production / Staging | Supabase Project URL (`https://<project-id>.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Production / Staging | Supabase public anonymous API key |
| `VITE_ADMIN_PASSCODE` | Optional (Local Demo) | Fallback passcode for offline/local kiosk testing |

---

## 6. Testing & Verification Results

| Test Case | Method | Result |
|---|---|---|
| **Vite Production Build** | `npm run build` | **PASS** (Zero errors, exit code 0) |
| **Visitor Registration Flow** | Form submission with validation | **PASS** (Validation enforced, unique ID generated) |
| **Pass ID Collision Prevention** | Character space analysis ($32^6$) | **PASS** (1.07B unique IDs, uniqueness constraint in DB) |
| **Public Pass Lookup** | Exact phone/email/ID lookup vs. short queries | **PASS** (Exact matches returned, <5 char queries blocked) |
| **Admin Authentication** | Supabase Auth vs. Passcode login | **PASS** (Protected route guard active, sessions maintained) |
| **Dashboard Metrics & Filters** | Category, Date, Status, Search | **PASS** (Instant search, timezone-accurate today count) |
| **CSV Export** | Export generation | **PASS** (UTF-8 BOM encoding, field escaping intact) |
| **Gate QR Check-In** | 3-state scan verification | **PASS** (Valid → Admitted; Duplicate → Timestamp alert; Invalid → Error) |
| **Database Failure Handling** | Simulated DB disconnect | **PASS** (Explicit error shown, no silent fake success) |

---

## 7. Remaining Limitations & Production Checklist

### Remaining Architectural Considerations
1. **Frontend-Only Passcode**: In a pure Single Page Application, any passcode checked solely on the client bundle can be extracted by de-obfuscating JavaScript. For production administration, **Supabase Auth (`loginWithSupabase`) must always be used**.
2. **Camera Permissions**: Live QR barcode scanning via `html5-qrcode` requires an `https://` domain or `localhost` due to modern browser camera security policies.

### Production Pre-Flight Checklist
- [ ] Run `supabase/schema.sql` in your Supabase SQL Editor.
- [ ] Create at least one admin account in Supabase Authentication (`Authentication -> Users -> Add User`).
- [ ] Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in your production hosting environment (Vercel, Netlify, Cloudflare Pages).
- [ ] Ensure `.env` is never committed to GitHub.
- [ ] Ensure custom domain uses HTTPS with valid SSL certificates for camera scanner operation.
