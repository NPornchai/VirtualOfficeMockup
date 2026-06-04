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

---

## [2026-06-04] Agents are global, not per-project (rev3)

**Context:** Initial design (rev1) attached agents to projects. In practice, `senior-dev` and `code-reviewer` are useful in every project — identical to how Claude Code handles `~/.claude/agents/` (global) vs `.claude/agents/` (project-scoped).

**Decision:** Agents have a `scope` field (`global` | `project`). Global agents have `project_id = NULL` and are seeded at DB init. Project agents have a `project_id` and override globals by name collision. `runs` tracks both `project_id` (where it ran) and `agent_id` (which agent ran).

**Rationale:** Mirrors Claude Code's own scoping rules exactly. Avoids duplicating `senior-dev`/`code-reviewer` config per project. DB `CHECK` constraint enforces the invariant at write time.

**Consequences:** `POST /api/agents/:id/export` must write to `~/.claude/agents/<name>.md` for global scope and `.claude/agents/<name>.md` for project scope. Any new agent added by the user should default to `global` unless it's genuinely project-specific.

---

## [2026-06-04] DB never stores context-file content (rev3)

**Context:** Each project has `CLAUDE.md` + `.claude/context/` files as durable project memory. Options were: (a) sync them into SQLite, (b) read from disk on demand.

**Decision:** The DB stores only the project `path`. Context files are read from disk on demand via `GET /api/projects/:id/context`. Content is never cached in SQLite.

**Rationale:** The repo is the source of truth — the files are git-committed, edited by agents following their write rules, and auto-loaded by Claude Code. Duplicating them in the DB creates two sources of truth and a sync problem. Reading from disk is always fresh.

**Consequences:** The `/context` endpoint must handle missing files gracefully (`exists: false`) and offer a Bootstrap action. Any agent that rewrites `current-task.md` or `handoff.md` is writing to the repo, not the DB — that is correct and expected.

---

## [2026-06-04] SSE instead of WebSocket for streaming (rev2/rev3)

**Context:** rev1 used WebSocket (`ws` library) for streaming `claude` stdout to the browser. rev2 evaluated SSE vs WebSocket.

**Decision:** Use SSE (`text/event-stream`, native `EventSource` in browser) instead of WebSocket. No extra package on backend — just `res.setHeader` + `res.write`.

**Rationale:** For server→client only streaming (which is all that's needed for run output), SSE is simpler: no upgrade handshake, no keep-alive management, works over HTTP/1.1, and requires zero backend packages. WebSocket's bidirectional capability is unused here. Cancel is handled via `POST /api/runs/:id/cancel`, not a WS message.

**Consequences:** If a future feature needs bidirectional real-time (e.g. interactive stdin to a running process), SSE would need to be replaced or augmented with WebSocket. For now, SSE + REST cancel is the right split.

---

## [2026-06-04] Phase 0 spike required before Phase 1 (rev2/rev3)

**Context:** The entire architecture depends on `claude --output-format stream-json` working correctly on Windows — specifically: NDJSON line parsing, `session_id` extraction, `--resume` continuation, and `proc.kill()` cancellation.

**Decision:** Phase 0 is a mandatory throwaway spike before any schema, UI, or ProcessManager is built. It writes a minimal `spike/test-spawn.ts` and a temporary Express SSE endpoint to validate the full chain end-to-end.

**Rationale:** Windows has known quirks (SIGTERM unreliable, path handling, buffering). Discovering these after Phase 1–2 are built would require rework. Discovering them in a 1–2 day spike is cheap.

**Consequences:** No Phase 1 work (schema, CRUD) should begin until Phase 0 findings are documented and all 5 validation steps pass. The spike files live in `spike/` and can be deleted after Phase 1 is stable.

---

## [2026-06-04] `--verbose` is required with `--output-format stream-json` (Phase 0 finding)

**Context:** Phase 0 spike attempted to spawn `claude --print --output-format stream-json` without `--verbose`. CLI returned exit code 1 with error: `When using --print, --output-format=stream-json requires --verbose`.

**Decision:** Always include `--verbose` in the ProcessManager spawn args when using `stream-json`. This is a mandatory flag, not optional.

**Rationale:** Discovered on Windows, likely applies cross-platform. Without it the process exits immediately with no output.

**Consequences:** ProcessManager template args must be `["--print", "--verbose", "--output-format", "stream-json", ...]`. Document in code comment so future maintainers don't remove it.

---

## [2026-06-04] Windows cancellation: SIGTERM works, proc.kill() is sufficient (Phase 0 finding)

**Context:** Concern that SIGTERM might be unreliable on Windows (common in Node.js docs). Phase 0 spike tested `proc.kill()` mid-run.

**Decision:** Use `proc.kill()` (default SIGTERM) for cancellation. No need for `SIGKILL` fallback for normal cancellation flows. Keep a 15s safety timeout as belt-and-suspenders.

**Rationale:** Spike confirmed exit with `code=null, signal=SIGTERM` — process terminated cleanly. Windows Node.js translates `proc.kill()` to `TerminateProcess()` internally; it works.

**Consequences:** ProcessManager cancel handler: `proc.kill()` + update status to `cancelled`. If a 15s timeout fires without exit, escalate to `proc.kill("SIGKILL")`.

---

## [2026-06-04] Capture session_id on `init` event, not `result` (Phase 0 finding)

**Context:** `session_id` appears in both the `system/init` event (first event) and the `result` event (last event). Question: when to persist it to `runs.session_id`.

**Decision:** Persist `session_id` immediately when the `init` event arrives. Do not wait for `result`.

**Rationale:** SSE subscribers benefit from knowing `session_id` early — they can display it in the UI and the user can note it for manual `--resume`. Waiting for `result` means the UI only gets it after the entire run completes, defeating the purpose of early capture.

**Consequences:** ProcessManager must parse the first `system` event, extract `session_id`, call `db.run("UPDATE runs SET session_id=? WHERE id=?", ...)` immediately, then emit an SSE `init` event with `{ sessionId }` to subscribers.
