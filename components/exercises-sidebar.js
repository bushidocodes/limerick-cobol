// Light-DOM custom element <exercises-sidebar>: renders the full exercise
// outline on the left rail of every exercise page. Visual twin of
// <course-sidebar> / <examples-sidebar> — the rendered markup reuses the
// .course-sidebar* class names so a single CSS ruleset styles all three rails.
//
// Data source: window.COBOL_EXERCISES (defined in components/exercise-progress.js).
// That script must be loaded before this one — both are `defer`, so document
// order suffices.
//
// Auto-injection: an IIFE at the bottom inserts <exercises-sidebar> as the
// first child of .page-wrapper if it isn't already present. Skips the
// exercises index itself.
//
// Layout: shares the .page-wrapper :has(...) grid rules with course-sidebar
// in course-components.css. Hidden below ~1100px.

(function () {
	function computeBaseUrl() {
		const scripts = document.querySelectorAll("script[src]");
		for (const s of scripts) {
			if (/components\/exercises-sidebar\.js(\?|$)/.test(s.src)) {
				return s.src.replace(/components\/exercises-sidebar\.js(\?.*)?$/, "");
			}
		}
		return "";
	}

	const baseUrl = computeBaseUrl();
	const exercisesRootUrl = baseUrl + "exercises/";
	const exercisesHomeUrl = exercisesRootUrl + "index.html";

	function resolvePath(file) {
		return new URL(file, exercisesRootUrl).pathname;
	}

	function currentPath() {
		return new URL(location.href).pathname;
	}

	function isExercisesHome() {
		return /\/exercises\/(index\.html)?$/.test(currentPath());
	}

	function isInExercisesScope() {
		return /\/exercises\//.test(currentPath());
	}

	function groupByTopic(entries) {
		const byTopic = new Map();
		const order = [];
		for (const entry of entries) {
			const topic = entry.topic || "Exercises";
			if (!byTopic.has(topic)) {
				byTopic.set(topic, []);
				order.push(topic);
			}
			byTopic.get(topic).push(entry);
		}
		return order.map((label) => ({ label, links: byTopic.get(label) }));
	}

	function render(host, topics) {
		const cur = currentPath();

		const nav = document.createElement("nav");
		nav.className = "course-sidebar";
		nav.setAttribute("aria-label", "Exercises outline");

		const heading = document.createElement("p");
		heading.className = "course-sidebar-heading";
		const headingLink = document.createElement("a");
		headingLink.href = exercisesHomeUrl;
		headingLink.textContent = "COBOL Exercises";
		heading.appendChild(headingLink);
		nav.appendChild(heading);

		const list = document.createElement("ol");
		list.className = "course-sidebar-topics";

		for (const topic of topics) {
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
				a.href = new URL(link.file, exercisesRootUrl).toString();
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

	class ExercisesSidebar extends HTMLElement {
		connectedCallback() {
			if (this.childElementCount > 0) return;
			if (!isInExercisesScope() || isExercisesHome()) {
				this.remove();
				return;
			}
			const entries = window.COBOL_EXERCISES;
			if (!entries || !entries.length) {
				this.remove();
				return;
			}
			render(this, groupByTopic(entries));
		}
	}

	if (!customElements.get("exercises-sidebar")) {
		customElements.define("exercises-sidebar", ExercisesSidebar);
	}

	function autoInject() {
		if (document.querySelector("exercises-sidebar")) return;
		if (!isInExercisesScope()) return;
		if (isExercisesHome()) return;
		const pageWrapper = document.querySelector(".page-wrapper");
		if (!pageWrapper) return;
		const el = document.createElement("exercises-sidebar");
		pageWrapper.insertBefore(el, pageWrapper.firstChild);
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", autoInject);
	} else {
		autoInject();
	}
})();
