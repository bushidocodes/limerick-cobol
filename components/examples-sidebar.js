// Light-DOM custom element <examples-sidebar>: renders the full COBOL examples
// index on the left rail of every example page. Visual twin of <course-sidebar>:
// the rendered markup reuses .course-sidebar* class names so a single CSS
// ruleset styles both rails.
//
// Data source: examples/example-manifest.json (emitted by scripts/build-examples.js
// alongside the HTML pages).
//
// Auto-injection: an IIFE at the bottom inserts <examples-sidebar> as the
// first child of .page-wrapper if it isn't already present. Skips the
// examples index itself (the page already lists every example, so a sidebar
// would just duplicate it).
//
// Layout: shares the .page-wrapper :has(...) grid rules with course-sidebar
// in course-components.css. Hidden below ~1100px.

(function () {
	function computeBaseUrl() {
		const scripts = document.querySelectorAll("script[src]");
		for (const s of scripts) {
			if (/components\/examples-sidebar\.js(\?|$)/.test(s.src)) {
				return s.src.replace(/components\/examples-sidebar\.js(\?.*)?$/, "");
			}
		}
		return "";
	}

	const baseUrl = computeBaseUrl();
	const manifestUrl = baseUrl + "examples/example-manifest.json";
	const examplesHomeUrl = baseUrl + "examples/index.html";

	function resolvePath(file) {
		return new URL(file, manifestUrl).pathname;
	}

	function currentPath() {
		return new URL(location.href).pathname;
	}

	function isExamplesHome() {
		return /\/examples\/(index\.html)?$/.test(currentPath());
	}

	function isInExamplesScope() {
		return /\/examples\//.test(currentPath());
	}

	function render(host, manifest) {
		const cur = currentPath();

		const nav = document.createElement("nav");
		nav.className = "course-sidebar";
		nav.setAttribute("aria-label", "Examples outline");

		const heading = document.createElement("p");
		heading.className = "course-sidebar-heading";
		const headingLink = document.createElement("a");
		headingLink.href = examplesHomeUrl;
		headingLink.textContent = "COBOL Examples";
		heading.appendChild(headingLink);
		nav.appendChild(heading);

		const list = document.createElement("ol");
		list.className = "course-sidebar-topics";

		for (const topic of manifest.topics) {
			const topicLi = document.createElement("li");
			topicLi.className = "course-sidebar-topic";

			const topicLabel = document.createElement("p");
			topicLabel.className = "course-sidebar-topic-label";
			topicLabel.textContent = topic.label;
			topicLi.appendChild(topicLabel);

			const linksUl = document.createElement("ul");
			linksUl.className = "course-sidebar-links";

			let topicHasActive = false;
			for (const link of topic.links) {
				const li = document.createElement("li");
				li.className = "course-sidebar-link";
				const a = document.createElement("a");
				a.href = new URL(link.file, manifestUrl).toString();
				a.textContent = link.title;
				if (resolvePath(link.file) === cur) {
					a.setAttribute("data-active", "");
					a.setAttribute("aria-current", "page");
					topicHasActive = true;
				}
				li.appendChild(a);
				linksUl.appendChild(li);
			}

			if (topicHasActive) topicLi.setAttribute("data-active-topic", "");
			topicLi.appendChild(linksUl);
			list.appendChild(topicLi);
		}

		nav.appendChild(list);
		host.appendChild(nav);
	}

	class ExamplesSidebar extends HTMLElement {
		connectedCallback() {
			if (this.childElementCount > 0) return;
			if (!isInExamplesScope() || isExamplesHome()) {
				this.remove();
				return;
			}
			fetch(manifestUrl)
				.then((r) => r.json())
				.then((manifest) => {
					if (!this.isConnected) return;
					render(this, manifest);
				})
				.catch(() => {
					// Fail silently — no sidebar.
				});
		}
	}

	if (!customElements.get("examples-sidebar")) {
		customElements.define("examples-sidebar", ExamplesSidebar);
	}

	function autoInject() {
		if (document.querySelector("examples-sidebar")) return;
		if (!isInExamplesScope()) return;
		if (isExamplesHome()) return;
		const pageWrapper = document.querySelector(".page-wrapper");
		if (!pageWrapper) return;
		const el = document.createElement("examples-sidebar");
		pageWrapper.insertBefore(el, pageWrapper.firstChild);
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", autoInject);
	} else {
		autoInject();
	}
})();
