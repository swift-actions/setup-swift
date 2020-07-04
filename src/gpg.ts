import { exec } from "@actions/exec";
import * as core from "@actions/core";
import * as toolCache from "@actions/tool-cache";

export async function setupKeys() {
  core.debug("Fetching verification keys");
  let path = await toolCache.downloadTool(
    "https://swift.org/keys/all-keys.asc"
  );

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
  const pool = [
    "hkp://pool.sks-keyservers.net",
    "ha.pool.sks-keyservers.net",
    "keyserver.ubuntu.com",
    "hkp://keyserver.ubuntu.com",
    "pgp.mit.edu"
  ]

  for (const server of pool) {
    core.debug(`Refreshing keys from ${server}`);
    if (await refreshKeysFromServer(server)) { 
      core.debug(`Refresh successful`);
      return
    }
    core.debug(`Refresh failed`);
  }
  
  throw new Error("Failed to refresh keys from any server in the pool.");
}

function refreshKeysFromServer(server: string): Promise<boolean> {
  return exec(
    `gpg --keyserver ${server} --refresh-keys Swift`
  )
  .then( code => code === 0 )
  .catch(error => {
    core.warning(`An error occurred when trying to refresh keys from ${server}: ${error}`)
    return false
  })
}
