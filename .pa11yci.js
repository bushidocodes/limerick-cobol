const path = require("path");
const { collectHtmlFiles, REPO_ROOT } = require("./scripts/collect-html");

const BASE_URL = "http://localhost:8000/";

const config = {
	defaults: {
		standard: "WCAG2AA",
		timeout: 30000,
		wait: 500,
		chromeLaunchConfig: {
			// --disable-dev-shm-usage works around GitHub Actions' 64 MB /dev/shm,
			// the most common cause of puppeteer Chrome crashes in CI. The others
			// trim memory pressure further.
			args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
		},
	},
	// concurrency must be a root-level option for pa11y-ci to honor it.
	// (Under defaults it is passed to pa11y itself, which ignores it.)
	concurrency: 2,
	// Debt ledger: each entry is a known pre-existing violation with an open issue tracking its removal.
	ignore: [],
};

// pa11y-ci concatenates CLI URLs onto config urls. For partial PR scans we
// want only the CLI URLs, so the workflow sets PA11Y_PARTIAL=1 to skip this
// list. Without that, every "partial" scan would silently run the full suite.
//
// collectHtmlFiles() walks the repo root recursively, so coverage includes
// course pages, exercise pages, lecture pages, and all example pages under
// examples/ — no manual URL list maintenance required.
if (!process.env.PA11Y_PARTIAL) {
	config.urls = collectHtmlFiles()
		.map((file) => BASE_URL + path.relative(REPO_ROOT, file).replace(/\\/g, "/"))
		.sort();
}

module.exports = config;
