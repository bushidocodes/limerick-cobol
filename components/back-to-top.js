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
// sizes the 🔝 glyph to roughly the original GIF's 38px height.
class BackToTop extends HTMLElement {
	connectedCallback() {
		this.innerHTML = `
			<div class="back-to-top">
				<p><a href="#top"><svg class="i-pagetop" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><line x1="3" y1="3" x2="21" y2="3" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="12" y1="7" x2="12" y2="21" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><polyline points="6,13 12,7 18,13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="visually-hidden">Back to top</span></a></p>
			</div>
		`;
	}

	disconnectedCallback() {}
}

customElements.define("back-to-top", BackToTop);
