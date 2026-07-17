#!/usr/bin/env node

/**
 * add-exercise-prev-next-links.ts
 *
 * For each exercise page in the COBOL_EXERCISES sequence, injects
 * <link rel="prev"> and <link rel="next"> tags immediately after the
 * <link rel="canonical"> tag. This mirrors add-prev-next-links.ts (which
 * does the same for course/ lessons) so the exercise sequence carries the
 * same crawler/browser pagination hints as the course.
 *
 * The sequence is sourced from components/exercise-progress.js — the single
 * source of truth that also drives the in-page <exercises-nav> widget — so the
 * head links and the on-page prev/next buttons can never drift apart.
 *
 * Uses absolute URLs matching the canonical href base. Idempotent — re-running
 * replaces any existing prev/next link tags (single- or multi-line). Run
 * Biome format afterwards (the build:* script does) to normalise wrapping.
 */

import { fileURLToPath } from "node:url";
import fs from "fs";
import path from "path";
import { loadExerciseSequence } from "./lib/exercises.js";
import { injectPrevNextLinks } from "./lib/prev-next.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const EXERCISES_DIR = path.join(REPO_ROOT, "exercises");
const PROGRESS_PATH = path.join(REPO_ROOT, "components", "exercise-progress.js");
const BASE_URL = "https://bushidocodes.github.io/limerick-cobol/exercises/";

function main(): void {
	const sequence = loadExerciseSequence(PROGRESS_PATH);

	for (let i = 0; i < sequence.length; i++) {
		const { file } = sequence[i];
		const filePath = path.join(EXERCISES_DIR, file);

		if (!fs.existsSync(filePath)) {
			console.warn(`  SKIP  ${file} (not found)`);
			continue;
		}

		const prev = i > 0 ? sequence[i - 1].file : null;
		const next = i < sequence.length - 1 ? sequence[i + 1].file : null;

		let html = fs.readFileSync(filePath, "utf8");
		html = injectPrevNextLinks(html, prev, next, BASE_URL);
		fs.writeFileSync(filePath, html, "utf8");
		console.log(`  OK    ${file}`);
	}
}

main();
