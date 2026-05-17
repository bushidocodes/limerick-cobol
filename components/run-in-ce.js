// Custom element <run-in-ce>. Renders a "Run on Compiler Explorer" link button
// that opens godbolt.org in a new tab with the example source preloaded into the
// editor and an Executor pane wired up to GnuCOBOL.
//
// The element auto-targets the first <pre><code class="language-cobol"> on the
// page (every example page has exactly one). It encodes a Compiler Explorer
// ClientState payload as base64 and links to /clientstate/<base64>, which is the
// no-shortener form of CE permalinks documented in the Compiler Explorer API.
//
// Optional attribute:
//   extra="foo.cbl bar.cbl"  — space-separated list of additional .cbl files to
//   fetch and concatenate into the CE source. Paths are resolved relative to the
//   current page URL. Use this for multi-file examples where the main source calls
//   external subprograms.
//
//   GnuCOBOL requires an END PROGRAM marker between separate program units in a
//   single source file. buildCEUrl extracts each program's PROGRAM-ID and injects
//   the required END PROGRAM terminators before concatenating the extra files.
//
// Light DOM (no shadow root) so .run-in-ce styles in course-components.css apply.

const COMPILER_ID = "gnucobol32";
const COMPILER_OPTIONS = "-x -free";

class RunInCE extends HTMLElement {
	async connectedCallback() {
		const code = document.querySelector('pre[class*="language-cobol"] code');
		const source = code ? code.textContent : "";
		if (!source.trim()) return;

		const extra = this.getAttribute("extra");
		let files = [];

		if (extra) {
			const filenames = extra.trim().split(/\s+/);
			const results = await Promise.all(
				filenames.map(async (filename) => {
					try {
						const url = new URL(filename, window.location.href);
						const resp = await fetch(url);
						if (!resp.ok) return null;
						const contents = await resp.text();
						const basename = filename.split("/").pop();
						return { filename: basename, contents };
					} catch {
						return null;
					}
				}),
			);
			files = results.filter(Boolean);
		}

		const url = buildCEUrl(source, files);

		const link = document.createElement("a");
		link.className = "run-in-ce";
		link.href = url;
		link.target = "_blank";
		link.rel = "noopener";
		link.textContent = "Run on Compiler Explorer ↗";
		this.appendChild(link);
	}
}

// Extract the PROGRAM-ID name from a COBOL source block.
// Returns the bare program name (stops before IS INITIAL / IS COMMON / etc.).
function extractProgramId(src) {
	const match = src.match(/^\s*PROGRAM-ID\s*\.\s*([\w-]+)/im);
	return match ? match[1] : null;
}

function buildCEUrl(source, files = []) {
	// Concatenate extra subprogram sources after the main source.
	// GnuCOBOL 3.2 requires an END PROGRAM terminator between separate program
	// units in a single file. Inject it after each block (except the last) by
	// reading the PROGRAM-ID from that block. Simpler and more reliable than
	// CE's session `files` array, which only populates editor tabs and never
	// reaches the compiler's input file.
	let combined;
	if (files.length > 0) {
		const parts = [source, ...files.map((f) => f.contents)];
		combined = parts
			.map((src, i) => {
				if (i === parts.length - 1) return src; // last — no terminator needed
				const id = extractProgramId(src);
				return id ? src + "\nEND PROGRAM " + id + ".\n" : src + "\n";
			})
			.join("\n");
	} else {
		combined = source;
	}
	const session = {
		id: 1,
		language: "cobol",
		source: combined,
		compilers: [{ id: COMPILER_ID, options: COMPILER_OPTIONS }],
		executors: [
			{
				compiler: { id: COMPILER_ID, options: COMPILER_OPTIONS, libs: [] },
				stdin: "",
			},
		],
	};
	const state = { sessions: [session] };
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
