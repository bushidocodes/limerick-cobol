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

function ensureEditOnGithubLoaded() {
	if (customElements.get("edit-on-github")) return;
	if (!COMPONENTS_DIR) return;
	if (document.querySelector('script[data-component="edit-on-github"]')) return;
	const s = document.createElement("script");
	s.src = COMPONENTS_DIR + "edit-on-github.js";
	s.defer = true;
	s.dataset.component = "edit-on-github";
	document.head.appendChild(s);
}

class CopyrightNotice extends HTMLElement {
	connectedCallback() {
		ensureEditOnGithubLoaded();
		const type = this.getAttribute("type") || "course";
		this.innerHTML = `
			<hr>
			${this._getContent(type)}
			<edit-on-github></edit-on-github>
		`;
	}

	disconnectedCallback() {}

	_getContent(type) {
		switch (type) {
			case "project":
				return `
					<h3>Copyright Notice</h3>
					<p class="left">This COBOL project specification is the copyright property of Michael Coughlan. You have permission to use this material for your own personal use but you may not reproduce it in any published work without written permission from the author.</p>
				`;
			case "examples":
				return `
					<h3>Copyright Notice</h3>
					<p class="left">These programs are the copyright property of Michael Coughlan. You have permission to use these programs for your own personal use but you may not reproduce them in any published work without written permission from the author.</p>
				`;
			case "exercises":
				return `
					<h3>Copyright Notice</h3>
					<p class="left">These COBOL programming exercises, program specifications, and sample programs are the copyright property of Michael Coughlan. You have permission to use these materials for your own personal use but you may not reproduce them in any published work without written permission from the author.</p>
				`;
			default:
				return `
					<h3>Copyright Notice</h3>
					<p class="center">These COBOL course materials are the copyright property of Michael Coughlan.</p>
					<p class="left">All rights reserved. No part of these course materials may be reproduced in any form or by any means - graphic, electronic, mechanical, photocopying, printing, recording, taping or stored in an information storage and retrieval system - without the written permission of the author.</p>
					<p class="center">(c) Michael Coughlan</p>
				`;
		}
	}
}

customElements.define("copyright-notice", CopyrightNotice);
