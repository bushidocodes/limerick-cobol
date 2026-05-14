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
// already defined in course-components.css (Phase 1); the .i-pagetop class
// sizes the SVG icon to roughly the original GIF's 38px height.
class BackToTop extends HTMLElement {
	connectedCallback() {
		this.innerHTML = `
			<div class="back-to-top">
				<p><a href="#top"><span class="i-pagetop" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" width="36" height="36"><rect x="3" y="2" width="30" height="5" rx="2" fill="currentColor"/><polygon points="18,10 30,24 6,24" fill="currentColor"/><rect x="14" y="23" width="8" height="11" fill="currentColor"/></svg></span></a></p>
			</div>
		`;
	}
}

customElements.define("back-to-top", BackToTop);
