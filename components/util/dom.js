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
