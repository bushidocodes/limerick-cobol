// Light-DOM custom element that renders a "Related content" block.
//
// Attributes (all optional):
//   examples="path1.html|Title 1, path2.html|Title 2"
//   exercises="path1.html|Title 1"
//   lectures="path1.html|Title 1"
//
// Each attribute value is a comma-separated list of "path|label" pairs.
// Paths are relative to the HTML file that contains the element.
//
// Renders into Light DOM (no Shadow DOM) so that course.css link colours and
// course-components.css layout classes apply without any extra CSS piercing.

class RelatedContent extends HTMLElement {
	connectedCallback() {
		const groups = [
			{ attr: "lectures", label: "Lecture" },
			{ attr: "examples", label: "Example programs" },
			{ attr: "exercises", label: "Exercises" },
		];

		const sections = groups
			.map(({ attr, label }) => {
				const raw = this.getAttribute(attr) || "";
				if (!raw.trim()) return "";
				const items = this._parseLinks(raw);
				if (!items.length) return "";
				const lis = items
					.map(({ href, title }) => `<li><a href="${href}">${title}</a></li>`)
					.join("\n\t\t\t\t");
				return `
			<div class="related-group">
				<h4 class="related-group-label">${label}</h4>
				<ul class="related-group-list">
					${lis}
				</ul>
			</div>`;
			})
			.filter(Boolean)
			.join("");

		if (!sections) return;

		this.innerHTML = `
		<aside class="related-content" aria-label="Related content">
			<h3 class="related-heading">Related</h3>
			${sections}
		</aside>`;
	}

	/** Parse "path1.html|Label 1, path2.html|Label 2" into [{href, title}]. */
	_parseLinks(raw) {
		return raw
			.split(",")
			.map((entry) => {
				const pipe = entry.indexOf("|");
				if (pipe === -1) return null;
				const href = entry.slice(0, pipe).trim();
				const title = entry.slice(pipe + 1).trim();
				if (!href || !title) return null;
				return { href, title };
			})
			.filter(Boolean);
	}
}

customElements.define("related-content", RelatedContent);
