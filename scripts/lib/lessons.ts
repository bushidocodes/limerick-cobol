export interface TopicLink {
	type: string;
	file: string;
	title: string;
}

export interface LessonManifest {
	topics: { links: TopicLink[] }[];
}

/**
 * Derive the ordered tutorial sequence from `lesson-manifest.json`,
 * deduplicating any file that appears in more than one topic group (first
 * occurrence wins, original order preserved).
 */
export function tutorialSequence(manifest: LessonManifest): TopicLink[] {
	const seen = new Set<string>();
	const sequence: TopicLink[] = [];
	for (const topic of manifest.topics) {
		for (const link of topic.links) {
			if (link.type === "tutorial" && !seen.has(link.file)) {
				seen.add(link.file);
				sequence.push(link);
			}
		}
	}
	return sequence;
}
