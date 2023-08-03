import * as core from "@actions/core";
import { rm } from "fs/promises";

/** Try to clean up the specified path,  */
export async function tryCleanup(path: string, displayName: string) {
  try {
    await rm(path, { force: true, maxRetries: 3, recursive: true });
  } catch (e) {
    core.debug(`Failed to clean up ${displayName}, continuing. Error: ${e}`);
  }
}
