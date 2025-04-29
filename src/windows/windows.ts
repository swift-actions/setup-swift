import { addPath, debug } from "@actions/core";
import { downloadTool } from "@actions/tool-cache";
import { cmd, tempDir } from "../core";
import { machine } from "os";
import { join } from "path";
import { coerce } from "semver";

/**
 * Setup Swift on Windows as theres no support for Swiftly yet.
 */
export async function setupWindows(version: string) {
  throw Error("Windows is not supported yet");
}
