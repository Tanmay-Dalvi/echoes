import os
import json
import re
import logging
from typing import Dict, Any, Optional, List
import httpx
from .models import (
    SummaryResponse,
    EntityExtractionResponse,
    RemembranceCard,
    TributeResponse,
    NarrativeResponse,
    utc_now_iso,
)

logger = logging.getLogger("echoes.ollama")

DEFAULT_OLLAMA_URL = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
DEFAULT_MODEL = os.getenv("OLLAMA_MODEL", "gemma3:1b")
REQUEST_TIMEOUT = 45.0

ETHICAL_GROUNDING_PREFIX = """
IMPORTANT ETHICAL INSTRUCTIONS:
- You are a memory archiving assistant for 'Echoes'.
- Preserving authentic human memories with dignity and fidelity is your sole mission.
- Strictly ground all generated text in the provided memory text. NEVER fabricate names, dates, relations, or events.
- Never claim to speak as the person being remembered or simulate communicating with spirits or deceased consciousness.
- Maintain a warm, respectful, reflective, and calm tone.
"""

def extract_json_from_text(text: str) -> Optional[dict]:
    # Look for ```json ... ``` or first { ... } block
    match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except Exception:
            pass

    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        candidate = text[start:end+1]
        try:
            return json.loads(candidate)
        except Exception:
            pass
    return None

class OllamaClient:
    def __init__(self, base_url: str = DEFAULT_OLLAMA_URL, model: str = DEFAULT_MODEL):
        self.base_url = base_url.rstrip("/")
        self.model = model

    async def check_status(self) -> Dict[str, Any]:
        url = f"{self.base_url}/api/tags"
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.get(url)
                if res.status_code == 200:
                    data = res.json()
                    models = [m.get("name") for m in data.get("models", [])]
                    model_found = any(self.model in m for m in models)
                    return {
                        "connected": True,
                        "base_url": self.base_url,
                        "configured_model": self.model,
                        "model_available": model_found,
                        "available_models": models,
                        "offline_capable": True
                    }
                return {
                    "connected": False,
                    "error": f"Ollama returned HTTP {res.status_code}",
                    "configured_model": self.model,
                    "model_available": False
                }
        except Exception as e:
            logger.warning("Could not reach Ollama at %s: %s", self.base_url, type(e).__name__)
            return {
                "connected": False,
                "error": "Ollama service unavailable or unreachable.",
                "configured_model": self.model,
                "model_available": False
            }

    async def _call_generate(self, prompt: str, system_prompt: str = "", temperature: float = 0.3) -> str:
        url = f"{self.base_url}/api/generate"
        payload = {
            "model": self.model,
            "prompt": prompt,
            "system": f"{ETHICAL_GROUNDING_PREFIX}\n{system_prompt}",
            "stream": False,
            "options": {
                "temperature": temperature,
            }
        }
        async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code != 200:
                raise RuntimeError(f"Ollama error HTTP {resp.status_code}: {resp.text}")
            data = resp.json()
            return data.get("response", "").strip()

    async def summarize_story(self, title: str, story: str, use_demo_fallback: bool = False) -> SummaryResponse:
        if not use_demo_fallback:
            try:
                system_prompt = "You summarize memory narratives into 2-3 concise, respectful sentences strictly based on the text."
                user_prompt = f"Title: {title}\nStory:\n{story}\n\nPlease write a concise, grounded summary (2-3 sentences max) capturing the heart of this memory."
                response_text = await self._call_generate(user_prompt, system_prompt, temperature=0.2)
                if response_text:
                    return SummaryResponse(summary=response_text, is_ai_assisted=True, model=self.model)
            except Exception as e:
                logger.warning(f"Ollama generation failed: {e}. Falling back to deterministic summary if permitted.")
                if not use_demo_fallback:
                    raise

        # Deterministic fallback
        sentences = [s.strip() for s in story.split(".") if s.strip()]
        fallback = ". ".join(sentences[:2]) + "." if sentences else story[:200]
        return SummaryResponse(
            summary=f"{fallback} (Deterministic preview: Grounded in preserved memory text)",
            is_ai_assisted=False,
            model="deterministic-fallback"
        )

    async def extract_entities(self, title: str, story: str, use_demo_fallback: bool = False) -> EntityExtractionResponse:
        if not use_demo_fallback:
            try:
                system_prompt = """
You extract entities strictly mentioned in the memory text.
Return ONLY valid JSON with keys:
- people: array of personal names mentioned
- places: array of places, towns, or specific rooms mentioned
- dates_or_periods: array of dates, seasons, or time periods mentioned
- themes: array of 2 to 4 emotional or historical themes
Do NOT invent any information.
JSON format:
{"people": [...], "places": [...], "dates_or_periods": [...], "themes": [...]}
"""
                user_prompt = f"Title: {title}\nMemory:\n{story}"
                response_text = await self._call_generate(user_prompt, system_prompt, temperature=0.1)
                data = extract_json_from_text(response_text)
                if data and isinstance(data, dict):
                    return EntityExtractionResponse(
                        people=[str(p) for p in data.get("people", []) if p],
                        places=[str(p) for p in data.get("places", []) if p],
                        dates_or_periods=[str(d) for d in data.get("dates_or_periods", []) if d],
                        themes=[str(t) for t in data.get("themes", []) if t],
                        is_ai_assisted=True,
                        model=self.model
                    )
            except Exception as e:
                logger.warning(f"Entity extraction failed: {e}")
                if not use_demo_fallback:
                    raise

        # Deterministic extraction fallback
        return EntityExtractionResponse(
            people=[],
            places=[],
            dates_or_periods=[],
            themes=["Preserved Memory", "Oral History"],
            is_ai_assisted=False,
            model="deterministic-fallback"
        )

    async def generate_remembrance_card(self, title: str, story: str, approximate_period: Optional[str] = None, use_demo_fallback: bool = False) -> RemembranceCard:
        if not use_demo_fallback:
            try:
                system_prompt = """
You create a dignified, poetic remembrance card summarizing the core emotional and historical essence of a memory.
Return ONLY valid JSON matching this schema:
{
  "title": "A short evocative title (3-6 words)",
  "essence": "A resonant 1-2 sentence distillation of why this memory matters",
  "key_elements": ["element 1", "element 2", "element 3"],
  "quote_or_moment": "A poignant phrase or evocative detail directly quoted or paraphrased from the story"
}
"""
                user_prompt = f"Memory Title: {title}\nPeriod: {approximate_period or 'Unspecified'}\nStory:\n{story}"
                response_text = await self._call_generate(user_prompt, system_prompt, temperature=0.3)
                data = extract_json_from_text(response_text)
                if data and isinstance(data, dict) and "title" in data and "essence" in data:
                    return RemembranceCard(
                        title=str(data.get("title")),
                        essence=str(data.get("essence")),
                        key_elements=[str(x) for x in data.get("key_elements", []) if x],
                        quote_or_moment=str(data.get("quote_or_moment", "")) if data.get("quote_or_moment") else None,
                        generated_at=utc_now_iso(),
                        model=self.model,
                        is_ai_assisted=True
                    )
            except Exception as e:
                logger.warning(f"Remembrance card generation failed: {e}")
                if not use_demo_fallback:
                    raise

        # Deterministic fallback
        return RemembranceCard(
            title=f"Remembrance: {title}",
            essence=f"A preserved recollection of {title}, honoring the voices, places, and moments that endure.",
            key_elements=["Preserved story", "Local archive", approximate_period or "Cherished time"],
            quote_or_moment=story[:120] + "..." if len(story) > 120 else story,
            generated_at=utc_now_iso(),
            model="deterministic-fallback",
            is_ai_assisted=False
        )

    async def generate_tribute(self, titles: List[str], stories: List[str], focus_person: Optional[str] = None, use_demo_fallback: bool = False) -> TributeResponse:
        combined = "\n\n---\n\n".join([f"Title: {t}\nStory: {s}" for t, s in zip(titles, stories)])
        if not use_demo_fallback:
            try:
                system_prompt = """
You compose a grounded, reflective commemorative tribute celebrating the life, craftsmanship, or wisdom found in the user-provided memories.
STRICT BOUNDARIES:
- Present this strictly as a tribute written about them, grounded in user facts.
- Do NOT simulate their voice or pretend to channel their spirit.
- Keep it poignant, warm, respectful, and dignified. 2 to 3 paragraphs.
"""
                user_prompt = f"Person of focus: {focus_person or 'The remembered individual'}\n\nPreserved Memories:\n{combined}\n\nPlease write a reflective, grounded tribute."
                response_text = await self._call_generate(user_prompt, system_prompt, temperature=0.4)
                if response_text:
                    return TributeResponse(
                        tribute=response_text,
                        grounding_note="Generated locally using open-weight model gemma3:1b. Grounded strictly in provided memories. AI-assisted writing.",
                        is_ai_assisted=True,
                        model=self.model
                    )
            except Exception as e:
                logger.warning(f"Tribute generation failed: {e}")
                if not use_demo_fallback:
                    raise

        return TributeResponse(
            tribute=f"A commemorative tribute to {focus_person or 'those remembered'}: Through the preserved stories of {', '.join(titles)}, their kindness, craftsmanship, and quiet courage remain woven into our lives. Every story kept safe is an anchor against forgetting. (Deterministic Tribute Preview)",
            grounding_note="Deterministic preview grounded in preserved memory titles. AI-assisted writing.",
            is_ai_assisted=False,
            model="deterministic-fallback"
        )

    async def generate_timeline_narrative(self, memories: List[dict], use_demo_fallback: bool = False) -> NarrativeResponse:
        sorted_mems = sorted(memories, key=lambda m: (m.get("date") or "9999", m.get("created_at") or ""))
        items_text = "\n\n".join([
            f"- [{m.get('date') or m.get('approximate_period') or 'Undated'}] {m.get('title')}: {m.get('story')}"
            for m in sorted_mems
        ])
        if not use_demo_fallback:
            try:
                system_prompt = """
You synthesize multiple chronological family memories into a continuous, grounded oral history narrative.
Highlight the chronological progression, recurring themes, and enduring legacies.
Return ONLY valid JSON matching this schema:
{
  "narrative": "A multi-paragraph cohesive oral history narrative weaving the events together.",
  "themes": ["theme 1", "theme 2", "theme 3"],
  "chronology_order": ["Title 1 (Date)", "Title 2 (Date)"]
}
"""
                user_prompt = f"Preserved Memories in Chronological Order:\n{items_text}"
                response_text = await self._call_generate(user_prompt, system_prompt, temperature=0.3)
                data = extract_json_from_text(response_text)
                if data and isinstance(data, dict) and "narrative" in data:
                    return NarrativeResponse(
                        narrative=str(data.get("narrative")),
                        themes=[str(t) for t in data.get("themes", []) if t],
                        chronology_order=[str(c) for c in data.get("chronology_order", []) if c],
                        is_ai_assisted=True,
                        model=self.model
                    )
            except Exception as e:
                logger.warning(f"Narrative generation failed: {e}")
                if not use_demo_fallback:
                    raise

        # Deterministic fallback
        titles_chron = [f"{m.get('title')} ({m.get('date') or m.get('approximate_period') or 'Undated'})" for m in sorted_mems]
        summary_paragraphs = [
            f"This oral history chronicles {len(sorted_mems)} preserved stories spanning {titles_chron[0]} to {titles_chron[-1] if len(titles_chron) > 1 else 'the present'}.",
            "Across these recollections run the threads of family traditions, handcrafted labor, and community gatherings that endure through time."
        ]
        return NarrativeResponse(
            narrative="\n\n".join(summary_paragraphs),
            themes=["Oral History", "Family Heritage", "Enduring Memories"],
            chronology_order=titles_chron,
            is_ai_assisted=False,
            model="deterministic-fallback"
        )

