#!/usr/bin/env node
/**
 * check-example-orphans.js
 *
 * Fails CI if any .cbl file exists under examples/ without a matching entry
 * in the MANIFEST defined in build-examples.js.
 *
 * Usage:  npm run check:example-orphans
 */

"use strict";

const fs = require("fs");
const path = require("path");

const { MANIFEST, EXAMPLES_DIR } = require("./build-examples.js");

// Build the set of manifest-referenced .cbl paths (relative to EXAMPLES_DIR,
// forward slashes) so we can compare against on-disk files.
const manifestPaths = new Set(
	MANIFEST.map((entry) => {
		const dir = path.dirname(entry.file).replace(/\\/g, "/");
		return `${dir}/${entry.cbl}`;
	}),
);

// Walk examples/ and collect every .cbl file.
function walkCbl(dir, results = []) {
	for (const name of fs.readdirSync(dir)) {
		const full = path.join(dir, name);
		if (fs.statSync(full).isDirectory()) {
			walkCbl(full, results);
		} else if (name.endsWith(".cbl")) {
			results.push(path.relative(EXAMPLES_DIR, full).replace(/\\/g, "/"));
		}
	}
	return results;
}

const onDisk = walkCbl(EXAMPLES_DIR);
const orphans = onDisk.filter((p) => !manifestPaths.has(p));

if (orphans.length === 0) {
	console.log(`check-example-orphans: all ${onDisk.length} .cbl files are registered in the MANIFEST. OK`);
	process.exit(0);
} else {
	console.error(`check-example-orphans: ${orphans.length} orphaned .cbl file(s) found (not in MANIFEST):\n`);
	for (const p of orphans) {
		console.error(`  examples/${p}`);
	}
	console.error("\nAdd each file to the MANIFEST in scripts/build-examples.js or remove it.");
	process.exit(1);
}
