// Custom element <run-in-ce>. Renders a "Run on Compiler Explorer" link button
// that opens godbolt.org in a new tab with the example source preloaded into the
// editor and an Executor pane wired up to GnuCOBOL.
//
// The element auto-targets the first <pre><code class="language-cobol"> on the
// page (every example page has exactly one). It encodes a Compiler Explorer
// ClientState payload as base64 and links to /clientstate/<base64>, which is the
// no-shortener form of CE permalinks documented in the Compiler Explorer API.
//
// Light DOM (no shadow root) so .run-in-ce styles in course-components.css apply.

const COMPILER_ID = "gnucobol32";
const COMPILER_OPTIONS = "-x -free";

class RunInCE extends HTMLElement {
	connectedCallback() {
		const code = document.querySelector('pre[class*="language-cobol"] code');
		const source = code ? code.textContent : "";
		if (!source.trim()) return;

		const url = buildCEUrl(source);

		const link = document.createElement("a");
		link.className = "run-in-ce";
		link.href = url;
		link.target = "_blank";
		link.rel = "noopener";
		link.textContent = "Run on Compiler Explorer ↗";
		this.appendChild(link);
	}
}

function buildCEUrl(source) {
	const state = {
		sessions: [
			{
				id: 1,
				language: "cobol",
				source: source,
				compilers: [{ id: COMPILER_ID, options: COMPILER_OPTIONS }],
				executors: [
					{
						compiler: { id: COMPILER_ID, options: COMPILER_OPTIONS, libs: [] },
						stdin: "",
					},
				],
			},
		],
	};
	// CE's /clientstate/ endpoint accepts base64-encoded JSON. btoa is Latin1-only,
	// so escape any code points above 0x7E to \uXXXX before encoding. The JSON
	// parser on the server side decodes the escapes back. In practice COBOL source
	// is ASCII, so this loop is usually a no-op.
	let json = "";
	for (const c of JSON.stringify(state)) {
		const cp = c.codePointAt(0);
		json += cp > 126 ? "\\u" + cp.toString(16).padStart(4, "0") : c;
	}
	const base64 = btoa(json);
	return "https://godbolt.org/clientstate/" + encodeURIComponent(base64);
}

customElements.define("run-in-ce", RunInCE);
