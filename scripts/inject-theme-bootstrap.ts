// Idempotent tool: inserts the synchronous theme-bootstrap <script> into every
// HTML page that's missing it. The script reads localStorage('lc-theme') and
// sets data-theme on <html> before paint to avoid FOUC.
//
// Inserts after the last <meta name="theme-color"> tag (or after the viewport
// meta if no theme-color exists). Idempotent.

import fs from "fs";
import path from "path";

import { collectHtmlFiles } from "./lib/html-files.js";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
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
	`\t\t\t\tif (t === "dark" || t === "light") {\n` +
	`\t\t\t\t\tdocument.documentElement.setAttribute("data-theme", t);\n` +
	`\t\t\t\t\tvar color = t === "dark" ? "#1a1a1a" : "#ffffff";\n` +
	`\t\t\t\t\tvar meta = document.querySelector('meta[name="theme-color"]:not([media])');\n` +
	`\t\t\t\t\tif (!meta) {\n` +
	`\t\t\t\t\t\tmeta = document.createElement("meta");\n` +
	`\t\t\t\t\t\tmeta.name = "theme-color";\n` +
	`\t\t\t\t\t\tdocument.head.appendChild(meta);\n` +
	`\t\t\t\t\t}\n` +
	`\t\t\t\t\tmeta.content = color;\n` +
	`\t\t\t\t}\n` +
	`\t\t\t})();\n` +
	`\t\t</script>`;

let touched = 0;

for (const file of collectHtmlFiles(ROOT)) {
	if (SKIP.some((re) => re.test(file))) continue;
	const html = fs.readFileSync(file, "utf8");

	// Check if the file has the bootstrap script and replace it
	const bootstrapRe =
		/(\t\t)<script>\s*\(function\s*\(\)\s*\{\s*var\s+t\s*=\s*localStorage\.getItem\("lc-theme"\);[^}]*?\}\)\(\);\s*<\/script>/s;
	const match = html.match(bootstrapRe);
	if (match) {
		const indent = match[1]; // Capture the original indentation
		const indentedBootstrap = BOOTSTRAP.split("\n")
			.map((line, i) => (i === 0 ? indent + line.slice(2) : indent + line.slice(2)))
			.join("\n");
		const newHtml = html.replace(bootstrapRe, indentedBootstrap);
		fs.writeFileSync(file, newHtml);
		touched++;
		console.log("updated theme bootstrap in", path.relative(ROOT, file));
		continue;
	}

	// If file doesn't have bootstrap at all, add it
	if (/lc-theme/.test(html)) continue;

	// Find the last <meta name="theme-color" ...> tag and insert after it.
	const themeColorRe = /([ \t]*<meta\s+name="theme-color"[^>]*\/?>)/g;
	const matches = [...html.matchAll(themeColorRe)];
	let newHtml: string;
	if (matches.length > 0) {
		const last = matches[matches.length - 1];
		const insertAt = last.index! + last[0].length;
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
