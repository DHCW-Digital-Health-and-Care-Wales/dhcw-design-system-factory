/*
 * Makes a fresh working copy of the DHCW design system for one story.
 *
 * Usage:
 *   node templates/dev/setup-workspace.js <story-id> [--ref <tag-or-branch>] [--baseline] [--no-install] [--install-browsers]
 *
 * Creates work/<story-id>/build/design-system (a shallow clone of the public repository),
 * installs its dependencies, and rebuilds its generated files once so you can see which of
 * them were already out of date on the branch. Nothing here is ever committed or pushed.
 *
 *   --ref <name>          clone this tag or branch instead of the default branch (main)
 *   --baseline            also make work/<story-id>/build/baseline, an untouched second copy,
 *                         so new tests can be shown to fail before the change (red) and
 *                         pass after it (green)
 *   --no-install          skip "npm ci" (and the rebuild)
 *   --install-browsers    also run "npx playwright install chromium" (about 150 MB)
 *
 * It never deletes an existing copy: if one exists it reports it and stops.
 */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const REPO = "https://github.com/DHCW-Digital-Health-and-Care-Wales/dhcw-design-system.git";
const FACTORY_ROOT = path.resolve(__dirname, "..", "..");

const args = process.argv.slice(2);
const refIndex = args.indexOf("--ref");
const ref = refIndex >= 0 ? args[refIndex + 1] : null;
const storyId = args.find((a, i) => !a.startsWith("--") && !(refIndex >= 0 && i === refIndex + 1));
const flag = (name) => args.includes(name);

if (!storyId || !/^[A-Za-z0-9._-]+$/.test(storyId)) {
  console.error("Usage: node templates/dev/setup-workspace.js <story-id> [--ref <tag-or-branch>] [--baseline] [--no-install] [--install-browsers]");
  process.exit(2);
}

const buildDir = path.join(FACTORY_ROOT, "work", storyId, "build");
const workCopy = path.join(buildDir, "design-system");
const baselineCopy = path.join(buildDir, "baseline");

const needsShell = (cmd) => process.platform === "win32" && /^(npm|npx)$/.test(cmd);

function run(cmd, cmdArgs, cwd) {
  const result = spawnSync(cmd, cmdArgs, {
    cwd,
    stdio: "inherit",
    shell: needsShell(cmd),
    env: Object.assign({}, process.env, { GIT_TERMINAL_PROMPT: "0" }),
  });
  if (result.status !== 0) {
    console.error(`\nFailed: ${cmd} ${cmdArgs.join(" ")} (exit ${result.status})`);
    process.exit(result.status || 1);
  }
}

function capture(cmd, cmdArgs, cwd) {
  const r = spawnSync(cmd, cmdArgs, { cwd, encoding: "utf8", shell: needsShell(cmd), maxBuffer: 64 * 1024 * 1024 });
  return (r.stdout || "").trim();
}

function cloneInto(target, label) {
  if (fs.existsSync(target)) {
    console.log(`${label} already exists, so it was left as it is:\n  ${target}`);
    console.log("To start again, delete that folder yourself and re-run this script.");
    return false;
  }
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const cloneArgs = ["clone", "--depth", "1"];
  if (ref) cloneArgs.push("--branch", ref);
  cloneArgs.push(REPO, target);
  console.log(`\nCloning the design system into ${target} ...`);
  run("git", cloneArgs, FACTORY_ROOT);
  return true;
}

function install(target) {
  if (flag("--no-install")) return;
  console.log(`\nInstalling dependencies in ${target} (this takes a minute or two) ...`);
  run("npm", ["ci", "--no-audit", "--no-fund"], target);
}

function rebuildAndFindDrift(target) {
  if (flag("--no-install")) return null;
  console.log("\nRebuilding the generated files once, to see which were already out of date ...");
  run("npm", ["run", "build:css"], target);
  run("npm", ["run", "build:js"], target);
  return capture("git", ["diff", "--name-only"], target).split(/\r?\n/).filter(Boolean);
}

const madeWork = cloneInto(workCopy, "The working copy");
let drift = null;
if (madeWork) {
  install(workCopy);
  drift = rebuildAndFindDrift(workCopy);
}

if (flag("--baseline")) {
  const madeBaseline = cloneInto(baselineCopy, "The baseline copy");
  if (madeBaseline) install(baselineCopy);
}

if (flag("--install-browsers")) {
  console.log("\nInstalling the Chromium browser for Playwright ...");
  run("npx", ["playwright", "install", "chromium"], workCopy);
}

if (!fs.existsSync(path.join(workCopy, "package.json"))) {
  console.error("The working copy doesn't look like the design system (no package.json).");
  process.exit(1);
}

const baselineFile = path.join(buildDir, "BASELINE.txt");
if (madeWork || !fs.existsSync(baselineFile)) {
  const pkg = JSON.parse(fs.readFileSync(path.join(workCopy, "package.json"), "utf8"));
  const commit = capture("git", ["log", "-1", "--format=%h %ad %s", "--date=short"], workCopy);
  const lines = [
    `Design system working copy for ${storyId}`,
    `Made: ${new Date().toISOString()}`,
    `Version: ${pkg.version}`,
    `Commit: ${commit}`,
    `Ref: ${ref || "default branch"}`,
    `Node: ${process.version}`,
    `npm: ${capture("npm", ["--version"], workCopy)}`,
    "",
    "Compare the commit with the one in context/design-system-codebase.md. If it is newer, trust this copy over that map.",
    "",
    "Generated files already out of date on this branch (rebuilding changes them; not caused by any change of yours):",
    ...(drift === null ? ["  (not checked: --no-install)"] : drift.length ? drift.map((f) => `  - ${f}`) : ["  (none)"]),
  ];
  fs.writeFileSync(baselineFile, lines.join("\n") + "\n");
}

console.log("\n" + fs.readFileSync(baselineFile, "utf8"));
console.log(`Ready. Work only inside:\n  ${workCopy}`);
console.log("Do not commit or push. When you finish, run:\n  node templates/dev/make-patch.js " + storyId);
