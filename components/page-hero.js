// Light-DOM custom element. Replaces the legacy hero block:
//   <center>
//     <p id="top"><img src=".../t-CobolTut.gif" width="173" height="59" /></p>
//     <h1>{TITLE}</h1>
//   </center>
// Light DOM (not shadow DOM) so course.css link colors, image sizing,
// and the .hero centering rule from course-components.css all apply.
class PageHero extends HTMLElement {
	connectedCallback() {
		const title = this.getAttribute("title") || "";
		this.innerHTML = `
			<div class="hero">
				<p id="top" class="page-hero-eyebrow">COBOL Tutorial</p>
				<h1></h1>
				<theme-toggle></theme-toggle>
			</div>
		`;
		this.querySelector("h1").textContent = title;
	}
}

customElements.define("page-hero", PageHero);
