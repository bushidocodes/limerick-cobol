const os = require("os");
const path = require("path");
const { collectHtmlFiles, REPO_ROOT } = require("./scripts/collect-html");

const BASE_URL = "http://localhost:8000/";

const config = {
	defaults: {
		standard: "WCAG2AA",
		timeout: 30000,
		wait: 500,
		// Check pages in parallel for a much faster LOCAL run (~5x on a multi-core
		// dev machine: full suite ~1 min instead of ~6). pa11y-ci launches one
		// browser and the queue parallelizes cheaply over it, so we fan out to as
		// many CPUs as the machine has. Gated to non-CI on purpose:
		//   - The Actions runner is core-bound, so parallelism gives no speedup
		//     there (measured: 292s vs 291s) — and the full ~173-page scan is
		//     already memory-fragile on it (see the OOM note in checks.yml), so
		//     adding concurrent pages would only risk OOM for zero gain. CI keeps
		//     pa11y-ci's safe sequential default (concurrency 1, incognito on).
		//   - concurrency must live under `defaults`: pa11y-ci's bin passes
		//     `config.defaults` (not the root config) to the runner, so a
		//     root-level value is silently ignored and the queue runs at 1.
		//   - useIncognitoBrowserContext must be false for stable parallelism: the
		//     default per-test incognito contexts crash under load, and each
		//     failure then burns the full 30s timeout. Sharing the default context
		//     is safe here — no page writes cookies/localStorage during a scan.
		...(process.env.CI ? {} : { concurrency: os.cpus().length, useIncognitoBrowserContext: false }),
		chromeLaunchConfig: {
			// --disable-dev-shm-usage works around GitHub Actions' 64 MB /dev/shm,
			// the most common cause of puppeteer Chrome crashes in CI. The others
			// trim memory pressure further.
			args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
		},
	},
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
