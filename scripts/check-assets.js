#!/usr/bin/env node
/**
 * check-assets.js
 *
 * Walk every *.html and *.css file in the repo (skipping node_modules, .git,
 * .claude, .playwright-mcp) and verify that:
 *   - every src/href attribute in HTML that points to a local file exists on disk
 *   - every intra-page #fragment target in HTML resolves to an id= on the same page
 *   - every url(...) reference in CSS that points to a local file exists on disk
 *
 * Exit code 0  – no broken references found.
 * Exit code 1  – one or more broken references found.
 */

"use strict";

const fs = require("fs");
const path = require("path");

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const REPO_ROOT = path.resolve(__dirname, "..");

const SKIP_DIRS = new Set(["node_modules", ".git", ".claude", ".playwright-mcp"]);

// Patterns that should never be treated as local file references.
const SKIP_PREFIXES = ["http://", "https://", "ftp://", "mailto:", "data:", "//"];

// ---------------------------------------------------------------------------
// Walk the directory tree and collect *.html files
// ---------------------------------------------------------------------------

function walkFilesByExtension(dir, ext, results = []) {
	let entries;
	try {
		entries = fs.readdirSync(dir, { withFileTypes: true });
	} catch {
		return results;
	}

	for (const entry of entries) {
		if (entry.isDirectory()) {
			if (!SKIP_DIRS.has(entry.name)) {
				walkFilesByExtension(path.join(dir, entry.name), ext, results);
			}
		} else if (entry.isFile() && entry.name.endsWith(ext)) {
			results.push(path.join(dir, entry.name));
		}
	}

	return results;
}

// ---------------------------------------------------------------------------
// Extract asset references from an HTML file
// ---------------------------------------------------------------------------

// Match src="..." href="..." (both " and ' delimiters).
const ATTR_RE = /(?:src|href)\s*=\s*(?:"([^"]+)"|'([^']+)')/gi;

// Match CSS url("..."), url('...'), url(...) — captures the inner path.
const CSS_URL_RE = /url\(\s*(?:"([^"]+)"|'([^']+)'|([^)'"]\S*?))\s*\)/gi;

function extractRefs(html) {
	const refs = [];
	let match;
	ATTR_RE.lastIndex = 0;
	while ((match = ATTR_RE.exec(html)) !== null) {
		refs.push(match[1] ?? match[2]);
	}
	return refs;
}

// Match id="..." and id='...' attributes.
const ID_RE = /\bid\s*=\s*(?:"([^"]+)"|'([^']+)')/gi;

function extractIds(html) {
	const ids = new Set();
	let match;
	ID_RE.lastIndex = 0;
	while ((match = ID_RE.exec(html)) !== null) {
		ids.add(match[1] ?? match[2]);
	}
	return ids;
}

function isLocalRef(ref) {
	for (const prefix of SKIP_PREFIXES) {
		if (ref.startsWith(prefix)) return false;
	}
	// Empty string or bare/intra-page fragment (handled separately)
	if (!ref.trim() || ref.startsWith("#")) return false;
	return true;
}

function stripQueryAndFragment(ref) {
	// Remove query string and fragment
	return ref.replace(/[?#].*$/, "");
}

function extractCssRefs(css) {
	const refs = [];
	let match;
	CSS_URL_RE.lastIndex = 0;
	while ((match = CSS_URL_RE.exec(css)) !== null) {
		refs.push(match[1] ?? match[2] ?? match[3]);
	}
	return refs;
}

function decodeHtmlEntities(str) {
	// Decode the handful of entities that commonly appear in href/src values.
	return str
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, '"')
		.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
		.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const htmlFiles = walkFilesByExtension(REPO_ROOT, ".html");
const cssFiles = walkFilesByExtension(REPO_ROOT, ".css");

let totalBroken = 0;
const report = [];

for (const htmlFile of htmlFiles) {
	const htmlDir = path.dirname(htmlFile);
	let html;
	try {
		html = fs.readFileSync(htmlFile, "utf8");
	} catch {
		continue;
	}

	const refs = extractRefs(html);
	const ids = extractIds(html);
	const broken = [];

	for (const rawRef of refs) {
		// Validate intra-page anchor fragments (#target).
		if (rawRef.startsWith("#")) {
			const fragment = rawRef.slice(1);
			if (fragment && !ids.has(fragment)) {
				broken.push({ ref: rawRef, note: "anchor not found in page" });
			}
			continue;
		}

		if (!isLocalRef(rawRef)) continue;

		const cleanRef = stripQueryAndFragment(decodeHtmlEntities(rawRef));
		if (!cleanRef) continue;

		const resolved = path.resolve(htmlDir, cleanRef);
		if (!fs.existsSync(resolved)) {
			broken.push({ ref: rawRef, resolved });
		}
	}

	if (broken.length > 0) {
		totalBroken += broken.length;
		report.push({ file: path.relative(REPO_ROOT, htmlFile), broken });
	}
}

for (const cssFile of cssFiles) {
	const cssDir = path.dirname(cssFile);
	let css;
	try {
		css = fs.readFileSync(cssFile, "utf8");
	} catch {
		continue;
	}

	const refs = extractCssRefs(css);
	const broken = [];

	for (const rawRef of refs) {
		if (!isLocalRef(rawRef)) continue;

		const cleanRef = stripQueryAndFragment(rawRef);
		if (!cleanRef) continue;

		const resolved = path.resolve(cssDir, cleanRef);
		if (!fs.existsSync(resolved)) {
			broken.push({ ref: rawRef, resolved });
		}
	}

	if (broken.length > 0) {
		totalBroken += broken.length;
		report.push({ file: path.relative(REPO_ROOT, cssFile), broken });
	}
}

if (report.length === 0) {
	console.log("check-assets: all asset references resolve. ✓");
	process.exit(0);
}

console.error(`check-assets: found ${totalBroken} broken asset reference(s).\n`);

for (const { file, broken } of report) {
	console.error(`  ${file}`);
	for (const { ref, note } of broken) {
		console.error(`    ✗ ${ref}${note ? `  (${note})` : ""}`);
	}
	console.error("");
}

process.exit(1);
