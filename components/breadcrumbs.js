// Light-DOM custom element <page-breadcrumbs>: renders a hierarchical trail
// from the site home down to the current page, derived from the URL pathname.
// Mirrors MDN's "Learn › Core › CSS styling basics" pattern.
//
// Auto-injection: an IIFE at the bottom inserts <page-breadcrumbs> as a
// sibling of .site-header, immediately after it, so it forms a full-width
// sticky secondary bar (MDN-style). The element also hosts a <theme-toggle>
// on the right edge so the toggle scrolls away with the bar.
//
// Scope: skipped entirely on viewer shells that don't have a <main>. On the
// site home page (where the trail would be just "Home") the breadcrumb nav
// is omitted but the bar still renders so the theme-toggle remains reachable.
//
// Labels: top-level directories (course, exercises, examples, lectures) map
// to friendly titles via TOP_LEVEL_SECTIONS. The leaf page uses
// document.title stripped at the first " - " / " — " / " | " separator.
//
// Course pages get an extra topic-level crumb inserted between "Course" and
// the leaf. The topic + canonical lesson title come from
// course/lesson-manifest.json, fetched after the initial render so the bar
// shows up immediately and the leaf upgrades when the manifest resolves.

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
		examples: { label: "Examples", entry: "examples/index.html" },
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

	function renderCrumbs(crumbs) {
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
				// Render the current page as a link to #top so clicking the
				// leaf scrolls to the top of the page (page-hero carries the
				// #top anchor). aria-current="page" preserves screen-reader
				// semantics that the user is already here.
				const a = document.createElement("a");
				a.className = "breadcrumbs-current";
				a.href = "#top";
				a.textContent = c.label;
				a.setAttribute("aria-current", "page");
				li.appendChild(a);
			}
			ol.appendChild(li);
		});

		nav.appendChild(ol);
		return nav;
	}

	function render(host, crumbs) {
		const inner = document.createElement("div");
		inner.className = "breadcrumb-bar-inner";

		if (crumbs && crumbs.length >= 2) {
			inner.appendChild(renderCrumbs(crumbs));
		} else {
			// Spacer keeps the theme-toggle right-aligned on pages without a
			// breadcrumb trail (e.g. the site home).
			const spacer = document.createElement("div");
			spacer.className = "breadcrumb-bar-spacer";
			inner.appendChild(spacer);
		}

		inner.appendChild(document.createElement("theme-toggle"));
		host.appendChild(inner);
	}

	// Mirrors scripts/build-lesson-index.js so the topic anchor produced here
	// matches the #ids generated for course/index.html.
	function slugify(s) {
		return s
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "");
	}

	// Returns { topic, slug, title, firstLinkFile } if `fileName` (a basename
	// like "COBOLIntro.html") appears as a link inside one of the manifest
	// topics AND that link points within course/ (not ../exercises/, etc.).
	// Cross-section links don't get a topic crumb here because the user is on
	// a different section's page.
	//
	// `firstLinkFile` is the first link in the topic — used as the click
	// target for the topic crumb so users land on the topic's opening page
	// rather than scrolling course/index.html to an anchor.
	function findLessonInManifest(manifest, fileName) {
		if (!manifest || !Array.isArray(manifest.topics)) return null;
		for (const topic of manifest.topics) {
			const links = topic.links || [];
			for (const link of links) {
				if (!link.file || link.file.includes("..")) continue;
				const linkBase = link.file.split("/").pop();
				if (linkBase === fileName) {
					return {
						topic: topic.label,
						slug: slugify(topic.label),
						title: link.title,
						firstLinkFile: (links.find((l) => l.file) || {}).file,
					};
				}
			}
		}
		return null;
	}

	async function augmentCourseCrumbs(host) {
		const here = currentPath();
		// Only attempt for /<base>/course/<file>.html, never the course index.
		const courseFileRe = new RegExp("^" + sitePath.replace(/\/$/, "") + "/course/([^/]+\\.html)$");
		const m = here.match(courseFileRe);
		if (!m || m[1] === "index.html") return;

		try {
			const r = await fetch(baseUrl + "course/lesson-manifest.json");
			if (!r.ok) return;
			const manifest = await r.json();
			const found = findLessonInManifest(manifest, m[1]);
			if (!found) return;

			// First link may be a relative path like "../exercises/Foo.html";
			// resolving it against the course directory keeps the link correct
			// regardless of the user's current depth.
			const topicHref = found.firstLinkFile
				? new URL(found.firstLinkFile, baseUrl + "course/").href
				: baseUrl + "course/index.html#" + found.slug;
			const crumbs = [
				{ href: homeUrl, label: "Home" },
				{ href: baseUrl + "course/index.html", label: "Course" },
				{ href: topicHref, label: found.topic },
				{ href: null, label: found.title },
			];

			const oldNav = host.querySelector("nav.page-breadcrumbs");
			const newNav = renderCrumbs(crumbs);
			if (oldNav) {
				oldNav.replaceWith(newNav);
			} else {
				const spacer = host.querySelector(".breadcrumb-bar-spacer");
				if (spacer) spacer.replaceWith(newNav);
			}
		} catch {
			// Network or parse errors: leave the URL-derived crumbs as-is.
		}
	}

	class PageBreadcrumbs extends HTMLElement {
		connectedCallback() {
			if (this.childElementCount > 0) return;
			render(this, buildCrumbs());
			augmentCourseCrumbs(this);
		}
	}

	if (!customElements.get("page-breadcrumbs")) {
		customElements.define("page-breadcrumbs", PageBreadcrumbs);
	}

	function autoInject() {
		if (document.querySelector("page-breadcrumbs")) return;

		// Viewer shells (pdf-viewer, build-viewer) have no <main>; skip
		// entirely so the bar doesn't appear above the embedded UI.
		const main = document.getElementById("main-content") || document.querySelector("main");
		if (!main) return;

		const el = document.createElement("page-breadcrumbs");

		// Preferred placement: sibling of .site-header, immediately after it.
		// Renders as a full-width sticky secondary bar (MDN's pattern).
		const header = document.querySelector(".site-header");
		if (header && header.parentNode) {
			header.insertAdjacentElement("afterend", el);
			return;
		}

		// Fallback for pages that somehow load breadcrumbs.js without a
		// site-header: drop it at the top of <main> so it still renders.
		main.insertBefore(el, main.firstChild);
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", autoInject);
	} else {
		autoInject();
	}
})();
