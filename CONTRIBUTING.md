# Contributing to Echoes

Thank you for your interest in contributing to **Echoes — A Private Memory Garden**.

Echoes is dedicated to preserving meaningful personal stories, family recollections, oral histories, and cultural traditions with dignity, fidelity, and privacy.

## Ethical Boundaries & Core Principles

Before proposing features or code changes, please review our foundational boundaries:

1. **Local-First & Data Sovereignty**: All memories remain on the user's computer. We do not accept PRs introducing cloud analytics, external telemetry, or unauthenticated remote endpoints.
2. **Grounding & Truthfulness**: AI assistance must strictly ground its responses in user-provided memories. The AI must never invent personal facts, impersonate deceased individuals, or simulate consciousness.
3. **User Agency**: The user must always review and approve AI-generated text before it is preserved to the archive. Silent overwrites are forbidden.
4. **Offline Resilience**: The core application (saving, editing, searching, timeline navigation, exporting, and importing) must work 100% offline without network connectivity.

## Development Setup

1. **Backend**:
   ```bash
   python3 -m venv backend/venv
   source backend/venv/bin/activate
   pip install -r backend/requirements.txt
   pytest backend/tests
   ```

2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm test
   npm run build
   ```

3. **Local AI Model**:
   Install Ollama and pull the open-weight model:
   ```bash
   ollama pull gemma3:1b
   ```

## Code Quality & Testing

- Every backend endpoint must be covered with tests in `backend/tests/`.
- Frontend UI components must be tested with Vitest in `frontend/src/__tests__/`.
- Ensure all tests pass and `npm run build` succeeds before submitting a Pull Request.

