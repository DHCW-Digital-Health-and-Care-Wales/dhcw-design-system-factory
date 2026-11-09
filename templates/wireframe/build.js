/*
 * Builds a story's wireframes from its page definitions.
 *
 * Usage:
 *   node templates/wireframe/build.js work/<story-id>/wireframes/pages.js [--ds <design system folder>] [--tag <release tag>]
 *
 *   --ds    a checkout of the design system that has had "npm install" run in it. Defaults to
 *           ../nhsw-component-library, next to this repository. Only src/ and the nunjucks
 *           package are used. A story's working copy, work/<id>/build/design-system, also works.
 *   --tag   the release the pages load their styles from. Defaults to DS_TAG in
 *           context/dhcw-design-system.md.
 *
 * It copies wf.css and wf.js into the wireframes folder, then runs the page definitions, which
 * write one HTML file per page and state, plus index.html. Run it again whenever the spec changes.
 * work/ST-001/wireframes/pages.js is a worked example of a page definition, and lib.js lists the
 * helpers it can use.
 */
const fs = require("fs");
const path = require("path");
const { createKit } = require("./lib");

const FACTORY_ROOT = path.resolve(__dirname, "..", "..");
const args = process.argv.slice(2);
const option = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };
const definition = args.find((a, i) => !a.startsWith("--") && !(i > 0 && args[i - 1].startsWith("--")));

if (!definition) {
  console.error("Usage: node templates/wireframe/build.js work/<story-id>/wireframes/pages.js [--ds <folder>] [--tag <tag>]");
  process.exit(2);
}

const definitionPath = path.resolve(definition);
const out = path.dirname(definitionPath);
const ds = path.resolve(option("--ds") || path.join(FACTORY_ROOT, "..", "nhsw-component-library"));

if (!fs.existsSync(path.join(ds, "src", "nunjucks.config.js")) || !fs.existsSync(path.join(ds, "node_modules", "nunjucks"))) {
  console.error(`${ds} isn't a design system checkout with its packages installed.\nRun "npm ci" in it, or pass --ds <folder>.`);
  process.exit(2);
}

let tag = option("--tag");
if (!tag) {
  const notes = fs.readFileSync(path.join(FACTORY_ROOT, "context", "dhcw-design-system.md"), "utf8");
  const match = notes.match(/DS_TAG`\):\*\*\s*`(v\d+\.\d+\.\d+[^`]*)`/);
  if (!match) { console.error("Couldn't find DS_TAG in context/dhcw-design-system.md. Pass --tag."); process.exit(2); }
  tag = match[1];
}

for (const file of ["wf.css", "wf.js"]) fs.copyFileSync(path.join(__dirname, file), path.join(out, file));

const kit = createKit({ ds, out, tag });
require(definitionPath)(kit);
kit.finish();
