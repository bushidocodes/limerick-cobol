#!/usr/bin/env node
/**
 * build-search-index.js
 * Walks course/, exercises/, examples/, lectures/ and emits search-index.json
 * at the repo root. Each entry contains:
 *   p — repo-relative path (slash-separated)
 *   t — page title (from <title>)
 *   d — meta description (may be empty)
 *   s — section label (top-level folder)
 *
 * Internal slideshow / viewer pages under course/Resources/ are skipped — they
 * aren't user-facing destinations. Pages without a <title> are also skipped.
 */

const fs = require("fs");
const path = require("path");

const REPO_ROOT = path.resolve(__dirname, "..");
const OUTPUT_PATH = path.join(REPO_ROOT, "search-index.json");

const SCAN_DIRS = ["course", "exercises", "examples", "lectures"];
const SKIP_DIRS = new Set(["Resources", "vendor", ".playwright-mcp", "node_modules", ".claude"]);

/** Recursively collect *.html under `dir`, skipping SKIP_DIRS. */
function collectHtmlFiles(dir) {
	const results = [];
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			if (!SKIP_DIRS.has(entry.name)) results.push(...collectHtmlFiles(full));
		} else if (entry.isFile() && entry.name.endsWith(".html")) {
			results.push(full);
		}
	}
	return results;
}

function decodeEntities(s) {
	return s
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&nbsp;/g, " ");
}

function collapseWhitespace(s) {
	return s.replace(/\s+/g, " ").trim();
}

function extractTitle(html) {
	const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
	return m ? collapseWhitespace(decodeEntities(m[1])) : "";
}

function extractMetaDescription(html) {
	const metaRe = /<meta\b[^>]*>/gi;
	let m;
	while ((m = metaRe.exec(html))) {
		const tag = m[0];
		if (!/\bname\s*=\s*["']description["']/i.test(tag)) continue;
		const c = tag.match(/\bcontent\s*=\s*["']([^"']*)["']/i);
		if (c) return collapseWhitespace(decodeEntities(c[1]));
	}
	return "";
}

function buildIndex() {
	const entries = [];
	for (const dir of SCAN_DIRS) {
		const abs = path.join(REPO_ROOT, dir);
		if (!fs.existsSync(abs)) continue;
		for (const file of collectHtmlFiles(abs)) {
			const html = fs.readFileSync(file, "utf8");
			const title = extractTitle(html);
			if (!title) continue;
			const rel = path.relative(REPO_ROOT, file).replace(/\\/g, "/");
			entries.push({
				p: rel,
				t: title,
				d: extractMetaDescription(html),
				s: dir,
			});
		}
	}
	entries.sort((a, b) => a.p.localeCompare(b.p));
	fs.writeFileSync(OUTPUT_PATH, JSON.stringify(entries, null, "\t") + "\n", "utf8");
	console.log(`search-index.json written with ${entries.length} entries.`);
}

buildIndex();
