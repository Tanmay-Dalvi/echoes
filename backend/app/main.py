import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import init_db, count_memories
from .ollama_client import OllamaClient
from .routes.memories import router as memories_router, seed_router
from .routes.ai import router as ai_router
from .routes.backup import router as backup_router

ollama_client = OllamaClient()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure SQLite database tables and triggers are created
    init_db()
    yield

app = FastAPI(
    title="Echoes API — A Private Memory Garden",
    description="Local-first, privacy-respecting memory archive powered by open-weight AI (gemma3:1b).",
    version="1.0.0",
    lifespan=lifespan
)

# CORS: Allow local frontend development servers and configured origins
default_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
]
frontend_env = [f.strip() for f in [os.getenv("FRONTEND_URL", "")] if f.strip()]
custom_origins = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "").split(",") if o.strip()]
raw_origins = list(dict.fromkeys(default_origins + frontend_env + custom_origins))
# Filter out wildcard if present to never mix '*' with allow_credentials=True
allowed_origins = [o for o in raw_origins if o != "*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"^https:\/\/.*\.onrender\.com$",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(memories_router)
app.include_router(seed_router)
app.include_router(ai_router)
app.include_router(backup_router)

@app.get("/api/health", tags=["system"])
async def health_check():
    ai_status = await ollama_client.check_status()
    total_memories = count_memories()
    is_render = bool(os.getenv("RENDER"))
    default_host = "0.0.0.0" if is_render else "127.0.0.1"
    host_binding = os.getenv("BACKEND_HOST", default_host)
    is_loopback = (not is_render) and (host_binding in ("127.0.0.1", "localhost", "::1"))
    db_path = os.getenv("ECHOES_DB_PATH", "./data/echoes.db")
    is_ephemeral = is_render and not db_path.startswith("/var/data")

    return {
        "status": "healthy",
        "app": "Echoes — A Private Memory Garden",
        "version": "1.0.0",
        "deployment": "render" if is_render else "local",
        "privacy": {
            "local_only": is_loopback,
            "telemetry": False,
            "cloud_fallback": False,
            "host_binding": host_binding,
            "is_loopback": is_loopback,
            "mode": "self_hosted_local" if is_loopback else "remote_hosted"
        },
        "storage": {
            "type": "sqlite3_fts5",
            "total_memories": total_memories,
            "is_ephemeral": is_ephemeral,
            "persistence_notice": (
                "Ephemeral storage active. Data resets on service restart unless a Render Persistent Disk is attached at /var/data."
                if is_ephemeral
                else "Persistent storage active."
            )
        },
        "ai": {
            "provider": "ollama",
            "model": "gemma3:1b",
            "connected": ai_status.get("connected", False),
            "model_available": ai_status.get("model_available", False),
            "offline_capable": True
        }
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("BACKEND_HOST", "0.0.0.0" if os.getenv("RENDER") else "127.0.0.1")
    uvicorn.run("backend.app.main:app", host=host, port=port, reload=False)

