// Light-DOM custom element. Replaces legacy hero blocks like:
//   <center>
//     <p id="top"><img src=".../t-CobolTut.gif" width="173" height="59" /></p>
//     <h1>{TITLE}</h1>
//   </center>
// Light DOM (not shadow DOM) so course.css link colors, image sizing,
// and the .hero centering rule from course-components.css all apply.
//
// The `id="top"` anchor on the wrapper is the scroll target for the
// breadcrumb leaf link (breadcrumbs.js renders the current page as
// <a href="#top">) plus any legacy inline #top anchors.
class PageHero extends HTMLElement {
	connectedCallback() {
		const title = this.getAttribute("title") || "";
		const readingTime = this.getAttribute("reading-time") || "";
		this.innerHTML = `
			<div class="hero" id="top">
				<h1></h1>
				${readingTime ? `<p class="page-hero-reading-time"></p>` : ""}
			</div>
		`;
		this.querySelector("h1").textContent = title;
		if (readingTime) {
			this.querySelector(".page-hero-reading-time").textContent = `~${readingTime} read`;
		}
	}

	disconnectedCallback() {}
}

customElements.define("page-hero", PageHero);
