#!/usr/bin/env node
/**
 * add-reading-time.ts
 *
 * Estimates reading time for each course lesson from its body word count and
 * stamps the result onto <page-hero reading-time="X min">. Re-running updates
 * the existing attribute (idempotent).
 *
 * Reading speed: 200 wpm (appropriate for technical/tutorial content).
 * Minimum displayed: 1 min.
 */

import fs from "fs";
import path from "path";

import { readJson } from "./lib/json.js";
import { type LessonManifest, tutorialSequence } from "./lib/lessons.js";

const REPO_ROOT = path.resolve(__dirname, "..");
const COURSE_DIR = path.join(REPO_ROOT, "course");
const MANIFEST_PATH = path.join(COURSE_DIR, "lesson-manifest.json");

const WPM = 200;

const LESSON_FILES = tutorialSequence(readJson<LessonManifest>(MANIFEST_PATH)).map((link) => link.file);

/** Extract visible text from the <body> element, stripping scripts and tags. */
function extractBodyText(html: string): string {
	const body = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] ?? html;
	return body
		.replace(/<script[\s\S]*?<\/script(?:\s[^>]*)?>/gi, " ")
		.replace(/<style[\s\S]*?<\/style(?:\s[^>]*)?>/gi, " ")
		.replace(/<!--[\s\S]*?--!?>/g, " ")
		.replace(/<[^>]+>/g, " ")
		.replace(/&[a-zA-Z]+;/g, " ")
		.replace(/&#?\w+;/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

function countWords(text: string): number {
	return text.split(/\s+/).filter(Boolean).length;
}

function readingMinutes(wordCount: number): number {
	return Math.max(1, Math.round(wordCount / WPM));
}

function main(): void {
	for (const file of LESSON_FILES) {
		const filePath = path.join(COURSE_DIR, file);
		if (!fs.existsSync(filePath)) {
			console.warn(`  SKIP  ${file} (not found)`);
			continue;
		}

		let html = fs.readFileSync(filePath, "utf8");
		const words = countWords(extractBodyText(html));
		const mins = readingMinutes(words);
		const label = `${mins} min`;

		if (html.includes("reading-time=")) {
			html = html.replace(/\breading-time="[^"]*"/, `reading-time="${label}"`);
		} else {
			html = html.replace(/(<page-hero\b[^>]*)>/, `$1 reading-time="${label}">`);
		}

		fs.writeFileSync(filePath, html, "utf8");
		console.log(`  OK    ${file} — ${words} words → ${label}`);
	}
}

main();
