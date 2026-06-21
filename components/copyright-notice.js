// Light-DOM custom element. Shadow DOM removed (issue #257) so the element
// inherits theme tokens (--color-text, --color-border-soft) and the body
// font from course.css. The .copyright-notice class hooks rules in
// course-components.css.
//
// Also hosts the "Edit this page on GitHub" affordance (issue #402): the
// element renders an <edit-on-github> sibling after its copyright block and
// dynamically loads components/edit-on-github.js if it isn't already on the
// page, so the 73 content pages that already include <copyright-notice> get
// the edit link without per-page <script> additions. COMPONENTS_DIR is
// captured at script-tag execution time so the dynamic import resolves
// correctly from any depth (course/, exercises/Exm-.../, etc.).
const COMPONENTS_DIR = (() => {
	const me = document.currentScript;
	return me?.src ? new URL("./", me.src).href : null;
})();

// Absolute URL so the link resolves from any page depth (course/,
// exercises/Exm-…/, etc.) and on both deployment surfaces (GitHub Pages and
// local dev). The course material was relicensed under MIT after Michael
// Coughlan relinquished copyright — see LICENSE and README.md.
const LICENSE_URL = "https://github.com/bushidocodes/limerick-cobol/blob/master/LICENSE";

function ensureEditOnGithubLoaded() {
	if (customElements.get("edit-on-github")) return;
	if (!COMPONENTS_DIR) return;
	// Match both dynamically-added (data-component) and manually-included
	// <script src="…/edit-on-github.js"> tags to avoid loading the script twice
	// when a page hand-includes it (which re-runs the top-level `const`
	// declarations and throws "REPO_EDIT_URL has already been declared").
	if (document.querySelector('script[data-component="edit-on-github"], script[src$="/edit-on-github.js"]')) return;
	const s = document.createElement("script");
	s.src = COMPONENTS_DIR + "edit-on-github.js";
	s.defer = true;
	s.dataset.component = "edit-on-github";
	document.head.appendChild(s);
}

class CopyrightNotice extends HTMLElement {
	connectedCallback() {
		ensureEditOnGithubLoaded();
		this.innerHTML = `
			<hr>
			${this._getContent()}
		`;
		// Insert after <last-updated> sibling when present so the footer order is:
		// copyright → last updated → help improve this page. Skip if the page
		// already includes its own <edit-on-github> — otherwise example pages
		// (which hand-include both) get the banner rendered twice.
		if (document.querySelector("edit-on-github")) return;
		const anchor = this.nextElementSibling?.tagName === "LAST-UPDATED" ? this.nextElementSibling : this;
		anchor.insertAdjacentElement("afterend", document.createElement("edit-on-github"));
	}

	disconnectedCallback() {}

	_getContent() {
		// Concise footer credit; full licensing/provenance lives in LICENSE and README.md.
		return `
			<p class="left">Originally created by Michael Coughlan, University of Limerick. Licensed under the <a href="${LICENSE_URL}" rel="noopener" target="_blank">MIT License</a>.</p>
		`;
	}
}

customElements.define("copyright-notice", CopyrightNotice);
