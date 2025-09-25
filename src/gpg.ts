import { exec } from "@actions/exec";
import * as core from "@actions/core";
import * as toolCache from "@actions/tool-cache";

export async function setupKeys() {
  core.debug("Fetching verification keys");
  let path = await toolCache.downloadTool(
    "https://swift.org/keys/all-keys.asc"
  );

  core.debug("Examining verification keys");
  await exec(`file "${path}"`);
  const isPlaintext = await exec(`gunzip --test "${path}"`, undefined, { silent: true, ignoreReturnCode: true });

  core.debug("Importing verification keys");
  await exec('bash', ['-c', `${isPlaintext ? "cat" : "zcat"} "${path}" | gpg --import`]);

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
