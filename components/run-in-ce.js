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
//   single source file. buildCEState extracts each program's PROGRAM-ID and injects
//   the required END PROGRAM terminators before concatenating the extra files.
//
// The /clientstate/ form embeds the whole source in the GET URL. CloudFront (which
// fronts godbolt.org) rejects URLs longer than ~8KB with a 414, which breaks the
// larger multi-file examples. When the URL exceeds the safe length, the click is
// intercepted and the state is POSTed to CE's shortener API, opening a short /z/
// link instead.
//
// Light DOM (no shadow root) so .run-in-ce styles in course-components.css apply.

const COMPILER_ID = "gnucobol32";
const COMPILER_OPTIONS = "-x -free";
// CloudFront's max request URL length is ~8KB. Stay clear of it with a margin.
const SAFE_URL_LENGTH = 8000;

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

		const state = buildCEState(source, files);
		const longUrl = ceClientStateUrl(state);

		const link = document.createElement("a");
		link.className = "run-in-ce";
		link.href = longUrl;
		link.target = "_blank";
		link.rel = "noopener";
		link.textContent = "Run on Compiler Explorer ↗";

		// Small payloads use the plain link directly — no network call, works offline.
		// Oversized payloads would 414, so swap in a shortened /z/ link on click.
		if (longUrl.length > SAFE_URL_LENGTH) {
			link.addEventListener("click", (event) => {
				event.preventDefault();
				// Open the tab synchronously inside the user gesture so it isn't
				// blocked, then redirect it once the short link resolves.
				const tab = window.open("about:blank", "_blank");
				if (tab) tab.opener = null;
				shortenCEState(state)
					.then((shortUrl) => {
						if (tab) tab.location = shortUrl;
					})
					.catch(() => {
						// Best effort: the long URL will likely 414, but it's all we have.
						if (tab) tab.location = longUrl;
					});
			});
		}

		this.appendChild(link);
	}
}

// POST a ClientState to CE's shortener and resolve to the short /z/ URL.
function shortenCEState(state) {
	return fetch("https://godbolt.org/api/shortener", {
		method: "POST",
		headers: { "Content-Type": "application/json", Accept: "application/json" },
		body: JSON.stringify(state),
	})
		.then((resp) => {
			if (!resp.ok) throw new Error("shortener returned " + resp.status);
			return resp.json();
		})
		.then((json) => json.url);
}

// Extract the PROGRAM-ID name from a COBOL source block.
// Returns the bare program name (stops before IS INITIAL / IS COMMON / etc.).
function extractProgramId(src) {
	const match = src.match(/^\s*PROGRAM-ID\s*\.\s*([\w-]+)/im);
	return match ? match[1] : null;
}

// True when a source block already closes with its own END PROGRAM statement.
// Multi-program .cbl files (e.g. DayDiffDriver) carry their own terminators, so
// injecting another would leave a dangling END PROGRAM.
function endsWithEndProgram(src) {
	return /END\s+PROGRAM\s+[\w-]+\s*\.\s*$/i.test(src);
}

// Build the CE ClientState ({ sessions: [...] }) for a main source plus optional
// extra subprogram sources.
//
// GnuCOBOL 3.2 requires an END PROGRAM terminator between separate program units
// in a single file. Inject it after each block (except the last) by reading the
// PROGRAM-ID from that block — unless the block already ends with its own END
// PROGRAM. Concatenation is simpler and more reliable than CE's session `files`
// array, which only populates editor tabs and never reaches the compiler.
function buildCEState(source, files = []) {
	let combined;
	if (files.length > 0) {
		const parts = [source, ...files.map((f) => f.contents)];
		combined = parts
			.map((src, i) => {
				if (i === parts.length - 1) return src; // last — no terminator needed
				if (endsWithEndProgram(src)) return src; // already terminated
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
	return { sessions: [session] };
}

// Encode a ClientState as the no-shortener /clientstate/<base64> permalink URL.
function ceClientStateUrl(state) {
	// btoa is Latin1-only, so escape any code points above 0x7E to \uXXXX before
	// encoding. The JSON parser on the server side decodes the escapes back. In
	// practice COBOL source is ASCII, so this loop is usually a no-op.
	let json = "";
	for (const c of JSON.stringify(state)) {
		const cp = c.codePointAt(0);
		json += cp > 126 ? "\\u" + cp.toString(16).padStart(4, "0") : c;
	}
	const base64 = btoa(json);
	return "https://godbolt.org/clientstate/" + encodeURIComponent(base64);
}

customElements.define("run-in-ce", RunInCE);
