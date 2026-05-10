"""
fix-deprecated-attrs.py

Sweeps all HTML files in the repo and removes/replaces these deprecated
presentational attributes and elements:

  - align= on any element
  - valign= on td/tr
  - <center>…</center>  → <div class="center-block">…</div>
  - border="0" on table/img → remove
  - border="1" (or higher) on table → add class="data-table" (or inline style for non-standard values)
  - border="0" on img → remove

<font> elements: no occurrences found in the repo.

Explicitly EXCLUDED: bgcolor= (needs separate CSS migration PR).

Strategy for align=:
  - align="top"/"texttop"/"abscenter" on img/a/span → remove
  - align="top" on td/th → style="vertical-align: top;" then remove attr
  - align="center" on any → style="text-align: center;" then remove attr
    (skip if style already has text-align:center)
  - align="left"  on any → style="text-align: left;" then remove attr
  - align="right" on any → style="text-align: right;" then remove attr
  - align="middle" → remove (near-default)

Strategy for valign=:
  - valign="top"    → style="vertical-align: top;" then remove attr
  - valign="middle" → remove (default)
  - valign="bottom" → style="vertical-align: bottom;" then remove attr

Strategy for border= on table:
  - border="0"              → remove attr
  - border="1" / bare border → add class="data-table" and remove attr
  - border="2"/"3"/higher   → style="border: Npx solid;" and remove attr

Strategy for border="0" on img:
  - remove attr

<center>…</center> → <div class="center-block">…</div>

The script works on whole-file content using regex substitution on full
HTML tags (including multi-line tags formatted by prettier).
"""

import re
import sys
import os
from pathlib import Path

DRY_RUN = "--dry-run" in sys.argv

ROOT = Path(__file__).parent.parent
HTML_FILES = sorted(ROOT.glob("**/*.html"))

STATS = {
    "align_removed": 0,
    "valign_removed": 0,
    "border0_table_removed": 0,
    "border1_table_class": 0,
    "borderhigh_table_style": 0,
    "border0_img_removed": 0,
    "center_replaced": 0,
    "files_modified": 0,
}


# ───────────────────────────────────────────────────────────────────────────────
# Helpers
# ───────────────────────────────────────────────────────────────────────────────

def has_style_prop(tag_str, prop, value=None):
    """Check if tag already has a given CSS property (optionally matching value)."""
    m = re.search(r'style="([^"]*)"', tag_str)
    if not m:
        return False
    style = m.group(1)
    if value:
        return bool(re.search(re.escape(prop) + r'\s*:\s*' + re.escape(value), style))
    return bool(re.search(re.escape(prop) + r'\s*:', style))


def add_or_merge_style(tag_str, new_prop, new_value):
    """Add a CSS declaration to an existing style="" or insert a new style attribute."""
    new_decl = f"{new_prop}: {new_value};"
    m = re.search(r'(style=")([^"]*)"', tag_str)
    if m:
        existing = m.group(2).strip().rstrip(";")
        # Don't duplicate
        if re.search(re.escape(new_prop) + r'\s*:', existing):
            return tag_str
        merged = existing + "; " + new_decl if existing else new_decl
        return tag_str[: m.start()] + f'style="{merged}"' + tag_str[m.end():]
    else:
        # Insert style before the closing > or />
        # Handle multi-line tags: put style attr on the same line as />, or before >
        return re.sub(r'(\s*)(/>|>)\s*$', lambda mm: f'{mm.group(1)} style="{new_decl}"{mm.group(2)}', tag_str, count=1, flags=re.MULTILINE)


# ───────────────────────────────────────────────────────────────────────────────
# Per-tag transformation
# ───────────────────────────────────────────────────────────────────────────────

def transform_tag(tag_str, counters):
    """
    Given a full tag string (possibly multi-line), apply all transformations
    and return the modified tag string.
    """
    tag_name_m = re.match(r'<(\w+)', tag_str)
    if not tag_name_m:
        return tag_str
    tag_name = tag_name_m.group(1).lower()

    # ── align= ───────────────────────────────────────────────────────────────
    align_m = re.search(r'\balign="([^"]*)"', tag_str)
    if align_m:
        align_val = align_m.group(1).lower().strip()

        if align_val in ("top", "texttop", "abscenter"):
            if tag_name in ("td", "th"):
                # Non-standard usage: vertical alignment
                if not has_style_prop(tag_str, "vertical-align"):
                    tag_str = add_or_merge_style(tag_str, "vertical-align", "top")
            # For img and other tags: these vertical hints → remove (no CSS equivalent needed)
            tag_str = re.sub(r'\s*\balign="[^"]*"', "", tag_str)
            counters["align_removed"] += 1

        elif align_val == "center":
            if not has_style_prop(tag_str, "text-align", "center"):
                if not has_style_prop(tag_str, "text-align"):
                    tag_str = add_or_merge_style(tag_str, "text-align", "center")
            tag_str = re.sub(r'\s*\balign="[^"]*"', "", tag_str)
            counters["align_removed"] += 1

        elif align_val == "left":
            if not has_style_prop(tag_str, "text-align", "left"):
                if not has_style_prop(tag_str, "text-align"):
                    tag_str = add_or_merge_style(tag_str, "text-align", "left")
            tag_str = re.sub(r'\s*\balign="[^"]*"', "", tag_str)
            counters["align_removed"] += 1

        elif align_val == "right":
            if not has_style_prop(tag_str, "text-align", "right"):
                if not has_style_prop(tag_str, "text-align"):
                    tag_str = add_or_merge_style(tag_str, "text-align", "right")
            tag_str = re.sub(r'\s*\balign="[^"]*"', "", tag_str)
            counters["align_removed"] += 1

        elif align_val == "middle":
            # Vertical-middle is close to browser default, just remove
            tag_str = re.sub(r'\s*\balign="[^"]*"', "", tag_str)
            counters["align_removed"] += 1

        else:
            # Unknown value — just remove
            tag_str = re.sub(r'\s*\balign="[^"]*"', "", tag_str)
            counters["align_removed"] += 1

    # ── valign= ──────────────────────────────────────────────────────────────
    valign_m = re.search(r'\bvalign="([^"]*)"', tag_str)
    if valign_m:
        valign_val = valign_m.group(1).lower().strip()

        if valign_val == "top":
            if not has_style_prop(tag_str, "vertical-align"):
                tag_str = add_or_merge_style(tag_str, "vertical-align", "top")
            tag_str = re.sub(r'\s*\bvalign="[^"]*"', "", tag_str)
            counters["valign_removed"] += 1

        elif valign_val == "middle":
            # Near-default, safe to drop
            tag_str = re.sub(r'\s*\bvalign="[^"]*"', "", tag_str)
            counters["valign_removed"] += 1

        elif valign_val == "bottom":
            if not has_style_prop(tag_str, "vertical-align"):
                tag_str = add_or_merge_style(tag_str, "vertical-align", "bottom")
            tag_str = re.sub(r'\s*\bvalign="[^"]*"', "", tag_str)
            counters["valign_removed"] += 1

        else:
            tag_str = re.sub(r'\s*\bvalign="[^"]*"', "", tag_str)
            counters["valign_removed"] += 1

    # ── border= on table ─────────────────────────────────────────────────────
    if tag_name == "table":
        border_m = re.search(r'\bborder="([^"]*)"', tag_str)
        bare_border = None if border_m else re.search(r'(?<=[<\s])border(?=[>\s/])', tag_str)

        if border_m:
            val = border_m.group(1).strip()
            if val == "0":
                tag_str = re.sub(r'\s*\bborder="0"', "", tag_str)
                counters["border0_table_removed"] += 1
            elif val == "1":
                # Replace border="1" with class="data-table"
                class_m = re.search(r'\bclass="([^"]*)"', tag_str)
                if class_m:
                    existing = class_m.group(1)
                    if "data-table" not in existing:
                        new_cls = existing + " data-table"
                        tag_str = tag_str[: class_m.start(1)] + new_cls + tag_str[class_m.end(1):]
                    tag_str = re.sub(r'\s*\bborder="1"', "", tag_str)
                else:
                    tag_str = re.sub(r'\s*\bborder="1"', ' class="data-table"', tag_str)
                counters["border1_table_class"] += 1
            else:
                # border="2", "3", etc.
                try:
                    bval = int(val)
                except ValueError:
                    bval = 1
                if not has_style_prop(tag_str, "border"):
                    tag_str = add_or_merge_style(tag_str, "border", f"{bval}px solid")
                tag_str = re.sub(r'\s*\bborder="[^"]*"', "", tag_str)
                counters["borderhigh_table_style"] += 1

        elif bare_border:
            # bare border attr = border="1"
            class_m = re.search(r'\bclass="([^"]*)"', tag_str)
            if class_m:
                existing = class_m.group(1)
                if "data-table" not in existing:
                    new_cls = existing + " data-table"
                    tag_str = tag_str[: class_m.start(1)] + new_cls + tag_str[class_m.end(1):]
            else:
                # Add class before closing > or />
                tag_str = re.sub(r'(\s*)(/>|>)\s*$',
                                 lambda mm: f'{mm.group(1)} class="data-table"{mm.group(2)}',
                                 tag_str, count=1, flags=re.MULTILINE)
            tag_str = re.sub(r'\s*\bborder\b(?!=)', "", tag_str)
            counters["border1_table_class"] += 1

    # ── border= on img ───────────────────────────────────────────────────────
    if tag_name == "img":
        img_border_m = re.search(r'\bborder="([^"]*)"', tag_str)
        if img_border_m:
            bval = img_border_m.group(1).strip()
            if bval == "0":
                tag_str = re.sub(r'\s*\bborder="0"', "", tag_str)
                counters["border0_img_removed"] += 1
            else:
                # border="1" or higher on img → inline style
                try:
                    bnum = int(bval)
                except ValueError:
                    bnum = 1
                if not has_style_prop(tag_str, "border"):
                    tag_str = add_or_merge_style(tag_str, "border", f"{bnum}px solid")
                tag_str = re.sub(r'\s*\bborder="[^"]*"', "", tag_str)
                counters["border0_img_removed"] += 1  # reuse counter for simplicity

    return tag_str


# ───────────────────────────────────────────────────────────────────────────────
# File processing
# ───────────────────────────────────────────────────────────────────────────────

# Match any opening tag: <tagname ... > or <tagname ... />  (multi-line via DOTALL)
# We use a non-greedy match for the interior to avoid crossing tag boundaries.
# The pattern captures from < to the first > not preceded by another tag start.
TAG_RE = re.compile(r'<[a-zA-Z]\w*(?:[^>"\']|"[^"]*"|\'[^\']*\')*(?:/>|>)', re.DOTALL)


def process_file(filepath):
    with open(filepath, "r", encoding="utf-8", errors="replace") as f:
        original = f.read()

    content = original
    counters = {k: 0 for k in STATS}

    # Pass 1: Transform tags
    def replace_tag(m):
        return transform_tag(m.group(0), counters)

    content = TAG_RE.sub(replace_tag, content)

    # Pass 2: Replace <center>…</center>
    def replace_center_open(m):
        counters["center_replaced"] += 1
        return '<div class="center-block">'

    content = re.sub(r'<center>', replace_center_open, content, flags=re.IGNORECASE)
    content = re.sub(r'</center>', '</div>', content, flags=re.IGNORECASE)

    if content != original:
        if not DRY_RUN:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)
        counters["files_modified"] = 1

    return counters


def main():
    print(f"Processing {len(HTML_FILES)} HTML files...")
    print(f"Dry run: {DRY_RUN}")
    print()

    totals = {k: 0 for k in STATS}

    for filepath in HTML_FILES:
        rel = filepath.relative_to(ROOT)
        counters = process_file(filepath)
        if counters.get("files_modified"):
            print(f"  Modified: {rel}")
            for k, v in counters.items():
                if k != "files_modified" and v > 0:
                    print(f"    {k}: {v}")
        for k, v in counters.items():
            totals[k] += v

    print()
    print("=" * 60)
    print("TOTALS:")
    for k, v in totals.items():
        if v > 0:
            print(f"  {k}: {v}")


if __name__ == "__main__":
    main()
