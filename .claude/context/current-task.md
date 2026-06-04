## Agent Rule — MUST follow every session

> After completing ANY work in this project, rewrite this file to reflect the new state:
> - Move completed items to "Done this session" or remove them
> - Update "Next task" to the actual next item
> - Keep deferred items as-is unless status changed
>
> This file is the handoff contract between agent sessions. A stale file = wrong context for the next agent.

---

# Current Task

> Overwrite this file each session — do not accumulate old tasks.
> Last updated: 2026-06-04

## Status: Ready to start

---

## Next task — Phase 0 Spike: Prove Core Loop on Windows

**Size:** Small (1–2 days)
**Goal:** Before writing any schema or UI, prove that the full execution chain works on this Windows machine:
`claude -p --output-format stream-json` → NDJSON parsing → SSE → capture `session_id` → `--resume` continuation

### What needs to be done

1. **Verify `claude` CLI is available** — run `claude --version` in PowerShell; confirm path
2. **Write a minimal spike script** (`spike/test-spawn.ts`) that:
   - Spawns `claude -p "Say hello in one sentence." --output-format stream-json`
   - Reads stdout line-by-line, parses NDJSON
   - Extracts and logs `session_id` from the `init` event
   - Logs each `assistant` message chunk
   - Logs exit code
3. **Wire SSE** — add a temporary Express endpoint `GET /spike/stream` that runs the above and streams events to browser via `text/event-stream`
4. **Test `--resume`** — run a second prompt using `--resume <session_id>` from step 2; confirm the model sees prior context
5. **Cancellation** — call `proc.kill()` mid-run on Windows; confirm process terminates cleanly
6. **Document findings** — note any Windows-specific quirks (SIGTERM, buffering, path issues)

### Implementation notes
- `cwd` for the test: use this project's path (`E:\Workspace\VirtualOffice`) or any project with a `CLAUDE.md`
- Do NOT build the full DB or UI yet — this is a spike, keep it throwaway
- Spike files go in `spike/` directory; can be deleted after Phase 1
- If `claude` CLI is not installed, that's the first blocker — stop and report

### Definition of done
All 5 steps pass. `session_id` captured, `--resume` confirmed, cancellation clean, SSE events reach browser.

---

## Deferred (do not do today)

| Item | Reason deferred |
|---|---|
| Phase 1 — SQLite schema + CRUD API | Blocked on Phase 0 spike results |
| Phase 2 — SSE ProcessManager | Blocked on Phase 0 |
| Phase 3 — Project Manager UI + Memory Panel | Blocked on Phase 1 |
| Phase 4 — Agent Config UI | Blocked on Phase 1 |
| Phase 5 — Command Console | Blocked on Phase 2 |
| Phase 6 — Run History UI | Blocked on Phase 2 |
| React App.tsx → Context refactor | Blocked behind architecture pivot |
| Remove Gemini API | After Phase 2 complete |
