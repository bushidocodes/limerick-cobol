// Light-DOM custom element <course-sidebar>: renders the full COBOL course
// outline on the left rail of every page that belongs to the course. Mirrors
// MDN's left sidebar pattern — from any lesson the learner can see the whole
// module with the current page highlighted, and jump anywhere without
// backtracking through the course index.
//
// Data source: course/lesson-manifest.json (fetched once; same request
// lesson-progress.js makes, so the browser cache absorbs the cost).
//
// Auto-injection: an IIFE at the bottom inserts <course-sidebar> as the first
// child of .page-wrapper if it isn't already present. Pages can also place
// the tag manually — the connectedCallback handles both paths.
//
// Scope: the sidebar renders only when the current page is part of the
// course — either its pathname is listed in the manifest, or it lives under
// the /course/ directory (so the glossary shows it too). The course index
// itself is excluded, since its main content is already the full outline.
// Outside that scope, connectedCallback removes the element silently.
//
// Layout: a sibling rule in course-components.css gives .page-wrapper a grid
// when :has(course-sidebar) matches. Hidden below ~1100px so narrow viewports
// fall back to the existing top-of-page lesson-toc.

import { siteBaseUrl } from "./util/base.js";
import { onReady } from "./util/dom.js";
import { renderSidebar } from "./util/sidebar.js";

(function () {
	const baseUrl = siteBaseUrl(import.meta.url);
	const manifestUrl = baseUrl + "course/lesson-manifest.json";
	const courseHomeUrl = baseUrl + "course/index.html";

	function resolvePath(file) {
		return new URL(file, manifestUrl).pathname;
	}

	function currentPath() {
		return new URL(location.href).pathname;
	}

	function isCourseHome() {
		return /\/course\/(index\.html)?$/.test(currentPath());
	}

	function isInCourseScope(manifest) {
		const cur = currentPath();
		if (/\/course\//.test(cur)) return true;
		for (const topic of manifest.topics) {
			for (const link of topic.links) {
				if (resolvePath(link.file) === cur) return true;
			}
		}
		return false;
	}

	function render(host, manifest) {
		const cur = currentPath();
		renderSidebar(host, {
			ariaLabel: "Course outline",
			homeUrl: courseHomeUrl,
			homeLabel: "COBOL Course",
			topics: manifest.topics,
			hrefFor: (link) => new URL(link.file, manifestUrl).toString(),
			isActive: (link) => resolvePath(link.file) === cur,
			linkClass: (link) => `course-sidebar-link course-sidebar-link--${link.type}`,
		});
	}

	class CourseSidebar extends HTMLElement {
		connectedCallback() {
			if (this.childElementCount > 0) return;
			fetch(manifestUrl)
				.then((r) => r.json())
				.then((manifest) => {
					if (!this.isConnected) return;
					if (!isInCourseScope(manifest) || isCourseHome()) {
						this.remove();
						return;
					}
					render(this, manifest);
				})
				.catch(() => {
					// Fail silently — no sidebar.
				});
		}
	}

	if (!customElements.get("course-sidebar")) {
		customElements.define("course-sidebar", CourseSidebar);
	}

	function autoInject() {
		if (document.querySelector("course-sidebar")) return;
		// Gate by URL so non-course pages don't get an empty sidebar inserted
		// and then removed after the manifest fetch (avoids a layout flash).
		// Exercise/example pages can still opt in by adding <course-sidebar>
		// manually if desired.
		if (!/\/course\//.test(location.pathname)) return;
		if (isCourseHome()) return;
		const pageWrapper = document.querySelector(".page-wrapper");
		if (!pageWrapper) return;
		const el = document.createElement("course-sidebar");
		pageWrapper.insertBefore(el, pageWrapper.firstChild);
	}

	onReady(autoInject);
})();
