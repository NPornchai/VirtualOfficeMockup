# VirtualOfficeMockup — Architecture Analysis Report

**Date:** 2026-06-03
**Prepared by:** Byte (Senior Developer)
**For:** Pliew (CEO)
**Project:** VirtualOfficeMockup to Personal Claude Code Orchestration Dashboard

---

## Executive Summary

The VirtualOfficeMockup is a working React 19 + TypeScript frontend with a minimal Express 4 backend (2 Gemini proxy endpoints, 184 lines). The CEO wants to evolve it into a **Personal Claude Code Orchestration Dashboard** — a web UI to manage projects, configure agents, and drive real Claude Code CLI runs with live streaming output.

This report covers current state, target capabilities, gap analysis, the .NET vs Node architecture decision, recommended stack, SQLite schema, API surface, and a phased build plan.

**Recommendation:** Extend the existing Express backend with `better-sqlite3`, `ws`, and Node built-in `child_process`. Do not add .NET. Estimated full build: 3-4 weeks across 6 phases.

---

## Current State

| Layer | Technology | Status |
|---|---|---|
| Frontend | React 19 + TypeScript + Vite 6 + Tailwind CSS v4 | Working |
| Backend | Express 4, ~184 lines | 2 Gemini proxy endpoints only |
| AI | Google Gemini API | Decorative chat personas |
| Persistence | React component state | Lost on page refresh |
| Real-time | None | No WebSocket, no streaming |
| Agent execution | None | Personas are cosmetic |
| Auth | None | Single-user, acceptable |

**What the codebase actually does today:** renders a virtual office room UI, routes between rooms (Kitchen, Library, etc.), and proxies Gemini chat requests so office characters can respond in-character. There is no project management, no agent configuration, no task execution, and no persistent state of any kind.

---

## Target Vision

เป้าหมายคือ personal tool สำหรับ Pliew คนเดียว — ไม่ใช่ SaaS

A single-user dashboard where Pliew can:

1. **Manage projects** — register a local project by name, filesystem path, and git remote
2. **Configure agents** — define named agents with role, model, and system prompt per project
3. **Execute agents** — fire a prompt at a configured agent; the server spawns the `claude` CLI in the project directory
4. **Watch live output** — streaming stdout/stderr from the claude process appears in-browser in real time via WebSocket
5. **Review history** — browse past runs (prompt, full output, status, duration)

---

## Gap Analysis

| Capability | Current | Target | Gap |
|---|---|---|---|
| AI execution | Gemini API proxy (decorative) | Real `claude` CLI spawn | Replace entirely |
| Projects | None | CRUD + path + git remote | Build from scratch |
| Agents | Decorative Gemini personas | Configurable, spawnable | Replace + rebuild |
| Persistence | React state (ephemeral) | SQLite via better-sqlite3 | Build from scratch |
| Output streaming | None | WebSocket real-time stdout | Build from scratch |
| Task execution | None | `child_process.spawn` in project cwd | Build from scratch |
| Frontend state | Local useState/useReducer | API-backed, cache from server | Extend |

---

## Architecture Decision: .NET vs Node

ทำไมถึงไม่เพิ่ม .NET — เหตุผลหลักคือ overhead ไม่คุ้มกับ single-user personal tool

### Option A: Extend Express (Node.js) — RECOMMENDED

- `child_process.spawn('claude')` is native Node — no wrappers, no interop
- `better-sqlite3` is synchronous, zero-config, no separate server process
- `ws` streams stdout in ~5 lines of code
- Same TypeScript language across frontend and backend — no context switch
- One runtime, one process, one `npm run dev`
- Deploy: copy folder, `node server.js`

### Option B: Add ASP.NET Core + SignalR

- Valid technology — SignalR is production-grade streaming
- Requires two runtimes (Node for frontend dev, .NET for backend)
- Two separate processes in production, two ports, CORS config required
- `Process.Start` in C# is equivalent to `child_process.spawn` but adds a second runtime dependency
- EF Core + SQLite adds migration overhead compared to `better-sqlite3` used directly
- **No capability advantage for a personal single-user tool**
- Adds 2-3 days of setup and ongoing deployment friction with zero benefit at this scale

**Decision: Option A.** The problem does not justify two runtimes.

---

## Recommended Architecture

```
+-----------------------------------------------------+
|                    Browser                          |
|                                                     |
|  +--------------+  +--------------+  +----------+  |
|  | Project Mgr  |  |  Agent Config|  |  Console |  |
|  |  (React UI)  |  |  (React UI)  |  | (React)  |  |
|  +------+-------+  +------+-------+  +----+-----+  |
|         |                 |               |         |
|         +------- REST ----+       WebSocket (ws)    |
+-----------------------------------------------------+
                    |                       |
         +----------v-----------------------v------+
         |           Express 4 Server              |
         |                                         |
         |  /api/projects  (CRUD)                  |
         |  /api/agents    (CRUD)                  |
         |  /api/runs      (GET, POST trigger)     |
         |  /ws            (WebSocket upgrade)     |
         |                                         |
         |  +------------+   +------------------+  |
         |  | better-    |   |  ProcessManager  |  |
         |  | sqlite3    |   |  child_process   |  |
         |  | (projects, |   |  .spawn(claude)  |  |
         |  |  agents,   |   |  stream stdout   |  |
         |  |  runs)     |   |  -> WebSocket    |  |
         |  +-----+------+   +-----+------------+  |
         +--------|-----------------|--------------+
                  |                 |
         +--------v------+   +------v-----------+
         |  SQLite DB    |   |  Local Filesystem |
         |  (single file)|   |  (project paths,  |
         |               |   |   claude CLI)     |
         +---------------+   +------------------+
```

---

## SQLite Schema

```sql
CREATE TABLE projects (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    path        TEXT    NOT NULL,
    git_remote  TEXT,
    description TEXT,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE agents (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id    INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name          TEXT    NOT NULL,
    role          TEXT    NOT NULL,
    model         TEXT    NOT NULL DEFAULT 'claude-sonnet-4-6',
    system_prompt TEXT,
    created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE runs (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_id    INTEGER NOT NULL REFERENCES agents(id),
    prompt      TEXT    NOT NULL,
    output      TEXT,
    status      TEXT    NOT NULL DEFAULT 'running',
    started_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    finished_at TEXT
);
```

`status` values: `running` | `done` | `cancelled` | `error`

---

## API Surface

```
REST:
  GET    /api/projects              list all projects
  POST   /api/projects              create project
  PUT    /api/projects/:id          update project
  DELETE /api/projects/:id          delete project (cascades agents + runs)

  GET    /api/projects/:id/agents   list agents for project
  POST   /api/agents                create agent
  PUT    /api/agents/:id            update agent
  DELETE /api/agents/:id            delete agent

  GET    /api/runs                  list runs (filter: agent_id, limit)
  POST   /api/runs                  start a run -> spawns claude process
  POST   /api/runs/:id/cancel       kill process, set status = cancelled

WebSocket:
  ws://localhost:PORT/ws
    client sends: { type: 'subscribe', runId: number }
    server sends: { type: 'stdout',    runId, line: string }
                  { type: 'done',      runId, status: 'done' | 'error' }
```

---

## Claude Code CLI Integration

**System prompt delivery options (in order of preference):**

1. Write a `CLAUDE.md` into the project directory before spawning — picked up automatically by Claude Code
2. Prepend the system prompt to the user prompt string
3. Use `--system-prompt` flag if the installed `claude` CLI version supports it — verify at runtime with `claude --help`

**Process lifecycle edge cases to validate in Phase 2:**

- Exit code non-zero — distinguish crash from user-initiated error
- Output buffering — `data` events do not guarantee line boundaries; buffer and split on `\n`
- Cancellation on Windows — SIGTERM may not work; use `proc.kill()` and verify behavior
- Concurrent runs — `processMap` keyed by `runId`; cap max concurrent runs to avoid OOM

---

## Stack Additions

**Backend:**

| Package | Purpose | Notes |
|---|---|---|
| `better-sqlite3` | SQLite persistence, synchronous API | Native module, no server process needed |
| `ws` | WebSocket server for stdout streaming | Minimal, battle-tested |
| `child_process` | Spawn claude CLI | Node built-in, zero install |

**Frontend:**

| Package | Purpose | Notes |
|---|---|---|
| `@tanstack/react-query` or `swr` | Server-state caching for REST calls | react-query has better devtools |
| Native `WebSocket` | Console streaming | Already in browser, no package needed |
| `xterm.js` | Terminal-style output rendering | Optional; nice to have for Phase 5 |

---

## What to Keep vs Replace

### Keep

| Item | Reason |
|---|---|
| React 19 + Vite + TypeScript | Correct frontend stack, no reason to change |
| Tailwind CSS v4 + lucide-react | Styling system stays |
| Express server structure | Extend with new routes, do not rewrite |
| Room/navigation metaphor | Repurpose rooms as feature sections |

### Replace or Repurpose

| Item | Replace With |
|---|---|
| Gemini chat personas | Real Claude Code CLI execution |
| PantryMinigame | Remove, or repurpose as Run History view |
| ScreenShareHub (current decorative) | Real agent output console with WebSocket stream |
| React-only state | SQLite + REST API + server state |
| Gemini API dependency | Remove entirely; not needed in target architecture |

Room repurposing suggestion: Library -> Agent Config, Meeting Room -> Command Console, Kitchen -> Run History. The visual metaphor stays; the content behind each door changes.

---

## Build Phases

| # | Deliverable | Effort | Depends On |
|---|---|---|---|
| 1 | SQLite schema + CRUD API (projects, agents, runs table) | S | none |
| 2 | WebSocket server + Claude CLI ProcessManager | M | Phase 1 (run record) |
| 3 | Project Manager UI (list, create, edit, delete) | S | Phase 1 |
| 4 | Agent Config UI (per-project, model + system prompt) | S | Phase 1 |
| 5 | Command Console (prompt input + live streaming output) | M | Phase 2 |
| 6 | Run History UI (list runs, view output, cancel) | S | Phase 2, Phase 5 |

**Effort key:** S = 1-2 days, M = 3-4 days. Total estimated: 3-4 weeks.

**Recommended execution order:** 1 -> 3 + 4 (parallel) -> 2 -> 5 -> 6

Phases 3 and 4 only need the REST API from Phase 1 and can proceed while Phase 2 is being built. Phase 5 is the most complex UI piece and should start only after Phase 2 process lifecycle is stable and tested.

---

## Conclusion

The VirtualOfficeMockup has a solid frontend foundation and a backend that is deliberately minimal — which is an advantage, not a liability. Extending it to a real orchestration dashboard requires adding exactly three capabilities: a SQLite layer, a WebSocket server, and a process manager that spawns the `claude` CLI. None of these require changing the language, the framework, or the deployment model.

The Gemini API dependency can be removed entirely once Phase 2 is complete — it serves no purpose in the target architecture. The visual room metaphor is optional to keep; repurposing rooms as feature sections is the lowest-friction path.

**Next action:** Begin Phase 1. Define the SQLite schema, install `better-sqlite3`, and implement `/api/projects` and `/api/agents` CRUD endpoints with TypeScript types. This unblocks every subsequent phase.