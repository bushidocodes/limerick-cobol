# Contributing to Limerick COBOL

Thank you for your interest in contributing! This document covers everything you need to get started.

## Prerequisites

- **Node 20** — the version used in CI. A `.nvmrc` is included, so if you use [nvm](https://github.com/nvm-sh/nvm) or [fnm](https://github.com/Schniz/fnm), run:

    ```sh
    nvm use
    # or
    fnm use
    ```

## Setup

```sh
npm install
```

## Local preview

```sh
npm run serve   # starts http://localhost:8000
```

The site is plain static HTML — there is no build step.

## Running checks

Before opening a PR, run the full CI mirror locally:

```sh
npm run check
```

This runs in sequence:

| Script                 | What it does                                             |
| ---------------------- | -------------------------------------------------------- |
| `npm run validate`     | HTML parse / structure check via `html-validate`         |
| `npm run links`        | Internal link check via `linkinator` (externals skipped) |
| `npm run a11y`         | WCAG 2.1 AA scan via `pa11y-ci` (sample of pages)        |
| `npm run format:check` | Prettier formatting check                                |

You can run any step individually. `npm run a11y` spins up a local server automatically.

## Modernization phase strategy

The codebase is being modernised in phases. Phase 4 and Phase 5 markers in
[`course/Resources/css/course-components.css`](course/Resources/css/course-components.css)
describe the current approach:

- **Phase 4** — sweeping replacement of legacy presentational HTML (`<center>`,
  `align="..."`, `<table border cellspacing cellpadding>`) with semantic CSS utility classes
  (`class="data-table"`, `class="center-block"`, etc.). New page commits should
  use these classes rather than inline presentation attributes.
- **Phase 5** — migrating per-page `<style>` blocks into `course-components.css`.
  Rules that would change rendering on other pages stay inline until those pages
  are ready.

When working on a page, apply the appropriate phase's conventions. The commit
message should mention which phase is being applied, e.g. `Apply Phase 4 modernisation to Foo.html`.

## Branching

- Target `master` for all PRs.
- Branch names don't need to follow a specific pattern, but a short descriptive
  prefix helps (e.g. `fix/`, `a11y/`, `modernise/`).

## Submitting a PR

1. Run `npm run check` — fix any failures before opening the PR.
2. Fill in the PR template (screenshots encouraged for visual changes).
3. The CI suite runs `validate`, `links`, `a11y`, and `format:check` automatically.

## Dependencies and CVEs

Dependency CVEs are handled by [Dependabot](.github/dependabot.yml), which
opens weekly npm update PRs and additional PRs for GitHub security advisories.
CI does **not** run `npm audit` — all dev dependencies (`html-validate`,
`linkinator`, `pa11y-ci`, `prettier`, `http-server`, `start-server-and-test`)
are build-time tools that never ship to users, so a failing audit shouldn't
gate PRs. If you want a local check, run `npm audit` manually.
