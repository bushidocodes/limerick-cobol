# Limerick COBOL

Static site for COBOL programming exercises. Hand-authored HTML — no build step for exercise or lecture pages.

## Before starting any work

Fetch, then check that the branch is current with master:

```bash
git fetch origin
git rev-list --count HEAD..origin/master
```

**Always run `git fetch origin` first.** Without it, the local remote-tracking ref may be stale and the count will appear to be 0 even when origin/master has moved ahead.

If the count is greater than 0, rebase **before** making any changes:

```bash
git rebase origin/master
```

If the current branch has already been merged into master, create a fresh branch from origin/master instead of adding more commits to it:

```bash
git checkout -b fix/<description> origin/master
```

A stale branch inflates the PR diff with unrelated commits and causes conflicts on stash pop. Never use `git stash + git rebase + git stash pop` — commit work-in-progress first, then rebase.

## Validation

```bash
npm run validate
```

Runs `html-validate` against all HTML pages. Run after any HTML edits.

```bash
npm run links
```

Checks for dead links. Run after any edits that add, remove, or change `href` or `src` values.

## Preview server

The `.claude/launch.json` server name is `limerick-cobol` (serves the repo root via `http-server`). Start it with `preview_start("limerick-cobol")` — port is auto-assigned. Use the preview tools to verify layout, breadcrumb, and hero-title changes before committing.

Use `preview_inspect` with explicit `styles` to verify computed dimensions and colours — it is more reliable than screenshots for style assertions.

## Formatting

```bash
npx prettier --write .
```

Prettier runs automatically in CI on every PR merge. Run it locally after editing JS or JSON files to avoid a style-only follow-up commit. HTML files are hand-authored and intentionally excluded from prettier.

## Build scripts

Several generated files must be kept in sync with the source HTML. Run the relevant script after the triggering change and commit the output alongside it.

| Script                          | When to run                                                                               |
| ------------------------------- | ----------------------------------------------------------------------------------------- |
| `npm run build:sitemap`         | After adding, removing, or renaming any HTML page (or changing `scripts/collect-html.js`) |
| `npm run build:search-index`    | After adding or renaming pages, or changing page titles                                   |
| `npm run build:examples`        | After editing any `.cbl` COBOL source file in `examples/`                                 |
| `npm run build:lesson-index`    | After adding, removing, or reordering course lessons                                      |
| `npm run build:prev-next-links` | After reordering course lessons                                                           |
| `npm run build:reading-time`    | After substantially editing course page body text                                         |
| `npm run build:lesson-jsonld`   | After editing course lesson titles, descriptions, or canonical URLs                       |
| `npm run build:og-images`       | After adding a new site section or redesigning the OG image template                     |
| `npm run build:icons`           | After changing the site logo SVG                                                          |

`npm run check` runs the full suite (examples, search-index, validate, assets, img-dims, links, a11y) — use it before opening a PR when multiple generators may be affected.

`npm run fix:img-dims` auto-adds missing `width`/`height` attributes on `<img>` tags (use when `check:img-dims` reports failures).

## Pull requests

- Reference the issue being fixed with `Fixes #NNN` in the commit message body so GitHub closes it on merge.
- Open PRs with `gh pr create` from the worktree branch.

## CSS architecture

Two stylesheets are loaded on every page:

- `course/Resources/css/course.css` — design tokens (CSS custom properties), base element and reset styles, dark-mode overrides, print styles. Touch this when changing colours or tokens.
- `course/Resources/css/course-components.css` — all component classes (`.site-header`, `.page-wrapper`, `.page-toc`, `.edit-on-github`, etc.) and breakpoint layout rules. New visual rules go here.

## Component scripts

`components/` holds JS web components. Each must be loaded via a `<script defer>` tag in the page `<head>`. Use a relative path (`../components/`, `../../components/`, etc.) matching the page depth.

**Layout — loaded on every page via site-header / breadcrumbs:**
- `site-header.js` — sticky header (logo, primary nav, search input)
- `breadcrumbs.js` — secondary sticky bar with breadcrumb trail and theme toggle
- `course-sidebar.js` — left-rail course outline, visible at ≥1100 px; auto-inserts `<course-sidebar>` on any `/course/` URL, but the script still needs a `<script>` tag
- `page-toc.js` — right-rail in-page TOC; standalone at ≥1100 px, three-column with course-sidebar at ≥1280 px

**Page chrome — added per-page:**
- `page-hero.js` — `<page-hero title="…">` element; source of truth for the page title (keep `<title>`, `og:title`, `twitter:title` in sync)
- `copyright-notice.js` — copyright footer; use `type="exercises"` on exercise pages, `type="examples"` on example pages, no attribute on course pages
- `last-updated.js` — renders the last-commit date for the page
- `edit-on-github.js` — "Edit this page on GitHub" link
- `related-content.js` — cross-links panel; supports `exercises`, `lectures`, and `examples` attributes (no `course` attribute)

**Exercise pages:**
- `exercises-nav.js` — prev/next navigation within the `COBOL_EXERCISES` sequence
- `exercise-progress.js` — data file; sets `window.COBOL_EXERCISES`; always import alongside `exercises-nav.js`

**Course pages:**
- `lesson-nav.js` — prev/next between course lessons
- `lesson-checkbox.js` — per-lesson completion checkbox
- `lesson-progress.js` — lesson-level progress display
- `course-progress.js` — overall course completion tracker

**Utilities (auto-attached to content elements):**
- `copy-button.js` — adds a copy button to `<pre>` code blocks
- `run-in-ce.js` — "run in COBOL editor" button for runnable snippets
- `site-search.js` — search overlay (used internally by `site-header.js`)
- `theme-toggle.js` — dark/light mode toggle (used internally by `breadcrumbs.js`)
- `lesson-toc.js` — builds the in-page lesson TOC (used internally by `page-toc.js`)

## Key conventions

- `<page-hero title="…">` is the source of truth for page titles. Keep `<title>`, `og:title`, and `twitter:title` in sync with it.
- The viewport meta tag must be the **first** element inside `<head>` to prevent FOUC from layout reflow.
- Tutorials live in `course/`, exercises in `exercises/`, lectures in `lectures/`, code examples in `examples/`.
