#!/usr/bin/env node
/**
 * add-prev-next-links.js
 *
 * For each lesson page in course/, injects <link rel="prev"> and
 * <link rel="next"> tags immediately after <link rel="canonical">.
 *
 * Uses absolute URLs matching the canonical href base so that crawlers
 * and browsers treat them the same way they treat the canonical link.
 *
 * Idempotent — re-running replaces any existing prev/next link tags.
 */

"use strict";

const fs = require("fs");
const path = require("path");

const REPO_ROOT = path.resolve(__dirname, "..");
const COURSE_DIR = path.join(REPO_ROOT, "course");
const MANIFEST_PATH = path.join(COURSE_DIR, "lesson-manifest.json");
const BASE_URL = "https://bushidocodes.github.io/limerick-cobol/course/";

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
const _seen = new Set();
const LESSON_SEQUENCE = [];
for (const topic of manifest.topics) {
	for (const link of topic.links) {
		if (link.type === "tutorial" && !_seen.has(link.file)) {
			_seen.add(link.file);
			LESSON_SEQUENCE.push({ file: link.file });
		}
	}
}

/**
 * Build the prev/next link tag block to inject.
 * Returns only the tags that apply (first lesson has no prev, last has no next).
 */
function buildLinkBlock(prev, next) {
	const lines = [];
	if (prev) lines.push(`\t\t<link rel="prev" href="${BASE_URL}${prev.file}" />`);
	if (next) lines.push(`\t\t<link rel="next" href="${BASE_URL}${next.file}" />`);
	return lines.join("\n");
}

/**
 * Remove any existing prev/next link tags, then inject new ones immediately
 * after the <link rel="canonical"> tag.
 */
function injectPrevNextLinks(html, prev, next) {
	// Strip existing prev/next tags (idempotency).
	html = html.replace(/\t\t<link rel="(?:prev|next)"[^\n]+\n/g, "");

	const block = buildLinkBlock(prev, next);
	if (!block) return html;

	// Insert after <link rel="canonical" ...>.
	return html.replace(/(\t\t<link rel="canonical"[^\n]+\n)/, `$1${block}\n`);
}

function main() {
	for (let i = 0; i < LESSON_SEQUENCE.length; i++) {
		const { file } = LESSON_SEQUENCE[i];
		const filePath = path.join(COURSE_DIR, file);

		if (!fs.existsSync(filePath)) {
			console.warn(`  SKIP  ${file} (not found)`);
			continue;
		}

		const prev = i > 0 ? LESSON_SEQUENCE[i - 1] : null;
		const next = i < LESSON_SEQUENCE.length - 1 ? LESSON_SEQUENCE[i + 1] : null;

		let html = fs.readFileSync(filePath, "utf8");
		html = injectPrevNextLinks(html, prev, next);
		fs.writeFileSync(filePath, html, "utf8");
		console.log(`  OK    ${file}`);
	}
}

main();
