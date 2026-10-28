# Reviewer Demo Guide — Echoes

This guide allows an evaluator or reviewer to experience the full capabilities of **Echoes** in under 3 minutes.

---

## Quick Launch

If the servers are not already running in the background, start them in two separate terminal tabs:

**Terminal 1 (Backend)**:
```bash
cd echoes
source backend/venv/bin/activate
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```

**Terminal 2 (Frontend)**:
```bash
cd echoes/frontend
npm run dev -- --host 127.0.0.1 --port 5173
```

Open your browser to: **`http://127.0.0.1:5173`**

---

## 3-Minute Guided Walkthrough

### 1. The Memory Garden (0:00 - 0:45)
- Notice the calm, warm parchment aesthetic, restrained candlelight gold accents, and respectful typography.
- Inspect the top privacy indicator: **"Echoes Private Archive • 100% Local • Loopback Bound • Zero Cloud Telemetry"**.
- View the fictional demo stories spanning different eras (e.g. *Abuela Elena's Sunday Pan Dulce*, *Arthur's Cedar Skiff in Camden Harbor*, *Maya's Solar Water Filter*).
- Type `"boat"` or `"cinnamon"` into the search box. Experience SQLite FTS5 instant filtering.
- Filter by category pills: *Tradition*, *Oral History*, *Milestone*.

### 2. The Timeline Stream (0:45 - 1:15)
- Click the **"Timeline"** tab in the navigation bar.
- Scroll through the chronological spine from 1944 (*Aunt Clara's wartime letters*) to 2005 (*Maya's science fair*).
- Notice how memories with approximate eras (e.g. *Taos Stargazing*, *Oak Street Procession*) are handled with care and respect, while undated recollections rest in their own dedicated space without artificial timestamps.

### 3. Local AI Reflections (1:15 - 2:00)
- Click the **"AI Reflections"** tab.
- Observe the **Inference Engine** status card indicating `Ollama (gemma3:1b)` active on localhost.
- **Remembrance Card Studio**:
  1. Select a story (e.g. *Arthur's Cedar Skiff*).
  2. Click **"Craft Remembrance Card (gemma3:1b)"**.
  3. Watch local open-weight inference generate an evocative card with essence, key elements, and quoted moments in ~2 seconds.
  4. Click **"Save to Memory"**.
- **Reflective Tribute Writer**:
  1. Switch to the *Reflective Tribute Writer* tool.
  2. Choose a person (e.g. *Grandfather Arthur*) and select his memory.
  3. Click **"Compose Tribute with Local AI"**.
  4. Notice the grounded, respectful commemorative prose with explicit AI-assisted labeling. Edit the text directly in the box before saving!

### 4. Preserving a New Memory (2:00 - 2:30)
- Click **"+ Preserve Memory"** in the top navigation bar.
- Type in a title and brief story.
- Click **"Auto-Extract People & Places (Local AI)"**. Local `gemma3:1b` scans the text and automatically suggests tags and entities for your review.
- Click **"Preserve Memory"** to commit it to the local SQLite database.

### 5. Sovereignty & Portability (2:30 - 3:00)
- Click the **"Backup & Data"** tab.
- Click **"Download JSON Archive"** to inspect the clean, portable JSON backup file.
- Inspect the **Privacy & Security Notice** detailing the exact location of `./data/echoes.db`.
- Test the conflict resolution selector (*Skip Duplicates*, *Overwrite*, *Keep Both*).

---

## Testing Graceful Offline AI Degradation

To verify that core archive features remain 100% usable when the AI service is stopped:
1. Stop Ollama or check the "Deterministic Fallback" toggle in the AI tab.
2. The UI instantly signals that the AI service is offline while the entire archive (CRUD, search, timeline, export/import) remains completely functional!

