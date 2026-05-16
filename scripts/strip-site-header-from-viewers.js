// One-shot tool: removes the site-header.js <script> tag from any HTML page
// that is a fullscreen-iframe wrapper (body has style="margin: 0; padding: 0").
// These pages are PDF/animation viewer shells where a sticky header overlaps
// the embedded viewer's chrome.

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

for (const file of walk(ROOT)) {
	if (/[\\/]node_modules[\\/]/.test(file)) continue;
	if (/[\\/]\.git[\\/]/.test(file)) continue;
	const html = fs.readFileSync(file, "utf8");
	if (!/body style="margin: 0; padding: 0"/.test(html)) continue;
	if (!/components\/site-header\.js/.test(html)) continue;

	const newHtml = html.replace(/[ \t]*<script src="[^"]*components\/site-header\.js"[^>]*><\/script>\n?/, "");
	if (newHtml === html) continue;

	fs.writeFileSync(file, newHtml);
	touched++;
	console.log("stripped site-header.js from", path.relative(ROOT, file));
}

console.log(`\nDone. ${touched} files updated.`);
