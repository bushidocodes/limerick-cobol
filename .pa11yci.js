const path = require("path");
const { collectHtmlFiles, REPO_ROOT } = require("./scripts/collect-html");

const BASE_URL = "http://localhost:8000/";

const urls = collectHtmlFiles()
	.map((file) => BASE_URL + path.relative(REPO_ROOT, file).replace(/\\/g, "/"))
	.sort();

module.exports = {
	defaults: {
		standard: "WCAG2AA",
		timeout: 30000,
		wait: 500,
		concurrency: 4,
		chromeLaunchConfig: {
			// --disable-dev-shm-usage works around GitHub Actions' 64 MB /dev/shm,
			// the most common cause of puppeteer Chrome crashes in CI. The others
			// trim memory pressure further. Without these, Chrome OOM-kills under
			// the full 171-URL scan and pa11y reports `Target.closeTarget` errors.
			args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--no-zygote"],
		},
	},
	urls,
};
