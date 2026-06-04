# VirtualOffice — Decision Log

> **APPEND ONLY — never overwrite or delete entries.**
> Write here whenever a non-obvious trade-off is made that isn't self-evident from the code.
> Both the main assistant and any agent should append when making a significant decision.
>
> Format: `## [YYYY-MM-DD] Short title` → Context → Decision → Rationale → Consequences

---

## [2026-06-04] Hybrid render approach: backdrop PNG + React sprites

**Context:** ต้องการแสดง office map แบบ isometric พร้อม character avatars ที่ขยับได้ มี 3 alternatives บน disk: officePixi.js (full Pixi.js engine), office2d.js (backdrop overlay), office3d.js (Three.js — dead)

**Decision:** ใช้ backdrop PNG (`office_map_v3.png`) + React/Framer Motion สำหรับ character sprites — ไม่ใช้ Pixi.js หรือ Three.js

**Rationale:** Pixi.js ต้องการ canvas management และ asset pipeline แยก ซับซ้อนเกินสำหรับ prototype stage; Three.js ถูก abandon แล้ว; backdrop + React ง่ายกว่า, integrate กับ Tailwind + Motion ได้โดยตรง, ไม่ต้องการ additional runtime

**Consequences:** ไม่มี true isometric depth sorting — characters อยู่บน flat plane overlay บน PNG; ถ้าต้องการ depth จริงจะต้อง migrate ไป Pixi.js (officePixi.js อยู่บน disk พร้อม)

---

## [2026-06-04] Character name badge: absolute positioning inside sprite container

**Context:** Name badge แสดงชื่อตัวละครเดิมเป็น flex-col sibling อยู่เหนือ sprite ทั้งก้อน ทำให้ดูลอยอยู่ห่างจากตัวละครมากเกินไปเมื่อ sprite ขนาด 192px

**Decision:** เปลี่ยนเป็น `relative inline-block` container + `absolute top-6 left-1/2 -translate-x-1/2` บน name badge ให้ overlay ด้านบนของ sprite ที่ 24px จาก top edge

**Rationale:** Sprite images มี transparent zone ด้านบนก่อนถึงหัวตัวละคร การวาง name badge ใน transparent zone ทำให้ดูใกล้ตัวละครมากกว่า; absolute positioning ยืดหยุ่นกว่า negative margins ซึ่งยุ่งยากกับ flexbox layout

**Consequences:** Character element height เปลี่ยนจาก ~216px → 192px; anchor point (translate -50%/-50%) shift ขึ้น ~10px; speech bubble `bottom-[140px]` คำนวณจาก bottom ของ element ใหม่ — ควรตรวจ visual ถ้าปรับ name badge อีกครั้ง
