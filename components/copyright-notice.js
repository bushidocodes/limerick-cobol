// Light-DOM custom element. Shadow DOM removed (issue #257) so the element
// inherits theme tokens (--color-text, --color-border-soft) and the body
// font from course.css. The .copyright-notice class hooks rules in
// course-components.css.
class CopyrightNotice extends HTMLElement {
	connectedCallback() {
		const type = this.getAttribute("type") || "course";
		this.innerHTML = `
			<hr>
			${this._getContent(type)}
		`;
	}

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
