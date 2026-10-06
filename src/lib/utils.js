import { EVENT_DETAILS } from './constants';

/**
 * Generate unique Registration ID in OZ26-XXXXXX format (6 alphanumeric characters)
 */
export function generateRegistrationId() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let randomPart = '';
  for (let i = 0; i < 6; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `OZ26-${randomPart}`;
}

/**
 * Parse marketing attribution from URLSearchParams or window.location.search
 */
export function parseAttribution(searchParams) {
  const params = searchParams instanceof URLSearchParams ? searchParams : new URLSearchParams(searchParams || window.location.search);
  
  const source = params.get('source') || params.get('utm_source') || 'direct';
  const campaign = params.get('campaign') || params.get('utm_campaign') || '';
  const creative = params.get('creative') || params.get('utm_content') || '';
  const utm_medium = params.get('utm_medium') || '';
  const utm_term = params.get('utm_term') || '';

  return {
    source: source.toLowerCase().trim(),
    campaign: campaign.trim(),
    creative: creative.trim(),
    utm_source: params.get('utm_source') || '',
    utm_medium,
    utm_campaign: params.get('utm_campaign') || '',
    utm_content: params.get('utm_content') || '',
    utm_term
  };
}

const ATTRIBUTION_STORAGE_KEY = 'onezone_utm_attribution';

export function saveAttributionToSession(attribution) {
  try {
    if (attribution && attribution.source && attribution.source !== 'direct') {
      sessionStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(attribution));
    }
  } catch (e) {
    // ignore sessionStorage errors
  }
}

export function getAttributionFromSession() {
  try {
    const data = sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    // ignore
  }
  return null;
}

/**
 * Clean phone number formatting (e.g. +91 98765 43210 -> 9876543210)
 */
export function sanitizePhoneNumber(phone) {
  if (!phone) return '';
  return phone.replace(/[^\d]/g, '');
}

/**
 * Validate standard 10 digit Indian / general mobile numbers
 */
export function isValidMobile(phone) {
  const clean = sanitizePhoneNumber(phone);
  return clean.length >= 10 && clean.length <= 15;
}

/**
 * Validate email format
 */
export function isValidEmail(email) {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Format timestamp into readable date & time
 */
export function formatDateTime(isoString) {
  if (!isoString) return '—';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '—';
  
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

export function formatDateOnly(isoString) {
  if (!isoString) return '—';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

export function formatTimeOnly(isoString) {
  if (!isoString) return '—';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Export array of objects to CSV download
 */
export function exportToCsv(filename, rows) {
  if (!rows || !rows.length) return;

  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(','),
    ...rows.map(row => 
      headers.map(header => {
        let cell = row[header] === null || row[header] === undefined ? '' : row[header];
        if (typeof cell === 'string') {
          cell = `"${cell.replace(/"/g, '""')}"`;
        } else if (cell instanceof Date) {
          cell = `"${cell.toISOString()}"`;
        }
        return cell;
      }).join(',')
    )
  ].join('\r\n');

  // Add UTF-8 BOM so MS Excel opens Indian text & special characters properly
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate Google Calendar add event URL
 */
export function getGoogleCalendarUrl() {
  const title = encodeURIComponent(EVENT_DETAILS.fullTitle);
  const details = encodeURIComponent(`${EVENT_DETAILS.tagline}\nVenue: ${EVENT_DETAILS.venueAddress}\nOfficial Portal: ${EVENT_DETAILS.website}`);
  const location = encodeURIComponent(EVENT_DETAILS.venueAddress);
  // 30 Oct 2026 10:00 to 01 Nov 2026 19:00 IST (UTC+5:30 -> 04:30 to 13:30 UTC)
  const dates = '20261030T043000Z/20261101T133000Z';
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
}

/**
 * Generate and download .ics iCalendar file
 */
export function downloadIcsCalendar() {
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ONEZONE 2K26//Visitor Portal//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'UID:oz2k26-codissia-' + Date.now() + '@onezoneexpo.com',
    'DTSTAMP:20261001T000000Z',
    'DTSTART:20261030T043000Z',
    'DTEND:20261101T133000Z',
    `SUMMARY:${EVENT_DETAILS.fullTitle}`,
    `DESCRIPTION:${EVENT_DETAILS.tagline}\\nVenue: ${EVENT_DETAILS.venueAddress}`,
    `LOCATION:${EVENT_DETAILS.venueAddress}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'ONEZONE-2K26-Calendar-Invite.ics');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
