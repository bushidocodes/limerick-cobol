#!/usr/bin/env node
/**
 * generate-exercise-jsonld.ts
 *
 * For each exercise page in the COBOL_EXERCISES sequence, reads title /
 * description / canonical URL from the existing HTML meta tags, builds a
 * LearningResource JSON-LD block, and injects it immediately after the
 * <link rel="icon"> tag — mirroring generate-lesson-jsonld.ts for the course.
 *
 * The sequence is sourced from components/exercise-progress.js (the single
 * source of truth that also drives the in-page <exercises-nav> widget), so the
 * structured data and the on-page sequence can never drift apart. Title comes
 * from that manifest; description and url are read from each page's existing
 * <meta name="description"> / <link rel="canonical">.
 *
 * Idempotent — re-running replaces the existing LearningResource block. Run
 * prettier afterwards (the build:* script does) to normalise formatting.
 */

import fs from "fs";
import path from "path";

import { loadExerciseSequence, type ExerciseEntry } from "./lib/exercises.js";

const REPO_ROOT = path.resolve(__dirname, "..");
const EXERCISES_DIR = path.join(REPO_ROOT, "exercises");
const PROGRESS_PATH = path.join(REPO_ROOT, "components", "exercise-progress.js");
const EXERCISES_URL = "https://bushidocodes.github.io/limerick-cobol/exercises/index.html";

/** Extract <meta name="description" content="..."> value from raw HTML. */
function extractDescription(html: string): string {
	return html.match(/<meta\s+name="description"\s+content="([^"]+)"/)?.[1] ?? "";
}

/** Extract <link rel="canonical" href="..."> value from raw HTML. */
function extractCanonical(html: string): string {
	return html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/)?.[1] ?? "";
}

/**
 * Build the JSON-LD <script> block string with tab indentation matching the
 * surrounding HTML (two tabs for the tag, three tabs for JSON content), the
 * same shape generate-lesson-jsonld.ts emits for course pages.
 */
function buildJsonLdBlock(entry: ExerciseEntry, position: number, html: string): string {
	const ld = {
		"@context": "https://schema.org",
		"@type": "LearningResource",
		name: entry.title,
		description: extractDescription(html),
		url: extractCanonical(html),
		position,
		isPartOf: {
			"@type": "Collection",
			name: "COBOL Programming Exercises",
			url: EXERCISES_URL,
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
		learningResourceType: "Exercise",
	};

	// Indent inner JSON with three tabs to match the course page style.
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
function injectJsonLd(html: string, block: string): string {
	// Strip existing LearningResource block (idempotency).
	html = html.replace(
		/\t\t<script type="application\/ld\+json">\n\t\t\t\{[\s\S]*?"@type": "LearningResource"[\s\S]*?<\/script>\n/g,
		"",
	);

	// Insert after <link rel="icon" ...>.
	return html.replace(/(\t\t<link rel="icon"[^\n]+\n)/, `$1${block}\n`);
}

function main(): void {
	const sequence = loadExerciseSequence(PROGRESS_PATH);

	for (let i = 0; i < sequence.length; i++) {
		const entry = sequence[i];
		const filePath = path.join(EXERCISES_DIR, entry.file);

		if (!fs.existsSync(filePath)) {
			console.warn(`  SKIP  ${entry.file} (not found)`);
			continue;
		}

		let html = fs.readFileSync(filePath, "utf8");
		const block = buildJsonLdBlock(entry, i + 1, html);
		html = injectJsonLd(html, block);
		fs.writeFileSync(filePath, html, "utf8");
		console.log(`  OK    ${entry.file}`);
	}
}

main();
