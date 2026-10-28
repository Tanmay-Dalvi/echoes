# Deploying Echoes on Render (Cloud Preview Guide)

This guide provides complete instructions for deploying **Echoes — A Private Memory Garden** to [Render](https://render.com) for public review, demonstrations, and hackathon evaluation.

---

## 1. Architectural Overview: Local vs. Cloud Preview

| Dimension | Local Self-Hosted (Primary Mode) | Render Cloud Preview (Demo Mode) |
| :--- | :--- | :--- |
| **Primary Purpose** | Personal family archive & oral history preservation | Public demo & Hacktoberfest review |
| **Network Binding** | Loopback only (`127.0.0.1:8000`) | Bound to `0.0.0.0:$PORT` |
| **CORS Policy** | Restricted to local origins (`localhost:5173`) | Restricted to `*.onrender.com` & configured origins |
| **Data Storage** | Local SQLite file (`./data/echoes.db`) | Ephemeral (Free tier) or Persistent Disk (`/var/data`) |
| **AI Inference** | Local Ollama (`gemma3:1b`) on device | Labeled deterministic demo fallback (or self-hosted Ollama) |
| **Zero Telemetry** | Verified & enforced | Verified & enforced (no tracking/cloud fallback) |

> [!IMPORTANT]
> **Privacy Notice**: Cloud web services running on Render **cannot** access a local Ollama daemon running on your personal laptop (`127.0.0.1:11434`). In cloud preview mode, Echoes truthfully displays **`AI Offline (Archive Active)`** and provides clearly labeled deterministic demo generation. Under no circumstances will Echoes silently transmit memory content to proprietary third-party cloud LLMs.

---

## 2. Option A: Blueprint Deployment (Recommended)

Echoes includes a pre-configured `render.yaml` Blueprint specification that automatically provisions both the backend API and the frontend static site with correct routing and environment injection.

### Step-by-Step Blueprint Setup

1. Fork or push your Echoes repository to GitHub (`https://github.com/<your-username>/echoes`).
2. Log in to the [Render Dashboard](https://dashboard.render.com).
3. Click **New +** in the top navigation and select **Blueprint**.
4. Connect your GitHub repository.
5. Render will detect `render.yaml` and display two services:
   - **`echoes-backend`** (Web Service, Python)
   - **`echoes-frontend`** (Static Site, Node/Vite)
6. Click **Apply**. Render will initiate concurrent builds:
   - The backend service installs dependencies from `backend/requirements.txt` and starts Uvicorn.
   - The frontend builds static assets using `npm run build` and automatically receives `VITE_API_BASE_URL` from the backend service.

---

## 3. Option B: Manual Dashboard Deployment

If you prefer to configure services manually via the Render UI:

### Service 1: Backend API (Web Service)

1. Navigate to **New +** > **Web Service**.
2. Select your repository.
3. Configure the following settings:
   - **Name**: `echoes-backend`
   - **Region**: Choose any region (e.g., `Oregon (US West)`)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: `Free`
4. Expand **Advanced** and set:
   - **Health Check Path**: `/api/health`
5. Add the following **Environment Variables**:
   | Key | Value | Notes |
   | :--- | :--- | :--- |
   | `PYTHON_VERSION` | `3.11.9` | Stable Python runtime on Render |
   | `RENDER` | `true` | Signals cloud hosting mode |
   | `BACKEND_HOST` | `0.0.0.0` | Allows Render routing proxy |
   | `ECHOES_DB_PATH` | `./data/echoes.db` | Local database path |
   | `ALLOWED_ORIGINS` | `https://<your-frontend-app>.onrender.com` | (Optional: `main.py` auto-allows `*.onrender.com`) |
6. Click **Create Web Service**. Note the assigned URL (e.g., `https://echoes-backend-xyz.onrender.com`).

---

### Service 2: Frontend Static Site (Static Site)

1. Navigate to **New +** > **Static Site**.
2. Select your repository.
3. Configure the following settings:
   - **Name**: `echoes-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add the following **Environment Variables**:
   | Key | Value | Notes |
   | :--- | :--- | :--- |
   | `NODE_VERSION` | `20.18.0` | Node LTS runtime |
   | `VITE_API_BASE_URL` | `https://<your-backend-app>.onrender.com` | Full URL to your backend Web Service |
5. Add **Rewrite Rules** (under Redirects/Rewrites):
   - **Type**: `Rewrite`
   - **Source**: `/*`
   - **Destination**: `/index.html`
6. Click **Create Static Site**.

---

## 4. Database Persistence & Storage Architecture

### Ephemeral Filesystem (Render Free Tier)
Render Free Web Services use an ephemeral filesystem. This means:
- The SQLite database located at `./data/echoes.db` is stored on the local container disk.
- When the container spins down due to inactivity (15 minutes idle on Free tier) or when a new deployment occurs, **the ephemeral container is reset**.
- **User Action**: For cloud demos, users can click **"Merge Fictional Demo Stories"** in the **Backup & Data** tab to immediately re-populate test data. Users can also export an encrypted or plain JSON archive and restore it at any time.

### Persistent Disk (Optional Paid Upgrade)
To ensure memories persist permanently across restarts and deployments on Render:
1. Upgrade the backend service to an instance type that supports disks (e.g., Starter).
2. Under **Disks**, add a new disk:
   - **Mount Path**: `/var/data`
   - **Size**: `1 GB` (or larger)
3. Set the environment variable:
   ```env
   ECHOES_DB_PATH=/var/data/echoes.db
   ```
4. Echoes will automatically ensure directory `/var/data` exists and initialize the SQLite database within the persistent disk.

---

## 5. Health Check & Verification Checklist

Once deployed, verify the installation using the following steps:

### 1. Backend Health Check
Send a GET request to `https://<backend-url>/api/health`:
```bash
curl -s https://<backend-url>/api/health | jq .
```
Expected output:
```json
{
  "status": "healthy",
  "app": "Echoes — A Private Memory Garden",
  "version": "1.0.0",
  "deployment": "render",
  "privacy": {
    "local_only": false,
    "telemetry": false,
    "cloud_fallback": false,
    "host_binding": "0.0.0.0",
    "is_loopback": false,
    "mode": "remote_hosted"
  },
  "storage": {
    "type": "sqlite3_fts5",
    "total_memories": 0,
    "is_ephemeral": true,
    "persistence_notice": "Ephemeral storage active. Data resets on service restart unless a Render Persistent Disk is attached at /var/data."
  },
  "ai": {
    "provider": "ollama",
    "model": "gemma3:1b",
    "connected": false,
    "model_available": false,
    "offline_capable": true
  }
}
```

### 2. Frontend Connectivity
1. Open `https://<frontend-url>` in your browser.
2. Confirm the top navigation banner reads:
   ```
   Echoes Archive • Hosted Preview Mode • Zero Cloud Telemetry • Run locally for on-device Ollama
   ```
3. Confirm the AI badge indicates:
   ```
   AI Offline (Archive Active)
   ```
4. Navigate to **Backup & Data** > click **Merge Fictional Demo Stories**.
5. Return to the **Garden & Archive** tab to verify that the 6 fictional stories render properly with timelines, tags, and remembrance cards.

---

## 6. Troubleshooting Common Issues

### Issue: Frontend displays "Failed to connect to local Echoes service"
- **Cause**: `VITE_API_BASE_URL` was not configured during frontend build, or points to the wrong URL.
- **Fix**: Check `VITE_API_BASE_URL` in the frontend static site settings. Trigger a **Manual Deploy > Clear build cache & deploy**.

### Issue: Backend takes 45–60 seconds to respond on initial load
- **Cause**: Render Free tier spins down web services after 15 minutes of inactivity (cold start).
- **Fix**: Wait 30 seconds for the free container to wake up. Once warmed, requests execute with sub-millisecond SQLite queries.

### Issue: CORS error in browser developer console
- **Cause**: Origin not recognized.
- **Fix**: By default, `backend/app/main.py` permits all `https://*.onrender.com` origins via `allow_origin_regex`. If you use a custom domain (e.g. `https://echoes.example.com`), add it to the backend's `ALLOWED_ORIGINS` environment variable.

