# Technical Architecture — Echoes

**Echoes: A Private Memory Garden** is designed from first principles as a local-first, privacy-guaranteed personal archive powered by open-weight artificial intelligence.

```mermaid
flowchart TD
    subgraph Client["Frontend Client (Browser - Port 5173)"]
        UI["Echoes Web UI\n(React 19 + TypeScript + Tailwind v4)"]
        Garden["Memory Garden Dashboard"]
        Timeline["Timeline View"]
        Studio["AI Studio"]
        Backup["Backup & Portability"]
        UI --> Garden
        UI --> Timeline
        UI --> Studio
        UI --> Backup
    end

    subgraph PrivacyBoundary["Strict Privacy Boundary (127.0.0.1 Loopback Only)"]
        API["FastAPI Backend Service\n(Port 8000 / Uvicorn)"]
        Router["API Routers\n(/memories, /ai, /backup, /demo)"]
        PydanticVal["Structured Output Validation\n(Pydantic V2 Schemas)"]
        DBEngine["Storage Engine\n(SQLite3 + FTS5 Full-Text Search)"]
        OllamaBridge["Ollama Client Adapter\n(Strict Grounding & Ethics Prompts)"]
        API --> Router
        Router --> DBEngine
        Router --> OllamaBridge
        OllamaBridge --> PydanticVal
    end

    subgraph LocalStorage["Local Disk Storage"]
        DBFile[("./data/echoes.db\nSQLite File")]
        ExportFile[("User JSON Backups\nechoes-archive-*.json")]
        DBEngine --> DBFile
        Backup -.-> ExportFile
    end

    subgraph LocalInference["Local Open-Weight Inference (Port 11434)"]
        OllamaSvc["Ollama Daemon\n(http://127.0.0.1:11434)"]
        GemmaModel["gemma3:1b Model Weights\n(806 MB Q4 Quantized)"]
        OllamaSvc --> GemmaModel
    end

    UI <== "HTTP / JSON Proxy" ==> API
    OllamaBridge <== "Local Loopback POST" ==> OllamaSvc
    PydanticVal ==> "Validated Structured Result" ==> Studio
    Studio ==> "User Review & Explicit Approval" ==> Router
```

---

## 1. System Components

### A. Frontend Application
- **Framework**: React 19, TypeScript, Vite 8, Tailwind CSS v4.
- **Icons**: Lucide React.
- **Typography & Assets**: 100% self-contained using system fonts (Georgia, Playfair serif, system sans-serif) and local SVG icons. Zero external CDN or font calls.
- **Network Boundary**: Communicates exclusively with `http://127.0.0.1:8000` via Vite development proxy or direct loopback REST API calls.

### B. Backend Application Service
- **Framework**: FastAPI with Python 3.14 / Uvicorn.
- **Host Binding**: Defaults strictly to `127.0.0.1:8000` (loopback only). Rejects external network exposure.
- **Validation**: Pydantic V2 models with strict type enforcement and sanitization.
- **CORS Policy**: Restricted strictly to local origins (`localhost:5173`, `127.0.0.1:5173`, `localhost:4173`, `127.0.0.1:4173`).

### C. Persistent Storage Engine
- **Engine**: SQLite 3 with Write-Ahead Logging (WAL) and FTS5 full-text indexing.
- **Location**: `./data/echoes.db`.
- **Search Capabilities**: Sub-millisecond full-text queries across memory titles, story prose, people names, places, and tags with automatic SQLite triggers keeping the search index in sync.
- **Integrity**: Parameterized SQL queries ensure zero risk of SQL injection.

### D. Local Open-Weight AI Inference
- **Inference Runtime**: Ollama running locally at `http://127.0.0.1:11434`.
- **Model**: `gemma3:1b` (999.89M parameters, Q4_K_M quantized, 806 MB footprint).
- **Hardware Profile**: Runs comfortably on 16 GB RAM with integrated graphics without requiring expensive discrete GPUs.
- **Grounding & Ethical Rules**:
  - System prompts strictly forbid hallucinating family members, dates, or facts.
  - The model never attempts to speak in the first person as deceased individuals or simulate consciousness.
  - All outputs are validated into structured Pydantic schemas before reaching the UI.
  - Output must be reviewed and explicitly accepted by the user before persisting.

---

## 2. Data Models

### Memory Schema (`models.py`)
```json
{
  "id": "uuid-v4",
  "title": "Abuela Elena's Sunday Pan Dulce",
  "story": "Every Sunday morning before the bells of Saint Jude...",
  "date": "1975-10-12",
  "approximate_period": "Autumn 1975",
  "category": "Tradition",
  "people": ["Abuela Elena", "Carlos"],
  "places": ["East Los Angeles", "Michoacán"],
  "tags": ["baking", "pan dulce", "sunday mornings"],
  "is_fictional_demo": true,
  "ai_remembrance_card": {
    "title": "The Baker's Intuition",
    "essence": "Sunday mornings measured not in ounces or minutes...",
    "key_elements": ["East Los Angeles kitchen", "Conchas", "Michoacán citrus groves"],
    "quote_or_moment": "She claimed her palms could feel when the dough was ready.",
    "generated_at": "2026-10-28T10:00:00Z",
    "model": "gemma3:1b",
    "is_ai_assisted": true
  },
  "ai_tribute": "In loving memory of Abuela Elena...",
  "ai_summary": "A cherished ritual in East Los Angeles...",
  "created_at": "2026-10-28T10:00:00Z",
  "updated_at": "2026-10-28T10:00:00Z"
}
```

---

## 3. Portability & Backup Specification

Export payloads follow Schema Version 1:
```json
{
  "version": 1,
  "application": "Echoes",
  "exported_at": "2026-10-28T12:00:00Z",
  "count": 6,
  "memories": [ ... ]
}
```

Conflict Strategies on Restore:
- `skip`: Preserves existing memories if ID matches; imports only novel memories.
- `overwrite`: Replaces existing matching memories with incoming record.
- `keep_both`: Generates a fresh UUID and suffixes title with `(Imported Copy)` so both versions are preserved.

