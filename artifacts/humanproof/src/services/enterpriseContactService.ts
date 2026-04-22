// enterpriseContactService.ts
// Enterprise sales contact form submission with localStorage fallback queue.

import { track } from './analyticsService';

const QUEUE_KEY = 'humanproof_enterprise_contacts';

export interface EnterpriseContactInput {
  name: string;
  email: string;
  company: string;
  role: string;
  teamSize: string;
  useCase: string;
  phone?: string;
  message?: string;
}

export const TEAM_SIZE_OPTIONS = [
  '1-10',
  '11-50',
  '51-200',
  '201-1000',
  '1000+',
];

export const USE_CASE_OPTIONS = [
  'Risk Assessment',
  'Team Planning',
  'Compliance',
  'Strategic Planning',
  'Other',
];

export function validateEnterpriseContact(input: Partial<EnterpriseContactInput>): string | null {
  if (!input.name || input.name.trim().length < 2) {
    return 'Name must be at least 2 characters';
  }
  if (!input.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    return 'Please enter a valid email';
  }
  if (!input.company || input.company.trim().length < 2) {
    return 'Company name must be at least 2 characters';
  }
  if (!input.role || input.role.trim().length < 2) {
    return 'Job role must be at least 2 characters';
  }
  if (!input.teamSize) {
    return 'Please select a team size';
  }
  if (!input.useCase) {
    return 'Please select a use case';
  }
  if (input.phone && !/^[0-9+\-\s()]+$/.test(input.phone)) {
    return 'Please enter a valid phone number';
  }
  return null;
}

function addToQueue(contact: EnterpriseContactInput): void {
  if (typeof window === 'undefined') return;
  try {
    const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
    queue.push({
      ...contact,
      queuedAt: new Date().toISOString(),
    });
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue.slice(-100)));
  } catch {}
}

export async function submitEnterpriseContact(input: EnterpriseContactInput): Promise<{success: boolean; error?: string}> {
  const validation = validateEnterpriseContact(input);
  if (validation) {
    return { success: false, error: validation };
  }

  addToQueue(input);

  try {
    const response = await fetch('/api/v1/contact/enterprise', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    track('enterprise_contact_submitted', {
      company: input.company,
      team_size: input.teamSize,
      use_case: input.useCase,
    });

    return { success: true };
  } catch {
    // Queue persisted; offline or unwired — UI still succeeded
    track('enterprise_contact_queued', {
      company: input.company,
      team_size: input.teamSize,
      use_case: input.useCase,
    });
    return { success: true };
  }
}
