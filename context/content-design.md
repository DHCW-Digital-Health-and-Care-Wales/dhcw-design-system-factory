# Content design context: GOV.UK, NHS and Welsh-language guidance

Context for Carys Copy. Read from the sources listed in section 11 on 18 October 2026. Where sources disagree, section 1 says which wins.

---

## 1. Which guidance wins

1. **The DHCW design system's `.agent/design-system-rules.md`**: its content rules for components (labels, hints, errors, buttons) and its Welsh section.
2. **The NHS digital service manual content guide** (`service-manual.nhs.uk/content`): our house style for health content.
3. **The GOV.UK style guide and service manual**: where the NHS guide is silent.
4. **The Welsh Language Commissioner and Digital Service Standard for Wales**: for everything about Welsh. These set a legal and policy floor, so they override the others on language.

Known differences, and how this factory settles them:

| Topic | NHS | GOV.UK | We use |
|---|---|---|---|
| Sign in | "log in" | "sign in" | **log in** (NHS) |
| Contractions | "cannot", "do not"; avoid negative contractions | same, but "you're", "we'll" are fine | **No negative contractions.** Simple positive ones ("you'll", "we'll") are fine |
| Question headings | Not as questions, except on question pages | Questions allowed | **Questions on question pages only** |
| Link text "See", "read", "view" | Acceptable | Front-load specific terms | Both: specific, front-loaded, and these verbs are fine |
| Time | `5pm`, `5:30pm` | `5pm`, `5:30pm` | Same |
| Telephone | "phone", "call" | "telephone" in labels | **phone** |
| Bullets | Lead-in, lower case, no end punctuation, six or fewer | Same, no limit | NHS rules |
| Page `<title>` | h1 + site name, en dash | h1 - service - GOV.UK | Follow `journey.md`; h1 first, then service name |

## 2. Content design process

GOV.UK's four principles apply to every story:

1. **Begin with user needs.** Say what users need to do or find out, then design content for that need. Not the organisation's need to tell them something.
2. **Decide the amount, format and location.** Cut, split, move or remove before you write more. Sometimes the answer is no new content, or a different channel.
3. **Write clear, accessible content** to the style rules below.
4. **Maintain it.** Content has an owner and a review date.

Working rules from the GOV.UK service manual:

- **Content first.** Start with less. Add help text only if research shows people need it. "If you have to explain your interface, it needs more work." Fix the interface, not the copy.
- **Design for scanning.** One idea per sentence, important words first.
- **Use users' language.** Test which words work with them. Search terms and call-centre scripts show the words people use.
- **Test content with real people**, including people with low health literacy. NHS guidance does not recommend readability scores as proof; use them only to decide what to review first.
- **Review by someone else** before it goes forward (the "2i" habit). The author never signs off their own copy.
- **Keep every channel consistent**: online, SMS, email, letter, paper, call-centre scripts, confirmation messages.

## 3. Voice and tone (NHS)

- Neutral and factual, authoritative but calm and reassuring. Personal, not formal. Empower, don't talk down.
- Address the reader as **"you"**. Users speaking use "I", "me", "my". Use "they" for one unnamed person, never "he or she".
- **Avoid "should"**; it sounds patronising. Say what to do: "Talk to your doctor about…", not "Your doctor will tell you…".
- **Reassure with balanced wording**: "can cause side effects, but many people have none or only minor ones."
- **Match tone to the moment.** Serious topics (a diagnosis): direct, serious, reassuring. Lifestyle topics: encouraging and conversational. Errors and failures: no humour, no "oops", no apology in validation messages. If the whole service fails, apologise briefly and say what to do next.
- Organisations don't do things; people do. "Hospital staff will try to arrange a new one", not "the Health Board will…".
- No metaphors. No subjective words ("easy", "good", "bad") unless users say them or evidence supports them. Use precise figures ("You'll get an appointment within 4 weeks", not "soon").
- Usually leave out "please", "please note", "thank you", "sorry". "Application complete" is better than a thank-you.

## 4. Plain English and health literacy

- Over 4 in 10 adults struggle with public health content; over 6 in 10 struggle with content that uses numbers. Write for them, and everyone benefits.
- **Reading age 9 to 11**; make complex medical information followable by 11 to 14-year-olds.
- **Sentences of 20 words or fewer** (GOV.UK: split anything over 25). **Paragraphs of 3 sentences or fewer.** Active voice. Short words ("have" or "get", not "experience").
- **Plain English first, then the medical term**: "piles (haemorrhoids)". Explain any term that isn't commonly known.
- Front-load: the point or the action in the first words of a heading, sentence, link and bullet.
- Don't use tooltips for important information; they aren't accessible.

### Word choices (NHS A to Z, GOV.UK style guide)

| Use | Not |
|---|---|
| medicines | medication, drugs |
| pharmacy | chemist |
| log in | sign in |
| phone, call | telephone, ring, dial |
| text message | SMS |
| usually | normally |
| ask for | seek |
| carry on | persist |
| feeling sick, being sick | nausea, vomiting |
| sudden, short-term; for a long time | acute; chronic |
| more than; too much | exceed; excessive |
| try to | try and |
| use, put on, rub in | apply |
| does not mix with | interaction |
| health record | medical record |
| select | click, press |
| for example, such as, including | eg, etc, ie |
| carer, trusted person | proxy |
| use | utilise, leverage; delete "in order to" |
| website, service | portal, hub, one-stop shop |

Also avoid: "occur", "clinician" (say what they do: nurse, GP), "FAQs", "pledge", "N/A" in tables (use "not applicable"), ampersands (except A&E), and full stops in abbreviations (ID, not I.D.).

## 5. Formatting and mechanics

**Case and punctuation**
- Sentence case everywhere: headings, labels, buttons, service names. Capitalise proper nouns only.
- No full stops on labels, buttons, headings or hint text that is a fragment.
- No italics, no underlining, no justified text. Bold only to name an interface element in instructions ("Select **Start**").
- Avoid semicolons and dashes used as pauses. Use "and", not "&".
- UK English spelling.

**Headings**
- One `<h1>`, ideally 65 characters or fewer, describing what the page does. Keywords first, action-oriented ("View your appointments").
- Levels in order, no skipping; avoid h5. Headings describe the text that follows.
- Page titles: unique, front-loaded, 65 characters or fewer, no full stops. Errors prefix the title with "Error: ".

**Links**
- Specific, front-loaded, understandable out of context. Never "click here" or "more information".
- Match the destination page's title where you can.
- Leave the sentence's full stop out of the link.
- Avoid opening new tabs. If you must, add "(opens in new tab)" in the link text.
- Avoid PDFs. If you must, say the type and size: "(PDF, 545KB)".
- When a repeated link is shortened (for example "Change" on check answers), give it visually hidden text saying what it changes.
- Never rely on shape, colour or position: not "the green button".

**Buttons**
- Verb first, say what happens: "Save and continue", "Book appointment". Usually leave off "now".
- One primary button per page (DHCW rule).

**Lists**
- Lead-in line ending in a colon; bullets start lower case, no end punctuation, no "and" or "or" at the end, one sentence at most, six items or fewer, more than one bullet.
- Numbered lists for steps; each step is a full sentence ending in a full stop.

**Numbers, dates, times**
- Numerals for everything except "one" meaning "a". Comma over 999 (1,000). Zero before a decimal (0.25).
- Avoid decimals except money, doses and test results.
- Risk: "1 in 7 people", not "14.3%". Don't mix formats. Say "half" or "1 in 2" over "50%".
- Money: £75, £75.50 (not £75.00). Ranges with "to": "Monday to Friday, 2pm to 6pm". Never hyphens.
- Dates: `6 August 2018`; add the weekday when it helps ("Wednesday 6 August 2018", for appointments). Months in full, because screen readers say "Jan" inconsistently. No ordinals, no comma between month and year.
- Times: `5pm`, `5:30pm`, midnight, midday. Not `5.00pm`, `1730hrs`, `00:00`, `12am`, `12pm`.
- Doses: no space between amount and unit (`250mg`); "one or two 200mg tablets", not "1 or 2 200mg tablets". Write "microgram" in full. Never imperial for doses or infant feeding.
- Temperature: `38C`, no degree symbol, and only for children under 6 months.
- NHS number: `999 123 4567` (3-3-4). Use only fictional test numbers.
- Phone numbers: "phone", never "telephone".

**Abbreviations**
- Spell out on first use on a page, then abbreviate. Do it on every page; people don't carry it over.
- Well known without explanation: NHS, GP, A&E, CT, MRI, UK, PDF, ID.

## 6. Writing for forms and interfaces

- **Ask only what you need.** Check each question has a reason, a user, and a use for the answer. Filter questions send people to the right set.
- **One question per page** where the task is complex or sensitive. Treat the form as a conversation.
- **Labels** say what to enter, in sentence case, no full stop. Every input has a visible label or legend.
- **Hints** only where research shows they're needed: jargon, the format ("For example, 999 123 4567"), what you'll do with the data, the consequence of a choice. Don't add "Select the answer that applies to you" to radios. Do add "Select all that apply" to checkboxes.
- **Don't ask for a title** (Mr, Mrs, Ms). Ask about sex or gender only with a stated reason, and use the right word (section 7).
- **Optional vs required.** Ask only for what you need, so few fields are optional. Where one is, mark it "(optional)" in the label.
- **Errors** (GOV.UK pattern, matches the DHCW system):
  - Describe what happened and tell users how to fix it. Plain, positive, direct.
  - Match the label: label "What is your date of birth?" gives "Enter your date of birth".
  - Be specific. Never "This field is required", "An error occurred" or "Select an option".
  - Same wording beside the field and in the error summary; each must make sense out of context.
  - Avoid "invalid", "illegal", "forbidden", "you forgot", "please", "sorry", "oops".
  - Summary title: "There is a problem".
  - Patterns: empty → "Enter your first name" / "Select yes if…"; too long → "Name must be 35 characters or less"; wrong format → "Enter your NHS number in the correct format, like 999 123 4567".
- **Check answers.** Summary list with "Change" links carrying hidden text. Required before submitting anything important or hard to undo (WCAG 3.3.4).
- **Confirmation.** Brief; say what happens next and when; say how to get help. No thank-you, no celebration for clinical outcomes. Give a reference only if the user will need it.
- **Start pages.** Optional. Say what the service is for, who it's for, what they need, how long it takes. No long eligibility lists; ask eligibility questions instead.
- **Service failures.** Plan the "problem with the service" and "service unavailable" pages: what's wrong, whether work is saved, what to do next, a phone number.
- **Timeouts.** Say how long is left, what happens, and how to carry on. Use real times.
- **Empty states.** Say why it's empty and what the user can do.

## 7. Inclusive content (NHS)

- **Ask, don't assume** how people want to be described. Test wording with the people it describes.
- **Person first**: "people with diabetes", "they have epilepsy", not "diabetics" or "epileptics". Identity terms are fine where people use them ("wheelchair user", "disabled person", "Deaf" capitalised for culture).
- No "suffering from", "afflicted by", "victim of", "confined to a wheelchair", "handicapped". Say "mental health condition", never "mentally ill".
- "People who are homeless", not "the homeless". "Ethnic minorities", not "BAME". Capitalise "Black" and "White" for ethnicity.
- **Gender**: mention sex, gender or sexuality only when relevant. Name the body part for screening ("people with a cervix"). "Sex" for sex-specific topics; "gender" for identity. Use "you" and "they", never "he or she".
- "Carer" or "trusted person", not "proxy".
- Describe skin as "brown and black skin" or "white skin", not "dark" or "fair".
- Use "condition" or "illness" over "disease" or "disorder" except in names.
- Don't assume literacy, vision, hearing, digital confidence, English or Welsh as a first language, or a settled address.

## 8. Welsh language and bilingual content

Everything below is policy and good practice in Wales. The Welsh-language items marked **(verify)** come from search summaries because the original PDFs would not open; check them with DHCW's Welsh language unit or translators before treating them as fixed.

- **Welsh is treated no less favourably than English.** The Welsh Language (Wales) Measure 2011 and the Commissioner's standards make this a legal duty for DHCW. A service that's good in English and clumsy in Welsh breaks it.
- **Bilingual by design**: point 2 of the Digital Service Standard for Wales. Welsh is in from the first story, not added at the end. **(verify)**
- **Publish together.** Welsh and English go live at the same time. Never "Welsh to follow".
- **Write for Welsh from the start.** Drafting English then translating word for word is the usual practice, and 43% of Welsh speakers in 2022 research said public-sector Welsh felt "unnatural" and put them off using it. Draft both languages in the same working session with a Welsh speaker or translator ("trio writing": content designer, translator, and the subject expert). **(verify)**
- **Professional translation.** Never machine-translate clinical or legal content (factory rule). The Commissioner's July 2025 statement says AI doesn't exempt organisations from Welsh duties and Welsh must still be no less favourable. **(verify)** Flawed Welsh on a website has been found a breach (Vale of Glamorgan, March 2026).
- **Welsh must be correct** in grammar, spelling, syntax and tense, and match the English in meaning.
- **Design for longer Welsh**: Welsh is often longer than English. No fixed widths, no truncation, no text in images.
- **Don't build sentences from fragments.** Welsh words change their first letter (mutation) and plural forms depend on number, so strings assembled from variables break. Give translators whole sentences with named placeholders, and separate strings for singular and plural. Don't use "(s)".
- **Same function, same words** in both languages. Keep a term list and use the Welsh form agreed with the translators (for example the NHS Wales terminology). Don't coin terms.
- **`lang` attributes**: `cy` for Welsh, `en` for English passages inside Welsh pages, so screen readers pronounce them correctly (WCAG 3.1.1, 3.1.2).
- **Dates, times, numbers** follow Welsh conventions in Welsh pages; ask the translators to confirm the format, and don't convert by script.
- **Equal prominence.** The language switch is in the same place on every page; Welsh and English content have equal weight, quality and detail. Where a message links away, link to the Welsh page.
- **Search, emails, SMS and letters** exist in both languages; SMS length limits (160 characters) apply to Welsh too, and accented characters (â, ê, ô, ŵ, ŷ) can count as two, so test the Welsh length.
- Mark missing Welsh as `[CY: needs translation]` (factory rule).

## 9. Messages (SMS, email, NHS App, letters)

- Open with "Dear" and the person's name (SMS: first or full name, no "Hi"). Use a sender name people recognise, consistent across channels.
- Greet the patient, not the carer, for adults. For children, greet the parent or carer and include an identifier such as the child's name.
- SMS: 160 characters including spaces. NHS App: key information first, since some people only read the opening. Email: short, specific subject line. Letters: only when digital won't do.
- **One call to action.** If there are several, say which is first.
- **Phishing resistance**: link only to trusted sites (NHS.UK, GOV.UK), no URL shorteners, no personal information in a link, never ask for personal details in the body of an email, reference something familiar (an appointment), proofread. People distrust errors.

## 10. Content checklist

Run before handing over:

- [ ] Every page has a user need and a task, and a reason to exist.
- [ ] One `<h1>`; page title unique and front-loaded.
- [ ] Reading age 9 to 11; sentences 20 words or fewer; active voice; "you".
- [ ] No jargon, no "please", "should", "click", "eg", "etc".
- [ ] Every error says what's wrong and how to fix it; same wording in summary and field.
- [ ] Links make sense out of context; no "click here".
- [ ] Dates, times, numbers, doses in house format.
- [ ] Every string has English and Welsh; no fragments assembled from parts; Welsh length allowed for.
- [ ] Clinical content has a named clinical reviewer (or is an open question).
- [ ] Wording matches the story's `Then I am told …` steps.

## 11. Sources

- GOV.UK [A to Z style guide](https://guidance.publishing.service.gov.uk/writing-to-gov-uk-standards/style-guides/a-to-z-style-guide/) and [content design principles](https://guidance.publishing.service.gov.uk/writing-to-gov-uk-standards/plan-manage-content/understand-content-design/)
- GOV.UK Service Manual [Writing for user interfaces](https://www.gov.uk/service-manual/design/writing-for-user-interfaces); GOV.UK Design System [Error message](https://design-system.service.gov.uk/components/error-message/)
- NHS digital service manual: [Content guide](https://service-manual.nhs.uk/content), [How we write](https://service-manual.nhs.uk/content/how-we-write), [Voice and tone](https://service-manual.nhs.uk/content/voice-and-tone), [Health literacy](https://service-manual.nhs.uk/content/health-literacy), [A to Z of NHS health writing](https://service-manual.nhs.uk/content/a-to-z-of-nhs-health-writing), [Formatting](https://service-manual.nhs.uk/content/formatting), [Numbers, measurements, dates and time](https://service-manual.nhs.uk/content/numbers-measurements-dates-time), [Writing NHS messages](https://service-manual.nhs.uk/content/writing-nhs-messages), [Inclusive content](https://service-manual.nhs.uk/content/inclusive-content), [Forms: supporting content](https://service-manual.nhs.uk/content/how-to-write-good-questions-for-forms/write-the-supporting-content-for-your-form)
- Welsh Language Commissioner: [Bilingual design guide](https://www.welshlanguagecommissioner.wales/media/pzedsr4l/dylunio-dwyieithog-bilingual-design.pdf), [Delivering Welsh language services](https://www.welshlanguagecommissioner.wales/support-resources/public-organisations/delivering-services-in-welsh/delivering-welsh-language-services), [trio writing case study](https://www.welshlanguagecommissioner.wales/media/ppfnjjcr/trio-writing-case-study.pdf)
- Centre for Digital Public Services for Wales: [Digital Service Standard for Wales, point 2](https://digitalpublicservices.gov.wales/node/1065)

**Not read in full.** The Commissioner's PDFs wouldn't open as text; their points here come from search summaries and are marked **(verify)**. The NHS "Make sure you need each question" and sensitive-question pages, and the NHS sub-pages on age, ethnicity and skin symptoms, weren't read. Re-check this file when the NHS or GOV.UK guides change.
