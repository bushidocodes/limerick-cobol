#!/usr/bin/env node
/**
 * add-prev-next-links.ts
 *
 * For each lesson page in course/, injects <link rel="prev"> and
 * <link rel="next"> tags immediately after <link rel="canonical">.
 *
 * Uses absolute URLs matching the canonical href base so that crawlers
 * and browsers treat them the same way they treat the canonical link.
 *
 * Idempotent — re-running replaces any existing prev/next link tags.
 */

import fs from "fs";
import path from "path";

import { readJson } from "./lib/json.js";
import { type LessonManifest, tutorialSequence } from "./lib/lessons.js";
import { injectPrevNextLinks } from "./lib/prev-next.js";

const REPO_ROOT = path.resolve(__dirname, "..");
const COURSE_DIR = path.join(REPO_ROOT, "course");
const MANIFEST_PATH = path.join(COURSE_DIR, "lesson-manifest.json");
const BASE_URL = "https://bushidocodes.github.io/limerick-cobol/course/";

const LESSON_SEQUENCE = tutorialSequence(readJson<LessonManifest>(MANIFEST_PATH));

function main(): void {
	for (let i = 0; i < LESSON_SEQUENCE.length; i++) {
		const { file } = LESSON_SEQUENCE[i];
		const filePath = path.join(COURSE_DIR, file);

		if (!fs.existsSync(filePath)) {
			console.warn(`  SKIP  ${file} (not found)`);
			continue;
		}

		const prev = i > 0 ? LESSON_SEQUENCE[i - 1].file : null;
		const next = i < LESSON_SEQUENCE.length - 1 ? LESSON_SEQUENCE[i + 1].file : null;

		let html = fs.readFileSync(filePath, "utf8");
		html = injectPrevNextLinks(html, prev, next, BASE_URL);
		fs.writeFileSync(filePath, html, "utf8");
		console.log(`  OK    ${file}`);
	}
}

main();
