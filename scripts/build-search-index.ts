#!/usr/bin/env node

/**
 * build-search-index.ts
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

import { fileURLToPath } from "node:url";
import fs from "fs";
import path from "path";
import { collectHtmlFiles } from "./lib/html-files.js";
import { collapseWhitespace, decodeEntities } from "./lib/html-text.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const OUTPUT_PATH = path.join(REPO_ROOT, "search-index.json");

const SCAN_DIRS = ["course", "exercises", "examples", "lectures"];
const SKIP_DIRS = new Set(["Resources", "vendor", ".playwright-mcp", "node_modules", ".claude"]);

interface SearchEntry {
	p: string;
	t: string;
	d: string;
	s: string;
}

function extractTitle(html: string): string {
	const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
	return title !== undefined ? collapseWhitespace(decodeEntities(title)) : "";
}

function extractMetaDescription(html: string): string {
	const metaRe = /<meta\b[^>]*>/gi;
	let m: RegExpExecArray | null;
	while ((m = metaRe.exec(html))) {
		const tag = m[0];
		if (!/\bname\s*=\s*["']description["']/i.test(tag)) continue;
		const content = tag.match(/\bcontent\s*=\s*["']([^"']*)["']/i)?.[1];
		if (content !== undefined) return collapseWhitespace(decodeEntities(content));
	}
	return "";
}

function buildIndex(): void {
	const entries: SearchEntry[] = [];
	for (const dir of SCAN_DIRS) {
		const abs = path.join(REPO_ROOT, dir);
		if (!fs.existsSync(abs)) continue;
		for (const file of collectHtmlFiles(abs, SKIP_DIRS)) {
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
