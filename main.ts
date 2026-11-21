// Leonida Legend 3 — the hand-in program for the gta6-trophy-guide-01 bounty.
// It copies this repo's app/ and screenshots/ into the output directory and
// writes /output/dossier.json with the vendored make.fun library, which the
// judge reads. Node 22, standard library only; no build step.
//
// Run it outside the grader with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// One rule shapes this file: the output directory is never removed itself.
// In the grader MAKEFUN_OUTPUT_DIR is a mounted volume, and removing a mount
// point fails with EBUSY. So we empty the directory's contents — every child
// entry, files and subdirectories alike — and leave the directory standing.

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The dossier caps from the bounty's gate: at most 4 screenshots, each at
// most 256 KiB; app/ at most 993 files and directories and 48 MiB. Only
// text_max_bytes shapes the dossier bytes; the rest refuse an entry the
// scorer would refuse, so passing them here fails in the same place.
const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
};

// Empty a directory without removing it: list its children and delete each
// one. mkdirSync with recursive:true is a no-op when the directory already
// exists, which is exactly the case for a mounted output volume.
function emptyContents(dir) {
  mkdirSync(dir, { recursive: true });
  for (const entry of readdirSync(dir)) {
    rmSync(join(dir, entry), { recursive: true, force: true });
  }
}

function copyTree(source, target) {
  if (!existsSync(source)) return;
  cpSync(source, target, { recursive: true });
}

function handIn() {
  emptyContents(outputDir);
  copyTree(join(repoRoot, 'app'), join(outputDir, 'app'));
  copyTree(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'));
  const dossier = buildDossier(outputDir, DOSSIER_CAPS);
  writeFileSync(join(outputDir, 'dossier.json'), dossier);
  console.log(`Leonida Legend 3 handed in to ${outputDir} (${dossier.length} byte dossier).`);
}

handIn();
