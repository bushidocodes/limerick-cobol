/**
 * Shared helpers for the rel=prev/next pagination-link injectors
 * (add-prev-next-links.ts for course lessons, add-exercise-prev-next-links.ts
 * for exercises). Both inject absolute <link rel="prev">/<link rel="next"> tags
 * after <link rel="canonical">, differing only in the sequence source and base
 * URL.
 */

/**
 * Build the prev/next link tag block to inject. Returns only the tags that
 * apply (first item has no prev, last has no next); empty string if neither.
 */
export function buildPrevNextBlock(prevFile: string | null, nextFile: string | null, baseUrl: string): string {
	const lines: string[] = [];
	if (prevFile) lines.push(`\t\t<link rel="prev" href="${baseUrl}${prevFile}" />`);
	if (nextFile) lines.push(`\t\t<link rel="next" href="${baseUrl}${nextFile}" />`);
	return lines.join("\n");
}

/**
 * Remove any existing prev/next link tags, then inject new ones immediately
 * after the <link rel="canonical"> tag. Idempotent. The `[^>]*` spans newlines
 * (it only stops at the tag's own closing `>`), so both single-line and
 * formatter-wrapped multi-line <link> tags are matched.
 */
export function injectPrevNextLinks(
	html: string,
	prevFile: string | null,
	nextFile: string | null,
	baseUrl: string,
): string {
	// Strip existing prev/next tags (idempotency).
	html = html.replace(/\t\t<link[^>]*rel="(?:prev|next)"[^>]*\/>\n/g, "");

	const block = buildPrevNextBlock(prevFile, nextFile, baseUrl);
	if (!block) return html;

	// Insert after the <link rel="canonical" ... /> tag.
	return html.replace(/(\t\t<link[^>]*rel="canonical"[^>]*\/>\n)/, `$1${block}\n`);
}
