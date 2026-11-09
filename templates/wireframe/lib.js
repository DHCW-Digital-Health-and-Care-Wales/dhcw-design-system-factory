/*
 * The wireframe kit's helpers. build.js creates a kit and hands it to a story's page definitions
 * (work/<story-id>/wireframes/pages.js). Nothing here knows about a particular story.
 *
 *   kit.macro(folder, macroName, params)       render a design system macro to HTML
 *   kit.dashboard(params, contentHtml)         render nhswDashboard around some content
 *   kit.cy(html, strings, label)               give each string a Welsh slot (data-cy="")
 *   kit.page({...})                            wrap content in a full wireframe page, with notes
 *   kit.indexPage({...})                       the index page: journey map and table of pages
 *   kit.write(file, html)                      write a file into the wireframes folder
 *   kit.mermaidFrom(journeyPath)               the Mermaid map from journey.md, escaped for HTML
 *   kit.urls, kit.tag, kit.storyDir            the CDN addresses, design system tag, story folder
 *   kit.skip(), kit.footer(), kit.button(text, extra)       shared page parts, wrapped for Welsh
 *   kit.publicHeader(signedIn, marked)         the public header with the proposed language switch
 *   kit.staffShell(content, {marked})          the staff dashboard with the proposed language switch
 *   kit.patientHeader()                        the patient header (static markup, there is no macro)
 */
const fs = require("fs");
const path = require("path");

function createKit({ ds, out, tag }) {
  const { configure } = require(path.join(ds, "src", "nunjucks.config.js"));
  const env = configure();
  const cdn = `https://cdn.jsdelivr.net/gh/DHCW-Digital-Health-and-Care-Wales/dhcw-design-system@${tag}/`;
  const urls = {
    css: cdn + "preview/dist/nhsw.css",
    js: cdn + "preview/dist/nhsw-behaviours.min.js",
    logo: cdn + "preview/assets/nhsw-logo.svg",
    icon: cdn + "preview/assets/dhcw-icon.svg",
  };
  const unmatched = [];

  function macro(file, name, params) {
    return env.renderString(`{% from "${file}/macro.njk" import ${name} %}{{ ${name}(params) }}`, { params });
  }

  function dashboard(params, content) {
    return env.renderString(
      `{% from "dashboard/macro.njk" import nhswDashboard %}{% call nhswDashboard(params) %}{{ content | safe }}{% endcall %}`,
      { params, content }
    );
  }

  function cy(html, strings, label) {
    for (const s of strings) {
      const esc = s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(">\\s*" + esc + "\\s*<", "g");
      if (!re.test(html)) { unmatched.push(`${label}: "${s}"`); continue; }
      html = html.replace(new RegExp(">\\s*" + esc + "\\s*<", "g"), `><span data-cy="">${s}</span><`);
    }
    return html;
  }

  const FOOTER_LINKS = [
    { text: "Accessibility statement", href: "#" },
    { text: "Contact us", href: "#" },
  ];

  const skip = () => cy(macro("skip-link", "nhswSkipLink", {}), ["Skip to main content"], "skip link");

  const footer = (links) =>
    cy(macro("footer", "nhswFooter", { links: links || FOOTER_LINKS }), (links || FOOTER_LINKS).map((l) => l.text), "footer");

  function button(text, extra) {
    return cy(macro("button", "nhswButton", Object.assign({ text, classes: "nhsw-button--primary" }, extra || {})), [text], "button " + text);
  }

  const switchHeader = (marked) =>
    `<a class="nhsw-site-header__language nhsw-site-header__logout" href="#" lang="cy" hreflang="cy" data-wf-language-switch${marked ? ' data-wf-note="1"' : ""}>Cymraeg</a>`;
  const switchDashboard = (marked) =>
    `<a class="nhsw-dashboard__language nhsw-link wf-language-spacing" href="#" lang="cy" hreflang="cy" data-wf-language-switch${marked ? ' data-wf-note="1"' : ""}>Cymraeg</a>`;

  function publicHeader(user, marked, serviceUrl) {
    let h = macro("header", "nhswHeader", Object.assign(
      { serviceName: "Example service", serviceUrl: serviceUrl || "example-page-public.html", search: false, logoSrc: urls.logo },
      user ? { user: { name: "Jane Doe", logoutHref: "#" } } : {}
    ));
    h = user
      ? h.replace(/(<\/a>)(\s*)(<div class="nhsw-site-header__account">)/, `$1$2${switchHeader(marked)}$2$3`)
      : h.replace(/(<\/a>)(\s*<\/div>\s*<\/div>\s*<\/header>)/, `$1${switchHeader(marked)}$2`);
    if (!h.includes("data-wf-language-switch")) throw new Error("switch not injected into header");
    return cy(h, user ? ["Example service", "Log out"] : ["Example service"], "header");
  }

  function staffShell(content, { marked, serviceUrl }) {
    let shell = dashboard({
      serviceName: "Example service", serviceUrl: serviceUrl || "example-page-staff.html", logoSrc: urls.icon,
      nav: [{ items: [
        { text: "Home", href: "#", icon: "home" },
        { text: "School immunisations", href: "#", icon: "school", current: true },
        { text: "Patient search", href: "#", icon: "people" },
      ] }],
      topbar: { chips: [
        { text: "Example school", icon: "building" },
        { text: "Jane Doe", icon: "user" },
        { text: "Example Health Board", icon: "pin" },
      ], exit: { text: "Exit", href: "#" } },
      footer: { links: FOOTER_LINKS },
    }, content);
    shell = shell.replace('<a class="nhsw-dashboard__exit nhsw-link"', switchDashboard(marked) + '<a class="nhsw-dashboard__exit nhsw-link"');
    if (!shell.includes("data-wf-language-switch")) throw new Error("switch not injected into dashboard");
    return cy(shell, ["Example service", "Home", "School immunisations", "Patient search", "Example school", "Example Health Board", "Exit", "Accessibility statement", "Contact us"], "dashboard");
  }

  function patientHeader() {
    const html = `<section class="nhsw-patient-header" aria-label="Patient details">
          <div class="nhsw-patient-header__inner">
            <div class="nhsw-patient-header__row nhsw-patient-header__row--identity">
              <p class="nhsw-patient-header__name">JONES, Amira (Ms)</p>
              <dl class="nhsw-patient-header__details">
                <div class="nhsw-patient-header__item"><dt>Date of birth:</dt><dd>14 Mar 2012 (14y 7m)</dd></div>
                <div class="nhsw-patient-header__item"><dt>NHS number:</dt><dd>123 456 7890</dd></div>
                <div class="nhsw-patient-header__item"><dt>Gender:</dt><dd>Female</dd></div>
              </dl>
            </div>
            <div class="nhsw-patient-header__row">
              <dl class="nhsw-patient-header__details">
                <div class="nhsw-patient-header__item"><dt>Adverse reactions:</dt><dd>None known</dd></div>
              </dl>
            </div>
          </div>
        </section>`;
    return cy(html, ["Date of birth:", "NHS number:", "Gender:", "Adverse reactions:"], "patient header");
  }

  function write(file, html) {
    fs.writeFileSync(path.join(out, file), html, "utf8");
  }

  function page({ storyId, pageId, state, titleEn, body, notes, other, label }) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title data-cy="">${titleEn}</title>
  <link rel="stylesheet" href="${urls.css}">
  <link rel="stylesheet" href="wf.css">
</head>
<body>
${body}

  <aside class="wf-notes" aria-label="Wireframe notes">
    <div class="wf-notes__inner">
      <h2 class="wf-notes__title">Wireframe notes: ${pageId} (${state})</h2>
      <p class="wf-notes__meta">${storyId}${label ? " · " + label : ""} · design system ${tag} · <a href="index.html">All pages</a></p>
      <ol>
${notes.map((n) => `        <li>${n}</li>`).join("\n")}
      </ol>
      <p>${other}</p>
    </div>
  </aside>

  <script src="${urls.js}"></script>
  <script src="wf.js"></script>
</body>
</html>
`;
  }

  function indexPage({ browserTitle, heading, lede, mermaid, intro, caption, columns, rows }) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${browserTitle}</title>
  <link rel="stylesheet" href="${urls.css}">
  <link rel="stylesheet" href="wf.css">
</head>
<body>
  <a class="nhsw-skip-link" href="#maincontent">Skip to main content</a>
  <main class="nhsw-main-wrapper" id="maincontent">
    <div class="nhsw-width-container">
      <h1 class="nhsw-h1">${heading}</h1>
      <p class="nhsw-lede-text">${lede}</p>

      <h2 class="nhsw-h2">Journey</h2>
      <pre class="mermaid">
${mermaid}
      </pre>

      <h2 class="nhsw-h2">Pages</h2>${intro ? `\n      ${intro}` : ""}
      <table class="nhsw-table">
        <caption class="nhsw-table__caption nhsw-table__caption--m">${caption}</caption>
        <thead class="nhsw-table__head">
          <tr class="nhsw-table__row">
${columns.map((c) => `            <th scope="col" class="nhsw-table__header">${c}</th>`).join("\n")}
          </tr>
        </thead>
        <tbody class="nhsw-table__body">
${rows.map((r) => `          <tr class="nhsw-table__row">
            <th scope="row" class="nhsw-table__header">${r[0]}</th>
${r.slice(1).map((c) => `            <td class="nhsw-table__cell">${c}</td>`).join("\n")}
          </tr>`).join("\n")}
        </tbody>
      </table>
    </div>
  </main>
  <script type="module">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
    mermaid.initialize({ startOnLoad: true, securityLevel: 'strict' });
  </script>
</body>
</html>
`;
  }

  function mermaidFrom(journeyPath) {
    const text = fs.readFileSync(journeyPath, "utf8");
    const match = text.match(/```mermaid\r?\n([\s\S]*?)```/);
    if (!match) throw new Error(`No Mermaid diagram found in ${journeyPath}`);
    return match[1].trim().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function finish() {
    console.log("written to", out);
    console.log(unmatched.length ? "strings not wrapped for Welsh:\n  " + unmatched.join("\n  ") : "every string wrapped for Welsh");
    if (unmatched.length) process.exitCode = 1;
  }

  return {
    tag, urls, storyDir: path.dirname(out), macro, dashboard, cy, write, page, indexPage, mermaidFrom, finish,
    skip, footer, button, publicHeader, staffShell, patientHeader, switchHeader, switchDashboard,
  };
}

module.exports = { createKit };
