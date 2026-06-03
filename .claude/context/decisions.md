# VirtualOfficeMockup — Decision Log

> **APPEND ONLY — never overwrite or delete entries.**
> Write here whenever a non-obvious trade-off is made that isn't self-evident from the code.
> Both the main assistant and any agent should append when making a significant decision.
>
> Format: `## [YYYY-MM-DD] Short title` → Context → Decision → Rationale → Consequences

---

## [2026-06-03] All global state kept in App.tsx (no context yet)

**Context:** The app has grown to 1083 lines in `App.tsx` with all state (`characters`, `messages`, `tasks`, `events`, `activeRoomId`, `isGenerating`, `ceoName`, `recentDialogs`, multiple tab states, TTS helpers) plus all handlers living in one file. Kanban task-3 calls for a refactor into React Context.

**Decision:** Do not partially migrate. Either refactor all state at once into `src/context/OfficeContext.tsx`, or leave everything in `App.tsx`. Partial migration is explicitly banned.

**Rationale:** A half-migrated state tree creates two sources of truth (some state in context, some in App.tsx props). Components would need to read from both places, making the data flow harder to follow than the current monolith. A full atomic migration is cleaner even if it's a larger change.

**Consequences:** Any session that touches state wiring must either (a) do the full context refactor first, or (b) add state to `App.tsx` until the refactor is done deliberately. Do not create a partial `OfficeContext.tsx` as a stepping stone.

---

## [2026-06-03] Gemini calls proxied through Express backend only

**Context:** The app uses `@google/genai` to call Gemini. The API key (`GEMINI_API_KEY`) must be kept server-side.

**Decision:** All Gemini calls go through `/api/chat` and `/api/meeting` endpoints in `server.ts`. The frontend never imports `@google/genai`.

**Rationale:** Exposing the Gemini API key in the browser bundle would leak it to any visitor. The Express proxy keeps the key in the server environment.

**Consequences:** Any new AI feature (new character, new endpoint) must add a route to `server.ts` — never add a direct Gemini call in a React component or utility file.

---

## [2026-06-03] Static fallback responses required for all AI characters

**Context:** The app was scaffolded from Google AI Studio and must work without a Gemini API key (demo/sandbox mode).

**Decision:** Every character (`code-reviewer`, `senior-dev`, `helper-bot`) has hardcoded Thai fallback strings in `staticFallback()` inside `server.ts`. The fallback is returned with `isSimulated: true` after an 800ms artificial delay.

**Rationale:** Preserves demo usability when GEMINI_API_KEY is absent or invalid. The delay makes the simulation feel realistic.

**Consequences:** When adding a new AI character, a fallback response must also be added to `staticFallback()`. Never remove the fallback path or make it conditional on a feature flag.
