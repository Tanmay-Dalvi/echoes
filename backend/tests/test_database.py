import tempfile
import os
import pytest
from backend.app.models import Memory, MemoryUpdate, RemembranceCard
from backend.app.database import (
    init_db,
    save_memory,
    get_memory,
    list_memories,
    update_memory,
    delete_memory,
    count_memories,
    clear_all_memories,
)

@pytest.fixture
def temp_db():
    fd, path = tempfile.mkstemp(suffix=".db")
    os.close(fd)
    init_db(path)
    yield path
    if os.path.exists(path):
        os.remove(path)

def test_save_and_get_memory(temp_db):
    mem = Memory(
        id="mem-1",
        title="Grandfather's Watch",
        story="A silver pocket watch engraved in 1920.",
        date="1920-05-15",
        approximate_period="Spring 1920",
        category="Family",
        people=["Grandfather"],
        places=["Boston"],
        tags=["heirloom", "watch"]
    )
    saved = save_memory(mem, db_path=temp_db)
    assert saved.id == "mem-1"

    fetched = get_memory("mem-1", db_path=temp_db)
    assert fetched is not None
    assert fetched.title == "Grandfather's Watch"
    assert fetched.people == ["Grandfather"]
    assert fetched.tags == ["heirloom", "watch"]

def test_full_text_search(temp_db):
    mem1 = Memory(
        id="mem-1",
        title="Summer in Oaxaca",
        story="We made clay pots with Doña Rosa.",
        category="Tradition",
        places=["Oaxaca"],
        tags=["pottery", "black clay"]
    )
    mem2 = Memory(
        id="mem-2",
        title="Winter in Maine",
        story="Ice fishing on the frozen lake.",
        category="Oral History",
        places=["Maine"],
        tags=["winter", "fishing"]
    )
    save_memory(mem1, db_path=temp_db)
    save_memory(mem2, db_path=temp_db)

    results = list_memories(search="clay", db_path=temp_db)
    assert len(results) == 1
    assert results[0].id == "mem-1"

    results_winter = list_memories(search="fishing", db_path=temp_db)
    assert len(results_winter) == 1
    assert results_winter[0].id == "mem-2"

def test_chronological_sorting_and_missing_dates(temp_db):
    mem_early = Memory(id="early", title="Early", story="Story", date="1940-01-01")
    mem_late = Memory(id="late", title="Late", story="Story", date="2010-06-01")
    mem_undated = Memory(id="undated", title="Undated", story="Story", date=None, approximate_period="Childhood")

    save_memory(mem_late, db_path=temp_db)
    save_memory(mem_undated, db_path=temp_db)
    save_memory(mem_early, db_path=temp_db)

    sorted_mems = list_memories(sort_by="chronological", db_path=temp_db)
    assert len(sorted_mems) == 3
    # Dated ones should be chronological first, undated at end
    assert sorted_mems[0].id == "early"
    assert sorted_mems[1].id == "late"
    assert sorted_mems[2].id == "undated"

def test_update_and_delete_memory(temp_db):
    mem = Memory(id="m1", title="Original Title", story="Original Story")
    save_memory(mem, db_path=temp_db)

    updated = update_memory("m1", MemoryUpdate(title="Revised Title"), db_path=temp_db)
    assert updated is not None
    assert updated.title == "Revised Title"
    assert updated.story == "Original Story"

    del_res = delete_memory("m1", db_path=temp_db)
    assert del_res is True
    assert get_memory("m1", db_path=temp_db) is None

