// Single source of truth for the COBOL course lesson sequence and the
// learner's per-lesson completion state.
//
// Loaded before lesson-nav.js, lesson-checkbox.js, and course-progress.js so
// each component can rely on window.COBOL_LESSONS and window.LessonProgress
// without depending on each other directly.
//
// The sequence is derived from the ordered tutorial links in
// course/index.html (exercises and SAQ links are intentionally excluded).
// `id` is the .html filename minus the extension and is the value passed as
// the `lesson` attribute of <lesson-checkbox>.

window.COBOL_LESSONS = Object.freeze([
	{ id: "COBOLIntro", file: "COBOLIntro.html", title: "The structure of COBOL programs" },
	{ id: "DataDeclaration", file: "DataDeclaration.html", title: "Declaring data in COBOL" },
	{ id: "COBOLcommands", file: "COBOLcommands.html", title: "Basic Procedure Division commands" },
	{ id: "Selection", file: "Selection.html", title: "Selection in COBOL" },
	{ id: "Iteration", file: "Iteration.html", title: "Iteration in COBOL" },
	{ id: "SequentialFiles1", file: "SequentialFiles1.html", title: "Introduction to Sequential files" },
	{ id: "SequentialFiles2", file: "SequentialFiles2.html", title: "Processing Sequential files" },
	{ id: "EditedPics", file: "EditedPics.html", title: "Edited Pictures" },
	{ id: "Usage", file: "Usage.html", title: "The USAGE clause" },
	{
		id: "SequentialFiles3",
		file: "SequentialFiles3.html",
		title: "COBOL print files and variable-length records",
	},
	{ id: "SortMerge", file: "SortMerge.html", title: "Sorting and Merging" },
	{ id: "Intro2DirectAccess", file: "Intro2DirectAccess.html", title: "Introduction to direct access files" },
	{ id: "RelativeFiles", file: "RelativeFiles.html", title: "Relative Files" },
	{ id: "IndexedFiles", file: "IndexedFiles.html", title: "Indexed Files" },
	{ id: "Tables1", file: "Tables1.html", title: "Using tables" },
	{ id: "Tables2", file: "Tables2.html", title: "Creating tables - syntax and semantics" },
	{ id: "Search", file: "Search.html", title: "Searching tables" },
	{ id: "Subprograms", file: "Subprograms.html", title: "Contained and external sub-programs" },
	{ id: "Copy", file: "Copy.html", title: "The COPY verb" },
	{ id: "Inspect", file: "Inspect.html", title: "Inspect" },
	{ id: "String", file: "String.html", title: "String" },
	{ id: "Unstring", file: "Unstring.html", title: "Unstring" },
	{ id: "RefMod", file: "RefMod.html", title: "Reference modification and Intrinsic Functions" },
	{ id: "ReportWriter", file: "ReportWriter.html", title: "Report Writer by example" },
	{ id: "ReportWriterSS", file: "ReportWriterSS.html", title: "Report Writer syntax and semantics" },
	{ id: "FileStatus", file: "FileStatus.html", title: "File STATUS code reference" },
]);

(function () {
	const KEY_PREFIX = "lc-progress.";
	const CHANGE_EVENT = "lc-progress-change";

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
			let n = 0;
			for (const l of window.COBOL_LESSONS) {
				if (safeGet(key(l.id)) === "true") n++;
			}
			return n;
		},
		total() {
			return window.COBOL_LESSONS.length;
		},
		clear() {
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
})();
