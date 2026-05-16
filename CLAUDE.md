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

## Preview server

The launch.json server name is `limerick-cobol` (serves the repo root via `http-server`). Start it with `preview_start("limerick-cobol")` — port is auto-assigned. Use the preview tools to verify layout, breadcrumb, and hero-title changes before committing.

Use `preview_inspect` with explicit `styles` to verify computed dimensions and colours — it is more reliable than screenshots for style assertions.

## Formatting

```bash
npx prettier --write .
```

Prettier runs automatically in CI on every PR merge. Run it locally after editing JS or JSON files to avoid a style-only follow-up commit. HTML files are hand-authored and intentionally excluded from prettier.

## Pull requests

- Reference the issue being fixed with `Fixes #NNN` in the commit message body so GitHub closes it on merge.
- Open PRs with `gh pr create` from the worktree branch.

## CSS architecture

Two stylesheets are loaded on every page:

- `course/Resources/css/course.css` — design tokens (CSS custom properties), base element and reset styles, dark-mode overrides, print styles. Touch this when changing colours or tokens.
- `course/Resources/css/course-components.css` — all component classes (`.site-header`, `.page-wrapper`, `.page-toc`, `.edit-on-github`, etc.) and breakpoint layout rules. New visual rules go here.

## Component scripts

`components/` holds JS web components auto-injected on every page:

- `site-header.js` — sticky header (logo, primary nav, search input)
- `breadcrumbs.js` — secondary sticky bar with breadcrumb trail and theme toggle
- `course-sidebar.js` — left-rail course outline, visible at ≥1100 px
- `page-toc.js` — right-rail in-page TOC; standalone at ≥1100 px, three-column with course-sidebar at ≥1280 px

## Key conventions

- `<page-hero title="…">` is the source of truth for page titles. Keep `<title>`, `og:title`, and `twitter:title` in sync with it.
- The viewport meta tag must be the **first** element inside `<head>` to prevent FOUC from layout reflow.
- Tutorials live in `course/`, exercises in `exercises/`, lectures in `lectures/`, code examples in `examples/`.
