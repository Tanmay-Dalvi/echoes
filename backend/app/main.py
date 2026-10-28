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

# CORS: Allow local frontend development servers and optional configured origin
default_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
]
custom_origins = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "").split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=default_origins + custom_origins,
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
    host_binding = os.getenv("BACKEND_HOST", "127.0.0.1")
    is_loopback = host_binding in ("127.0.0.1", "localhost", "::1")

    return {
        "status": "healthy",
        "app": "Echoes — A Private Memory Garden",
        "version": "1.0.0",
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
            "total_memories": total_memories
        },
        "ai": {
            "provider": "ollama",
            "model": "gemma3:1b",
            "connected": ai_status.get("connected", False),
            "model_available": ai_status.get("model_available", False),
            "offline_capable": True
        }
    }
