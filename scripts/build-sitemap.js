#!/usr/bin/env node
/**
 * build-sitemap.js
 * Walks the repo, finds every *.html file, and emits sitemap.xml at the repo root.
 * Skips .playwright-mcp/, node_modules/, and .claude/ directories.
 */

const fs = require("fs");
const path = require("path");

const BASE_URL = "https://bushidocodes.github.io/limerick-cobol/";
const REPO_ROOT = path.resolve(__dirname, "..");
const OUTPUT_PATH = path.join(REPO_ROOT, "sitemap.xml");

const SKIP_DIRS = new Set([".playwright-mcp", "node_modules", ".claude", "scripts"]);

/**
 * Recursively collect all .html files under `dir`, skipping SKIP_DIRS.
 * @param {string} dir
 * @returns {string[]} absolute file paths
 */
function collectHtmlFiles(dir) {
	const results = [];
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		if (entry.isDirectory()) {
			if (!SKIP_DIRS.has(entry.name)) {
				results.push(...collectHtmlFiles(path.join(dir, entry.name)));
			}
		} else if (entry.isFile() && entry.name.endsWith(".html")) {
			results.push(path.join(dir, entry.name));
		}
	}
	return results;
}

/**
 * Get ISO-8601 last-modified date for a file via git log.
 * Falls back to the file's mtime if git fails.
 * @param {string} filePath
 * @returns {string} YYYY-MM-DD
 */
function getLastMod(filePath) {
	try {
		const { execSync } = require("child_process");
		const result = execSync(
			`git log -1 --format=%cI -- "${filePath}"`,
			{ cwd: REPO_ROOT, stdio: ["ignore", "pipe", "ignore"] }
		).toString().trim();
		if (result) {
			return result.slice(0, 10);
		}
	} catch (_) {
		// fall through to mtime
	}
	const stat = fs.statSync(filePath);
	return stat.mtime.toISOString().slice(0, 10);
}

/**
 * Convert an absolute file path to its public URL.
 * @param {string} filePath
 * @returns {string}
 */
function toUrl(filePath) {
	const rel = path.relative(REPO_ROOT, filePath).replace(/\\/g, "/");
	return BASE_URL + rel;
}

function buildSitemap() {
	const htmlFiles = collectHtmlFiles(REPO_ROOT).sort();

	const urls = htmlFiles.map((file) => {
		const url = toUrl(file);
		const lastmod = getLastMod(file);
		return `  <url>\n    <loc>${url}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`;
	});

	const xml = [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
		...urls,
		"</urlset>",
		"",
	].join("\n");

	fs.writeFileSync(OUTPUT_PATH, xml, "utf8");
	console.log(`sitemap.xml written with ${htmlFiles.length} URLs.`);
}

buildSitemap();
