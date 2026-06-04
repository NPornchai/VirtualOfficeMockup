# Phase 0 Spike — Findings

**Date:** 2026-06-04
**Platform:** Windows 11, claude.exe 2.1.161
**CLI path:** `C:\Users\pnaka\.local\bin\claude.exe`

---

## Results

| Step | Result | Notes |
|---|---|---|
| 1. Basic spawn + stream-json + session_id | ✓ PASSED | session_id appears in both `init` and `result` events |
| 2. `--resume <session_id>` continuation | ✓ PASSED | Model correctly recalled prior message |
| 3. `proc.kill()` cancellation | ✓ PASSED | SIGTERM received; exit code=null, signal=SIGTERM |

---

## Windows-specific findings

### 1. `--verbose` is required with `--output-format stream-json`

```
Error: When using --print, --output-format=stream-json requires --verbose
```

**Fix:** Always include `--verbose` when spawning with `stream-json`. Add to ProcessManager args.

### 2. Cancellation on Windows uses SIGTERM (not TerminateProcess)

`proc.kill()` sent SIGTERM and the process terminated cleanly:
```
[exit] code=null signal=SIGTERM
```
No need for `SIGKILL` fallback for normal cancellation. Keep a 15s safety timeout as belt-and-suspenders.

### 3. `session_id` appears in TWO places

- `type: "system", subtype: "init"` → capture immediately on first init event
- `type: "result"` → confirms the same session_id at end

Persist on `init` (don't wait for `result`) so SSE subscribers get session_id early.

### 4. `rate_limit_event` events appear in stream

```json
{"type":"rate_limit_event","rate_limit_info":{"status":"allowed","resetsAt":"..."}}
```

Forward these as SSE `message` events like any other event. They're informational only.

### 5. NDJSON buffering — no issues observed

Lines arrived as complete JSON objects per chunk. Still implement line-buffer split on `\n` as a safety measure (not all environments guarantee this).

---

## Correct spawn args for ProcessManager

```typescript
const args = [
  "--print",
  "--verbose",                              // REQUIRED with stream-json
  "--output-format", "stream-json",
  "--append-system-prompt", agentSystemPrompt,
  "--model", agentModel,
  "--allowedTools", agentAllowedTools,      // CSV string
  "--permission-mode", agentPermissionMode,
  prompt,
];
if (resumeSessionId) {
  args.push("--resume", resumeSessionId);
}
// spawn with: cwd = projects.path, stdio: ["ignore", "pipe", "pipe"]
```

---

## Phase 0 verdict: ✓ ARCHITECTURE VALIDATED

All assumptions confirmed on Windows. Safe to proceed to Phase 1.
