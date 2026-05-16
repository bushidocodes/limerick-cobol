// Custom element <file-io-notice>. Renders a notice explaining that the program
// reads or writes named files and must be compiled and run locally with GnuCOBOL
// rather than in a browser-based sandbox like Compiler Explorer.
//
// Placed inside .code-toolbar on example pages where the COBOL source uses
// SELECT...ASSIGN TO / FD file descriptors (i.e. file I/O programs).

class FileIONotice extends HTMLElement {
	connectedCallback() {
		const p = document.createElement("p");
		p.innerHTML =
			"<strong>Run locally:</strong> This program reads or writes data files and cannot run inside a browser-based sandbox. " +
			'Download the <code>.cbl</code> source above and compile it with ' +
			'<a href="https://gnucobol.sourceforge.io/" target="_blank" rel="noopener">GnuCOBOL</a>.';
		this.appendChild(p);
	}
}

customElements.define("file-io-notice", FileIONotice);
