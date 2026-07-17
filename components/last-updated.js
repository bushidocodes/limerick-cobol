// Light-DOM custom element that previously showed the page's last-modified
// date from sitemap.xml <lastmod> (issue #410).
//
// <lastmod> was removed from the sitemap to stop CI from dirty-committing
// every URL's date on unrelated PRs (shallow clone → mtime fallback). Without
// those dates this element has nothing to show, so it renders nothing.
// The custom element and <last-updated> tags stay so pages do not need a
// mass markup edit; reintroduce dates later via a dedicated data source if
// needed.

class LastUpdated extends HTMLElement {
	connectedCallback() {
		// no-op
	}
}

customElements.define("last-updated", LastUpdated);
