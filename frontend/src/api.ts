import {
  Memory,
  MemoryCreate,
  HealthStatus,
  AIStatus,
  EntityExtraction,
  SummaryResult,
  TributeResult,
  NarrativeResult,
  RemembranceCard,
  ExportData,
  ImportResult,
} from './types';

const API_BASE = '/api';

export async function fetchHealth(): Promise<HealthStatus> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
  return res.json();
}

export async function fetchAIStatus(): Promise<AIStatus> {
  const res = await fetch(`${API_BASE}/ai/status`);
  if (!res.ok) throw new Error(`AI status check failed: ${res.statusText}`);
  return res.json();
}

export async function fetchMemories(params?: {
  search?: string;
  category?: string;
  tag?: string;
  person?: string;
  place?: string;
  is_fictional_demo?: boolean;
  sort?: string;
}): Promise<Memory[]> {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.category) query.set('category', params.category);
  if (params?.tag) query.set('tag', params.tag);
  if (params?.person) query.set('person', params.person);
  if (params?.place) query.set('place', params.place);
  if (params?.is_fictional_demo !== undefined) {
    query.set('is_fictional_demo', String(params.is_fictional_demo));
  }
  if (params?.sort) query.set('sort', params.sort);

  const res = await fetch(`${API_BASE}/memories?${query.toString()}`);
  if (!res.ok) throw new Error(`Failed to fetch memories: ${res.statusText}`);
  return res.json();
}

export async function fetchMemory(id: string): Promise<Memory> {
  const res = await fetch(`${API_BASE}/memories/${id}`);
  if (!res.ok) throw new Error(`Memory not found: ${res.statusText}`);
  return res.json();
}

export async function createMemory(payload: MemoryCreate): Promise<Memory> {
  const res = await fetch(`${API_BASE}/memories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to create memory: ${errorText}`);
  }
  return res.json();
}

export async function updateMemory(id: string, payload: Partial<Memory>): Promise<Memory> {
  const res = await fetch(`${API_BASE}/memories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to update memory: ${res.statusText}`);
  return res.json();
}

export async function deleteMemory(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/memories/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`Failed to delete memory: ${res.statusText}`);
}

export async function seedDemoData(resetExisting: boolean = false): Promise<{ seeded_count: number; total_memories: number }> {
  const res = await fetch(`${API_BASE}/demo/seed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reset_existing: resetExisting }),
  });
  if (!res.ok) throw new Error(`Failed to seed demo memories: ${res.statusText}`);
  return res.json();
}

export async function clearAllMemories(): Promise<void> {
  const res = await fetch(`${API_BASE}/demo/clear`, { method: 'POST' });
  if (!res.ok) throw new Error(`Failed to clear memories: ${res.statusText}`);
}

export async function clearDemoStories(): Promise<{ message: string; removed_count: number; remaining_count: number }> {
  const res = await fetch(`${API_BASE}/backup/clear-demo`, { method: 'POST' });
  if (!res.ok) throw new Error(`Failed to clear demo memories: ${res.statusText}`);
  return res.json();
}

export async function exportArchive(excludeDemo: boolean = false): Promise<ExportData> {
  const res = await fetch(`${API_BASE}/backup/export?exclude_demo=${excludeDemo}`);
  if (!res.ok) throw new Error(`Failed to export archive: ${res.statusText}`);
  return res.json();
}

export async function importArchive(
  data: ExportData,
  conflictStrategy: 'skip' | 'overwrite' | 'keep_both' = 'skip'
): Promise<ImportResult> {
  const res = await fetch(`${API_BASE}/backup/import?conflict_strategy=${conflictStrategy}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to import archive: ${err}`);
  }
  return res.json();
}

// AI Endpoints
export async function aiSummarize(params: {
  memory_id?: string;
  title?: string;
  story?: string;
  use_demo_fallback?: boolean;
}): Promise<SummaryResult> {
  const res = await fetch(`${API_BASE}/ai/summarize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'AI summarization failed');
  }
  return res.json();
}

export async function aiExtractEntities(params: {
  memory_id?: string;
  title?: string;
  story?: string;
  use_demo_fallback?: boolean;
}): Promise<EntityExtraction> {
  const res = await fetch(`${API_BASE}/ai/extract-entities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Entity extraction failed');
  }
  return res.json();
}

export async function aiRemembranceCard(params: {
  memory_id?: string;
  title?: string;
  story?: string;
  approximate_period?: string;
  use_demo_fallback?: boolean;
}): Promise<RemembranceCard> {
  const res = await fetch(`${API_BASE}/ai/remembrance-card`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Remembrance card creation failed');
  }
  return res.json();
}

export async function aiTribute(params: {
  memory_ids?: string[];
  focus_person?: string;
  titles?: string[];
  stories?: string[];
  use_demo_fallback?: boolean;
}): Promise<TributeResult> {
  const res = await fetch(`${API_BASE}/ai/tribute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Tribute composition failed');
  }
  return res.json();
}

export async function aiTimelineNarrative(params: {
  memory_ids?: string[];
  use_demo_fallback?: boolean;
}): Promise<NarrativeResult> {
  const res = await fetch(`${API_BASE}/ai/timeline-narrative`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Oral history narrative synthesis failed');
  }
  return res.json();
}
