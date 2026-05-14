#!/usr/bin/env node
/**
 * generate-og-images.js
 *
 * Produces one 1200×630 PNG per site section in pics/og/.
 * Social platforms (Twitter/X, Slack, Discord, LinkedIn) require PNG/JPG —
 * the SVG favicon we used previously is silently dropped by most crawlers.
 *
 * Run: npm run build:og-images
 */

"use strict";

const { Resvg } = require("@resvg/resvg-js");
const fs = require("fs");
const path = require("path");

const OUT_DIR = path.resolve(__dirname, "../pics/og");
const WIDTH = 1200;
const HEIGHT = 630;

const SECTIONS = [
	{ id: "site", label: "COBOL Tutorials", subtitle: "Free programming course & examples" },
	{ id: "course", label: "Course", subtitle: "Structured COBOL programming lessons" },
	{ id: "examples", label: "Examples", subtitle: "Annotated COBOL source code" },
	{ id: "exercises", label: "Exercises", subtitle: "Hands-on COBOL programming practice" },
	{ id: "lectures", label: "Lectures", subtitle: "COBOL programming slide presentations" },
];

function esc(str) {
	return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildSvg(label, subtitle) {
	return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <!-- Background: two-tone dark blue -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="#0D47A1"/>
  <rect x="580" y="0" width="${WIDTH - 580}" height="${HEIGHT}" fill="#0A3D87"/>

  <!-- Large hex watermark (top-right, very faint) -->
  <g transform="translate(880,30) scale(3.8)" opacity="0.10">
    <polygon points="25,0 75,0 100,43.5 75,87" fill="#64B5F6"/>
    <polygon points="25,0 75,87 25,87 0,43.5" fill="#90CAF9"/>
  </g>

  <!-- Small hex logo (top-left, with COBOL text) -->
  <g transform="translate(80,55) scale(1.5)">
    <polygon points="25,0 75,0 100,43.5 75,87" fill="#1976D2"/>
    <polygon points="25,0 75,87 25,87 0,43.5" fill="#0A3D87"/>
    <text x="50" y="52" text-anchor="middle" fill="#FFFFFF"
          font-family="sans-serif" font-weight="900" font-size="18">COBOL</text>
  </g>

  <!-- Site name, aligned with logo -->
  <text x="234" y="112" font-family="sans-serif" font-size="26" fill="#90CAF9" font-weight="bold">Limerick COBOL</text>

  <!-- Horizontal rule -->
  <rect x="80" y="195" width="1040" height="2" fill="#1976D2" opacity="0.5"/>

  <!-- Section heading -->
  <text x="80" y="355" font-family="sans-serif" font-size="90" fill="#FFFFFF" font-weight="900">${esc(label)}</text>

  <!-- Subtitle -->
  <text x="80" y="435" font-family="sans-serif" font-size="34" fill="#90CAF9">${esc(subtitle)}</text>

  <!-- Bottom accent bar -->
  <rect x="80" y="564" width="140" height="6" fill="#42A5F5" rx="3"/>
</svg>`;
}

function main() {
	fs.mkdirSync(OUT_DIR, { recursive: true });

	for (const { id, label, subtitle } of SECTIONS) {
		const svg = buildSvg(label, subtitle);
		const resvg = new Resvg(svg, { fitTo: { mode: "width", value: WIDTH } });
		const png = resvg.render().asPng();
		const outPath = path.join(OUT_DIR, `${id}.png`);
		fs.writeFileSync(outPath, png);
		console.log(`✓ ${path.relative(path.resolve(__dirname, ".."), outPath)}`);
	}

	console.log("\nDone.");
}

main();
