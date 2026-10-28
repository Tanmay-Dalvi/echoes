import uuid
from typing import List, Literal, Optional
from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, ValidationError, Field
from ..models import ExportPayload, ImportResult, Memory, utc_now_iso
from ..database import (
    list_memories,
    import_memories_atomic,
    count_memories,
    clear_demo_memories,
)

router = APIRouter(prefix="/api/backup", tags=["backup"])

MAX_IMPORT_ITEMS = 5000

class ImportPayload(BaseModel):
    version: int = 1
    application: Optional[str] = "Echoes"
    memories: List[dict] = Field(..., max_length=MAX_IMPORT_ITEMS)

@router.get("/export", response_model=ExportPayload)
def export_archive(exclude_demo: bool = Query(False, description="Exclude fictional demo stories from export")):
    all_memories = list_memories(
        is_fictional_demo=False if exclude_demo else None,
        sort_by="recent"
    )
    return ExportPayload(
        version=1,
        application="Echoes",
        exported_at=utc_now_iso(),
        count=len(all_memories),
        memories=all_memories
    )

@router.post("/import", response_model=ImportResult)
def import_archive(
    payload: ImportPayload,
    conflict_strategy: Literal["skip", "overwrite", "keep_both"] = Query("skip")
):
    if payload.version != 1:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported schema version: {payload.version}. Echoes supports schema version 1."
        )

    if len(payload.memories) > MAX_IMPORT_ITEMS:
        raise HTTPException(
            status_code=400,
            detail=f"Archive exceeds maximum import limit of {MAX_IMPORT_ITEMS} memories."
        )

    valid_memories: List[Memory] = []
    errors: List[str] = []

    for idx, raw_mem in enumerate(payload.memories):
        try:
            mem_obj = Memory(**raw_mem)
            valid_memories.append(mem_obj)
        except ValidationError as ve:
            errors.append(f"Memory at index {idx} failed validation: {str(ve).splitlines()[0]}")
        except Exception:
            errors.append(f"Memory at index {idx} contains corrupted data.")

    # Execute atomic import on all validated memories
    import_stats = import_memories_atomic(valid_memories, conflict_strategy=conflict_strategy)
    import_stats.errors.extend(errors)
    import_stats.total_processed = len(payload.memories)
    return import_stats

@router.post("/clear-demo", status_code=status.HTTP_200_OK)
def clear_demo_stories():
    """Removes only fictional demo stories, preserving all user personal memories."""
    removed = clear_demo_memories()
    return {
        "message": "Fictional demo stories removed. Personal memories remain preserved.",
        "removed_count": removed,
        "remaining_count": count_memories()
    }
