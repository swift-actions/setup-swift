import * as os from "os";
import { exec } from "@actions/exec";
import * as core from "@actions/core";
import * as toolCache from "@actions/tool-cache";

export async function setupKeys() {
  core.debug("Fetching verification keys");
  let path = await toolCache.downloadTool(
    "https://www.swift.org/keys/all-keys.asc"
  );

  // Workaround for https://github.com/swift-actions/setup-swift/issues/591
  if (os.platform() !== "win32") {
    const fileTypeModule = await import("file-type");
    const fileType = await fileTypeModule.fileTypeFromFile(path);

    if (fileType && fileType.mime === "application/gzip") {
      core.info("Server responded with gzipped data, uncompressing");
      await exec(`mv "${path}" "${path}.gz"`);
      await exec(`gunzip "${path}.gz`);
    }
  }

  core.debug("Importing verification keys");
  await exec(`gpg --import "${path}"`);

  core.debug("Refreshing keys");
  await refreshKeys();
}

export async function verify(signaturePath: string, packagePath: string) {
  core.debug("Verifying signature");
  await exec("gpg", ["--verify", signaturePath, packagePath]);
}

export async function refreshKeys() {
  const pool = ["hkp://keyserver.ubuntu.com"];

  for (const server of pool) {
    core.debug(`Refreshing keys from ${server}`);
    // 1st try...
    if (await refreshKeysFromServer(server)) {
      core.debug(`Refresh successful on first attempt`);
      return;
    }

    // 2nd try...
    if (await refreshKeysFromServer(server)) {
      core.debug(`Refresh successful on second attempt`);
      return;
    }
    core.debug(`Refresh failed`);
  }

  throw new Error("Failed to refresh keys from any server in the pool.");
}

function refreshKeysFromServer(server: string): Promise<boolean> {
  return exec(`gpg --keyserver ${server} --refresh-keys Swift`)
    .then((code) => code === 0)
    .catch((error) => {
      core.warning(
        `An error occurred when trying to refresh keys from ${server}: ${error}`
      );
      return false;
    });
}
