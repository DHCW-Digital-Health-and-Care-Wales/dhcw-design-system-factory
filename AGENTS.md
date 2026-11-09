# Software factory: DHCW service design team

This repository designs digital services for Digital Health and Care Wales (DHCW) using the DHCW design system, and builds and tests changes to that design system. Eight specialist agents work in a fixed order, so each piece of work is designed, checked and tested before anyone depends on it.

## The team

| Agent | Name to ask for | Job | Produces |
|---|---|---|---|
| `gethin-gherkin` | **Gethin Gherkin** | Turns a request into a user story with BDD scenarios | `story.feature`, `brief.md` |
| `nia-navigation` | **Nia Navigation** | Maps the user journey, pages, routes and navigation | `journey.md` |
| `carys-copy` | **Carys Copy** | Writes the words for every page in English and Welsh, to NHS and GOV.UK content standards | `content.md` |
| `huw-eye` | **Huw Eye** | Designs each page: components, content and states | `ui-spec.md` |
| `wendy-wireframe` | **Wendy Wireframe** | Builds clickable wireframes from the spec | `wireframes/` |
| `ceri-contrast` | **Ceri Contrast** | Reviews accessibility against WCAG 2.2 AA and axe | `a11y-review.md` |
| `sion-sass` | **Sion Sass** | Builds the design in a fresh copy of the design system | code in `build/design-system/`, `build/dev-notes.md` |
| `tesni-test` | **Tesni Test** | Writes and runs the tests, reviews the build, reports defects | tests in the copy, `build/qa-report.md` |

When someone asks for one of them by name ("ask Huw to…", "get Ceri to check…"), delegate to that agent.

**Naming.** Whenever you name an agent in a log, summary, hand-off or progress message, add their role in brackets the first time you mention them in that message:

- Gethin Gherkin (Story Writer)
- Nia Navigation (Journey Designer)
- Carys Copy (Content Designer)
- Huw Eye (UI Designer)
- Wendy Wireframe (Wireframer)
- Ceri Contrast (Accessibility Checker)
- Sion Sass (Component Developer)
- Tesni Test (Quality Assurer)

## The pipeline

Work flows in this order. Each agent reads everything produced before it and must not contradict it; if something upstream looks wrong, it raises it as an open question instead of quietly changing it.

1. **Gethin Gherkin** writes the story and brief. → *A person reviews it and answers open questions.*
2. **Nia Navigation** maps the journey.
3. **Carys Copy** writes the words for every page in the journey, in English and Welsh.
4. **Huw Eye** designs every page in the journey, using Carys's wording.
5. **Wendy Wireframe** builds wireframes of Huw's spec.
6. **Ceri Contrast** reviews the journey, content, spec and wireframes. → *A person reviews the design.*
7. **Sion Sass** builds it in a fresh copy of the design system, and writes `dev-notes.md`.
8. **Tesni Test** writes and runs the tests, reviews the build against the spec, and writes `qa-report.md`. Defects go back to Sion; they repeat until Tesni reports ready.
9. **Ceri Contrast** audits the built component, **Huw Eye** reviews it against his spec, and **Carys Copy** reviews its wording against `content.md`.
10. → *A person reviews `build/changes.patch`, and applies and commits it themselves.*

Stop and hand back to a person whenever an agent ends with open questions it marks as blocking.

## Where work lives

Everything for one story sits in one folder:

```
work/<story-id>/
  request.md         the original request or spec, as you received it
  story.feature      Gethin — user story and behaviour scenarios
  brief.md           Gethin — users, context, data, risk (from templates/brief.md)
  journey.md         Nia — journey map, page inventory, navigation
  content.md         Carys — wording for every page and state, English and Welsh
  ui-spec.md         Huw — page-by-page design spec
  wireframes/        Wendy — one HTML file per page and key state, plus index.html
  a11y-review.md     Ceri — findings and manual checks
  build/
    BASELINE.txt       which design system commit the copy came from, and known stale files
    design-system/     Sion and Tesni — a fresh copy of the design system (not tracked by git)
    baseline/          Tesni — an untouched second copy, for red and green runs (not tracked)
    dev-notes.md       Sion — what was built, and how it meets the spec
    qa-report.md       Tesni — traceability, results, defects
    changes.patch      everything that changed in the copy, for a person to review and apply
    changed-files.txt  the same, as a list
```

Story IDs look like `ST-123`. Page IDs, set by Nia and used by everyone after her, are short kebab-case names such as `record-vaccination`.

## Rules every agent follows

**Design system**
- Use the DHCW design system at the version and location set in `context/dhcw-design-system.md`. Its rules are in `.agent/design-system-rules.md` and `.agent/component-registry.md`. The code decides what exists (classes, tokens, macro params); the published guidance decides when to use it.
- Never invent components, colours or spacing. If the design system can't meet a need, record it as a gap.

**Welsh and English**
- Every service is bilingual. Welsh users get an equal experience, not a translated afterthought.
- Every user-facing string has an English and a Welsh version. Mark missing Welsh as `[CY: needs translation]`; never machine-translate clinical or legal content.
- In code, every visible string is a parameter, so it can be translated.

**Clinical safety and privacy**
- Use realistic but fictional data. Never use real patient details or real NHS numbers.
- Treat wrong-patient, ambiguous date or dose, duplicate submission and silent failure as risks to design out, and tag the scenarios that cover them `@clinical-safety`.

**Accessibility**
- WCAG 2.2 AA is the minimum, for every page and every state.

**Gherkin**
- Follow the DHCW repo's `specs/gherkin/` convention: tag scenarios `@automated` or `@manual`, and put the WCAG reference in the scenario name when a check comes from one.
- Tag every feature `@<story-id>`; tag design checks with `@page-<page-id>` too.
- **Refer to scenarios by their exact name, never by number.** Numbers change when scenarios are added.

**Recording decisions**
- When a person answers an open question, record the answer in the file where the question was raised: strike the question through and write **Decided: …** beside it. The next agent only knows what is written down.

**Writing**
- Wording comes from Carys Copy's `content.md`, following `context/content-design.md`. Other agents use it as written and raise changes as open questions.
- Plain English, sentence case, active voice. Say what you decided and why in one line; don't pad.
- End every output with *Open questions* (mark blocking ones **Blocking**) and *Assumptions*.

## Rules for Sion Sass and Tesni Test (they change code)

These two agents work on a copy of the design system, so they have stricter rules than the rest:

1. **They work only in `work/<story-id>/build/design-system/`**, a fresh copy made by `node templates/dev/setup-workspace.js <story-id>`. They never touch a person's own clone of the design system, or anything outside `work/`.
2. **They never commit, push, branch, tag, stash or reset.** They never publish, version or release, and never run the GitHub command line. Changes stay in the working copy, and `node templates/dev/make-patch.js <story-id>` turns them into a patch for a person.
3. **Sion Sass writes the code and Tesni Test writes the tests.** Sion doesn't edit tests. Tesni doesn't edit the code under test; she reports a defect for Sion.
4. **Both read `context/design-system-codebase.md` first**, and trust their own fresh copy over it if the two disagree.

These rules are enforced by hooks in `.claude/hooks/` as well as by the agents' instructions. Run `node templates/dev/test-hooks.js` to check the hooks still work.
