# Limerick COBOL

Static site for COBOL programming exercises. Hand-authored HTML — no build step for exercise or lecture pages.

## Before starting any work

Check that the branch is current with master:

```bash
git rev-list --count HEAD..origin/master
```

If the count is greater than 0, rebase **before** making any changes:

```bash
git rebase origin/master
```

A stale branch inflates the PR diff with unrelated commits and causes conflicts on stash pop. Never use `git stash + git rebase + git stash pop` — commit work-in-progress first, then rebase.

## Validation

```bash
npm run validate
```

Runs `html-validate` against all HTML pages. Run after any HTML edits.

## Key conventions

- `<page-hero title="…">` is the source of truth for page titles. Keep `<title>`, `og:title`, and `twitter:title` in sync with it.
- The viewport meta tag must be the **first** element inside `<head>` to prevent FOUC from layout reflow.
- Exercises live in `exercises/`, lectures in `course/`, code examples in `examples/`.
