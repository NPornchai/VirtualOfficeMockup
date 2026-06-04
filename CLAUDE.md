# VirtualOffice — Root Context

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

Virtual Office simulation — เว็บแอปจำลอง office สำหรับทำงานร่วมกับ AI agents  
ผู้ใช้ (CEO/ปลิว) สามารถเดินเข้าห้องต่างๆ และคุยกับ AI colleagues ผ่าน Gemini API

## Stack

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS v4 + Motion (Framer Motion)
- **Backend:** Express.js (server.ts) + TypeScript, รันด้วย `tsx`
- **AI:** Google Gemini (`@google/genai`) — `/api/chat` และ `/api/meeting`
- **Run:** `npm run dev` → port 3000 (Express serves both API + Vite dev proxy)

## Solution structure

```
src/
  App.tsx              ← Root component, global state, room navigation
  types.ts             ← TypeScript interfaces (Room, Character, Message, etc.)
  data.ts              ← Static data: OFFICE_ROOMS, INITIAL_CHARACTERS, INITIAL_TASKS
  index.css            ← Global styles + custom animations (animate-sprite-bob)
  main.tsx             ← React entry point
  components/
    OfficeMap.tsx       ← Map canvas, character sprites, room hotspots
    ChatPanel.tsx       ← DM / group chat UI
    TaskBoard.tsx       ← Kanban board
    PantryMinigame.tsx  ← Coffee minigame
    ScreenShareHub.tsx  ← Code audit via screenshare
  assets/images/
    office_map_v3.png   ← Current map (v3 — do NOT use v2 or old files)
    char_ceo.png        ← CEO sprite (user)
    char_byte.png       ← Senior Dev sprite
    char_mina.png       ← Code Reviewer sprite
    char_momo.png       ← Helper Bot sprite
server.ts              ← Express API server (Gemini endpoints)
```

## Characters

| ID | Name | Role | Room |
|---|---|---|---|
| `user` | พี่ปลิว (CEO) | CEO | LOBBY |
| `senior-dev` | Byte | Senior Developer / SA | MEETING |
| `code-reviewer` | Mina | Code Reviewer / QA | PROJECT |
| `helper-bot` | Momo | Helper Bot | HELPDESK |

## Hard rules — never violate these

- ใช้ `office_map_v3.png` เท่านั้น — ห้ามอ้างอิง v1/v2
- Sprite ขนาด 192×192px ทุกตัว (`CHAR_SIZE` ใน OfficeMap.tsx)
- Character positions ใช้ % coordinates จาก `getRoomCoordinates()` — ห้าม hardcode px
- ห้าม mock Gemini API ใน production path — ถ้าไม่มี key ให้ตอบว่า unavailable
- `decisions.md` — append only ห้ามลบหรือเขียนทับ entry เก่า

## Known deferred items — do not fix without a dedicated task

- SignalR / multiplayer real-time sync (officeHybrid.js concept — on disk, not wired)
- Full isometric Pixi.js engine (officePixi.js — on disk, not wired)
- HR room และ DEVAREA ยังไม่มี content panel ใน right panel
- Voice synthesis ใช้ Web Speech API เท่านั้น (ยังไม่ใช้ Gemini TTS)
