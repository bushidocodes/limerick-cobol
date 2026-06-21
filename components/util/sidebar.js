import { createEl } from "./dom.js";

// Shared renderer for the three left-rail outline sidebars (course, examples,
// exercises). They produce identical markup — a heading link plus topic groups
// of links, with the current page marked [data-active] / aria-current — and
// differ only in their labels, link targets, and active-page test. Those
// differences are injected via `config`:
//
//   ariaLabel  — nav aria-label
//   homeUrl    — href for the heading link
//   homeLabel  — text for the heading link
//   topics     — [{ label, links: [{ file, title, ... }] }]
//   hrefFor    — (link) => string, the anchor href
//   isActive   — (link) => boolean, whether this link is the current page
//   linkClass  — (link) => string, the <li> class (optional; defaults to
//                "course-sidebar-link")
//
// All three rails reuse the .course-sidebar* class names so one CSS ruleset
// styles them, hence the shared "course-sidebar" markup regardless of section.
export function renderSidebar(host, config) {
	const { ariaLabel, homeUrl, homeLabel, topics, hrefFor, isActive, linkClass } = config;

	const nav = createEl("nav", { class: "course-sidebar", "aria-label": ariaLabel }, [
		createEl("p", { class: "course-sidebar-heading" }, [createEl("a", { href: homeUrl, text: homeLabel })]),
	]);

	const list = createEl("ol", { class: "course-sidebar-topics" });

	for (const topic of topics) {
		const linksUl = createEl("ul", { class: "course-sidebar-links" });
		let topicHasActive = false;

		for (const link of topic.links) {
			const a = createEl("a", { href: hrefFor(link), text: link.title });
			if (isActive(link)) {
				a.setAttribute("data-active", "");
				a.setAttribute("aria-current", "page");
				topicHasActive = true;
			}
			linksUl.appendChild(createEl("li", { class: linkClass ? linkClass(link) : "course-sidebar-link" }, [a]));
		}

		const topicLi = createEl("li", { class: "course-sidebar-topic", "data-active-topic": topicHasActive }, [
			createEl("p", { class: "course-sidebar-topic-label", text: topic.label }),
			linksUl,
		]);
		list.appendChild(topicLi);
	}

	nav.appendChild(list);
	host.appendChild(nav);
}
