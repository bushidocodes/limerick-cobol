// Light-DOM custom element. Renders a trigger button showing the current
// theme's icon; clicking opens a dropdown menu with three rows (OS default,
// Light, Dark) — MDN-style. The choice is persisted to localStorage under the
// key 'lc-theme'.
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

const ICONS = {
	light: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/><line x1="4.93" y1="4.93" x2="7.05" y2="7.05"/><line x1="16.95" y1="16.95" x2="19.07" y2="19.07"/><line x1="4.93" y1="19.07" x2="7.05" y2="16.95"/><line x1="16.95" y1="7.05" x2="19.07" y2="4.93"/></svg>`,
	auto: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18V4c4.41 0 8 3.59 8 8s-3.59 8-8 8z"/></svg>`,
	dark: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
};

const LABELS = {
	auto: "OS default",
	light: "Light",
	dark: "Dark",
};

const ORDER = ["auto", "light", "dark"];

class ThemeToggle extends HTMLElement {
	static #KEY = "lc-theme";
	#abort;
	#current = "auto";

	connectedCallback() {
		this.#abort = new AbortController();
		this.#current = (HAS_STORAGE && localStorage.getItem(ThemeToggle.#KEY)) || "auto";
		this.#render();
	}

	disconnectedCallback() {
		this.#abort?.abort();
	}

	#render() {
		const items = ORDER.map(
			(value) =>
				`<li role="none"><button class="theme-toggle__menuitem" role="menuitemradio" data-theme-value="${value}" aria-checked="${this.#current === value}" type="button" tabindex="-1">${ICONS[value]}<span>${LABELS[value]}</span></button></li>`,
		).join("");
		this.innerHTML = `
			<div class="theme-toggle">
				<button class="theme-toggle__trigger" type="button" aria-haspopup="menu" aria-expanded="false" aria-label="Theme: ${LABELS[this.#current]}">${ICONS[this.#current]}</button>
				<ul class="theme-toggle__menu" role="menu" hidden>${items}</ul>
			</div>
		`;

		const trigger = this.querySelector(".theme-toggle__trigger");
		const menu = this.querySelector(".theme-toggle__menu");
		const items_ = [...this.querySelectorAll(".theme-toggle__menuitem")];

		const { signal } = this.#abort;

		trigger.addEventListener(
			"click",
			(e) => {
				e.stopPropagation();
				if (menu.hidden) this.#open();
				else this.#close();
			},
			{ signal },
		);

		trigger.addEventListener(
			"keydown",
			(e) => {
				if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					this.#open();
				}
			},
			{ signal },
		);

		items_.forEach((btn, idx) => {
			btn.addEventListener(
				"click",
				(e) => {
					e.stopPropagation();
					this.#set(btn.dataset.themeValue);
					this.#close({ focusTrigger: true });
				},
				{ signal },
			);
			btn.addEventListener(
				"keydown",
				(e) => {
					if (e.key === "ArrowDown") {
						e.preventDefault();
						items_[(idx + 1) % items_.length].focus();
					} else if (e.key === "ArrowUp") {
						e.preventDefault();
						items_[(idx - 1 + items_.length) % items_.length].focus();
					} else if (e.key === "Home") {
						e.preventDefault();
						items_[0].focus();
					} else if (e.key === "End") {
						e.preventDefault();
						items_[items_.length - 1].focus();
					} else if (e.key === "Escape") {
						e.preventDefault();
						this.#close({ focusTrigger: true });
					} else if (e.key === "Tab") {
						this.#close();
					}
				},
				{ signal },
			);
		});

		document.addEventListener(
			"click",
			(e) => {
				if (!menu.hidden && !this.contains(e.target)) this.#close();
			},
			{ signal },
		);
	}

	#open() {
		const trigger = this.querySelector(".theme-toggle__trigger");
		const menu = this.querySelector(".theme-toggle__menu");
		menu.hidden = false;
		trigger.setAttribute("aria-expanded", "true");
		const active = this.querySelector(`.theme-toggle__menuitem[data-theme-value="${this.#current}"]`);
		(active || this.querySelector(".theme-toggle__menuitem"))?.focus();
	}

	#close({ focusTrigger = false } = {}) {
		const trigger = this.querySelector(".theme-toggle__trigger");
		const menu = this.querySelector(".theme-toggle__menu");
		if (menu.hidden) return;
		menu.hidden = true;
		trigger.setAttribute("aria-expanded", "false");
		if (focusTrigger) trigger.focus();
	}

	#set(value) {
		this.#current = value;
		if (value === "auto") {
			if (HAS_STORAGE) localStorage.removeItem(ThemeToggle.#KEY);
			document.documentElement.removeAttribute("data-theme");
			const meta = document.querySelector('meta[name="theme-color"]:not([media])');
			if (meta) meta.remove();
		} else {
			if (HAS_STORAGE) localStorage.setItem(ThemeToggle.#KEY, value);
			document.documentElement.setAttribute("data-theme", value);
			const color = value === "dark" ? "#1a1a1a" : "#ffffff";
			let meta = document.querySelector('meta[name="theme-color"]:not([media])');
			if (!meta) {
				meta = document.createElement("meta");
				meta.name = "theme-color";
				document.head.appendChild(meta);
			}
			meta.content = color;
		}
		const trigger = this.querySelector(".theme-toggle__trigger");
		trigger.innerHTML = ICONS[value];
		trigger.setAttribute("aria-label", `Theme: ${LABELS[value]}`);
		this.querySelectorAll(".theme-toggle__menuitem").forEach((btn) => {
			btn.setAttribute("aria-checked", btn.dataset.themeValue === value);
		});
	}
}

customElements.define("theme-toggle", ThemeToggle);
