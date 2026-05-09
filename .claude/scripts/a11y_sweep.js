// One-shot a11y sweep applied to existing HTML files.
//
// For each file passed as an argument:
//   1. Adds lang="en" to <html> if not already present.
//   2. Ensures a <meta name="viewport" ...> is the first child of <head>
//      (FOUC fix — see memory feedback_viewport_fouc.md). If a viewport meta
//      exists elsewhere it's moved; if missing, the canonical
//      width=device-width, initial-scale=1 form is inserted.
//   3. Adds alt="" to <img> tags without an alt attribute *only* when the
//      src matches an icon naming pattern (i-foo.gif, BallRedG.gif, etc.).
//      Content figures (e.g. Compute.gif, Perform1.gif) are left alone so
//      pa11y continues to flag them as TODOs needing descriptive alt text.
//
// Idempotent: re-running on a treated file is a no-op.

const fs = require("fs");

// Icon naming patterns observed in pics/ and Resources/pics/. Matches src
// basenames starting with these prefixes (so e.g. i-Tut.gif, BallRedG.gif,
// T-Dept.gif, aai-Legend.gif, PanelLine_*.gif all hit). Misses are fine —
// they fall through to the "leave for follow-up" branch.
const ICON_SRC_RE = /(?:^|[/\\])(?:i-|I-|T-|t-|b-|B-|aai-|Ball|PanelLine)/i;

const VIEWPORT_TAG_RE =
	/<meta\b[^>]*\bname\s*=\s*["']viewport["'][^>]*\/?>/i;
const VIEWPORT_LINE_RE =
	/(?:\r?\n)?[ \t]*<meta\b[^>]*\bname\s*=\s*["']viewport["'][^>]*\/?>[ \t]*(?=\r?\n|$)/i;
const HEAD_OPEN_RE = /<head\b[^>]*>/i;

function addLang(s) {
	const m = s.match(/<html\b([^>]*)>/i);
	if (!m) return { s, changed: false };
	if (/\blang\s*=/i.test(m[1])) return { s, changed: false };
	const out = s.replace(/<html\b([^>]*)>/i, '<html lang="en"$1>');
	return { s: out, changed: true };
}

function moveViewportFirst(s) {
	const headOpen = s.match(HEAD_OPEN_RE);
	if (!headOpen) return { s, changed: false };
	const afterHead = s.slice(headOpen.index + headOpen[0].length);

	// Already first child? (skip whitespace, see if next tag is viewport)
	const firstTagMatch = afterHead.match(/^\s*(<[^>]+>)/);
	if (
		firstTagMatch &&
		/\bname\s*=\s*["']viewport["']/i.test(firstTagMatch[1])
	) {
		return { s, changed: false };
	}

	// Capture and remove existing viewport tag (anywhere in doc).
	let viewportTag;
	const vpExisting = s.match(VIEWPORT_TAG_RE);
	if (vpExisting) {
		viewportTag = vpExisting[0];
		s = s.replace(VIEWPORT_LINE_RE, "");
	} else {
		viewportTag =
			'<meta name="viewport" content="width=device-width, initial-scale=1" />';
	}

	// Re-find <head> after removal.
	const headOpen2 = s.match(HEAD_OPEN_RE);
	const insertAt = headOpen2.index + headOpen2[0].length;
	const after = s.slice(insertAt);

	// Look for the indentation of the first child element after <head>.
	const childIndentMatch = after.match(/^\s*?\r?\n([ \t]+)<\w/);
	const indent = childIndentMatch ? childIndentMatch[1] : "\t\t";

	// Match the document's line ending style (CRLF or LF).
	const eol = /\r\n/.test(s) ? "\r\n" : "\n";

	const out =
		s.slice(0, insertAt) + eol + indent + viewportTag + s.slice(insertAt);
	return { s: out, changed: true };
}

function addAltToImgs(s) {
	let added = 0;
	let skipped = 0;
	const out = s.replace(/<img\b[\s\S]*?>/g, (m) => {
		if (/\balt\s*=/i.test(m)) return m;
		const srcMatch = m.match(/src\s*=\s*["']([^"']+)["']/i);
		if (!srcMatch || !ICON_SRC_RE.test(srcMatch[1])) {
			skipped++;
			return m;
		}
		added++;
		return m.replace(/(\s*\/?>)$/, ' alt=""$1');
	});
	return { s: out, changed: added > 0, count: added, skipped };
}

function processFile(file) {
	const original = fs.readFileSync(file, "utf8");
	let s = original;
	const changes = [];

	const r1 = addLang(s);
	s = r1.s;
	if (r1.changed) changes.push("lang");

	const r2 = moveViewportFirst(s);
	s = r2.s;
	if (r2.changed) changes.push("viewport-first");

	const r3 = addAltToImgs(s);
	s = r3.s;
	if (r3.changed) changes.push(`${r3.count} alt`);
	if (r3.skipped) changes.push(`${r3.skipped} content-img skipped`);

	if (s !== original || r3.skipped) {
		if (s !== original) fs.writeFileSync(file, s);
		return changes.join(", ");
	}
	return null;
}

const files = process.argv.slice(2);
let touched = 0;
for (const f of files) {
	try {
		const result = processFile(f);
		if (result) {
			touched++;
			console.log(`${f}: ${result}`);
		}
	} catch (err) {
		console.error(`${f}: ERROR ${err.message}`);
	}
}
console.log(`\n${touched} of ${files.length} files modified`);
