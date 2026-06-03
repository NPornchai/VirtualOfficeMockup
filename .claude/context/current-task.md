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
> Last updated: 2026-06-03

## Status: Ready to start

---

## Next task — State Refactor (App.tsx → React Context)

**Size:** Large
**Goal:** Extract all global state out of `App.tsx` into proper React Context + hooks so the component tree is maintainable. This is Kanban task-3.

### What's already done
- Project scaffolded and running (React 19 + Express + Gemini)
- All 5 rooms wired with room-switching logic in `App.tsx`
- Kanban board, chat panel, pantry mini-game, screen share hub all functional
- Static fallback responses for all 3 AI characters

### What needs to be done
- Create `src/context/OfficeContext.tsx` — expose: `characters`, `messages`, `tasks`, `events`, `activeRoomId`, `isGenerating`, `ceoName`, and all handlers
- Wrap `<App>` root with the new provider
- Update all child components to consume context instead of receiving everything as props
- Keep prop interfaces for components that don't need global state (e.g. `PantryMinigame`)

### Implementation notes
- Do NOT partially migrate — either all state moves or none (hard rule from CLAUDE.md)
- `triggerSpeechBubble` and `triggerVoiceSynthesis` should live in the context (they touch shared state)
- `handleSendMessage` calls `/api/chat` and `/api/meeting` — keep the fetch logic, just relocate it

---

## Deferred (do not do today)

| Item | Reason deferred |
|---|---|
| Benchmark `/api/chat` under stress (task-4) | Low priority, needs load-test tooling |
| Wire `ImageSource/` images to components | No clear design spec yet |
| Verify Gemini model name `"gemini-3.5-flash"` in server.ts | Needs live API key to confirm |
