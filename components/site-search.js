// Light-DOM custom element. Renders a search input that lazily loads
// search-index.json on first interaction, then filters titles + meta
// descriptions client-side with a small hand-rolled scorer.
//
// Light DOM (not Shadow DOM) so the same course.css link colours, focus
// rings, and theme tokens apply without piercing. The .site-search class
// hooks layout rules in course-components.css.
//
// Cmd/Ctrl+K from anywhere on the page focuses the input. The index is
// resolved relative to the document — pass `data-index="../search-index.json"`
// (or whatever the depth requires) so the JSON loads from the repo root.
// Result paths in the index are then resolved relative to that same URL,
// so the resulting links work regardless of the current page's depth.
let instanceCounter = 0;
let globalKeyBound = false;

// Resolve the default index URL once, based on this script's own location.
// Pages reference components via the correct relative path (e.g.
// "../components/site-search.js" or "../../components/site-search.js"), so
// search-index.json sits at "../search-index.json" relative to this file.
const DEFAULT_INDEX_URL = (() => {
	const here = document.currentScript && document.currentScript.src;
	if (!here) return null;
	return new URL("../search-index.json", here);
})();

class SiteSearch extends HTMLElement {
	static #MIN_QUERY = 2;
	static #MAX_RESULTS = 12;
	static #SECTION_LABEL = {
		course: "Course",
		exercises: "Exercises",
		examples: "Examples",
		lectures: "Lectures",
	};

	#index = null;
	#loadPromise = null;
	#indexUrl = null;
	#input = null;
	#results = null;
	#status = null;
	#pointer = -1;
	#listboxId = "";

	static #SHORT_MQL = window.matchMedia("(max-width: 360px)");
	static #FULL_PLACEHOLDER = "Search lessons, exercises, examples… (Ctrl+K)";
	static #SHORT_PLACEHOLDER = "Search…";

	connectedCallback() {
		const uid = ++instanceCounter;
		this.#listboxId = `site-search-results-${uid}`;
		const inputId = `site-search-input-${uid}`;
		this.innerHTML = `
			<div class="site-search">
				<label class="site-search__label" for="${inputId}">Search the site</label>
				<input
					id="${inputId}"
					class="site-search__input"
					type="search"
					autocomplete="off"
					autocapitalize="off"
					spellcheck="false"
					role="combobox"
					aria-autocomplete="list"
					aria-controls="${this.#listboxId}"
					aria-expanded="false"
				/>
				<div
					id="${this.#listboxId}"
					class="site-search__results"
					role="listbox"
					hidden
				></div>
				<div class="site-search__status visually-hidden" aria-live="polite" aria-atomic="true"></div>
			</div>
		`;
		this.#input = this.querySelector(".site-search__input");
		this.#results = this.querySelector(".site-search__results");
		this.#status = this.querySelector(".site-search__status");

		const updatePlaceholder = () => {
			this.#input.placeholder = SiteSearch.#SHORT_MQL.matches
				? SiteSearch.#SHORT_PLACEHOLDER
				: SiteSearch.#FULL_PLACEHOLDER;
		};
		updatePlaceholder();
		SiteSearch.#SHORT_MQL.addEventListener("change", updatePlaceholder);

		this.#input.addEventListener("focus", () => this.#ensureLoaded());
		this.#input.addEventListener("input", () => this.#render());
		this.#input.addEventListener("keydown", (e) => this.#onInputKeydown(e));
		this.#input.addEventListener("blur", () => {
			// Allow click on a result to fire before closing.
			window.setTimeout(() => {
				if (!this.contains(document.activeElement)) this.#close();
			}, 120);
		});

		// Avoid double-binding when the element is placed more than once.
		if (!globalKeyBound) {
			document.addEventListener("keydown", SiteSearch.#onGlobalKeydown);
			globalKeyBound = true;
		}
	}

	/** Focus the first site-search input on the page. Used by Cmd/Ctrl+K. */
	static #onGlobalKeydown(e) {
		const isModK = (e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === "k";
		if (!isModK) return;
		const first = document.querySelector("site-search input.site-search__input");
		if (!first) return;
		e.preventDefault();
		first.focus();
		first.select();
	}

	async #ensureLoaded() {
		if (this.#index) return;
		if (!this.#loadPromise) {
			const override = this.getAttribute("data-index");
			this.#indexUrl = override
				? new URL(override, document.baseURI)
				: DEFAULT_INDEX_URL || new URL("search-index.json", document.baseURI);
			this.#loadPromise = fetch(this.#indexUrl)
				.then((r) => {
					if (!r.ok) throw new Error(`HTTP ${r.status}`);
					return r.json();
				})
				.then((data) => {
					this.#index = Array.isArray(data) ? data : [];
				})
				.catch((err) => {
					console.warn("site-search: failed to load index", err);
					this.#index = [];
				});
		}
		return this.#loadPromise;
	}

	async #render() {
		await this.#ensureLoaded();
		const q = this.#input.value.trim();
		if (q.length < SiteSearch.#MIN_QUERY) {
			this.#close();
			return;
		}
		const results = this.#search(q).slice(0, SiteSearch.#MAX_RESULTS);
		this.#renderResults(results);
	}

	#search(q) {
		const lower = q.toLowerCase();
		const terms = lower.split(/\s+/).filter(Boolean);
		const scored = [];
		for (const entry of this.#index) {
			const title = (entry.t || "").toLowerCase();
			const desc = (entry.d || "").toLowerCase();
			const section = (entry.s || "").toLowerCase();
			const haystack = `${title}\n${desc}\n${section}`;
			if (!terms.every((t) => haystack.includes(t))) continue;

			let score = 0;
			if (title.includes(lower)) score += 100;
			if (title.startsWith(lower)) score += 50;
			if (desc.includes(lower)) score += 25;
			for (const term of terms) {
				if (title.includes(term)) score += 20;
				if (desc.includes(term)) score += 5;
				if (section.includes(term)) score += 3;
			}
			scored.push({ entry, score });
		}
		scored.sort((a, b) => b.score - a.score || a.entry.t.localeCompare(b.entry.t));
		return scored.map((s) => s.entry);
	}

	#renderResults(results) {
		if (!results.length) {
			this.#results.innerHTML = `<p class="site-search__empty" role="status">No matches.</p>`;
			this.#results.hidden = false;
			this.#input.setAttribute("aria-expanded", "true");
			this.#status.textContent = "No matches.";
			this.#pointer = -1;
			return;
		}
		const indexUrl = this.#indexUrl;
		const optionId = (i) => `${this.#listboxId}-opt-${i}`;
		this.#results.innerHTML = results
			.map((r, i) => {
				const href = new URL(r.p, indexUrl).href;
				const desc = r.d ? `<span class="site-search__result-desc">${esc(r.d)}</span>` : "";
				const section = SiteSearch.#SECTION_LABEL[r.s] || r.s || "";
				return `<a
					class="site-search__result"
					id="${optionId(i)}"
					href="${esc(href)}"
					role="option"
					aria-selected="false"
				><span class="site-search__result-row">
					<span class="site-search__result-title">${esc(r.t)}</span>
					<span class="site-search__result-section">${esc(section)}</span>
				</span>${desc}</a>`;
			})
			.join("");
		this.#results.hidden = false;
		this.#input.setAttribute("aria-expanded", "true");
		this.#status.textContent = `${results.length} ${results.length === 1 ? "result" : "results"}.`;
		this.#pointer = -1;
		this.#input.removeAttribute("aria-activedescendant");

		// Clicks should close the dropdown so the navigation feels final.
		this.#results.querySelectorAll(".site-search__result").forEach((el) => {
			el.addEventListener("mousedown", (e) => {
				// Let the link's default navigate proceed; preventDefault on
				// mousedown only stops focus from moving (which would close
				// the dropdown). The browser still handles the click.
				e.preventDefault();
			});
			el.addEventListener("click", () => this.#close());
		});
	}

	#onInputKeydown(e) {
		switch (e.key) {
			case "ArrowDown":
				e.preventDefault();
				this.#move(1);
				break;
			case "ArrowUp":
				e.preventDefault();
				this.#move(-1);
				break;
			case "Home":
				if (!this.#results.hidden) {
					e.preventDefault();
					this.#setPointer(0);
				}
				break;
			case "End":
				if (!this.#results.hidden) {
					e.preventDefault();
					const items = this.#items();
					if (items.length) this.#setPointer(items.length - 1);
				}
				break;
			case "Enter": {
				const items = this.#items();
				if (this.#pointer >= 0 && items[this.#pointer]) {
					e.preventDefault();
					items[this.#pointer].click();
				}
				break;
			}
			case "Escape":
				if (!this.#results.hidden) {
					e.preventDefault();
					this.#close();
				} else if (this.#input.value) {
					e.preventDefault();
					this.#input.value = "";
				} else {
					this.#input.blur();
				}
				break;
		}
	}

	#items() {
		return this.#results.querySelectorAll(".site-search__result");
	}

	#move(delta) {
		const items = this.#items();
		if (!items.length) return;
		let next = this.#pointer + delta;
		if (next < 0) next = items.length - 1;
		else if (next >= items.length) next = 0;
		this.#setPointer(next);
	}

	#setPointer(idx) {
		const items = this.#items();
		this.#pointer = idx;
		items.forEach((el, i) => {
			const active = i === idx;
			el.classList.toggle("site-search__result--active", active);
			el.setAttribute("aria-selected", active ? "true" : "false");
		});
		const current = items[idx];
		if (current) {
			this.#input.setAttribute("aria-activedescendant", current.id);
			current.scrollIntoView({ block: "nearest" });
		} else {
			this.#input.removeAttribute("aria-activedescendant");
		}
	}

	#close() {
		this.#results.hidden = true;
		this.#results.innerHTML = "";
		this.#input.setAttribute("aria-expanded", "false");
		this.#input.removeAttribute("aria-activedescendant");
		this.#pointer = -1;
		this.#status.textContent = "";
	}
}

function esc(s) {
	return String(s).replace(/[&<>"']/g, (c) => {
		switch (c) {
			case "&":
				return "&amp;";
			case "<":
				return "&lt;";
			case ">":
				return "&gt;";
			case '"':
				return "&quot;";
			case "'":
				return "&#39;";
		}
		return c;
	});
}

customElements.define("site-search", SiteSearch);
