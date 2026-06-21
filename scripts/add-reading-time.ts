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

const REPO_ROOT = path.resolve(__dirname, "..");
const COURSE_DIR = path.join(REPO_ROOT, "course");
const MANIFEST_PATH = path.join(COURSE_DIR, "lesson-manifest.json");

const WPM = 200;

interface TopicLink {
	type: string;
	file: string;
	title: string;
}

interface LessonManifest {
	topics: { links: TopicLink[] }[];
}

const manifest: LessonManifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
const _seen = new Set<string>();
const LESSON_FILES: string[] = [];
for (const topic of manifest.topics) {
	for (const link of topic.links) {
		if (link.type === "tutorial" && !_seen.has(link.file)) {
			_seen.add(link.file);
			LESSON_FILES.push(link.file);
		}
	}
}

/** Extract visible text from the <body> element, stripping scripts and tags. */
function extractBodyText(html: string): string {
	const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
	const body = bodyMatch ? bodyMatch[1] : html;
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
