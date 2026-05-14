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
			args: ["--no-sandbox"],
		},
	},
	urls,
};
