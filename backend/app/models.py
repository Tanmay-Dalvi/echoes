import uuid
from datetime import datetime, timezone
from typing import List, Optional, Literal, Dict, Any
from pydantic import BaseModel, Field

def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

class RemembranceCard(BaseModel):
    title: str = Field(..., max_length=200, description="A respectful, resonant title for the remembrance card")
    essence: str = Field(..., max_length=1000, description="A 1-2 sentence core essence of the memory")
    key_elements: List[str] = Field(default_factory=list, description="Key moments, places, or themes")
    quote_or_moment: Optional[str] = Field(None, max_length=1000, description="A poignant quoted snippet or central moment")
    generated_at: str = Field(default_factory=utc_now_iso)
    model: str = "gemma3:1b"
    is_ai_assisted: bool = True

class MemoryBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    story: str = Field(..., min_length=1, max_length=50000)
    date: Optional[str] = Field(None, max_length=50, description="ISO date (YYYY-MM-DD or YYYY) if known")
    approximate_period: Optional[str] = Field(None, max_length=100, description="E.g., 'Summer 1974', 'Late 1960s', 'Childhood'")
    category: str = Field(default="Personal", max_length=50, description="Category: Personal, Family, Oral History, Milestone, Tradition, Tribute")
    people: List[str] = Field(default_factory=list)
    places: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)
    is_fictional_demo: bool = Field(default=False, description="Flag indicating if this is an example demo story")

class MemoryCreate(MemoryBase):
    pass

class MemoryUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    story: Optional[str] = Field(None, min_length=1, max_length=50000)
    date: Optional[str] = Field(None, max_length=50)
    approximate_period: Optional[str] = Field(None, max_length=100)
    category: Optional[str] = Field(None, max_length=50)
    people: Optional[List[str]] = None
    places: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    is_fictional_demo: Optional[bool] = None
    ai_remembrance_card: Optional[RemembranceCard] = None
    ai_tribute: Optional[str] = Field(None, max_length=10000)
    ai_summary: Optional[str] = Field(None, max_length=5000)

class Memory(MemoryBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    ai_remembrance_card: Optional[RemembranceCard] = None
    ai_tribute: Optional[str] = None
    ai_summary: Optional[str] = None
    created_at: str = Field(default_factory=utc_now_iso)
    updated_at: str = Field(default_factory=utc_now_iso)

class EntityExtractionResponse(BaseModel):
    people: List[str] = Field(default_factory=list)
    places: List[str] = Field(default_factory=list)
    dates_or_periods: List[str] = Field(default_factory=list)
    themes: List[str] = Field(default_factory=list)
    is_ai_assisted: bool = True
    model: str = "gemma3:1b"

class SummaryResponse(BaseModel):
    summary: str
    is_ai_assisted: bool = True
    model: str = "gemma3:1b"

class TributeResponse(BaseModel):
    tribute: str
    grounding_note: str = "Generated using local open-weight inference, strictly grounded in provided stories. AI-assisted writing."
    is_ai_assisted: bool = True
    model: str = "gemma3:1b"

class NarrativeResponse(BaseModel):
    narrative: str
    themes: List[str] = Field(default_factory=list)
    chronology_order: List[str] = Field(default_factory=list)
    is_ai_assisted: bool = True
    model: str = "gemma3:1b"

class ExportPayload(BaseModel):
    version: int = 1
    application: str = "Echoes"
    exported_at: str = Field(default_factory=utc_now_iso)
    count: int
    memories: List[Memory]

class ImportResult(BaseModel):
    total_processed: int
    imported: int
    updated: int
    skipped: int
    errors: List[str] = Field(default_factory=list)
