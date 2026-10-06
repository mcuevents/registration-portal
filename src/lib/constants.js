export const EVENT_DETAILS = {
  name: 'ONEZONE 2K26',
  fullTitle: 'ONEZONE 2K26 Mega Trade & Consumer Exhibition',
  tagline: 'Connecting Industries, Innovators & Visionaries',
  dates: '30, 31 October & 1 November 2026',
  dateFormatted: 'Oct 30 - Nov 01, 2026',
  startDateISO: '2026-10-30T10:00:00+05:30',
  endDateISO: '2026-11-01T19:00:00+05:30',
  timing: '10:00 AM – 7:00 PM IST',
  venue: 'CODISSIA Hall B, Coimbatore',
  venueAddress: 'CODISSIA Trade Fair Complex, GV Fair Grounds, Avinashi Road, Coimbatore, Tamil Nadu 641014',
  city: 'Coimbatore',
  state: 'Tamil Nadu',
  country: 'India',
  entryFee: 'Free (Pre-Registration Required for Fast QR Entry)',
  mapsUrl: 'https://maps.google.com/?q=CODISSIA+Trade+Fair+Complex+Coimbatore',
  organizerEmail: 'info@onezoneexpo.com',
  organizerPhone: '+91 98765 43210',
  website: 'https://onezone2k26.com'
};

export const BUSINESS_CATEGORIES = [
  { id: 'real_estate', label: 'Real Estate', icon: 'Building2', description: 'Properties, developers & realtors' },
  { id: 'interior_designing', label: 'Interior Designing', icon: 'Sparkles', description: 'Decor, architects & styling' },
  { id: 'construction', label: 'Construction', icon: 'HardHat', description: 'Civil engineering & infrastructure' },
  { id: 'building_materials', label: 'Building Materials', icon: 'Layers', description: 'Tiles, steel, cement & hardware' },
  { id: 'home_appliances', label: 'Home Appliances', icon: 'Tv', description: 'Smart living, electronics & HVAC' },
  { id: 'automobile', label: 'Automobile', icon: 'Car', description: 'EVs, auto tech & mobility' },
  { id: 'franchise', label: 'Franchise', icon: 'Store', description: 'Business opportunities & retail expansion' },
  { id: 'business_services', label: 'Business Services', icon: 'Briefcase', description: 'Fintech, consulting & digital solutions' },
];

export const CATEGORY_LABELS = BUSINESS_CATEGORIES.map(c => c.label);

export const DEFAULT_ADMIN_PASSCODE = 'onezone@admin2026';
