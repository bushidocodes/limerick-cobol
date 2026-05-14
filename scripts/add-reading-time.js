#!/usr/bin/env node
/**
 * add-reading-time.js
 *
 * Estimates reading time for each course lesson from its body word count and
 * stamps the result onto <page-hero reading-time="X min">. Re-running updates
 * the existing attribute (idempotent).
 *
 * Reading speed: 200 wpm (appropriate for technical/tutorial content).
 * Minimum displayed: 1 min.
 */

"use strict";

const fs = require("fs");
const path = require("path");

const REPO_ROOT = path.resolve(__dirname, "..");
const COURSE_DIR = path.join(REPO_ROOT, "course");

const WPM = 200;

// Mirrors LESSON_SEQUENCE in generate-lesson-jsonld.js.
const LESSON_FILES = [
	"COBOLIntro.html",
	"DataDeclaration.html",
	"COBOLcommands.html",
	"Selection.html",
	"Iteration.html",
	"SequentialFiles1.html",
	"SequentialFiles2.html",
	"EditedPics.html",
	"Usage.html",
	"SequentialFiles3.html",
	"SortMerge.html",
	"Intro2DirectAccess.html",
	"RelativeFiles.html",
	"IndexedFiles.html",
	"Tables1.html",
	"Tables2.html",
	"Search.html",
	"Subprograms.html",
	"Copy.html",
	"Inspect.html",
	"String.html",
	"Unstring.html",
	"RefMod.html",
	"ReportWriter.html",
	"ReportWriterSS.html",
];

/** Extract visible text from the <body> element, stripping scripts and tags. */
function extractBodyText(html) {
	const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
	const body = bodyMatch ? bodyMatch[1] : html;
	return body
		.replace(/<script[\s\S]*?<\/script>/gi, " ")
		.replace(/<style[\s\S]*?<\/style>/gi, " ")
		.replace(/<!--[\s\S]*?-->/g, " ")
		.replace(/<[^>]+>/g, " ")
		.replace(/&[a-zA-Z]+;/g, " ")
		.replace(/&#?\w+;/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

function countWords(text) {
	return text.split(/\s+/).filter(Boolean).length;
}

function readingMinutes(wordCount) {
	return Math.max(1, Math.round(wordCount / WPM));
}

function main() {
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
