#!/usr/bin/env node
/**
 * generate-lesson-jsonld.ts
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

import fs from "fs";
import path from "path";

import { readJson } from "./lib/json.js";
import { buildLearningResourceBlock, extractCanonical, extractDescription, injectJsonLd } from "./lib/jsonld.js";
import { tutorialSequence, type LessonManifest } from "./lib/lessons.js";

const REPO_ROOT = path.resolve(__dirname, "..");
const COURSE_DIR = path.join(REPO_ROOT, "course");
const META_PATH = path.join(COURSE_DIR, "lesson-meta.json");
const MANIFEST_PATH = path.join(COURSE_DIR, "lesson-manifest.json");

const COURSE_URL = "https://bushidocodes.github.io/limerick-cobol/course/index.html";

interface MetaEntry {
	position: number;
	file: string;
	title: string;
	description: string;
	url: string;
}

// Derive the ordered tutorial sequence from lesson-manifest.json, deduplicating
// any file that appears in multiple topic groups.
const LESSON_SEQUENCE = tutorialSequence(readJson<LessonManifest>(MANIFEST_PATH));

/** Build the course LearningResource block for a lesson manifest entry. */
function buildJsonLdBlock(entry: MetaEntry): string {
	return buildLearningResourceBlock({
		name: entry.title,
		description: entry.description,
		url: entry.url,
		position: entry.position,
		isPartOf: {
			"@type": "Course",
			name: "COBOL Course",
			url: COURSE_URL,
		},
		learningResourceType: "Tutorial",
	});
}

function main(): void {
	// If lesson-meta.json already exists, load it so hand-edited fields survive.
	const existing: Record<string, Partial<MetaEntry>> = {};
	if (fs.existsSync(META_PATH)) {
		const parsed = readJson<MetaEntry[]>(META_PATH);
		for (const e of parsed) {
			existing[e.file] = e;
		}
	}

	const manifestOut: MetaEntry[] = [];

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
		const entry: MetaEntry = {
			position: i + 1,
			file,
			title: prev.title || title,
			description: prev.description || extractDescription(html),
			url: prev.url || extractCanonical(html),
		};
		manifestOut.push(entry);

		const block = buildJsonLdBlock(entry);
		html = injectJsonLd(html, block);

		fs.writeFileSync(filePath, html, "utf8");
		console.log(`  OK    ${file}`);
	}

	fs.writeFileSync(META_PATH, JSON.stringify(manifestOut, null, "\t") + "\n", "utf8");
	console.log(`\nWrote course/lesson-meta.json (${manifestOut.length} entries).`);
}

main();
