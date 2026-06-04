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

## Recent completions (this session)

- ปรับ name badge ของตัวละครบน OfficeMap ให้ลงมาใกล้ตัวละครอีก
  - เปลี่ยนจาก `flex-col` (ชื่ออยู่เหนือ sprite) → `absolute top-6` ภายใน sprite container
  - ไฟล์: `src/components/OfficeMap.tsx` บรรทัด 507–521

---

## Build Phases Checklist

> อัพเดท checklist นี้ทุก session — tick [x] เมื่อ sub-task เสร็จ

---

### Phase 0 — Spike: prove Claude CLI integration on Windows ✅
- [x] spawn `claude -p --output-format stream-json`
- [x] อ่าน NDJSON line-by-line, forward เป็น SSE
- [x] capture `session_id` จาก `init` event
- [x] ทดสอบ `--resume <session_id>` ต่อการสนทนา
- [x] verify บน Windows (commit adcb6b6)

---

### Phase 1 — SQLite schema + CRUD API ← NEXT
- [ ] `npm install better-sqlite3 @types/better-sqlite3`
- [ ] สร้าง `server/db.ts` — init DB, CREATE TABLE projects/agents/runs, seed global agents
- [ ] สร้าง `server/routes/projects.ts` — `GET/POST/PUT/DELETE /api/projects`
- [ ] สร้าง `server/routes/agents.ts` — `GET/POST/PUT/DELETE /api/agents`, `GET /api/projects/:id/agents`, `POST /api/agents/:id/export`
- [ ] สร้าง `server/routes/runs.ts` — `GET/POST /api/runs`, `GET /api/runs/:id`, `POST /api/runs/:id/cancel`
- [ ] สร้าง `server/routes/context.ts` — `GET /api/projects/:id/context`, `POST /api/projects/:id/bootstrap`
- [ ] wire routes ทั้งหมดเข้า `server.ts`
- [ ] แก้ `server.ts`: `"0.0.0.0"` → `"127.0.0.1"` (security)
- [ ] สร้าง `data/` dir + เพิ่ม `data/office.db` ใน `.gitignore`

---

### Phase 2 — SSE stream endpoint + ProcessManager
- [ ] สร้าง `server/process-manager.ts` — spawn claude CLI ด้วย agent flags, processMap keyed by runId
- [ ] parse NDJSON stream line-by-line, persist `session_id` จาก `init`
- [ ] `GET /api/runs/:id/stream` — SSE: events `init`, `message`, `done`, `error`
- [ ] capture `exit_code`, set `status`/`finished_at` on process exit
- [ ] `POST /api/runs/:id/cancel` — `proc.kill()`, status = cancelled
- [ ] handle `--resume <session_id>` สำหรับ follow-up runs
- [ ] cap concurrent runs (processMap limit)

---

### Phase 3 — Project Manager UI + Memory panel
*(ทำคู่กับ Phase 4)*
- [ ] Project list page — แสดง projects จาก `/api/projects`
- [ ] Add/edit project form (name, path, git remote, description)
- [ ] Memory panel — อ่าน `current-task` / `handoff` / `decisions` จาก `/api/projects/:id/context`
- [ ] Bootstrap action — ปุ่ม "Bootstrap context files" เรียก `/api/projects/:id/bootstrap`
- [ ] แสดง status ว่า context files มีอยู่หรือไม่ (exists flags)

---

### Phase 4 — Agent Config UI
*(ทำคู่กับ Phase 3)*
- [ ] Agent list — แสดง global agents + project-scoped agents แยก section
- [ ] Add/edit agent form (name, role, model, system prompt, allowed tools, permission mode, scope)
- [ ] Delete agent (ห้ามลบ built-in global agents โดยไม่ confirm)
- [ ] Export agent — เรียก `/api/agents/:id/export` เพื่อ write `.md` file
- [ ] แสดง scope badge (global / project)

---

### Phase 5 — Command Console
- [ ] UI: เลือก project + agent + พิมพ์ prompt
- [ ] POST `/api/runs` → ได้ runId
- [ ] connect `EventSource` → `/api/runs/:id/stream`
- [ ] render stream events แบบ real-time (assistant text, tool_use, tool_result)
- [ ] ปุ่ม Cancel run
- [ ] Resume — เลือก previous run แล้วส่ง follow-up prompt พร้อม `resumeOf`
- [ ] แสดง session_id + สถานะ running/done/error

---

### Phase 6 — Run History UI
- [ ] Run list — filter by project, agent, status; แสดง duration
- [ ] Run detail — full output transcript + session_id + exit_code
- [ ] ปุ่ม Resume จาก history run
- [ ] ลบ run history

---

### Security / Cleanup (ทำได้ตลอด)
- [ ] `server.ts` bind `"127.0.0.1"` ✱ (Phase 1)
- [ ] remove `@google/genai` dependency (หลัง Phase 5 replace Gemini endpoints ได้)
- [ ] `data/office.db` อยู่ใน `.gitignore`
- [ ] `allowed_tools` per agent tight ตาม role (reviewer = read-only)

---

## Deferred (do not do today)

| Item | Reason deferred |
|---|---|
| SignalR multiplayer | ต้องการ backend infrastructure แยก |
| Pixi.js isometric engine | scope ใหญ่ — alternative อยู่ใน officePixi.js |
| HR room content panel | ยังไม่มี spec |
| DEVAREA content panel | ยังไม่มี spec |
| Gemini TTS | Web Speech API เพียงพอตอนนี้ |
