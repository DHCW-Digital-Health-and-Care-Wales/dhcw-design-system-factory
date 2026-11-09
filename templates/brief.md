# Brief — <story-id>

Gethin Gherkin fills this in alongside the story, in `work/<story-id>/brief.md`. A person reviews both **before** Nia Navigation starts. Every field marked *Required* that's left empty becomes a question back to you, not a guess: the cheapest place to fix a misunderstanding is here, not in code review.

---

## 1. Story  *(Required)*

- **Story ID:**
- **Story file:** `work/<story-id>/story.feature`
- **As a** … **I need to** … **so that** … (copied from the feature description)

## 2. Users and context  *(Required)*

- **Audience:** ☐ Public (patients, carers) ☐ Staff (clinical) ☐ Staff (admin/professional)
- **Where and how they use it:** (for example a ward PC shared between shifts, a phone at home, a clinic room with the patient present)
- **Interruptions and time pressure:**
- **Assistive technology or access needs known from research:**
- **Language:** Welsh and English required? ☐ Yes ☐ Not yet (say why)

## 3. Evidence  *(Required — at least one)*

- Research finding, analytics, support tickets or clinical safety input that justifies this work:

## 4. Data

| Field | Source system | Required? | Format and validation | Sensitive? |
|---|---|---|---|---|
| | | | | |

- **Does the user need to see which patient they're working on?** ☐ Yes (Nia and Huw use the patient header) ☐ No

## 5. Where the journey sits  *(for Nia)*

- **Starts from:**
- **Ends at (success):**
- **Ends at (cancel or exit):**
- **Existing pages or services it must sit alongside** (links or screenshots):
- **Service's page title pattern, if it has one:**

## 6. Constraints

- **Template, if already decided:** ☐ Public ☐ Staff dashboard ☐ Let Nia decide
- **Technical constraints** (rendering stack, Nunjucks available, JavaScript allowed):
- **Known non-standard needs** (full-screen dashboard, canvas, embedded third-party app):

## 7. Risk  *(Required for staff-facing clinical work)*

- **What could go wrong for a patient if someone misreads or mis-enters something?**
- **Clinical safety officer consulted?** ☐ Yes ☐ No ☐ Not applicable

## 8. Out of scope

-

---

### What happens next

Nia Navigation maps the journey (`journey.md`), Huw Eye designs each page (`ui-spec.md`), Wendy Wireframe builds clickable wireframes (`wireframes/`) and Ceri Contrast reviews accessibility (`a11y-review.md`). Sion Sass (Component Developer) then builds it in a fresh copy of the design system, and Tesni Test (Quality Assurer) writes and runs the tests. Nothing is committed or pushed by the agents: a person reviews the patch.
