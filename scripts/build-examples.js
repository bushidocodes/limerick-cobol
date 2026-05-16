#!/usr/bin/env node
/**
 * build-examples.js
 *
 * Generates each examples/<topic>/<NAME>.html from its sibling .cbl COBOL
 * source file. Re-run this script whenever a .cbl file is edited, then run
 * prettier to normalise formatting before committing.
 *
 * Usage:  npm run build:examples
 */

"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const EXAMPLES_DIR = path.join(ROOT, "examples");
const BASE_URL = "https://bushidocodes.github.io/limerick-cobol/";
const OG_IMAGE = "https://bushidocodes.github.io/limerick-cobol/pics/og/examples.png";
const CROSS_LINKS = JSON.parse(fs.readFileSync(path.join(__dirname, "cross-links.json"), "utf8"));
const MAX_RELATED_PER_GROUP = 4;

const MANIFEST = require("./example-manifest");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function escapeHtml(str) {
	return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeAttr(str) {
	return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Truncate description to ≤155 chars, breaking at a word boundary. */
function truncate(text, max = 155) {
	if (text.length <= max) return text;
	const cut = text.lastIndexOf(" ", max);
	return (cut > 80 ? text.slice(0, cut) : text.slice(0, max)).trimEnd();
}

const MAX_FIXTURE_ROWS = 5;

/**
 * Build collapsible <details> blocks for each fixture file listed in entry.fixtures.
 * Missing files are silently skipped so entries can be declared defensively.
 */
function sampleDataHtml(entry) {
	if (!entry.fixtures || !entry.fixtures.length) return "";
	const dir = path.join(EXAMPLES_DIR, path.dirname(entry.file));
	let html = "";
	for (const dat of entry.fixtures) {
		const datPath = path.join(dir, dat);
		if (!fs.existsSync(datPath)) continue;
		const raw = fs.readFileSync(datPath, "utf8").replace(/\r\n/g, "\n");
		const allLines = raw.split("\n").filter((l) => l.length > 0);
		const shown = allLines.slice(0, MAX_FIXTURE_ROWS);
		const total = allLines.length;
		const suffix =
			total > MAX_FIXTURE_ROWS ? ` (first ${MAX_FIXTURE_ROWS} of ${total} records)` : ` (${total} records)`;
		const escaped = escapeHtml(shown.join("\n"));
		html +=
			`\t\t\t\t\t\t<details class="sample-data">\n` +
			`\t\t\t\t\t\t\t<summary>Sample data: ${dat}${suffix}</summary>\n` +
			`\t\t\t\t\t\t\t<pre>${escaped}</pre>\n` +
			`\t\t\t\t\t\t</details>\n`;
	}
	return html;
}

/**
 * Return the path prefix to reach the repo root from examples/<relFile>.
 * e.g. "Accept/ACCEPT.html"        -> "../../"
 *      "SubProg/Multiply/Foo.html" -> "../../../"
 */
function prefix(relFile) {
	const depth = relFile.split("/").length - 1;
	return "../".repeat(depth + 1);
}

/**
 * Build the <related-content> HTML for an example, sourced from cross-links.json.
 * Returns an empty string if the file is not in the cross-links map or has no
 * cross-references.
 */
function relatedContentHtml(relFile) {
	const key = "examples/" + relFile;
	const familyNames = CROSS_LINKS.files[key];
	if (!familyNames || !familyNames.length) return "";

	const lectureMap = new Map();
	const exampleMap = new Map();
	const exerciseMap = new Map();

	const add = (map, items) => {
		if (!items) return;
		for (const [href, title] of items) {
			if (href === key) continue;
			if (!map.has(href)) map.set(href, title);
		}
	};

	for (const familyName of familyNames) {
		const family = CROSS_LINKS.families[familyName];
		if (!family) throw new Error(`Unknown family "${familyName}" referenced by ${key}`);
		add(lectureMap, family.lectures);
		add(exampleMap, family.examples);
		add(exerciseMap, family.exercises);
	}

	const fromDir = path.dirname(path.join(ROOT, key));
	const toRelHref = (repoRelTarget) => {
		const abs = path.join(ROOT, repoRelTarget);
		return path.relative(fromDir, abs).split(path.sep).join("/");
	};

	const formatGroup = (map) => {
		const items = [];
		for (const [href, title] of map) {
			items.push(`${toRelHref(href)}|${title}`);
			if (items.length >= MAX_RELATED_PER_GROUP) break;
		}
		return items.join(", ");
	};

	const attrs = [];
	if (lectureMap.size) attrs.push(`lectures="${escapeAttr(formatGroup(lectureMap))}"`);
	if (exampleMap.size) attrs.push(`examples="${escapeAttr(formatGroup(exampleMap))}"`);
	if (exerciseMap.size) attrs.push(`exercises="${escapeAttr(formatGroup(exerciseMap))}"`);
	if (!attrs.length) return "";

	return `\t\t\t\t\t\t<related-content\n\t\t\t\t\t\t\t${attrs.join("\n\t\t\t\t\t\t\t")}\n\t\t\t\t\t\t></related-content>\n`;
}

// ---------------------------------------------------------------------------
// Page builder
// ---------------------------------------------------------------------------

function buildPage(entry) {
	const pfx = prefix(entry.file);
	const canonical = BASE_URL + "examples/" + entry.file;
	const metaDesc = escapeAttr(truncate(entry.desc));
	const metaTitle = escapeAttr(entry.title);
	const metaUrl = escapeAttr(canonical);

	const cblPath = path.join(EXAMPLES_DIR, path.dirname(entry.file), entry.cbl);
	// Strip UTF-8 BOM and normalise CRLF → LF (several .cbl files use Windows line endings).
	const cblSource = fs.readFileSync(cblPath, "utf8").replace(/^﻿/, "").replace(/\r\n/g, "\n").trimEnd();
	const escapedSource = escapeHtml(cblSource);

	const relatedEl = relatedContentHtml(entry.file);
	const sampleDataEl = sampleDataHtml(entry);

	const runInCeScript = entry.runInCe ? `\t\t<script src="${pfx}components/run-in-ce.js" defer></script>\n` : "";
	const runInCeToolbarEl = entry.runInCe ? `\t\t\t\t\t\t\t<run-in-ce></run-in-ce>\n` : "";

	return `<!doctype html>
<html lang="en">
\t<head>
\t\t<meta name="viewport" content="width=device-width, initial-scale=1" />
\t\t<meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
\t\t<meta name="theme-color" content="#1a1a1a" media="(prefers-color-scheme: dark)" />
\t\t<script>
\t\t\t(function () {
\t\t\t\tvar t = localStorage.getItem("lc-theme");
\t\t\t\tif (t === "dark" || t === "light") {
\t\t\t\t\tdocument.documentElement.setAttribute("data-theme", t);
\t\t\t\t\tvar color = t === "dark" ? "#1a1a1a" : "#ffffff";
\t\t\t\t\tvar meta = document.querySelector('meta[name="theme-color"]:not([media])');
\t\t\t\t\tif (!meta) {
\t\t\t\t\t\tmeta = document.createElement("meta");
\t\t\t\t\t\tmeta.name = "theme-color";
\t\t\t\t\t\tdocument.head.appendChild(meta);
\t\t\t\t\t}
\t\t\t\t\tmeta.content = color;
\t\t\t\t}
\t\t\t})();
\t\t</script>
\t\t<title>${entry.title}</title>
\t\t<meta name="description" content="${metaDesc}" />
\t\t<link rel="canonical" href="${metaUrl}" />
\t\t<!-- Open Graph -->
\t\t<meta property="og:type" content="website" />
\t\t<meta property="og:url" content="${metaUrl}" />
\t\t<meta property="og:title" content="${metaTitle}" />
\t\t<meta property="og:description" content="${metaDesc}" />
\t\t<meta property="og:image" content="${OG_IMAGE}" />
\t\t<!-- Twitter Card -->
\t\t<meta name="twitter:card" content="summary_large_image" />
\t\t<meta name="twitter:title" content="${metaTitle}" />
\t\t<meta name="twitter:description" content="${metaDesc}" />
\t\t<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
\t\t<link href="${pfx}course/Resources/css/course.css" rel="stylesheet" />
\t\t<link href="${pfx}course/Resources/css/course-components.css" rel="stylesheet" />
\t\t<link href="${pfx}course/Resources/vendor/prism/themes/prism.min.css" rel="stylesheet" />
\t\t<script src="${pfx}course/Resources/vendor/prism/prism.min.js" defer></script>
\t\t<script src="${pfx}course/Resources/vendor/prism/components/prism-cobol.min.js" defer></script>
\t\t<script src="${pfx}components/theme-toggle.js" defer></script>
\t\t<script src="${pfx}components/page-hero.js" defer></script>
\t\t<script src="${pfx}components/related-content.js" defer></script>
\t\t<script src="${pfx}components/copy-button.js" defer></script>
\t\t<script src="${pfx}components/site-header.js" defer></script>
\t\t<script src="${pfx}components/copyright-notice.js" defer></script>
\t\t<script src="${pfx}components/last-updated.js" defer></script>
\t\t<script src="${pfx}components/edit-on-github.js" defer></script>
${runInCeScript}\t</head>
\t<body>
\t\t<a class="skip-link" href="#main-content">Skip to main content</a>
\t\t<main id="main-content">
\t\t\t<div class="page-wrapper">
\t\t\t\t<div class="section-grid">
\t\t\t\t\t<div class="section-full">
\t\t\t\t\t\t<page-hero title="${metaTitle}"></page-hero>
\t\t\t\t\t\t<p>${entry.desc}</p>
${sampleDataEl}\t\t\t\t\t\t\t<div class="code-toolbar">
\t\t\t\t\t\t\t<a href="${entry.cbl}" download class="download-btn">Download ${entry.cbl}</a>
${runInCeToolbarEl}\t\t\t\t\t\t</div>
\t\t\t\t\t\t<pre class="language-cobol"><code class="language-cobol">${escapedSource}
</code></pre>
${relatedEl}\t\t\t\t\t\t<copyright-notice type="examples"></copyright-notice>
\t\t\t\t\t\t<last-updated></last-updated>
\t\t\t\t\t\t<edit-on-github></edit-on-github>
\t\t\t\t\t</div>
\t\t\t\t</div>
\t\t\t</div>
\t\t</main>
\t</body>
</html>
`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

module.exports = { MANIFEST, EXAMPLES_DIR };

if (require.main === module) {
	console.log("Building example HTML pages from .cbl sources…\n");

	let ok = 0;
	let fail = 0;

	for (const entry of MANIFEST) {
		const absPath = path.join(EXAMPLES_DIR, entry.file);
		try {
			const html = buildPage(entry);
			fs.writeFileSync(absPath, html, "utf8");
			console.log(`  OK  ${entry.file}`);
			ok++;
		} catch (err) {
			console.error(`  ERR ${entry.file}: ${err.message}`);
			fail++;
		}
	}

	console.log(`\nDone. ${ok} written, ${fail} failed.`);
	if (fail > 0) process.exit(1);
}
