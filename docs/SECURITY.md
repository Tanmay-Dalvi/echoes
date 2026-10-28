# Security Policy & Architecture Boundary — Echoes

## Threat Model & Core Assumptions

Echoes is engineered around **data sovereignty** and **strict local boundary enforcement**. It is intended for personal and familial memory preservation.

### 1. Network Boundary
- **Loopback Enforcement**: In local self-hosted mode, the FastAPI backend listens strictly on `127.0.0.1:8000`, and Vite development/preview servers bind to `127.0.0.1:5173`.
- **No External Telemetry**: The codebase contains zero external analytics SDKs, user tracking pixels, remote error loggers, or cloud AI endpoints.
- **Local AI Boundary**: Local inference calls are made exclusively over loopback to Ollama at `http://127.0.0.1:11434`. Memory text is never forwarded to proprietary cloud models (e.g. OpenAI, Anthropic, Google Cloud).

### 2. Data Storage & Encryption at Rest
- **Database Location**: Records are stored in a standard SQLite file at `./data/echoes.db`.
- **Encryption Advisory**: Standard SQLite databases are stored unencrypted on disk. To protect sensitive personal oral histories against unauthorized physical device access, users should ensure the host filesystem utilizes full-disk encryption:
  - **Linux**: LUKS (`dm-crypt`)
  - **macOS**: FileVault
  - **Windows**: BitLocker

### 3. Backup & Import Integrity
- **Atomic Transactions**: All imports run inside a single atomic SQLite transaction. If any data corruption occurs during import, the transaction rolls back cleanly without leaving the database in an inconsistent state.
- **Payload Limits**: The import endpoint enforces a maximum limit of 5,000 memories per archive file and validates each memory object against Pydantic schemas.
- **Conflict Resolution**: Users explicitly choose between `Skip Duplicates`, `Overwrite`, or `Keep Both` (which generates a new UUID and marks the record title with `(Imported Copy)`).

### 4. Ethical AI & Prompt Injection Safeguards
- **Negative Prompting**: The system prompt prohibits hallucinating non-existent family members, fabricating dates, or claiming to simulate consciousness or speak as a deceased person.
- **Human-in-the-Loop**: All AI-generated outputs (remembrance cards, summaries, tributes) must be reviewed, edited if desired, and explicitly accepted by the user before they can be persisted to the archive.

## Reporting a Vulnerability

If you discover a security or privacy vulnerability in Echoes, please report it responsibly by opening a private security advisory on the GitHub repository:
[https://github.com/Tanmay-Dalvi/echoes/security/advisories](https://github.com/Tanmay-Dalvi/echoes/security/advisories)
