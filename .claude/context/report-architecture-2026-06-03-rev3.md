# VirtualOfficeMockup — Architecture Analysis Report (rev3)

**Date:** 2026-06-03
**Revision:** rev3 — global agents + per-project context-files system folded into the data model and Claude Code integration
**Prepared by:** Byte (Senior Developer)
**For:** Pliew (CEO)
**Project:** VirtualOfficeMockup to Personal Claude Code Orchestration Dashboard

---

## Revision Notes

**rev3 (this revision):**

1. **Agents are now global, not per-project.** `senior-dev` and `code-reviewer` are shared across every project (user-level subagents at `~/.claude/agents/`). The schema adds `scope` to `agents`, makes `project_id` nullable, and moves the project link onto `runs`.
2. **Per-project context-files system is a first-class concept.** Each project carries `CLAUDE.md` + `.claude/context/{current-task,handoff,decisions}.md`. This is the in-repo project memory — separate from, and complementary to, the orchestrator's DB session layer. The dashboard surfaces these files and can bootstrap them; it does **not** duplicate their content in the DB.
3. **Subagent scoping clarified** — global (`~/.claude/agents/`) vs project (`.claude/agents/`), with project winning on name collision. The DB is the source of truth for agent config; runs apply it deterministically via CLI flags; agent files can be exported so the same agents work in a plain terminal too.
4. **Tool/permission split per agent** — `senior-dev` writes (Edit/Write/Bash, `acceptEdits`); `code-reviewer` is read-only (Read/Grep/Glob, no mutation) so it can review without touching files.

**rev2 (carried forward):** session continuity (`session_id` + `--resume`), per-agent `permission_mode`/`allowed_tools`, `--output-format stream-json`, SSE instead of WebSocket, subagent ≠ CLAUDE.md, Phase 0 spike.

**rev1 (carried forward):** keep React/Vite + TypeScript, extend Express, no .NET, SQLite, single-user/localhost.

---

## Executive Summary

The VirtualOfficeMockup is a working React 19 + TypeScript frontend with a minimal Express 4 backend (2 Gemini proxy endpoints, 184 lines). The CEO wants to evolve it into a **Personal Claude Code Orchestration Dashboard** — a web UI to manage projects, configure (global + project) agents, and drive real Claude Code runs with live streaming output, on top of the existing per-project context-files workflow.

**Recommendation:** Extend the existing Express backend with `better-sqlite3`, Node `child_process`, and Server-Sent Events. Drive Claude Code via `claude -p --output-format stream-json`. Model agents as global with optional project-scoped overrides. Treat each project's `CLAUDE.md` + `.claude/context/` files as the source-of-truth project memory. Do not add .NET. Estimated full build: 3–4 weeks across 7 phases (incl. Phase 0 spike).

---

## Two Memory Layers (important conceptual model)

The orchestrator and Claude Code each maintain state. Keep them distinct — do not let one duplicate the other:

| Layer | Lives in | Scope | Owner | Purpose |
|---|---|---|---|---|
| **Run / session** | SQLite (`runs.session_id`) | Per run-chain | Orchestrator | Conversation transcript continuity; `--resume` a recent session |
| **Project memory** | The repo: `CLAUDE.md` + `.claude/context/*` | Per project, long-lived, git-committed | The agents (per their write rules) | Human/agent-readable narrative: what to do, what was done, why |

`session_id` is short-term transcript glue. The context files are the durable project story that survives across totally separate sessions and is read at the **start** of every run (CLAUDE.md is auto-loaded) and rewritten at the **end**. The DB never stores context-file content — it points at the project path and reads them on demand.

---

## Current State

| Layer | Technology | Status |
|---|---|---|
| Frontend | React 19 + TypeScript + Vite 6 + Tailwind CSS v4 | Working |
| Backend | Express 4, ~184 lines | 2 Gemini proxy endpoints only |
| AI | Google Gemini API | Decorative chat personas |
| Persistence | React component state | Lost on page refresh |
| Real-time | None | No streaming |
| Agent execution | None | Personas are cosmetic |
| Session continuity | None | No resumable conversation |
| Context-files awareness | None | Convention exists in repos, not surfaced anywhere |
| Auth | None | Single-user, acceptable (see Security) |

---

## Target Vision

เป้าหมายคือ personal tool สำหรับ Pliew คนเดียว — ไม่ใช่ SaaS

A single-user dashboard where Pliew can:

1. **Manage projects** — register a local project by name, path (the `cwd`), and git remote. Each project follows the context-files convention (`CLAUDE.md` + `.claude/context/`).
2. **Use global agents everywhere** — `senior-dev` and `code-reviewer` are global, available in every project; optionally define project-scoped agents that override by name.
3. **Configure agents** — role, model, system prompt, allowed tools, permission mode.
4. **Execute** — pick a project + an agent + a prompt; the server spawns `claude` headless in the project cwd with that agent's config.
5. **Watch live output** — streaming `stream-json` events appear in-browser via SSE.
6. **Continue a conversation** — a follow-up resumes the same session.
7. **See project memory** — view `current-task` / `handoff` / `decisions` for the active project; bootstrap them into a new project.
8. **Review history** — past runs (prompt, output, status, duration, session, which agent, which project).

---

## Architecture Decision: .NET vs Node

ทำไมไม่เพิ่ม .NET — overhead ไม่คุ้มกับ single-user tool และ Claude Code SDK เป็น TS/Python (ไม่มี .NET SDK)

### Option A: Extend Express (Node.js) — RECOMMENDED

- `child_process.spawn('claude', ...)` is native — no interop.
- `better-sqlite3` synchronous, zero-config, no separate server.
- SSE streams output with the built-in response — zero extra packages.
- One TypeScript language, one runtime, one process, one `npm run dev`.
- Upgrade path: official **Claude Agent SDK** (`@anthropic-ai/claude-agent-sdk`, TS) — same language, no new runtime.

### Option B: Add ASP.NET Core + SignalR

- Valid, but two runtimes, two processes, two ports, CORS, and **no .NET Claude Code SDK** (you'd hand-parse `stream-json` and reimplement session/permission glue). No capability gain at this scale.

**Decision: Option A.**

### Sub-decision: how to talk to Claude Code

| Approach | Pros | Cons | Verdict |
|---|---|---|---|
| **CLI `claude -p --output-format stream-json`** | Zero deps, full control | Manual NDJSON read + process lifecycle | **Start here** |
| **Claude Agent SDK `query()`** | Typed stream, built-in resume + permission callbacks + MCP | One proprietary dep | Upgrade if glue gets fiddly |

---

## SQLite Schema

```sql
CREATE TABLE projects (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    path        TEXT    NOT NULL,             -- absolute cwd passed to `claude`
    git_remote  TEXT,
    description TEXT,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE agents (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    scope           TEXT    NOT NULL DEFAULT 'global',   -- 'global' (~/.claude/agents) | 'project' (.claude/agents)
    project_id      INTEGER REFERENCES projects(id) ON DELETE CASCADE,  -- NULL when scope = 'global'
    name            TEXT    NOT NULL,
    role            TEXT    NOT NULL,
    model           TEXT    NOT NULL DEFAULT 'claude-sonnet-4-6',
    system_prompt   TEXT,                     -- becomes the subagent body
    allowed_tools   TEXT,                     -- CSV e.g. 'Read,Edit,Write,Bash'; NULL = inherit defaults
    permission_mode TEXT    NOT NULL DEFAULT 'acceptEdits',
                              -- default | acceptEdits | bypassPermissions | plan
    created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    CHECK ( (scope = 'global'  AND project_id IS NULL)
         OR (scope = 'project' AND project_id IS NOT NULL) )
);

-- Global agent names are unique (senior-dev, code-reviewer, ...); project agents may reuse a name to override.
CREATE UNIQUE INDEX idx_agents_global_name ON agents(name) WHERE scope = 'global';

CREATE TABLE runs (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id   INTEGER NOT NULL REFERENCES projects(id),  -- the repo this ran in (the cwd)
    agent_id     INTEGER NOT NULL REFERENCES agents(id),     -- global or project-scoped
    prompt       TEXT    NOT NULL,
    output       TEXT,                          -- accumulated stream-json transcript
    session_id   TEXT,                          -- Claude Code session id, captured from init/result
    resume_of    INTEGER REFERENCES runs(id),   -- prior run this continues; NULL = fresh session
    status       TEXT    NOT NULL DEFAULT 'running',  -- running | done | cancelled | error
    exit_code    INTEGER,                        -- claude process exit code
    started_at   TEXT    NOT NULL DEFAULT (datetime('now')),
    finished_at  TEXT
);

CREATE INDEX idx_agents_project ON agents(project_id);
CREATE INDEX idx_runs_project   ON runs(project_id);
CREATE INDEX idx_runs_agent     ON runs(agent_id);
CREATE INDEX idx_runs_session   ON runs(session_id);
```

**Seed — the two global agents:**

```sql
INSERT INTO agents (scope, project_id, name, role, allowed_tools, permission_mode) VALUES
  ('global', NULL, 'senior-dev',    'Senior Developer', 'Read,Edit,Write,Bash,Grep,Glob', 'acceptEdits'),
  ('global', NULL, 'code-reviewer', 'Code Reviewer',    'Read,Grep,Glob',                 'plan');
```

**Notes:**

- `agents.scope` + nullable `project_id` mirror Claude Code's own subagent scoping (user vs project). The `CHECK` keeps the two consistent.
- `senior-dev` gets write tools + `acceptEdits` because it writes code **and** rewrites `current-task.md` / `handoff.md` at session end.
- `code-reviewer` is read-only (no `Edit`/`Write`) so it physically cannot mutate the repo — it reviews and reports. Context-file writes stay with `senior-dev` (or the main session).
- `runs.project_id` + `runs.agent_id` together express "this global agent ran in this project."

---

## API Surface

```
REST — projects:
  GET    /api/projects
  POST   /api/projects
  PUT    /api/projects/:id
  DELETE /api/projects/:id

REST — agents (global + project-scoped):
  GET    /api/agents                    list all agents (filter: scope=global|project, projectId)
  POST   /api/agents                    body: { scope, projectId?, name, role, model,
                                                 systemPrompt, allowedTools, permissionMode }
  PUT    /api/agents/:id
  DELETE /api/agents/:id
  GET    /api/projects/:id/agents       agents AVAILABLE in this project
                                          = global agents ∪ this project's project-scoped agents
                                            (project wins on name collision — same rule as Claude Code)
  POST   /api/agents/:id/export         (optional) write/refresh the matching subagent .md file
                                          (~/.claude/agents for global, .claude/agents for project)

REST — runs:
  GET    /api/runs                      list (filter: projectId, agentId, limit)
  GET    /api/runs/:id                  full record (prompt, output, sessionId, status, exitCode)
  POST   /api/runs                      start a run -> spawns claude -> { runId }
        body: { projectId, agentId, prompt, resumeOf? }
  POST   /api/runs/:id/cancel           proc.kill(); status = cancelled

REST — project memory (context files, read from disk):
  GET    /api/projects/:id/context      returns { claudeMd, currentTask, handoff, decisions, exists }
                                          (reads CLAUDE.md + .claude/context/*.md; never cached in DB)
  POST   /api/projects/:id/bootstrap    body: { agentId }
                                          runs the context-files bootstrap prompt to scaffold a new project

Streaming (SSE):
  GET    /api/runs/:id/stream           Content-Type: text/event-stream
        event: init      data: { sessionId }
        event: message   data: { kind: 'assistant'|'tool_use'|'tool_result', payload }
        event: done      data: { status, exitCode, sessionId }
        event: error     data: { message }
```

---

## Claude Code Integration

### A. Project memory — auto-loaded, in-repo

Each project follows the context-files convention:

```
<project-root>/
├── CLAUDE.md                       ← auto-loaded by Claude Code every session
└── .claude/context/
    ├── current-task.md             ← forward-looking; overwrite each session
    ├── handoff.md                  ← backward-looking; overwrite each session
    └── decisions.md                ← append-only trade-off log
```

- `CLAUDE.md` is **project-wide memory**, auto-loaded — it carries the stack, hard rules, and the end-of-session write rules that tell any agent to read all three context files first and rewrite `current-task` / `handoff` at the end.
- The dashboard reads these files on demand (`GET /api/projects/:id/context`) and shows them in the project view. It does not store their content in SQLite — the repo is the source of truth, and the files are git-committed.
- New project with no context files → offer **Bootstrap** (`POST /api/projects/:id/bootstrap`), which fires the bootstrap prompt at a global agent to scaffold `CLAUDE.md` + `.claude/context/*`.

### B. Agent identity — global vs project subagents

- A configured agent maps to a Claude Code subagent: **global** at `~/.claude/agents/<name>.md` (available in every project) or **project** at `.claude/agents/<name>.md`. Project wins on name collision.
- `senior-dev` and `code-reviewer` are **global** (`scope='global'`).
- **The DB is the source of truth** for agent config. A run applies it deterministically at spawn time via flags (`--append-system-prompt`, `--allowedTools`, `--model`, `--permission-mode`) — so the run *is* that agent regardless of file state. `POST /api/agents/:id/export` can mirror the record to the matching `.md` so the same agents also work when you run `claude` directly in a terminal.

### C. Run mechanics — spawn, stream, session

```bash
claude -p "<prompt>" \
  --append-system-prompt "<agent.system_prompt>" \
  --model "<agent.model>" \
  --allowedTools "<agent.allowed_tools>" \
  --permission-mode "<agent.permission_mode>" \
  --output-format stream-json \
  [--resume <session_id>]
# cwd = projects.path
```

- `stream-json` = NDJSON: `system/init` (carries `session_id`), `assistant`, `tool_use`, `tool_result`, final `result`. Read line-by-line, forward each as an SSE `message`, persist `session_id` on `init`, set `status`/`exit_code`/`finished_at` on exit.
- Because `CLAUDE.md` is auto-loaded, every run already gets the project's rules and is instructed to read/maintain the context files — the orchestrator does not need to inject them.

### Process lifecycle edge cases (validate in Phase 0/2)

- `session_id` timing — appears in `init` (persist immediately) and again in `result`.
- Non-zero exit — store `exit_code`; distinguish crash / clean / cancel.
- Line boundaries — split bytes on `\n`, `JSON.parse` per line.
- Cancellation on Windows — SIGTERM unreliable; use `proc.kill()` and verify.
- Concurrent runs — `processMap` keyed by `runId`; cap concurrency.

---

## Security (single-user, localhost)

`acceptEdits` / `bypassPermissions` let an agent edit files and run bash without prompting — arbitrary local code execution from a web request. Therefore:

- **Bind to `127.0.0.1` only** — never `0.0.0.0`; do not expose the port.
- Use `permission_mode` per agent as a blast-radius control: `code-reviewer` runs `plan` (read-only), `senior-dev` runs `acceptEdits`, `bypassPermissions` sparingly.
- Keep `allowed_tools` as tight as each agent's job requires (read-only agents get no `Edit`/`Write`).

---

## Stack Additions

**Backend:** `better-sqlite3` (persistence), `child_process` (spawn `claude`, built-in), SSE (no package). Optional upgrade: `@anthropic-ai/claude-agent-sdk`.

**Frontend:** `@tanstack/react-query` or `swr` (server-state cache), native `EventSource` (streaming), `xterm.js` (optional terminal rendering), a simple Markdown renderer for the context-files viewer.

---

## What to Keep vs Replace

### Keep

| Item | Reason |
|---|---|
| React 19 + Vite + TypeScript | Correct frontend stack |
| Tailwind CSS v4 + lucide-react | Styling stays |
| Express server structure | Extend, do not rewrite |
| Room/navigation metaphor | Repurpose rooms as feature sections |

### Replace or Repurpose

| Item | Replace With |
|---|---|
| Gemini chat personas | Real Claude Code (global) subagent execution |
| PantryMinigame | Remove, or repurpose as Run History |
| ScreenShareHub (decorative) | Real agent output console with SSE stream |
| React-only state | SQLite + REST + server state |
| Gemini API dependency | Remove entirely |

Room repurposing: Library → Agent Config (global + project), Meeting Room → Command Console, Kitchen → Run History, plus a per-project **Memory** panel showing `current-task` / `handoff` / `decisions`.

---

## Build Phases

| # | Deliverable | Effort | Depends On |
|---|---|---|---|
| 0 | **Spike:** spawn `claude -p --output-format stream-json` for one prompt, stream via SSE, capture `session_id`, prove `--resume` works on Windows | S | none |
| 1 | SQLite schema + CRUD API (projects, agents incl. scope, runs); seed global agents | S | Phase 0 |
| 2 | SSE stream endpoint + Claude CLI ProcessManager (apply agent flags, session capture, exit_code, cancel) | M | Phase 0, 1 |
| 3 | Project Manager UI + per-project Memory panel (read `/context`) + Bootstrap action | S | Phase 1 |
| 4 | Agent Config UI (global + project agents; model, prompt, tools, perm mode) | S | Phase 1 |
| 5 | Command Console (pick project + agent + prompt; live SSE; resume) | M | Phase 2 |
| 6 | Run History UI (filter by project/agent; view output; cancel) | S | Phase 2, 5 |

**Effort:** S = 1–2 days, M = 3–4 days. **Order:** 0 → 1 → 3 + 4 (parallel) → 2 → 5 → 6.

---

## Conclusion

Two changes define rev3: agents are **global** (with optional project overrides), matching how `senior-dev` and `code-reviewer` are actually used; and each project's **context-files system** is the in-repo source-of-truth memory the dashboard surfaces but never duplicates. The orchestrator's own state stays minimal — projects, agent configs, and run history with `session_id` for resume. Everything else (the project narrative, the working rules) already lives in the repo via `CLAUDE.md` and `.claude/context/`, read at the start of every run and maintained at the end.

**Next action:** Run **Phase 0** — prove spawn → stream-json → SSE → `session_id` → `--resume` on your Windows machine — then Phase 1 (schema + CRUD, seed the two global agents), which unblocks the rest.
