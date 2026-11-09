/*
 * Writes everything that has changed in a story's working copy of the design system
 * to a patch file, so a person can review it and apply it themselves.
 *
 * Usage:
 *   node templates/dev/make-patch.js <story-id>
 *
 * Writes, next to the working copy:
 *   work/<story-id>/build/changes.patch      new, changed and deleted files, as a patch
 *   work/<story-id>/build/changed-files.txt  one line per changed file, with its status
 *
 * Only real content changes are listed: files that differ only in line endings are ignored.
 * Files that BASELINE.txt says were already out of date on the branch are labelled, so a
 * reviewer can tell them from the story's own changes.
 *
 * It marks new files with "git add -N" (intent to add) so they appear in the patch, then
 * undoes that. It never commits, pushes or changes any file in the working copy.
 *
 * To apply the patch to a clone of the design system:  git apply changes.patch
 */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const FACTORY_ROOT = path.resolve(__dirname, "..", "..");
const storyId = process.argv[2];

if (!storyId || !/^[A-Za-z0-9._-]+$/.test(storyId)) {
  console.error("Usage: node templates/dev/make-patch.js <story-id>");
  process.exit(2);
}

const buildDir = path.join(FACTORY_ROOT, "work", storyId, "build");
const workCopy = path.join(buildDir, "design-system");

if (!fs.existsSync(path.join(workCopy, ".git"))) {
  console.error(`No working copy at ${workCopy}. Run: node templates/dev/setup-workspace.js ${storyId}`);
  process.exit(1);
}

function git(gitArgs) {
  const r = spawnSync("git", gitArgs, { cwd: workCopy, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
  if (r.status !== 0) {
    console.error(`git ${gitArgs.join(" ")} failed:\n${r.stderr}`);
    process.exit(r.status || 1);
  }
  return r.stdout;
}

function knownDrift() {
  const file = path.join(buildDir, "BASELINE.txt");
  if (!fs.existsSync(file)) return new Set();
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  const start = lines.findIndex((l) => l.startsWith("Generated files already out of date"));
  if (start < 0) return new Set();
  const out = new Set();
  for (const l of lines.slice(start + 1)) {
    const m = l.match(/^\s+-\s+(.+)$/);
    if (m) out.add(m[1].trim());
    else if (l.trim() && !l.trim().startsWith("(")) break;
  }
  return out;
}

git(["add", "-N", "."]);
const nameStatus = git(["diff", "--name-status"]).split(/\r?\n/).filter(Boolean);
const diff = git(["diff", "--binary"]);
const stat = git(["diff", "--stat"]);
git(["reset", "-q"]);

if (!nameStatus.length) {
  console.log("Nothing has changed in the working copy, so there is no patch to write.");
  process.exit(0);
}

const drift = knownDrift();
const lines = nameStatus.map((l) => {
  const file = l.split(/\t/).slice(1).join(" -> ");
  return drift.has(file) ? `${l}    [was already out of date on the branch]` : l;
});

fs.writeFileSync(path.join(buildDir, "changes.patch"), diff);
fs.writeFileSync(path.join(buildDir, "changed-files.txt"), lines.join("\n") + "\n");

console.log(`Wrote ${nameStatus.length} changed files to:\n  ${path.join(buildDir, "changes.patch")}\n  ${path.join(buildDir, "changed-files.txt")}\n`);
console.log(stat.trim().split(/\r?\n/).slice(-1)[0] || "");
console.log("\nNothing was committed or pushed. A person reviews the patch and applies it.");
