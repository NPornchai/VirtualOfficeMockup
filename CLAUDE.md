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

Virtual Office Mockup — isometric pixel-art office simulation where the user (CEO Pliew/ปลิว) navigates between rooms and interacts with 3 AI colleagues powered by Gemini. Built originally in Google AI Studio and extended locally.

Rooms: CEO Room (Lobby) → SA Room (Meeting/Byte) → QA Room (Kanban/Mina) → Helper Desk (Momo) → Pantry (mini-game)

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Tailwind CSS v4, Vite 6 |
| Animation | motion (Framer Motion v12), lucide-react icons |
| Backend | Express 4 + tsx (dev), esbuild bundle (prod) |
| AI | Google Gemini API (`@google/genai`) — model `gemini-2.5-flash` |
| TTS | Browser Web Speech API (Thai locale, `th-TH`) |
| Port | 3000 (dev + prod) |
| Env | `GEMINI_API_KEY` in `.env` (see `.env.example`) |

---

## Solution structure

```
src/
├── App.tsx               — root component; ALL global state lives here
├── data.ts               — static data (rooms, characters, tasks, calendar, trivia, coffee)
├── types.ts              — TypeScript interfaces (Room, Character, Message, OfficeTask, CalendarEvent)
├── main.tsx              — React entry point
├── index.css             — global styles
├── assets/images/        — CEO sprite + office map PNG
└── components/
    ├── OfficeMap.tsx      — isometric office layout renderer with character avatars + speech bubbles
    ├── ChatPanel.tsx      — reusable chat panel (DM channels + group meeting)
    ├── TaskBoard.tsx      — Kanban board (QA Room: todo/in_progress/review/done)
    ├── PantryMinigame.tsx — coffee drip mini-game + developer trivia quiz
    └── ScreenShareHub.tsx — code audit / screen share UI (posts to /api/chat)
server.ts                 — Express backend; Gemini API proxy (/api/chat, /api/meeting)
vite.config.ts            — Vite + Tailwind plugin; HMR disabled via DISABLE_HMR env var
```

---

## Hard rules — never violate these

1. **No auth system.** Single-user only (CEO Pliew). No login/logout flows.
2. **All Gemini calls via backend only.** Frontend calls `/api/chat` or `/api/meeting` — never imports `@google/genai` directly.
3. **Global state stays in `App.tsx`** until task-3 (context refactor) is deliberately started. Do not partially migrate state.
4. **Static fallback must always work.** Every AI character has a `staticFallback()` in `server.ts`. If Gemini is unreachable, app must still respond — never break the fallback path.
5. **TTS text is cleaned before speak.** Strip markdown and limit to 160 chars before `speechSynthesis.speak()`. Keep this cleaning logic intact.
6. **Avatar URLs from DiceBear** for AI characters. Do not replace with local files unless explicitly asked.

---

## Auth & role access

No authentication. Single-user app — the user is always "CEO Pliew" (id: `"user"`).

| Character ID | Name | Role | Room |
|---|---|---|---|
| `user` | Pliew / ปลิว | CEO (human) | Lobby (follows navigation) |
| `senior-dev` | Byte / ไบท์ | Senior Developer (AI) | SA Room (Meeting) |
| `code-reviewer` | Mina / มีนา | Code Reviewer (AI) | QA Room (Project) |
| `helper-bot` | Momo / โมโม่ | Helper Bot (AI) | Helper Desk |

---

## Known deferred items — do not fix without a dedicated task

| Item | File | Reason deferred |
|---|---|---|
| Refactor global state from `App.tsx` into React Context hooks | `src/App.tsx` | Large scope; tracked as task-3 in Kanban |
| Benchmark `/api/chat` + `/api/meeting` under stress | `server.ts` | Low priority; tracked as task-4 in Kanban |
| Verify Gemini model name in `server.ts` (line 99 + 144 use `"gemini-3.5-flash"` — may be wrong) | `server.ts` | Needs API key to test; don't rename without confirming availability |
| `ImageSource/` folder — raw AI-generated images not yet wired to any component | `ImageSource/` | Source assets only; not referenced in code |
