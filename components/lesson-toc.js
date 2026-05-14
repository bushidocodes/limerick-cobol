// Light-DOM custom element. Replaces the hand-authored `ul.toc` at the top
// of each lesson with an auto-generated equivalent built from the page's
// `.section-header h2[id]` elements. Renders into a <nav> wrapping a
// <ul class="toc"> so existing ul.toc CSS styles apply unchanged.
//
// Opt-in per page: replace the static `<ul class="toc">…</ul>` block with
// `<lesson-toc></lesson-toc>` and load this script with defer. Because the
// script is deferred, connectedCallback fires after the full DOM is parsed so
// the heading query always returns a complete list.
//
// On desktop the element is hidden by CSS when a <page-toc> sidebar is also
// present (the sidebar covers the same role). On mobile/tablet this element
// is the primary in-page navigation.
class LessonToc extends HTMLElement {
	connectedCallback() {
		const headings = Array.from(document.querySelectorAll(".section-header h2[id]"));

		if (headings.length === 0) return;

		const items = headings.map((h) => {
			const a = document.createElement("a");
			a.href = `#${h.id}`;
			a.textContent = h.textContent.trim();
			const li = document.createElement("li");
			li.appendChild(a);
			return li;
		});

		const list = document.createElement("ul");
		list.className = "toc";
		for (const li of items) list.appendChild(li);

		const nav = document.createElement("nav");
		nav.setAttribute("aria-label", "On this page");
		nav.appendChild(list);

		this.appendChild(nav);
	}
}

customElements.define("lesson-toc", LessonToc);
