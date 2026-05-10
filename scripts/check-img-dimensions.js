#!/usr/bin/env node
"use strict";

// Fails (exit 1) if any <img> in the scanned directories is missing width or height.

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SCAN_DIRS = ["course", "lectures", "exercises", "examples"];

function collectHtmlFiles(dir) {
	const results = [];
	if (!fs.existsSync(dir)) return results;
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			results.push(...collectHtmlFiles(full));
		} else if (entry.name.endsWith(".html")) {
			results.push(full);
		}
	}
	return results;
}

let violations = 0;

for (const dir of SCAN_DIRS) {
	for (const file of collectHtmlFiles(path.join(ROOT, dir))) {
		const html = fs.readFileSync(file, "utf8");
		for (const match of html.matchAll(/<img\s[^>]+>/gi)) {
			const tag = match[0];
			const missingWidth = !/\bwidth\s*=/i.test(tag);
			const missingHeight = !/\bheight\s*=/i.test(tag);
			if (missingWidth || missingHeight) {
				const missing = [missingWidth && "width", missingHeight && "height"].filter(Boolean).join(", ");
				const srcMatch = tag.match(/\bsrc\s*=\s*["']([^"']+)["']/i);
				const src = srcMatch ? srcMatch[1] : "(unknown src)";
				console.error(`${path.relative(ROOT, file)}: <img src="${src}"> missing ${missing}`);
				violations++;
			}
		}
	}
}

if (violations > 0) {
	console.error(`\n${violations} <img> tag(s) missing width/height. Run: node scripts/add-img-dimensions.js`);
	process.exit(1);
} else {
	console.log("OK: all <img> tags have width and height.");
}
