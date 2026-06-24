import fs from "fs";

/** One entry in the COBOL_EXERCISES sequence (components/exercise-progress.js). */
export interface ExerciseEntry {
	/** Sidebar grouping, e.g. "Simple Exercises" / "Exam Specifications". */
	topic: string;
	/** Path relative to the exercises/ root, e.g. "Exm-SFbyMail/Exm-SFbyMail.html". */
	file: string;
	title: string;
}

/**
 * Evaluate components/exercise-progress.js in a sandbox and return the frozen
 * COBOL_EXERCISES array — the single source of truth that also drives the
 * in-page <exercises-nav> widget. The file assigns `window.COBOL_EXERCISES = ...`,
 * so we pass a stand-in `window` object and read it back out.
 */
export function loadExerciseSequence(progressPath: string): ExerciseEntry[] {
	const code = fs.readFileSync(progressPath, "utf8");
	const win: { COBOL_EXERCISES?: ExerciseEntry[] } = {};
	// eslint-disable-next-line @typescript-eslint/no-implied-eval
	new Function("window", code)(win);
	if (!win.COBOL_EXERCISES) {
		throw new Error(`COBOL_EXERCISES not found in ${progressPath}`);
	}
	return win.COBOL_EXERCISES;
}
