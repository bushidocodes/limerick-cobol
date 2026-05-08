// Light-DOM custom element. Replaces the legacy back-to-top block:
//   <p align="center">
//     <a href="#top"><img border="0" height="38" src=".../i-pagetop.gif" width="132" /></a>
//   </p>
// (and the equivalent <div align="center"> form used in .page-footer).
//
// Light DOM (mandatory) so the global a:link/a:visited rules in course.css
// keep applying — shadow DOM would isolate the anchor from those colors and
// break the visited-state contract the surrounding pages rely on. The
// .back-to-top class hooks the centering and 1em vertical-rhythm rules
// already defined in course-components.css (Phase 1).
class BackToTop extends HTMLElement {
	connectedCallback() {
		this.innerHTML = `
			<div class="back-to-top">
				<p><a href="#top"><img src="Resources/pics/i-pagetop.gif" width="132" height="38" alt="Back to top" /></a></p>
			</div>
		`;
	}
}

customElements.define("back-to-top", BackToTop);
