/*
 * PRISM's screen shell, for wireframes of stories that change product-reporting-ui.
 * Describes what the app does today (context/prism-product-reporting-ui.md): header, a thin
 * language bar, breadcrumbs, a wide container, and a footer. Nothing here belongs to one story.
 *
 *   const prism = require("../../../templates/wireframe/shells/prism")(kit);
 *   prism.shell(contentHtml)            skip link, header, language bar, <main>, footer
 *   prism.breadcrumbs([...texts])       the last item is the current page
 *   prism.teamDashboard({snapshot, widgets, sprints})   the team dashboard, with a slot for each part a story changes
 *                                       (sprints: optional list for the selector, [{value, text, selected}])
 */
module.exports = (kit) => {
  const { macro, cy, urls, skip, footer } = kit;

  const SERVICE = "Project Reporting and Integrated Systems Management System";
  const FOOTER_LINKS = [
    { text: "About", href: "#" },
    { text: "Accessibility", href: "#" },
    { text: "Service guidance (opens in a new tab)", href: "#" },
  ];

  const header = () =>
    cy(macro("header", "nhswHeader", { serviceName: SERVICE, serviceUrl: "dashboard.html", search: false, logoSrc: urls.logo }), [SERVICE], "header");

  // The app's switcher shows both names with the current one in bold. A wireframe shows only the
  // link to the other language, so the wireframe kit can switch the page when it is clicked.
  const languageBar = () =>
    `<div class="product-reporting-language-bar">
    <div class="nhsw-fluid-container">
      <nav class="nhsw-language-switcher" aria-label="Choose language" style="display:flex;justify-content:flex-end;padding:0.5rem 0">
        <a class="nhsw-link" href="#" lang="cy" hreflang="cy" data-wf-language-switch data-wf-note="1">Cymraeg</a>
      </nav>
    </div>
  </div>`;

  function breadcrumbs(texts) {
    const items = texts.map((text, i) => (i === texts.length - 1 ? { text } : { text, href: "dashboard.html" }));
    return cy(macro("breadcrumb", "nhswBreadcrumb", { items }), texts, "breadcrumbs");
  }

  function shell(content) {
    return `  ${skip()}
  ${header()}
  ${languageBar()}
  <main class="nhsw-main-wrapper" id="maincontent">
    <article class="nhsw-width-container--wide">
${content}
    </article>
  </main>
  ${footer(FOOTER_LINKS)}`;
  }

  const SPRINTS = [
    { value: "s24", text: "Sprint 24 (5 October to 16 October 2026)", selected: true },
    { value: "s23", text: "Sprint 23 (21 September to 2 October 2026)" },
    { value: "s22", text: "Sprint 22 (7 September to 18 September 2026)" },
  ];

  function teamDashboard({ snapshot, widgets, sprints }) {
    const select = cy(macro("select", "nhswSelect", {
      id: "sprint", name: "sprint", label: { text: "Choose a sprint" }, items: sprints || SPRINTS,
    }), ["Choose a sprint"], "sprint select");
    return `      ${breadcrumbs(["PRISM", "Digital Health Services", "Example team"])}
      <h1 class="nhsw-h1">Example team</h1>
      <h2 class="nhsw-h2" data-cy="">Overview</h2>
      <p class="nhsw-body">A fictional team used to draw wireframes. Its overview text goes here.</p>
      <p class="nhsw-body"><a class="nhsw-link" href="#" data-cy="">Configure dashboard</a> | <a class="nhsw-link" href="#" data-cy="">Change project or team</a></p>
      <h2 class="nhsw-h2" data-cy="">Team section</h2>
      <div data-wf-note="2">${select}</div>
      <p class="nhsw-body"><a class="nhsw-link" href="#" data-cy="">Download PDF report</a></p>
${snapshot}
${widgets}`;
  }

  return { SERVICE, shell, breadcrumbs, teamDashboard, header, languageBar };
};
