#!/usr/bin/env node
/**
 * generate-icons.js
 *
 * Produces apple-touch-icon.png (180×180) and Android Chrome variants
 * (192×192, 512×512) from the site's hex logo SVG.
 *
 * iOS Safari ignores SVG favicons for Add-to-Home-Screen icons; this
 * supplies the PNGs it expects. Android Chrome reads sizes from the
 * web manifest.
 *
 * Run: npm run build:icons
 */

"use strict";

const { Resvg } = require("@resvg/resvg-js");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

const ICONS = [
	{ name: "apple-touch-icon.png", size: 180 },
	{ name: "android-chrome-192x192.png", size: 192 },
	{ name: "android-chrome-512x512.png", size: 512 },
];

function buildIconSvg() {
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="#ffffff"/>
  <g transform="translate(0, 6.5)">
    <polygon points="25,0 75,0 100,43.5 75,87" fill="#1976D2"/>
    <polygon points="25,0 75,87 25,87 0,43.5" fill="#0D47A1"/>
    <text x="50" y="52" text-anchor="middle" fill="#ffffff"
          font-family="Arial Black, Helvetica, sans-serif" font-weight="900"
          font-size="20" letter-spacing="-0.5">COBOL</text>
  </g>
</svg>`;
}

function main() {
	const svg = buildIconSvg();

	for (const { name, size } of ICONS) {
		const resvg = new Resvg(svg, { fitTo: { mode: "width", value: size } });
		const png = resvg.render().asPng();
		const outPath = path.join(ROOT, name);
		fs.writeFileSync(outPath, png);
		console.log(`✓ ${name}`);
	}

	console.log("\nDone.");
}

main();
