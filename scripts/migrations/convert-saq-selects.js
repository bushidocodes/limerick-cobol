#!/usr/bin/env node
// Converts SAQ <select aria-label="Click for answer"> widgets to <details>/<summary>.
// Run once from the repo root: node scripts/convert-saq-selects.js

"use strict";

const fs = require("fs");

const FILES = [
	"course/EditedPics.html",
	"course/Iteration.html",
	"course/Selection.html",
	"course/Tables2.html",
	"course/SequentialFiles2.html",
];

// Match a <select aria-label="Click for answer" ...> ... </select> block,
// preceded by optional whitespace on the same line (to recover indentation).
const SELECT_RE = /([ \t]*)(<select\s+aria-label="Click for answer"[^>]*>([\s\S]*?)<\/select>)/g;

// Match individual <option> elements (content may span lines).
const OPTION_RE = /<option([^>]*)>([\s\S]*?)<\/option>/g;

// Lines that are purely decorative separators ("-" repeated, possibly with spaces).
const SEPARATOR_RE = /^[-\s]+$/;

function convertFile(filePath) {
	const original = fs.readFileSync(filePath, "utf8");
	let count = 0;

	const converted = original.replace(SELECT_RE, (match, indent, _full, optionsHtml) => {
		const options = [];
		let m;
		OPTION_RE.lastIndex = 0;
		while ((m = OPTION_RE.exec(optionsHtml)) !== null) {
			const attrs = m[1];
			const text = m[2].trim();
			options.push({ selected: /selected/.test(attrs), text });
		}
		if (options.length === 0) return match;

		const prompt = (options.find((o) => o.selected) ?? options[0]).text;

		const answerLines = options
			.filter((o) => !o.selected)
			.map((o) => o.text)
			.filter((t) => !SEPARATOR_RE.test(t));

		if (answerLines.length === 0) return match;

		// Detect COBOL output-trace content (lines starting with &gt; entities).
		const isTrace = answerLines.some((l) => l.startsWith("&gt;"));

		let answerContent;
		if (isTrace) {
			// prettier-ignore comments prevent prettier from adding a leading newline
			// inside the <pre> tag, which would render as a blank first line.
			answerContent = `<!-- prettier-ignore --><pre>${answerLines.join("\n")}</pre>`;
		} else if (answerLines.length === 1) {
			answerContent = answerLines[0];
		} else {
			// Prose that was word-wrapped across options — join into one paragraph.
			answerContent = `<p>${answerLines.join(" ")}</p>`;
		}

		count++;
		const i = `${indent}\t`;
		return `${indent}<details class="saq-reveal">\n${i}<summary>${prompt}</summary>\n${i}${answerContent}\n${indent}</details>`;
	});

	if (count > 0) {
		fs.writeFileSync(filePath, converted, "utf8");
		console.log(`  ${filePath}: converted ${count} SAQ widget(s)`);
	} else {
		console.log(`  ${filePath}: no SAQ widgets found`);
	}
}

console.log("Converting SAQ <select> widgets to <details>/<summary>…");
for (const f of FILES) convertFile(f);
console.log("Done.");
