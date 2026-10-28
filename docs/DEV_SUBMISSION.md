---
title: Echoes — A Private Memory Garden (Powered by Local Open-Weight AI)
published: false
tags: devchallenge, hf26challenge, opensource, ai
---

## What I Built

**Echoes** is a privacy-first, local-first digital sanctuary for preserving family stories, oral histories, cherished traditions, and the memories of loved ones that might otherwise fade with time.

Built for the **Hacktoberfest 2026 Open-Source AI Challenge (Week 4: Ghost in the Machine)**, Echoes takes a deeply human, respectful approach to the theme. Rather than building a gimmicky novelty chatbot or claiming to "resurrect" deceased relatives, Echoes uses a locally running open-weight language model (**Google's `gemma3:1b`**) as an archival assistant: organizing scattered recollections, surfacing key people and places, synthesizing chronological family timelines, and crafting dignified remembrance cards and tributes that remain **100% on the user's machine**.

### Core Capabilities

- **Memory Garden Archive**: A warm, atmospheric dashboard presenting preserved stories with instant SQLite FTS5 full-text search across titles, narratives, people, places, and tags.
- **The Stream of Time**: A chronological timeline that maps dated milestones across generations while respecting and honoring undated recollections in their own timeless space without fabricated timestamps.
- **Remembrance Card Studio**: Local open-weight AI distills the emotional and historical essence of a memory into an evocative keepsake card with key elements and quoted moments.
- **Reflective Tribute Writer**: Composes commemorative essays celebrating an ancestor or loved one, strictly grounded in preserved memories and clearly labeled as AI-assisted.
- **Automatic Entity Extraction**: Scans family narratives during memory creation to suggest candidate people, locations, eras, and themes for user review.
- **Generational Oral History Synthesis**: Weaves multiple recollections across decades into a unified, continuous oral history narrative.
- **Full Data Sovereignty**: Export your entire archive to portable, human-readable JSON files and restore with customizable conflict handling (*Skip Duplicates*, *Overwrite*, or *Keep Both*).

---

## Demo

<!-- Screenshot Placeholder 1: Main Memory Garden Dashboard -->
![Echoes Memory Garden Dashboard](https://raw.githubusercontent.com/Tanmay-Dalvi/echoes/main/docs/screenshots/garden-archive.png)
*Figure 1: The Echoes Memory Garden displaying preserved fictional family memories, overview metrics, search, and category filters.*

<!-- Screenshot Placeholder 2: Chronological Timeline Stream -->
![Chronological Timeline Stream](https://raw.githubusercontent.com/Tanmay-Dalvi/echoes/main/docs/screenshots/timeline.png)
*Figure 2: The Stream of Time mapping generational memories from 1944 to 2005.*

<!-- Screenshot Placeholder 3: AI Remembrance Card Studio -->
![Local AI Remembrance Card Studio](https://raw.githubusercontent.com/Tanmay-Dalvi/echoes/main/docs/screenshots/ai-reflections.png)
*Figure 3: On-device inference with gemma3:1b generating an evocative remembrance card in ~2 seconds.*

<!-- Screenshot Placeholder 4: Preserve Memory with AI Entity Extraction -->
![Preserve Memory with AI Entity Extraction](https://raw.githubusercontent.com/Tanmay-Dalvi/echoes/main/docs/screenshots/preserve-memory.png)
*Figure 4: Grounded entity extraction suggesting people, places, and tags with live user review before saving.*

<!-- Screenshot Placeholder 5: Backup, Restore & Privacy Audit -->
![Backup, Restore & Privacy Audit](https://raw.githubusercontent.com/Tanmay-Dalvi/echoes/main/docs/screenshots/backup-restore.png)
*Figure 5: 100% loopback verification, SQLite local storage details, and portable JSON export.*

### Running the Demo Locally (2 Minutes)

Echoes is engineered to run on standard consumer hardware (16 GB RAM, integrated graphics) without cloud dependencies or paid API keys.

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Tanmay-Dalvi/echoes.git
   cd echoes
   ```

2. **Ensure Ollama has `gemma3:1b` installed**:
   ```bash
   ollama pull gemma3:1b
   ```

3. **Launch the Backend (FastAPI)**:
   ```bash
   python3 -m venv backend/venv
   source backend/venv/bin/activate
   pip install -r backend/requirements.txt
   uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
   ```

4. **Launch the Frontend (Vite + React)**:
   ```bash
   cd frontend
   npm install
   npm run dev -- --host 127.0.0.1 --port 5173
   ```

5. Open your browser at **`http://127.0.0.1:5173`**. The application automatically seeds 6 respectfully composed fictional demo stories for immediate exploration.

---

## Code

- **GitHub Repository**: [https://github.com/Tanmay-Dalvi/echoes](https://github.com/Tanmay-Dalvi/echoes)
- **License**: MIT License (Open Source)

---

## How I Built It

Echoes was designed around three non-negotiable principles: **zero cloud leakage**, **sub-second search responsiveness**, and **uncompromising ethical grounding**.

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
        DBEngine --> DBFile
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

### The Stack

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide React.
  - No external Google Fonts, CDN scripts, or tracking pixels. All typography is rendered with beautiful system serif and sans-serif typefaces.
- **Backend**: FastAPI with Python 3.14.
  - Binds strictly to `127.0.0.1:8000` to prevent exposure on local networks.
- **Storage**: SQLite 3 with Write-Ahead Logging (WAL) and FTS5 (Full-Text Search).
  - Uses SQLite triggers (`AFTER INSERT`, `UPDATE`, `DELETE`) to maintain instant search indices over memory titles, story prose, people, places, and tags.
- **Local AI Provider**: Ollama running `gemma3:1b` (806 MB Q4_K_M quantized).
  - Uses structured negative prompting and Pydantic output validation to ensure high fidelity and eliminate hallucinations.

### Grounding & The Ethical Boundary

When dealing with memories of departed family members, AI hallucinations are not just minor bugs—they can be emotionally painful and disrespectful. Echoes introduces strict safety boundaries:

1. **Negative Prompting**: The system prompt strictly prohibits inventing names, dates, relations, or events.
2. **Refusal to Impersonate**: The model will never generate text speaking in the first person as a deceased loved one or simulate "conversations from beyond".
3. **Mandatory Human-in-the-Loop Review**: Generated summaries and tributes are presented in an editable review panel. Nothing is committed to the database without explicit user approval.
4. **Offline Fallback Guarantee**: If Ollama is offline or the model is not loaded, all core functions (creating, editing, searching, timeline navigation, exporting, and importing) continue working with zero disruption.

---

## Why Does Open Innovation Matter?

When we record our family histories—how a great-grandmother fled a war, the recipe for holiday bread taught by hand, or the quiet courage of a grandfather building a skiff in winter—we are archiving the most intimate data imaginable.

If building memory archives requires sending those stories to closed proprietary cloud APIs, several grave problems arise:

1. **Data Colonization & Exploitation**: Proprietary AI providers routinely reserve the right to ingest user prompts into training corpora, commercial data lakes, or human review queues. Our private family heritage should never become training fodder for advertising algorithms.
2. **Ephemeral Access & Lock-In**: Cloud APIs change pricing, deprecate endpoints, and revoke access at will. An archive designed to last generations cannot depend on a service that might be shut down or paywalled in five years.
3. **The Air-Gap Imperative**: True privacy requires that stories can be recorded, searched, and reflected upon on an air-gapped machine in a remote village or a living room with no internet connection.

Open innovation—open-weight models like **Gemma 3**, open runtimes like **Ollama**, and open-source database engines like **SQLite**—democratizes artificial intelligence. It transforms AI from an extractive cloud utility into a personal, sovereign instrument that users own, inspect, and control forever.

---

## The Spirit of It

The theme **"Ghost in the Machine"** resonates deeply with Halloween, Día de los Muertos, and ancestral remembrance.

In Día de los Muertos traditions, a person truly dies only when they are forgotten by the living (*la última muerte*). Echoes honors this tradition not by conjuring digital specters or fabricating simulated voices, but by providing a tranquil sanctuary where real human memories can be lovingly preserved, organized, and passed down across generations.

The only "ghost" in Echoes is the warmth of words written down before they could fade.

---

## Verified Capabilities vs. Planned Enhancements

### Verified in Current Release (v1.0.0)
- [x] Full local SQLite storage with FTS5 search indexing.
- [x] Responsive Memory Garden dashboard with parchment aesthetic.
- [x] Chronological timeline with graceful handling of approximate eras and undated memories.
- [x] Local open-weight inference using `gemma3:1b` via Ollama.
- [x] Auto-extraction of candidate people, places, dates, and themes from story text.
- [x] Remembrance Card generation with structured Pydantic schema validation.
- [x] Commemorative tribute writing with live in-browser editing before saving.
- [x] Multi-generational oral history narrative synthesis.
- [x] Documented JSON export and import with conflict resolution (*Skip*, *Overwrite*, *Keep Both*).
- [x] Zero-telemetry, loopback-only network binding (`127.0.0.1`).
- [x] 15 passing backend unit/integration tests and 5 passing frontend test suites.

### Planned for Future Enhancements
- [ ] Offline audio oral-history recording with local open-weight transcription (e.g. Whisper.cpp).
- [ ] Local vector embeddings for semantic thematic clustering across decades.
- [ ] Optional encrypted-at-rest database storage via SQLCipher.
- [ ] Printable PDF commemorative remembrance booklets.

---

## Prize Categories

- **Overall Open-Source AI Project**
- **Best Use of Open-Weight Models & Local Inference (`gemma3:1b`)**
- **Best Privacy-First / Offline Architecture**

