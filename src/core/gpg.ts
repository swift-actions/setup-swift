import { exec } from "@actions/exec";
import * as core from "@actions/core";

export async function verify(signaturePath: string, packagePath: string) {
  core.debug("Verifying signature");
  await exec("gpg", ["--verify", signaturePath, packagePath]);
}
