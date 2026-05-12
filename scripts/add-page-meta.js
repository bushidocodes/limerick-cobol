#!/usr/bin/env node
/**
 * add-page-meta.js
 * Injects missing SEO metadata (description, canonical URL, Open Graph, Twitter Card)
 * into every leaf HTML page under course/, exercises/, examples/, lectures/.
 *
 * Pages that already have a <meta name="description"> are skipped (idempotent).
 *
 * To override an auto-extracted description, add an entry to scripts/page-descriptions.json
 * keyed by the repo-root-relative path, e.g.:
 *   { "course/Arithmetic.html": "Custom description here." }
 *
 * Run: node scripts/add-page-meta.js
 */

const fs = require("fs");
const path = require("path");

const BASE_URL = "https://bushidocodes.github.io/limerick-cobol/";
const OG_IMAGE = "https://bushidocodes.github.io/limerick-cobol/favicon.svg";
const REPO_ROOT = path.resolve(__dirname, "..");
const CONTENT_DIRS = ["course", "exercises", "examples", "lectures"];
const SKIP_NAMES = new Set(["index.html", "default.html"]);

// ── Optional manual override map ──────────────────────────────────────────────
const OVERRIDES_PATH = path.join(__dirname, "page-descriptions.json");
const OVERRIDES = fs.existsSync(OVERRIDES_PATH) ? JSON.parse(fs.readFileSync(OVERRIDES_PATH, "utf8")) : {};

// ── Text utilities ─────────────────────────────────────────────────────────────
function stripTags(html) {
	return html.replace(/<[^>]+>/g, " ");
}

function decodeEntities(str) {
	return str
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, '"')
		.replace(/&apos;/g, "'")
		.replace(/&nbsp;/g, " ")
		.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)));
}

function cleanText(html) {
	return decodeEntities(stripTags(html)).replace(/\s+/g, " ").trim();
}

function truncate(text, max = 155) {
	if (text.length <= max) return text;
	const cut = text.lastIndexOf(" ", max);
	return (cut > 80 ? text.slice(0, cut) : text.slice(0, max)).trimEnd();
}

function escapeAttr(str) {
	return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ── HTML parsing helpers ───────────────────────────────────────────────────────
function extractTitle(html) {
	const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
	return m ? cleanText(m[1]) : "";
}

/** Detect the whitespace prefix used on the <title> line so injected tags match. */
function detectIndent(html) {
	const m = html.match(/^([ \t]*)<title/m);
	return m ? m[1] : "\t";
}

function alreadyTagged(html) {
	return /<meta\s[^>]*name=["']description["']/i.test(html);
}

// ── Description extractors ─────────────────────────────────────────────────────

/** Course pages: lift the paragraph from the "Aims" sidebar section. */
function fromCourse(html) {
	const m = html.match(/<h3>\s*Aims\s*<\/h3>[\s\S]*?class="section-content"[^>]*>[\s\S]*?<p>([\s\S]*?)<\/p>/i);
	if (m) {
		const t = truncate(cleanText(m[1]));
		if (t.length > 20) return t;
	}
	return null;
}

/** Exercise pages: lift the first paragraph from the Introduction section. */
function fromExercise(html) {
	const m = html.match(/<h2>\s*Introduction\s*<\/h2>[\s\S]*?<p>([\s\S]*?)<\/p>/i);
	if (m) {
		const t = truncate(cleanText(m[1]));
		if (t.length > 20) return t;
	}
	return null;
}

/**
 * Build a map of { lowercased-view-path → description } from examples/default.html.
 * Each data row contains a description td (width=298) and a View link in the actions td.
 */
function buildExampleMap(defaultHtml) {
	const map = {};
	// Match complete <tr>...</tr> blocks, then inspect each for a View link + description td.
	const rowRe = /<tr(?:\s[^>]*)?>[\s\S]*?<\/tr>/gi;
	let rowMatch;
	while ((rowMatch = rowRe.exec(defaultHtml)) !== null) {
		const row = rowMatch[0];
		const viewMatch = row.match(/href="([^"]+\.html)">\s*View\s*<\/a>/i);
		const descMatch = row.match(/<td\s+width=["']298["'][^>]*>([\s\S]*?)<\/td>/i);
		if (viewMatch && descMatch) {
			const desc = truncate(cleanText(descMatch[1]));
			if (desc.length > 15) {
				map[viewMatch[1].toLowerCase()] = desc;
			}
		}
	}
	return map;
}

function fromExampleMap(exampleMap, filePath) {
	const relToExamples = path.relative(path.join(REPO_ROOT, "examples"), filePath).replace(/\\/g, "/");
	return exampleMap[relToExamples.toLowerCase()] || null;
}

/** Fallback for example pages: first long paragraph in the page. */
function fromExamplePage(html) {
	const paras = html.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [];
	for (const p of paras) {
		const t = cleanText(p);
		if (t.length > 40) return truncate(t);
	}
	return null;
}

/** Lecture pages: derive description from the page title. */
function fromLecture(title) {
	const topic = title.replace(/\s*[-–]\s*COBOL\s*(Lecture|Course)?\s*$/i, "").trim();
	return `COBOL lecture slides covering ${topic}.`;
}

function fallback(type, title) {
	const clean = title.replace(/\s*[-–]\s*COBOL.*$/i, "").trim() || title;
	const templates = {
		course: `COBOL programming lesson on ${clean}.`,
		exercises: `COBOL programming exercise: ${clean}.`,
		examples: `COBOL example program: ${clean}.`,
		lectures: `COBOL lecture on ${clean}.`,
	};
	return templates[type] || `${clean} — COBOL programming resource.`;
}

// ── Metadata block builder ─────────────────────────────────────────────────────
function buildMetaBlock(title, description, canonical, ogType, indent) {
	const d = escapeAttr(description);
	const t = escapeAttr(title);
	const c = escapeAttr(canonical);
	const lines = [
		`<meta name="description" content="${d}" />`,
		`<link rel="canonical" href="${c}" />`,
		`<!-- Open Graph -->`,
		`<meta property="og:type" content="${ogType}" />`,
		`<meta property="og:url" content="${c}" />`,
		`<meta property="og:title" content="${t}" />`,
		`<meta property="og:description" content="${d}" />`,
		`<meta property="og:image" content="${OG_IMAGE}" />`,
		`<!-- Twitter Card -->`,
		`<meta name="twitter:card" content="summary" />`,
		`<meta name="twitter:title" content="${t}" />`,
		`<meta name="twitter:description" content="${d}" />`,
	];
	return lines.map((line) => indent + line).join("\n");
}

// ── File collection ────────────────────────────────────────────────────────────
function collectLeafHtmlFiles(dir) {
	const results = [];
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			results.push(...collectLeafHtmlFiles(full));
		} else if (entry.isFile() && entry.name.endsWith(".html") && !SKIP_NAMES.has(entry.name)) {
			results.push(full);
		}
	}
	return results;
}

// ── Per-file processing ────────────────────────────────────────────────────────
function processFile(filePath, exampleMap) {
	const html = fs.readFileSync(filePath, "utf8");
	if (alreadyTagged(html)) return null;

	const relPath = path.relative(REPO_ROOT, filePath).replace(/\\/g, "/");
	const pageType = relPath.split("/")[0];
	const title = extractTitle(html);
	const canonical = BASE_URL + relPath;
	const ogType = pageType === "course" ? "article" : "website";
	const indent = detectIndent(html);

	const description =
		OVERRIDES[relPath] ||
		(pageType === "course" && fromCourse(html)) ||
		(pageType === "exercises" && fromExercise(html)) ||
		(pageType === "examples" && (fromExampleMap(exampleMap, filePath) || fromExamplePage(html))) ||
		(pageType === "lectures" && fromLecture(title)) ||
		fallback(pageType, title);

	const metaBlock = buildMetaBlock(title, description, canonical, ogType, indent);
	const updated = html.replace(/(<\/title>)/, "$1\n" + metaBlock);
	fs.writeFileSync(filePath, updated, "utf8");
	return { relPath, description };
}

// ── Entry point ────────────────────────────────────────────────────────────────
function main() {
	const defaultHtmlPath = path.join(REPO_ROOT, "examples", "default.html");
	const exampleMap = fs.existsSync(defaultHtmlPath) ? buildExampleMap(fs.readFileSync(defaultHtmlPath, "utf8")) : {};

	let updated = 0,
		skipped = 0,
		errors = 0;

	for (const dir of CONTENT_DIRS) {
		const dirPath = path.join(REPO_ROOT, dir);
		if (!fs.existsSync(dirPath)) continue;

		for (const file of collectLeafHtmlFiles(dirPath)) {
			try {
				const result = processFile(file, exampleMap);
				if (!result) {
					skipped++;
				} else {
					updated++;
					console.log(`✓ ${result.relPath}`);
					console.log(`  "${result.description}"`);
				}
			} catch (err) {
				errors++;
				console.error(`✗ ${path.relative(REPO_ROOT, file)}: ${err.message}`);
			}
		}
	}

	console.log(`\nDone: ${updated} updated, ${skipped} skipped, ${errors} errors.`);
}

main();
