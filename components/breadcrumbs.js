// Light-DOM custom element <breadcrumbs>: renders a hierarchical trail from
// the site home down to the current page, derived from the URL pathname.
// Mirrors MDN's "Learn › Core › CSS styling basics" pattern.
//
// Auto-injection: an IIFE at the bottom inserts <breadcrumbs> as the first
// child of .page-wrapper (so it lands in the content column of the grid
// layout) or of <main> if no .page-wrapper exists. Pages can also place the
// tag manually.
//
// Scope: skipped on the site home page (where the trail would be just "Home"
// alone) and on viewer shells that don't have a <main>.
//
// Labels: top-level directories (course, exercises, examples, lectures) map
// to friendly titles via SECTION_LABELS. The leaf page uses document.title
// stripped at the first " - " / " — " / " | " separator.

(function () {
	function computeBaseUrl() {
		const scripts = document.querySelectorAll("script[src]");
		for (const s of scripts) {
			if (/components\/breadcrumbs\.js(\?|$)/.test(s.src)) {
				return s.src.replace(/components\/breadcrumbs\.js(\?.*)?$/, "");
			}
		}
		return "";
	}

	const baseUrl = computeBaseUrl();
	const homeUrl = baseUrl + "index.html";
	const sitePath = new URL(baseUrl || "./", location.href).pathname;

	// Top-level sections: friendly label plus the path of their entry page
	// (relative to the site base). Deeper directories don't get linked
	// because they don't have index pages — clicking them would 404.
	const TOP_LEVEL_SECTIONS = {
		course: { label: "Course", entry: "course/index.html" },
		exercises: { label: "Exercises", entry: "exercises/index.html" },
		examples: { label: "Examples", entry: "examples/default.html" },
		lectures: { label: "Lectures", entry: "lectures/index.html" },
	};

	function tidyLeafLabel() {
		const t = (document.title || "").trim();
		const parts = t.split(/\s+[-—–|]\s+/);
		return parts[0] || t;
	}

	function buildCrumbs() {
		const here = currentPath();
		if (!here.startsWith(sitePath)) return null;

		let rel = here.slice(sitePath.length).replace(/^\/+/, "");
		// A bare "" or "index.html" at site root means the home page.
		if (rel === "" || rel === "index.html") return null;
		rel = rel.replace(/\/index\.html$/, "/");

		const parts = rel.split("/").filter(Boolean);
		if (parts.length === 0) return null;

		const crumbs = [{ href: homeUrl, label: "Home" }];

		parts.forEach((part, i) => {
			const isLeaf = i === parts.length - 1 && !rel.endsWith("/");
			let label, href;
			if (isLeaf) {
				label = tidyLeafLabel();
				href = null;
			} else if (i === 0 && TOP_LEVEL_SECTIONS[part]) {
				// Top-level section: link to its known entry page.
				const sec = TOP_LEVEL_SECTIONS[part];
				label = sec.label;
				href = baseUrl + sec.entry;
			} else {
				// Intermediate directory with no guaranteed index page —
				// render as plain text rather than a 404-prone link.
				label = part.replace(/[-_]/g, " ");
				href = null;
			}
			crumbs.push({ href, label });
		});

		return crumbs;
	}

	function currentPath() {
		return new URL(location.href).pathname;
	}

	function render(host, crumbs) {
		const nav = document.createElement("nav");
		nav.className = "page-breadcrumbs";
		nav.setAttribute("aria-label", "Breadcrumb");

		const ol = document.createElement("ol");
		ol.className = "breadcrumbs-list";

		crumbs.forEach((c) => {
			const li = document.createElement("li");
			li.className = "breadcrumbs-item";
			if (c.href) {
				const a = document.createElement("a");
				a.href = c.href;
				a.textContent = c.label;
				li.appendChild(a);
			} else {
				const span = document.createElement("span");
				span.className = "breadcrumbs-current";
				span.textContent = c.label;
				span.setAttribute("aria-current", "page");
				li.appendChild(span);
			}
			ol.appendChild(li);
		});

		nav.appendChild(ol);
		host.appendChild(nav);
	}

	class PageBreadcrumbs extends HTMLElement {
		connectedCallback() {
			if (this.childElementCount > 0) return;
			const crumbs = buildCrumbs();
			if (!crumbs || crumbs.length < 2) {
				this.remove();
				return;
			}
			render(this, crumbs);
		}
	}

	if (!customElements.get("page-breadcrumbs")) {
		customElements.define("page-breadcrumbs", PageBreadcrumbs);
	}

	function autoInject() {
		if (document.querySelector("page-breadcrumbs")) return;
		const el = document.createElement("page-breadcrumbs");

		// Preferred insertion point: inside the content column, immediately
		// before <page-hero>. This keeps breadcrumbs visually aligned with
		// the lesson content (matching MDN's pattern) without becoming a
		// direct grid child of .page-wrapper, which would force the wrapper
		// grid into multiple rows and inflate row sizing for sticky
		// sidebar siblings.
		const hero = document.querySelector("page-hero");
		if (hero && hero.parentNode) {
			hero.parentNode.insertBefore(el, hero);
			return;
		}

		// Fallback for pages without a page-hero (e.g. index, glossary,
		// 404): insert at top of <main>.
		const main = document.getElementById("main-content") || document.querySelector("main");
		if (!main) return;
		main.insertBefore(el, main.firstChild);
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", autoInject);
	} else {
		autoInject();
	}
})();
