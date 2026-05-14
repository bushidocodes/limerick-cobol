// Light-DOM custom element. Renders a sticky in-page table of contents for
// long course pages. Walks the page's `.section-header h2[id]` (and h3[id])
// elements, builds an ordered list of links, and tracks the section
// currently in view via IntersectionObserver to give the active link a
// `[data-active]` attribute. Light DOM so course.css link colours and the
// `.page-toc` rules in course-components.css all apply.
//
// Opt-in per page: drop `<page-toc></page-toc>` as a child of `.page-wrapper`
// on lessons long enough to benefit from a sidebar. Pages without the tag
// are unaffected. Below ~1100px the element is `display: none` (CSS) so
// mobile/tablet readers keep the existing top-of-page `ul.toc`.
class PageToc extends HTMLElement {
	connectedCallback() {
		const headings = Array.from(document.querySelectorAll(".section-header h2[id], .section-header h3[id]"));

		if (headings.length === 0) {
			// Nothing to link to — leave the element empty so CSS layout
			// rules that depend on `:has(page-toc)` still apply if needed,
			// but no visible chrome appears.
			return;
		}

		const items = headings.map((h) => {
			const level = h.tagName.toLowerCase();
			const link = document.createElement("a");
			link.href = `#${h.id}`;
			link.textContent = h.textContent.trim();
			link.dataset.tocTarget = h.id;
			const li = document.createElement("li");
			li.className = `page-toc-${level}`;
			li.appendChild(link);
			return li;
		});

		const list = document.createElement("ol");
		list.className = "page-toc-list";
		for (const li of items) list.appendChild(li);

		const heading = document.createElement("p");
		heading.className = "page-toc-heading";
		heading.textContent = "On this page";

		const nav = document.createElement("nav");
		nav.className = "page-toc";
		nav.setAttribute("aria-label", "On this page");
		nav.appendChild(heading);
		nav.appendChild(list);

		this.appendChild(nav);

		const links = new Map();
		for (const a of this.querySelectorAll("a[data-toc-target]")) {
			links.set(a.dataset.tocTarget, a);
		}

		const setActive = (id) => {
			for (const l of links.values()) {
				l.removeAttribute("data-active");
				l.removeAttribute("aria-current");
			}
			const link = links.get(id);
			if (link) {
				link.setAttribute("data-active", "");
				link.setAttribute("aria-current", "location");
			}
		};

		// A heading counts as "active" once it enters the top 30% of the
		// viewport. `rootMargin: 0 0 -70% 0` shrinks the observer's bottom
		// edge so only headings near the top of the viewport are reported
		// as intersecting — biasing the highlight toward the section the
		// reader is currently inside rather than the next one entering.
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						setActive(entry.target.id);
					}
				}
			},
			{ rootMargin: "0px 0px -70% 0px" },
		);

		for (const h of headings) {
			observer.observe(h);
		}
	}
}

customElements.define("page-toc", PageToc);
