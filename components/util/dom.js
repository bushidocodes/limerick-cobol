// Run `fn` once the DOM is ready: synchronously if parsing has already
// finished, otherwise on DOMContentLoaded. Centralizes the readyState guard
// that every auto-injecting component otherwise repeats verbatim.
export function onReady(fn) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", fn, { once: true });
	} else {
		fn();
	}
}

// Terse element builder. `props` keys: `class` → className, `text` →
// textContent, anything else → setAttribute (a `true` value sets a bare
// boolean attribute). `children` may be a single node or an array; falsy
// entries are skipped. Replaces the createElement + className + textContent +
// setAttribute boilerplate the components otherwise repeat.
export function createEl(tag, props = {}, children = []) {
	const el = document.createElement(tag);
	for (const [key, value] of Object.entries(props)) {
		if (value == null || value === false) continue;
		if (key === "class") el.className = value;
		else if (key === "text") el.textContent = value;
		else if (value === true) el.setAttribute(key, "");
		else el.setAttribute(key, value);
	}
	for (const child of Array.isArray(children) ? children : [children]) {
		if (child) el.appendChild(child);
	}
	return el;
}
