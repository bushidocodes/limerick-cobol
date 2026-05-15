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

	function ensureScript(filename) {
		if (document.querySelector(`script[src*="components/${filename}"]`)) return;
		const s = document.createElement("script");
		s.src = componentsBase + filename;
		s.defer = true;
		document.head.appendChild(s);
	}

	ensureScript("theme-toggle.js");
	ensureScript("site-search.js");

	function inject() {
		if (document.querySelector(".site-header")) return;
		const header = document.createElement("header");
		header.className = "site-header";
		header.innerHTML =
			`<a class="site-header__logo" href="${homeUrl}">` +
			`<img src="${faviconUrl}" alt="COBOL Tutorial" width="32" height="28">` +
			`</a><theme-toggle></theme-toggle><site-search></site-search>`;
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
