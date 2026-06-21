import fs from "fs";
import path from "path";

/**
 * Recursively collect every `*.html` file under `dir`.
 *
 * Pass `skipDirs` to prune directories by name (e.g. `Resources`, `vendor`).
 * A missing `dir` yields an empty list rather than throwing, so callers can
 * point it at optional section folders without guarding first.
 *
 * Note: this is the generic per-directory walker used by the in-place HTML
 * tools. It is intentionally distinct from `collect-html.js`, which applies the
 * site-wide skip lists (404.html, viewer shells, …) used by sitemap/a11y.
 */
export function collectHtmlFiles(dir: string, skipDirs?: ReadonlySet<string>): string[] {
	const results: string[] = [];
	if (!fs.existsSync(dir)) return results;
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			if (!skipDirs?.has(entry.name)) results.push(...collectHtmlFiles(full, skipDirs));
		} else if (entry.isFile() && entry.name.endsWith(".html")) {
			results.push(full);
		}
	}
	return results;
}
