#!/usr/bin/env node
/**
 * build-sitemap.ts
 * Walks the repo, finds every *.html file, and emits sitemap.xml at the repo root.
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { collectHtmlFiles, REPO_ROOT } from "./collect-html.js";

const BASE_URL = "https://bushidocodes.github.io/limerick-cobol/";
const OUTPUT_PATH = path.join(REPO_ROOT, "sitemap.xml");

/**
 * Get ISO-8601 last-modified date for a file via git log.
 * Falls back to the file's mtime if git fails.
 * @returns YYYY-MM-DD
 */
function getLastMod(filePath: string): string {
	try {
		const result = execSync(`git log -1 --format=%cI -- "${filePath}"`, {
			cwd: REPO_ROOT,
			stdio: ["ignore", "pipe", "ignore"],
		})
			.toString()
			.trim();
		if (result) {
			return result.slice(0, 10);
		}
	} catch {
		// fall through to mtime
	}
	const stat = fs.statSync(filePath);
	return stat.mtime.toISOString().slice(0, 10);
}

/** Convert an absolute file path to its public URL. */
function toUrl(filePath: string): string {
	const rel = path.relative(REPO_ROOT, filePath).replace(/\\/g, "/");
	return BASE_URL + rel;
}

function buildSitemap(): void {
	const htmlFiles = collectHtmlFiles().sort();

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
