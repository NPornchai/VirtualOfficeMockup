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
| Bootstrap context files system | `CLAUDE.md`, `.claude/context/*` | สร้างระบบ context files ตาม guide |
| Name badge repositioning | `src/components/OfficeMap.tsx` | ย้าย name badge จาก flex-col sibling → absolute top-6 ภายใน sprite container |

## Key decisions made

- **Name badge absolute positioning:** เปลี่ยนจาก `flex flex-col` (name badge เป็น sibling ด้านบน sprite) มาเป็น `relative inline-block` container + `absolute top-6 left-1/2 -translate-x-1/2` บน name badge เพื่อให้ชื่ออยู่ใกล้ตัวละครขึ้น โดยชื่อจะ overlay บน transparent zone ด้านบนของ sprite (24px จากขอบบน 192px sprite) — เป็นผลให้ container height เปลี่ยนจาก ~216px เป็น 192px ซึ่ง shift anchor point ขึ้น ~10px

## Files changed this session

```
CLAUDE.md
.claude/context/current-task.md
.claude/context/handoff.md
.claude/context/decisions.md
src/components/OfficeMap.tsx
```

## Warnings / watch out for

- **Speech bubble position:** `bottom-[140px]` ใน motion.div คำนวณจาก bottom ของ character element ซึ่งตอนนี้สูง 192px (เดิม ~216px) — ถ้าขยับ name badge อีกครั้งให้ตรวจ speech bubble ด้วย
- **Sprite transparent zone:** ไม่ทราบ exact pixel ที่หัวตัวละครอยู่ในแต่ละ sprite — ถ้า name badge ยังดูสูงเกิน ให้เพิ่ม `top-6` → `top-8` หรือ `top-10`
- **Map image:** ใช้ `office_map_v3.png` เท่านั้น — v2 และ old files ยังอยู่ใน assets แต่ไม่ใช้
- **server.ts bind address:** ปัจจุบัน listen บน `"0.0.0.0"` — report บอกให้เปลี่ยนเป็น `"127.0.0.1"` (Phase 1 task)
- **Gemini dependency:** `@google/genai` จะถูก remove เมื่อ Phase 5+ เสร็จสมบูรณ์ ยังคงไว้จนกว่า Claude Code agents จะ replace ได้จริง

## What's next

See `current-task.md` for the prioritized task list.
**Immediate next task:** Phase 1 — SQLite schema + CRUD API + seed global agents (better-sqlite3)
**Phase order:** 0 ✓ → **1 (next)** → 3+4 parallel → 2 → 5 → 6
