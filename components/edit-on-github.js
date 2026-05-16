// Light-DOM custom element. Renders MDN's "Help improve this page" footer
// block (issue #402): a bordered panel offering two contribution paths —
// directly editing the file on GitHub, or opening an issue with the page
// path pre-filled. Both URLs are derived from window.location.pathname.
//
// Path normalization handles the two deployment surfaces:
//   - GitHub Pages: /limerick-cobol/course/COBOLIntro.html → course/COBOLIntro.html
//   - Local dev:    /course/COBOLIntro.html                → course/COBOLIntro.html
// Directory-style URLs (trailing /) map to that directory's index.html so the
// edit link still points at a real source file.
//
// Light DOM (not shadow DOM) so the .edit-on-github rule in course-components.css
// applies and the inner <a>s pick up the same link colours as the rest of
// the page.
const REPO_EDIT_URL = "https://github.com/bushidocodes/limerick-cobol/edit/master/";
const REPO_ISSUES_URL = "https://github.com/bushidocodes/limerick-cobol/issues/new";
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
		const pagePath = computePagePath();
		const editHref = REPO_EDIT_URL + pagePath;
		const issueParams = new URLSearchParams({
			title: `Issue on ${pagePath}`,
			body: `Found a problem with [${pagePath}](https://bushidocodes.github.io/limerick-cobol/${pagePath}):\n\n_describe the issue_\n`,
		});
		const issueHref = `${REPO_ISSUES_URL}?${issueParams}`;
		this.innerHTML = `
			<div class="edit-on-github">
				<p class="edit-on-github-heading">Help improve this page</p>
				<ul class="edit-on-github-links">
					<li><a href="${editHref}" rel="noopener" target="_blank">Edit on GitHub</a></li>
					<li><a href="${issueHref}" rel="noopener" target="_blank">Report a problem</a></li>
				</ul>
			</div>
		`;
	}
}

customElements.define("edit-on-github", EditOnGithub);
