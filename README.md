# VirtualOfficeMockup

A browser-based virtual office simulation for a small dev team, powered by React 19 and Google Gemini AI.
You play CEO Pliew (ปลิว) and interact with three AI colleagues across five themed office rooms.

> จำลองออฟฟิศดิจิทัลพร้อม AI พนักงาน 3 คน — คุยได้จริง, บอร์ด Kanban, มินิเกมกาแฟ และอีกมาก

---

## Screenshot

> _Add a screenshot or screen recording here._

---

## Features

| Room | What you can do |
|---|---|
| **CEO Room** (Lobby) | Welcome panel and project status log |
| **SA Room** (Meeting) | Group standup chat — Gemini generates a back-and-forth discussion between Byte and Mina on any topic you raise |
| **QA Room** (Project) | Kanban board (todo / in_progress / review / done) + direct DM with Mina (Code Reviewer) |
| **Helper Bot Desk** | DM with Momo (Helper Bot) + Screen Share code audit portal |
| **Pantry** | Coffee drip mini-game (three recipes with grind/ratio/temp) + developer trivia quiz |

Additional capabilities:

- **Direct messages** — private chat with Byte, Mina, or Momo; multi-turn history sent to Gemini
- **Footer toolbar** — Chat, People, Calendar, Screen Share, More (TTS toggle, coffee game launcher)
- **Text-to-Speech** — Web Speech API, Thai locale (`th-TH`), mute/unmute toggle
- **Sandbox mode** — static Thai fallback responses when no API key is configured; no external calls made

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | React 19, TypeScript |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Animation | motion (Framer Motion v12) |
| Icons | lucide-react |
| Build tool | Vite 6 |
| Backend | Express 4 (serves Vite in dev, static dist in prod) |
| AI | Google Gemini API (`@google/genai` ^2.4.0), model `gemini-2.5-flash` |
| Speech | Web Speech API (browser-native, no dependency) |
| Runtime | Node.js 20+, tsx (dev), esbuild (prod bundle) |

---

## Prerequisites

- Node.js 20 or later
- A Google Gemini API key (optional — the app runs without one in sandbox mode)

---

## Setup

```bash
# 1. Clone
git clone <repo-url>
cd VirtualOffice

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env and replace MY_GEMINI_API_KEY with your actual key
```

`.env` contents:

```
GEMINI_API_KEY=your_key_here
APP_URL=http://localhost:3000
```

---

## Running in Development

```bash
npm run dev
```

This runs `tsx server.ts`, which starts Express on **port 3000** with Vite in middleware mode (HMR included).
Open `http://localhost:3000`.

---

## Running in Sandbox Mode (no API key)

Leave `GEMINI_API_KEY` unset or set to `MY_GEMINI_API_KEY` in `.env`.
The server detects this and skips Gemini initialization.
All AI responses are served from static Thai fallback strings with a short simulated delay.
Every response includes `"isSimulated": true` in the API payload so the UI can indicate sandbox mode.

---

## Build for Production

```bash
npm run build
npm start
```

`npm run build` runs two steps in sequence:

1. `vite build` — compiles the React client into `dist/`
2. `esbuild server.ts --bundle ... --outfile=dist/server.cjs` — bundles the Express backend

`npm start` runs `node dist/server.cjs`, which serves the static client from `dist/` and exposes the `/api/*` routes.

---

## Project Structure

```
VirtualOffice/
├── server.ts              Express backend; Gemini proxy (/api/chat, /api/meeting)
├── vite.config.ts
├── tsconfig.json
├── package.json
├── .env.example
└── src/
    ├── main.tsx           React entry point
    ├── App.tsx            Root component; all global state
    ├── types.ts           TypeScript interfaces (Room, Character, Message, OfficeTask, …)
    ├── data.ts            Static data (rooms, characters, tasks, calendar, trivia, coffee recipes)
    ├── index.css          Global styles
    ├── assets/images/     CEO sprite PNG
    └── components/
        ├── OfficeMap.tsx       Isometric office layout; avatars + speech bubbles
        ├── ChatPanel.tsx       Reusable chat panel (DM + group meeting)
        ├── TaskBoard.tsx       Kanban board (QA Room)
        ├── PantryMinigame.tsx  Coffee drip mini-game + developer trivia quiz
        └── ScreenShareHub.tsx  Code audit / screen share UI
```

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/chat` | Direct message to a character. Body: `{ characterId, message, chatHistory }` |
| `POST` | `/api/meeting` | Group standup. Body: `{ topic }`. Returns a Markdown discussion between Byte and Mina. |

Both endpoints fall back to static responses when Gemini is unavailable.

---

## Character Roster

| ID | Name | Role | Default Room |
|---|---|---|---|
| `user` | Pliew / ปลิว | CEO (human player) | CEO Room (Lobby) |
| `senior-dev` | Byte / ไบท์ | Senior Developer (AI) | SA Room |
| `code-reviewer` | Mina / มีนา | Code Reviewer (AI) | QA Room |
| `helper-bot` | Momo / โมโม่ | Helper Bot (AI) | Helper Bot Desk |

AI characters are implemented as Gemini chat sessions with Thai-language system prompts and distinct personalities.

---

## License

MIT — built as a mockup / demo project.
