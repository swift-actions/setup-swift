import { addPath, debug, exportVariable, info } from "@actions/core";
import { cmd, tempDir } from "../core";
import { existsSync } from "fs";
import { join } from "path";

async function swiftly(...args: string[]) {
  return await cmd("swiftly", ...args);
}

function setupPaths() {
  const tmpPath = tempDir();

  const homeDir = process.env.SWIFTLY_HOME_DIR || join(tmpPath, "home");
  const binDir = process.env.SWIFTLY_BIN_DIR || join(tmpPath, "bin");

  exportVariable("SWIFTLY_HOME_DIR", homeDir);
  exportVariable("SWIFTLY_BIN_DIR", binDir);

  addPath(binDir);

  debug(`Using Swiftly home dir: ${homeDir}`);
  debug(`Using Swiftly bin dir: ${binDir}`);

  return tmpPath;
}

/**
 * Install Swift using Swiftly
 * @param version Version to install
 */
export async function installSwift(version: string) {
  const tmpPath = setupPaths();

  info("Initializing Swiftly");
  await swiftly(
    "init",
    "--skip-install",
    "--quiet-shell-followup",
    "--assume-yes",
    "--no-modify-profile",
  );

  // Sometimes Swiftly needs to perform additional actions after installation
  const postInstallScriptPath = join(tmpPath, "post-install.sh");

  info(`Installing Swift ${version}`);
  await swiftly(
    "install",
    "--use",
    version,
    "--assume-yes",
    "--post-install-file",
    postInstallScriptPath,
  );

  // Run the post-install script if it exists
  if (existsSync(postInstallScriptPath)) {
    info("Running post-install script");
    await cmd("bash", postInstallScriptPath);
  }

  const location = await swiftly("use", "--print-location");
  debug(`Swiftly installed Swift to ${location}`);

  addPath(location);
}
