// Light-DOM custom element. Renders a "Mark this lesson complete" checkbox at
// the bottom of each course tutorial, persisting state to localStorage via
// window.LessonProgress (defined in lesson-progress.js, which must be loaded
// first via a <script> tag earlier in the page).
//
// Usage:
//   <lesson-checkbox lesson="COBOLIntro"></lesson-checkbox>
//
// The `lesson` attribute matches the LESSON `id` field in lesson-progress.js
// (the .html filename minus the extension).
//
// Light DOM keeps the checkbox label inheriting course.css typography. The
// surrounding panel and the meta line use .lesson-checkbox-* hooks defined
// in course-components.css.

class LessonCheckbox extends HTMLElement {
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
		const lessonId = this.getAttribute("lesson");
		if (!lessonId || !window.LessonProgress) {
			return;
		}

		const total = window.LessonProgress.total();
		const lessonIndex = window.COBOL_LESSONS.findIndex((l) => l.id === lessonId);
		const positionLabel = lessonIndex >= 0 ? `Lesson ${lessonIndex + 1} of ${total}` : "";

		this.innerHTML = `
			<div class="lesson-checkbox">
				<label class="lesson-checkbox-label">
					<input type="checkbox" class="lesson-checkbox-input" />
					<span class="lesson-checkbox-text">Mark this lesson complete</span>
				</label>
				<div class="lesson-checkbox-meta">
					<span class="lesson-checkbox-position">${positionLabel}</span>
					<span class="lesson-checkbox-count" aria-live="polite"></span>
				</div>
				<p class="lesson-checkbox-note">Progress is stored locally in your browser — nothing is sent to a server.</p>
			</div>
		`;

		const input = this.querySelector(".lesson-checkbox-input");
		const countSpan = this.querySelector(".lesson-checkbox-count");

		const refreshChecked = () => {
			input.checked = window.LessonProgress.isComplete(lessonId);
		};
		const refreshCount = () => {
			countSpan.textContent = `${window.LessonProgress.countComplete()} completed`;
		};

		input.addEventListener("change", () => {
			window.LessonProgress.setComplete(lessonId, input.checked);
		});

		window.addEventListener(window.LessonProgress.CHANGE_EVENT, () => {
			refreshChecked();
			refreshCount();
		});

		refreshChecked();
		refreshCount();
	}
}

customElements.define("lesson-checkbox", LessonCheckbox);
