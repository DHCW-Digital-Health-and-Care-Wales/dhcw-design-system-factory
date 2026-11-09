# PRISM (product-reporting-ui): what exists today

For stories that change PRISM's screens. Read from the repository at `C:\Users\jo126787\source\repos\DHCW-Digital-Health-and-Care-Wales\product-reporting-ui`, branch `feature/dashboard-widgets-and-config`, commit `c79e2a3`. Everything marked **(code)** was read from source. Everything marked **(inferred)** is a reading of the code that a person should confirm.

## What it is

- **(code)** A .NET 10 Blazor Web App (interactive server) that shows delivery, team and feedback dashboards for DHCW products and teams. The service name in the header is "Project Reporting and Integrated Systems Management System"; the home page heading is "Product Reporting Intelligence and Strategic Management". People call it PRISM.
- **(code)** Projects: `Web` (pages), `Widgets` (dashboard widgets), `ViewModels`, `Contracts` (DTOs), `ApiClient` (HTTP clients), `Resources` (English and Welsh strings).
- **(code)** The UI uses the FieldKit Blazor components (`NhsWalesHeader`, `NhsWalesFooter`, `NhsWalesBreadcrumbs`, `NhsWalesSelect`, `NhsButton`, `NhsCard`, `NhsWarningCallout`) and the design system's `nhsw-*` classes. Some pages also use `nhsuk-*` classes and custom CSS (`dashboard-stats`, `snapshot-panel__*`, `prism-section-break`), which are not design system components.
- **(code)** The data comes from an API through `ApiClient`. The API is not in this repository.

## Screen shell

- **(code)** Header, then a thin language bar, then `<main id="maincontent">` with a wide container (`nhsw-width-container--wide`), then the footer.
- **(code)** The language bar holds the app's own switcher: "Cymraeg | English", the current language in bold, the other a link. It sets a culture cookie through `/culture/set` and reloads.
- **(code)** English and Welsh strings live in `SharedResources.resx` and `SharedResources.cy.resx`. Missing Welsh is written `[CY] <English text>`, which matches the factory's `[CY: needs translation]` rule. Many dashboard strings are not in the resource files at all: the snapshot panel, the IMTP widget and the dashboard's links are hard-coded English.

## Pages

| Page | Route | What it does |
|---|---|---|
| Home | `/`, `/home` | "Find a dashboard": choose by project or by team, then "Open dashboard". |
| Dashboard | `/projects/{ProjectId}/teams/{TeamId}/dashboard` | Breadcrumbs (PRISM › department › team), team name and overview, "Configure dashboard" and "Change project or team" links, **Team section**: sprint selector, "Download PDF report" link, the **Sprint snapshot** panel, then **Delivery performance** widgets laid out in rows and columns. |
| Configure dashboard | `…/dashboard/configure` | Drag-and-drop layout of widgets, and per-widget settings. |
| Record team survey | `RecordTeamSurvey.razor` | Staff record a team health survey. |

## The sprint snapshot today

- **(code)** The panel only appears once the selected sprint has finished (`FinishUtc` is in the past). Before that, the dashboard shows nothing about snapshots.
- **(code)** Three states: no snapshot yet (a hint and a "Save snapshot" button), editing (two text areas, "Product Owner update" and "Delivery Manager update", with "Save snapshot" and "Cancel"), and saved ("Snapshot saved 17 Oct 2026, 14:32", then the goal and both updates, and "Update snapshot").
- **(code)** While editing, the text is copied to the browser's local storage every 500ms, and restored if the person comes back. Cancel and a successful save clear it.
- **(code)** The save request sends only the two updates. The API returns a snapshot with the sprint's name and dates, `CreatedUtc`, `Status`, both updates and a payload of board statistics, git throughput and the sprint goal. **(inferred)** The API builds the payload itself at the moment of saving, so a person never sees the figures that will be recorded before they are recorded.
- **(code)** "Download PDF report" is a separate link to `/reports/projects/{id}/teams/{id}/iterations/{id}/report.pdf`.

## The fields in a snapshot (from `SprintSnapshotDto`)

| Group | Fields |
|---|---|
| Sprint | name, start, finish |
| Record | created time, status |
| Updates | Product Owner update, Delivery Manager update |
| Goal | sprint goal |
| Stories | committed at start, added during sprint, new, active, closed; story points brought in, story points closed |
| Bugs | committed at start, raised, closed; story points brought in, closed |
| Git | pull requests completed, commits, pull requests completed by person, approvals by person |
| Work items | id, title, state, type, story points, original estimate, remaining work, completed work, activity, assignee, tags, created, closed, resolved dates |

## The IMTP milestones widget today

- **(code)** Widget id `imtp-milestones`, title "IMTP milestones". It calls `GET projects/{projectId}/milestones`, sorts by `TargetYear`, and lists each milestone's title and target period.
- **(code)** Each milestone has `Portfolio`, `Title`, `TargetPeriod`, `TargetYear` and `Source`. The widget does not show `Source`.
- **(code)** With no milestones it says "No IMTP milestones recorded for this project." It always shows a "View full IMTP" link to one fixed SharePoint PDF, the 2026-29 submitted plan.
- **(code)** It shows no data source, no refresh date and no "last updated" time. If the project is not known, it shows an empty list, not an error.
- **Not known:** where the API gets milestones from, how often they change, and who maintains them. That is the A4 spike.

## Things the factory's agents should not assume

- The page templates in the factory's `ST-001` and `ST-002` are the design system's public and staff templates. PRISM is its own shell: use `context/` and `templates/wireframe/shells/prism.js`.
- There is no data-source, "captured at" or "last refreshed" pattern in the design system. Stories that need one should say so as a gap.
