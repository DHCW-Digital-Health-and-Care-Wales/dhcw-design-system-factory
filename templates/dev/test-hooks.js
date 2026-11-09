const path = require("path");
const { spawnSync } = require("child_process");

const root = process.argv[2] || path.resolve(__dirname, "..", "..");
const gitHook = path.join(root, ".claude", "hooks", "block-git-writes.js");
const writeHook = path.join(root, ".claude", "hooks", "restrict-writes.js");

function run(hook, input, extra) {
  const r = spawnSync("node", [hook].concat(extra || []), { input: JSON.stringify(input), encoding: "utf8" });
  return r.status;
}

let bad = 0;
function expect(label, got, want) {
  const ok = got === want;
  if (!ok) bad++;
  console.log(`${ok ? "ok  " : "FAIL"} ${want === 2 ? "blocked" : "allowed"}  ${label}  (exit ${got})`);
}

const shouldBlock = [
  "git commit -m x", "git push origin main", "git -C foo push", "git add .", "git add -A", "git checkout -b x",
  "git checkout main", "git switch main", "git stash", "git reset --hard", "git reset", "git rebase main", "git merge x",
  "git cherry-pick abc", "git revert abc", "git tag v1", "git branch newbranch", "git branch -D old", "git remote add origin x",
  "git config user.name x", "git rm file", "git mv a b", "git restore file", "git clean -fd", "git am patch",
  "cd x && git commit -m y", "git status; git push", "git status | git commit", "& git commit -m x", "git.exe commit -m x",
  '"C:\\Program Files\\Git\\bin\\git.exe" push', "gh pr create", "gh repo view", "npm publish", "npm version patch",
  "npm run sync:gptr", "git -c user.name=x commit -m y", "git commit --amend", "git push --force",
  "echo hi\ngit commit -m x",
];
const shouldAllow = [
  "git status", "git diff --stat", "git log --oneline -5", "git clone --depth 1 https://example.com/r.git dir",
  "git -C dir status", "git branch --show-current", "git ls-files", "npm test", "npm ci", "npm run build:css",
  "node templates/dev/make-patch.js ST-1", "git remote -v", "git tag -l", "git show HEAD", "git rev-parse HEAD",
  "git fetch origin", "git config --get user.name", "git diff HEAD~1 -- src", "npx vitest run specs/tests/css/x.test.js",
  "cd work/ST-1/build/design-system && npm test", "echo 'git commit is not allowed'", "Get-ChildItem src", "git branch --list",
];

for (const c of shouldBlock) expect(c.replace(/\n/g, "\\n"), run(gitHook, { tool_name: "Bash", tool_input: { command: c } }), 2);
for (const c of shouldAllow) expect(c, run(gitHook, { tool_name: "Bash", tool_input: { command: c } }), 0);

const w = (...p) => path.join(root, "work", ...p);
const writes = [
  [w("ST-1", "build", "design-system", "src", "x.scss"), 0],
  [w("ST-1", "dev-notes.md"), 0],
  [path.join(root, ".claude", "agents", "x.md"), 2],
  [path.join(root, "AGENTS.md"), 2],
  ["C:\\Users\\jo126787\\Documents\\GitHub\\nhsw-component-library\\src\\x.scss", 2],
  [w("ST-1", "build", "design-system", ".git", "config"), 2],
  [w("..", "AGENTS.md"), 2],
  [path.join(root, "work"), 2],
];
for (const [p, want] of writes) expect("write " + p.replace(root, "<factory>"), run(writeHook, { tool_name: "Write", cwd: root, tool_input: { file_path: p } }), want);

const ds = (...p) => w("ST-1", "build", "design-system", ...p);
const developerCases = [
  [ds("src", "components", "x", "macro.njk"), 0],
  [ds(".agent", "component-registry.md"), 0],
  [ds("preview", "components", "x.html"), 0],
  [w("ST-1", "build", "dev-notes.md"), 0],
  [ds("specs", "tests", "css", "x.test.js"), 2],
  [ds("preview", "testing", "x.html"), 2],
  [w("ST-1", "build", "baseline", "specs", "x.js"), 2],
  [w("ST-1", "build", "qa-report.md"), 2],
  [path.join(root, "AGENTS.md"), 2],
];
for (const [p, want] of developerCases) expect("developer write " + p.replace(root, "<factory>"), run(writeHook, { tool_name: "Edit", cwd: root, tool_input: { file_path: p } }, ["--developer"]), want);

const testerCases = [
  [ds("specs", "tests", "css", "x.test.js"), 0],
  [ds("specs", "gherkin", "x.md"), 0],
  [ds("preview", "testing", "x.html"), 0],
  [w("ST-1", "build", "baseline", "specs", "x.js"), 0],
  [w("ST-1", "build", "qa-report.md"), 0],
  [w("ST-1", "build", "qa", "shot.png"), 0],
  [ds("src", "components", "x", "macro.njk"), 2],
  [ds(".agent", "component-registry.md"), 2],
  [ds("preview", "components", "x.html"), 2],
  [ds("dist", "nhsw-behaviours.js"), 2],
  [w("ST-1", "build", "dev-notes.md"), 2],
  [w("ST-1", "build", "baseline", "src", "x.scss"), 2],
  [w("ST-1", "story.feature"), 2],
  [path.join(root, "AGENTS.md"), 2],
];
for (const [p, want] of testerCases) expect("tester write " + p.replace(root, "<factory>"), run(writeHook, { tool_name: "Write", cwd: root, tool_input: { file_path: p } }, ["--tester"]), want);

console.log(bad ? `\n${bad} FAILED` : "\nAll hook checks passed");
process.exit(bad ? 1 : 0);

