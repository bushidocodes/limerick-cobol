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

const COURSE_URL =
	"https://bushidocodes.github.io/limerick-cobol/course/index.html";

// Lesson sequence — mirrors the array in components/lesson-progress.js.
// Titles here are the canonical lesson titles used for the LearningResource name.
const LESSON_SEQUENCE = [
	{ file: "COBOLIntro.html", title: "The structure of COBOL programs" },
	{ file: "DataDeclaration.html", title: "Declaring data in COBOL" },
	{ file: "COBOLcommands.html", title: "Basic Procedure Division commands" },
	{ file: "Selection.html", title: "Selection in COBOL" },
	{ file: "Iteration.html", title: "Iteration in COBOL" },
	{ file: "SequentialFiles1.html", title: "Introduction to Sequential files" },
	{ file: "SequentialFiles2.html", title: "Processing Sequential files" },
	{ file: "EditedPics.html", title: "Edited Pictures" },
	{ file: "Usage.html", title: "The USAGE clause" },
	{
		file: "SequentialFiles3.html",
		title: "COBOL print files and variable-length records",
	},
	{ file: "SortMerge.html", title: "Sorting and Merging" },
	{
		file: "Intro2DirectAccess.html",
		title: "Introduction to direct access files",
	},
	{ file: "RelativeFiles.html", title: "Relative Files" },
	{ file: "IndexedFiles.html", title: "Indexed Files" },
	{ file: "Tables1.html", title: "Using tables" },
	{ file: "Tables2.html", title: "Creating tables - syntax and semantics" },
	{ file: "Search.html", title: "Searching tables" },
	{ file: "Subprograms.html", title: "Contained and external sub-programs" },
	{ file: "Copy.html", title: "The COPY verb" },
	{ file: "Inspect.html", title: "Inspect" },
	{ file: "String.html", title: "String" },
	{ file: "Unstring.html", title: "Unstring" },
	{
		file: "RefMod.html",
		title: "Reference modification and Intrinsic Functions",
	},
	{ file: "ReportWriter.html", title: "Report Writer by example" },
	{ file: "ReportWriterSS.html", title: "Report Writer syntax and semantics" },
];

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
		""
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
