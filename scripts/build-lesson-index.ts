#!/usr/bin/env node
/**
 * build-lesson-index.ts
 *
 * Reads course/lesson-manifest.json and regenerates the topic blocks inside
 * course/index.html between the <!-- BEGIN:lesson-topics --> and
 * <!-- END:lesson-topics --> sentinel comments.
 *
 * Idempotent — safe to run multiple times.
 */

import fs from "fs";
import path from "path";

import { escapeHtml } from "./lib/html-text.js";
import { readJson } from "./lib/json.js";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const MANIFEST_PATH = path.join(REPO_ROOT, "course", "lesson-manifest.json");
const INDEX_PATH = path.join(REPO_ROOT, "course", "index.html");

const SENTINEL_BEGIN = "<!-- BEGIN:lesson-topics -->";
const SENTINEL_END = "<!-- END:lesson-topics -->";

const ICON_MAP: Record<string, string> = {
	tutorial: `<span class="icon-tut" aria-label="COBOL tutorial" role="img">T</span>`,
	exercise: `<span class="icon-exercise" aria-hidden="true">E</span>`,
	saq: `<span class="icon-saq" aria-hidden="true">?</span>`,
	reference: `<span class="icon-ref" aria-label="COBOL reference" role="img">R</span>`,
};

interface TopicLink {
	type: string;
	file: string;
	title: string;
}

interface Topic {
	label: string;
	description?: string;
	links: TopicLink[];
}

interface LessonManifest {
	topics: Topic[];
}

function slugify(s: string): string {
	return s
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

function buildTopicsHTML(topics: Topic[]): string {
	return topics
		.map((topic, i) => {
			const isLast = i === topics.length - 1;
			const slug = slugify(topic.label);
			const description = topic.description
				? `<p class="topic-description">${escapeHtml(topic.description)}</p>`
				: "";
			const links = topic.links
				.map(
					(link) =>
						`<div class="course-link"><span class="course-link-icon">${ICON_MAP[link.type] ?? ""}</span><a href="${link.file}">${link.title}</a></div>`,
				)
				.join("");
			const divider = isLast ? "" : `<div class="topic-divider"></div>`;
			return `<h2 class="topic-label" id="${slug}">${escapeHtml(topic.label)}</h2><div class="topic-links">${description}${links}</div>${divider}`;
		})
		.join("");
}

function main(): void {
	const manifest = readJson<LessonManifest>(MANIFEST_PATH);
	let html = fs.readFileSync(INDEX_PATH, "utf8");

	const beginIdx = html.indexOf(SENTINEL_BEGIN);
	const endIdx = html.indexOf(SENTINEL_END);

	if (beginIdx === -1 || endIdx === -1) {
		console.error(
			"Sentinels not found in course/index.html. Add:\n" +
				"  <!-- BEGIN:lesson-topics -->\n" +
				"  <!-- END:lesson-topics -->",
		);
		process.exit(1);
	}

	const inner = buildTopicsHTML(manifest.topics);
	const before = html.slice(0, beginIdx + SENTINEL_BEGIN.length);
	const after = html.slice(endIdx);
	html = before + inner + after;

	fs.writeFileSync(INDEX_PATH, html, "utf8");
	console.log(`Wrote course/index.html (${manifest.topics.length} topics).`);
}

main();
