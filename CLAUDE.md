# VirtualOfficeMockup — Root Context

> This file is loaded automatically by Claude Code every session.
> Keep it short — detailed context lives in `.claude/context/`.
> Update this file only when stack, hard rules, or project structure changes.

---

## Context files — read ALL before starting any work

| File | Purpose | Write rule |
|---|---|---|
| `.claude/context/current-task.md` | Forward-looking — what to do this session | Overwrite each session |
| `.claude/context/handoff.md` | Backward-looking — what was done last session, warnings | Overwrite each session |
| `.claude/context/decisions.md` | Append-only log of non-obvious trade-offs | Append only — never overwrite |

**End-of-session rule (any agent, any code change):**
- Overwrite `current-task.md` — remove done items, update next task
- Overwrite `handoff.md` — date, changes table, decisions + WHY, warnings
- Append to `decisions.md` — only if a non-obvious trade-off was made this session

---

## Project overview

VirtualOfficeMockup is being evolved from a decorative React + Gemini mockup into a
**Personal Claude Code Orchestration Dashboard** — a single-user web UI to manage projects,
configure global + project-scoped agents, and command real Claude Code CLI runs with live
streaming output. See `.claude/context/report-architecture-2026-06-03-rev3.md` for full analysis.

---

## Target architecture (rev3)

```
React 19 (Vite) frontend
└── REST + SSE → Express 4 backend
    ├── better-sqlite3  (projects / agents / runs)
    ├── child_process   (spawn claude CLI)
    └── SSE             (stream stream-json → browser)
```

**Two memory layers — keep distinct, never duplicate:**

| Layer | Where | Purpose |
|---|---|---|
| Run / session | SQLite `runs.session_id` | Conversation continuity; `--resume` |
| Project memory | Repo `CLAUDE.md` + `.claude/context/` | Durable narrative; git-committed |

---

## Current stack (what exists today)

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Tailwind CSS v4, Vite 6 |
| Animation | motion (Framer Motion v12), lucide-react |
| Backend | Express 4 + tsx (dev), esbuild bundle (prod) |
| AI | Google Gemini API — **to be removed** once Phase 2 complete |
| Port | 3000 (dev + prod) |

---

## Solution structure (current)

```
src/
├── App.tsx               — root component; ALL global state (pending context refactor)
├── data.ts               — static data (rooms, characters, tasks, calendar)
├── types.ts              — TypeScript interfaces
├── main.tsx              — React entry point
├── index.css             — global styles
├── assets/images/        — CEO sprite + office map PNG
└── components/
    ├── OfficeMap.tsx      — isometric office layout renderer
    ├── ChatPanel.tsx      — reusable chat panel
    ├── TaskBoard.tsx      — Kanban board
    ├── PantryMinigame.tsx — coffee drip mini-game (to be repurposed/removed)
    └── ScreenShareHub.tsx — screen share UI (to be repurposed as agent console)
server.ts                 — Express backend; Gemini proxy (to be replaced)
vite.config.ts
```

---

## Hard rules — never violate these

1. **Single-user only.** Bind server to `127.0.0.1`. No auth system, no multi-user flows.
2. **Never expose port externally.** `acceptEdits`/`bypassPermissions` = arbitrary local code execution from a web request — do not expose.
3. **All AI calls via backend only.** No direct AI SDK calls from frontend (Gemini now; Claude Code CLI later).
4. **DB never stores context-file content.** `CLAUDE.md` + `.claude/context/*.md` live in the repo. Read from disk on demand; never cache in SQLite.
5. **`code-reviewer` agent is read-only.** Tools: `Read, Grep, Glob` only. Mode: `plan`. It must never have `Edit`/`Write`/`Bash`.
6. **Global state stays in `App.tsx`** until the context refactor is done deliberately and completely — no partial migration.
7. **Static Gemini fallback must survive until removed.** Do not break the fallback path during transition.

---

## Agent roster (global — available in all projects)

| Agent | Scope | Tools | Permission Mode | Writes context files? |
|---|---|---|---|---|
| `senior-dev` | global | Read, Edit, Write, Bash, Grep, Glob | `acceptEdits` | Yes — rewrites current-task + handoff |
| `code-reviewer` | global | Read, Grep, Glob | `plan` | No — read-only |

---

## Known deferred items — do not fix without a dedicated task

| Item | Reason deferred |
|---|---|
| Refactor global state from `App.tsx` into React Context | Large scope; blocked behind architecture pivot |
| Benchmark `/api/chat` + `/api/meeting` under stress | Low priority; Gemini endpoints being removed |
| Verify Gemini model name `"gemini-3.5-flash"` in server.ts | Moot once Gemini removed |
| `ImageSource/` folder — raw assets not wired to components | No design spec; deferred |
| Replace Gemini with Claude Code (Phase 0–2) | Next major work — see current-task.md |
