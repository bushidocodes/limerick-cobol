#!/usr/bin/env node

/**
 * build-sitemap.ts
 * Walks the repo, finds every *.html file, and emits sitemap.xml at the repo root.
 *
 * Intentionally omits <lastmod>: deriving dates from git log needs a full clone
 * in CI, and shallow checkouts rewrote every date (and dirty-committed the
 * sitemap) on unrelated PRs. URL list alone is enough for crawlers.
 */

import fs from "fs";
import path from "path";
import { collectHtmlFiles, REPO_ROOT } from "./collect-html.js";

const BASE_URL = "https://bushidocodes.github.io/limerick-cobol/";
const OUTPUT_PATH = path.join(REPO_ROOT, "sitemap.xml");

/** Convert an absolute file path to its public URL. */
function toUrl(filePath: string): string {
	const rel = path.relative(REPO_ROOT, filePath).replace(/\\/g, "/");
	return BASE_URL + rel;
}

function buildSitemap(): void {
	const htmlFiles = collectHtmlFiles().sort();

	const urls = htmlFiles.map((file) => {
		const url = toUrl(file);
		return `  <url>\n    <loc>${url}</loc>\n  </url>`;
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
