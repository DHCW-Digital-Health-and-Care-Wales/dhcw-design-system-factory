# DHCW design system: codebase map

For Sion Sass (Component Developer) and Tesni Test (Quality Assurer). It describes how the design system repository is organised and how to change it safely.

**Snapshot.** Mapped from a fresh clone of `main` at commit `acaa901`, release `v0.1.70`, on 18 October 2026. 726 tracked files. Repository: https://github.com/DHCW-Digital-Health-and-Care-Wales/dhcw-design-system (public, MIT licence; the written content is under the Open Government Licence). Package name: `dhcw-design-system`.

**Always check this map against your own clone.** The repository changes daily and every merge to `main` makes a release. After `setup-workspace.js` runs, compare `work/<story-id>/build/BASELINE.txt` with the commit above. If it's newer, trust the clone over this file and note what differed in your report. If something here is wrong, say so in your report so the map can be corrected.

---

## 1. What it is

A Sass, Nunjucks and JavaScript component library for Digital Health and Care Wales services, in the spirit of GOV.UK Frontend and NHS.UK Frontend. It ships:

- one compiled stylesheet (`nhsw.css`, `nhsw.min.css`);
- 40 Nunjucks macros, each with a YAML spec;
- two plain, dependency-free scripts: behaviours (`nhsw-behaviours.js`) and the date picker (`nhsw-date-picker.js`);
- a documentation site (Jekyll) with live examples, built from the folder `preview/`.

Everything is prefixed `nhsw`. Classes follow BEM: `nhsw-block__element--modifier`.

## 2. Repository layout

| Path | What's in it | Hand-written or generated |
|---|---|---|
| `src/` | The library: styles, macros, tokens (168 files) | Hand-written |
| `preview/` | The docs site (345 files): pages, example pages, layouts, assets | Hand-written, except `preview/dist/*` and `preview/assets/search-index.js` |
| `specs/` | All tests (175 files): Vitest, Playwright, and Gherkin docs | Hand-written |
| `scripts/` | Build, render and packaging tools (8 files) | Hand-written |
| `dist/` | Built files that the npm package ships | `*.js` are **hand-written sources**; `nhsw.css`, `nhsw.min.css`, `*.min.js` and the zip are **generated** |
| `.agent/` | Rules and a class registry for coding agents (3 files) | Hand-written, tested |
| `.github/` | Three workflows, plus two Copilot files from another project | Hand-written |
| `CLAUDE.md`, `README.md`, `package.json`, `_config.yml`, `vitest.config.mjs`, `playwright.config.js`, `Gemfile` | Config and docs | Hand-written |

Not tracked (ignored): `node_modules/`, `_site/`, `njk-preview/`, `preview/_site_test/`, `test-results/`, `test-reports/`, `playwright-report/`, `project-export.txt`, `dist/*.map`.

## 3. `src/`: how the library is wired together

### 3.1 Styles

`src/index.scss` is the entry point. It forwards, in this order: `tokens`, `utilities`, `foundations`, `components`, `layouts`. (`src/nhsw.scss` is empty.)

| Layer | Folder | Contents |
|---|---|---|
| Tokens | `src/tokens/` | `_colours.scss`, `_spacing.scss`, `_typography.scss` |
| Utilities | `src/utilities/` | `_breakpoints.scss` (mixins `nhsw-from-tablet`, `-from-desktop`, `-from-large-desktop`), `_focus-ring.scss`, `_hidden-control.scss` |
| Foundations | `src/foundations/` | Shared recipes: `_button-base`, `_input-base`, `_callouts`, `_layout`, `_typography` |
| Components | `src/components/<group>/` | Eight style groups (below) |
| Layouts | `src/layouts/` | `_main-wrapper.scss`, `_docs-page.scss` |

**Style groups** live in `src/components/`, each with its own `_index.scss` that forwards its partials. `src/components/_index.scss` forwards the groups in this order: forms, content, actions, layout, callouts, cards, site, navigation.

| Group | Partials |
|---|---|
| `actions` | action-link, back-link, button, button-group, link |
| `callouts` | notification-banner, warning-callout |
| `cards` | card |
| `content` | typography, inset-text, tabs, summary-list, summary-card, tag, details, expander, panel, patient-header, timeout-modal, warning-text, pagination, table, session-row; and docs-site-only: code, code-example, colour-swatch, type-specimen, code-viewer, example-preview, screenshot-placeholder, example-screenshot, search |
| `forms` | checkboxes, date-input, date-picker, error-message, error-summary, fieldset, file-upload, form-group, hint, input-wrapper, input, label, radios, select, textarea |
| `layout` | grid |
| `navigation` | breadcrumb, skip-link |
| `site` | bottom-nav, cookie-banner, dashboard, footer, header, phase-banner, side-nav |

A component's partial is **not** always in a folder of the same name. The timeout macro's styles are in `content/_timeout-modal.scss`; the dashboard's are in `site/_dashboard.scss`. Find them with a search for the class name.

**Sass conventions seen throughout:**
- Partials start with `_` and are pulled in with `@forward "name";` in their group's `_index.scss`.
- A partial begins with `@use "../../tokens/colours" as c;` (and `typography as t`, `spacing as s`, `utilities/breakpoints as b`), then refers to `c.$nhswales-primary-text-colour`, `t.$nhsw-font-size-body`, and so on.
- Responsive rules use the mixins: `@include b.nhsw-from-tablet { … }`. Do not write raw media queries.
- Spacing is written in **px**, never rem or em (rule in `.agent/design-system-rules.md`).
- No hex values in components. Use a token. No inline styles anywhere.
- Focus uses the yellow focus colour. The shared `nhsw-focus-ring` mixin is yellow only, so pair it with a dark indicator where it sits on a light background.

**Colour tokens** (`src/tokens/_colours.scss`) are named two ways, deliberately:
- `$nhswales-*`: the core, documented palette (text, links, focus, buttons, backgrounds, borders, shadows).
- `$nhsw-colour-*`: interaction states (hover, active) and component-specific colours, used only inside their own component.

Adding or changing a core colour token also means updating `specs/tests/css/figma-tokens.test.js` and `specs/tests/css/components/colour-swatch.test.js`, and the colour table in `.agent/design-system-rules.md`. Tests check all three.

### 3.2 Macros

There are **40 macros**, each in its own folder: `src/components/<name>/macro.njk` plus `<name>.yaml`.

```
action-link   back-link   bottom-nav    breadcrumb   button        card
checkboxes    dashboard   date-input    date-picker  details       error-message
error-summary expander    fieldset      file-upload  footer        header
hint          input       inset-text    label        notification-banner
pagination    panel       phase-banner  radios       select        session-row
site-navigation  skip-link  summary-card  summary-list  table      tabs
tag           textarea    timeout       warning-callout  warning-text
```

- **Macro name:** `nhsw` plus the PascalCase name: `nhswButton`, `nhswTimeout`, `nhswWarningCallout`.
- **Import path** is relative to `src/components/`: `{% from "button/macro.njk" import nhswButton %}` (not `./button/...`).
- **One `params` object** per macro. Conventions: `text` / `html` pairs (`html` wins and is passed through `| safe`), `classes` adds to the root element, `attributes` adds HTML attributes, form fields wire up `aria-describedby`, `aria-invalid` and error classes from `hint` and `errorMessage`.
- **YAML spec** (`<name>.yaml`): fields `name`, `macro`, `description`, `params` (a list of `name`, `type`, `required`, `description`) and `examples` (a list with `name`, `data`, and optionally `call: true` and `content` for macros used with `{% call %}`). At least one example is required, and every example must render.
- **`src/components/all-components.njk`** re-exports every macro in one import. It's **maintained by hand**; a test fails if a macro is missing from it.
- **Packaging is automatic:** `scripts/package-njk-components.js` zips every folder that has a `macro.njk`.
- **Nunjucks setup:** `src/nunjucks.config.js` exports `configure()`. Its loader root is `src/components`, with `autoescape: true`, `trimBlocks` and `lstripBlocks`. Tests and the render script use it.
- **Known shortcoming to avoid repeating:** visible English text inside a macro (or its script) can't be translated. Every user-visible string in a new macro must be a parameter with an English default, and any string a script writes must come from a `data-` attribute.

### 3.3 JavaScript

There is **no `src/js/` folder.** The scripts are hand-written directly in `dist/`:

| File | What it holds |
|---|---|
| `dist/nhsw-behaviours.js` | One self-running function with a section per behaviour: character count, conditional reveal for checkboxes and radios, exclusive "none" checkbox, tabs, site navigation "More" menu, error summary focus, double-click prevention, expander, file upload status, the timeout countdown |
| `dist/nhsw-date-picker.js` | The date picker |

`npm run build:js` minifies them with esbuild into `dist/nhsw-behaviours.min.js` and `dist/nhsw-date-picker.min.js`, then copies the results to `preview/dist/`. Behaviours attach to existing markup via `data-` attributes or class selectors, and do nothing if the markup isn't there. They are tested in JSDOM (see section 5).

`preview/assets/` also holds scripts for the docs site only (`nhsw-docs.js`, `nhsw-search.js`, `nhsw-test-tracker.js`, `nhsw-cookie-consent.js`). They are not part of the library.

## 4. `preview/`: the documentation site

Jekyll, with `source: preview` in `_config.yml`. Tests do **not** need Ruby: `scripts/build-preview-site.js` renders the same pages with a small Liquid renderer into `preview/_site_test/`, and `scripts/serve-preview-site.js` serves them on port 4173.

| Folder | Purpose |
|---|---|
| `_layouts/` | `default`, `component`, `example`, `home`, `simple`, `template`, `workshop` |
| `_includes/` | `example-preview`, `code-viewer`, `tabs-nav`, `side-nav`, `breadcrumb`, `site-header`, `site-footer`, `phase-banner`, `primary-nav`, `cookie-banner`, `example-screenshot`, `screenshot-placeholder` |
| `_data/` | `side_nav.yml` (the Components navigation), `styles_nav.yml`, `get_started_nav.yml` |
| `components/` | 29 pages: one per documented component, plus `index.html` |
| `examples/` | 155 stand-alone example pages (`layout: example`), opened from the docs in a new tab |
| `testing/` | 29 manual test checklists (`layout: simple`, using `nhsw-test-tracker.js`) |
| `patterns/`, `styles/`, `get-started/` | Page templates, styles and getting-started pages |
| `assets/` | Logos, icons, docs scripts, `component-previews/*.png`, `examples/` images, and the generated `search-index.js` |
| `dist/` | The **built** CSS and JS (7 files), committed |

**A component docs page** (`preview/components/<name>.html`) has front matter `layout: component`, `title`, `container: fluid`, `updated`, `intro` and `tabs` (How to use, Variants, Examples). Each tab is a `<div class="nhsw-tabs__panel" id="panel-…">`. Live previews use `{% include example-preview.html id=… open_url=… body=… %}`, and each is followed by `{% include code-viewer.html id=… html=… njk=… toggleable=true %}` with both an HTML and a Nunjucks sample. The Examples tab uses `screenshot-placeholder.html` or exported images, never a live preview.

**Not every macro has a docs page.** Macros without one: `bottom-nav`, `dashboard` (shown under Page templates), `date-picker`, `error-message`, `fieldset`, `hint`, `label`, `phase-banner`, `session-row`, `summary-card`, `timeout`, `warning-text`. Three have a page under another name: `button` → `buttons`, `card` → `cards`, `input` → `text-input`. The published site can lag the code.

**The docs site is the one place where existing wording is protected.** Never change the headings, descriptions, guidance text, lists or links of an existing page outside its example areas, unless asked.

## 5. `specs/`: the tests

Run with Node 22. About 3,600 unit tests take roughly two minutes on a Windows laptop.

| Folder | Tool | What it tests |
|---|---|---|
| `specs/tests/css/` (61 files) | Vitest | Compiled CSS. `components/<name>.test.js` per component, plus cross-cutting files (see below) |
| `specs/tests/njk/` (15) | Vitest | Macros render and produce the right markup |
| `specs/tests/markup/` (21) | Vitest | The docs pages' HTML: accessibility rules, example and code-sample pairing, links, page titles |
| `specs/tests/js/` (4) | Vitest + JSDOM | The behaviour scripts |
| `specs/tests/scripts/` (4) | Vitest | Packaging, workflows, test report |
| `specs/tests/support/` | helpers | `compile-scss.js` (`compileProbe`, `block`), `contrast.js`, `load-script.js` (`runScript`) |
| `specs/e2e/` (36 files) | Playwright | The built docs site in a real browser (Chromium only): keyboard, focus, layout, navigation |
| `specs/gherkin/` (28 + README) | none (documentation) | Per-component Gherkin: `@automated` scenarios name the test that covers them, `@manual` scenarios feed the checklists in `preview/testing/` |

**How tests are written here:**
- **CSS tests** compile a probe, not the whole stylesheet: `compileProbe('@use "components/site/phase-banner";')`, then `block(css, '\\.nhsw-phase-banner__tag')` and assert on the declarations.
- **Macro tests** render with `configure()` from `src/nunjucks.config.js` and assert on the HTML.
- **JS tests** put fixture markup in `document.body`, call `runScript('dist/nhsw-behaviours.js')`, then dispatch events.
- **E2E tests** use `@playwright/test` against `baseURL` `http://localhost:4173`, started by `playwright.config.js` through `scripts/serve-preview-site.js`.
- **Accessibility scan:** `specs/e2e/accessibility.spec.js` runs axe on every rendered page with the tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`. It does **not** include `wcag22aa`, so the 2.2 target-size rule is never run there. New accessibility tests should add `wcag22aa`.

**Cross-cutting tests a new or changed component must satisfy:**
- `css/component-registry.test.js`: every `nhsw-…` class named in `.agent/component-registry.md` and `.agent/design-system-rules.md` exists in the compiled CSS, every token named there exists, and the colour and spacing values in the rules match the code.
- `njk/components.test.js`: every folder with a YAML has a macro, an example, and an entry in `all-components.njk`.
- `markup/documentation-gaps.test.js`: every live preview has a code sample, none is empty, and the Examples tab follows the convention.
- `markup/example-sample-completeness.test.js`: each `example-preview` id has a matching code sample with both HTML and Nunjucks.
- `markup/component-index-preview-links.test.js`: each card on the components index links to its page.
- `markup/accessibility.test.js`, `css/contrast.test.js`, `css/figma-tokens.test.js`, and the workflow and packaging tests.
- `markup/agent-config.test.js`: the agent rules keep their protections of existing page content.

## 6. Adding or changing a component: the files involved

**A new component** usually touches these. Not every item applies to every component.

1. **Styles:** a partial in the right group (`src/components/<group>/_name.scss`) and a `@forward` in that group's `_index.scss`.
2. **Macro:** `src/components/<name>/macro.njk` and `<name>.yaml` (params and at least one example), and a line in `src/components/all-components.njk`.
3. **Behaviour (if any):** a new section in `dist/nhsw-behaviours.js`, then `npm run build:js`.
4. **Registry and rules:** an entry in `.agent/component-registry.md` listing every class and modifier. Update `.agent/design-system-rules.md` if the component adds guidance.
5. **Docs page (if it is a public component):** `preview/components/<name>.html`; example pages in `preview/examples/`; a link in `preview/_data/side_nav.yml`; a card and image on `preview/components/index.html` (images come from `scripts/generate-component-previews.js`, which needs the preview server running).
6. **Manual checklist (if there are `@manual` scenarios):** `preview/testing/<name>.html` and a link on `preview/testing/index.html`. *Written by Tesni Test, not Sion Sass.*
7. **Tests:** the files in section 5, plus `specs/gherkin/<name>.md` and its entry in `specs/gherkin/README.md`. *Written by Tesni Test, not Sion Sass.*
8. **Rebuild the generated files** (section 7), so the diff includes `preview/dist/*` and the search index.

**Changing an existing component:** search for every place its classes are used (`grep` for the class name across `src`, `preview`, `specs`, `.agent`), and update tests that assert the old behaviour deliberately and visibly, not silently.

## 7. Build and test commands

On Windows PowerShell, `npm` can be blocked by the execution policy: use `npm.cmd` and `npx.cmd`. The helper scripts in this repository use Node directly, so they avoid the problem.

| Command | What it does | Roughly |
|---|---|---|
| `npm ci` | Installs exactly what the lock file says | 1 to 2 min |
| `npm run build:css` | Compiles `src/index.scss` to `preview/dist/nhsw.css` and `.min.css`, copies the JS in, and rebuilds the search index | seconds |
| `npm run build:js` | Minifies the two scripts, copies to `preview/dist/` | seconds |
| `npm run build:search` | Rebuilds `preview/assets/search-index.js` (also part of `build:css`) | seconds |
| `npm test` | Vitest: all unit tests | about 2 min |
| `npx vitest run <file>` | One test file | seconds |
| `npm run test:e2e` | Builds the preview site, serves it, runs Playwright (needs Chromium installed: `npx playwright install chromium`) | several min |
| `npm run render:njk` | Renders every YAML example through its macro to `njk-preview/` | seconds |
| `npm run build:preview` | Renders the docs site to `preview/_site_test/` | seconds |
| `npm run package:njk` | Builds `dist/nhsw-nunjucks-components.zip` | seconds |

**Generated files that are committed, so a diff will include them after a rebuild:** `preview/dist/*` (7 files), `preview/assets/search-index.js`. `dist/nhsw.css`, `dist/nhsw.min.css` and the zip are rebuilt and committed by the release automation, so don't hand-edit them. The `dist/*.js` source files are the exception: edit those, then run `build:js`.

**Never run:**
- `npm run sync:gptr`: it copies built files into other repositories on a developer's machine.
- `npm publish`, `npm version`, or the release workflows.
- `node scripts/generate-component-previews.js`, unless asked: it rewrites PNG files.

## 8. Contribution, CI and release

- **Commit messages** use Conventional Commits (`feat(scope): …`, `fix:`, `docs:`, and so on). The `.github/copilot-*` files describe Azure DevOps conventions for a different project (CommunityApplications) and don't apply here. Our agents never commit; humans do.
- **CI** (`.github/workflows/ci.yml`) runs on every push and pull request: install, build CSS and JS, install Playwright, `npm run report:tests` (all tests, with a report), and an npm package check.
- **Every push to `main` that passes CI makes a patch release automatically** (version bump, build, package the macros zip, copy built CSS to `dist/`, commit, tag, GitHub release). Merging is therefore a release.
- **Manual release** (`release.yml`) lets a person choose major, minor or pre-release, and optionally publish to npm.
- **Docs deploy** (`pages.yml`): builds with Jekyll and deploys to GitHub Pages on every push.

## 9. The repository's own rules for agents

From `CLAUDE.md` and `.agent/design-system-rules.md` (read both in your clone, since they change):
- Use existing components and tokens. Don't invent colours, spacing or one-off CSS. No inline styles. Spacing in px.
- Don't change the written content of existing pages unless explicitly asked. Report wording that looks wrong instead.
- Accessibility: visible labels with matching `for` and `id`, hints and errors linked by `aria-describedby`, `aria-invalid="true"` on invalid fields, `fieldset` and `legend` for date inputs, radios and checkboxes, no placeholder as a label, `id="maincontent"` on `main`, yellow focus indicator, `aria-hidden="true"` on decorative SVGs.
- Use the existing page shell for pages: `nhsw-site-header`, `nhsw-main-wrapper`, `nhsw-width-container`, `nhsw-site-footer`.

## 10. Things to know before you start

- **The docs and the code disagree in places.** For example, the docs describe timeout behaviour (server calls, redirects) that the script doesn't implement. Check the code, and say so when they differ.
- **A macro's visible text must be translatable.** See 3.2.
- **Windows:** PowerShell may block `npm.ps1` (use `npm.cmd`), and may run in a restricted mode that blocks .NET method calls (use Node scripts). Git is set to convert line endings, so "LF will be replaced by CRLF" warnings are harmless.
- **Tests are slow and numerous.** Run the single relevant file while working, and the whole suite once at the end.
- **If a test fails that you didn't touch,** check whether it also fails in the baseline copy before assuming you broke it.
