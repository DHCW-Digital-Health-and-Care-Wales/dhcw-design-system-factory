# DHCW design system — factory notes

Agents take the design system's rules from the DHCW repository itself, not from a copy kept here. This file records which version and location we use, and what's specific to this factory. The team and pipeline are described in `AGENTS.md`.

## Which version and where to read the rules

- **Release tag (`DS_TAG`):** `v0.1.104`, the latest release when this was set (23 October 2026). Moved from `v0.1.70`.
- **Repository:** https://github.com/DHCW-Digital-Health-and-Care-Wales/dhcw-design-system
- **Rules:** `https://github.com/DHCW-Digital-Health-and-Care-Wales/dhcw-design-system/tree/v0.1.104/.agent`
  - `design-system-rules.md` — tokens, type, spacing, templates, component guidance, accessibility, Welsh
  - `component-registry.md` — classes and modifiers
- **Macro params:** `src/components/<name>/<name>.yaml` at the same tag.
- **Without a local clone, read the files from GitHub:** `https://raw.githubusercontent.com/DHCW-Digital-Health-and-Care-Wales/dhcw-design-system/v0.1.104/.agent/design-system-rules.md`, the same path with `component-registry.md`, and `…/v0.1.104/src/components/<name>/<name>.yaml`. Fetch these raw links rather than the GitHub web pages, which don't return the plain text.
- **Local copy:** the clone next to this repository, `..\nhsw-component-library`, holds the same files when it is on `main` at `v0.1.104` or later (`git checkout main` then `git pull`). Agents may read it instead of the web, which is faster and works offline. Claude Code may ask you to approve reading outside this folder, or you can start it with `--add-dir ..\nhsw-component-library`.
- **Guidance site:** https://dhcw-digital-health-and-care-wales.github.io/dhcw-design-system/ — decides *when to use* a component. The code decides *what exists*. The published site can lag the code: at `v0.1.70` it lists 28 components, while the code also has Timeout, Date picker and others.

When you upgrade the design system, change `DS_TAG` here in the same change.

**For the development and test agents:** they don't use the sibling clone. Sion Sass (Component Developer) and Tesni Test (Quality Assurer) work in their own fresh copy under `work/<story-id>/build/`, made by `templates/dev/setup-workspace.js`, and start from `context/design-system-codebase.md`.

## Compiled files

From `v0.1.70`, `dist/nhsw.css` and `dist/nhsw.min.css` are current builds. Earlier releases ship an old, incomplete `dist/nhsw.css`. Wendy's wireframes load their styles from `preview/dist/`, which has always been current.

## Factory defaults where the design system is silent

- **Welsh:** every service is bilingual from the first story. Welsh text comes from professional translation, never machine translation, for clinical or legal content.
- **Patterns not yet published** (check answers, confirmation, question pages, session timed out): use the NHS.UK service manual patterns and log the gap.
- **Language switch:** not in the published guidance or the code at `v0.1.70`. ST-002 proposes one (a single link in the header's top row, or the dashboard's top bar, with Welsh pages under `/cy`), and wireframes show that proposal until the design system team decides.
- **Accessibility testing:** run axe with the WCAG 2.2 tags in `context/wcag-axe.md`, which include the `target-size` check the design system's own tests currently leave out.
- **Contact for gaps and contributions:** design.system@wales.nhs.uk
