/** Escape `&`, `<`, `>` for use in HTML/XML text content. */
export function escapeHtml(s: string): string {
	return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Escape `&`, `<`, `>`, `"` for use inside a double-quoted attribute value. */
export function escapeAttr(s: string): string {
	return escapeHtml(s).replace(/"/g, "&quot;");
}

/** Decode the small set of named/numeric entities the extractors care about. */
export function decodeEntities(s: string): string {
	return s
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&nbsp;/g, " ")
		.replace(/&amp;/g, "&");
}

/** Collapse runs of whitespace to a single space and trim the ends. */
export function collapseWhitespace(s: string): string {
	return s.replace(/\s+/g, " ").trim();
}
