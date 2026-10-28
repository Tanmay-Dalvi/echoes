import os
import json
import sqlite3
import uuid
from pathlib import Path
from typing import List, Optional, Dict, Any, Tuple
from .models import Memory, MemoryUpdate, RemembranceCard, ImportResult

DEFAULT_DB_DIR = Path(__file__).resolve().parent.parent.parent / "data"
DEFAULT_DB_PATH = DEFAULT_DB_DIR / "echoes.db"

def get_db_path() -> str:
    db_env = os.getenv("ECHOES_DB_PATH")
    if db_env:
        return db_env
    DEFAULT_DB_DIR.mkdir(parents=True, exist_ok=True)
    return str(DEFAULT_DB_PATH)

def get_connection(db_path: Optional[str] = None) -> sqlite3.Connection:
    path = db_path or get_db_path()
    conn = sqlite3.connect(path, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.execute("PRAGMA journal_mode = WAL;")
    return conn

def init_db(db_path: Optional[str] = None) -> None:
    conn = get_connection(db_path)
    try:
        with conn:
            conn.execute("""
            CREATE TABLE IF NOT EXISTS memories (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                story TEXT NOT NULL,
                date TEXT,
                approximate_period TEXT,
                category TEXT NOT NULL DEFAULT 'Personal',
                people_json TEXT NOT NULL DEFAULT '[]',
                places_json TEXT NOT NULL DEFAULT '[]',
                tags_json TEXT NOT NULL DEFAULT '[]',
                is_fictional_demo INTEGER NOT NULL DEFAULT 0,
                ai_remembrance_card_json TEXT,
                ai_tribute TEXT,
                ai_summary TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            """)

            # Migration: ensure is_fictional_demo exists if created with older schema
            cur = conn.cursor()
            cur.execute("PRAGMA table_info(memories);")
            cols = [col["name"] for col in cur.fetchall()]
            if "is_fictional_demo" not in cols:
                conn.execute("ALTER TABLE memories ADD COLUMN is_fictional_demo INTEGER NOT NULL DEFAULT 0;")

            conn.execute("CREATE INDEX IF NOT EXISTS idx_memories_date ON memories(date);")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_memories_created_at ON memories(created_at);")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_memories_category ON memories(category);")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_memories_demo ON memories(is_fictional_demo);")

            # FTS5 Virtual Table for full-text search
            conn.execute("""
            CREATE VIRTUAL TABLE IF NOT EXISTS memories_fts USING fts5(
                id UNINDEXED,
                title,
                story,
                people,
                places,
                tags,
                tokenize='porter unicode61'
            );
            """)

            # Triggers to keep memories_fts in sync
            conn.execute("""
            CREATE TRIGGER IF NOT EXISTS trg_memories_ai AFTER INSERT ON memories BEGIN
                INSERT INTO memories_fts(id, title, story, people, places, tags)
                VALUES (new.id, new.title, new.story, new.people_json, new.places_json, new.tags_json);
            END;
            """)

            conn.execute("""
            CREATE TRIGGER IF NOT EXISTS trg_memories_ad AFTER DELETE ON memories BEGIN
                DELETE FROM memories_fts WHERE id = old.id;
            END;
            """)

            conn.execute("""
            CREATE TRIGGER IF NOT EXISTS trg_memories_au AFTER UPDATE ON memories BEGIN
                DELETE FROM memories_fts WHERE id = old.id;
                INSERT INTO memories_fts(id, title, story, people, places, tags)
                VALUES (new.id, new.title, new.story, new.people_json, new.places_json, new.tags_json);
            END;
            """)
    finally:
        conn.close()

def _row_to_memory(row: sqlite3.Row) -> Memory:
    remembrance_card = None
    if row["ai_remembrance_card_json"]:
        try:
            card_dict = json.loads(row["ai_remembrance_card_json"])
            remembrance_card = RemembranceCard(**card_dict)
        except Exception:
            remembrance_card = None

    row_keys = row.keys()
    is_demo = bool(row["is_fictional_demo"]) if "is_fictional_demo" in row_keys else False

    return Memory(
        id=row["id"],
        title=row["title"],
        story=row["story"],
        date=row["date"],
        approximate_period=row["approximate_period"],
        category=row["category"],
        people=json.loads(row["people_json"]) if row["people_json"] else [],
        places=json.loads(row["places_json"]) if row["places_json"] else [],
        tags=json.loads(row["tags_json"]) if row["tags_json"] else [],
        is_fictional_demo=is_demo,
        ai_remembrance_card=remembrance_card,
        ai_tribute=row["ai_tribute"],
        ai_summary=row["ai_summary"],
        created_at=row["created_at"],
        updated_at=row["updated_at"],
    )

def save_memory(memory: Memory, db_path: Optional[str] = None) -> Memory:
    conn = get_connection(db_path)
    try:
        with conn:
            conn.execute("""
            INSERT OR REPLACE INTO memories (
                id, title, story, date, approximate_period, category,
                people_json, places_json, tags_json, is_fictional_demo,
                ai_remembrance_card_json, ai_tribute, ai_summary,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                memory.id,
                memory.title,
                memory.story,
                memory.date,
                memory.approximate_period,
                memory.category,
                json.dumps(memory.people),
                json.dumps(memory.places),
                json.dumps(memory.tags),
                1 if memory.is_fictional_demo else 0,
                json.dumps(memory.ai_remembrance_card.model_dump()) if memory.ai_remembrance_card else None,
                memory.ai_tribute,
                memory.ai_summary,
                memory.created_at,
                memory.updated_at
            ))
        return memory
    finally:
        conn.close()

def get_memory(memory_id: str, db_path: Optional[str] = None) -> Optional[Memory]:
    conn = get_connection(db_path)
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM memories WHERE id = ?", (memory_id,))
        row = cur.fetchone()
        if not row:
            return None
        return _row_to_memory(row)
    finally:
        conn.close()

def list_memories(
    search: Optional[str] = None,
    category: Optional[str] = None,
    tag: Optional[str] = None,
    person: Optional[str] = None,
    place: Optional[str] = None,
    is_fictional_demo: Optional[bool] = None,
    sort_by: str = "recent",  # "recent", "chronological", "title"
    db_path: Optional[str] = None
) -> List[Memory]:
    conn = get_connection(db_path)
    try:
        cur = conn.cursor()
        conditions = []
        params: List[Any] = []

        if is_fictional_demo is not None:
            conditions.append("is_fictional_demo = ?")
            params.append(1 if is_fictional_demo else 0)

        if search and search.strip():
            clean_search = search.strip().replace('"', '""')
            try:
                cur.execute("SELECT id FROM memories_fts WHERE memories_fts MATCH ? ORDER BY rank", (f'"{clean_search}"*',))
                matched_ids = [r["id"] for r in cur.fetchall()]
                if matched_ids:
                    placeholders = ",".join("?" for _ in matched_ids)
                    conditions.append(f"id IN ({placeholders})")
                    params.extend(matched_ids)
                else:
                    pattern = f"%{clean_search}%"
                    conditions.append("(title LIKE ? OR story LIKE ? OR people_json LIKE ? OR places_json LIKE ? OR tags_json LIKE ?)")
                    params.extend([pattern, pattern, pattern, pattern, pattern])
            except Exception:
                pattern = f"%{clean_search}%"
                conditions.append("(title LIKE ? OR story LIKE ? OR people_json LIKE ? OR places_json LIKE ? OR tags_json LIKE ?)")
                params.extend([pattern, pattern, pattern, pattern, pattern])

        if category and category.strip():
            conditions.append("category = ?")
            params.append(category.strip())

        if tag and tag.strip():
            conditions.append("tags_json LIKE ?")
            params.append(f'%"{tag.strip()}"%')

        if person and person.strip():
            conditions.append("people_json LIKE ?")
            params.append(f'%"{person.strip()}"%')

        if place and place.strip():
            conditions.append("places_json LIKE ?")
            params.append(f'%"{place.strip()}"%')

        query = "SELECT * FROM memories"
        if conditions:
            query += " WHERE " + " AND ".join(conditions)

        if sort_by == "chronological":
            query += " ORDER BY CASE WHEN date IS NOT NULL AND date != '' THEN 0 ELSE 1 END, date ASC, created_at ASC"
        elif sort_by == "title":
            query += " ORDER BY title COLLATE NOCASE ASC"
        else:
            query += " ORDER BY created_at DESC"

        cur.execute(query, params)
        rows = cur.fetchall()
        return [_row_to_memory(r) for r in rows]
    finally:
        conn.close()

def update_memory(memory_id: str, update: MemoryUpdate, db_path: Optional[str] = None) -> Optional[Memory]:
    existing = get_memory(memory_id, db_path)
    if not existing:
        return None

    update_dict = update.model_dump(exclude_unset=True)
    for field, val in update_dict.items():
        if val is not None or field in ["date", "approximate_period", "ai_remembrance_card", "ai_tribute", "ai_summary", "is_fictional_demo"]:
            setattr(existing, field, val)

    from .models import utc_now_iso
    existing.updated_at = utc_now_iso()
    return save_memory(existing, db_path)

def delete_memory(memory_id: str, db_path: Optional[str] = None) -> bool:
    conn = get_connection(db_path)
    try:
        with conn:
            cur = conn.cursor()
            cur.execute("DELETE FROM memories WHERE id = ?", (memory_id,))
            return cur.rowcount > 0
    finally:
        conn.close()

def clear_all_memories(db_path: Optional[str] = None) -> int:
    conn = get_connection(db_path)
    try:
        with conn:
            cur = conn.cursor()
            cur.execute("DELETE FROM memories")
            return cur.rowcount
    finally:
        conn.close()

def clear_demo_memories(db_path: Optional[str] = None) -> int:
    conn = get_connection(db_path)
    try:
        with conn:
            cur = conn.cursor()
            cur.execute("DELETE FROM memories WHERE is_fictional_demo = 1")
            return cur.rowcount
    finally:
        conn.close()

def count_memories(is_fictional_demo: Optional[bool] = None, db_path: Optional[str] = None) -> int:
    conn = get_connection(db_path)
    try:
        cur = conn.cursor()
        if is_fictional_demo is not None:
            cur.execute("SELECT COUNT(*) as cnt FROM memories WHERE is_fictional_demo = ?", (1 if is_fictional_demo else 0,))
        else:
            cur.execute("SELECT COUNT(*) as cnt FROM memories")
        row = cur.fetchone()
        return row["cnt"] if row else 0
    finally:
        conn.close()

def import_memories_atomic(
    memories: List[Memory],
    conflict_strategy: str = "skip",
    db_path: Optional[str] = None
) -> ImportResult:
    """
    Executes import in a single atomic SQLite transaction.
    If an unexpected database failure occurs, rolls back cleanly.
    """
    conn = get_connection(db_path)
    imported = 0
    updated = 0
    skipped = 0
    errors: List[str] = []

    try:
        with conn:
            cur = conn.cursor()
            for idx, mem in enumerate(memories):
                cur.execute("SELECT id FROM memories WHERE id = ?", (mem.id,))
                exists = cur.fetchone() is not None

                if exists:
                    if conflict_strategy == "skip":
                        skipped += 1
                        continue
                    elif conflict_strategy == "overwrite":
                        cur.execute("""
                        INSERT OR REPLACE INTO memories (
                            id, title, story, date, approximate_period, category,
                            people_json, places_json, tags_json, is_fictional_demo,
                            ai_remembrance_card_json, ai_tribute, ai_summary,
                            created_at, updated_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """, (
                            mem.id,
                            mem.title,
                            mem.story,
                            mem.date,
                            mem.approximate_period,
                            mem.category,
                            json.dumps(mem.people),
                            json.dumps(mem.places),
                            json.dumps(mem.tags),
                            1 if mem.is_fictional_demo else 0,
                            json.dumps(mem.ai_remembrance_card.model_dump()) if mem.ai_remembrance_card else None,
                            mem.ai_tribute,
                            mem.ai_summary,
                            mem.created_at,
                            mem.updated_at
                        ))
                        updated += 1
                    elif conflict_strategy == "keep_both":
                        new_id = str(uuid.uuid4())
                        new_title = f"{mem.title} (Imported Copy)"
                        cur.execute("""
                        INSERT INTO memories (
                            id, title, story, date, approximate_period, category,
                            people_json, places_json, tags_json, is_fictional_demo,
                            ai_remembrance_card_json, ai_tribute, ai_summary,
                            created_at, updated_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """, (
                            new_id,
                            new_title,
                            mem.story,
                            mem.date,
                            mem.approximate_period,
                            mem.category,
                            json.dumps(mem.people),
                            json.dumps(mem.places),
                            json.dumps(mem.tags),
                            1 if mem.is_fictional_demo else 0,
                            json.dumps(mem.ai_remembrance_card.model_dump()) if mem.ai_remembrance_card else None,
                            mem.ai_tribute,
                            mem.ai_summary,
                            mem.created_at,
                            mem.updated_at
                        ))
                        imported += 1
                else:
                    cur.execute("""
                    INSERT INTO memories (
                        id, title, story, date, approximate_period, category,
                        people_json, places_json, tags_json, is_fictional_demo,
                        ai_remembrance_card_json, ai_tribute, ai_summary,
                        created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        mem.id,
                        mem.title,
                        mem.story,
                        mem.date,
                        mem.approximate_period,
                        mem.category,
                        json.dumps(mem.people),
                        json.dumps(mem.places),
                        json.dumps(mem.tags),
                        1 if mem.is_fictional_demo else 0,
                        json.dumps(mem.ai_remembrance_card.model_dump()) if mem.ai_remembrance_card else None,
                        mem.ai_tribute,
                        mem.ai_summary,
                        mem.created_at,
                        mem.updated_at
                    ))
                    imported += 1
        return ImportResult(
            total_processed=len(memories),
            imported=imported,
            updated=updated,
            skipped=skipped,
            errors=errors
        )
    finally:
        conn.close()
