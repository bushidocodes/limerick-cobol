// Light-DOM custom element that renders Previous / Next lesson links.
// Mirrors the style of page-hero.js and back-to-top.js: no shadow DOM so
// course.css link colours and the .lesson-nav rule from course-components.css
// apply without any extra piercing selectors.
//
// The lesson sequence below is derived from the ordered tutorial links in
// course/index.html (exercises and SAQ links are intentionally excluded).
const LESSONS = [
	{ file: "Setup.html", title: "Setting up a COBOL development environment" },
	{ file: "COBOLIntro.html", title: "The structure of COBOL programs" },
	{ file: "DataDeclaration.html", title: "Declaring data in COBOL" },
	{ file: "COBOLcommands.html", title: "Basic Procedure Division commands" },
	{ file: "Selection.html", title: "Selection in COBOL" },
	{ file: "Iteration.html", title: "Iteration in COBOL" },
	{ file: "SequentialFiles1.html", title: "Introduction to Sequential files" },
	{ file: "SequentialFiles2.html", title: "Processing Sequential files" },
	{ file: "EditedPics.html", title: "Edited Pictures" },
	{ file: "Usage.html", title: "The USAGE clause" },
	{ file: "SequentialFiles3.html", title: "COBOL print files and variable-length records" },
	{ file: "SortMerge.html", title: "Sorting and Merging" },
	{ file: "Intro2DirectAccess.html", title: "Introduction to direct access files" },
	{ file: "RelativeFiles.html", title: "Relative Files" },
	{ file: "IndexedFiles.html", title: "Indexed Files" },
	{ file: "Tables1.html", title: "Using tables" },
	{ file: "Tables2.html", title: "Creating tables - syntax and semantics" },
	{ file: "Search.html", title: "Searching tables" },
	{ file: "Subprograms.html", title: "Contained and external sub-programs" },
	{ file: "Copy.html", title: "The COPY verb" },
	{ file: "Inspect.html", title: "Inspect" },
	{ file: "String.html", title: "String" },
	{ file: "Unstring.html", title: "Unstring" },
	{ file: "RefMod.html", title: "Reference modification and Intrinsic Functions" },
	{ file: "ReportWriter.html", title: "Report Writer by example" },
	{ file: "ReportWriterSS.html", title: "Report Writer syntax and semantics" },
];

class LessonNav extends HTMLElement {
	connectedCallback() {
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

		// Build the two link slots. An empty span preserves space-between layout
		// when only one link is present.
		const prevHTML = prev
			? `<a class="lesson-nav-prev" href="${prev.file}">← Previous: ${prev.title}</a>`
			: `<span></span>`;
		const nextHTML = next
			? `<a class="lesson-nav-next" href="${next.file}">Next: ${next.title} →</a>`
			: `<span></span>`;

		this.innerHTML = `<nav class="lesson-nav" aria-label="Lesson navigation">${prevHTML}${nextHTML}</nav>`;
	}
}

customElements.define("lesson-nav", LessonNav);
