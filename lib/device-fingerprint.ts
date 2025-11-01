/**
 * Device Fingerprinting & Visit Tracking
 *
 * Privacy-first approach:
 * - No PII (Personal Identifiable Information)
 * - No cookies (LGPD/GDPR compliant)
 * - Uses browser fingerprint + localStorage
 * - Tracks visit count per device
 *
 * Usage:
 *   import { getVisitCount, incrementVisit } from '@/lib/device-fingerprint';
 *
 *   const visitCount = getVisitCount();  // Returns 1, 2, 3, etc.
 *   incrementVisit();                    // Call on page load
 */

"use client";

const VISIT_COUNT_KEY = 'llmmerch_visit_count';
const DEVICE_ID_KEY = 'llmmerch_device_id';
const FIRST_VISIT_KEY = 'llmmerch_first_visit';

/**
 * Generate a simple device fingerprint
 * Based on: screen, timezone, language, platform
 * NOT based on: IP, cookies, tracking pixels
 */
export function generateDeviceFingerprint(): string {
  if (typeof window === 'undefined') return 'server';

  const components = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset(),
    navigator.platform,
    navigator.hardwareConcurrency || 0,
  ];

  const fingerprint = components.join('|');

  // Simple hash (not cryptographic, just for ID)
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return `dev_${Math.abs(hash).toString(36)}`;
}

/**
 * Get or create device ID (persists in localStorage)
 */
export function getDeviceId(): string {
  if (typeof window === 'undefined') return 'server';

  let deviceId = localStorage.getItem(DEVICE_ID_KEY);

  if (!deviceId) {
    deviceId = generateDeviceFingerprint();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
    localStorage.setItem(FIRST_VISIT_KEY, new Date().toISOString());
  }

  return deviceId;
}

/**
 * Get visit count for this device
 */
export function getVisitCount(): number {
  if (typeof window === 'undefined') return 1;

  const count = localStorage.getItem(VISIT_COUNT_KEY);
  return count ? parseInt(count, 10) : 1;
}

/**
 * Increment visit count
 */
export function incrementVisit(): number {
  if (typeof window === 'undefined') return 1;

  const deviceId = getDeviceId();
  const currentCount = getVisitCount();
  const newCount = currentCount + 1;

  localStorage.setItem(VISIT_COUNT_KEY, newCount.toString());

  // Track in analytics
  try {
    // @ts-ignore
    window?.dataLayer?.push?.({
      event: 'device_visit',
      device_id: deviceId,
      visit_count: newCount,
      returning_visitor: newCount > 1
    });
  } catch {}

  return newCount;
}

/**
 * Get first visit timestamp
 */
export function getFirstVisit(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(FIRST_VISIT_KEY);
}

/**
 * Get visitor profile
 */
export function getVisitorProfile(): {
  deviceId: string;
  visitCount: number;
  firstVisit: string | null;
  isReturning: boolean;
  daysSinceFirst: number | null;
} {
  const deviceId = getDeviceId();
  const visitCount = getVisitCount();
  const firstVisit = getFirstVisit();

  let daysSinceFirst: number | null = null;
  if (firstVisit) {
    const firstDate = new Date(firstVisit);
    const now = new Date();
    daysSinceFirst = Math.floor((now.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  return {
    deviceId,
    visitCount,
    firstVisit,
    isReturning: visitCount > 1,
    daysSinceFirst,
  };
}

/**
 * Get recommended hero variant based on visit count
 *
 * Strategy:
 * - 1st visit: WTF (high conversion, explain wtf this is)
 * - 2nd visit: Cognitive (more details, they're interested)
 * - 3rd visit: Skate (culture fit, they're engaged)
 * - 4+ visits: Minimal (direct, they know what's up)
 */
export function getProgressiveHeroVariant(): "wtf" | "cognitive" | "skate" | "minimal" {
  const visitCount = getVisitCount();

  if (visitCount === 1) return "wtf";
  if (visitCount === 2) return "cognitive";
  if (visitCount === 3) return "skate";
  return "minimal";
}

/**
 * Reset visit count (for testing)
 */
export function resetVisitCount() {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(VISIT_COUNT_KEY);
  localStorage.removeItem(DEVICE_ID_KEY);
  localStorage.removeItem(FIRST_VISIT_KEY);
}

export default {
  getDeviceId,
  getVisitCount,
  incrementVisit,
  getFirstVisit,
  getVisitorProfile,
  getProgressiveHeroVariant,
  resetVisitCount,
};
