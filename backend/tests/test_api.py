import tempfile
import os
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database import init_db

@pytest.fixture
def client(monkeypatch):
    fd, path = tempfile.mkstemp(suffix=".db")
    os.close(fd)
    monkeypatch.setenv("ECHOES_DB_PATH", path)
    init_db(path)
    with TestClient(app) as tc:
        yield tc
    if os.path.exists(path):
        os.remove(path)

def test_health_endpoint(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["app"] == "Echoes — A Private Memory Garden"
    assert data["privacy"]["local_only"] is True
    assert data["privacy"]["telemetry"] is False
    assert data["privacy"]["host_binding"] == "127.0.0.1"
    assert data["privacy"]["is_loopback"] is True

def test_memory_crud_flow(client):
    # 1. Create
    payload = {
        "title": "Aunt Mae's Garden",
        "story": "Every spring she planted heirloom tomatoes and lavender.",
        "date": "1994-05-01",
        "approximate_period": "Spring 1994",
        "category": "Tradition",
        "people": ["Aunt Mae"],
        "places": ["Georgia"],
        "tags": ["gardening", "spring"],
        "is_fictional_demo": False
    }
    create_res = client.post("/api/memories", json=payload)
    assert create_res.status_code == 201
    created_id = create_res.json()["id"]

    # 2. Get single
    get_res = client.get(f"/api/memories/{created_id}")
    assert get_res.status_code == 200
    assert get_res.json()["title"] == "Aunt Mae's Garden"
    assert get_res.json()["is_fictional_demo"] is False

    # 3. List
    list_res = client.get("/api/memories")
    assert list_res.status_code == 200
    assert len(list_res.json()) == 1

    # 4. Search
    search_res = client.get("/api/memories?search=lavender")
    assert len(search_res.json()) == 1

    search_empty = client.get("/api/memories?search=nonexistentterm")
    assert len(search_empty.json()) == 0

    # 5. Update
    put_res = client.put(f"/api/memories/{created_id}", json={"title": "Aunt Mae's Heirloom Garden"})
    assert put_res.status_code == 200
    assert put_res.json()["title"] == "Aunt Mae's Heirloom Garden"

    # 6. Delete
    del_res = client.delete(f"/api/memories/{created_id}")
    assert del_res.status_code == 200

    # Confirm 404
    get_after = client.get(f"/api/memories/{created_id}")
    assert get_after.status_code == 404

def test_seed_demo_data(client):
    seed_res = client.post("/api/demo/seed", json={"reset_existing": True})
    assert seed_res.status_code == 200
    data = seed_res.json()
    assert data["seeded_count"] >= 5

    mems = client.get("/api/memories").json()
    assert len(mems) >= 5
    assert all(m["is_fictional_demo"] is True for m in mems)

def test_clear_demo_stories_preserves_personal(client):
    # 1. Create a real personal memory
    client.post("/api/memories", json={
        "title": "My Personal Memory",
        "story": "A private story from 2012.",
        "is_fictional_demo": False
    })

    # 2. Seed fictional demo data
    client.post("/api/demo/seed", json={"reset_existing": False})

    # Verify both personal and demo exist
    mems = client.get("/api/memories").json()
    assert len(mems) >= 6

    # 3. Clear only demo memories
    res_clear = client.post("/api/backup/clear-demo")
    assert res_clear.status_code == 200
    assert res_clear.json()["removed_count"] >= 5

    # 4. Verify only personal memory remains
    remaining = client.get("/api/memories").json()
    assert len(remaining) == 1
    assert remaining[0]["title"] == "My Personal Memory"
    assert remaining[0]["is_fictional_demo"] is False

def test_export_and_import_with_conflict_handling(client):
    # Seed data
    client.post("/api/demo/seed", json={"reset_existing": True})

    # Export
    export_res = client.get("/api/backup/export")
    assert export_res.status_code == 200
    export_data = export_res.json()
    assert export_data["version"] == 1
    assert export_data["count"] >= 5

    # Test importing with strategy 'skip'
    import_skip_res = client.post("/api/backup/import?conflict_strategy=skip", json=export_data)
    assert import_skip_res.status_code == 200
    assert import_skip_res.json()["skipped"] == export_data["count"]
    assert import_skip_res.json()["imported"] == 0

    # Test importing with strategy 'overwrite'
    import_ovw_res = client.post("/api/backup/import?conflict_strategy=overwrite", json=export_data)
    assert import_ovw_res.status_code == 200
    assert import_ovw_res.json()["updated"] == export_data["count"]

    # Test importing with strategy 'keep_both'
    import_both_res = client.post("/api/backup/import?conflict_strategy=keep_both", json=export_data)
    assert import_both_res.status_code == 200
    assert import_both_res.json()["imported"] == export_data["count"]

def test_import_validation_and_error_handling(client):
    # Malformed payload (missing title, story)
    bad_payload = {
        "version": 1,
        "memories": [
            {"id": "bad-1"},  # missing required fields
            {"id": "good-1", "title": "Good Title", "story": "Good Story"}
        ]
    }
    res = client.post("/api/backup/import", json=bad_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["imported"] == 1
    assert len(data["errors"]) == 1

    # Unsupported version
    unsupported_res = client.post("/api/backup/import", json={"version": 99, "memories": []})
    assert unsupported_res.status_code == 400
