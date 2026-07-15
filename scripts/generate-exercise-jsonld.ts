#!/usr/bin/env node
/**
 * generate-exercise-jsonld.ts
 *
 * For each exercise page in the COBOL_EXERCISES sequence, reads title /
 * description / canonical URL from the existing HTML meta tags, builds a
 * LearningResource JSON-LD block, and injects it immediately after the
 * <link rel="icon"> tag — mirroring generate-lesson-jsonld.ts for the course.
 * The shared block shape lives in lib/jsonld.ts.
 *
 * The sequence is sourced from components/exercise-progress.js (the single
 * source of truth that also drives the in-page <exercises-nav> widget), so the
 * structured data and the on-page sequence can never drift apart. Title comes
 * from that manifest; description and url are read from each page's existing
 * <meta name="description"> / <link rel="canonical">.
 *
 * Idempotent — re-running replaces the existing LearningResource block. Run
 * Biome format afterwards (the build:* script does) to normalise formatting.
 */

import fs from "fs";
import path from "path";

import { loadExerciseSequence } from "./lib/exercises.js";
import { buildLearningResourceBlock, extractCanonical, extractDescription, injectJsonLd } from "./lib/jsonld.js";

const REPO_ROOT = path.resolve(__dirname, "..");
const EXERCISES_DIR = path.join(REPO_ROOT, "exercises");
const PROGRESS_PATH = path.join(REPO_ROOT, "components", "exercise-progress.js");
const EXERCISES_URL = "https://bushidocodes.github.io/limerick-cobol/exercises/index.html";

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
		const block = buildLearningResourceBlock({
			name: entry.title,
			description: extractDescription(html),
			url: extractCanonical(html),
			position: i + 1,
			isPartOf: {
				"@type": "Collection",
				name: "COBOL Programming Exercises",
				url: EXERCISES_URL,
			},
			learningResourceType: "Exercise",
		});
		html = injectJsonLd(html, block);
		fs.writeFileSync(filePath, html, "utf8");
		console.log(`  OK    ${entry.file}`);
	}
}

main();
