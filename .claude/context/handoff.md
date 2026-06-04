## Agent Rule — MUST write this file at end of every session

> When finishing ANY session that modifies code, rewrite this file completely.
> Structure: what changed → key decisions → files touched → warnings → what's next.
> This is the backward-looking companion to `current-task.md` (forward-looking).
> A new agent reads BOTH files before starting work.

---

# Handoff — 2026-06-04

## What was done this session

| Fix/Feature | File | Detail |
|---|---|---|
| Read and internalized rev3 architecture report | `.claude/context/report-architecture-2026-06-03-rev3.md` | Global agents, context-files first-class, SSE, Phase 0 spike |
| Converted rev3 report to HTML | `.claude/context/report-architecture-2026-06-03-rev3.html` | Dark theme, sidebar TOC, agent scope cards, SQL syntax highlight |
| Updated CLAUDE.md to rev3 | `CLAUDE.md` | Target architecture, two memory layers, updated hard rules, global agent roster |
| Updated current-task.md | `.claude/context/current-task.md` | Phase 0 spike as next task with 5-step definition of done |
| Updated handoff.md | `.claude/context/handoff.md` | This file |
| Appended rev3 decisions to decisions.md | `.claude/context/decisions.md` | 4 new entries from rev3 |

## Key decisions made

- **No code was changed** — only context files and reports updated this session
- Architecture pivot to rev3 accepted: global agents + context-files first-class + SSE + Phase 0 spike
- `CLAUDE.md` now reflects the target state (Orchestration Dashboard), not just the current mockup

## Files changed this session

```
CLAUDE.md
.claude/context/current-task.md
.claude/context/handoff.md
.claude/context/decisions.md
.claude/context/report-architecture-2026-06-03-rev3.html   (created)
```

## Warnings / watch out for

- **Phase 0 must come first.** Do not start Phase 1 (schema) until the spike proves `claude --output-format stream-json` + `--resume` works on Windows. The entire architecture depends on this.
- **`code-reviewer` is read-only by rule.** If you configure this agent, tools must be `Read,Grep,Glob` only, mode `plan`. No exceptions — it must physically not be able to mutate files.
- **DB never stores context-file content.** `CLAUDE.md` and `.claude/context/*.md` are read from disk on demand via `GET /api/projects/:id/context`. Never cache them in SQLite.
- **Gemini fallback still active.** `server.ts` still has the Gemini proxy. Do not remove until Phase 2 ProcessManager is complete and tested.
- **All global state still in `App.tsx`.** 1083 lines. The context refactor is deferred behind the architecture pivot — do not start it until the new backend structure is in place.

## What's next

See `current-task.md` for the prioritized task list.
**Immediate next task:** Phase 0 Spike — prove `claude -p --output-format stream-json` → SSE → `session_id` → `--resume` on Windows before writing any schema or UI.
