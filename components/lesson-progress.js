// Single source of truth for the COBOL course lesson sequence and the
// learner's per-lesson completion state.
//
// Fetches course/lesson-manifest.json to derive window.COBOL_LESSONS (tutorials
// only, deduplicated, in order), then dispatches "lc-lessons-ready" on window.
// Components should either check window.COBOL_LESSONS synchronously or listen
// for that event before rendering lesson-dependent UI.
//
// window.LessonProgress is available synchronously; countComplete() and total()
// return 0 until the manifest fetch resolves.

(function () {
	const KEY_PREFIX = "lc-progress.";
	const CHANGE_EVENT = "lc-progress-change";
	const READY_EVENT = "lc-lessons-ready";

	function key(lesson) {
		return KEY_PREFIX + lesson;
	}

	function safeGet(k) {
		try {
			return localStorage.getItem(k);
		} catch (_e) {
			return null;
		}
	}

	function safeSet(k, value) {
		try {
			localStorage.setItem(k, value);
		} catch (_e) {
			/* private mode / quota — best-effort only */
		}
	}

	function safeRemove(k) {
		try {
			localStorage.removeItem(k);
		} catch (_e) {
			/* private mode — best-effort only */
		}
	}

	function emit(detail) {
		window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail }));
	}

	window.LessonProgress = {
		KEY_PREFIX,
		CHANGE_EVENT,
		READY_EVENT,
		isComplete(lesson) {
			return safeGet(key(lesson)) === "true";
		},
		setComplete(lesson, complete) {
			if (complete) {
				safeSet(key(lesson), "true");
			} else {
				safeRemove(key(lesson));
			}
			emit({ lesson, complete: !!complete });
		},
		countComplete() {
			if (!window.COBOL_LESSONS) return 0;
			let n = 0;
			for (const l of window.COBOL_LESSONS) {
				if (safeGet(key(l.id)) === "true") n++;
			}
			return n;
		},
		total() {
			return window.COBOL_LESSONS ? window.COBOL_LESSONS.length : 0;
		},
		clear() {
			if (!window.COBOL_LESSONS) return;
			for (const l of window.COBOL_LESSONS) {
				safeRemove(key(l.id));
			}
			emit({ reset: true });
		},
	};

	// Mirror cross-tab changes onto the same in-page event so listeners only
	// need to subscribe to one channel.
	window.addEventListener("storage", (e) => {
		if (e.key && e.key.indexOf(KEY_PREFIX) === 0) {
			const lesson = e.key.slice(KEY_PREFIX.length);
			emit({ lesson, complete: e.newValue === "true" });
		}
	});

	// Fetch the manifest, derive the ordered tutorial sequence (deduplicating
	// any file that appears in multiple topic groups), then signal readiness.
	fetch("lesson-manifest.json")
		.then((r) => r.json())
		.then((manifest) => {
			const seen = new Set();
			const lessons = [];
			for (const topic of manifest.topics) {
				for (const link of topic.links) {
					if (link.type === "tutorial" && !seen.has(link.file)) {
						seen.add(link.file);
						lessons.push({ id: link.id, file: link.file, title: link.title });
					}
				}
			}
			window.COBOL_LESSONS = Object.freeze(lessons);
			window.dispatchEvent(new CustomEvent(READY_EVENT));
		})
		.catch(() => {
			// Fail silently — components guard against missing COBOL_LESSONS.
		});
})();
