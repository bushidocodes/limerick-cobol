// Light-DOM custom element that renders Previous / Next lesson links plus a
// "Lesson X of N" position indicator. Mirrors the style of page-hero.js: no
// shadow DOM so course.css link colours and the .lesson-nav rule from
// course-components.css apply without any extra piercing selectors.
//
// Reads the lesson sequence from window.COBOL_LESSONS, populated by
// lesson-progress.js via a fetch. If the fetch hasn't completed when the
// element connects, waits for the "lc-lessons-ready" event before rendering.

class LessonNav extends HTMLElement {
	connectedCallback() {
		if (window.COBOL_LESSONS) {
			this._render();
		} else {
			window.addEventListener(
				window.LessonProgress?.READY_EVENT ?? "lc-lessons-ready",
				() => {
					if (this.isConnected) this._render();
				},
				{ once: true },
			);
		}
	}

	_render() {
		const LESSONS = window.COBOL_LESSONS;
		if (!LESSONS) return;

		// Determine the current page filename from the URL path.
		const segments = window.location.pathname.split("/");
		const currentFile = segments[segments.length - 1];

		const index = LESSONS.findIndex((l) => l.file === currentFile);
		if (index === -1) {
			// Not a known lesson page — render nothing.
			return;
		}

		const prev = index > 0 ? LESSONS[index - 1] : null;
		const next = index < LESSONS.length - 1 ? LESSONS[index + 1] : null;

		// Build the three slots. Empty spans on the prev/next ends preserve the
		// space-between layout (and keep the position indicator centred) when
		// only one of the two links is present.
		const prevHTML = prev
			? `<a class="lesson-nav-prev" href="${prev.file}">← Previous: ${prev.title}</a>`
			: `<span></span>`;
		const positionHTML = `<span class="lesson-nav-position">Lesson ${index + 1} of ${LESSONS.length}</span>`;
		const nextHTML = next
			? `<a class="lesson-nav-next" href="${next.file}">Next: ${next.title} →</a>`
			: `<span></span>`;

		this.innerHTML = `<nav class="lesson-nav" aria-label="Lesson navigation">${prevHTML}${positionHTML}${nextHTML}</nav>`;
	}

	disconnectedCallback() {}
}

customElements.define("lesson-nav", LessonNav);
