#!/usr/bin/env python3
"""
Fix #530: Apply page components consistently across exercise, example, and course pages.

Rules applied:
  exercises/**/*.html       — +last-updated, +edit-on-github (scripts + elements)
  examples/**/*.html (detail, not index)
                            — +copyright-notice, +last-updated, +edit-on-github
  course tutorials (25)     — +course-sidebar (script), +edit-on-github (script + element)
  course/glossary.html      — +course-sidebar, +last-updated, +edit-on-github, +related-content
  course/index.html         — +course-sidebar, +copyright-notice, +last-updated, +related-content
  lectures/index.html       — +related-content
"""

import re
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent


# ---I/O helpers ──────────────────────────────────────────────────────────────

def read(path):
    with open(path, "r", encoding="utf-8-sig") as f:
        return f.read()


def write(path, text):
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write(text)


# ---Component helpers ────────────────────────────────────────────────────────

def component_prefix(text):
    """Return 'path/to/components/' string from existing <script> tags."""
    m = re.search(r'<script src="((?:\.\./)+)components/', text)
    return (m.group(1) + "components/") if m else None


def ensure_scripts(text, prefix, fnames):
    """Add missing <script defer> tags before </head>."""
    for fname in fnames:
        if f"components/{fname}" not in text:
            tag = f'\t\t<script src="{prefix}{fname}" defer></script>\n'
            text = text.replace("\t</head>", tag + "\t</head>", 1)
    return text


def leading_ws(text, search):
    """Return leading whitespace (tabs/spaces only) of the first line containing `search`."""
    m = re.search(r"^([ \t]+)" + re.escape(search), text, re.MULTILINE)
    return m.group(1) if m else "\t\t\t\t\t"


def insert_after_pattern(text, pattern, new_line_text, indent):
    """Insert `indent + new_line_text` after first regex match."""
    return re.sub(
        pattern,
        lambda m: m.group(0) + "\n" + indent + new_line_text,
        text,
        count=1,
    )


# ---Exercise pages ───────────────────────────────────────────────────────────

def process_exercise(path):
    text = read(path)
    prefix = component_prefix(text)
    if not prefix:
        print(f"  SKIP (no prefix): {path}")
        return False

    text = ensure_scripts(text, prefix, ["last-updated.js", "edit-on-github.js"])

    ind = leading_ws(text, "<copyright-notice")

    if "<last-updated>" not in text:
        text = insert_after_pattern(
            text,
            r"<copyright-notice[^>]*></copyright-notice>",
            "<last-updated></last-updated>",
            ind,
        )

    if "<edit-on-github>" not in text:
        if "<last-updated></last-updated>" in text:
            text = insert_after_pattern(
                text,
                r"<last-updated></last-updated>",
                "<edit-on-github></edit-on-github>",
                ind,
            )
        else:
            text = insert_after_pattern(
                text,
                r"<copyright-notice[^>]*></copyright-notice>",
                "<edit-on-github></edit-on-github>",
                ind,
            )

    write(path, text)
    print(f"  OK {path}")
    return True


# ---Example detail pages ─────────────────────────────────────────────────────

def process_example(path):
    text = read(path)
    prefix = component_prefix(text)
    if not prefix:
        print(f"  SKIP (no prefix): {path}")
        return False

    text = ensure_scripts(
        text, prefix, ["copyright-notice.js", "last-updated.js", "edit-on-github.js"]
    )

    # Indentation: use the line that closes </related-content>
    m = re.search(r"^(\s+)></related-content>", text, re.MULTILINE)
    if not m:
        m = re.search(r"^(\s+)<related-content[^>]*></related-content>", text, re.MULTILINE)
    ind = m.group(1) if m else "\t\t\t\t\t"

    if "<copyright-notice" not in text:
        text = insert_after_pattern(
            text,
            r">\s*</related-content>",
            '<copyright-notice type="examples"></copyright-notice>',
            ind,
        )

    ind2 = leading_ws(text, "<copyright-notice")
    if "<last-updated>" not in text:
        text = insert_after_pattern(
            text,
            r"<copyright-notice[^>]*></copyright-notice>",
            "<last-updated></last-updated>",
            ind2,
        )

    ind3 = leading_ws(text, "<last-updated>")
    if "<edit-on-github>" not in text:
        text = insert_after_pattern(
            text,
            r"<last-updated></last-updated>",
            "<edit-on-github></edit-on-github>",
            ind3,
        )

    write(path, text)
    print(f"  OK {path}")
    return True


# ---Course tutorial pages (have <last-updated> already) ─────────────────────

def process_course_tutorial(path):
    text = read(path)
    prefix = component_prefix(text)
    if not prefix:
        print(f"  SKIP (no prefix): {path}")
        return False

    text = ensure_scripts(text, prefix, ["course-sidebar.js", "edit-on-github.js"])

    ind = leading_ws(text, "<last-updated>")
    if "<edit-on-github>" not in text:
        text = insert_after_pattern(
            text,
            r"<last-updated></last-updated>",
            "<edit-on-github></edit-on-github>",
            ind,
        )

    write(path, text)
    print(f"  OK {path}")
    return True


# ---Special pages ────────────────────────────────────────────────────────────

GLOSSARY_RELATED = (
    '<related-content\n'
    '\t\t\t\texercises="../exercises/index.html|COBOL Exercises"\n'
    '\t\t\t\tlectures="../lectures/index.html|Lecture Notes"\n'
    '\t\t\t></related-content>'
)

COURSE_INDEX_RELATED = (
    '<related-content\n'
    '\t\t\t\texercises="../exercises/index.html|COBOL Exercises"\n'
    '\t\t\t\tlectures="../lectures/index.html|Lecture Notes"\n'
    '\t\t\t></related-content>'
)

LECTURES_INDEX_RELATED = (
    '<related-content\n'
    '\t\t\t\texercises="../exercises/index.html|COBOL Exercises"\n'
    '\t\t\t\tlectures="../course/index.html|COBOL Course"\n'
    '\t\t\t></related-content>'
)


def process_glossary(path):
    text = read(path)
    prefix = component_prefix(text)
    text = ensure_scripts(
        text, prefix,
        ["course-sidebar.js", "last-updated.js", "edit-on-github.js", "related-content.js"]
    )

    # Add related-content before <hr /> that precedes <copyright-notice>
    if "<related-content" not in text:
        # Insert before the <hr /> before copyright-notice
        text = re.sub(
            r"(\s+<hr />\n\s+<copyright-notice)",
            "\n\t\t\t" + GLOSSARY_RELATED + r"\1",
            text,
            count=1,
        )

    ind = leading_ws(text, "<copyright-notice")
    if "<last-updated>" not in text:
        text = insert_after_pattern(
            text,
            r"<copyright-notice[^>]*></copyright-notice>",
            "<last-updated></last-updated>",
            ind,
        )
    if "<edit-on-github>" not in text:
        ind2 = leading_ws(text, "<last-updated>")
        text = insert_after_pattern(
            text,
            r"<last-updated></last-updated>",
            "<edit-on-github></edit-on-github>",
            ind2,
        )

    write(path, text)
    print(f"  OK {path}")


def process_course_index(path):
    text = read(path)
    prefix = component_prefix(text)
    text = ensure_scripts(
        text, prefix,
        ["course-sidebar.js", "copyright-notice.js", "last-updated.js", "related-content.js"]
    )

    # Find indentation of <course-progress>
    ind_cp = leading_ws(text, "<course-progress>")

    # Add related-content before <course-progress> using lambda to avoid backreference issues
    if "<related-content" not in text:
        text = re.sub(
            r"(?m)^[ \t]+<course-progress></course-progress>",
            lambda m: ind_cp + COURSE_INDEX_RELATED + "\n" + m.group(0),
            text,
            count=1,
        )

    # Add copyright-notice and last-updated before <edit-on-github>
    ind_eog = leading_ws(text, "<edit-on-github>")
    if "<copyright-notice" not in text:
        text = re.sub(
            r"(?m)^[ \t]+<edit-on-github></edit-on-github>",
            lambda m: (
                ind_eog + "<copyright-notice></copyright-notice>\n"
                + ind_eog + "<last-updated></last-updated>\n"
                + m.group(0)
            ),
            text,
            count=1,
        )

    write(path, text)
    print(f"  OK {path}")


def process_lectures_index(path):
    text = read(path)
    prefix = component_prefix(text)
    if not prefix:
        print(f"  SKIP (no prefix): {path}")
        return

    text = ensure_scripts(text, prefix, ["related-content.js"])

    # Add related-content before <edit-on-github>
    if "<related-content" not in text:
        ind = leading_ws(text, "<edit-on-github>")
        text = re.sub(
            r"(\t+<edit-on-github></edit-on-github>)",
            ind + LECTURES_INDEX_RELATED + "\n" + r"\1",
            text,
            count=1,
        )

    write(path, text)
    print(f"  OK {path}")


# ---Main ─────────────────────────────────────────────────────────────────────

def main():
    print("\n=== Exercises (45 pages) ===")
    for path in sorted(ROOT.glob("exercises/**/*.html")):
        process_exercise(path)

    print("\n=== Example detail pages (37 pages) ===")
    for path in sorted(ROOT.glob("examples/**/*.html")):
        if path.name == "index.html":
            continue
        process_example(path)

    print("\n=== Course tutorials (25 pages with last-updated) ===")
    course_skip = {"index.html"}  # already has edit-on-github
    for path in sorted(ROOT.glob("course/*.html")):
        if path.name in course_skip:
            continue
        text = read(path)
        if "<last-updated>" not in text:
            continue  # glossary handled separately
        process_course_tutorial(path)

    print("\n=== course/glossary.html ===")
    process_glossary(ROOT / "course" / "glossary.html")

    print("\n=== course/index.html ===")
    process_course_index(ROOT / "course" / "index.html")

    print("\n=== lectures/index.html ===")
    process_lectures_index(ROOT / "lectures" / "index.html")

    print("\nDone.")


if __name__ == "__main__":
    main()
