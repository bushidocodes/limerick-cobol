// Light-DOM custom element. Mounted on course/index.html. Renders a summary
// strip ("X of 25 lessons completed" + Reset button) and decorates every
// matching lesson link in the surrounding course-topics nav with a green ✓
// icon. Without JS, the element renders nothing and the index page works as
// before — progressive enhancement.
//
// Depends on window.LessonProgress + window.COBOL_LESSONS (lesson-progress.js).
//
// Usage:
//   <course-progress></course-progress>

class CourseProgress extends HTMLElement {
	connectedCallback() {
		if (!window.LessonProgress) return;

		this.innerHTML = `
			<aside class="course-progress" aria-label="Course progress">
				<div class="course-progress-summary" aria-live="polite"></div>
				<button class="course-progress-reset" type="button">Reset progress</button>
				<p class="course-progress-note">Progress is stored locally in your browser — nothing is sent to a server.</p>
			</aside>
		`;

		const summary = this.querySelector(".course-progress-summary");
		const reset = this.querySelector(".course-progress-reset");

		const update = () => {
			const count = window.LessonProgress.countComplete();
			const total = window.LessonProgress.total();
			summary.textContent = `${count} of ${total} lessons completed`;
			this.#decorateLinks();
		};

		reset.addEventListener("click", () => {
			if (window.confirm("Reset all lesson progress? This will clear every checkmark.")) {
				window.LessonProgress.clear();
			}
		});

		window.addEventListener(window.LessonProgress.CHANGE_EVENT, update);
		update();
	}

	#decorateLinks() {
		for (const lesson of window.COBOL_LESSONS) {
			// Match anchors by relative href. The index page links to lessons by
			// bare filename (e.g. "COBOLIntro.html"), so a CSS attribute selector
			// is sufficient — no path normalisation needed.
			const links = document.querySelectorAll(`a[href="${lesson.file}"]`);
			const isComplete = window.LessonProgress.isComplete(lesson.id);
			for (const link of links) {
				const next = link.nextElementSibling;
				const existingMark =
					next && next.classList && next.classList.contains("lesson-completed-mark") ? next : null;
				if (isComplete && !existingMark) {
					const mark = document.createElement("span");
					mark.className = "lesson-completed-mark";
					mark.setAttribute("aria-label", "completed");
					mark.textContent = "✓";
					link.after(mark);
				} else if (!isComplete && existingMark) {
					existingMark.remove();
				}
			}
		}
	}
}

customElements.define("course-progress", CourseProgress);
