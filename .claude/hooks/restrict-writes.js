/*
 * Claude Code PreToolUse hook for the development and test agents.
 *
 * Usage in an agent's frontmatter:
 *   node .claude/hooks/restrict-writes.js --developer     (Sion Sass)
 *   node .claude/hooks/restrict-writes.js --tester        (Tesni Test)
 *
 * Both agents may only create or change files inside this repository's work/ folder, which is
 * where their own copy of the design system and their notes live. On top of that:
 *
 *   developer   may not touch tests (specs/ and preview/testing/ in the copy), the baseline
 *               copy, or the test report
 *   tester      may only touch test material: specs/ and preview/testing/ in the copy,
 *               specs/ in the baseline copy, the test report, and scratch files in build/qa/
 *
 * Anything else, such as the factory's agents, a person's own clone of the design system, or a
 * .git folder, is blocked (exit code 2).
 *
 * Limits: this guards the file editing tools. A shell command that writes a file can't be
 * checked here; the agents' instructions cover that.
 */
const path = require("path");

const FACTORY_ROOT = path.resolve(__dirname, "..", "..");
const WORK_ROOT = path.join(FACTORY_ROOT, "work");
const mode = process.argv.includes("--tester") ? "tester" : process.argv.includes("--developer") ? "developer" : "any";

const DEVELOPER_DENY = [
  /^build\/design-system\/specs\//,
  /^build\/design-system\/preview\/testing\//,
  /^build\/baseline\//,
  /^build\/qa-report\.md$/,
];
const TESTER_ALLOW = [
  /^build\/qa-report\.md$/,
  /^build\/qa\//,
  /^build\/design-system\/specs\//,
  /^build\/design-system\/preview\/testing\//,
  /^build\/baseline\/specs\//,
];

function block(message) {
  process.stderr.write(`Blocked: ${message}\n`);
  process.exit(2);
}

let raw = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => { raw += chunk; });
process.stdin.on("end", () => {
  let input;
  try { input = JSON.parse(raw); } catch (e) { process.exit(0); }
  const target = input.tool_input && (input.tool_input.file_path || input.tool_input.path);
  if (!target) process.exit(0);

  const resolved = path.resolve(input.cwd || FACTORY_ROOT, String(target));
  const relative = path.relative(WORK_ROOT, resolved);
  const inside = relative && !relative.startsWith("..") && !path.isAbsolute(relative);

  if (!inside) block(`${resolved} is outside the work folder. These agents may only change files under ${WORK_ROOT}.`);
  if (resolved.split(path.sep).includes(".git")) block(`${resolved} is inside a .git folder.`);

  const parts = relative.split(path.sep);
  const withinStory = parts.slice(1).join("/");

  if (mode === "developer" && DEVELOPER_DENY.some((re) => re.test(withinStory))) {
    block(`${withinStory} is test material. Sion Sass doesn't edit tests: list what needs changing in dev-notes.md for Tesni Test.`);
  }
  if (mode === "tester" && !TESTER_ALLOW.some((re) => re.test(withinStory))) {
    block(`${withinStory || relative} is not test material. Tesni Test only edits specs/ and preview/testing/ in the copy, the baseline's specs/, build/qa/ and qa-report.md. Report a defect for Sion Sass instead.`);
  }
  process.exit(0);
});
