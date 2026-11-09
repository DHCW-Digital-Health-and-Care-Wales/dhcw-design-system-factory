"""Run axe-core against one or more pages and print a findings summary.

Usage:
  python axe_check.py [--width 375,1280] [--json out.json] page.html [more pages...]

Pages can be local file paths or http(s) URLs. Uses the WCAG 2.2 A/AA tags
plus best practices, as set out in context/wcag-axe.md. Needs Python
Playwright with Chromium installed (pip install playwright && playwright install chromium).

axe-core is loaded from --axe, else ./node_modules/axe-core/axe.min.js
(npm install axe-core), else downloaded once from jsDelivr into ~/.cache.
"""
import argparse, json, os, sys, urllib.request
from playwright.sync_api import sync_playwright

AXE_VERSION = "4.14.0"
AXE_URL = f"https://cdn.jsdelivr.net/npm/axe-core@{AXE_VERSION}/axe.min.js"
TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]
SEVERITY = {"critical": "Blocker", "serious": "Blocker", "moderate": "Should fix", "minor": "Nit"}
ALWAYS_BLOCK = {"page-has-heading-one", "landmark-one-main", "skip-link"}


def load_axe(path):
    candidates = [path] if path else []
    candidates.append(os.path.join(os.getcwd(), "node_modules", "axe-core", "axe.min.js"))
    for c in candidates:
        if c and os.path.exists(c):
            return open(c, encoding="utf-8").read()
    cache = os.path.join(os.path.expanduser("~"), ".cache", f"axe-core-{AXE_VERSION}.min.js")
    if not os.path.exists(cache):
        os.makedirs(os.path.dirname(cache), exist_ok=True)
        with urllib.request.urlopen(AXE_URL, timeout=60) as r, open(cache, "wb") as f:
            f.write(r.read())
    return open(cache, encoding="utf-8").read()


def browser_proxy():
    proxy = os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy")
    return {"server": proxy} if proxy else None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("pages", nargs="+")
    ap.add_argument("--width", default="375,1280")
    ap.add_argument("--json")
    ap.add_argument("--axe", help="path to axe.min.js")
    ap.add_argument("--lang", choices=["en", "cy", "both"], default="both",
                    help="for wireframes with the English/Welsh switch")
    args = ap.parse_args()
    widths = [int(w) for w in args.width.split(",")]
    axe_source = load_axe(args.axe)
    report, blockers, version = [], 0, AXE_VERSION

    with sync_playwright() as p:
        launch = {"proxy": browser_proxy()} if browser_proxy() else {}
        browser = p.chromium.launch(**launch)
        context = browser.new_context(ignore_https_errors=False)
        for target in args.pages:
            url = target if target.startswith("http") else "file://" + os.path.abspath(target)
            for width in widths:
                langs = ["en", "cy"] if args.lang == "both" else [args.lang]
                for lang in langs:
                    page = context.new_page()
                    page.set_viewport_size({"width": width, "height": 900})
                    page.add_init_script(f"try{{localStorage.setItem('wf-lang','{lang}')}}catch(e){{}}")
                    page.goto(url)
                    page.wait_for_load_state("networkidle")
                    page.add_script_tag(content=axe_source)
                    version = page.evaluate("axe.version")
                    result = page.evaluate(
                        "tags => axe.run(document, {runOnly: {type: 'tag', values: tags}})", TAGS)
                    for v in result["violations"]:
                        sev = "Blocker" if v["id"] in ALWAYS_BLOCK else SEVERITY.get(v["impact"], "Should fix")
                        blockers += sev == "Blocker"
                        wcag = [t for t in v["tags"] if t.startswith("wcag") and t[4:].isdigit()]
                        report.append({
                            "page": os.path.basename(target), "width": width, "lang": lang,
                            "rule": v["id"], "impact": v["impact"], "severity": sev,
                            "wcag": wcag, "help": v["help"], "helpUrl": v["helpUrl"],
                            "targets": [", ".join(n["target"]) for n in v["nodes"]][:5],
                        })
                    print(f"{os.path.basename(target)} @ {width}px [{lang}]: "
                          f"{len(result['violations'])} violations, {len(result['incomplete'])} need review, "
                          f"{len(result['passes'])} rules passed")
                    page.close()
        browser.close()

    for r in report:
        print(f"- [{r['severity']}] {r['rule']} ({', '.join(r['wcag']) or 'best practice'}) "
              f"on {r['page']} @ {r['width']}px [{r['lang']}]: {r['help']} -> {'; '.join(r['targets'])}")
    if args.json:
        with open(args.json, "w") as f:
            json.dump({"axe": version, "tags": TAGS, "findings": report}, f, indent=2)
    print(f"\naxe {version}: {len(report)} findings, {blockers} blockers. "
          "Automated checks only: see context/wcag-axe.md section 4 for the manual checks still owed.")
    sys.exit(1 if blockers else 0)


if __name__ == "__main__":
    main()
