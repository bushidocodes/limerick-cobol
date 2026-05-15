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
// the /course/ directory (so the course index and glossary also show it).
// Outside that scope, connectedCallback removes the element silently.
//
// Layout: a sibling rule in course-components.css gives .page-wrapper a grid
// when :has(course-sidebar) matches. Hidden below ~1100px so narrow viewports
// fall back to the existing top-of-page lesson-toc.

(function () {
	function computeBaseUrl() {
		const scripts = document.querySelectorAll("script[src]");
		for (const s of scripts) {
			if (/components\/course-sidebar\.js(\?|$)/.test(s.src)) {
				return s.src.replace(/components\/course-sidebar\.js(\?.*)?$/, "");
			}
		}
		return "";
	}

	const baseUrl = computeBaseUrl();
	const manifestUrl = baseUrl + "course/lesson-manifest.json";
	const courseHomeUrl = baseUrl + "course/index.html";

	function resolvePath(file) {
		return new URL(file, manifestUrl).pathname;
	}

	function currentPath() {
		return new URL(location.href).pathname;
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

		const nav = document.createElement("nav");
		nav.className = "course-sidebar";
		nav.setAttribute("aria-label", "Course outline");

		const heading = document.createElement("p");
		heading.className = "course-sidebar-heading";
		const headingLink = document.createElement("a");
		headingLink.href = courseHomeUrl;
		headingLink.textContent = "COBOL Course";
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
				li.className = `course-sidebar-link course-sidebar-link--${link.type}`;
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

	class CourseSidebar extends HTMLElement {
		connectedCallback() {
			if (this.childElementCount > 0) return;
			fetch(manifestUrl)
				.then((r) => r.json())
				.then((manifest) => {
					if (!this.isConnected) return;
					if (!isInCourseScope(manifest)) {
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
		const pageWrapper = document.querySelector(".page-wrapper");
		if (!pageWrapper) return;
		const el = document.createElement("course-sidebar");
		pageWrapper.insertBefore(el, pageWrapper.firstChild);
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", autoInject);
	} else {
		autoInject();
	}
})();
