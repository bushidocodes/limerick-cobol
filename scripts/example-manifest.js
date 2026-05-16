"use strict";

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
		file: "Accept/GettingStarted.html",
		cbl: "gettingstarted.cbl",
		title: "Getting Started exercise program",
		crumb: "Getting Started",
		desc: "An intentionally incorrect exercise program. The ACCEPT and MULTIPLY statements are in the wrong order, so the multiplication always uses the uninitialised value of Num2. Students are asked to rewrite it so that it prompts the user for both inputs before computing the result.",
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
		fixtures: ["SEQVIDEO.dat"],
	},
	{
		file: "Indexed/Seq2Index.html",
		cbl: "Seq2Index.cbl",
		title: "Creating an Indexed file from a sequential file",
		crumb: "Sequential to Indexed",
		desc: "Creates a direct access Indexed file from a Sequential file.",
		fixtures: ["SEQVIDEO.dat"],
	},
	{
		file: "Indexed/SeqReadIdx.html",
		cbl: "SeqReadIdx.cbl",
		title: "Reading an Indexed file sequentially on any of its keys",
		crumb: "Sequential Read of Indexed File",
		desc: "Reads the Indexed file sequentially on whichever key is chosen by the user. Displays all the records in the file.",
		fixtures: ["SEQVIDEO.dat"],
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
		fixtures: ["SEQSUPP.dat"],
	},
	{
		file: "Relative/Seq2Rel.html",
		cbl: "Seq2Rel.cbl",
		title: "Sequential to Relative File example program",
		crumb: "Sequential to Relative",
		desc: "Creates a direct access Relative file from a Sequential File.",
		fixtures: ["SEQSUPP.dat"],
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
		fixtures: ["STUDENTS.dat", "TRANSINS.dat"],
	},
	// ── SeqRead ─────────────────────────────────────────────────────────────
	{
		file: "SeqRead/SEQREAD.html",
		cbl: "Seqread.cbl",
		title: "Reading a Sequential File",
		crumb: "Sequential Read",
		desc: 'An example program that reads a sequential file and displays the records. Uses the Condition Name (level 88) "EndOfFile" to signal when the end of the file has been reached.',
		fixtures: ["STUDENTS.dat"],
	},
	{
		file: "SeqRead/SEQREADno88.html",
		cbl: "SeqreadNo88.cbl",
		title: "Reading a Sequential File",
		crumb: "Sequential Read (without level 88s)",
		desc: "An example program that reads a sequential file and displays the records. This version does not use level 88's to signal when the end of the file has been reached.",
		fixtures: ["STUDENTS.dat"],
	},
	// ── SeqRpt ──────────────────────────────────────────────────────────────
	{
		file: "SeqRpt/SEQRPT.html",
		cbl: "StudentNumbersReport.cbl",
		title: "Sequential Student Number Report",
		crumb: "Student Numbers Report",
		desc: "Reads records from the student file, counts the total number of student records and the number of records for females and males, and prints the results in a short report.",
	},
	// ── SeqUpd ──────────────────────────────────────────────────────────────
	{
		file: "SeqUpd/SeqUpdate.html",
		cbl: "SeqUpdate.cbl",
		title: "Updating a Sequential File",
		crumb: "Sequential Update",
		desc: "Updates the Students.dat master file using course-transfer transactions from Transfer.dat to produce a new Students.New file. Demonstrates the sequential file matching algorithm and detects two error conditions: unmatched transaction records and mismatched course codes.",
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
	{
		file: "Sort/SortIP.html",
		cbl: "SortIP.cbl",
		title: "SORT with Input Procedure to count males and females per course",
		crumb: "Sort IP",
		desc: "Reads the Students File and uses the SORT verb with an INPUT PROCEDURE to produce a file sequenced on ascending CourseCode. The sorted file is then read sequentially and the number of males and females taking each course is displayed.",
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
		fixtures: ["VarLen.dat"],
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

module.exports = MANIFEST;
