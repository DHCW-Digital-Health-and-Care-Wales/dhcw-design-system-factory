/*
 * Checks a story's wireframes in a headless browser and takes screenshots.
 *
 * Usage:
 *   node templates/wireframe/test.js work/<story-id>/wireframes [--ds <design system folder>] [--tag <release tag>] [--shots <folder>]
 *
 *   --ds     a design system checkout with "npm ci" run in it (playwright comes from there). Defaults
 *            to ../nhsw-component-library. The design system's CSS and JavaScript are served from
 *            this folder instead of the CDN, so the check works offline. For --tag to be honest,
 *            the checkout should be at that tag.
 *   --shots  where screenshots go. Defaults to a "shots" folder inside the wireframes folder's
 *            parent, work/<story-id>/wireframe-shots (not tracked by git).
 *
 * For every .html file at 375px and 1280px it checks: no {{ placeholders, links to files that exist,
 * design system styles loaded, no script errors, no sideways scrolling, one h1 (except index.html),
 * any modal fits the screen, "stay" and Escape click through, the Warning button hides the overlay,
 * and the Welsh switch changes every marked string. Look at the screenshots too: these checks don't
 * catch overlapping text or wrong colours.
 */
const fs = require("fs");
const path = require("path");

const FACTORY_ROOT = path.resolve(__dirname, "..", "..");
const args = process.argv.slice(2);
const option = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };
const dirArg = args.find((a, i) => !a.startsWith("--") && !(i > 0 && args[i - 1].startsWith("--")));
if (!dirArg) {
  console.error("Usage: node templates/wireframe/test.js work/<story-id>/wireframes [--ds <folder>] [--tag <tag>] [--shots <folder>]");
  process.exit(2);
}

const DIR = path.resolve(dirArg);
const DS = path.resolve(option("--ds") || path.join(FACTORY_ROOT, "..", "nhsw-component-library"));
const SHOTS = path.resolve(option("--shots") || path.join(DIR, "..", "wireframe-shots"));
let tag = option("--tag");
if (!tag) {
  const notes = fs.readFileSync(path.join(FACTORY_ROOT, "context", "dhcw-design-system.md"), "utf8");
  const match = notes.match(/DS_TAG`\):\*\*\s*`(v\d+\.\d+\.\d+[^`]*)`/);
  if (!match) { console.error("Couldn't find DS_TAG in context/dhcw-design-system.md. Pass --tag."); process.exit(2); }
  tag = match[1];
}

let chromium;
try { ({ chromium } = require(path.join(DS, "node_modules", "playwright"))); }
catch { console.error(`Playwright isn't installed in ${DS}.\nRun "npm ci" in it (and "npx playwright install chromium"), or pass --ds <folder>.`); process.exit(2); }

fs.mkdirSync(SHOTS, { recursive: true });
const CDN = `https://cdn.jsdelivr.net/gh/DHCW-Digital-Health-and-Care-Wales/dhcw-design-system@${tag}/`;
const pages = fs.readdirSync(DIR).filter((f) => f.endsWith(".html")).sort();
let failures = 0;
const fail = (m) => { failures++; console.log("  FAIL:", m); };
const url = (file) => "file://" + path.join(DIR, file);

(async () => {
  const browser = await chromium.launch();
  for (const file of pages) {
    console.log(file);
    const text = fs.readFileSync(path.join(DIR, file), "utf8");
    if (text.includes("{{")) fail("placeholder left in file");
    for (const m of text.matchAll(/(?:href|data-wf-href|data-wf-escape)="([^"#]+\.html)"/g)) {
      if (!fs.existsSync(path.join(DIR, m[1]))) fail("link to missing file " + m[1]);
    }
    const isIndex = file === "index.html";

    for (const width of [375, 1280]) {
      const context = await browser.newContext({ viewport: { width, height: 800 } });
      await context.route(CDN + "**", (route) => {
        const local = path.join(DS, route.request().url().slice(CDN.length));
        if (fs.existsSync(local)) route.fulfill({ path: local });
        else route.abort();
      });
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (e) => errors.push(String(e)));
      await page.goto(url(file));
      await page.waitForTimeout(1300);

      if (errors.length) fail(`${width}px page errors: ${errors.join("; ")}`);

      const headingSize = await page.evaluate(() => parseFloat(getComputedStyle(document.querySelector("h1")).fontSize));
      if (headingSize < 32) fail(`${width}px design system styles did not load (h1 is ${headingSize}px)`);

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      if (overflow) fail(`${width}px sideways scrolling`);

      const h1s = await page.locator("h1").count();
      if (!isIndex && h1s !== 1) fail(`${width}px has ${h1s} h1 headings`);

      const hasModal = (await page.locator(".wf-modal").count()) > 0;
      if (hasModal) {
        if (!(await page.locator(".wf-modal dialog[open]").isVisible())) fail(`${width}px dialog not visible`);
        const box = await page.locator(".wf-modal dialog").boundingBox();
        if (box && (box.x < -1 || box.x + box.width > width + 1)) fail(`${width}px dialog outside the screen`);
      }

      if (width === 1280 && hasModal) {
        const stayTarget = await page.locator("[data-wf-href]").first().getAttribute("data-wf-href").catch(() => null);
        const escapeTarget = await page.locator(".wf-modal").getAttribute("data-wf-escape");
        if (stayTarget) {
          await page.locator("[data-wf-href]").first().click();
          await page.waitForURL("**/" + stayTarget, { timeout: 3000 }).catch(() => fail("the dialog button did not go to " + stayTarget));
          await page.goto(url(file));
        }
        if (escapeTarget) {
          await page.keyboard.press("Escape");
          await page.waitForURL("**/" + escapeTarget, { timeout: 3000 }).catch(() => fail("Escape did not go to " + escapeTarget));
          await page.goto(url(file));
        }
        await page.getByRole("button", { name: "Warning" }).click();
        if (await page.locator(".wf-modal").isVisible()) fail("Warning button did not hide the overlay");
      }

      if (width === 1280 && !isIndex) {
        await page.goto(url(file));
        const toggle = (await page.locator("[data-wf-language-switch]").count())
          ? page.locator("[data-wf-language-switch]").first()
          : page.getByRole("button", { name: "Cymraeg" });
        await toggle.evaluate((el) => el.click());
        const lang = await page.evaluate(() => document.documentElement.lang);
        if (lang !== "cy") fail("language did not switch to cy");
        const stillEnglish = await page.evaluate(() =>
          [...document.querySelectorAll("[data-cy]")].filter((e) => e.tagName !== "TITLE" && e.textContent !== "[CY: needs translation]" && !e.getAttribute("data-cy")).length);
        if (stillEnglish) fail(`${stillEnglish} Welsh slots still show English`);
        const marked = await page.locator("[data-cy]").count();
        const missing = await page.locator(".wf-missing").count();
        console.log(`  Welsh slots: ${marked}, still needing translation: ${missing}`);
        if (!marked) fail("no strings are marked for Welsh");
      }

      await page.evaluate(() => { try { window.localStorage.clear(); } catch (e) { /* storage unavailable */ } });
      await page.goto(url(file));
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(SHOTS, `${file.replace(".html", "")}-${width}.png`), fullPage: true });
      await context.close();
    }
  }
  await browser.close();
  console.log(failures ? `\n${failures} failures` : "\nAll checks passed");
  console.log("screenshots:", SHOTS);
  process.exit(failures ? 1 : 0);
})();
