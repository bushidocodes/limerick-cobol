/**
 * Shared filesystem walk used by build-sitemap.ts and .pa11yci.cjs
 * so both stay in sync as pages are added or removed.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SKIP_DIRS = new Set([".playwright-mcp", "node_modules", ".claude", "scripts"]);
const SKIP_FILES = new Set(["404.html"]);
// Parameterized shells and meta-refresh stubs that must not be indexed or a11y-scanned directly.
const SKIP_PATHS = new Set([
	"course/Resources/build-viewer.html",
	"course/Resources/pdf-viewer.html",
	"lectures/cs4312topics.html",
]);

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
			const absPath = path.join(dir, entry.name);
			const relPath = path.relative(REPO_ROOT, absPath).replace(/\\/g, "/");
			if (!SKIP_PATHS.has(relPath)) {
				results.push(absPath);
			}
		}
	}
	return results;
}

export { collectHtmlFiles, REPO_ROOT };
