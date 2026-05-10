#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SCAN_DIRS = ["course", "lectures", "exercises", "examples"];

// Inline dimension readers — no external deps needed.

function readGifDimensions(buf) {
	// GIF header: signature (6) + width (2 LE) + height (2 LE)
	return { width: buf.readUInt16LE(6), height: buf.readUInt16LE(8) };
}

function readPngDimensions(buf) {
	// PNG IHDR chunk starts at byte 16: width (4 BE) + height (4 BE)
	return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function readJpgDimensions(buf) {
	// Scan for SOF0/SOF1/SOF2 markers (0xFF 0xC0-0xC3)
	let i = 2;
	while (i + 8 < buf.length) {
		if (buf[i] !== 0xff) break;
		const marker = buf[i + 1];
		if (marker >= 0xc0 && marker <= 0xc3) {
			return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
		}
		const segLen = buf.readUInt16BE(i + 2);
		i += 2 + segLen;
	}
	return null;
}

function getImageDimensions(imgPath) {
	if (!fs.existsSync(imgPath)) return null;
	const buf = fs.readFileSync(imgPath);
	const ext = path.extname(imgPath).toLowerCase();
	if (ext === ".gif") return readGifDimensions(buf);
	if (ext === ".png") return readPngDimensions(buf);
	if (ext === ".jpg" || ext === ".jpeg") return readJpgDimensions(buf);
	return null;
}

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

function processFile(htmlPath) {
	const original = fs.readFileSync(htmlPath, "utf8");
	let changed = false;

	const patched = original.replace(/<img\s[^>]+>/gi, (tag) => {
		const hasWidth = /\bwidth\s*=/i.test(tag);
		const hasHeight = /\bheight\s*=/i.test(tag);
		if (hasWidth && hasHeight) return tag;

		const srcMatch = tag.match(/\bsrc\s*=\s*["']([^"']+)["']/i);
		if (!srcMatch) return tag;

		const imgSrc = srcMatch[1];
		if (imgSrc.startsWith("data:") || /^https?:\/\//i.test(imgSrc)) return tag;

		const imgPath = path.resolve(path.dirname(htmlPath), imgSrc);
		const dims = getImageDimensions(imgPath);
		if (!dims) {
			console.warn(`  WARN: cannot read dimensions for ${imgSrc} in ${path.relative(ROOT, htmlPath)}`);
			return tag;
		}

		const attrs = [];
		if (!hasWidth) attrs.push(`width="${dims.width}"`);
		if (!hasHeight) attrs.push(`height="${dims.height}"`);

		changed = true;
		// Insert before the closing /> or >
		return tag.replace(/(\s*\/?>)$/, ` ${attrs.join(" ")}$1`);
	});

	if (changed) {
		fs.writeFileSync(htmlPath, patched, "utf8");
		return true;
	}
	return false;
}

let totalFiles = 0;
let patchedFiles = 0;

for (const dir of SCAN_DIRS) {
	const htmlFiles = collectHtmlFiles(path.join(ROOT, dir));
	for (const file of htmlFiles) {
		totalFiles++;
		if (processFile(file)) {
			patchedFiles++;
			console.log(`Patched: ${path.relative(ROOT, file)}`);
		}
	}
}

console.log(`\nDone. ${patchedFiles} of ${totalFiles} HTML files updated.`);
