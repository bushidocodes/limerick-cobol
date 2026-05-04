class CopyrightNotice extends HTMLElement {
	connectedCallback() {
		const type = this.getAttribute("type") || "course";
		const shadow = this.attachShadow({ mode: "open" });
		shadow.innerHTML = `
			<style>
				:host { display: block; font-family: Times New Roman, Times, serif; font-size: 1em; }
				hr { border: none; border-top: 1px solid #000; margin: 0.75em 0; }
				h3 { text-align: center; margin: 0.5em 0; }
				p { margin: 0.5em 1em; }
				.center { text-align: center; }
				.left { text-align: left; }
			</style>
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
