# ONEZONE 2K26 Registration Portal

## 1. Project Overview
The **ONEZONE 2K26 Registration Portal** is a high-performance, mobile-first web application designed for the **ONEZONE 2K26 Mega Trade & Consumer Exhibition** held at **CODISSIA Hall B, Coimbatore** (30, 31 October & 1 November 2026).

The portal provides:
- Frictionless visitor pre-registration across 8 primary business sectors without requiring account creation.
- Instant client-side and cloud generation of scannable QR Digital Visitor Passes.
- Pass lookup and digital badge download (PNG / Print).
- Executive Admin Dashboard for real-time registration monitoring, sector breakdowns, multi-criteria filtering, and CSV export.
- Dedicated Event-Day Gate QR Check-in Terminal with Web Audio API sound feedback and live duplicate pass prevention.
- End-to-end marketing attribution tracking (UTM parameters, channels, campaigns, and ad creatives).

---

## 2. Technology Stack
- **Frontend Framework**: React 18 (with React DOM & React Router v6)
- **Build Tool & Dev Server**: Vite 5
- **Styling**: Tailwind CSS 3 (configured with custom display typography, warm brand hues `#F97316`, amber accents, and dark surface tokens)
- **Icons**: Lucide React
- **Database & Auth**: Supabase (PostgreSQL with Row Level Security and Auth) with automatic local-first hybrid caching fallback
- **QR Generation**: `qrcode.react` (SVG / High Error Correction)
- **QR Scanning**: `html5-qrcode` (HTML5 Camera API with rear lens autodetection)
- **Pass Canvas Export**: `html2canvas` (3x high-resolution PNG badge rendering)
- **Celebratory Effects**: `canvas-confetti`
- **Audio Feedback**: Web Audio API Sound Synthesizer (zero external audio asset dependencies)

---

## 3. Features Implemented
1. **Public Visitor Portal**:
   - **Hero & Event Overview**: Event dates, timing, CODISSIA Hall B venue address, Google Maps integration, and live countdown.
   - **Business Sectors Showcase**: Interactive exploration of 8 core verticals with pre-filtered registration links.
   - **Visitor Pre-Registration Form**: 
     - Real-time client-side validation for Name, Indian/International Mobile numbers (10+ digits), Email syntax, City, and Business Category.
     - Optional B2B fields (Company Name, Designation) and accompanying visitor headcount selector (1 to 5+ persons).
     - Instant generation of unique 6-character alphanumeric Registration IDs (`OZ26-XXXXXX`).
   - **Digital QR Visitor Pass Card**:
     - Embedded high-contrast QR code encoding the unique Pass ID.
     - Attendee details, focus category badge, group count, and event venue details.
     - One-click **Download Pass (PNG)** via html2canvas (3x resolution).
     - One-click **Print Badge** with print-optimized CSS styles (`@media print`).
     - **Add to Calendar**: One-click Google Calendar URL generation and downloadable `.ics` iCalendar invite.
   - **Pass Lookup Directory (`/lookup`)**:
     - Instant retrieval of existing passes by registered mobile number, email address, or Pass ID.

2. **Secure Admin Portal (`/admin`)**:
   - **Authentication (`/admin/login`)**:
     - Passcode-based gate operator authentication and optional Supabase email/password login.
     - Password visibility toggle (`Eye` / `EyeOff`) and demo quick-fill helper.
     - Protected route guarding (`ProtectedAdminRoute`) with session persistence.
   - **Executive KPI Metric Cards**:
     - *Total Registrations* (with sector diversity counter).
     - *Today's Registrations* (timezone-accurate local calendar date tracking).
     - *Total Footfall Expected* (primary registrants + accompanying guests).
     - *Gate Check-in Rate* (percentage and count of attendees admitted).
   - **Interactive Category Breakdown**:
     - Visual distribution across all 8 sectors with progress bars and percentage calculation.
     - 1-click filtering: clicking any sector bar immediately filters the registrations directory.
   - **Marketing Channel & Campaign Attribution**:
     - Real-time tally of visitor acquisition channels (Direct, Instagram, Google, LinkedIn, WhatsApp) and campaign tags.

3. **Registrations Directory & CSV Export**:
   - **Multi-Field Instant Search**: Searches across Name, Mobile, Email, Pass ID, Company, City, and Designation.
   - **Advanced Filters**: Sector Category, Date Presets (*All*, *Today*, *Yesterday*, *Last 7 Days*, *Last 30 Days*, *Specific Date*, *Date Range*), Gate Status (*All*, *Checked In*, *Pending*), and Marketing Source.
   - **Sorting & Pagination**: Sort by Date, Name, or Visitor count; configurable pagination (10, 25, 50, 100, All).
   - **Attendee Details Modal**: Comprehensive dossier view with personal contact info, professional info, marketing tags, gate check-in toggle, and direct link to digital pass.
   - **CSV Export**: One-click export formatted with UTF-8 BOM encoding and quote escaping for Microsoft Excel and Google Sheets.
   - **On-Spot Walk-In Registration**: Modal dialog for desk staff to register walk-in visitors without leaving the admin console.

4. **Event-Day QR Gate Check-In System (`/checkin` & `/admin/scan`)**:
   - **Dedicated Lightweight Kiosk Page (`/checkin`)**: Mobile-first design for smartphones, tablets, handheld 2D barcode scanners, and gate laptops.
   - **Camera Scanner**: Auto-detects rear/environment camera with camera selector, laser guide overlay, and manual entry fallback.
   - **3-State Verification Logic**:
     1. *Valid & Unchecked Pass*: Displays visitor details, sets `checked_in = true`, logs `checked_in_at` timestamp, and triggers success chime.
     2. *Already Checked-In Pass*: Displays amber warning with exact original check-in timestamp (`checked_in_at`) and attendee info to prevent duplicate entry.
     3. *Invalid Pass*: Displays red alert with guidance to direct attendee to Help Desk.
   - **Audio & Haptic Feedback**: Positive success chime, warning tone, error buzzer via Web Audio API, and mobile haptic vibration.
   - **Live Stream**: Real-time recent gate admissions stream and built-in simulator test buttons.

---

## 4. Registration Workflow

```
┌─────────────────┐
│     Visitor     │ ──► Lands on Portal / Campaign Link (?source=instagram&campaign=realestate)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│Registration Form│ ──► Enters Full Name, Mobile, Email, City, Sector, Visitors Count
└────────┬────────┘
         │ (Validation: 10-digit phone, email format, required fields)
         ▼
┌─────────────────┐
│ Database Insert │ ──► Saves to Supabase PostgreSQL (or synced local cache fallback)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ ID Generation   │ ──► Assigns unique collision-resistant ID (e.g. OZ26-48921A)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ QR Visitor Pass │ ──► Renders Digital Pass with QR Code, event dates & venue
└────────┬────────┘
         │
         ├────────────► Download PNG / Print / Save to Apple/Google Calendar
         ▼
┌─────────────────┐
│ Event Day Gate  │ ──► Staff scans QR at CODISSIA Hall B using /checkin or /admin/scan
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Gate Check-In   │ ──► First scan: Marks checked_in = true & logs timestamp
└─────────────────┘     Duplicate scan: Displays original check-in timestamp & alert
```

---

## 5. Database Schema (Supabase PostgreSQL)

### Table: `public.registrations`

| Column Name | Data Type | Constraints / Default | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unique internal record identifier |
| `registration_id` | `VARCHAR(32)` | `UNIQUE NOT NULL` | Human-readable Pass ID (format: `OZ26-XXXXXX`) |
| `name` | `VARCHAR(255)` | `NOT NULL` | Visitor full name |
| `mobile` | `VARCHAR(20)` | `NOT NULL` | Contact mobile number |
| `email` | `VARCHAR(255)` | `NOT NULL` | Contact email address |
| `city` | `VARCHAR(100)` | `NOT NULL` | City of residence / business |
| `company` | `VARCHAR(255)` | `DEFAULT ''` | Company or organization name |
| `designation` | `VARCHAR(100)` | `DEFAULT ''` | Job role or title |
| `category` | `VARCHAR(100)` | `NOT NULL` | Focus business sector (e.g. Real Estate, Construction) |
| `visitor_count` | `INT` | `DEFAULT 1 CHECK (visitor_count >= 1)` | Total persons admitted under this pass |
| `source` | `VARCHAR(100)` | `DEFAULT 'direct'` | Marketing channel (e.g. instagram, google, whatsapp) |
| `campaign` | `VARCHAR(100)` | `DEFAULT ''` | Campaign identifier (e.g. realestate_reels) |
| `creative` | `VARCHAR(100)` | `DEFAULT ''` | Ad creative variant (e.g. reel01, banner_v2) |
| `check_in_status` | `BOOLEAN` | `DEFAULT FALSE` | Gate admission status (`TRUE` = Admitted) |
| `checked_in_at` | `TIMESTAMPTZ` | `NULL` | Exact timestamp of gate admission |
| `checked_in_by` | `VARCHAR(100)` | `DEFAULT 'Gate Staff'` | Gate operator / terminal identifier |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Registration creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Record last modification timestamp |

### Indexes & Performance
- `idx_reg_registration_id`: B-tree index on `registration_id` for $O(1)$ gate lookups.
- `idx_reg_mobile`: Index on `mobile` for visitor pass search.
- `idx_reg_email`: Index on `email` for lookup queries.
- `idx_reg_category`: Index on `category` for sector filtering and analytics.
- `idx_reg_source`: Index on `source` for attribution reporting.
- `idx_reg_created_at`: Index on `created_at DESC` for chronological directory listing.

---

## 6. Admin Features
- **Executive Dashboard**: Real-time KPI counters, sector distribution graph, marketing channel cards, and quick gate actions.
- **Registrations Directory**: Searchable, sortable, paginated data table with inline status toggles, attendee modal inspection, and deletion safeguards.
- **CSV Export**: One-click data export with UTF-8 BOM encoding for Microsoft Excel, Apple Numbers, and Google Sheets compatibility.
- **Gate Check-in Hub**: Fullscreen embedded scanner (`/admin/scan`) and standalone mobile check-in terminal (`/checkin`).
- **On-Spot Walk-In Counter**: Desk registration modal to generate badges for walk-in attendees during the exhibition.

---

## 7. Marketing Attribution

The portal automatically captures URL query parameters and persists them across the visitor session using `sessionStorage`:

### Supported Attribution Parameters
- `source` or `utm_source`: Acquisition channel (e.g. `instagram`, `facebook`, `google`, `linkedin`, `whatsapp`, `newspaper`, `direct`).
- `campaign` or `utm_campaign`: Marketing campaign name (e.g. `realestate_reels`, `expo_launch`, `b2b_networking`).
- `creative` or `utm_content`: Creative / ad variant (e.g. `reel01`, `banner_blue`, `influencer_post`).
- `utm_medium`: Marketing medium (e.g. `cpc`, `social`, `qr_flyer`).

### Example Attribution Links
```
https://onezone2k26.com/register?source=instagram&campaign=realestate&creative=reel01
https://onezone2k26.com/register?source=google&campaign=search_coimbatore&utm_medium=cpc
https://onezone2k26.com/register?source=whatsapp&campaign=trade_invite_2026&creative=flyer_v1
```

When a visitor registers through an attribution link, the source, campaign, and creative tags are saved with their registration record and aggregated in the Admin Dashboard analytics.

---

## 8. Security & Data Protection
1. **Row Level Security (RLS)**:
   - Supabase PostgreSQL policies enforce controlled public insert and public lookup by registration code, while restricting unauthorized bulk table manipulations.
2. **Admin Authentication**:
   - Protected route guards prevent unauthorized access to `/admin`, `/admin/registrations`, and `/admin/scan`.
   - Passcode verification and optional Supabase Auth with encrypted JWT session storage.
3. **Data Sanitization**:
   - Phone numbers are sanitized to remove non-numeric formatting characters before query execution.
   - Search queries and CSV fields are sanitized to prevent CSV injection / formula injection attacks.
4. **Credential Privacy**:
   - No private keys, service role keys, or database passwords are exposed on the client bundle. Only public `VITE_SUPABASE_ANON_KEY` is utilized.

---

## 9. Testing & Results

| Test Area | Test Description | Result |
|---|---|---|
| **Registration Form** | Validated required fields, 10-digit mobile number, email format, and category selection. | **PASS** |
| **Pass ID Generation** | Verified generation of collision-resistant `OZ26-XXXXXX` codes with unambiguous character set. | **PASS** |
| **Visitor Pass Display** | Verified QR code SVG generation, attendee details display, PNG download via html2canvas, and print styles. | **PASS** |
| **Pass Lookup Directory** | Verified pass search by mobile number, email, and Registration ID. | **PASS** |
| **Admin Login & Auth** | Verified authentication with valid passcode, invalid passcode error banner, password visibility toggle, and route guards. | **PASS** |
| **KPI Metrics** | Verified Total Registrations, timezone-safe Today's Registrations, and Total Expected Footfall counters. | **PASS** |
| **Category Breakdown** | Verified all 8 business verticals rendered with accurate counts, percentages, and interactive table filtering. | **PASS** |
| **Table Search & Filter** | Verified real-time search across Name, Mobile, Email, Pass ID, and Company; verified Date presets and Status filters. | **PASS** |
| **CSV Export** | Verified exported file contains all columns, accurate row counts, UTF-8 BOM, and properly escaped fields. | **PASS** |
| **QR Gate Check-In** | Tested: (1) Valid unchecked pass → Verified & admitted; (2) Duplicate scan → Previous check-in time warning; (3) Invalid pass → Error message. | **PASS** |
| **Audio Feedback** | Verified Web Audio API synthesized chimes for success, warning, and error states without external sound files. | **PASS** |
| **Mobile Responsiveness** | Verified layout responsiveness across mobile phones (375px+), tablets, laptops, and desktop viewports. | **PASS** |
| **Production Build** | Executed `npm run build` with Vite. Build compiled with 0 errors (`Exit Code 0`). | **PASS** |

---

## 10. Known Limitations
1. **Camera Permissions in Insecure Contexts**:
   - Web browser camera scanning requires HTTPS or `localhost` (browser security restriction). On remote HTTP connections, manual Pass ID entry must be used.
2. **Supabase Rate Limits on Free Tier**:
   - On default Supabase free tier, standard API rate limits apply. If Supabase is offline or unconfigured, the application automatically fails over to local storage caching seamlessly.

---

## 11. Deployment

### Required Environment Variables (`.env`)
Create a `.env` file in the project root with the following variables:

```env
# Supabase PostgreSQL Cloud Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-public-key

# Admin Security Passcode
VITE_ADMIN_PASSCODE=onezone@admin2026
```

### Production Build & Deployment Steps
1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Execute Production Build**:
   ```bash
   npm run build
   ```
3. **Deploy Output Directory**:
   - Deploy the generated `dist/` directory to any static host (Vercel, Netlify, Cloudflare Pages, Firebase Hosting, AWS S3 / CloudFront, or Nginx).
   - Configure Single Page Application (SPA) rewrite rules routing all requests (`/*`) to `/index.html`.

---

## 12. Final Project Structure

```
d:/Registration Portel/
├── dist/                          # Production build output
├── public/                        # Static public assets
│   ├── favicon.ico
│   └── og-image.png
├── src/
│   ├── components/
│   │   ├── admin/                 # Admin Dashboard Components
│   │   │   ├── AnalyticsChart.jsx           # Category & marketing analytics charts
│   │   │   ├── OnSpotRegistrationModal.jsx  # Walk-in attendee registration modal
│   │   │   ├── QRScannerView.jsx            # Embedded gate QR scanner view
│   │   │   ├── RegistrationModal.jsx        # Attendee details dossier modal
│   │   │   ├── RegistrationTable.jsx        # Full table with search, filters & export
│   │   │   └── StatCard.jsx                 # Executive KPI card component
│   │   ├── layout/                # Layout Wrappers
│   │   │   ├── AdminLayout.jsx              # Admin header & navigation
│   │   │   ├── Footer.jsx                   # Public footer with dates & sectors
│   │   │   └── Navbar.jsx                   # Public navigation bar with CTAs
│   │   ├── ui/                    # Reusable UI Primitives
│   │   │   ├── Badge.jsx                    # Sector & status badges
│   │   │   ├── Button.jsx                   # Buttons with loading states & variants
│   │   │   ├── Input.jsx                    # Input with label, icons & error handling
│   │   │   └── Select.jsx                   # Dropdown select input
│   │   └── visitor/               # Visitor Components
│   │       ├── RegistrationForm.jsx         # Pre-registration form with validation
│   │       └── VisitorPassCard.jsx          # Digital QR pass with PNG & Print actions
│   ├── context/
│   │   ├── AuthContext.jsx                  # Admin authentication & session provider
│   │   └── ToastContext.jsx                 # Toast notification system
│   ├── lib/                       # Core Logic & Utilities
│   │   ├── audio.js                         # Web Audio API sound synthesizer
│   │   ├── constants.js                     # Event details & 8 business categories
│   │   ├── storage.js                       # Supabase & local storage data layer
│   │   ├── supabase.js                      # Supabase client initializer
│   │   └── utils.js                         # CSV export, attribution & date utilities
│   ├── pages/                     # Application Routes & Pages
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx           # Executive overview dashboard
│   │   │   ├── AdminLogin.jsx               # Secure admin login page
│   │   │   ├── AdminQRScanner.jsx           # Gate QR check-in terminal
│   │   │   └── AdminRegistrations.jsx       # Fullscreen registrations directory
│   │   ├── CheckInPage.jsx                  # Dedicated lightweight mobile check-in kiosk
│   │   ├── LandingPage.jsx                  # Public event overview & registration landing
│   │   ├── LookupPage.jsx                   # Find existing pass by mobile/email/ID
│   │   ├── NotFoundPage.jsx                 # 404 error page
│   │   ├── PassSuccessPage.jsx              # Standalone pass view & download page
│   │   └── RegisterPage.jsx                 # Dedicated pre-registration page
│   ├── App.jsx                    # Main application router & route guards
│   ├── index.css                  # Global styles & Tailwind directives
│   └── main.jsx                   # React root entry point
├── supabase/
│   └── schema.sql                 # PostgreSQL database schema & RLS policies
├── .env.example                   # Environment variable template
├── DEVELOPMENT_REPORT.md          # Comprehensive technical development report
├── package.json                   # Project metadata & npm dependencies
├── tailwind.config.js             # Tailwind CSS theme configuration
└── vite.config.js                 # Vite bundler configuration
```
