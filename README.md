# Limerick COBOL

Michael Coughlan's University of Limerick COBOL tutorial, recovered from the Internet Archive.

**Deployed site:** https://bushidocodes.github.io/limerick-cobol/

## Rationale

A few years back, Michael Coughlan's well-known University of Limerick COBOL tutorial bit-rotted off the web. It's the course I originally used to learn COBOL way back when. I pulled it out of the Internet Archive and cleaned up the PowerPoint browser-plugin scaffolding so the slides render cleanly as embedded PDFs.

If anyone happens to have Michael Coughlan's contact info, please reach out — I'd like to get in touch about licensing this under Creative Commons.

## Internet Archive snapshot

The original course lived at `http://www.csis.ul.ie/cobol/`. Source snapshot used for this restoration:

- https://web.archive.org/web/20140226022647/http://www.csis.ul.ie/cobol/

## Development

The site is plain static HTML — no build step. To preview locally:

```sh
npm install
npm run serve   # http://localhost:8000
```

CI runs two checks on every PR (see [.github/workflows/checks.yml](.github/workflows/checks.yml)):

| Script             | What it does                                              | In CI? |
| ------------------ | --------------------------------------------------------- | ------ |
| `npm run validate` | HTML parse / structure check via `html-validate`          | yes    |
| `npm run links`    | Internal link check via `linkinator` (externals skipped)  | yes    |
| `npm run a11y`     | WCAG 2.1 AA scan via `pa11y-ci` (sample of pages)         | no     |
| `npm run check`    | Runs all three locally                                    | —      |

The starting `html-validate` ruleset is intentionally permissive — it catches parse errors and structural bugs but doesn't flag every legacy-HTML pattern. Tighten over time as modernization progresses.

`linkinator.config.json` lists a few skip patterns for known-dead refs in the legacy markup (Word "Save as Web Page" debris, a malformed Archive.org link, an unprefixed mailto). Remove those skips as the corresponding HTML gets cleaned up.

`npm run a11y` is available locally but not in CI yet. Existing pages have many pre-existing WCAG violations; wiring a strict gate now would just memorize current breakage. The a11y job gets added back after the accessibility cleanup pass lands.
