/**
 * Drift: live DB vs migration history.
 * Run: npx dotenv-cli -e .env --override -- node scripts/prisma-drift-diff.mjs [--script]
 * (DATABASE_URL + SHADOW_DATABASE_URL must be in .env)
 */
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const { DATABASE_URL, SHADOW_DATABASE_URL } = process.env;

if (!DATABASE_URL || !SHADOW_DATABASE_URL) {
  console.error("Missing DATABASE_URL or SHADOW_DATABASE_URL (use dotenv-cli -e .env)");
  process.exit(1);
}

let dbHost = "(could not parse host)";
try {
  dbHost = new URL(DATABASE_URL).host;
} catch {
  /* ignore */
}

const scriptFlag = process.argv.includes("--script");
const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const args = [
  "prisma",
  "migrate",
  "diff",
  "--from-url",
  DATABASE_URL,
  "--to-migrations",
  "prisma/migrations",
  "--shadow-database-url",
  SHADOW_DATABASE_URL,
];
if (scriptFlag) args.push("--script");

console.error(`Comparing DATABASE_URL host: ${dbHost} → migration history (shadow DB used for replay)\n`);

const r = spawnSync("npx", args, {
  encoding: "utf8",
  cwd: root,
  env: process.env,
  maxBuffer: 50 * 1024 * 1024,
  shell: process.platform === "win32",
});

if (r.stdout) process.stdout.write(r.stdout);
if (r.stderr) process.stderr.write(r.stderr);

const status = r.status ?? 1;
if (status !== 0) {
  process.exit(status);
}

const combined = `${r.stdout ?? ""}${r.stderr ?? ""}`.trim();
if (!combined) {
  console.log(
    "No output from Prisma: live database already matches what `prisma/migrations` would build (no drift for this DATABASE_URL).\n"
  );
}
