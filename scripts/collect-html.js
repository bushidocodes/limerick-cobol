/**
 * Shared filesystem walk used by build-sitemap.js and .pa11yci.js
 * so both stay in sync as pages are added or removed.
 */

const fs = require("fs");
const path = require("path");

const REPO_ROOT = path.resolve(__dirname, "..");
const SKIP_DIRS = new Set([".playwright-mcp", "node_modules", ".claude", "scripts"]);
const SKIP_FILES = new Set(["404.html"]);

/**
 * Recursively collect all .html files under `dir`, skipping SKIP_DIRS / SKIP_FILES.
 * @param {string} dir
 * @returns {string[]} absolute file paths
 */
function collectHtmlFiles(dir = REPO_ROOT) {
	const results = [];
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		if (entry.isDirectory()) {
			if (!SKIP_DIRS.has(entry.name)) {
				results.push(...collectHtmlFiles(path.join(dir, entry.name)));
			}
		} else if (entry.isFile() && entry.name.endsWith(".html") && !SKIP_FILES.has(entry.name)) {
			results.push(path.join(dir, entry.name));
		}
	}
	return results;
}

module.exports = { collectHtmlFiles, REPO_ROOT };
