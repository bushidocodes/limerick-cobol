/**
 * Shared helpers for the LearningResource JSON-LD generators
 * (generate-lesson-jsonld.ts for course pages, generate-exercise-jsonld.ts for
 * exercises). Both read title/description/canonical from the page HTML, build a
 * schema.org LearningResource block with identical shape, and inject it after
 * <link rel="icon">. Only the isPartOf parent and learningResourceType differ.
 */

/** Extract <meta name="description" content="..."> value from raw HTML. */
export function extractDescription(html: string): string {
	return html.match(/<meta\s+name="description"\s+content="([^"]+)"/)?.[1] ?? "";
}

/** Extract <link rel="canonical" href="..."> value from raw HTML. */
export function extractCanonical(html: string): string {
	return html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/)?.[1] ?? "";
}

/** The course/exercise authorship, shared by every LearningResource block. */
const COBOL_PROVIDER = {
	"@type": "Person",
	name: "Michael Coughlan",
	affiliation: {
		"@type": "Organization",
		name: "University of Limerick CSIS",
	},
} as const;

export interface LearningResourceFields {
	name: string;
	description: string;
	url: string;
	position: number;
	/** schema.org parent — a Course (lessons) or Collection (exercises). */
	isPartOf: { "@type": string; name: string; url: string };
	/** e.g. "Tutorial" (lessons) or "Exercise" (exercises). */
	learningResourceType: string;
}

/**
 * Build the JSON-LD <script> block string with tab indentation matching the
 * surrounding HTML (two tabs for the tag, three tabs for JSON content). Key
 * order is fixed so the emitted block is byte-stable across both generators.
 */
export function buildLearningResourceBlock(fields: LearningResourceFields): string {
	const ld = {
		"@context": "https://schema.org",
		"@type": "LearningResource",
		name: fields.name,
		description: fields.description,
		url: fields.url,
		position: fields.position,
		isPartOf: fields.isPartOf,
		provider: COBOL_PROVIDER,
		educationalLevel: "beginner",
		inLanguage: "en",
		learningResourceType: fields.learningResourceType,
	};

	// Indent inner JSON with three tabs to match the page style.
	const inner = JSON.stringify(ld, null, "\t")
		.split("\n")
		.map((line, i) => (i === 0 ? line : "\t\t\t" + line))
		.join("\n");

	return `\t\t<script type="application/ld+json">\n\t\t\t${inner}\n\t\t</script>`;
}

/**
 * Remove any existing LearningResource JSON-LD block from the HTML string,
 * then inject the new block immediately after the <link rel="icon"> tag.
 * Idempotent.
 */
export function injectJsonLd(html: string, block: string): string {
	// Strip existing LearningResource block (idempotency).
	html = html.replace(
		/\t\t<script type="application\/ld\+json">\n\t\t\t\{[\s\S]*?"@type": "LearningResource"[\s\S]*?<\/script>\n/g,
		"",
	);

	// Insert after <link rel="icon" ...>.
	return html.replace(/(\t\t<link rel="icon"[^\n]+\n)/, `$1${block}\n`);
}
