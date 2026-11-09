# Accessibility context: WCAG 2.2 and axe-core

Context for Ceri Contrast. Everything here is checked against:
- **WCAG 2.2** (W3C Recommendation), the standard UK public sector services must meet at level AA.
- **axe-core 4.14.0** (rule definitions read from `dequelabs/axe-core`, 15 October 2026). The DHCW design system's tests use `@axe-core/playwright` ^4.13.
- **DHCW design system tokens** at `main`, 17 October 2026. Contrast ratios below were calculated from the token values.

Re-check the axe version and rule list when you upgrade `@axe-core/playwright`.

---

## 1. What automated testing can and can't tell you

axe finds problems it can prove from the DOM: missing names, invalid ARIA, contrast of plain text on flat backgrounds, missing `lang`. A clean axe run is **necessary but nowhere near sufficient**. Most WCAG criteria need a person to judge them: whether alt text is meaningful, whether focus order makes sense, whether error messages help, whether the page works at 400% zoom, whether a screen reader announces changes.

So every review produces two lists: what axe found, and the manual checks still owed (section 4 says which).

## 2. How to run axe in this factory

Ask for every WCAG A and AA tag, including WCAG 2.2, plus best practices:

```js
const AxeBuilder = require('@axe-core/playwright').default;

const results = await new AxeBuilder({ page })
  .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
  .analyze();
```

Why each part matters:

- **`wcag22aa` is the only tag that turns on `target-size`** (WCAG 2.5.8). That rule is off by default, but asking for its tag runs it. The DHCW design system's own `specs/e2e/accessibility.spec.js` asks for `wcag2a, wcag2aa, wcag21a, wcag21aa` only, so **target size is never tested there**. Raise this with the design system team.
- **`best-practice`** adds 27 rules that aren't WCAG failures but catch real problems: one `<h1>` per page, heading levels in order, landmarks, skip link target, positive `tabindex`.
- Experimental and deprecated rules stay off unless named. Don't add them to CI.
- `color-contrast-enhanced` (AAA) is off by default. Run it as advisory only; never fail a build on it.
- Run axe on **every state**, not just the first load: after submitting with errors, with conditional content revealed, with the timeout modal open, in Welsh, and at mobile width.

### Turning axe results into findings

| axe impact | Factory severity | Meaning |
|---|---|---|
| critical | Blocker | Stops some users completing the task. Don't merge. |
| serious | Blocker | Serious barrier. Don't merge without a dated fix. |
| moderate | Should fix | Fix in this story if possible. |
| minor | Nit | Log it. |

Best-practice failures are "should fix" at most, except `page-has-heading-one`, `landmark-one-main` and `skip-link`, which DHCW's own rules make mandatory, so treat them as blockers.

## 3. axe rules by WCAG criterion

Rules that run with the tags above. Level A and AA only.

| WCAG criterion | axe rules |
|---|---|
| 1.1.1 Non-text content (A) | `image-alt`, `input-image-alt`, `object-alt`, `role-img-alt`, `svg-img-alt`, `aria-meter-name`, `aria-progressbar-name` |
| 1.2.2 Captions (A) | `video-caption` |
| 1.3.1 Info and relationships (A) | `list`, `listitem`, `definition-list`, `dlitem`, `td-headers-attr`, `th-has-data-cells`, `aria-required-children`, `aria-required-parent`, `aria-hidden-body` |
| 1.3.5 Identify input purpose (AA) | `autocomplete-valid` |
| 1.4.1 Use of colour (A) | `link-in-text-block` |
| 1.4.2 Audio control (A) | `no-autoplay-audio` |
| 1.4.3 Contrast minimum (AA) | `color-contrast` |
| 1.4.4 Resize text (AA) | `meta-viewport` |
| 1.4.12 Text spacing (AA) | `avoid-inline-spacing` |
| 2.1.1 Keyboard (A) | `scrollable-region-focusable`, `frame-focusable-content`, `server-side-image-map` |
| 2.2.1 Timing adjustable (A) | `meta-refresh` |
| 2.2.2 Pause, stop, hide (A) | `blink`, `marquee` |
| 2.4.1 Bypass blocks (A) | `bypass` |
| 2.4.2 Page titled (A) | `document-title` |
| 2.4.4 Link purpose in context (A) | `link-name`, `area-alt` |
| 2.5.3 Label in name (A) | `label-content-name-mismatch` |
| 2.5.8 Target size minimum (AA) | `target-size` (only with `wcag22aa`) |
| 3.1.1 Language of page (A) | `html-has-lang`, `html-lang-valid`, `html-xml-lang-mismatch` |
| 3.1.2 Language of parts (AA) | `valid-lang` |
| 3.3.2 Labels or instructions (A) | `form-field-multiple-labels` |
| 4.1.2 Name, role, value (A) | `button-name`, `input-button-name`, `label`, `select-name`, `link-name`, `summary-name`, `nested-interactive`, `duplicate-id-aria`, `frame-title`, `frame-title-unique`, `aria-allowed-attr`, `aria-braille-equivalent`, `aria-command-name`, `aria-conditional-attr`, `aria-deprecated-role`, `aria-hidden-focus`, `aria-input-field-name`, `aria-prohibited-attr`, `aria-required-attr`, `aria-roles`, `aria-tab-name`, `aria-toggle-field-name`, `aria-tooltip-name`, `aria-valid-attr`, `aria-valid-attr-value` |

**Best-practice rules** (with the `best-practice` tag): `accesskeys`, `aria-allowed-role`, `aria-dialog-name`, `aria-text`, `aria-treeitem-name`, `empty-heading`, `empty-table-header`, `frame-tested`, `heading-order`, `image-redundant-alt`, `label-title-only`, `landmark-banner-is-top-level`, `landmark-contentinfo-is-top-level`, `landmark-main-is-top-level`, `landmark-no-duplicate-banner`, `landmark-no-duplicate-contentinfo`, `landmark-no-duplicate-main`, `landmark-one-main`, `landmark-unique`, `meta-viewport-large`, `page-has-heading-one`, `presentation-role-conflict`, `region`, `scope-attr-valid`, `skip-link`, `table-duplicate-name`, `tabindex`.

## 4. WCAG 2.2 A and AA: what needs a person

✅ = axe covers it well · ◐ = axe catches some failures, a person must check the rest · ✋ = manual only

### Perceivable

| Criterion | Level | Check | |
|---|---|---|---|
| 1.1.1 Non-text content | A | Images have meaningful alt text; decorative ones are hidden | ◐ axe finds missing alt, not bad alt |
| 1.2.1–1.2.5 Time-based media | A/AA | Captions, transcripts, audio description for any video or audio | ◐ |
| 1.3.1 Info and relationships | A | Headings, lists, tables, labels and groups are in the markup, not just visual | ◐ |
| 1.3.2 Meaningful sequence | A | Reading order matches visual order | ✋ |
| 1.3.3 Sensory characteristics | A | Instructions don't rely on shape, position or colour ("the green button") | ✋ |
| 1.3.4 Orientation | AA | Works in portrait and landscape | ✋ |
| 1.3.5 Identify input purpose | AA | `autocomplete` on personal-data fields (name, email, date of birth) | ◐ axe checks values are valid, not that they're present |
| 1.4.1 Use of colour | A | Colour never the only signal (tags, errors, status) | ◐ |
| 1.4.2 Audio control | A | No autoplaying sound | ✅ |
| 1.4.3 Contrast (minimum) | AA | Text 4.5:1; large text 3:1 | ◐ axe can't check text over images, gradients or in some states |
| 1.4.4 Resize text | AA | Usable at 200% text size | ◐ |
| 1.4.5 Images of text | AA | No text baked into images | ✋ |
| 1.4.10 Reflow | AA | No sideways scrolling at 320 CSS px (400% zoom) | ✋ |
| 1.4.11 Non-text contrast | AA | Borders of inputs, focus indicators, icons and states 3:1 against neighbours | ✋ |
| 1.4.12 Text spacing | AA | Nothing breaks with increased line, letter and word spacing | ◐ |
| 1.4.13 Content on hover or focus | AA | Tooltips and popovers can be dismissed, hovered and stay put | ✋ |

### Operable

| Criterion | Level | Check | |
|---|---|---|---|
| 2.1.1 Keyboard | A | Everything works with a keyboard alone | ◐ |
| 2.1.2 No keyboard trap | A | Focus can always leave a component (date picker, modal) | ✋ |
| 2.1.4 Character key shortcuts | A | Single-key shortcuts can be turned off or remapped | ✋ |
| 2.2.1 Timing adjustable | A | Users are warned before a session times out and can extend it | ◐ |
| 2.2.2 Pause, stop, hide | A | Moving or auto-updating content can be paused | ◐ |
| 2.3.1 Three flashes | A | Nothing flashes more than 3 times a second | ✋ |
| 2.4.1 Bypass blocks | A | Skip link to `#maincontent` | ✅ |
| 2.4.2 Page titled | A | Unique, descriptive `<title>`, "Error: " prefix when errors show | ◐ axe checks it exists, not that it's useful |
| 2.4.3 Focus order | A | Tab order follows the page's meaning | ✋ |
| 2.4.4 Link purpose (in context) | A | Link text makes sense ("View or change", not "Click here") | ◐ |
| 2.4.5 Multiple ways | AA | More than one way to find a page (navigation, search) — not for steps in a process | ✋ |
| 2.4.6 Headings and labels | AA | Headings and labels describe their content | ✋ |
| 2.4.7 Focus visible | AA | Every focusable element shows focus | ✋ |
| 2.4.11 Focus not obscured (minimum) | AA | **New in 2.2.** Focused element isn't hidden by sticky headers, bottom nav or cookie banners | ✋ |
| 2.5.1 Pointer gestures | A | Multi-point or path gestures have a single-tap alternative | ✋ |
| 2.5.2 Pointer cancellation | A | Actions fire on release, not press | ✋ |
| 2.5.3 Label in name | A | Accessible name contains the visible label | ✅ |
| 2.5.4 Motion actuation | A | Shake or tilt actions have alternatives | ✋ |
| 2.5.7 Dragging movements | AA | **New in 2.2.** Anything draggable also works by clicking (for example reordering lists) | ✋ |
| 2.5.8 Target size (minimum) | AA | **New in 2.2.** Targets at least 24×24 CSS px, or spaced so a 24px circle doesn't overlap another target | ◐ only with `wcag22aa` |

### Understandable

| Criterion | Level | Check | |
|---|---|---|---|
| 3.1.1 Language of page | A | `<html lang="en">` or `lang="cy"` | ✅ |
| 3.1.2 Language of parts | AA | Welsh passages in English pages (and the reverse) marked with `lang` | ◐ axe checks values, not that Welsh text is marked |
| 3.2.1 On focus | A | Focusing something doesn't change context | ✋ |
| 3.2.2 On input | A | Changing a field doesn't submit or navigate unexpectedly | ✋ |
| 3.2.3 Consistent navigation | AA | Navigation in the same place and order on every page | ✋ |
| 3.2.4 Consistent identification | AA | Same function, same name everywhere | ✋ |
| 3.2.6 Consistent help | A | **New in 2.2.** Help links or contact details in the same place on every page | ✋ |
| 3.3.1 Error identification | A | Errors identified in text, linked from an error summary | ✋ |
| 3.3.2 Labels or instructions | A | Every field has a visible label; formats explained in hints | ◐ |
| 3.3.3 Error suggestion | AA | Error messages say how to fix the problem | ✋ |
| 3.3.4 Error prevention (legal, financial, data) | AA | Check answers page before submitting important data | ✋ |
| 3.3.7 Redundant entry | A | **New in 2.2.** Don't make users re-enter what they've already given in the same journey | ✋ |
| 3.3.8 Accessible authentication (minimum) | AA | **New in 2.2.** No memory or puzzle test to sign in; allow paste and password managers | ✋ |

### Robust

| Criterion | Level | Check | |
|---|---|---|---|
| 4.1.2 Name, role, value | A | Custom controls expose name, role and state | ◐ axe finds missing names, not wrong states |
| 4.1.3 Status messages | AA | Updates that don't move focus (character count, "Saved", search results) are announced via a live region | ✋ |

WCAG 4.1.1 Parsing was removed in WCAG 2.2; axe's `duplicate-id` rules that tested it are deprecated.

## 5. DHCW colour tokens: calculated contrast

| Pairing | Ratio | Needs | Result |
|---|---|---|---|
| Primary text #212b32 on grey page #f0f4f5 | 13.02:1 | 4.5:1 | Pass |
| Secondary text #4c6272 on grey page | 5.75:1 | 4.5:1 | Pass |
| Link #005aa8 on grey page / white | 6.26:1 / 6.94:1 | 4.5:1 | Pass |
| Link hover #7c2855 / visited #330072 on grey | 8.27:1 / 13.70:1 | 4.5:1 | Pass |
| White on primary button #1b365d (hover #32598a) | 12.12:1 (7.16:1) | 4.5:1 | Pass |
| White on secondary button #4c6272 | 6.37:1 | 4.5:1 | Pass |
| White on delete button #d5281b | 5.06:1 | 4.5:1 | Pass |
| Primary text on exceptional button #f5bb6b | 8.38:1 | 4.5:1 | Pass |
| White text on blue page #1b365d | 12.12:1 | 4.5:1 | Pass |
| White on site header #005eb8 | 6.38:1 | 4.5:1 | Pass |
| Link on footer #d8dde0 | 5.07:1 | 4.5:1 | Pass |
| Error red #d5281b on white / on grey page | 5.06:1 / **4.57:1** | 4.5:1 | Pass, narrowly on grey |
| Focus text on focus yellow #ffeb3b | 11.81:1 | 4.5:1 | Pass |
| Input border #4c6272 on white | 6.37:1 | 3:1 | Pass |
| Exceptional button #f5bb6b against blue page | 7.04:1 | 3:1 | Pass |
| **Interrupt button #364a73 against blue page #1b365d** | **1.38:1** | 3:1 | **Fail** |
| **Focus yellow #ffeb3b alone on white / grey** | **1.22:1 / 1.10:1** | 3:1 | **Fail unless paired with a dark indicator** |
| Grey border #d8dde0 on white / grey | 1.37:1 / 1.24:1 | 3:1 | Fail — fine for decorative dividers only |

What that means in practice:

- **Error red on grey is right at the limit.** Don't use it for anything smaller or lighter than standard error text, and never on a darker background.
- **Don't use the interrupt button colour on the blue background.** The guidance already says to use the exceptional button there; this is why.
- **Focus styles on light backgrounds need the dark part.** Links and buttons pair yellow with a dark #212b32 bar, and inputs add a dark inset border, which passes. Components that use the yellow-only `nhsw-focus-ring` mixin (date picker buttons and calendar days, error summary, search, bottom nav, header) are fine on dark backgrounds (yellow on header blue is 5.22:1) but **need a manual 1.4.11 check wherever they sit on white or grey**.
- **Never use the grey border for anything users need to see to operate**, such as an input or card boundary that signals it's clickable.

## 6. Health and DHCW-specific checks

Always check these, whatever the story:

- **Welsh:** `lang="cy"` on Welsh pages, `lang` on mixed-language passages, translated built-in strings ("Back", "There is a problem", hidden "Error:" prefix), and layouts that survive longer Welsh text.
- **Error pattern:** error summary focused on load, titled "There is a problem", each link moves focus to its field, page `<title>` starts "Error: ", entered values kept.
- **Conditional reveals:** the design system flags that screen reader users aren't always told when a radio or checkbox reveal appears (4.1.2). Keep revealed questions simple, and test them with a screen reader.
- **Session timeout:** the timeout modal must warn before expiry, let users extend, trap focus while open and return it afterwards (2.2.1, 2.1.2).
- **Patient identity:** the patient header is readable by screen readers as a description list and stays visible when the page scrolls without hiding focused content (2.4.11).
- **Staff systems:** dense tables and small buttons still need 24px targets (2.5.8) and keyboard access to every row action.
- **Sticky and fixed elements:** bottom nav, cookie banner and sticky headers must not cover focused elements (2.4.11). Pages with bottom nav need `nhsw-has-bottom-nav` on `<body>`.

## 7. Manual test kit

The smallest set of manual checks that catches most remaining problems:

1. **Keyboard only:** tab through the whole journey; check focus is always visible, never hidden, never trapped, and in a sensible order.
2. **Screen reader:** NVDA with Firefox or Chrome on Windows (most common in NHS Wales); VoiceOver with Safari on iOS for public services. Check headings list, form labels, errors and status messages.
3. **Zoom:** 200% text-only zoom, then 400% browser zoom at 1280px wide (equivalent to 320px).
4. **Text spacing:** apply the WCAG text-spacing bookmarklet and check nothing is cut off.
5. **Windows high contrast / forced colours:** focus and borders still visible.
6. **Welsh:** switch language and repeat checks 1 and 2 on the main pages.
