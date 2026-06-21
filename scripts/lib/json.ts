import fs from "fs";

/** Read and parse a UTF-8 JSON file. */
export function readJson<T>(file: string): T {
	return JSON.parse(fs.readFileSync(file, "utf8")) as T;
}
