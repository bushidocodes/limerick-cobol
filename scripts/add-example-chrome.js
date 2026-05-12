#!/usr/bin/env node
/**
 * add-example-chrome.js
 *
 * One-time migration script (issue #250).
 * Injects page chrome into every bare example-program HTML page under
 * examples/<topic>/*.html:
 *   - FOUC-prevention inline script
 *   - course-components.css link
 *   - component scripts (theme-toggle, page-hero, related-content, copy-button)
 *   - skip-link, <main>, page-wrapper, section-grid, section-full
 *   - <page-hero eyebrow="COBOL Example">
 *   - breadcrumb <nav> back to examples/default.html
 *   - one-line description paragraph
 *   - download link to the sibling .cbl source file
 *   - <related-content> cross-link to the relevant lecture(s)
 *
 * Run:  node scripts/add-example-chrome.js
 * Then: npm run format:write   (Prettier will tidy the output)
 */

"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const EXAMPLES_DIR = path.join(ROOT, "examples");

// ---------------------------------------------------------------------------
// Manifest
// Each entry maps one HTML file to the data needed for its chrome.
// `file`     – path relative to examples/
// `cbl`      – sibling .cbl filename
// `crumb`    – short label shown as the trailing breadcrumb span
// `desc`     – one-sentence description shown on the page
// `lectures` – related-content `lectures` attribute value (optional)
// ---------------------------------------------------------------------------

const MANIFEST = [
	// ── Accept ──────────────────────────────────────────────────────────────
	{
		file: "Accept/ACCEPT.html",
		cbl: "AcceptAndDisplay.cbl",
		crumb: "ACCEPT and DISPLAY",
		desc: "The program accepts a simple student record from the user and displays the individual fields. Also shows how the ACCEPT may be used to get and DISPLAY the system time and date.",
		lectures: "../../course/COBOLIntro.html|Introduction to COBOL",
	},
	{
		file: "Accept/Multiplier.html",
		cbl: "Multiplier.cbl",
		crumb: "Multiplier",
		desc: "Accepts two single digit numbers from the user, multiplies them together and displays the result.",
		lectures: "../../course/COBOLIntro.html|Introduction to COBOL",
	},
	{
		file: "Accept/Shortest.html",
		cbl: "ShortestProgram.cbl",
		crumb: "Shortest COBOL Program",
		desc: "This example program is almost the shortest COBOL program we can have. We could make it shorter still by leaving out the STOP RUN.",
		lectures: "../../course/COBOLIntro.html|Introduction to COBOL",
	},
	// ── Conditn ─────────────────────────────────────────────────────────────
	{
		file: "Conditn/Conditions.html",
		cbl: "CONDITIONS.cbl",
		crumb: "Condition Names",
		desc: "An example program demonstrating the use of Condition Names (level 88's).",
		lectures: "../../course/Selection.html|Selection in COBOL",
	},
	{
		file: "Conditn/IterIf.html",
		cbl: "Iteration-If.cbl",
		crumb: "Iteration with IF",
		desc: "An example program that implements a primitive calculator. The calculator only does additions and multiplications.",
		lectures:
			"../../course/Selection.html|Selection in COBOL, ../../course/Iteration.html|Iteration in COBOL",
	},
	// ── Indexed ─────────────────────────────────────────────────────────────
	{
		file: "Indexed/DirectReadIdx.html",
		cbl: "DirectReadIdx.cbl",
		crumb: "Direct Read on Indexed File",
		desc: "Does a direct read on the Indexed file. Allows the user to choose which of the keys to use for the direct read.",
		lectures: "../../course/IndexedFiles.html|Indexed Files",
	},
	{
		file: "Indexed/Seq2Index.html",
		cbl: "Seq2Index.cbl",
		crumb: "Sequential to Indexed",
		desc: "Creates a direct access Indexed file from a Sequential file.",
		lectures: "../../course/IndexedFiles.html|Indexed Files",
	},
	{
		file: "Indexed/SeqReadIdx.html",
		cbl: "SeqReadIdx.cbl",
		crumb: "Sequential Read of Indexed File",
		desc: "Reads the Indexed file sequentially on whichever key is chosen by the user. Displays all the records in the file.",
		lectures: "../../course/IndexedFiles.html|Indexed Files",
	},
	// ── Merge ───────────────────────────────────────────────────────────────
	{
		file: "Merge/Merge.html",
		cbl: "MergeFiles.cbl",
		crumb: "Merge Files",
		desc: "Uses the MERGE to insert records from a transaction file into a sequential master file.",
		lectures: "../../course/SortMerge.html|Sorting and Merging",
	},
	// ── Perform ─────────────────────────────────────────────────────────────
	{
		file: "Perform/MileageCount.html",
		cbl: "MileageCounter.cbl",
		crumb: "Mileage Counter",
		desc: "Demonstrates how the PERFORM..VARYING and the PERFORM..VARYING..AFTER (fourth format) may be used to simulate a mileage counter.",
		lectures: "../../course/Iteration.html|Iteration in COBOL",
	},
	{
		file: "Perform/Perform1.html",
		cbl: "PerformFormat1.cbl",
		crumb: "PERFORM Format 1",
		desc: "An example program demonstrating how the first format of the PERFORM may be used to change the flow of control through a program.",
		lectures: "../../course/Iteration.html|Iteration in COBOL",
	},
	{
		file: "Perform/Perform2.html",
		cbl: "PerformFormat2.cbl",
		crumb: "PERFORM Format 2",
		desc: "Demonstrates the second format of the PERFORM. The PERFORM..TIMES may be used to execute a block of code x number of times.",
		lectures: "../../course/Iteration.html|Iteration in COBOL",
	},
	{
		file: "Perform/Perform3.html",
		cbl: "PerformFormat3.cbl",
		crumb: "PERFORM Format 3",
		desc: "Demonstrates how the PERFORM..UNTIL (third format) may be used to process a stream of values where the length of the stream cannot be determined in advance.",
		lectures: "../../course/Iteration.html|Iteration in COBOL",
	},
	{
		file: "Perform/Perform4.html",
		cbl: "PerformFormat4.cbl",
		crumb: "PERFORM Format 4",
		desc: "Demonstrates how the PERFORM..VARYING and the PERFORM..VARYING..AFTER (fourth format) may be used for counting iteration. Also introduces the WITH TEST BEFORE and WITH TEST AFTER phrases.",
		lectures: "../../course/Iteration.html|Iteration in COBOL",
	},
	// ── Relative ────────────────────────────────────────────────────────────
	{
		file: "Relative/ReadRel.html",
		cbl: "ReadRelative.cbl",
		crumb: "Read Relative File",
		desc: "Reads the Relative file and displays the records. Allows the user to choose to read sequentially through all the records or to use a key to read a single record directly.",
		lectures: "../../course/RelativeFiles.html|Relative Files",
	},
	{
		file: "Relative/Seq2Rel.html",
		cbl: "Seq2Rel.cbl",
		crumb: "Sequential to Relative",
		desc: "Creates a direct access Relative file from a Sequential File.",
		lectures: "../../course/RelativeFiles.html|Relative Files",
	},
	// ── ReportWriter ────────────────────────────────────────────────────────
	{
		file: "ReportWriter/RepWriteA.html",
		cbl: "ReportExampleA.cbl",
		crumb: "Report Writer Example A",
		desc: "A simplified version of the full report program using only one control break. Uses the GBsales.dat data file.",
		lectures:
			"../../course/ReportWriter.html|Report Writer by Example, ../../course/ReportWriterSS.html|Report Writer Syntax and Semantics",
	},
	{
		file: "ReportWriter/RepWriteB.html",
		cbl: "ReportExampleB.cbl",
		crumb: "Report Writer Example B",
		desc: "A simplified version of the full report program containing all the control breaks but not using Declaratives. Uses the GBsales.dat data file.",
		lectures:
			"../../course/ReportWriter.html|Report Writer by Example, ../../course/ReportWriterSS.html|Report Writer Syntax and Semantics",
	},
	{
		file: "ReportWriter/RepWriteFull.html",
		cbl: "ReportExampleFull.cbl",
		crumb: "Report Writer Full Example",
		desc: "The full version of the report program containing all the control breaks and using Declaratives to calculate the salesperson salary and commission.",
		lectures:
			"../../course/ReportWriter.html|Report Writer by Example, ../../course/ReportWriterSS.html|Report Writer Syntax and Semantics",
	},
	{
		file: "ReportWriter/RepWriteSumm.html",
		cbl: "ReportExampleSummary.cbl",
		crumb: "Report Writer Summary",
		desc: "The summary version of the full report program containing all the control breaks and using Declaratives to calculate the salesperson salary and commission.",
		lectures:
			"../../course/ReportWriter.html|Report Writer by Example, ../../course/ReportWriterSS.html|Report Writer Syntax and Semantics",
	},
	// ── SeqIns ──────────────────────────────────────────────────────────────
	{
		file: "SeqIns/SEQINSERT.html",
		cbl: "InsertRecords.cbl",
		crumb: "Insert Records",
		desc: "Demonstrates how to insert records into a sequential file from a file of transaction records. A new file is created which contains the inserted records.",
		lectures: "../../course/SequentialFiles2.html|Processing Sequential Files",
	},
	// ── SeqRead ─────────────────────────────────────────────────────────────
	{
		file: "SeqRead/SEQREAD.html",
		cbl: "Seqread.cbl",
		crumb: "Sequential Read",
		desc: 'An example program that reads a sequential file and displays the records. Uses the Condition Name (level 88) "EndOfFile" to signal when the end of the file has been reached.',
		lectures: "../../course/SequentialFiles1.html|Introduction to Sequential Files",
	},
	{
		file: "SeqRead/SEQREADno88.html",
		cbl: "SeqreadNo88.cbl",
		crumb: "Sequential Read (without level 88s)",
		desc: "An example program that reads a sequential file and displays the records. This version does not use level 88's to signal when the end of the file has been reached.",
		lectures: "../../course/SequentialFiles1.html|Introduction to Sequential Files",
	},
	// ── SeqRpt ──────────────────────────────────────────────────────────────
	{
		file: "SeqRpt/SEQRPT.html",
		cbl: "StudentNumbersReport.cbl",
		crumb: "Student Numbers Report",
		desc: "Reads records from the student file, counts the total number of student records and the number of records for females and males, and prints the results in a short report.",
		lectures: "../../course/SequentialFiles3.html|COBOL Print Files and Variable-Length Records",
	},
	// ── SeqWrite ────────────────────────────────────────────────────────────
	{
		file: "SeqWrite/SEQWRITE.html",
		cbl: "SEQWRITE.cbl",
		crumb: "Sequential Write",
		desc: "Example program demonstrating how to create a sequential file from data input by the user.",
		lectures: "../../course/SequentialFiles1.html|Introduction to Sequential Files",
	},
	// ── Sort ────────────────────────────────────────────────────────────────
	{
		file: "Sort/InputSort.html",
		cbl: "InputSORT.cbl",
		crumb: "Input Sort",
		desc: "Uses the SORT and an INPUT PROCEDURE to accept records from the user and sort them on ascending StudentId.",
		lectures: "../../course/SortMerge.html|Sorting and Merging",
	},
	{
		file: "Sort/MaleSort.html",
		cbl: "MaleSORT.cbl",
		crumb: "Male Sort",
		desc: "Sorts the student masterfile and produces a new file, sorted on ascending student name, containing only the records of male students.",
		lectures: "../../course/SortMerge.html|Sorting and Merging",
	},
	// ── Strings ─────────────────────────────────────────────────────────────
	{
		file: "Strings/RefMod.html",
		cbl: "RefModification.cbl",
		crumb: "Reference Modification",
		desc: "Solves a number of string handling tasks such as extracting substrings, removing leading or trailing blanks, and finding the location of the first occurrence of a character in a string.",
		lectures: "../../course/RefMod.html|Reference Modification and Intrinsic Functions",
	},
	{
		file: "Strings/UnstringFileEg.html",
		cbl: "UnstringFileEg.cbl",
		crumb: "UNSTRING File Example",
		desc: "An example showing the unpacking of comma-separated records and the size validation of the unpacked fields.",
		lectures: "../../course/Unstring.html|Unstring",
	},
	// ── SubProg/DateValid (depth 3) ──────────────────────────────────────────
	{
		file: "SubProg/DateValid/DateDriver.html",
		cbl: "DateDriver.cbl",
		crumb: "Date Driver Program",
		desc: "A driver program for the date validation sub-program. Accepts a date from the user, passes it to the date validation sub-program and interprets and displays the result.",
		lectures: "../../../course/Subprograms.html|Contained and External Sub-programs",
	},
	{
		file: "SubProg/DateValid/ValiDate.html",
		cbl: "Validate.cbl",
		crumb: "Date Validation Sub-program",
		desc: "A date validation sub-program. Takes a date parameter in the form DDMMYYYY and returns a code indicating whether the date was valid, and if not, why it was invalid.",
		lectures: "../../../course/Subprograms.html|Contained and External Sub-programs",
	},
	// ── SubProg/DayDiff (depth 3) ────────────────────────────────────────────
	{
		file: "SubProg/DayDiff/DayDiffDriver.html",
		cbl: "DayDiffDriver.cbl",
		crumb: "Day Difference Driver",
		desc: "A driver program that accepts two dates from the user and displays the difference in days between them. Uses the Validate sub-program and also contains a number of contained sub-programs.",
		lectures: "../../../course/Subprograms.html|Contained and External Sub-programs",
	},
	// ── SubProg/Multiply (depth 3) ───────────────────────────────────────────
	{
		file: "SubProg/Multiply/DriverProg.html",
		cbl: "DriverProg.cbl",
		crumb: "Sub-program Driver",
		desc: "Demonstrates the CALL verb by calling three external sub-programs that illustrate flow of control, parameter passing, and state memory.",
		lectures: "../../../course/Subprograms.html|Contained and External Sub-programs",
	},
	{
		file: "SubProg/Multiply/Fickle.html",
		cbl: "Fickle.cbl",
		crumb: "Fickle Sub-program",
		desc: "A sub-program that demonstrates State Memory — each time it is called it remembers its state from the previous call.",
		lectures: "../../../course/Subprograms.html|Contained and External Sub-programs",
	},
	{
		file: "SubProg/Multiply/MultiplyNums.html",
		cbl: "MultiplyNums.cbl",
		crumb: "MultiplyNums Sub-program",
		desc: "The MultiplyNums sub-program demonstrates flow of control from a driver program and the use of numeric and string parameters with BY REFERENCE and BY CONTENT.",
		lectures: "../../../course/Subprograms.html|Contained and External Sub-programs",
	},
	{
		file: "SubProg/Multiply/Steadfast.html",
		cbl: "Steadfast.cbl",
		crumb: "Steadfast Sub-program",
		desc: "A sub-program identical to Fickle except that it uses the IS INITIAL phrase to avoid State Memory — it always produces the same result for the same input.",
		lectures: "../../../course/Subprograms.html|Contained and External Sub-programs",
	},
	// ── Tables ──────────────────────────────────────────────────────────────
	{
		file: "Tables/MonthTable.html",
		cbl: "MonthTable.cbl",
		crumb: "Month Table",
		desc: "Counts the number of students born in each month using a pre-filled table of month names and displays the result.",
		lectures:
			"../../course/Tables1.html|Using Tables, ../../course/Tables2.html|Creating Tables — Syntax and Semantics",
	},
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Return the path prefix to reach the repo root from examples/<relFile>.
 * e.g. "Accept/ACCEPT.html"          -> "../../"
 *      "SubProg/Multiply/Foo.html"   -> "../../../"
 */
function prefix(relFile) {
	const depth = relFile.split("/").length - 1; // segments minus filename
	return "../".repeat(depth + 1); // +1 for the examples/ directory
}

/**
 * Return the relative path from examples/<relFile> back to examples/default.html.
 * e.g. "Accept/ACCEPT.html"          -> "../default.html"
 *      "SubProg/Multiply/Foo.html"   -> "../../default.html"
 */
function defaultHtmlPath(relFile) {
	const depth = relFile.split("/").length - 1;
	return "../".repeat(depth) + "default.html";
}

// ---------------------------------------------------------------------------
// Transform one HTML file
// ---------------------------------------------------------------------------

function transform(entry) {
	const absPath = path.join(EXAMPLES_DIR, entry.file);
	let html = fs.readFileSync(absPath, "utf8");

	const pfx = prefix(entry.file);

	// 1. Read the existing <title> text from the file.
	const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/);
	const title = titleMatch ? titleMatch[1].trim() : entry.crumb;

	// 2. Extract the <pre> block (the entire element, HTML-entities intact).
	const preMatch = html.match(/(<pre[\s\S]*?<\/pre>)/);
	if (!preMatch) {
		console.error(`  SKIP: no <pre> block found in ${entry.file}`);
		return;
	}
	const preBlock = preMatch[1];

	// 3. Insert FOUC-prevention script after the viewport <meta>.
	html = html.replace(
		/(<meta name="viewport" content="width=device-width, initial-scale=1" \/>)/,
		`$1\n\t\t<script>\n\t\t\t(function () {\n\t\t\t\tvar t = localStorage.getItem("lc-theme");\n\t\t\t\tif (t === "dark" || t === "light") document.documentElement.setAttribute("data-theme", t);\n\t\t\t})();\n\t\t</script>`,
	);

	// 4. Add course-components.css link after course.css.
	html = html.replace(
		/(<link href="[^"]*course\/Resources\/css\/course\.css" rel="stylesheet" \/>)/,
		`$1\n\t\t<link href="${pfx}course/Resources/css/course-components.css" rel="stylesheet" />`,
	);

	// 5. Add component scripts after the last Prism script.
	html = html.replace(
		/(<script src="[^"]*prism-cobol\.min\.js" defer><\/script>)/,
		`$1\n\t\t<script src="${pfx}components/theme-toggle.js" defer></script>\n\t\t<script src="${pfx}components/page-hero.js" defer></script>\n\t\t<script src="${pfx}components/related-content.js" defer></script>\n\t\t<script src="${pfx}components/copy-button.js" defer></script>`,
	);

	// 6. Build the new <body> content.
	const defPath = defaultHtmlPath(entry.file);

	const relatedAttr = entry.lectures
		? `\n\t\t\t\t\t\tlectures="${entry.lectures}"\n\t\t\t\t\t`
		: "";
	const relatedEl = entry.lectures
		? `\n\t\t\t\t\t\t<related-content${relatedAttr}></related-content>`
		: "";

	const newBody = `<body>
\t\t<a class="skip-link" href="#main-content">Skip to main content</a>
\t\t<main id="main-content">
\t\t\t<div class="page-wrapper">
\t\t\t\t<div class="section-grid">
\t\t\t\t\t<div class="section-full">
\t\t\t\t\t\t<page-hero title="${title}" eyebrow="COBOL Example"></page-hero>
\t\t\t\t\t\t<nav aria-label="Breadcrumb">
\t\t\t\t\t\t\t<a href="${defPath}">Example programs</a> ›
\t\t\t\t\t\t\t<span>${entry.crumb}</span>
\t\t\t\t\t\t</nav>
\t\t\t\t\t\t<p>${entry.desc}</p>
\t\t\t\t\t\t<p><a href="${entry.cbl}" download>Download ${entry.cbl}</a></p>${relatedEl}
\t\t\t\t\t\t${preBlock}
\t\t\t\t\t</div>
\t\t\t\t</div>
\t\t\t</div>
\t\t</main>
\t</body>`;

	// 7. Replace the entire <body>...</body> section.
	html = html.replace(/<body[\s\S]*<\/body>/, newBody);

	fs.writeFileSync(absPath, html, "utf8");
	console.log(`  OK  ${entry.file}`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

console.log("Adding page chrome to example HTML files…\n");

let ok = 0;
let fail = 0;

for (const entry of MANIFEST) {
	try {
		transform(entry);
		ok++;
	} catch (err) {
		console.error(`  ERR ${entry.file}: ${err.message}`);
		fail++;
	}
}

console.log(`\nDone. ${ok} updated, ${fail} failed.`);
if (fail > 0) process.exit(1);
