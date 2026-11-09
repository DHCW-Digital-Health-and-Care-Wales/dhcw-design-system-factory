# DHCW service factory

A team of eight Claude Code agents that design a DHCW digital service and then build and test it as a change to the design system: story, journey, page design, wireframes, accessibility review, code and tests. It uses the [DHCW design system](https://github.com/DHCW-Digital-Health-and-Care-Wales/dhcw-design-system), so everything the agents produce is built from real components, tokens and guidance.

| Agent | Ask for | Produces |
|---|---|---|
| Gethin Gherkin (Story Writer) | the story | `story.feature`, `brief.md` |
| Nia Navigation (Journey Designer) | the journey | `journey.md` |
| Carys Copy (Content Designer) | the wording | `content.md` |
| Huw Eye (UI Designer) | the page designs | `ui-spec.md` |
| Wendy Wireframe (Wireframer) | wireframes | `wireframes/` |
| Ceri Contrast (Accessibility Checker) | an accessibility review | `a11y-review.md` |
| Sion Sass (Component Developer) | the build | code in `build/design-system/`, `build/dev-notes.md` |
| Tesni Test (Quality Assurer) | the tests and a review | tests in the copy, `build/qa-report.md` |

The rules they all follow, and the order they run in, are in [`AGENTS.md`](AGENTS.md).

**Sion and Tesni never commit or push.** They work in a fresh copy of the design system inside `work/<story-id>/build/`, never in your own clone. A person reviews the patch they produce and applies it. Hooks in `.claude/hooks/` block git writes, `gh`, publishing, and writes outside `work/`.

## Set up

1. Clone this repository next to your design system clone, so the folders sit side by side:
   ```
   GitHub\
     dhcw-service-factory\
     nhsw-component-library\      (the design system)
   ```
2. Check [`context/dhcw-design-system.md`](context/dhcw-design-system.md) for which design system version and rules location the agents use.
3. Install **Git** and **Node 22** (the design system's version). In the design system clone run `npm ci` once. Wendy's wireframe scripts and Ceri's browser checks use the packages in `..\nhsw-component-library\node_modules`, including Playwright (run `npx playwright install chromium` if the browser is missing). On Windows PowerShell, use `npm.cmd` and `npx.cmd` if scripts are blocked.
4. Ceri can alternatively use Python: `pip install playwright`, then `playwright install chromium`.
5. Check the safety hooks work: `node templates/dev/test-hooks.js` should end with all checks passing.
6. The agents need **Claude Code**. Open it in this folder and run `/agents` to confirm all eight are listed.

## Try it with a spec

1. Create a folder for the work and save your spec in it:
   ```
   work\ST-001\request.md
   ```
2. In Claude Code, ask for the first step:
   > Ask Gethin Gherkin to write the story for `work/ST-001/request.md`.
3. Read his story and answer his open questions. This is the point where changes are cheapest.
4. Carry on down the line, one agent at a time:
   > Ask Nia Navigation to map the journey for ST-001.
   >
   > Ask Carys Copy to write the content for ST-001.
   >
   > Ask Huw Eye to design the pages for ST-001.
   >
   > Ask Wendy Wireframe to build the wireframes for ST-001.
   >
   > Ask Ceri Contrast to review ST-001.
5. Open `work/ST-001/wireframes/index.html` in a browser to click through the design, and review the design before anyone builds it.
6. Make the working copy of the design system, then ask for the build:
   ```
   node templates/dev/setup-workspace.js ST-001
   ```
   > Ask Sion Sass to build ST-001.
   >
   > Ask Tesni Test to test ST-001.

   Defects Tesni finds go back to Sion, and they repeat until Tesni reports the work is ready. Ceri then audits the built component, Huw checks it against his spec and Carys checks its wording.
7. Review the result. `work/ST-001/build/changes.patch` holds every change and `qa-report.md` says what was tested. Apply it to your own clone when you are happy:
   ```
   cd ..\nhsw-component-library
   git checkout -b my-branch
   git apply ..\dhcw-service-factory\work\ST-001\build\changes.patch
   ```
   Then review, commit and push it yourself. `git apply --check` first shows whether the patch applies cleanly.

Each agent reads everything before it, so you can stop, edit a file by hand, and carry on.

## Wireframes

Wendy writes a page definition, `work/<story-id>/wireframes/pages.js`, and the kit builds the HTML from it:

```
node templates/wireframe/build.js work/ST-001/wireframes/pages.js
node templates/wireframe/test.js work/ST-001/wireframes
```

If the spec changes, edit `pages.js` and build again. Screenshots from the test go in `work/<story-id>/wireframe-shots/` (not tracked by git). Add `--ds <folder>` if the design system clone is somewhere else.

## What's in here

```
AGENTS.md                the team, the pipeline and the shared rules
CLAUDE.md                imports AGENTS.md for Claude Code
.claude/agents/          the eight agents
.claude/hooks/           guards that stop Sion and Tesni committing, pushing or writing outside work/
context/                 design system pointer, codebase map, WCAG and axe reference, content design reference
templates/               brief, wireframe kit, dev workspace and patch scripts, axe runner
work/                    one folder per story (your inputs and their outputs)
```
