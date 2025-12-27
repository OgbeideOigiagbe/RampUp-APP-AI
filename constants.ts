
import { Topic, Company } from './types';

export const TOPICS = [
  Topic.SECURITY,
  Topic.ENTERPRISE_AI,
  Topic.IAM
];

export const DEFAULT_COMPANIES: Company[] = [
  { id: '1', name: 'Okta', blogUrl: 'https://www.okta.com/blog' },
  { id: '2', name: 'Microsoft', blogUrl: 'https://www.microsoft.com/en-us/security/blog' },
  { id: '3', name: 'Google Cloud', blogUrl: 'https://cloud.google.com/blog' },
  { id: '4', name: 'CrowdStrike', blogUrl: 'https://www.crowdstrike.com/blog' },
  { id: '5', name: 'OpenAI', blogUrl: 'https://openai.com/news' }
];

// Legacy key for migration
export const STORAGE_KEY_LEGACY = 'rampup_app_state';

// Split keys for robust persistence
export const STORAGE_KEY_SETTINGS = 'rampup_settings_v1'; // Critical: Companies, Read/Saved lists
export const STORAGE_KEY_CACHE = 'rampup_data_cache_v1'; // Non-critical: News articles
