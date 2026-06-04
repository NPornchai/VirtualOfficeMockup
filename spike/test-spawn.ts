/**
 * Phase 0 Spike — test-spawn.ts
 * Validates: spawn → stream-json → session_id → --resume → cancel
 * Run with: npx tsx spike/test-spawn.ts
 */

import { spawn, ChildProcess } from "child_process";

interface StreamJsonEvent {
  type: string;
  [key: string]: unknown;
}

// ── helpers ──────────────────────────────────────────────────────────────────

function spawnClaude(args: string[], cwd: string): ChildProcess {
  return spawn("claude", args, {
    cwd,
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"],
    // shell: false — direct spawn, no cmd.exe wrapper
  });
}

function runPrompt(
  prompt: string,
  options: { cwd: string; resumeId?: string; label: string }
): Promise<{ sessionId: string | null; exitCode: number | null }> {
  return new Promise((resolve) => {
    const args = [
      "--print",
      "--verbose",                     // required with --output-format stream-json
      "--output-format", "stream-json",
      "--allowedTools", "Read",        // read-only spike — no writes
      "--permission-mode", "plan",
      prompt,
    ];
    if (options.resumeId) {
      args.push("--resume", options.resumeId);
    }

    console.log(`\n${"─".repeat(60)}`);
    console.log(`[${options.label}] spawning claude`);
    if (options.resumeId) console.log(`  --resume ${options.resumeId}`);
    console.log(`${"─".repeat(60)}`);

    const proc = spawnClaude(args, options.cwd);

    let sessionId: string | null = null;
    let buffer = "";

    proc.stdout!.on("data", (chunk: Buffer) => {
      buffer += chunk.toString("utf8");
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? ""; // keep incomplete line

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        let event: StreamJsonEvent;
        try {
          event = JSON.parse(trimmed);
        } catch {
          console.log(`  [raw] ${trimmed}`);
          continue;
        }

        // Extract session_id from init event
        if (event.type === "system" && (event as any).subtype === "init") {
          sessionId = (event as any).session_id ?? null;
          console.log(`  [init] session_id = ${sessionId}`);
          console.log(`  [init] model      = ${(event as any).model ?? "?"}`);
        } else if (event.type === "assistant") {
          const content = (event as any).message?.content ?? [];
          for (const block of content) {
            if (block.type === "text") {
              console.log(`  [assistant] ${(block.text as string).slice(0, 120)}`);
            }
          }
        } else if (event.type === "result") {
          // session_id also appears here
          const resultSession = (event as any).session_id;
          if (resultSession && !sessionId) sessionId = resultSession;
          console.log(`  [result] subtype=${(event as any).subtype} session_id=${resultSession}`);
        } else {
          console.log(`  [${event.type}] ${JSON.stringify(event).slice(0, 80)}`);
        }
      }
    });

    proc.stderr!.on("data", (chunk: Buffer) => {
      console.error(`  [stderr] ${chunk.toString("utf8").trim()}`);
    });

    proc.on("close", (code) => {
      console.log(`  [exit] code=${code}`);
      resolve({ sessionId, exitCode: code });
    });

    proc.on("error", (err) => {
      console.error(`  [spawn error] ${err.message}`);
      resolve({ sessionId: null, exitCode: -1 });
    });
  });
}

// ── Step 1: basic spawn + stream-json + session_id capture ───────────────────

async function step1_basicSpawn(cwd: string) {
  console.log("\n╔══════════════════════════════════════╗");
  console.log("║ STEP 1: Basic spawn + session_id     ║");
  console.log("╚══════════════════════════════════════╝");

  const result = await runPrompt(
    "Reply with exactly: SPIKE_OK_STEP1",
    { cwd, label: "step1" }
  );

  if (result.sessionId) {
    console.log(`\n✓ STEP 1 PASSED — session_id: ${result.sessionId}`);
  } else {
    console.log("\n✗ STEP 1 FAILED — no session_id captured");
  }

  return result.sessionId;
}

// ── Step 2: --resume ──────────────────────────────────────────────────────────

async function step2_resume(cwd: string, sessionId: string) {
  console.log("\n╔══════════════════════════════════════╗");
  console.log("║ STEP 2: --resume continuation        ║");
  console.log("╚══════════════════════════════════════╝");

  const result = await runPrompt(
    "What was my previous message? Reply with exactly: SPIKE_OK_STEP2 then quote it.",
    { cwd, resumeId: sessionId, label: "step2-resume" }
  );

  if (result.exitCode === 0) {
    console.log("\n✓ STEP 2 PASSED — resume completed without error");
  } else {
    console.log(`\n✗ STEP 2 FAILED — exit code ${result.exitCode}`);
  }

  return result;
}

// ── Step 3: cancellation via proc.kill() ─────────────────────────────────────

async function step3_cancel(cwd: string) {
  console.log("\n╔══════════════════════════════════════╗");
  console.log("║ STEP 3: Cancellation via proc.kill() ║");
  console.log("╚══════════════════════════════════════╝");

  return new Promise<void>((resolve) => {
    const args = [
      "--print",
      "--verbose",
      "--output-format", "stream-json",
      "--allowedTools", "Read",
      "--permission-mode", "plan",
      "Count slowly from 1 to 100, one number per line, with a brief pause between each.",
    ];

    const proc = spawnClaude(args, cwd);
    let linesReceived = 0;
    let killed = false;

    proc.stdout!.on("data", (chunk: Buffer) => {
      linesReceived++;
      if (linesReceived === 1 && !killed) {
        killed = true;
        console.log("  [cancel] received first output chunk — calling proc.kill()");
        proc.kill(); // SIGTERM on Unix, TerminateProcess on Windows
      }
    });

    proc.stderr!.on("data", (chunk: Buffer) => {
      console.error(`  [stderr] ${chunk.toString("utf8").trim()}`);
    });

    proc.on("close", (code, signal) => {
      console.log(`  [exit] code=${code} signal=${signal}`);
      if (code !== 0 || signal) {
        console.log("\n✓ STEP 3 PASSED — process terminated after kill()");
      } else {
        console.log("\n△ STEP 3 NOTE — process exited 0 (may have finished before kill)");
      }
      resolve();
    });

    proc.on("error", (err) => {
      console.error(`  [spawn error] ${err.message}`);
      resolve();
    });

    // Safety timeout — kill if still running after 15s
    setTimeout(() => {
      if (!proc.killed) {
        console.log("  [timeout] 15s elapsed, forcing kill");
        proc.kill("SIGKILL");
      }
    }, 15000);
  });
}

// ── main ──────────────────────────────────────────────────────────────────────

async function main() {
  const cwd = process.cwd();
  console.log(`\nPhase 0 Spike — Claude Code stream-json on Windows`);
  console.log(`claude: C:\\Users\\pnaka\\.local\\bin\\claude.exe`);
  console.log(`cwd:    ${cwd}`);

  const sessionId = await step1_basicSpawn(cwd);

  if (sessionId) {
    await step2_resume(cwd, sessionId);
  } else {
    console.log("\n⚠ Skipping step 2 — no session_id from step 1");
  }

  await step3_cancel(cwd);

  console.log("\n╔══════════════════════════════════════╗");
  console.log("║ SPIKE COMPLETE                       ║");
  console.log("╚══════════════════════════════════════╝\n");
}

main().catch(console.error);
