#!/usr/bin/env node
/**
 * build-examples.js
 *
 * Generates each examples/<topic>/<NAME>.html from its sibling .cbl COBOL
 * source file. Re-run this script whenever a .cbl file is edited, then run
 * prettier to normalise formatting before committing.
 *
 * Usage:  npm run build:examples
 */

"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const EXAMPLES_DIR = path.join(ROOT, "examples");
const BASE_URL = "https://bushidocodes.github.io/limerick-cobol/";
const OG_IMAGE = "https://bushidocodes.github.io/limerick-cobol/pics/og/examples.png";
const CROSS_LINKS = JSON.parse(fs.readFileSync(path.join(__dirname, "cross-links.json"), "utf8"));
const MAX_RELATED_PER_GROUP = 4;

// ---------------------------------------------------------------------------
// Manifest
// Each entry maps one .cbl source file to the data needed for its HTML page.
// `file`     – path of the output .html file, relative to examples/
// `cbl`      – sibling .cbl filename (must live in the same directory as file)
// `title`    – <title> text and og:title / twitter:title
// `crumb`    – short label shown as the trailing breadcrumb span
// `desc`     – full description shown in the <p> and (truncated) in meta tags
// `runInCe`  – (optional) when true, inject the <run-in-ce> custom element and
//              its script. Set for examples that work cleanly in Compiler
//              Explorer's executor sandbox (no data files, single .cbl source).
//
// The <related-content> block is sourced from scripts/cross-links.json — see
// `files` and `families` there for the mapping. To change which lessons or
// sibling examples a page links to, edit cross-links.json, not this manifest.
// ---------------------------------------------------------------------------

const MANIFEST = [
	// ── Accept ──────────────────────────────────────────────────────────────
	{
		file: "Accept/ACCEPT.html",
		cbl: "AcceptAndDisplay.cbl",
		title: "ACCEPT and DISPLAY example program",
		crumb: "ACCEPT and DISPLAY",
		desc: "The program accepts a simple student record from the user and displays the individual fields. Also shows how the ACCEPT may be used to get and DISPLAY the system time and date.",
		runInCe: true,
	},
	{
		file: "Accept/Multiplier.html",
		cbl: "Multiplier.cbl",
		title: "ACCEPT, DISPLAY and MULTIPLY example program",
		crumb: "Multiplier",
		desc: "Accepts two single digit numbers from the user, multiplies them together and displays the result.",
		runInCe: true,
	},
	{
		file: "Accept/Shortest.html",
		cbl: "ShortestProgram.cbl",
		title: "The Shortest COBOL program we can have",
		crumb: "Shortest COBOL Program",
		desc: "This example program is almost the shortest COBOL program we can have. We could make it shorter still by leaving out the STOP RUN.",
		runInCe: true,
	},
	// ── Conditn ─────────────────────────────────────────────────────────────
	{
		file: "Conditn/Conditions.html",
		cbl: "CONDITIONS.cbl",
		title: "Condition Names (level 88) example program",
		crumb: "Condition Names",
		desc: "An example program demonstrating the use of Condition Names (level 88's).",
		runInCe: true,
	},
	{
		file: "Conditn/IterCalc.html",
		cbl: "Iteration-Calculator.cbl",
		title: "Iteration Calculator with COMPUTE example program",
		crumb: "Iteration Calculator",
		desc: "Accepts two numbers and an operator from the user, then adds or multiplies them using the COMPUTE statement. Repeats three times with PERFORM TIMES. A companion to the Iteration with IF example, showing COMPUTE as an alternative to the ADD and MULTIPLY verbs.",
		runInCe: true,
	},
	{
		file: "Conditn/IterIf.html",
		cbl: "Iteration-If.cbl",
		title: "Iteration with IF example program",
		crumb: "Iteration with IF",
		desc: "An example program that implements a primitive calculator. The calculator only does additions and multiplications.",
		runInCe: true,
	},
	// ── Indexed ─────────────────────────────────────────────────────────────
	{
		file: "Indexed/DirectReadIdx.html",
		cbl: "DirectReadIdx.cbl",
		title: "Reading an Indexed file directly by key",
		crumb: "Direct Read on Indexed File",
		desc: "Does a direct read on the Indexed file. Allows the user to choose which of the keys to use for the direct read.",
	},
	{
		file: "Indexed/Seq2Index.html",
		cbl: "Seq2Index.cbl",
		title: "Creating an Indexed file from a sequential file",
		crumb: "Sequential to Indexed",
		desc: "Creates a direct access Indexed file from a Sequential file.",
	},
	{
		file: "Indexed/SeqReadIdx.html",
		cbl: "SeqReadIdx.cbl",
		title: "Reading an Indexed file sequentially on any of its keys",
		crumb: "Sequential Read of Indexed File",
		desc: "Reads the Indexed file sequentially on whichever key is chosen by the user. Displays all the records in the file.",
	},
	// ── Merge ───────────────────────────────────────────────────────────────
	{
		file: "Merge/Merge.html",
		cbl: "MergeFiles.cbl",
		title: "Merge Files - Example Program",
		crumb: "Merge Files",
		desc: "Uses the MERGE to insert records from a transaction file into a sequential master file.",
	},
	// ── Perform ─────────────────────────────────────────────────────────────
	{
		file: "Perform/MileageCount.html",
		cbl: "MileageCounter.cbl",
		title: "Mileage counter simulation",
		crumb: "Mileage Counter",
		desc: "Demonstrates how the PERFORM..VARYING and the PERFORM..VARYING..AFTER (fourth format) may be used to simulate a mileage counter.",
		runInCe: true,
	},
	{
		file: "Perform/Perform1.html",
		cbl: "PerformFormat1.cbl",
		title: "Perform - Format 1 example program",
		crumb: "PERFORM Format 1",
		desc: "An example program demonstrating how the first format of the PERFORM may be used to change the flow of control through a program.",
		runInCe: true,
	},
	{
		file: "Perform/Perform2.html",
		cbl: "PerformFormat2.cbl",
		title: "Perform - Format 2 example program",
		crumb: "PERFORM Format 2",
		desc: "Demonstrates the second format of the PERFORM. The PERFORM..TIMES may be used to execute a block of code x number of times.",
		runInCe: true,
	},
	{
		file: "Perform/Perform3.html",
		cbl: "PerformFormat3.cbl",
		title: "Perform - Format 3 example program",
		crumb: "PERFORM Format 3",
		desc: "Demonstrates how the PERFORM..UNTIL (third format) may be used to process a stream of values where the length of the stream cannot be determined in advance.",
		runInCe: true,
	},
	{
		file: "Perform/Perform4.html",
		cbl: "PerformFormat4.cbl",
		title: "Perform - Format 4 example program",
		crumb: "PERFORM Format 4",
		desc: "Demonstrates how the PERFORM..VARYING and the PERFORM..VARYING..AFTER (fourth format) may be used for counting iteration. Also introduces the WITH TEST BEFORE and WITH TEST AFTER phrases.",
		runInCe: true,
	},
	// ── Relative ────────────────────────────────────────────────────────────
	{
		file: "Relative/ReadRel.html",
		cbl: "ReadRelative.cbl",
		title: "Read Relative File example program",
		crumb: "Read Relative File",
		desc: "Reads the Relative file and displays the records. Allows the user to choose to read sequentially through all the records or to use a key to read a single record directly.",
	},
	{
		file: "Relative/Seq2Rel.html",
		cbl: "Seq2Rel.cbl",
		title: "Sequential to Relative File example program",
		crumb: "Sequential to Relative",
		desc: "Creates a direct access Relative file from a Sequential File.",
	},
	// ── ReportWriter ────────────────────────────────────────────────────────
	{
		file: "ReportWriter/RepWriteA.html",
		cbl: "ReportExampleA.cbl",
		title: "One control break version of full Report Writer example Program",
		crumb: "Report Writer Example A",
		desc: "A simplified version of the full report program using only one control break. Uses the GBsales.dat data file.",
	},
	{
		file: "ReportWriter/RepWriteB.html",
		cbl: "ReportExampleB.cbl",
		title: "No Declaratives version of full Report Writer example program",
		crumb: "Report Writer Example B",
		desc: "A simplified version of the full report program containing all the control breaks but not using Declaratives. Uses the GBsales.dat data file.",
	},
	{
		file: "ReportWriter/RepWriteFull.html",
		cbl: "ReportExampleFull.cbl",
		title: "Full Report Writer example program - includes Declaratives",
		crumb: "Report Writer Full Example",
		desc: "The full version of the report program containing all the control breaks and using Declaratives to calculate the salesperson salary and commission.",
	},
	{
		file: "ReportWriter/RepWriteSumm.html",
		cbl: "ReportExampleSummary.cbl",
		title: "Summary version of the full Report Writer program",
		crumb: "Report Writer Summary",
		desc: "The summary version of the full report program containing all the control breaks and using Declaratives to calculate the salesperson salary and commission.",
	},
	// ── SeqIns ──────────────────────────────────────────────────────────────
	{
		file: "SeqIns/SEQINSERT.html",
		cbl: "InsertRecords.cbl",
		title: "Inserting records in a Sequential File",
		crumb: "Insert Records",
		desc: "Demonstrates how to insert records into a sequential file from a file of transaction records. A new file is created which contains the inserted records.",
	},
	// ── SeqRead ─────────────────────────────────────────────────────────────
	{
		file: "SeqRead/SEQREAD.html",
		cbl: "Seqread.cbl",
		title: "Reading a Sequential File",
		crumb: "Sequential Read",
		desc: 'An example program that reads a sequential file and displays the records. Uses the Condition Name (level 88) "EndOfFile" to signal when the end of the file has been reached.',
	},
	{
		file: "SeqRead/SEQREADno88.html",
		cbl: "SeqreadNo88.cbl",
		title: "Reading a Sequential File",
		crumb: "Sequential Read (without level 88s)",
		desc: "An example program that reads a sequential file and displays the records. This version does not use level 88's to signal when the end of the file has been reached.",
	},
	// ── SeqRpt ──────────────────────────────────────────────────────────────
	{
		file: "SeqRpt/SEQRPT.html",
		cbl: "StudentNumbersReport.cbl",
		title: "Sequential Student Number Report",
		crumb: "Student Numbers Report",
		desc: "Reads records from the student file, counts the total number of student records and the number of records for females and males, and prints the results in a short report.",
	},
	// ── SeqWrite ────────────────────────────────────────────────────────────
	{
		file: "SeqWrite/SEQWRITE.html",
		cbl: "SEQWRITE.cbl",
		title: "Writing to a Sequential File",
		crumb: "Sequential Write",
		desc: "Example program demonstrating how to create a sequential file from data input by the user.",
	},
	// ── Sort ────────────────────────────────────────────────────────────────
	{
		file: "Sort/InputSort.html",
		cbl: "InputSORT.cbl",
		title: "SORT with Input Procedure to get recs from user",
		crumb: "Input Sort",
		desc: "Uses the SORT and an INPUT PROCEDURE to accept records from the user and sort them on ascending StudentId.",
	},
	{
		file: "Sort/MaleSort.html",
		cbl: "MaleSORT.cbl",
		title: "SORT file and select only male records",
		crumb: "Male Sort",
		desc: "Sorts the student masterfile and produces a new file, sorted on ascending student name, containing only the records of male students.",
	},
	// ── Strings ─────────────────────────────────────────────────────────────
	{
		file: "Strings/RefMod.html",
		cbl: "RefModification.cbl",
		title: "String handling - Reference Modification examples",
		crumb: "Reference Modification",
		desc: "Solves a number of string handling tasks such as extracting substrings, removing leading or trailing blanks, and finding the location of the first occurrence of a character in a string.",
		runInCe: true,
	},
	{
		file: "Strings/UnstringFileEg.html",
		cbl: "UnstringFileEg.cbl",
		title: "String handling - Unpacking and size-validating comma separated records",
		crumb: "UNSTRING File Example",
		desc: "An example showing the unpacking of comma-separated records and the size validation of the unpacked fields.",
	},
	// ── SubProg/DateValid (depth 3) ──────────────────────────────────────────
	{
		file: "SubProg/DateValid/DateDriver.html",
		cbl: "DateDriver.cbl",
		title: "Driver program for date validation sub-program",
		crumb: "Date Driver Program",
		desc: "A driver program for the date validation sub-program. Accepts a date from the user, passes it to the date validation sub-program and interprets and displays the result.",
	},
	{
		file: "SubProg/DateValid/ValiDate.html",
		cbl: "Validate.cbl",
		title: "Date validation sub-program",
		crumb: "Date Validation Sub-program",
		desc: "A date validation sub-program. Takes a date parameter in the form DDMMYYYY and returns a code indicating whether the date was valid, and if not, why it was invalid.",
	},
	// ── SubProg/DayDiff (depth 3) ────────────────────────────────────────────
	{
		file: "SubProg/DayDiff/DayDiffDriver.html",
		cbl: "DayDiffDriver.cbl",
		title: "Get difference between dates driver program",
		crumb: "Day Difference Driver",
		desc: "A driver program that accepts two dates from the user and displays the difference in days between them. Uses the Validate sub-program and also contains a number of contained sub-programs.",
	},
	// ── SubProg/Multiply (depth 3) ───────────────────────────────────────────
	{
		file: "SubProg/Multiply/DriverProg.html",
		cbl: "DriverProg.cbl",
		title: "A driver for the MultiplyNums, Fickle and Steafast sub-programs",
		crumb: "Sub-program Driver",
		desc: "Demonstrates the CALL verb by calling three external sub-programs that illustrate flow of control, parameter passing, and state memory.",
	},
	{
		file: "SubProg/Multiply/Fickle.html",
		cbl: "Fickle.cbl",
		title: "The Fickle sub-program demonstrates State Memory",
		crumb: "Fickle Sub-program",
		desc: "A sub-program that demonstrates State Memory — each time it is called it remembers its state from the previous call.",
	},
	{
		file: "SubProg/Multiply/MultiplyNums.html",
		cbl: "MultiplyNums.cbl",
		title: "The MultiplyNums sub-program",
		crumb: "MultiplyNums Sub-program",
		desc: "The MultiplyNums sub-program demonstrates flow of control from a driver program and the use of numeric and string parameters with BY REFERENCE and BY CONTENT.",
	},
	{
		file: "SubProg/Multiply/Steadfast.html",
		cbl: "Steadfast.cbl",
		title: "The Steadfast sub-program demonstrates the IS INITIAL phrase",
		crumb: "Steadfast Sub-program",
		desc: "A sub-program identical to Fickle except that it uses the IS INITIAL phrase to avoid State Memory — it always produces the same result for the same input.",
	},
	// ── Tables ──────────────────────────────────────────────────────────────
	{
		file: "Tables/MonthTable.html",
		cbl: "MonthTable.cbl",
		title: "Tables - Counts number of students born in each month",
		crumb: "Month Table",
		desc: "Counts the number of students born in each month using a pre-filled table of month names and displays the result.",
	},
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function escapeHtml(str) {
	return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeAttr(str) {
	return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Truncate description to ≤155 chars, breaking at a word boundary. */
function truncate(text, max = 155) {
	if (text.length <= max) return text;
	const cut = text.lastIndexOf(" ", max);
	return (cut > 80 ? text.slice(0, cut) : text.slice(0, max)).trimEnd();
}

/**
 * Return the path prefix to reach the repo root from examples/<relFile>.
 * e.g. "Accept/ACCEPT.html"        -> "../../"
 *      "SubProg/Multiply/Foo.html" -> "../../../"
 */
function prefix(relFile) {
	const depth = relFile.split("/").length - 1;
	return "../".repeat(depth + 1);
}

/**
 * Build the <related-content> HTML for an example, sourced from cross-links.json.
 * Returns an empty string if the file is not in the cross-links map or has no
 * cross-references.
 */
function relatedContentHtml(relFile) {
	const key = "examples/" + relFile;
	const familyNames = CROSS_LINKS.files[key];
	if (!familyNames || !familyNames.length) return "";

	const lectureMap = new Map();
	const exampleMap = new Map();
	const exerciseMap = new Map();

	const add = (map, items) => {
		if (!items) return;
		for (const [href, title] of items) {
			if (href === key) continue;
			if (!map.has(href)) map.set(href, title);
		}
	};

	for (const familyName of familyNames) {
		const family = CROSS_LINKS.families[familyName];
		if (!family) throw new Error(`Unknown family "${familyName}" referenced by ${key}`);
		add(lectureMap, family.lectures);
		add(exampleMap, family.examples);
		add(exerciseMap, family.exercises);
	}

	const fromDir = path.dirname(path.join(ROOT, key));
	const toRelHref = (repoRelTarget) => {
		const abs = path.join(ROOT, repoRelTarget);
		return path.relative(fromDir, abs).split(path.sep).join("/");
	};

	const formatGroup = (map) => {
		const items = [];
		for (const [href, title] of map) {
			items.push(`${toRelHref(href)}|${title}`);
			if (items.length >= MAX_RELATED_PER_GROUP) break;
		}
		return items.join(", ");
	};

	const attrs = [];
	if (lectureMap.size) attrs.push(`lectures="${escapeAttr(formatGroup(lectureMap))}"`);
	if (exampleMap.size) attrs.push(`examples="${escapeAttr(formatGroup(exampleMap))}"`);
	if (exerciseMap.size) attrs.push(`exercises="${escapeAttr(formatGroup(exerciseMap))}"`);
	if (!attrs.length) return "";

	return `\t\t\t\t\t\t<related-content\n\t\t\t\t\t\t\t${attrs.join("\n\t\t\t\t\t\t\t")}\n\t\t\t\t\t\t></related-content>\n`;
}

// ---------------------------------------------------------------------------
// Page builder
// ---------------------------------------------------------------------------

function buildPage(entry) {
	const pfx = prefix(entry.file);
	const canonical = BASE_URL + "examples/" + entry.file;
	const metaDesc = escapeAttr(truncate(entry.desc));
	const metaTitle = escapeAttr(entry.title);
	const metaUrl = escapeAttr(canonical);

	const cblPath = path.join(EXAMPLES_DIR, path.dirname(entry.file), entry.cbl);
	// Strip UTF-8 BOM and normalise CRLF → LF (several .cbl files use Windows line endings).
	const cblSource = fs.readFileSync(cblPath, "utf8").replace(/^﻿/, "").replace(/\r\n/g, "\n").trimEnd();
	const escapedSource = escapeHtml(cblSource);

	const relatedEl = relatedContentHtml(entry.file);

	const runInCeScript = entry.runInCe ? `\t\t<script src="${pfx}components/run-in-ce.js" defer></script>\n` : "";
	const runInCeToolbarEl = entry.runInCe ? `\t\t\t\t\t\t\t<run-in-ce></run-in-ce>\n` : "";

	return `<!doctype html>
<html lang="en">
\t<head>
\t\t<meta name="viewport" content="width=device-width, initial-scale=1" />
\t\t<meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
\t\t<meta name="theme-color" content="#1a1a1a" media="(prefers-color-scheme: dark)" />
\t\t<script>
\t\t\t(function () {
\t\t\t\tvar t = localStorage.getItem("lc-theme");
\t\t\t\tif (t === "dark" || t === "light") {
\t\t\t\t\tdocument.documentElement.setAttribute("data-theme", t);
\t\t\t\t\tvar color = t === "dark" ? "#1a1a1a" : "#ffffff";
\t\t\t\t\tvar meta = document.querySelector('meta[name="theme-color"]:not([media])');
\t\t\t\t\tif (!meta) {
\t\t\t\t\t\tmeta = document.createElement("meta");
\t\t\t\t\t\tmeta.name = "theme-color";
\t\t\t\t\t\tdocument.head.appendChild(meta);
\t\t\t\t\t}
\t\t\t\t\tmeta.content = color;
\t\t\t\t}
\t\t\t})();
\t\t</script>
\t\t<title>${entry.title}</title>
\t\t<meta name="description" content="${metaDesc}" />
\t\t<link rel="canonical" href="${metaUrl}" />
\t\t<!-- Open Graph -->
\t\t<meta property="og:type" content="website" />
\t\t<meta property="og:url" content="${metaUrl}" />
\t\t<meta property="og:title" content="${metaTitle}" />
\t\t<meta property="og:description" content="${metaDesc}" />
\t\t<meta property="og:image" content="${OG_IMAGE}" />
\t\t<!-- Twitter Card -->
\t\t<meta name="twitter:card" content="summary_large_image" />
\t\t<meta name="twitter:title" content="${metaTitle}" />
\t\t<meta name="twitter:description" content="${metaDesc}" />
\t\t<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
\t\t<link href="${pfx}course/Resources/css/course.css" rel="stylesheet" />
\t\t<link href="${pfx}course/Resources/css/course-components.css" rel="stylesheet" />
\t\t<link href="${pfx}course/Resources/vendor/prism/themes/prism.min.css" rel="stylesheet" />
\t\t<script src="${pfx}course/Resources/vendor/prism/prism.min.js" defer></script>
\t\t<script src="${pfx}course/Resources/vendor/prism/components/prism-cobol.min.js" defer></script>
\t\t<script src="${pfx}components/theme-toggle.js" defer></script>
\t\t<script src="${pfx}components/page-hero.js" defer></script>
\t\t<script src="${pfx}components/related-content.js" defer></script>
\t\t<script src="${pfx}components/copy-button.js" defer></script>
\t\t<script src="${pfx}components/site-header.js" defer></script>
\t\t<script src="${pfx}components/copyright-notice.js" defer></script>
\t\t<script src="${pfx}components/last-updated.js" defer></script>
\t\t<script src="${pfx}components/edit-on-github.js" defer></script>
${runInCeScript}\t</head>
\t<body>
\t\t<a class="skip-link" href="#main-content">Skip to main content</a>
\t\t<main id="main-content">
\t\t\t<div class="page-wrapper">
\t\t\t\t<div class="section-grid">
\t\t\t\t\t<div class="section-full">
\t\t\t\t\t\t<page-hero title="${metaTitle}"></page-hero>
\t\t\t\t\t\t<p>${entry.desc}</p>
\t\t\t\t\t\t\t<div class="code-toolbar">
\t\t\t\t\t\t\t<a href="${entry.cbl}" download class="download-btn">Download ${entry.cbl}</a>
${runInCeToolbarEl}\t\t\t\t\t\t</div>
\t\t\t\t\t\t<pre class="language-cobol"><code class="language-cobol">${escapedSource}
</code></pre>
${relatedEl}\t\t\t\t\t\t<copyright-notice type="examples"></copyright-notice>
\t\t\t\t\t\t<last-updated></last-updated>
\t\t\t\t\t\t<edit-on-github></edit-on-github>
\t\t\t\t\t</div>
\t\t\t\t</div>
\t\t\t</div>
\t\t</main>
\t</body>
</html>
`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

console.log("Building example HTML pages from .cbl sources…\n");

let ok = 0;
let fail = 0;

for (const entry of MANIFEST) {
	const absPath = path.join(EXAMPLES_DIR, entry.file);
	try {
		const html = buildPage(entry);
		fs.writeFileSync(absPath, html, "utf8");
		console.log(`  OK  ${entry.file}`);
		ok++;
	} catch (err) {
		console.error(`  ERR ${entry.file}: ${err.message}`);
		fail++;
	}
}

console.log(`\nDone. ${ok} written, ${fail} failed.`);
if (fail > 0) process.exit(1);
