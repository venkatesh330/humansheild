// whiteLabelService.ts
// Enterprise white-label config. Applied to exports and shareable reports.

import { track } from './analyticsService';

const STORAGE_KEY = 'humanproof_white_label';

export interface WhiteLabelConfig {
  enabled: boolean;
  brandName: string;
  primaryColor: string;
  accentColor: string;
  logoDataUrl: string;
  footerDisclaimer: string;
  reportTitle: string;
  hideHumanProofBranding: boolean;
}

export const DEFAULT_CONFIG: WhiteLabelConfig = {
  enabled: false,
  brandName: '',
  primaryColor: '#00F5FF',
  accentColor: '#A855F7',
  logoDataUrl: '',
  footerDisclaimer: '',
  reportTitle: 'AI Displacement Risk Report',
  hideHumanProofBranding: false,
};

export function getWhiteLabelConfig(): WhiteLabelConfig {
  if (typeof window === 'undefined') return DEFAULT_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CONFIG;
    return { ...DEFAULT_CONFIG, ...(JSON.parse(raw) as Partial<WhiteLabelConfig>) };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function saveWhiteLabelConfig(partial: Partial<WhiteLabelConfig>): WhiteLabelConfig {
  const current = getWhiteLabelConfig();
  const next = { ...current, ...partial };
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  track('white_label_updated', {
    enabled: next.enabled,
    has_logo: Boolean(next.logoDataUrl),
    hide_branding: next.hideHumanProofBranding,
  });
  applyWhiteLabelCssVars(next);
  return next;
}

export function resetWhiteLabelConfig(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  applyWhiteLabelCssVars(DEFAULT_CONFIG);
  track('white_label_reset', {});
}

export function applyWhiteLabelCssVars(config: WhiteLabelConfig): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (!config.enabled) {
    root.style.removeProperty('--wl-primary');
    root.style.removeProperty('--wl-accent');
    return;
  }
  if (config.primaryColor) root.style.setProperty('--wl-primary', config.primaryColor);
  if (config.accentColor) root.style.setProperty('--wl-accent', config.accentColor);
}

export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
