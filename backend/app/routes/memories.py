from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel
from ..models import Memory, MemoryCreate, MemoryUpdate
from ..database import (
    save_memory,
    get_memory,
    list_memories,
    update_memory,
    delete_memory,
    count_memories,
    clear_all_memories,
)
from ..demo_data import load_demo_memories

router = APIRouter(prefix="/api/memories", tags=["memories"])

class SeedResponse(BaseModel):
    message: str
    seeded_count: int
    total_memories: int

@router.get("", response_model=List[Memory])
def get_memories(
    search: Optional[str] = Query(None, description="Full text search in title, story, tags, people, places"),
    category: Optional[str] = Query(None, description="Filter by category"),
    tag: Optional[str] = Query(None, description="Filter by tag"),
    person: Optional[str] = Query(None, description="Filter by person"),
    place: Optional[str] = Query(None, description="Filter by place"),
    is_fictional_demo: Optional[bool] = Query(None, description="Filter by fictional demo status"),
    sort: str = Query("recent", description="'recent', 'chronological', or 'title'"),
):
    return list_memories(
        search=search,
        category=category,
        tag=tag,
        person=person,
        place=place,
        is_fictional_demo=is_fictional_demo,
        sort_by=sort
    )

@router.post("", response_model=Memory, status_code=status.HTTP_201_CREATED)
def create_memory_endpoint(payload: MemoryCreate):
    memory = Memory(**payload.model_dump())
    saved = save_memory(memory)
    return saved

@router.get("/{memory_id}", response_model=Memory)
def get_memory_endpoint(memory_id: str):
    mem = get_memory(memory_id)
    if not mem:
        raise HTTPException(status_code=404, detail="Memory not found in local archive")
    return mem

@router.put("/{memory_id}", response_model=Memory)
def update_memory_endpoint(memory_id: str, payload: MemoryUpdate):
    updated = update_memory(memory_id, payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Memory not found in local archive")
    return updated

@router.delete("/{memory_id}", status_code=status.HTTP_200_OK)
def delete_memory_endpoint(memory_id: str):
    success = delete_memory(memory_id)
    if not success:
        raise HTTPException(status_code=404, detail="Memory not found or already deleted")
    return {"message": "Memory removed from local archive", "id": memory_id}

# Seed route under /api/demo/seed
seed_router = APIRouter(prefix="/api/demo", tags=["demo"])

class SeedOptions(BaseModel):
    reset_existing: bool = False

@seed_router.post("/seed", response_model=SeedResponse)
def seed_demo_data(options: SeedOptions = SeedOptions()):
    if options.reset_existing:
        clear_all_memories()

    demos = load_demo_memories()
    seeded = 0
    for mem in demos:
        save_memory(mem)
        seeded += 1

    return SeedResponse(
        message="Fictional demo memories successfully seeded. All samples are explicitly fictional and respectfully composed.",
        seeded_count=seeded,
        total_memories=count_memories()
    )

@seed_router.post("/clear", status_code=status.HTTP_200_OK)
def clear_all_endpoint():
    count = clear_all_memories()
    return {"message": "All memories cleared from local archive.", "cleared_count": count}

