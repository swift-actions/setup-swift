import * as os from "os";
import * as core from "@actions/core";
import * as toolCache from "@actions/tool-cache";
import * as path from "path";
import { exec } from "@actions/exec";
import { System } from "./os";
import { swiftPackage, Package } from "./swift-versions";

export async function install(version: string, system: System) {
  if (os.platform() !== "win32") {
    core.error("Trying to run windows installer on non-windows os");
    return;
  }

  let swiftPath = toolCache.find(`swift-${system.name}`, version);

  if (swiftPath === null || swiftPath.trim().length == 0) {
    core.debug(`No cached installer found`);

    const swiftPkg = swiftPackage(version, system);
    let { exe, signature } = await download(swiftPkg);

    const exePath = await toolCache.cacheFile(exe, swiftPkg.name, `swift-${system.name}`, version);

    swiftPath = path.join(exePath, swiftPkg.name);
    //await verify(signature, pkg);
  } else {
    core.debug("Cached installer found");
  }

  core.debug("Running installer");

  await exec(`"${swiftPath}"`);

  core.debug("Swift installed");
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
