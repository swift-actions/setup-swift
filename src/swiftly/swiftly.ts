import { addPath, debug, exportVariable, info } from "@actions/core";
import { cmd } from "../core";
import { mkdtempSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

async function swiftly(...args: string[]) {
  return await cmd("swiftly", ...args);
}

function setupPaths() {
  const tmpPath = mkdtempSync(join(tmpdir(), "swiftly-"));

  const homeDir = process.env.SWIFTLY_HOME_DIR || join(tmpPath, "home");
  const binDir = process.env.SWIFTLY_BIN_DIR || join(tmpPath, "bin");

  exportVariable("SWIFTLY_HOME_DIR", homeDir);
  exportVariable("SWIFTLY_BIN_DIR", binDir);

  addPath(binDir);

  debug(`Using Swiftly home dir: ${homeDir}`);
  debug(`Using Swiftly bin dir: ${binDir}`);
}

/**
 * Install Swift using Swiftly
 * @param version Version to install
 */
export async function installSwift(version: string) {
  setupPaths();

  info("Initializing Swiftly");
  await swiftly(
    "init",
    "--skip-install",
    "--quiet-shell-followup",
    "--assume-yes",
    "-–no-modify-profile",
  );

  info(`Installing Swift ${version}`);
  await swiftly("install", "--use", version, "--assume-yes");

  const location = await swiftly("use", "--print-location");
  debug(`Swiftly installed Swift to ${location}`);

  addPath(location);
}
