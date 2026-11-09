/*
 * Claude Code PreToolUse hook for the development and test agents (Sion Sass and Tesni Test).
 *
 * They may read git history and make a fresh clone, but they must never commit, push,
 * change branches or otherwise write to a repository. This hook inspects every shell command
 * they try to run and blocks it (exit code 2, which Claude Code treats as "blocked") unless it
 * is on a short allowlist of read-only git commands.
 *
 * It also blocks the GitHub CLI and a few npm commands that publish or version a package.
 *
 * Limits: it reads the command text, so it can't stop code that does the same thing from
 * inside a script. The agents' instructions say the same thing; this is the second layer.
 */
let raw = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => { raw += chunk; });
process.stdin.on("end", () => {
  let input;
  try { input = JSON.parse(raw); } catch (e) { process.exit(0); }
  const command = (input.tool_input && (input.tool_input.command || input.tool_input.script)) || "";
  const problem = check(String(command));
  if (problem) {
    process.stderr.write(
      `Blocked: ${problem}\n` +
      "The development and test agents never commit, push or change git history, and never publish. " +
      "Leave changes in the working copy and run: node templates/dev/make-patch.js <story-id>\n"
    );
    process.exit(2);
  }
  process.exit(0);
});

const READ_ONLY = new Set([
  "status", "diff", "log", "show", "ls-files", "rev-parse", "describe", "blame", "grep", "ls-remote",
  "cat-file", "shortlog", "check-ignore", "diff-tree", "rev-list", "help", "version", "--version", "clone", "fetch",
]);
const OPTIONS_WITH_VALUE = new Set(["-C", "-c", "--git-dir", "--work-tree", "--namespace", "--exec-path", "--super-prefix"]);
const BRANCH_READ = new Set(["--show-current", "--list", "-l", "-a", "-r", "-v", "-vv", "--all", "--remotes", "--contains", "--merged", "--no-merged"]);

function tokenize(segment) {
  const tokens = [];
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g;
  let m;
  while ((m = re.exec(segment))) tokens.push(m[1] !== undefined ? m[1] : m[2] !== undefined ? m[2] : m[3]);
  return tokens;
}

function check(command) {
  const segments = command.split(/&&|\|\||;|\||\r?\n|(?<![&>])&(?!&)/);
  for (const segment of segments) {
    const tokens = tokenize(segment.trim());
    for (let i = 0; i < tokens.length; i++) {
      const base = tokens[i].replace(/\\/g, "/").split("/").pop().toLowerCase();

      if (base === "gh" || base === "gh.exe") return "the GitHub command line (gh) is not allowed.";
      if (base === "npm" || base === "npm.cmd") {
        const sub = tokens.slice(i + 1).find((t) => !t.startsWith("-"));
        if (sub === "publish" || sub === "version" || sub === "login" || sub === "adduser") return `"npm ${sub}" is not allowed.`;
        if (sub === "run" && /sync:gptr/.test(segment)) return '"npm run sync:gptr" copies files into other repositories and is not allowed.';
      }

      if (base === "git" || base === "git.exe") {
        let j = i + 1;
        while (j < tokens.length && tokens[j].startsWith("-")) {
          j += OPTIONS_WITH_VALUE.has(tokens[j]) ? 2 : 1;
        }
        const sub = tokens[j];
        if (!sub) continue;
        const rest = tokens.slice(j + 1);

        if (READ_ONLY.has(sub)) continue;
        if (sub === "branch" && rest.every((t) => BRANCH_READ.has(t))) continue;
        if (sub === "remote" && (rest.length === 0 || rest[0] === "-v" || rest[0] === "get-url" || rest[0] === "show")) continue;
        if (sub === "tag" && (rest.length === 0 || rest[0] === "-l" || rest[0] === "--list")) continue;
        if (sub === "config" && ["--get", "--get-all", "--list", "-l"].includes(rest[0])) continue;
        return `"git ${sub}" changes a repository and is not allowed.`;
      }
    }
  }
  return null;
}
