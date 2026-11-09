/*
 * Run axe-core against one or more pages and print a findings summary.
 * The Node version of axe_check.py, for machines without Python Playwright.
 *
 * Usage:
 *   node axe_check.js [--width 375,1280] [--lang en|cy|both] [--json out.json] [--ds path] page.html [more pages...]
 *
 * Pages can be local file paths or http(s) URLs. Uses the WCAG 2.2 A/AA tags
 * plus best practices, as set out in context/wcag-axe.md. Findings inside the
 * wireframe notes panel, toolbar and gap boxes are ignored.
 *
 * Playwright and @axe-core/playwright are loaded from this folder's
 * node_modules if present, else from the design system clone (--ds), which
 * defaults to ../nhsw-component-library next to this repository.
 */
const fs = require("fs");
const path = require("path");

const argv = process.argv.slice(2);
const opts = { width: "375,1280", lang: "both", json: null, ds: null };
const pages = [];
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === "--width") opts.width = argv[++i];
  else if (a === "--lang") opts.lang = argv[++i];
  else if (a === "--json") opts.json = argv[++i];
  else if (a === "--ds") opts.ds = argv[++i];
  else pages.push(a);
}
if (!pages.length) {
  console.log("Usage: node axe_check.js [--width 375,1280] [--lang en|cy|both] [--json out.json] [--ds path] page.html ...");
  process.exit(2);
}

const ds = path.resolve(opts.ds || path.join(__dirname, "..", "..", "..", "nhsw-component-library"));

function load(name) {
  try { return require(name); } catch (e) { /* try the design system clone */ }
  try { return require(path.join(ds, "node_modules", name)); } catch (e) {
    console.error(`Could not load ${name}. Run "npm install ${name}" here, or pass --ds <design system clone with node_modules>.`);
    process.exit(2);
  }
}

const { chromium } = load("playwright");
const AxeBuilder = load("@axe-core/playwright").default || load("@axe-core/playwright");

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"];
const SEVERITY = { critical: "Blocker", serious: "Blocker", moderate: "Should fix", minor: "Nit" };
const ALWAYS_BLOCK = new Set(["page-has-heading-one", "landmark-one-main", "skip-link"]);
const IGNORE = [".wf-notes", ".wf-toolbar", ".wf-gap"];

(async () => {
  const widths = opts.width.split(",").map((w) => parseInt(w, 10));
  const langs = opts.lang === "both" ? ["en", "cy"] : [opts.lang];
  const browser = await chromium.launch();
  const report = [];
  const review = [];
  let blockers = 0;
  let axeVersion = "";

  for (const target of pages) {
    const url = /^https?:/.test(target) ? target : "file://" + path.resolve(target);
    for (const width of widths) {
      for (const lang of langs) {
        const context = await browser.newContext({ viewport: { width, height: 900 } });
        await context.addInitScript(`try{localStorage.setItem('wf-lang','${lang}')}catch(e){}`);
        const page = await context.newPage();
        await page.goto(url);
        await page.waitForLoadState("networkidle");

        const headingSize = await page.evaluate(() => {
          const h = document.querySelector("h1");
          return h ? parseFloat(getComputedStyle(h).fontSize) : 99;
        });
        if (headingSize < 32) console.log(`WARNING: ${path.basename(target)} @ ${width}px: design system styles may not have loaded`);

        let builder = new AxeBuilder({ page }).withTags(TAGS);
        for (const selector of IGNORE) builder = builder.exclude(selector);
        const result = await builder.analyze();
        axeVersion = result.testEngine.version;

        for (const v of result.violations) {
          const severity = ALWAYS_BLOCK.has(v.id) ? "Blocker" : SEVERITY[v.impact] || "Should fix";
          if (severity === "Blocker") blockers++;
          report.push({
            page: path.basename(target), width, lang, rule: v.id, impact: v.impact, severity,
            wcag: v.tags.filter((t) => /^wcag\d{3,4}$/.test(t)),
            help: v.help, helpUrl: v.helpUrl,
            targets: v.nodes.slice(0, 5).map((n) => n.target.join(", ")),
          });
        }
        for (const i of result.incomplete) {
          review.push({
            page: path.basename(target), width, lang, rule: i.id, help: i.help,
            targets: i.nodes.slice(0, 5).map((n) => n.target.join(", ")),
            why: (i.nodes[0] && i.nodes[0].any[0] && i.nodes[0].any[0].message) || "",
          });
        }
        console.log(`${path.basename(target)} @ ${width}px [${lang}]: ${result.violations.length} violations, ${result.incomplete.length} need review, ${result.passes.length} rules passed`);
        await context.close();
      }
    }
  }
  await browser.close();

  for (const r of report) {
    console.log(`- [${r.severity}] ${r.rule} (${r.wcag.join(", ") || "best practice"}) on ${r.page} @ ${r.width}px [${r.lang}]: ${r.help} -> ${r.targets.join("; ")}`);
  }
  const seen = new Set();
  for (const r of review) {
    const key = `${r.page}|${r.rule}|${r.targets.join(",")}`;
    if (seen.has(key)) continue;
    seen.add(key);
    console.log(`? needs a person: ${r.rule} on ${r.page} (${r.why || r.help}) -> ${r.targets.join("; ")}`);
  }
  if (opts.json) fs.writeFileSync(opts.json, JSON.stringify({ axe: axeVersion, tags: TAGS, findings: report, needsReview: review }, null, 2));
  console.log(`\naxe ${axeVersion}: ${report.length} findings, ${blockers} blockers. Automated checks only: see context/wcag-axe.md section 4 for the manual checks still owed.`);
  process.exit(blockers ? 1 : 0);
})();
