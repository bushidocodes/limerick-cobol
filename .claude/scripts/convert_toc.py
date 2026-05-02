"""Convert the table-based top-of-page TOC index into a `<ul class="toc">`.

Two transformations are applied to each course/*.html file (idempotent):

1. The single `<table ... width="700">` block at the top of the page (whose
   rows have a 3%/4%/93% column layout, the 4% column being a BallGreenG.gif
   bullet) is replaced by a semantic `<ul class="toc">` with one `<li>` per
   row containing the original 93%-column content.

2. Pages that were converted earlier and used an inline
   `style="list-style-image: ..."` on the `<ul class="toc">` get that inline
   style stripped — styling is centralised in the page's `<style>` block.

3. The page's `<style>` block has the .toc rules injected (once).

Run with no arguments to process every file in the course directory:

    python .claude/scripts/convert_toc.py
"""

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TARGET_DIRS = [ROOT / "course", ROOT / "lectures"]

TOC_TABLE_RE = re.compile(
    r'<table\b[^>]*\bwidth="700"[^>]*>.*?</table>',
    re.DOTALL | re.IGNORECASE,
)

ROW_RE = re.compile(r'<tr\b[^>]*>(.*?)</tr>', re.DOTALL | re.IGNORECASE)
TD93_RE = re.compile(
    r'<td\b[^>]*\bwidth="93%"[^>]*>(.*?)</td>',
    re.DOTALL | re.IGNORECASE,
)

# Already-converted pages used an inline style on the UL — strip it.
INLINE_TOC_UL_RE = re.compile(
    r'<ul\b([^>]*?)\bclass="toc"([^>]*?)>',
    re.IGNORECASE,
)
INLINE_LIST_STYLE_RE = re.compile(
    r'\s*style="[^"]*list-style-image[^"]*"',
    re.IGNORECASE,
)

CSS_MARKER = 'ul.toc {'

BALL_IMG_RE = re.compile(
    r'(?:src="|url\()([^"\)]*[Bb]all[Gg]reen[Gg]\.gif)',
)

# Match the contiguous block of `ul.toc ...` rules we wrote previously, so
# subsequent runs can replace them in place without leaving stale rules behind.
EXISTING_TOC_CSS_RE = re.compile(
    r'(?:^[ \t]*ul\.toc[^\n]*\n)+',
    re.MULTILINE,
)

TOC_UL_RE = re.compile(
    r'(<ul\b[^>]*\bclass="toc"[^>]*>)(.*?)(</ul>)',
    re.DOTALL | re.IGNORECASE,
)
LI_RE = re.compile(r'<li\b[^>]*>(.*?)</li>', re.DOTALL | re.IGNORECASE)
# Trailing <br>/<br/> sequences (possibly nested in stray empty </font>, </b>,
# whitespace, etc.) at the end of a block of content.
TRAILING_BR_RE = re.compile(
    r'(?:\s*<br\s*/?\s*>)+\s*$',
    re.IGNORECASE,
)


def toc_css(ball_url: str) -> str:
    return (
        f'  ul.toc {{ list-style-image: url({ball_url}); padding-left: 2.5em; margin: 1em 0; }}\n'
        '  ul.toc > li { padding-left: 0.4em; margin-bottom: 0.6em; }'
    )


def convert_toc_table(table_html: str) -> str | None:
    if not BALL_IMG_RE.search(table_html):
        return None
    items = []
    for row_match in ROW_RE.finditer(table_html):
        cell_match = TD93_RE.search(row_match.group(1))
        if cell_match:
            items.append(cell_match.group(1).strip())
    if not items:
        return None
    li_html = '\n'.join(f'<li>{item}</li>' for item in items)
    return f'<ul class="toc">\n{li_html}\n</ul>'


def strip_inline_toc_style(text: str) -> str:
    def repl(match: re.Match) -> str:
        before, after = match.group(1), match.group(2)
        before = INLINE_LIST_STYLE_RE.sub('', before).rstrip()
        after = INLINE_LIST_STYLE_RE.sub('', after).rstrip()
        prefix = f' {before}' if before else ''
        suffix = f' {after}' if after else ''
        return f'<ul{prefix} class="toc"{suffix}>'
    return INLINE_TOC_UL_RE.sub(repl, text)


def inject_toc_css(text: str, ball_url: str) -> str:
    new_css = toc_css(ball_url) + '\n'
    if CSS_MARKER in text:
        return EXISTING_TOC_CSS_RE.sub(new_css, text, count=1)
    # Inject just before the closing </style> of the first style block.
    m = re.search(r'</style>', text, re.IGNORECASE)
    if not m:
        return text
    insert_at = m.start()
    return text[:insert_at] + new_css + text[insert_at:]


CLOSING_TAG_RE = re.compile(
    r'(.*)(</(p|div|font|b|i|center)\s*>\s*)$',
    re.DOTALL | re.IGNORECASE,
)


def strip_trailing_brs_in_block(content: str) -> str:
    """Recursively strip trailing <br/> tags from the end of `content`,
    descending through any closing wrapper tags (e.g., </p>, </div>, </font>)
    so trailing breaks like `text<br/></p>` or `text<br/><br/></font></p>`
    are removed. Also collapses any wrapper that becomes empty after stripping.
    """
    m = CLOSING_TAG_RE.search(content)
    if m:
        inside = strip_trailing_brs_in_block(m.group(1))
        tag = m.group(3).lower()
        open_re = re.compile(rf'<{tag}\b[^>]*>\s*$', re.IGNORECASE)
        if open_re.search(inside):
            return open_re.sub('', inside).rstrip()
        return inside + m.group(2)
    return TRAILING_BR_RE.sub('', content)


WRAPPER_RE = re.compile(
    r'^(\s*)<(p|div)\b[^>]*>(.*)</\2>(\s*)$',
    re.DOTALL | re.IGNORECASE,
)


def unwrap_block_in_li(content: str) -> str:
    """If the LI's content is a single <p>...</p> or <div>...</div> wrapper,
    remove the wrapper tags so its children become direct children of <li>.
    Repeats until the content is no longer wrapped (handles nested wrappers
    like <div><p>...</p></div>)."""
    while True:
        m = WRAPPER_RE.match(content)
        if not m:
            return content
        tag = m.group(2).lower()
        inner = m.group(3)
        # Only unwrap if the inner has no other top-level closer for the same
        # tag — guards against unwrapping `<p>a</p><p>b</p>` style siblings.
        if f'</{tag}>' in inner.lower() or f'</{tag.upper()}>' in inner:
            return content
        content = m.group(1) + inner + m.group(4)


def transform_toc(text: str) -> str:
    def fix_li(li_match: re.Match) -> str:
        inner = li_match.group(1)
        inner = unwrap_block_in_li(inner)
        inner = strip_trailing_brs_in_block(inner)
        return f'<li>{inner}</li>'

    def fix_ul(ul_match: re.Match) -> str:
        opening, body, closing = ul_match.group(1), ul_match.group(2), ul_match.group(3)
        new_body = LI_RE.sub(fix_li, body)
        return opening + new_body + closing

    return TOC_UL_RE.sub(fix_ul, text)


def detect_ball_url(text: str) -> str | None:
    m = BALL_IMG_RE.search(text)
    return m.group(1) if m else None


def process_file(path: Path) -> bool:
    text = path.read_text(encoding='utf-8')
    new_text = TOC_TABLE_RE.sub(
        lambda m: convert_toc_table(m.group(0)) or m.group(0),
        text,
    )
    new_text = strip_inline_toc_style(new_text)
    new_text = transform_toc(new_text)
    if 'class="toc"' in new_text:
        ball_url = detect_ball_url(text) or detect_ball_url(new_text)
        if ball_url:
            new_text = inject_toc_css(new_text, ball_url)
    if new_text == text:
        return False
    path.write_text(new_text, encoding='utf-8')
    return True


def main(argv):
    if len(argv) > 1:
        files = []
        for a in argv[1:]:
            p = Path(a)
            if p.exists():
                files.append(p)
                continue
            for d in TARGET_DIRS:
                if (d / p.name).exists():
                    files.append(d / p.name)
                    break
    else:
        files = []
        for d in TARGET_DIRS:
            files.extend(sorted(d.glob('*.html')))
    for path in files:
        changed = process_file(path)
        print(f'{"CHANGED" if changed else "       "}  {path.name}')


if __name__ == '__main__':
    main(sys.argv)
