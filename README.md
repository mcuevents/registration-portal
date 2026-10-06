# ONEZONE 2K26 — Visitor Registration & QR Check-In Portal

Production-ready, frictionless visitor registration portal and gate check-in terminal for **ONEZONE 2K26 Exhibition**.

---

## 📅 Event Overview
* **Event:** ONEZONE 2K26 Mega Trade & Consumer Exhibition
* **Dates:** 30, 31 October & 1 November 2026 (10:00 AM – 7:00 PM IST)
* **Venue:** CODISSIA Hall B, Avinashi Road, Coimbatore, Tamil Nadu
* **Theme:** Premium, modern, professional white-based UI with ONEZONE brand orange/gold accents
* **Entry:** Free entry with instant QR Visitor Pass

---

## 🚀 Key Features

### 1. Frictionless Visitor Experience (No Passwords / Accounts)
- **Landing Page & Countdown:** Real-time countdown timer to 30 October 2026, focus sector highlights, and instant registration form.
- **Fast Form Validation:** Full Name, Mobile (10-digit), Email, City (with quick chips), Company, Designation, Sector Category, and Number of Visitors.
- **Automatic Marketing Attribution:** Captures URL parameters (`?source=instagram&campaign=realestate&creative=reel01` and UTMs) and stores them with each registration.
- **Instant QR Visitor Pass:**
  - High-resolution dynamic QR code generated via `qrcode.react`.
  - Monospaced readable Registration ID (`OZ26-XXXXX`).
  - **Save as Image (PNG)** via `html2canvas`.
  - **Print Pass** with `@media print` badge layout.
  - **WhatsApp Share** direct link.
  - **Add to Calendar** (.ics and Google Calendar integration).
- **Find / Retrieve Existing Pass (`/lookup`):** Visitors can search and re-download their pass anytime by phone or Registration ID.

### 2. Protected Staff & Admin Portal (`/admin`)
- **Protected Access:** Fast Staff Passcode (`onezone@admin2026`) and optional Supabase Auth.
- **Executive Analytics Dashboard (`/admin`):**
  - Total Registrations & Today's Signups.
  - Total Estimated Footfall (sum of accompanying guests).
  - Gate Check-In Rate (%) and footfall velocity.
  - **Category-wise Breakdown:** Visual sector interest distribution.
  - **Marketing Attribution:** Channel counts (`instagram`, `google`, `linkedin`, `whatsapp`, `direct`) and campaign tags.
- **Registration Directory (`/admin/registrations`):**
  - Instant live search by Name, Mobile, Email, Pass ID, Company, City.
  - Filter by Sector, Check-In Status, and Channel.
  - Quick 1-click Check-in / Undo toggle in table rows.
  - Detailed Visitor Modal with pass preview and delete options.
  - **Export to CSV / Excel** with UTF-8 BOM support.
  - **On-Spot Registration Modal** for walk-in visitors at registration desks.
- **Gate QR Check-In Terminal (`/admin/scan`):**
  - Live camera barcode/QR scanner powered by `html5-qrcode` with rear/front camera switching.
  - **Web Audio API Sound Synthesizer:** Real-time audio beeps for Success, Warning, and Error states without external audio files.
  - **3-State Verification:**
    1. 🟢 **Valid (Checked-In):** Displays attendee name, company, pass ID, visitor count, timestamp.
    2. 🟡 **Already Checked-In:** Warning card with original check-in timestamp and staff note.
    3. 🔴 **Invalid / Not Found:** Alert banner.
  - **Manual Code Entry fallback** for fast gate verification.

---

## 🛠️ Tech Stack
- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS (Custom ONEZONE brand palette: `#F97316`, `#EA580C`, `#F59E0B`, `#0F172A`)
- **Database:** Supabase PostgreSQL with Row Level Security (RLS) + Hybrid LocalStorage fallback
- **Routing:** React Router v6
- **QR Engine:** `qrcode.react` (SVG) + `html5-qrcode` (Scanner)
- **Audio:** Web Audio API native oscillator synthesis
- **Typography:** Outfit & Plus Jakarta Sans via Google Fonts

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_ADMIN_PASSCODE=onezone@admin2026
```
*(Note: If Supabase keys are not set, the portal seamlessly uses the built-in local persistence layer with pre-populated demo data).*

### 3. Supabase Database Setup (Optional for Cloud DB)
Run the SQL queries in [`supabase/schema.sql`](file:///d:/Registration%20Portel/supabase/schema.sql) in your Supabase SQL Editor.

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📊 Default Admin Credentials
- **Admin Login URL:** `/admin/login`
- **Default Passcode:** `onezone@admin2026`

---

## 📂 Project Structure
```
├── supabase/
│   └── schema.sql                  # PostgreSQL table, indexes & RLS policies
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   ├── AnalyticsChart.jsx  # Category & Marketing breakdown charts
│   │   │   ├── OnSpotRegistrationModal.jsx # Walk-in registration modal
│   │   │   ├── QRScannerView.jsx   # Live camera barcode scanner + Audio FX
│   │   │   ├── RegistrationModal.jsx # Detail inspector modal
│   │   │   ├── RegistrationTable.jsx # Search, filter, export table
│   │   │   └── StatCard.jsx        # Dashboard metric KPI cards
│   │   ├── layout/
│   │   │   ├── AdminLayout.jsx     # Admin topbar & navigation
│   │   │   ├── Footer.jsx          # Event dates, venue & contact footer
│   │   │   └── Navbar.jsx          # Event notification banner & navigation
│   │   ├── ui/
│   │   │   ├── Badge.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   └── Select.jsx
│   │   └── visitor/
│   │       ├── CategorySelector.jsx # 8 sector visual selection cards
│   │       ├── RegistrationForm.jsx # Frictionless registration form
│   │       └── VisitorPassCard.jsx  # Badge card with QR, print & save
│   ├── context/
│   │   ├── AuthContext.jsx         # Admin authentication state
│   │   └── ToastContext.jsx        # Notification alert system
│   ├── lib/
│   │   ├── audio.js                # Web Audio sound effects
│   │   ├── constants.js            # Event metadata & categories
│   │   ├── storage.js              # Supabase / Local hybrid data layer
│   │   ├── supabase.js             # Supabase client initializer
│   │   └── utils.js                # ID generator, attribution, CSV export
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminLogin.jsx
│   │   │   ├── AdminQRScanner.jsx
│   │   │   └── AdminRegistrations.jsx
│   │   ├── LandingPage.jsx
│   │   ├── LookupPage.jsx
│   │   ├── NotFoundPage.jsx
│   │   ├── PassSuccessPage.jsx
│   │   └── RegisterPage.jsx
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
```
