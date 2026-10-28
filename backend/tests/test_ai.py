import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.ollama_client import OllamaClient, extract_json_from_text

def test_extract_json_helper():
    text1 = 'Here is the response: {"title": "Test", "essence": "Great memory"}'
    assert extract_json_from_text(text1) == {"title": "Test", "essence": "Great memory"}

    text2 = '```json\n{"people": ["Elena"], "places": ["Mexico"]}\n```'
    assert extract_json_from_text(text2) == {"people": ["Elena"], "places": ["Mexico"]}

    text3 = 'No json here at all'
    assert extract_json_from_text(text3) is None

@pytest.mark.asyncio
async def test_ollama_status_check():
    client = OllamaClient()
    status = await client.check_status()
    assert "connected" in status
    assert "configured_model" in status
    assert status["configured_model"] == "gemma3:1b"

@pytest.mark.asyncio
async def test_deterministic_fallback_generation():
    client = OllamaClient()
    summary = await client.summarize_story(
        title="Baking bread",
        story="We baked rye bread in the oven. The kitchen smelled wonderful.",
        use_demo_fallback=True
    )
    assert summary.is_ai_assisted is False
    assert "bread" in summary.summary.lower()
    assert summary.model == "deterministic-fallback"

    card = await client.generate_remembrance_card(
        title="Winter Cabin",
        story="We stayed by the fireplace all weekend watching snow fall.",
        approximate_period="Winter 1980",
        use_demo_fallback=True
    )
    assert card.is_ai_assisted is False
    assert card.title == "Remembrance: Winter Cabin"
    assert "fireplace" in card.quote_or_moment or "cabin" in card.essence.lower()

def test_api_ai_endpoints_fallback():
    client = TestClient(app)

    # Summarize with demo fallback
    res = client.post("/api/ai/summarize", json={
        "title": "Summer Porch",
        "story": "Sitting on the porch listening to cicadas singing at sunset.",
        "use_demo_fallback": True
    })
    assert res.status_code == 200
    assert "cicadas" in res.json()["summary"].lower()

    # Remembrance card with demo fallback
    res_card = client.post("/api/ai/remembrance-card", json={
        "title": "Summer Porch",
        "story": "Sitting on the porch listening to cicadas singing at sunset.",
        "approximate_period": "Summer 1990",
        "use_demo_fallback": True
    })
    assert res_card.status_code == 200
    assert res_card.json()["title"] == "Remembrance: Summer Porch"

    # Tribute with demo fallback
    res_trib = client.post("/api/ai/tribute", json={
        "titles": ["Summer Porch"],
        "stories": ["Sitting on the porch listening to cicadas."],
        "focus_person": "Grandmother",
        "use_demo_fallback": True
    })
    assert res_trib.status_code == 200
    assert "Grandmother" in res_trib.json()["tribute"]

