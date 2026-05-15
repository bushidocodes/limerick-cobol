// One-shot tool: inserts the synchronous theme-bootstrap <script> into every
// HTML page that's missing it. The script reads localStorage('lc-theme') and
// sets data-theme on <html> before paint to avoid FOUC.
//
// Inserts after the last <meta name="theme-color"> tag (or after the viewport
// meta if no theme-color exists). Idempotent.

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

const SKIP = [
	/[\\/]node_modules[\\/]/,
	/[\\/]\.git[\\/]/,
	/[\\/]course[\\/]Resources[\\/]ppz[\\/]/,
	/[\\/]course[\\/]Resources[\\/]build-viewer\.html$/,
	/[\\/]course[\\/]Resources[\\/]pdf-viewer\.html$/,
];

const BOOTSTRAP =
	`\t\t<script>\n` +
	`\t\t\t(function () {\n` +
	`\t\t\t\tvar t = localStorage.getItem("lc-theme");\n` +
	`\t\t\t\tif (t === "dark" || t === "light") document.documentElement.setAttribute("data-theme", t);\n` +
	`\t\t\t})();\n` +
	`\t\t</script>`;

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

for (const file of walk(ROOT)) {
	if (SKIP.some((re) => re.test(file))) continue;
	let html = fs.readFileSync(file, "utf8");

	if (/lc-theme/.test(html)) continue;

	// Find the last <meta name="theme-color" ...> tag and insert after it.
	const themeColorRe = /([ \t]*<meta\s+name="theme-color"[^>]*\/?>)/g;
	const matches = [...html.matchAll(themeColorRe)];
	let newHtml;
	if (matches.length > 0) {
		const last = matches[matches.length - 1];
		const insertAt = last.index + last[0].length;
		newHtml = html.slice(0, insertAt) + "\n" + BOOTSTRAP + html.slice(insertAt);
	} else {
		// Fall back to inserting after viewport meta.
		newHtml = html.replace(/(<meta\s+name="viewport"[^>]*\/?>)/, (m) => `${m}\n${BOOTSTRAP}`);
		if (newHtml === html) {
			console.warn("no insertion point found, skipping:", path.relative(ROOT, file));
			continue;
		}
	}

	fs.writeFileSync(file, newHtml);
	touched++;
	console.log("added theme bootstrap to", path.relative(ROOT, file));
}

console.log(`\nDone. ${touched} files updated.`);
