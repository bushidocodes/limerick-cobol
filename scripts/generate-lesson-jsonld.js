#!/usr/bin/env node
/**
 * generate-lesson-jsonld.js
 *
 * For each lesson page in course/, reads title / description / canonical URL
 * from the existing HTML meta tags, builds a LearningResource JSON-LD block,
 * and injects it immediately after the <link rel="icon"> tag.
 *
 * Also writes course/lesson-meta.json as a human-maintainable manifest.
 * Edit that file to override any field; re-run this script to re-inject.
 *
 * Idempotent — re-running replaces the existing LearningResource block.
 */

"use strict";

const fs = require("fs");
const path = require("path");

const REPO_ROOT = path.resolve(__dirname, "..");
const COURSE_DIR = path.join(REPO_ROOT, "course");
const META_PATH = path.join(COURSE_DIR, "lesson-meta.json");
const MANIFEST_PATH = path.join(COURSE_DIR, "lesson-manifest.json");

const COURSE_URL = "https://bushidocodes.github.io/limerick-cobol/course/index.html";

// Derive the ordered tutorial sequence from lesson-manifest.json, deduplicating
// any file that appears in multiple topic groups.
const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
const _seen = new Set();
const LESSON_SEQUENCE = [];
for (const topic of manifest.topics) {
	for (const link of topic.links) {
		if (link.type === "tutorial" && !_seen.has(link.file)) {
			_seen.add(link.file);
			LESSON_SEQUENCE.push({ file: link.file, title: link.title });
		}
	}
}

/** Extract <meta name="description" content="..."> value from raw HTML. */
function extractDescription(html) {
	const m = html.match(/<meta\s+name="description"\s+content="([^"]+)"/);
	return m ? m[1] : "";
}

/** Extract <link rel="canonical" href="..."> value from raw HTML. */
function extractCanonical(html) {
	const m = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/);
	return m ? m[1] : "";
}

/**
 * Build the JSON-LD <script> block string with tab indentation matching the
 * surrounding HTML (two tabs for the tag, three tabs for JSON content).
 */
function buildJsonLdBlock(entry) {
	const ld = {
		"@context": "https://schema.org",
		"@type": "LearningResource",
		name: entry.title,
		description: entry.description,
		url: entry.url,
		position: entry.position,
		isPartOf: {
			"@type": "Course",
			name: "COBOL Course",
			url: COURSE_URL,
		},
		provider: {
			"@type": "Person",
			name: "Michael Coughlan",
			affiliation: {
				"@type": "Organization",
				name: "University of Limerick CSIS",
			},
		},
		educationalLevel: "beginner",
		inLanguage: "en",
		learningResourceType: "Tutorial",
	};

	// Indent inner JSON with three tabs to match course/index.html style.
	const inner = JSON.stringify(ld, null, "\t")
		.split("\n")
		.map((line, i) => (i === 0 ? line : "\t\t\t" + line))
		.join("\n");

	return `\t\t<script type="application/ld+json">\n\t\t\t${inner}\n\t\t</script>`;
}

/**
 * Remove any existing LearningResource JSON-LD block from the HTML string,
 * then inject the new block immediately after the <link rel="icon"> tag.
 */
function injectJsonLd(html, block) {
	// Strip existing LearningResource block (idempotency).
	html = html.replace(
		/\t\t<script type="application\/ld\+json">\n\t\t\t\{[\s\S]*?"@type": "LearningResource"[\s\S]*?<\/script>\n/,
		"",
	);

	// Insert after <link rel="icon" ...>.
	return html.replace(/(\t\t<link rel="icon"[^\n]+\n)/, `$1${block}\n`);
}

function main() {
	// If lesson-meta.json already exists, load it so hand-edited fields survive.
	let existing = {};
	if (fs.existsSync(META_PATH)) {
		const parsed = JSON.parse(fs.readFileSync(META_PATH, "utf8"));
		for (const e of parsed) {
			existing[e.file] = e;
		}
	}

	const manifest = [];

	for (let i = 0; i < LESSON_SEQUENCE.length; i++) {
		const { file, title } = LESSON_SEQUENCE[i];
		const filePath = path.join(COURSE_DIR, file);

		if (!fs.existsSync(filePath)) {
			console.warn(`  SKIP  ${file} (not found)`);
			continue;
		}

		let html = fs.readFileSync(filePath, "utf8");

		// Prefer values from existing manifest (hand-editable), fall back to HTML.
		const prev = existing[file] || {};
		const entry = {
			position: i + 1,
			file,
			title: prev.title || title,
			description: prev.description || extractDescription(html),
			url: prev.url || extractCanonical(html),
		};
		manifest.push(entry);

		const block = buildJsonLdBlock(entry);
		html = injectJsonLd(html, block);

		fs.writeFileSync(filePath, html, "utf8");
		console.log(`  OK    ${file}`);
	}

	fs.writeFileSync(META_PATH, JSON.stringify(manifest, null, "\t") + "\n", "utf8");
	console.log(`\nWrote course/lesson-meta.json (${manifest.length} entries).`);
}

main();
