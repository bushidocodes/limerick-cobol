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
		const lightIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/><line x1="4.93" y1="4.93" x2="7.05" y2="7.05"/><line x1="16.95" y1="16.95" x2="19.07" y2="19.07"/><line x1="4.93" y1="19.07" x2="7.05" y2="16.95"/><line x1="16.95" y1="7.05" x2="19.07" y2="4.93"/></svg>`;
		const autoIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18V4c4.41 0 8 3.59 8 8s-3.59 8-8 8z"/></svg>`;
		const darkIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
		const btn = (value, icon, label) =>
			`<button class="theme-toggle__btn${current === value ? " theme-toggle__btn--active" : ""}" data-theme-value="${value}" aria-pressed="${current === value}" aria-label="${label}" type="button">${icon}</button>`;
		this.innerHTML = `
			<div class="theme-toggle" role="group" aria-label="Color theme">
				${btn("light", lightIcon, "Light mode")}${btn("auto", autoIcon, "System (auto)")}${btn("dark", darkIcon, "Dark mode")}
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
			// Remove the override meta, letting media queries apply
			const meta = document.querySelector('meta[name="theme-color"]:not([media])');
			if (meta) meta.remove();
		} else {
			if (HAS_STORAGE) localStorage.setItem(ThemeToggle.#KEY, value);
			document.documentElement.setAttribute("data-theme", value);
			// Update or create the override meta tag
			const color = value === "dark" ? "#1a1a1a" : "#ffffff";
			let meta = document.querySelector('meta[name="theme-color"]:not([media])');
			if (!meta) {
				meta = document.createElement("meta");
				meta.name = "theme-color";
				document.head.appendChild(meta);
			}
			meta.content = color;
		}
		this.querySelectorAll("[data-theme-value]").forEach((btn) => {
			const active = btn.dataset.themeValue === value;
			btn.setAttribute("aria-pressed", active);
			btn.classList.toggle("theme-toggle__btn--active", active);
		});
	}
}

customElements.define("theme-toggle", ThemeToggle);
