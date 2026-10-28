import os
import re
from pathlib import Path

def test_no_telemetry_or_cloud_keys():
    app_dir = Path(__file__).resolve().parent.parent / "app"
    forbidden_tokens = [
        "api.openai.com",
        "api.anthropic.com",
        "generativelanguage.googleapis.com",
        "google-analytics.com",
        "mixpanel",
        "segment.io",
        "sentry.io",
        "datadoghq"
    ]
    for py_file in app_dir.rglob("*.py"):
        content = py_file.read_text(encoding="utf-8")
        for token in forbidden_tokens:
            assert token not in content, f"Found forbidden telemetry/cloud token {token} in {py_file}"

def test_backend_default_binding():
    # Verify default binding in code or main
    from backend.app.ollama_client import DEFAULT_OLLAMA_URL
    assert "127.0.0.1" in DEFAULT_OLLAMA_URL or "localhost" in DEFAULT_OLLAMA_URL

def test_database_local_path():
    from backend.app.database import get_db_path
    db_path = get_db_path()
    assert "echoes.db" in db_path
    assert not db_path.startswith("http")
