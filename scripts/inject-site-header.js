// One-shot tool: inserts <script src=".../components/site-header.js" defer>
// into every HTML page in the repo, computing the correct relative path from
// each file. Skips iframe/viewer shells where a sticky header doesn't belong.
//
// Idempotent: a second run does nothing if the tag is already present.

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

const SKIP_GLOBS = [
	/[\\/]node_modules[\\/]/,
	/[\\/]\.git[\\/]/,
	/[\\/]course[\\/]Resources[\\/]ppz[\\/]/,
	/[\\/]course[\\/]Resources[\\/]build-viewer\.html$/,
	/[\\/]course[\\/]Resources[\\/]pdf-viewer\.html$/,
];

function walk(dir, out = []) {
	for (const name of fs.readdirSync(dir)) {
		const full = path.join(dir, name);
		const stat = fs.statSync(full);
		if (stat.isDirectory()) walk(full, out);
		else if (full.endsWith(".html")) out.push(full);
	}
	return out;
}

function relComponentsPath(htmlFile) {
	const componentsDir = path.join(ROOT, "components");
	const fileDir = path.dirname(htmlFile);
	let rel = path.relative(fileDir, componentsDir).replace(/\\/g, "/");
	if (!rel.startsWith(".")) rel = "./" + rel;
	return rel + "/site-header.js";
}

let touched = 0;
let skipped = 0;

for (const file of walk(ROOT)) {
	if (SKIP_GLOBS.some((re) => re.test(file))) continue;
	let html = fs.readFileSync(file, "utf8");

	// Skip fullscreen-iframe viewer shells (e.g. lectures/*.html PDF wrappers).
	if (/body style="margin: 0; padding: 0"/.test(html)) continue;

	if (/components\/site-header\.js/.test(html)) {
		skipped++;
		continue;
	}

	const src = relComponentsPath(file);
	const tag = `\t\t<script src="${src}" defer></script>`;

	// Insert just before </head>. Match the existing indentation pattern.
	const newHtml = html.replace(/([ \t]*)<\/head>/, (m, indent) => `${tag}\n${indent}</head>`);

	if (newHtml === html) {
		console.warn("no </head> found, skipping:", path.relative(ROOT, file));
		continue;
	}

	fs.writeFileSync(file, newHtml);
	touched++;
	console.log("added site-header.js to", path.relative(ROOT, file));
}

console.log(`\nDone. ${touched} files updated, ${skipped} already had the tag.`);
