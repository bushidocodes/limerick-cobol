// One-shot tool: inserts <script src=".../components/exercises-sidebar.js" defer>
// into every exercise HTML page that already loads exercise-progress.js. The
// new tag is placed immediately after the exercise-progress.js tag so
// window.COBOL_EXERCISES is set before the sidebar runs (both are defer, so
// document order is honoured).
//
// Idempotent: a second run does nothing if the tag is already present.

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

function walk(dir, out = []) {
	for (const name of fs.readdirSync(dir)) {
		const full = path.join(dir, name);
		const stat = fs.statSync(full);
		if (stat.isDirectory()) walk(full, out);
		else if (full.endsWith(".html")) out.push(full);
	}
	return out;
}

let touched = 0;
let skipped = 0;

for (const file of walk(path.join(ROOT, "exercises"))) {
	let html = fs.readFileSync(file, "utf8");

	// Only act on pages that already pull in exercise-progress.js — that's the
	// canonical marker of "this is an exercise page in the COBOL_EXERCISES
	// sequence". The exercises/index.html and COBOLExams shell are skipped by
	// virtue of not loading exercise-progress.js.
	const progressMatch = html.match(
		/^([ \t]*)<script src="([^"]+\/components\/exercise-progress\.js)" defer><\/script>$/m,
	);
	if (!progressMatch) continue;

	if (/components\/exercises-sidebar\.js/.test(html)) {
		skipped++;
		continue;
	}

	const indent = progressMatch[1];
	const progressSrc = progressMatch[2];
	const sidebarSrc = progressSrc.replace(/exercise-progress\.js$/, "exercises-sidebar.js");
	const sidebarTag = `${indent}<script src="${sidebarSrc}" defer></script>`;
	const newHtml = html.replace(progressMatch[0], `${progressMatch[0]}\n${sidebarTag}`);

	if (newHtml === html) {
		console.warn("could not insert into:", path.relative(ROOT, file));
		continue;
	}

	fs.writeFileSync(file, newHtml);
	touched++;
	console.log("added exercises-sidebar.js to", path.relative(ROOT, file));
}

console.log(`\nDone. ${touched} files updated, ${skipped} already had the tag.`);
