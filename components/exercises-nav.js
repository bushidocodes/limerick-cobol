// Exercise-level Prev / Next navigation bar. Mirrors lesson-nav.js for exercise
// pages. Reads the exercise sequence from window.COBOL_EXERCISES (exercise-progress.js),
// which must be loaded earlier in the page.
//
// All Exm-* and Prj-* pages live one directory below exercises/. Paths in
// COBOL_EXERCISES are relative to that root (subdir/file.html), so hrefs are
// constructed by prepending "../" to reach sibling exercise directories.

class ExercisesNav extends HTMLElement {
	connectedCallback() {
		const EXERCISES = window.COBOL_EXERCISES;
		if (!EXERCISES) return;

		// Build currentFile as a path relative to the exercises/ directory so it
		// matches entries in COBOL_EXERCISES regardless of nesting depth.
		// Simple exercises live directly in exercises/ (depth 0, e.g. "CountDown.html");
		// exam/project pages live one level deeper (depth 1, e.g. "Exm-Foo/Exm-Foo.html").
		const segments = window.location.pathname.split("/").filter(Boolean);
		const exercisesIdx = segments.lastIndexOf("exercises");
		const relSegments = exercisesIdx >= 0 ? segments.slice(exercisesIdx + 1) : segments.slice(-2);
		const currentFile = relSegments.join("/");
		const depth = relSegments.length - 1;
		const prefix = depth > 0 ? "../".repeat(depth) : "";

		const index = EXERCISES.findIndex((e) => e.file === currentFile);
		if (index === -1) return;

		const prev = index > 0 ? EXERCISES[index - 1] : null;
		const next = index < EXERCISES.length - 1 ? EXERCISES[index + 1] : null;

		const prevHTML = prev
			? `<a class="lesson-nav-prev" href="${prefix}${prev.file}">← Previous: ${prev.title}</a>`
			: `<span></span>`;
		const positionHTML = `<span class="lesson-nav-position">Exercise ${index + 1} of ${EXERCISES.length}</span>`;
		const nextHTML = next
			? `<a class="lesson-nav-next" href="${prefix}${next.file}">Next: ${next.title} →</a>`
			: `<span></span>`;

		this.innerHTML = `<nav class="lesson-nav" aria-label="Exercise navigation">${prevHTML}${positionHTML}${nextHTML}</nav>`;
	}

	disconnectedCallback() {}
}

customElements.define("exercises-nav", ExercisesNav);
