// main.ts — Vice Panels entry builder (Node 22, standard library only).
// Copies app/ and screenshots/ into the output directory and writes a
// deterministic dossier.json using the vendored buildDossier helper.
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-app.ts";

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";

export const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
};

export function sortedEntries(dir: string): string[] {
  return readdirSync(dir).sort();
}

export function buildEntry(): string {
  // Clear the output directory's contents, never the directory itself:
  // in the grader it is a mount that cannot be removed.
  if (existsSync(outputDir)) {
    for (const entry of readdirSync(outputDir)) {
      rmSync(join(outputDir, entry), { recursive: true, force: true });
    }
  } else {
    mkdirSync(outputDir, { recursive: true });
  }
  cpSync(join(repoRoot, "app"), join(outputDir, "app"), { recursive: true });
  cpSync(join(repoRoot, "screenshots"), join(outputDir, "screenshots"), { recursive: true });
  return outputDir;
}

export function writeDossier(dir: string): void {
  const bytes = buildDossier(dir, DOSSIER_CAPS);
  writeFileSync(join(dir, "dossier.json"), bytes);
}

const builtDir = buildEntry();
writeDossier(builtDir);
console.log(`Vice Panels entry built at ${builtDir} (app entries: ${sortedEntries(join(builtDir, "app")).join(", ")})`);
