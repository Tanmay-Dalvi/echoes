export interface RemembranceCard {
  title: string;
  essence: string;
  key_elements: string[];
  quote_or_moment?: string | null;
  generated_at: string;
  model: string;
  is_ai_assisted: boolean;
}

export interface Memory {
  id: string;
  title: string;
  story: string;
  date?: string | null;
  approximate_period?: string | null;
  category: string;
  people: string[];
  places: string[];
  tags: string[];
  is_fictional_demo?: boolean;
  ai_remembrance_card?: RemembranceCard | null;
  ai_tribute?: string | null;
  ai_summary?: string | null;
  created_at: string;
  updated_at: string;
}

export type MemoryCreate = Omit<Memory, 'id' | 'created_at' | 'updated_at' | 'ai_remembrance_card' | 'ai_tribute' | 'ai_summary'> & {
  ai_remembrance_card?: RemembranceCard | null;
  ai_tribute?: string | null;
  ai_summary?: string | null;
  is_fictional_demo?: boolean;
};

export interface AIStatus {
  connected: boolean;
  model_available: boolean;
  configured_model: string;
  available_models?: string[];
  offline_capable: boolean;
  error?: string;
}

export interface HealthStatus {
  status: string;
  app: string;
  version: string;
  privacy: {
    local_only: boolean;
    telemetry: boolean;
    cloud_fallback: boolean;
    host_binding: string;
    is_loopback?: boolean;
    mode?: string;
  };
  storage: {
    type: string;
    total_memories: number;
  };
  ai: {
    provider: string;
    model: string;
    connected: boolean;
    model_available: boolean;
    offline_capable: boolean;
  };
}

export interface EntityExtraction {
  people: string[];
  places: string[];
  dates_or_periods: string[];
  themes: string[];
  is_ai_assisted: boolean;
  model: string;
}

export interface SummaryResult {
  summary: string;
  is_ai_assisted: boolean;
  model: string;
}

export interface TributeResult {
  tribute: string;
  grounding_note: string;
  is_ai_assisted: boolean;
  model: string;
}

export interface NarrativeResult {
  narrative: string;
  themes: string[];
  chronology_order: string[];
  is_ai_assisted: boolean;
  model: string;
}

export interface ExportData {
  version: number;
  application: string;
  exported_at: string;
  count: number;
  memories: Memory[];
}

export interface ImportResult {
  total_processed: number;
  imported: number;
  updated: number;
  skipped: number;
  errors: string[];
}
