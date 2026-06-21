// Resolve the site root URL from a component module's own location.
//
// `import.meta.url` for a component is `<base>/components/<name>.js`, so the
// site root is one directory above components/. Returns an absolute URL ending
// in "/" (e.g. "https://host/limerick-cobol/"), suitable for string-concatenating
// section paths onto, exactly like the value the old per-component
// `computeBaseUrl()` helpers produced by scanning <script src> tags — but
// without the fragile regex or the dependency on the tag still being in the DOM.
export function siteBaseUrl(moduleUrl) {
	return new URL("../", moduleUrl).href;
}
