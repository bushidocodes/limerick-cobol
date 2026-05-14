// Light-DOM custom element. Renders a subtle "Edit this page on GitHub" footer
// link whose URL is derived from window.location.pathname (issue #402).
//
// Path normalization handles the two deployment surfaces:
//   - GitHub Pages: /limerick-cobol/course/COBOLIntro.html → course/COBOLIntro.html
//   - Local dev:    /course/COBOLIntro.html                → course/COBOLIntro.html
// Directory-style URLs (trailing /) map to that directory's index.html so the
// edit link still points at a real source file.
//
// Light DOM (not shadow DOM) so the .edit-on-github rule in course-components.css
// applies and the inner <a> picks up the same a:link / a:visited colours as the
// rest of the page.
const REPO_EDIT_URL = "https://github.com/bushidocodes/limerick-cobol/edit/master/";
const GH_PAGES_BASE = "/limerick-cobol/";

function computePagePath() {
	let p = window.location.pathname;
	if (p.startsWith(GH_PAGES_BASE)) {
		p = p.slice(GH_PAGES_BASE.length);
	} else if (p.startsWith("/")) {
		p = p.slice(1);
	}
	if (p === "" || p.endsWith("/")) {
		p += "index.html";
	}
	return p;
}

class EditOnGithub extends HTMLElement {
	connectedCallback() {
		const href = REPO_EDIT_URL + computePagePath();
		this.innerHTML = `
			<p class="edit-on-github">
				Found a typo or broken link?
				<a href="${href}" rel="noopener" target="_blank">Edit this page on GitHub</a>.
			</p>
		`;
	}
}

customElements.define("edit-on-github", EditOnGithub);
