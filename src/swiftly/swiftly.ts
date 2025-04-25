import { debug, info } from "@actions/core";
import { cmd } from "../core";

async function swiftly(...args: string[]) {
  return await cmd("swiftly", ...args);
}

/**
 * Install Swift using Swiftly
 * @param version Version to install
 */
export async function installSwift(version: string) {
  info("Initializing Swiftly");
  await swiftly(
    "init",
    "--skip-install",
    "--quiet-shell-followup",
    "--assume-yes",
  );

  info(`Installing Swift ${version}`);
  await swiftly("install", "--use", version, "--assume-yes");

  const location = swiftly("use", "--print-location");
  debug(`Swiftly installed Swift to ${location}`);
}
