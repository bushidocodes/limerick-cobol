// Auto-injects the sticky site header across every page that loads this script.
// Computes its own base URL from the script tag's src so it works regardless of
// page depth (root, course/, examples/Subdir/, exercises/Sub/Subsub/, etc.) and
// regardless of deployment prefix (e.g. /limerick-cobol/ on GitHub Pages).
//
// Loads theme-toggle.js and site-search.js on demand if they haven't already
// been included by the host page, so callers only need a single <script> tag.
(function () {
	const scripts = document.querySelectorAll("script[src]");
	let baseUrl = "";
	for (const s of scripts) {
		if (/components\/site-header\.js(\?|$)/.test(s.src)) {
			baseUrl = s.src.replace(/components\/site-header\.js(\?.*)?$/, "");
			break;
		}
	}

	const componentsBase = baseUrl + "components/";
	const homeUrl = baseUrl + "index.html";
	const faviconUrl = baseUrl + "favicon.svg";

	// Primary nav verticals exposed in the header — mirrors MDN's top tabs.
	// `dir` is the first URL segment used to detect the active section.
	// `entry` is the section's known entry page (some use default.html, not
	// index.html). Keep in sync with TOP_LEVEL_SECTIONS in breadcrumbs.js.
	const NAV_SECTIONS = [
		{ label: "Course", dir: "course", entry: "course/index.html" },
		{ label: "Exercises", dir: "exercises", entry: "exercises/index.html" },
		{ label: "Examples", dir: "examples", entry: "examples/default.html" },
		{ label: "Lectures", dir: "lectures", entry: "lectures/index.html" },
	];

	function ensureScript(filename) {
		if (document.querySelector(`script[src*="components/${filename}"]`)) return;
		const s = document.createElement("script");
		s.src = componentsBase + filename;
		s.defer = true;
		document.head.appendChild(s);
	}

	ensureScript("theme-toggle.js");
	ensureScript("site-search.js");
	ensureScript("breadcrumbs.js");
	ensureScript("course-sidebar.js");

	function buildNavHTML() {
		const path = location.pathname;
		const items = NAV_SECTIONS.map((s) => {
			const isActive = new RegExp("/" + s.dir + "/").test(path);
			const attrs = isActive ? ' data-active aria-current="page"' : "";
			return `<li><a href="${baseUrl}${s.entry}"${attrs}>${s.label}</a></li>`;
		}).join("");
		return `<nav class="site-nav" aria-label="Primary"><ul>${items}</ul></nav>`;
	}

	function inject() {
		if (document.querySelector(".site-header")) return;
		const header = document.createElement("header");
		header.className = "site-header";
		header.innerHTML =
			`<a class="site-header__logo" href="${homeUrl}">` +
			`<img src="${faviconUrl}" alt="COBOL Tutorial" width="32" height="28">` +
			`</a>${buildNavHTML()}<theme-toggle></theme-toggle><site-search></site-search>`;
		const skipLink = document.body.querySelector("a.skip-link");
		if (skipLink) {
			skipLink.insertAdjacentElement("afterend", header);
		} else {
			document.body.prepend(header);
		}
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", inject);
	} else {
		inject();
	}
})();
