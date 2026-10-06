import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Building, 
  Briefcase, 
  Users, 
  Sparkles, 
  ArrowRight, 
  AlertCircle,
  Layers
} from 'lucide-react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { VisitorPassCard } from './VisitorPassCard';
import { BUSINESS_CATEGORIES } from '../../lib/constants';
import { createRegistration } from '../../lib/storage';
import { 
  parseAttribution, 
  saveAttributionToSession, 
  getAttributionFromSession,
  isValidMobile, 
  isValidEmail,
  generateRegistrationId 
} from '../../lib/utils';

const QUICK_CITIES = ['Coimbatore', 'Tirupur', 'Salem', 'Erode', 'Chennai', 'Bangalore', 'Kochi'];

const CATEGORY_OPTIONS = BUSINESS_CATEGORIES.map(cat => ({
  value: cat.label,
  label: cat.label
}));

export function RegistrationForm({ initialCategory = '', onSuccess }) {
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    full_name: '',
    mobile_number: '',
    email: '',
    city: 'Coimbatore',
    company_name: '',
    designation: '',
    business_category: initialCategory || 'Real Estate',
    number_of_visitors: 1,
  });

  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [attribution, setAttribution] = useState(null);

  // Capture URL parameters on mount
  useEffect(() => {
    const parsed = parseAttribution(searchParams);
    if (parsed.source && parsed.source !== 'direct') {
      saveAttributionToSession(parsed);
      setAttribution(parsed);
    } else {
      const stored = getAttributionFromSession();
      if (stored) {
        setAttribution(stored);
      } else {
        setAttribution(parsed);
      }
    }
  }, [searchParams]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (formError) {
      setFormError('');
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.full_name || formData.full_name.trim().length < 2) {
      newErrors.full_name = 'Full name must be at least 2 characters';
    }

    if (!formData.mobile_number) {
      newErrors.mobile_number = 'Mobile number is required';
    } else if (!isValidMobile(formData.mobile_number)) {
      newErrors.mobile_number = 'Enter a valid 10-digit mobile number';
    }

    if (!formData.email) {
      newErrors.email = 'Email address is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!formData.city || formData.city.trim().length < 2) {
      newErrors.city = 'Please specify your city';
    }

    if (!formData.business_category) {
      newErrors.business_category = 'Please select a business category';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setFormError('Please resolve the highlighted errors before submitting.');
      return false;
    }

    setFormError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setFormError('');

    try {
      const regId = generateRegistrationId();
      const payload = {
        registration_id: regId,
        name: formData.full_name,
        full_name: formData.full_name,
        mobile: formData.mobile_number,
        mobile_number: formData.mobile_number,
        email: formData.email,
        city: formData.city,
        company: formData.company_name,
        company_name: formData.company_name,
        designation: formData.designation,
        category: formData.business_category,
        business_category: formData.business_category,
        visitor_count: formData.number_of_visitors,
        number_of_visitors: formData.number_of_visitors,
        source: attribution?.source || 'direct',
        campaign: attribution?.campaign || '',
        creative: attribution?.creative || '',
        check_in_status: false
      };

      const result = await createRegistration(payload);

      if (result.success && result.data) {
        setSubmittedData(result.data);
        if (onSuccess) {
          onSuccess(result.data);
        }

        // Trigger celebratory confetti animation
        try {
          confetti({
            particleCount: 90,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#F97316', '#F59E0B', '#10B981', '#3B82F6']
          });
        } catch (err) {}
      } else {
        setFormError(result.error || 'Failed to save registration. Please try again.');
      }

    } catch (err) {
      console.error('Registration error:', err);
      setFormError(err.message || 'An error occurred while submitting your registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedData(null);
    setFormData({
      full_name: '',
      mobile_number: '',
      email: '',
      city: 'Coimbatore',
      company_name: '',
      designation: '',
      business_category: 'Real Estate',
      number_of_visitors: 1,
    });
    setErrors({});
    setFormError('');
  };

  // DIGITAL VISITOR PASS AFTER SUCCESSFUL REGISTRATION
  if (submittedData) {
    return (
      <div className="animate-fadeIn">
        <VisitorPassCard
          registration={submittedData}
          onReset={handleReset}
        />
      </div>
    );
  }

  // REGISTRATION FORM
  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      
      {/* Global Form Error Banner */}
      {formError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-semibold text-rose-700 flex items-center gap-2.5 animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* Attribution Tag Notification (if URL params exist) */}
      {attribution && attribution.source && attribution.source !== 'direct' && (
        <div className="bg-brand-50/80 border border-brand-200/80 rounded-xl p-3 text-xs text-brand-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-ping"></span>
            <span>Attribution Tag: <strong className="font-semibold">{attribution.source}</strong> {attribution.campaign ? `(${attribution.campaign})` : ''}</span>
          </div>
          <span className="text-[10px] font-bold uppercase bg-brand-200/60 px-2 py-0.5 rounded text-brand-900">
            Campaign Link
          </span>
        </div>
      )}

      {/* Row 1: Personal Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          id="reg-full-name"
          label="Full Name"
          required
          placeholder="e.g. Arunachalam Sundaram"
          icon={User}
          value={formData.full_name}
          onChange={(e) => handleChange('full_name', e.target.value)}
          error={errors.full_name}
        />

        <Input
          id="reg-mobile"
          label="Mobile Number"
          required
          type="tel"
          placeholder="10-digit mobile number"
          icon={Phone}
          value={formData.mobile_number}
          onChange={(e) => handleChange('mobile_number', e.target.value)}
          error={errors.mobile_number}
          helperText="Pass & check-in QR code will be linked to this number"
        />
      </div>

      {/* Row 2: Email & City */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          id="reg-email"
          label="Email Address"
          required
          type="email"
          placeholder="name@company.com"
          icon={Mail}
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          error={errors.email}
        />

        <div>
          <Input
            id="reg-city"
            label="City"
            required
            placeholder="e.g. Coimbatore"
            icon={MapPin}
            value={formData.city}
            onChange={(e) => handleChange('city', e.target.value)}
            error={errors.city}
          />
          {/* Quick city suggestions */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {QUICK_CITIES.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => handleChange('city', c)}
                className={`text-[11px] px-2 py-0.5 rounded-md border transition-colors ${
                  formData.city === c 
                    ? 'bg-brand-500 text-white border-brand-500 font-semibold' 
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Professional Info (Optional) */}
      <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-brand-500" />
            Company & Designation (Optional)
          </span>
          <span className="text-[11px] text-slate-400 font-medium">B2B Networking Pass</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="reg-company"
            label="Company / Business Name"
            placeholder="e.g. Apex Infra Solutions"
            icon={Building}
            value={formData.company_name}
            onChange={(e) => handleChange('company_name', e.target.value)}
          />

          <Input
            id="reg-designation"
            label="Designation / Role"
            placeholder="e.g. Managing Director / Architect"
            icon={Briefcase}
            value={formData.designation}
            onChange={(e) => handleChange('designation', e.target.value)}
          />
        </div>
      </div>

      {/* Row 4: Business Category Dropdown */}
      <div className="space-y-1.5">
        <Select
          id="reg-category"
          label="Business Category"
          required
          icon={Layers}
          options={CATEGORY_OPTIONS}
          value={formData.business_category}
          onChange={(e) => handleChange('business_category', e.target.value)}
          error={errors.business_category}
          helperText="Select your primary sector of interest"
        />
      </div>

      {/* Row 5: Number of Visitors */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Number of Visitors <span className="text-brand-500">*</span>
        </label>
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map(num => (
            <button
              key={num}
              type="button"
              onClick={() => handleChange('number_of_visitors', num)}
              className={`py-2.5 rounded-xl border text-sm font-bold transition-all flex items-center justify-center gap-1 ${
                formData.number_of_visitors === num
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/10'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Users className="w-3.5 h-3.5 opacity-60" />
              <span>{num === 5 ? '5+' : num}</span>
            </button>
          ))}
        </div>
        <p className="text-[11px] text-slate-400">Total persons attending under this registration.</p>
      </div>

      {/* Frictionless Pre-registration Notice */}
      <div className="flex items-center gap-2.5 text-xs text-slate-600 bg-amber-50/70 border border-amber-200/80 p-3.5 rounded-xl">
        <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <span>Instant QR Digital Visitor Pass will be generated immediately on submission.</span>
      </div>

      {/* Submit Button */}
      <div>
        <Button
          type="submit"
          size="lg"
          variant="primary"
          loading={isSubmitting}
          className="w-full py-4 text-base font-bold shadow-xl shadow-brand-500/20 hover:shadow-brand-500/30"
          icon={Sparkles}
        >
          {isSubmitting ? 'Generating Digital Pass...' : 'Register & Generate Digital Pass'}
          {!isSubmitting && <ArrowRight className="w-4 h-4 ml-1" />}
        </Button>
      </div>

    </form>
  );
}
