#!/usr/bin/env node

// Fails (exit 1) if any <img> in the scanned directories is missing width or height.

import { fileURLToPath } from "node:url";
import fs from "fs";
import path from "path";
import { collectHtmlFiles } from "./lib/html-files.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SCAN_DIRS = ["course", "lectures", "exercises", "examples"];

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
				const src = tag.match(/\bsrc\s*=\s*["']([^"']+)["']/i)?.[1] ?? "(unknown src)";
				console.error(`${path.relative(ROOT, file)}: <img src="${src}"> missing ${missing}`);
				violations++;
			}
		}
	}
}

if (violations > 0) {
	console.error(`\n${violations} <img> tag(s) missing width/height. Run: npm run fix:img-dims`);
	process.exit(1);
} else {
	console.log("OK: all <img> tags have width and height.");
}
