# Limerick COBOL

Michael Coughlan's University of Limerick COBOL tutorial, recovered from the Internet Archive.

**Deployed site:** https://bushidocodes.github.io/limerick-cobol/

## Rationale

A few years back, Michael Coughlan's well-known University of Limerick COBOL tutorial bit-rotted off the web. It's the course I originally used to learn COBOL way back when. I pulled it out of the Internet Archive and cleaned up the PowerPoint browser-plugin scaffolding so the slides render cleanly as embedded PDFs.

Michael Coughlan has since relinquished copyright in the original course material and authorized its continued release under an open-source license. See [License](#license) below.

## Internet Archive snapshot

The original course lived at `http://www.csis.ul.ie/cobol/`. Source snapshot used for this restoration:

- https://web.archive.org/web/20140226022647/http://www.csis.ul.ie/cobol/

## Development

The site is plain static HTML — no build step. To preview locally:

```sh
npm install
npm run serve   # http://localhost:8000
```

CI runs validation and link checks on every PR (see [.github/workflows/checks.yml](.github/workflows/checks.yml)):

| Script             | What it does                                             | In CI?         |
| ------------------ | -------------------------------------------------------- | -------------- |
| `npm run validate` | HTML parse / structure check via `html-validate`         | yes            |
| `npm run links`    | Internal link check via `linkinator` (externals skipped) | yes            |
| `npm run a11y`     | WCAG 2.1 AA scan via `pa11y-ci` (all pages)              | local + weekly |
| `npm run check`    | Runs all checks locally                                  | —              |

The a11y scan is slow, so it does **not** block PRs — run `npm run a11y` locally before pushing. A scheduled weekly job ([.github/workflows/a11y-full.yml](.github/workflows/a11y-full.yml)) runs the full scan as a non-blocking safety net.

The starting `html-validate` ruleset is intentionally permissive — it catches parse errors and structural bugs but doesn't flag every legacy-HTML pattern. Tighten over time as modernization progresses.

`linkinator.config.json` only skips external URLs and `mailto:` links — internal refs are all expected to resolve.

`pa11y-ci` uses `.pa11yci.cjs` for its configuration; the URL list is auto-derived from the same filesystem walk that builds `sitemap.xml` (see `scripts/collect-html.js`), so new pages are picked up automatically. Known pre-existing violations are listed in the `ignore` array as an explicit debt ledger — each entry should reference an open issue tracking its eventual removal. New violations will block PRs.

## License

This project — including the site code (HTML, CSS, JavaScript, build scripts, and configuration) and the COBOL course material (course, exercise, and lecture text and examples) — is licensed under the [MIT License](LICENSE). You are free to use, copy, modify, and redistribute it, including commercially, provided the copyright and license notice are preserved.

### Attribution and provenance

The COBOL course material was originally authored by **Michael Coughlan** at the **University of Limerick**, where it lived at `http://www.csis.ul.ie/cobol/` before bit-rotting off the web (see [Internet Archive snapshot](#internet-archive-snapshot)).

In June 2026, Michael Coughlan relinquished copyright in this material and authorized its continued release under an open-source license, writing:

> I am very happy to relinquish copyright to the COBOL materials previously held on the CSIS website and to let those materials continue under an open source license.

This restoration — recovering the material from the Internet Archive, modernizing the markup, and maintaining the site — is the work of Sean McBride and contributors. Please retain the attribution to Michael Coughlan as original author when reusing the course material.
