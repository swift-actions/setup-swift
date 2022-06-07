import * as os from "os";
import * as fs from "fs";
import * as core from "@actions/core";
import * as toolCache from "@actions/tool-cache";
import * as path from "path";
import { ExecOptions, exec } from "@actions/exec";
import { System } from "./os";
import { swiftPackage, Package } from "./swift-versions";
import { setupKeys, verify } from "./gpg";
import { setupVsTools } from "./visual-studio";

export async function install(version: string, system: System) {
  if (os.platform() !== "win32") {
    core.error("Trying to run windows installer on non-windows os");
    return;
  }

  const swiftPkg = swiftPackage(version, system);
  let swiftPath = toolCache.find(`swift-${system.name}`, version);

  if (swiftPath === null || swiftPath.trim().length == 0) {
    core.debug(`No cached installer found`);

    await setupKeys();

    let { exe, signature } = await download(swiftPkg);
    await verify(signature, exe);

    const exePath = await toolCache.cacheFile(
      exe,
      swiftPkg.name,
      `swift-${system.name}`,
      version
    );

    swiftPath = path.join(exePath, swiftPkg.name);
  } else {
    core.debug("Cached installer found");
  }

  core.debug("Running installer");

  const options: ExecOptions = {};
  options.listeners = {
    stdout: (data: Buffer) => {
      core.info(data.toString());
    },
    stderr: (data: Buffer) => {
      core.error(data.toString());
    },
  };
  let code = await exec(`"${swiftPath}" -q`, []);
  const systemDrive = process.env.SystemDrive ?? "C:";
  const swiftLibPath = path.join(systemDrive, "Library");
  const swiftInstallPath = path.join(
    swiftLibPath,
    "Developer",
    "Toolchains",
    "unknown-Asserts-development.xctoolchain",
    "usr\\bin"
  );

  if (code != 0 || !fs.existsSync(swiftInstallPath)) {
    core.setFailed(`Swift installer failed with exit code: ${code}`);
    return;
  }

  core.addPath(swiftInstallPath);

  const additionalPaths = [
    path.join(swiftLibPath, "Swift-development\\bin"),
    path.join(swiftLibPath, "icu-67\\usr\\bin"),
  ];
  additionalPaths.forEach((value, index, array) => core.addPath(value));

  core.debug(`Swift installed at "${swiftInstallPath}"`);
  await setupVsTools(swiftPkg);
}

async function download({ url, name }: Package) {
  core.debug("Downloading Swift for windows");

  let [exe, signature] = await Promise.all([
    toolCache.downloadTool(url),
    toolCache.downloadTool(`${url}.sig`),
  ]);

  core.debug("Swift download complete");
  return { exe, signature, name };
}
