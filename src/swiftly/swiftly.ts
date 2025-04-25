import { addPath, debug, exportVariable, info } from "@actions/core";
import { cmd } from "../core";
import { mkdtempSync } from "fs";
import path from "path";


async function swiftly(...args: string[]) {
  return await cmd("swiftly", ...args);
}

function setupPaths() {
  const tmpPath = mkdtempSync(`swiftly`);

  const homeDir = process.env.SWIFTLY_HOME_DIR || path.join(tmpPath, "home") ;
  const binDir = process.env.SWIFTLY_BIN_DIR || path.join(tmpPath, "bin");

  exportVariable('SWIFTLY_HOME_DIR', homeDir);
  exportVariable('SWIFTLY_BIN_DIR', binDir);

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
  );

  info(`Installing Swift ${version}`);
  await swiftly("install", "--use", version, "--assume-yes");

  const location = await swiftly("use", "--print-location");
  debug(`Swiftly installed Swift to ${location}`);

  addPath(location);
}
