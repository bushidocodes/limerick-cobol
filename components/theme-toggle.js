// Light-DOM custom element. Renders a three-button group (Light | Auto | Dark)
// that overrides the OS color-scheme preference and persists the choice to
// localStorage under the key 'lc-theme'.
//
// An inline <script> in each page's <head> reads the same key before first
// paint and sets data-theme on <html>, preventing a flash of wrong theme.
// This component handles the interactive UI only — the initial application is
// already done by the time connectedCallback fires.
function storageAvailable() {
	try {
		const k = "__lc_test__";
		localStorage.setItem(k, k);
		localStorage.removeItem(k);
		return true;
	} catch {
		return false;
	}
}

const HAS_STORAGE = storageAvailable();

class ThemeToggle extends HTMLElement {
	static #KEY = "lc-theme";
	#abort;

	connectedCallback() {
		this.#abort = new AbortController();
		this.#render();
	}

	disconnectedCallback() {
		this.#abort?.abort();
	}

	#render() {
		const current = (HAS_STORAGE && localStorage.getItem(ThemeToggle.#KEY)) || "auto";
		this.innerHTML = `
			<div class="theme-toggle" role="group" aria-label="Color theme">
				<button class="theme-toggle__btn${current === "light" ? " theme-toggle__btn--active" : ""}" data-theme-value="light" aria-pressed="${current === "light"}" type="button">Light</button><button class="theme-toggle__btn${current === "auto" ? " theme-toggle__btn--active" : ""}" data-theme-value="auto" aria-pressed="${current === "auto"}" type="button">Auto</button><button class="theme-toggle__btn${current === "dark" ? " theme-toggle__btn--active" : ""}" data-theme-value="dark" aria-pressed="${current === "dark"}" type="button">Dark</button>
			</div>
		`;
		this.querySelectorAll("[data-theme-value]").forEach((btn) => {
			btn.addEventListener("click", () => this.#set(btn.dataset.themeValue), {
				signal: this.#abort.signal,
			});
		});
	}

	#set(value) {
		if (value === "auto") {
			if (HAS_STORAGE) localStorage.removeItem(ThemeToggle.#KEY);
			document.documentElement.removeAttribute("data-theme");
		} else {
			if (HAS_STORAGE) localStorage.setItem(ThemeToggle.#KEY, value);
			document.documentElement.setAttribute("data-theme", value);
		}
		this.#render();
	}
}

customElements.define("theme-toggle", ThemeToggle);
