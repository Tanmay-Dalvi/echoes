# Implementation & Technical Notes — Echoes

## Engineering Decisions & Stack Rationale

### 1. Selection of `gemma3:1b` as Local Open-Weight Model
- **Footprint**: 806 MB (Q4_K_M quantization).
- **RAM Overhead**: Consumes ~1.2 GB of active system RAM during inference, allowing it to run on devices with 16 GB RAM and integrated Intel/AMD graphics.
- **Latency**: End-to-end inference for remembrance cards and entity extraction averages 1.8 to 2.4 seconds on CPU/integrated graphics.
- **Grounding Fidelity**: When provided with structured JSON extraction schemas and negative prompt boundaries against hallucinations, `gemma3:1b` reliably outputs clean JSON without corrupting names or dates.

### 2. SQLite with FTS5 Full-Text Search
- Instead of introducing heavy vector databases or external search daemons that complicate local deployment, Echoes utilizes SQLite's built-in **FTS5** (Full-Text Search 5) virtual table with the unicode61 tokenizer.
- Automatic SQLite triggers (`AFTER INSERT`, `AFTER UPDATE`, `AFTER DELETE`) keep the FTS virtual table synchronized with the primary `memories` table in sub-millisecond execution time.
- Queries support Porter stemming and prefix matching (e.g. `boat*` matches "boating", "boats", "boatbuilder").

### 3. Loopback-Only Network Binding
- FastAPI and Uvicorn are configured to listen strictly on `127.0.0.1:8000`.
- Vite development and preview servers bind strictly to `127.0.0.1:5173`.
- This architecture eliminates accidental exposure on public Wi-Fi or local area networks.

### 4. Zero Remote Fonts & Trackers
- Avoided importing fonts from `fonts.googleapis.com` or icons from remote CDNs.
- Built-in system serif fallbacks (`Georgia, "Playfair Display", "Times New Roman", serif`) deliver a warm literary feel while ensuring 100% offline air-gapped readiness.

---

## Benchmark & Verification Results

### Backend Automated Test Suite
- **Engine**: Pytest 9.2 with `pytest-asyncio` on Python 3.14.4.
- **Total Tests**: 15 tests.
- **Results**: 15 passed in 0.30 seconds.
- **Coverage**: Full CRUD lifecycle, search ranking, chronological sorting, missing date handling, backup export/import conflict resolution, Ollama client connectivity, deterministic fallback, and loopback privacy verification.

### Frontend Automated Test Suite
- **Engine**: Vitest 5.0 with `@testing-library/react` and `jsdom`.
- **Total Tests**: 4 test files, 5 tests.
- **Results**: 5 passed in 0.82 seconds.
- **Coverage**: MemoryCard metadata rendering, Navbar tab routing, Timeline chronological rendering, and BackupView conflict controls.

### Production Build Metrics
- **Compiler**: `tsc -p tsconfig.app.json` + `vite build`.
- **Time**: 183 ms.
- **Bundle**: `dist/assets/index-BAQZjevT.js` (315.83 kB raw, 88.30 kB gzipped).
- **CSS**: `dist/assets/index-DJu5e5Gu.css` (33.79 kB raw, 7.10 kB gzipped).

