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

		// Match against the last two path segments (subdir/file.html) since each
		// exercise lives in its own subdirectory under exercises/.
		const segments = window.location.pathname.split("/").filter(Boolean);
		const currentFile = segments.slice(-2).join("/");

		const index = EXERCISES.findIndex((e) => e.file === currentFile);
		if (index === -1) return;

		const prev = index > 0 ? EXERCISES[index - 1] : null;
		const next = index < EXERCISES.length - 1 ? EXERCISES[index + 1] : null;

		const prevHTML = prev
			? `<a class="lesson-nav-prev" href="../${prev.file}">← Previous: ${prev.title}</a>`
			: `<span></span>`;
		const positionHTML = `<span class="lesson-nav-position">Exercise ${index + 1} of ${EXERCISES.length}</span>`;
		const nextHTML = next
			? `<a class="lesson-nav-next" href="../${next.file}">Next: ${next.title} →</a>`
			: `<span></span>`;

		this.innerHTML = `<nav class="lesson-nav" aria-label="Exercise navigation">${prevHTML}${positionHTML}${nextHTML}</nav>`;
	}

	disconnectedCallback() {}
}

customElements.define("exercises-nav", ExercisesNav);
