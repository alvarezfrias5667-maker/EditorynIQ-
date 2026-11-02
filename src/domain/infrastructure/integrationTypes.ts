/**
 * EDITORYNIQ™ INFRASTRUCTURE & INTEGRATION AUTHORITY
 * Canonical types and verified connection statuses for E1–E6 engines.
 */

export type InfrastructureStatus =
  | 'LOCAL_AVAILABLE'      // Active in local storage / IndexedDB / in-memory
  | 'NOT_CONFIGURED'       // External service credentials/configuration missing
  | 'BLOCKED_EXTERNAL'     // Requires third-party account authorization or network
  | 'CONNECTED_VERIFIED'   // Live verified external connection
  | 'ERROR';               // Technical fault encountered

export type EngineStage =
  | 'E1_INTELLIGENCE'
  | 'E2_MANUSCRIPT'
  | 'E3_VISUAL'
  | 'E4_EDITORIAL'
  | 'E5_PUBLISHING'
  | 'E6_MARKETPLACE';

export type ProviderCategory =
  | 'STORAGE_LOCAL'
  | 'DATABASE_SUPABASE'
  | 'AI_BACKEND'
  | 'DISTRIBUTION_CHANNELS'
  | 'COMMERCE_GATEWAY';

export interface ProviderDescriptor {
  id: string;
  name: string;
  category: ProviderCategory;
  targetService: string;
  status: InfrastructureStatus;
  statusDetails: string;
  isExternal: boolean;
  requiresCredentials: boolean;
  lastCheckedAt: string;
  configurationGuide?: string;
  capabilities: string[];
}

export interface CanonicalTraceStep {
  stage: EngineStage;
  stageName: string;
  identifierKey: string;
  identifierValue: string | null;
  status: 'VERIFIED' | 'MISSING' | 'PENDING' | 'LOCAL_ONLY';
  details: string;
  sha256Evidence?: string;
  timestamp?: string;
}

export interface CanonicalTraceabilityRecord {
  bookId: string;
  bookTitle: string;
  evaluatedAt: string;
  isComplete: boolean;
  steps: CanonicalTraceStep[];
}

export interface SystemInfrastructureReport {
  generatedAt: string;
  overallStatus: InfrastructureStatus;
  storageProvider: ProviderDescriptor;
  supabaseProvider: ProviderDescriptor;
  aiBackendProvider: ProviderDescriptor;
  distributionProviders: ProviderDescriptor[];
  commerceProvider: ProviderDescriptor;
  summary: string;
}
