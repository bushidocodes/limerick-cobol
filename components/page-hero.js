// Light-DOM custom element. Replaces legacy hero blocks like:
//   <center>
//     <p id="top"><img src=".../t-CobolTut.gif" width="173" height="59" /></p>
//     <h1>{TITLE}</h1>
//   </center>
// Light DOM (not shadow DOM) so course.css link colors, image sizing,
// and the .hero centering rule from course-components.css all apply.
//
// The `eyebrow` attribute overrides the default "COBOL Tutorial" label —
// exercise pages pass "COBOL Exercise" (replacing T-CobolExercise.gif) and
// project specs pass "COBOL Project".
class PageHero extends HTMLElement {
	connectedCallback() {
		const title = this.getAttribute("title") || "";
		const eyebrow = this.getAttribute("eyebrow") || "COBOL Tutorial";
		this.innerHTML = `
			<div class="hero">
				<p id="top" class="page-hero-eyebrow"></p>
				<h1></h1>
				<theme-toggle></theme-toggle>
			</div>
		`;
		this.querySelector(".page-hero-eyebrow").textContent = eyebrow;
		this.querySelector("h1").textContent = title;
	}
}

customElements.define("page-hero", PageHero);
