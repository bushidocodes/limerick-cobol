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
 * prettier afterwards (the build:* script does) to normalise wrapping.
 */

import fs from "fs";
import path from "path";

import { loadExerciseSequence, type ExerciseEntry } from "./lib/exercises.js";

const REPO_ROOT = path.resolve(__dirname, "..");
const EXERCISES_DIR = path.join(REPO_ROOT, "exercises");
const PROGRESS_PATH = path.join(REPO_ROOT, "components", "exercise-progress.js");
const BASE_URL = "https://bushidocodes.github.io/limerick-cobol/exercises/";

/**
 * Build the prev/next link tag block to inject.
 * Returns only the tags that apply (first exercise has no prev, last has no next).
 */
function buildLinkBlock(prev: ExerciseEntry | null, next: ExerciseEntry | null): string {
	const lines: string[] = [];
	if (prev) lines.push(`\t\t<link rel="prev" href="${BASE_URL}${prev.file}" />`);
	if (next) lines.push(`\t\t<link rel="next" href="${BASE_URL}${next.file}" />`);
	return lines.join("\n");
}

/**
 * Remove any existing prev/next link tags, then inject new ones immediately
 * after the <link rel="canonical"> tag. The `[^>]*` spans newlines (it only
 * stops at the tag's own closing `>`), so both single-line and prettier-wrapped
 * multi-line <link> tags are matched.
 */
function injectPrevNextLinks(html: string, prev: ExerciseEntry | null, next: ExerciseEntry | null): string {
	// Strip existing prev/next tags (idempotency).
	html = html.replace(/\t\t<link[^>]*rel="(?:prev|next)"[^>]*\/>\n/g, "");

	const block = buildLinkBlock(prev, next);
	if (!block) return html;

	// Insert after the <link rel="canonical" ... /> tag.
	return html.replace(/(\t\t<link[^>]*rel="canonical"[^>]*\/>\n)/, `$1${block}\n`);
}

function main(): void {
	const sequence = loadExerciseSequence(PROGRESS_PATH);

	for (let i = 0; i < sequence.length; i++) {
		const { file } = sequence[i];
		const filePath = path.join(EXERCISES_DIR, file);

		if (!fs.existsSync(filePath)) {
			console.warn(`  SKIP  ${file} (not found)`);
			continue;
		}

		const prev = i > 0 ? sequence[i - 1] : null;
		const next = i < sequence.length - 1 ? sequence[i + 1] : null;

		let html = fs.readFileSync(filePath, "utf8");
		html = injectPrevNextLinks(html, prev, next);
		fs.writeFileSync(filePath, html, "utf8");
		console.log(`  OK    ${file}`);
	}
}

main();
