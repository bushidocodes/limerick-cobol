// One-shot migration: adds copyright-notice, last-updated, and edit-on-github
// to every HTML detail page under examples/ (i.e. all pages except index.html).
//
// Idempotent: a second run does nothing if copyright-notice.js is already present.

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "../..");
const EXAMPLES_DIR = path.join(ROOT, "examples");

function walk(dir, out = []) {
	for (const name of fs.readdirSync(dir)) {
		const full = path.join(dir, name);
		if (fs.statSync(full).isDirectory()) walk(full, out);
		else if (full.endsWith(".html")) out.push(full);
	}
	return out;
}

function relComponent(htmlFile, component) {
	const componentsDir = path.join(ROOT, "components");
	let rel = path.relative(path.dirname(htmlFile), componentsDir).replace(/\\/g, "/");
	if (!rel.startsWith(".")) rel = "./" + rel;
	return rel + "/" + component;
}

let touched = 0;
let skipped = 0;

for (const file of walk(EXAMPLES_DIR)) {
	// Skip the examples index page
	if (file === path.join(EXAMPLES_DIR, "index.html")) continue;

	let html = fs.readFileSync(file, "utf8");

	if (/components\/copyright-notice\.js/.test(html)) {
		skipped++;
		continue;
	}

	// --- Add script tags before </head> ---
	const scriptTags = [
		`<script src="${relComponent(file, "copyright-notice.js")}" defer></script>`,
		`<script src="${relComponent(file, "last-updated.js")}" defer></script>`,
		`<script src="${relComponent(file, "edit-on-github.js")}" defer></script>`,
	];

	html = html.replace(/([ \t]*)<\/head>/, (m, indent) => {
		return scriptTags.map((t) => `${indent}${t}`).join("\n") + "\n" + indent + "</head>";
	});

	// --- Add footer components after ></related-content> ---
	// Capture the indentation of the closing line so the new elements align.
	html = html.replace(/([ \t]*)><\/related-content>/, (m, indent) => {
		return (
			`${indent}></related-content>\n` +
			`${indent}<copyright-notice type="examples"></copyright-notice>\n` +
			`${indent}<last-updated></last-updated>\n` +
			`${indent}<edit-on-github></edit-on-github>`
		);
	});

	fs.writeFileSync(file, html);
	touched++;
	console.log("updated", path.relative(ROOT, file));
}

console.log(`\nDone. ${touched} files updated, ${skipped} already had footer chrome.`);
