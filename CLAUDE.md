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

## Formatting

```bash
npx prettier --write .
```

Prettier runs automatically in CI on every PR merge. Run it locally after editing JS or JSON files to avoid a style-only follow-up commit. HTML files are hand-authored and intentionally excluded from prettier.

## Pull requests

- Reference the issue being fixed with `Fixes #NNN` in the commit message body so GitHub closes it on merge.
- Open PRs with `gh pr create` from the worktree branch.

## Key conventions

- `<page-hero title="…">` is the source of truth for page titles. Keep `<title>`, `og:title`, and `twitter:title` in sync with it.
- The viewport meta tag must be the **first** element inside `<head>` to prevent FOUC from layout reflow.
- Exercises live in `exercises/`, lectures in `course/`, code examples in `examples/`.
