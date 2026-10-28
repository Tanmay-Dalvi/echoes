from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, Field
from ..models import (
    SummaryResponse,
    EntityExtractionResponse,
    RemembranceCard,
    TributeResponse,
    NarrativeResponse,
)
from ..ollama_client import OllamaClient
from ..database import get_memory, list_memories

router = APIRouter(prefix="/api/ai", tags=["ai"])
client = OllamaClient()

class SummarizeRequest(BaseModel):
    memory_id: Optional[str] = None
    title: Optional[str] = None
    story: Optional[str] = None
    use_demo_fallback: bool = False

class ExtractEntitiesRequest(BaseModel):
    memory_id: Optional[str] = None
    title: Optional[str] = None
    story: Optional[str] = None
    use_demo_fallback: bool = False

class RemembranceCardRequest(BaseModel):
    memory_id: Optional[str] = None
    title: Optional[str] = None
    story: Optional[str] = None
    approximate_period: Optional[str] = None
    use_demo_fallback: bool = False

class TributeRequest(BaseModel):
    memory_ids: Optional[List[str]] = None
    focus_person: Optional[str] = None
    titles: Optional[List[str]] = None
    stories: Optional[List[str]] = None
    use_demo_fallback: bool = False

class TimelineNarrativeRequest(BaseModel):
    memory_ids: Optional[List[str]] = None
    use_demo_fallback: bool = False

@router.get("/status")
async def get_ai_status():
    status_data = await client.check_status()
    return status_data

@router.post("/summarize", response_model=SummaryResponse)
async def summarize(req: SummarizeRequest):
    title = req.title or ""
    story = req.story or ""
    if req.memory_id:
        mem = get_memory(req.memory_id)
        if not mem:
            raise HTTPException(status_code=404, detail="Memory not found")
        title = mem.title
        story = mem.story

    if not story.strip():
        raise HTTPException(status_code=400, detail="Story text is required to generate a summary")

    try:
        return await client.summarize_story(title, story, use_demo_fallback=req.use_demo_fallback)
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Local AI inference failed: {str(e)}. Ensure Ollama is running with gemma3:1b, or select demo fallback mode."
        )

@router.post("/extract-entities", response_model=EntityExtractionResponse)
async def extract_entities(req: ExtractEntitiesRequest):
    title = req.title or ""
    story = req.story or ""
    if req.memory_id:
        mem = get_memory(req.memory_id)
        if not mem:
            raise HTTPException(status_code=404, detail="Memory not found")
        title = mem.title
        story = mem.story

    if not story.strip():
        raise HTTPException(status_code=400, detail="Story text is required to extract entities")

    try:
        return await client.extract_entities(title, story, use_demo_fallback=req.use_demo_fallback)
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Local AI inference failed: {str(e)}. Ensure Ollama is running with gemma3:1b, or select demo fallback mode."
        )

@router.post("/remembrance-card", response_model=RemembranceCard)
async def create_remembrance_card(req: RemembranceCardRequest):
    title = req.title or ""
    story = req.story or ""
    period = req.approximate_period
    if req.memory_id:
        mem = get_memory(req.memory_id)
        if not mem:
            raise HTTPException(status_code=404, detail="Memory not found")
        title = mem.title
        story = mem.story
        period = period or mem.approximate_period or mem.date

    if not story.strip():
        raise HTTPException(status_code=400, detail="Story text is required to craft a remembrance card")

    try:
        return await client.generate_remembrance_card(title, story, period, use_demo_fallback=req.use_demo_fallback)
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Local AI inference failed: {str(e)}. Ensure Ollama is running with gemma3:1b, or select demo fallback mode."
        )

@router.post("/tribute", response_model=TributeResponse)
async def create_tribute(req: TributeRequest):
    titles = req.titles or []
    stories = req.stories or []
    if req.memory_ids:
        for mid in req.memory_ids:
            mem = get_memory(mid)
            if mem:
                titles.append(mem.title)
                stories.append(mem.story)

    if not stories:
        raise HTTPException(status_code=400, detail="At least one story is required to compose a reflective tribute")

    try:
        return await client.generate_tribute(titles, stories, req.focus_person, use_demo_fallback=req.use_demo_fallback)
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Local AI inference failed: {str(e)}. Ensure Ollama is running with gemma3:1b, or select demo fallback mode."
        )

@router.post("/timeline-narrative", response_model=NarrativeResponse)
async def create_timeline_narrative(req: TimelineNarrativeRequest):
    memories_data = []
    if req.memory_ids:
        for mid in req.memory_ids:
            mem = get_memory(mid)
            if mem:
                memories_data.append(mem.model_dump())
    else:
        all_mems = list_memories(sort_by="chronological")
        memories_data = [m.model_dump() for m in all_mems]

    if not memories_data:
        raise HTTPException(status_code=400, detail="No memories available to synthesize oral history narrative")

    try:
        return await client.generate_timeline_narrative(memories_data, use_demo_fallback=req.use_demo_fallback)
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Local AI inference failed: {str(e)}. Ensure Ollama is running with gemma3:1b, or select demo fallback mode."
        )

