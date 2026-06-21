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

import { siteBaseUrl } from "./util/base.js";
import { onReady } from "./util/dom.js";
import { renderSidebar } from "./util/sidebar.js";

(function () {
	const baseUrl = siteBaseUrl(import.meta.url);
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
		renderSidebar(host, {
			ariaLabel: "Exercises outline",
			homeUrl: exercisesHomeUrl,
			homeLabel: "COBOL Exercises",
			topics,
			hrefFor: (link) => new URL(link.file, exercisesRootUrl).toString(),
			isActive: (link) => resolvePath(link.file) === cur,
		});
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

	onReady(autoInject);
})();
