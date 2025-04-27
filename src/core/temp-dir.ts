import { mkdtempSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

/**
 * Crates a new temporary directory
 * @param suffix Suffix to use for the temporary directory
 * @returns Temporary directory
 */
export function tempDir(suffix: string = "swiftly-") {
  return mkdtempSync(join(tmpdir(), suffix));
}
