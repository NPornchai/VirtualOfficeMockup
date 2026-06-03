## Agent Rule — MUST write this file at end of every session

> When finishing ANY session that modifies code, rewrite this file completely.
> Structure: what changed → key decisions → files touched → warnings → what's next.
> This is the backward-looking companion to `current-task.md` (forward-looking).
> A new agent reads BOTH files before starting work.

---

# Handoff — 2026-06-03

## What was done this session

| Fix/Feature | File | Detail |
|---|---|---|
| Connected remote repo | `.git/` | `git remote add origin https://github.com/NPornchai/VirtualOfficeMockup.git` + pulled `main` |
| Created context files system | `CLAUDE.md`, `.claude/context/` | Bootstrap per `C:\Users\pnaka\.claude\guides\context-files-system.md` |

## Key decisions made

- No code was changed this session — only repo connection and context file bootstrap.
- Context system follows the guide at `C:\Users\pnaka\.claude\guides\context-files-system.md` exactly.

## Files changed this session

```
CLAUDE.md                          (created)
.claude/context/current-task.md    (created)
.claude/context/handoff.md         (created)
.claude/context/decisions.md       (created)
```

## Warnings / watch out for

- **`server.ts` model name** (lines 99 + 144): uses `"gemini-3.5-flash"` which may not exist. The app's own UI (App.tsx:1071) references `gemini-2.5-flash`. Do not rename without a live API key to confirm.
- **All global state in `App.tsx`**: the file is 1083 lines. Next task (context refactor) must not be partially done — do it all at once or not at all (hard rule).
- **Static fallback must survive any refactor**: `staticFallback()` in `server.ts` is the app's safety net when Gemini is unavailable. Never delete or bypass it.
- **No auth**: any feature that assumes user identity should hardcode `id: "user"` — there is no session/token system.

## What's next

See `current-task.md` for the prioritized task list.
**Immediate next task:** Refactor global state from `App.tsx` into `src/context/OfficeContext.tsx` (Kanban task-3).
